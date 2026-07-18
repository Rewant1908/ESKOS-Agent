import os
import json
import psycopg
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List

POSTGRES_HOST = os.environ.get("POSTGRES_HOST", "localhost")
POSTGRES_USER = os.environ.get("POSTGRES_USER", "eskos")
POSTGRES_PASSWORD = os.environ.get("POSTGRES_PASSWORD", "eskosdbpass123")
POSTGRES_DB = os.environ.get("POSTGRES_DB", "eskos_knowledge")

def get_conn():
    return psycopg.connect(
        host=POSTGRES_HOST,
        user=POSTGRES_USER,
        password=POSTGRES_PASSWORD,
        dbname=POSTGRES_DB
    )

def init_db():
    """Initializes tables for metadata, chunks, and ontologies."""
    with get_conn() as conn:
        with conn.cursor() as cur:
            # 1. Core Metadata & Chunks
            cur.execute("""
                CREATE TABLE IF NOT EXISTS documents (
                    doc_id VARCHAR(255) PRIMARY KEY,
                    org_id VARCHAR(50) NOT NULL,
                    document_name VARCHAR(255) NOT NULL,
                    document_type VARCHAR(100) NOT NULL,
                    product_category VARCHAR(100),
                    product_family VARCHAR(100),
                    material VARCHAR(100),
                    industry VARCHAR(100),
                    applications TEXT[],
                    department VARCHAR(100),
                    source_category VARCHAR(100) NOT NULL,
                    author VARCHAR(100),
                    reviewer VARCHAR(100),
                    version VARCHAR(50) NOT NULL,
                    revision_notes TEXT,
                    approval_status VARCHAR(50) NOT NULL,
                    effective_date VARCHAR(50),
                    expiry_date VARCHAR(50),
                    language VARCHAR(10) DEFAULT 'en',
                    entity_tags TEXT[],
                    keywords TEXT[],
                    trust_score DOUBLE PRECISION NOT NULL,
                    content_type VARCHAR(100) NOT NULL,
                    region VARCHAR(100),
                    related_documents TEXT[],
                    freshness_state VARCHAR(50) DEFAULT 'fresh',
                    provenance JSONB,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                );
                
                CREATE TABLE IF NOT EXISTS chunks (
                    chunk_id VARCHAR(255) PRIMARY KEY,
                    parent_doc_id VARCHAR(255) REFERENCES documents(doc_id) ON DELETE CASCADE,
                    chunk_type VARCHAR(50) NOT NULL,
                    position INT NOT NULL,
                    entities TEXT[],
                    trust_score DOUBLE PRECISION NOT NULL,
                    version VARCHAR(50) NOT NULL,
                    text TEXT NOT NULL,
                    embedding_id VARCHAR(255)
                );
                
                CREATE INDEX IF NOT EXISTS idx_doc_org ON documents(org_id);
                CREATE INDEX IF NOT EXISTS idx_doc_type ON documents(document_type);
                CREATE INDEX IF NOT EXISTS idx_doc_freshness ON documents(freshness_state);
            """)

            # 2. Ontology Meta-Schema Tables
            cur.execute("""
                CREATE TABLE IF NOT EXISTS ontology_classes (
                    class_name VARCHAR(100) PRIMARY KEY,
                    description TEXT NOT NULL,
                    color VARCHAR(20) NOT NULL,
                    properties JSONB DEFAULT '{}',
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                );
                
                CREATE TABLE IF NOT EXISTS ontology_relations (
                    relation_type VARCHAR(100) PRIMARY KEY,
                    source_class VARCHAR(100) REFERENCES ontology_classes(class_name) ON DELETE CASCADE,
                    target_class VARCHAR(100) REFERENCES ontology_classes(class_name) ON DELETE CASCADE,
                    description TEXT NOT NULL,
                    properties JSONB DEFAULT '{}',
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                );
                
                CREATE TABLE IF NOT EXISTS query_logs (
                    query_id SERIAL PRIMARY KEY,
                    query_text TEXT NOT NULL,
                    trust_score DOUBLE PRECISION NOT NULL,
                    matched_chunks_count INT NOT NULL,
                    response_status VARCHAR(50) NOT NULL,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                );
            """)

            # 3. Seed initial scientific ontology values if tables are empty
            cur.execute("SELECT COUNT(*) FROM ontology_classes")
            if cur.fetchone()[0] == 0:
                print("[metadata_registry] Seeding default scientific ontology classes...", flush=True)
                default_classes = [
                    ("Product", "Scientific instruments, glassware, and lab items.", "#3B82F6", '{"sku": "string", "manufacturer": "string"}'),
                    ("Material", "Glassware composition, borosilicate specifications, thermal limits.", "#10B981", '{"borosilicate_grade": "string", "max_temp": "int"}'),
                    ("Application", "Scientific processes, distillation, vacuum filtration use-cases.", "#F59E0B", '{"laboratory_domain": "string"}'),
                    ("Standard", "Regulatory and manufacturing specifications, e.g. ISO 3585, ASTM.", "#EF4444", '{"compliance_id": "string"}'),
                    ("Chemical", "Chemical substances, reagents, and media.", "#8B5CF6", '{"cas_number": "string", "ph_level": "float"}'),
                    ("Experiment", "SOP procedures, scientific tests, and trials.", "#EC4899", '{"sop_reference": "string"}')
                ]
                for name, desc, color, props in default_classes:
                    cur.execute("""
                        INSERT INTO ontology_classes (class_name, description, color, properties)
                        VALUES (%s, %s, %s, %s)
                    """, (name, desc, color, props))

            cur.execute("SELECT COUNT(*) FROM ontology_relations")
            if cur.fetchone()[0] == 0:
                print("[metadata_registry] Seeding default scientific ontology relationships...", flush=True)
                default_relations = [
                    ("MANUFACTURED_FROM", "Product", "Material", "Custom composition and glass engineering rules.", '{}'),
                    ("USED_IN", "Product", "Application", "Validation procedures for laboratory glassware.", '{}'),
                    ("COMPLIANT_WITH", "Product", "Standard", "Regulatory compliance tags.", '{}'),
                    ("INTERACTS_WITH", "Chemical", "Material", "Chemical compatibility profiles.", '{}'),
                    ("TESTED_IN", "Product", "Experiment", "Lab verification test protocols.", '{}')
                ]
                for rel, src, tgt, desc, props in default_relations:
                    cur.execute("""
                        INSERT INTO ontology_relations (relation_type, source_class, target_class, description, properties)
                        VALUES (%s, %s, %s, %s, %s)
                    """, (rel, src, tgt, desc, props))

            # 4. Seed mock query logs if empty
            cur.execute("SELECT COUNT(*) FROM query_logs")
            if cur.fetchone()[0] == 0:
                print("[metadata_registry] Seeding mock failed and successful queries...", flush=True)
                mock_logs = [
                    ("quartz distillation columns max pressure index", 0.0, 0, "no_results"),
                    ("quartz distillation columns max pressure index", 0.0, 0, "no_results"),
                    ("high-temperature pressure reactors specifications", 35.5, 1, "low_confidence"),
                    ("high-temperature pressure reactors specifications", 42.0, 1, "low_confidence"),
                    ("fluoropolymer lined beaker chemical compatibility", 0.0, 0, "no_results"),
                    ("glass beaker thermal shock parameters", 95.0, 6, "success"),
                    ("Liebig condenser dimensions", 98.2, 8, "success")
                ]
                for q, score, count, status in mock_logs:
                    cur.execute("""
                        INSERT INTO query_logs (query_text, trust_score, matched_chunks_count, response_status)
                        VALUES (%s, %s, %s, %s)
                    """, (q, score, count, status))

            conn.commit()

def store_document(doc: Dict[str, Any], chunks: List[Dict[str, Any]]) -> None:
    """Inserts or updates document metadata and its corresponding chunks."""
    with get_conn() as conn:
        with conn.cursor() as cur:
            # 1. Upsert document
            cur.execute("""
                INSERT INTO documents (
                    doc_id, org_id, document_name, document_type, product_category,
                    product_family, material, industry, applications, department,
                    source_category, author, reviewer, version, revision_notes,
                    approval_status, effective_date, expiry_date, language, entity_tags,
                    keywords, trust_score, content_type, region, related_documents,
                    freshness_state, provenance, updated_at
                ) VALUES (
                    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, CURRENT_TIMESTAMP
                )
                ON CONFLICT (doc_id) DO UPDATE SET
                    org_id = EXCLUDED.org_id,
                    document_name = EXCLUDED.document_name,
                    document_type = EXCLUDED.document_type,
                    product_category = EXCLUDED.product_category,
                    product_family = EXCLUDED.product_family,
                    material = EXCLUDED.material,
                    industry = EXCLUDED.industry,
                    applications = EXCLUDED.applications,
                    department = EXCLUDED.department,
                    source_category = EXCLUDED.source_category,
                    author = EXCLUDED.author,
                    reviewer = EXCLUDED.reviewer,
                    version = EXCLUDED.version,
                    revision_notes = EXCLUDED.revision_notes,
                    approval_status = EXCLUDED.approval_status,
                    effective_date = EXCLUDED.effective_date,
                    expiry_date = EXCLUDED.expiry_date,
                    language = EXCLUDED.language,
                    entity_tags = EXCLUDED.entity_tags,
                    keywords = EXCLUDED.keywords,
                    trust_score = EXCLUDED.trust_score,
                    content_type = EXCLUDED.content_type,
                    region = EXCLUDED.region,
                    related_documents = EXCLUDED.related_documents,
                    freshness_state = EXCLUDED.freshness_state,
                    provenance = EXCLUDED.provenance,
                    updated_at = CURRENT_TIMESTAMP;
            """, (
                doc["doc_id"], doc["org_id"], doc["document_name"], doc["document_type"],
                doc.get("product_category"), doc.get("product_family"), doc.get("material"),
                doc.get("industry"), doc.get("applications", []), doc.get("department"),
                doc["source_category"], doc.get("author"), doc.get("reviewer"),
                doc["version"], doc.get("revision_notes"), doc["approval_status"],
                doc.get("effective_date"), doc.get("expiry_date"), doc.get("language", "en"),
                doc.get("entity_tags", []), doc.get("keywords", []), doc["trust_score"],
                doc["content_type"], doc.get("region"), doc.get("related_documents", []),
                doc.get("freshness_state", "fresh"), json.dumps(doc.get("provenance"))
            ))

            # Delete previous chunks to keep consistent position ordering on overwrite
            cur.execute("DELETE FROM chunks WHERE parent_doc_id = %s", (doc["doc_id"],))

            # 2. Insert chunks
            for ch in chunks:
                cur.execute("""
                    INSERT INTO chunks (
                        chunk_id, parent_doc_id, chunk_type, position, entities,
                        trust_score, version, text, embedding_id
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, (
                    ch["chunk_id"], ch["parent_doc_id"], ch["chunk_type"], ch["position"],
                    ch.get("entities", []), ch["trust_score"], ch["version"],
                    ch["text"], ch.get("embedding_id")
                ))

            conn.commit()

def get_document(doc_id: str) -> Optional[Dict[str, Any]]:
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM documents WHERE doc_id = %s", (doc_id,))
            row = cur.fetchone()
            if not row:
                return None
            
            # Map description attributes
            colnames = [desc[0] for desc in cur.description]
            doc = dict(zip(colnames, row))
            
            # Fetch associated chunks
            cur.execute("SELECT * FROM chunks WHERE parent_doc_id = %s ORDER BY position", (doc_id,))
            chunk_rows = cur.fetchall()
            chunk_colnames = [desc[0] for desc in cur.description]
            chunks = [dict(zip(chunk_colnames, r)) for r in chunk_rows]
            
            doc["chunks"] = chunks
            return doc

def get_db_stats() -> Dict[str, Any]:
    """Returns database telemetry including doc and chunk counts."""
    try:
        with get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT COUNT(*) FROM documents")
                total_documents = cur.fetchone()[0]
                
                cur.execute("SELECT COUNT(*) FROM chunks")
                total_chunks = cur.fetchone()[0]
                
                cur.execute("SELECT document_type, COUNT(*) FROM documents GROUP BY document_type")
                doc_types = {row[0]: row[1] for row in cur.fetchall()}
                
                return {
                    "total_documents": total_documents,
                    "total_chunks": total_chunks,
                    "document_types": doc_types
                }
    except Exception as e:
        print(f"[metadata_registry] Error fetching db stats: {e}", flush=True)
        return {
            "total_documents": 0,
            "total_chunks": 0,
            "document_types": {}
        }

def get_ontology_classes() -> List[Dict[str, Any]]:
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT class_name, description, color, properties FROM ontology_classes ORDER BY class_name")
            return [{"class_name": r[0], "description": r[1], "color": r[2], "properties": r[3]} for r in cur.fetchall()]

def upsert_ontology_class(class_name: str, description: str, color: str, properties: Dict[str, Any]) -> None:
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO ontology_classes (class_name, description, color, properties)
                VALUES (%s, %s, %s, %s)
                ON CONFLICT (class_name) DO UPDATE SET
                    description = EXCLUDED.description,
                    color = EXCLUDED.color,
                    properties = EXCLUDED.properties
            """, (class_name, description, color, json.dumps(properties)))
            conn.commit()

def delete_ontology_class(class_name: str) -> None:
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("DELETE FROM ontology_classes WHERE class_name = %s", (class_name,))
            conn.commit()

def get_ontology_relations() -> List[Dict[str, Any]]:
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT relation_type, source_class, target_class, description, properties FROM ontology_relations ORDER BY relation_type")
            return [{
                "relation_type": r[0],
                "source_class": r[1],
                "target_class": r[2],
                "description": r[3],
                "properties": r[4]
            } for r in cur.fetchall()]

def upsert_ontology_relation(relation_type: str, source_class: str, target_class: str, description: str, properties: Dict[str, Any]) -> None:
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO ontology_relations (relation_type, source_class, target_class, description, properties)
                VALUES (%s, %s, %s, %s, %s)
                ON CONFLICT (relation_type) DO UPDATE SET
                    source_class = EXCLUDED.source_class,
                    target_class = EXCLUDED.target_class,
                    description = EXCLUDED.description,
                    properties = EXCLUDED.properties
            """, (relation_type, source_class, target_class, description, json.dumps(properties)))
            conn.commit()

def delete_ontology_relation(relation_type: str) -> None:
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("DELETE FROM ontology_relations WHERE relation_type = %s", (relation_type,))
            conn.commit()

def list_documents(limit: int = 100, offset: int = 0, org_id: Optional[str] = None) -> List[Dict[str, Any]]:
    with get_conn() as conn:
        with conn.cursor() as cur:
            if org_id:
                cur.execute("SELECT * FROM documents WHERE org_id = %s ORDER BY created_at DESC LIMIT %s OFFSET %s", (org_id, limit, offset))
            else:
                cur.execute("SELECT * FROM documents ORDER BY created_at DESC LIMIT %s OFFSET %s", (limit, offset))
            rows = cur.fetchall()
            colnames = [desc[0] for desc in cur.description]
            return [dict(zip(colnames, r)) for r in rows]

def update_document_metadata(doc_id: str, fields: Dict[str, Any]) -> None:
    if not fields:
        return
    query_parts = []
    values = []
    for k, v in fields.items():
        query_parts.append(f"{k} = %s")
        values.append(v)
    values.append(doc_id)
    query_str = f"UPDATE documents SET {', '.join(query_parts)}, updated_at = CURRENT_TIMESTAMP WHERE doc_id = %s"
    
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(query_str, tuple(values))
            conn.commit()

def delete_document(doc_id: str) -> None:
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("DELETE FROM documents WHERE doc_id = %s", (doc_id,))
            conn.commit()

def log_query(query_text: str, trust_score: float, matched_chunks_count: int, response_status: str) -> None:
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO query_logs (query_text, trust_score, matched_chunks_count, response_status)
                VALUES (%s, %s, %s, %s)
            """, (query_text, trust_score, matched_chunks_count, response_status))
            conn.commit()

def get_knowledge_gaps() -> List[Dict[str, Any]]:
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT query_text, COUNT(*), MIN(trust_score), MAX(created_at), response_status 
                FROM query_logs 
                WHERE response_status IN ('no_results', 'low_confidence') 
                GROUP BY query_text, response_status 
                ORDER BY COUNT(*) DESC
            """)
            rows = cur.fetchall()
            gaps = []
            for r in rows:
                query = r[0]
                count = r[1]
                score = r[2]
                dt = r[3]
                status = r[4]
                
                category = "general"
                for kw in ["reactor", "beaker", "column", "glassware", "chemical", "standard", "filtration"]:
                    if kw in query.lower():
                        category = kw + "s"
                        break
                        
                gaps.append({
                    "query": query,
                    "count": count,
                    "trust_score": score,
                    "last_occurred": dt.isoformat(),
                    "category": category,
                    "severity": "HIGH" if status == "no_results" else "MEDIUM"
                })
            return gaps




