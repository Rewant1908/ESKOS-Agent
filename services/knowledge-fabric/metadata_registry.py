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
    """Initializes tables for metadata and chunks registry."""
    with get_conn() as conn:
        with conn.cursor() as cur:
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
