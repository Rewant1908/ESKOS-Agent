from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime

class ProvenanceChain(BaseModel):
    source_document: str
    version: str
    reviewer: Optional[str] = None
    department: Optional[str] = None
    published_date: Optional[str] = None
    trust_score: float
    lineage: List[str] = Field(default_factory=list)  # Transformation history

class DocumentMetadata(BaseModel):
    doc_id: str
    org_id: str  # "borosil-scientific" | "goel-scientific" | "shared"
    document_name: str
    document_type: str  # "product_datasheet" | "research_paper" | "sop" | ...
    product_category: Optional[str] = None
    product_family: Optional[str] = None
    material: Optional[str] = None
    industry: Optional[str] = None
    applications: List[str] = Field(default_factory=list)
    department: Optional[str] = None
    source_category: str
    author: Optional[str] = None
    reviewer: Optional[str] = None
    version: str
    revision_notes: Optional[str] = None
    approval_status: str  # "draft" | "pending_review" | "approved" | "deprecated"
    effective_date: Optional[str] = None
    expiry_date: Optional[str] = None
    language: str = "en"
    entity_tags: List[str] = Field(default_factory=list)
    keywords: List[str] = Field(default_factory=list)
    trust_score: float
    content_type: str
    region: Optional[str] = None
    related_documents: List[str] = Field(default_factory=list)
    freshness_state: str = "fresh"  # "fresh" | "review_soon" | "stale" | "deprecated"
    provenance: Optional[ProvenanceChain] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class KnowledgeChunk(BaseModel):
    chunk_id: str
    parent_doc_id: str
    text: str
    chunk_type: str  # "section" | "procedure" | "specification" | "faq" | ...
    position: int
    entities: List[str] = Field(default_factory=list)
    trust_score: float
    version: str
    embedding_id: Optional[str] = None

class EntityNode(BaseModel):
    entity_id: str
    name: str
    entity_type: str  # "product" | "material" | "application" | "standard" | ...
    org_id: str  # "borosil-scientific" | "goel-scientific" | "shared"
    properties: Dict[str, Any] = Field(default_factory=dict)
    source_doc_ids: List[str] = Field(default_factory=list)

class QueryPayload(BaseModel):
    query: str
    org_id: str
    rag_type: str = "product"  # "product" | "scientific" | "marketing" | "seo" | "competitor" | "support"
    limit: int = 5
    filters: Optional[Dict[str, Any]] = None
