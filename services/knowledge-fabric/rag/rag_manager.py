import os
from typing import List, Dict, Any, Optional
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct

QDRANT_HOST = os.environ.get("QDRANT_HOST", "localhost")
QDRANT_PORT = int(os.environ.get("QDRANT_PORT", "6333"))

# Mapping of RAG type to collection names
COLLECTION_MAP = {
    "product": "product_knowledge",
    "scientific": "scientific_knowledge",
    "marketing": "marketing_content",
    "seo": "seo_intelligence",
    "competitor": "competitor_intelligence",
    "support": "support_knowledge"
}

class QdrantRAG:
    def __init__(self):
        self.client = None
        try:
            self.client = QdrantClient(host=QDRANT_HOST, port=QDRANT_PORT)
            self.init_collections()
        except Exception as e:
            print(f"[rag_manager] Warning: Could not connect to Qdrant: {e}", flush=True)

    def init_collections(self):
        if not self.client:
            return
        for col_name in COLLECTION_MAP.values():
            try:
                # Check if collection exists
                if not self.client.collection_exists(collection_name=col_name):
                    self.client.create_collection(
                        collection_name=col_name,
                        vectors_config=VectorParams(size=768, distance=Distance.COSINE)
                    )
                    print(f"[rag_manager] Created Qdrant collection: {col_name}", flush=True)
            except Exception as e:
                print(f"[rag_manager] Error creating collection {col_name}: {e}", flush=True)

    def upsert_chunks(self, rag_type: str, chunks: List[Dict[str, Any]], embeddings: List[List[float]]) -> None:
        """Pushes vector representations of chunks to Qdrant."""
        if not self.client:
            return
        collection_name = COLLECTION_MAP.get(rag_type, "product_knowledge")
        
        points = []
        for ch, vec in zip(chunks, embeddings):
            # Create unique numeric/string ID for Qdrant (uuid equivalent hash)
            import uuid
            # Deterministic namespace uuid based on chunk_id
            point_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, ch["chunk_id"]))
            
            points.append(PointStruct(
                id=point_id,
                vector=vec,
                payload={
                    "chunk_id": ch["chunk_id"],
                    "parent_doc_id": ch["parent_doc_id"],
                    "chunk_type": ch["chunk_type"],
                    "position": ch["position"],
                    "entities": ch.get("entities", []),
                    "trust_score": ch["trust_score"],
                    "version": ch["version"],
                    "org_id": ch.get("org_id"),
                    "text": ch["text"]
                }
            ))
            
        if points:
            self.client.upsert(collection_name=collection_name, points=points)

    def search(
        self,
        rag_type: str,
        query_vector: List[float],
        limit: int = 5,
        score_threshold: float = 0.5,
        filters: Optional[Dict[str, Any]] = None,
    ) -> List[Dict[str, Any]]:
        """Performs cosine-similarity semantic search on a specific RAG type."""
        if not self.client:
            return []
        collection_name = COLLECTION_MAP.get(rag_type, "product_knowledge")
        
        try:
            results = self.client.search(
                collection_name=collection_name,
                query_vector=query_vector,
                limit=limit,
                score_threshold=score_threshold
            )
            
            hits = []
            for r in results:
                hits.append({
                    "chunk_id": r.payload.get("chunk_id"),
                    "parent_doc_id": r.payload.get("parent_doc_id"),
                    "text": r.payload.get("text"),
                    "chunk_type": r.payload.get("chunk_type"),
                    "trust_score": r.payload.get("trust_score"),
                    "org_id": r.payload.get("org_id"),
                    "score": r.score,
                    "collection": collection_name
                })
            if filters and filters.get("org_id"):
                allowed_orgs = {filters["org_id"], "shared"}
                hits = [hit for hit in hits if hit.get("org_id") in allowed_orgs or hit.get("org_id") is None]
            return hits
        except Exception as e:
            print(f"[rag_manager] Search error: {e}", flush=True)
            return []

    def search_product(self, query_vector: List[float], limit: int = 5, filters: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """Specialized retrieval for product specifications. Stricter threshold."""
        return self.search("product", query_vector, limit=limit, score_threshold=0.65, filters=filters)

    def search_scientific(self, query_vector: List[float], limit: int = 5, filters: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """Specialized retrieval for scientific methods and applications."""
        return self.search("scientific", query_vector, limit=limit, score_threshold=0.55, filters=filters)

    def search_cross_rag(self, query_vector: List[float], intents: List[str], limit_per_intent: int = 3) -> Dict[str, List[Dict[str, Any]]]:
        """Queries multiple collections based on requested intents and aggregates results."""
        aggregated = {}
        for intent in intents:
            if intent in COLLECTION_MAP:
                hits = self.search(intent, query_vector, limit=limit_per_intent, score_threshold=0.5)
                aggregated[intent] = hits
        return aggregated
