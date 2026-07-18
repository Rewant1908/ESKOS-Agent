import os
import json
import threading
import time
from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

import metadata_registry
from models import DocumentMetadata, KnowledgeChunk, EntityNode, QueryPayload
from entity_extractor import extract_entities
from chunker import chunk_document
from embeddings import get_embedding
from graph.knowledge_graph import Neo4jKG
from rag.rag_manager import QdrantRAG

KAFKA_BROKERS = os.environ.get("KAFKA_BROKERS", "localhost:9092")
CONSUMER_TOPIC = "knowledge-fabric-ingest"

app = FastAPI(
    title="ESKOS Enterprise Knowledge Fabric Service",
    description="Manages semantic chunking, entity extraction, relational metadata, vector store, and graph indexing.",
    version="1.0.0"
)

# Connect to graph database and vector store
kg = Neo4jKG()
rag = QdrantRAG()

@app.on_event("startup")
def startup_event():
    metadata_registry.init_db()
    kg.init_constraints()
    # Start the Kafka consumer background listener
    threading.Thread(target=start_kafka_listener, daemon=True).start()

@app.get("/healthz")
def healthz():
    return {"status": "ok", "graph_connected": kg.driver is not None, "vector_connected": rag.client is not None}

@app.post("/api/v1/knowledge/store")
def store_knowledge_payload(payload: Dict[str, Any]):
    """
    Core ingestion endpoint. Triggers chunking, entity extraction,
    and updates metadata, graph database, and vector databases.
    """
    doc_id = payload.get("doc_id")
    org_id = payload.get("org_id")
    text = payload.get("extracted_text")
    doc_type = payload.get("document_type", "unknown")
    source_cat = payload.get("source_category", "unknown")
    trust_score = payload.get("trust_score", 50.0)
    version = payload.get("version", "1.0")
    metadata = payload.get("metadata", {})
    
    if not doc_id or not org_id or not text:
        raise HTTPException(status_code=400, detail="Missing mandatory fields: doc_id, org_id, extracted_text")

    # 1. Semantic Chunking
    chunks = chunk_document(doc_id, text, version, trust_score)
    
    # 2. Entity Extraction
    extracted_entities = extract_entities(text, org_id)
    
    # Associate extracted entities with chunks
    for ch in chunks:
        ch_entities = extract_entities(ch["text"], org_id)
        ch["entities"] = [e["entity_id"] for e in ch_entities]
        ch["org_id"] = org_id

    # 3. Embedding Generation
    embeddings = []
    for ch in chunks:
        vec = get_embedding(ch["text"])
        embeddings.append(vec)
        ch["embedding_id"] = ch["chunk_id"] # Simple 1:1 mapping

    # 4. Persistence — PostgreSQL Metadata Registry
    doc_record = {
        "doc_id": doc_id,
        "org_id": org_id,
        "document_name": metadata.get("product_name") or metadata.get("title") or f"Doc_{doc_id}",
        "document_type": doc_type,
        "product_category": metadata.get("category"),
        "product_family": metadata.get("product_family"),
        "material": metadata.get("material"),
        "industry": metadata.get("industry"),
        "applications": metadata.get("applications") or [],
        "department": metadata.get("department"),
        "source_category": source_cat,
        "author": metadata.get("author"),
        "reviewer": metadata.get("reviewer"),
        "version": version,
        "revision_notes": metadata.get("revision_notes"),
        "approval_status": "approved" if trust_score >= 85 else "pending_review",
        "effective_date": metadata.get("effective_date"),
        "expiry_date": metadata.get("expiry_date"),
        "language": metadata.get("language", "en"),
        "entity_tags": [e["entity_id"] for e in extracted_entities],
        "keywords": metadata.get("keywords") or [],
        "trust_score": trust_score,
        "content_type": payload.get("content_type", "text"),
        "region": metadata.get("region"),
        "related_documents": metadata.get("related_documents", []),
        "freshness_state": "fresh",
        "provenance": {
            "source_document": doc_id,
            "version": version,
            "reviewer": metadata.get("reviewer"),
            "department": metadata.get("department"),
            "trust_score": trust_score,
            "lineage": ["ingest", "hygiene_pipeline", "knowledge_fabric"]
        }
    }
    
    metadata_registry.store_document(doc_record, chunks)

    # 5. Graph Sync (Neo4j)
    # Upsert entities
    for ent in extracted_entities:
        kg.upsert_entity(ent["entity_id"], ent["name"], ent["entity_type"], ent["org_id"])
        
    # Link entities to parent document
    doc_node_id = f"doc:{doc_id}"
    kg.upsert_entity(doc_node_id, doc_record["document_name"], "document", org_id, {
        "document_type": doc_type,
        "version": version,
        "trust_score": trust_score
    })
    
    for ent in extracted_entities:
        kg.link_entities(doc_node_id, ent["entity_id"], "REFERENCED_BY", {"org_id": org_id})

    # Link product to material relationships
    product_material = metadata.get("material")
    product_name = metadata.get("product_name")
    if product_name and product_material:
        prod_entity_id = f"product:{re_slug(product_name)}"
        mat_entity_id = f"material:{re_slug(product_material)}"
        kg.upsert_entity(prod_entity_id, product_name, "product", org_id)
        kg.upsert_entity(mat_entity_id, product_material, "material", org_id)
        kg.link_entities(prod_entity_id, mat_entity_id, "MANUFACTURED_FROM", {"org_id": org_id})

    # Link product to applications
    for app_name in doc_record["applications"]:
        if product_name:
            prod_entity_id = f"product:{re_slug(product_name)}"
            app_entity_id = f"application:{re_slug(app_name)}"
            kg.upsert_entity(prod_entity_id, product_name, "product", org_id)
            kg.upsert_entity(app_entity_id, app_name, "application", org_id)
            kg.link_entities(prod_entity_id, app_entity_id, "USED_IN", {"org_id": org_id})

    # 6. Vector Store Sync (Qdrant)
    # Map document types to RAG collections
    rag_type = "product"
    if doc_type in ("research_paper", "scientific_journal"):
        rag_type = "scientific"
    elif doc_type == "sop":
        rag_type = "scientific" # Technical procedures
    elif doc_type == "blog" or doc_type == "article":
        rag_type = "marketing"
        
    rag.upsert_chunks(rag_type, chunks, embeddings)
    
    return {"status": "success", "doc_id": doc_id, "chunks_count": len(chunks), "entities_count": len(extracted_entities)}

@app.get("/api/v1/knowledge/document/{doc_id}")
def get_stored_document(doc_id: str):
    doc = metadata_registry.get_document(doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc

@app.post("/api/v1/knowledge/query")
def query_knowledge(payload: QueryPayload):
    """
    Standard query endpoint for downstream AI agents. Combines Qdrant vector search
    with Neo4j graph traversal for enriched context.
    """
    vec = get_embedding(payload.query)
    
    # 1. Specialized RAG Retrieval
    filters = {**(payload.filters or {}), "org_id": payload.org_id}
    if payload.rag_type == "product":
        hits = rag.search_product(vec, limit=payload.limit, filters=filters)
    elif payload.rag_type == "scientific":
        hits = rag.search_scientific(vec, limit=payload.limit, filters=filters)
    else:
        hits = rag.search(payload.rag_type, vec, limit=payload.limit, filters=filters)
        
    # 2. Graph Traversal Enrichment
    # Extract entities from the retrieved chunks and find neighbors
    graph_context = {}
    for hit in hits:
        chunk_id = hit.get("chunk_id")
        if chunk_id:
            # Note: in a real implementation, we would query neo4j for entities mapped to this chunk
            # For now, we simulate extracting an entity ID from the text or doc ID
            doc_node_id = f"doc:{hit.get('parent_doc_id')}"
            try:
                neighbors = kg.get_neighbors(doc_node_id)
                if neighbors:
                    graph_context[doc_node_id] = neighbors
            except Exception as e:
                pass
                
    return {
        "query": payload.query,
        "org_id": payload.org_id,
        "rag_type": payload.rag_type,
        "vector_hits": hits,
        "graph_context": graph_context
    }

@app.post("/api/v1/knowledge/context")
def get_knowledge_context(payload: QueryPayload):
    """
    Specifically designed for the Agent Runtime. Returns a pre-formatted Markdown 
    string containing the retrieved knowledge ready to be injected into a Gemini Prompt.
    """
    result = query_knowledge(payload)
    
    context_parts = [f"## Knowledge Context for: {payload.query}\n"]
    
    context_parts.append("### Retrieved Documents:\n")
    for idx, hit in enumerate(result["vector_hits"]):
        context_parts.append(f"**Document {idx+1}** (Relevance: {hit['score']:.2f})")
        context_parts.append(f"Source ID: {hit['parent_doc_id']}")
        context_parts.append(f"Type: {hit['chunk_type']}")
        context_parts.append(f"Content:\n{hit['text']}\n")
        
    if result["graph_context"]:
        context_parts.append("### Related Entities & Relationships:\n")
        for doc_id, neighbors in result["graph_context"].items():
            for n in neighbors:
                context_parts.append(f"- {doc_id} --[{n.get('relationship', '')}]--> {n.get('id', '')} ({n.get('name', '')})")
                
    formatted_context = "\n".join(context_parts)
    
    return {
        "query": payload.query,
        "org_id": payload.org_id,
        "rag_type": payload.rag_type,
        "formatted_context": formatted_context,
        "vector_hits": result["vector_hits"],
        "graph_context": result["graph_context"],
    }

@app.get("/api/v1/knowledge/entity/{entity_id}/neighbors")
def get_entity_neighbors(entity_id: str):
    return {"entity_id": entity_id, "neighbors": kg.get_neighbors(entity_id)}

def re_slug(text: str) -> str:
    import re
    return re.sub(r'[^a-z0-9]+', '_', text.lower().strip())

def start_kafka_listener():
    """Background thread listening for raw/hygiene-passed messages and routing them."""
    from confluent_kafka import Consumer, KafkaError
    
    # Wait for Kafka & databases to be fully up
    time.sleep(10)
    
    conf = {
        'bootstrap.servers': KAFKA_BROKERS,
        'group.id': 'knowledge-fabric-consumer',
        'auto.offset.reset': 'earliest'
    }
    
    try:
        consumer = Consumer(conf)
        consumer.subscribe([CONSUMER_TOPIC])
        print(f"[knowledge-fabric-listener] Listening on Kafka topic: {CONSUMER_TOPIC}", flush=True)
        
        while True:
            msg = consumer.poll(1.0)
            if msg is None:
                continue
            if msg.error():
                if msg.error().code() != KafkaError._PARTITION_EOF:
                    print(f"[knowledge-fabric-listener] Kafka error: {msg.error()}", flush=True)
                continue
                
            try:
                record = json.loads(msg.value().decode('utf-8'))
                print(f"[knowledge-fabric-listener] Ingesting message {record.get('doc_id')}", flush=True)
                
                # Retrieve trust score from payload or fetch from trust-score HTTP service
                # (For now, grab from message or assign default based on tier)
                source_cat = record.get("source_type") or "unknown_website"
                payload = {
                    "doc_id": record["doc_id"],
                    "org_id": record["org_id"],
                    "extracted_text": record["extracted_text"],
                    "document_type": record.get("document_type"),
                    "source_category": source_cat,
                    "trust_score": record.get("breaker_state", {}).get("trust_score", 80.0),
                    "version": "1.0",
                    "metadata": record.get("metadata") or {}
                }
                
                store_knowledge_payload(payload)
                print(f"[knowledge-fabric-listener] Document {record['doc_id']} processed successfully.", flush=True)
            except Exception as ex:
                print(f"[knowledge-fabric-listener] Error processing message: {ex}", flush=True)
                
    except Exception as e:
        print(f"[knowledge-fabric-listener] Thread crashed: {e}", flush=True)
