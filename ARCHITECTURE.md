# ESKOS Architecture Runbook

ESKOS is an Enterprise Scientific Knowledge Operating System. The LLM layer is a transient synthesis client; the durable source of truth is the deterministic knowledge core: metadata registry, knowledge graph, vector indexes, provenance, and governance ledger.

## Current Executable Flow

```text
POST /api/v1/knowledge/ingest
  -> hygiene-pipeline HTTP ingress
  -> Kafka topic: raw-ingest
  -> hygiene checks
  -> Kafka topic: hygiene-passed
  -> preflight-planner schema/cost/routing checks
  -> Kafka topic: knowledge-fabric-ingest
  -> knowledge-fabric
  -> PostgreSQL + Neo4j + Qdrant
  -> dashboard / agent runtime / future MCP tools
```

Failed documents are routed to quarantine or DLQ topics with enough metadata to reprocess later.

## Core Contracts

Every knowledge payload must include:

- `org_id`: `borosil-scientific`, `goel-scientific`, or `shared`
- `source_id`: stable connector/source identity
- `document_type`: for schema and structural validation
- `extracted_text`: normalized text/markdown
- `metadata`: product, scientific, or SOP metadata

The Knowledge Fabric returns two retrieval shapes:

- `POST /api/v1/knowledge/query`: machine-readable vector hits and graph context.
- `POST /api/v1/knowledge/context`: formatted context for LLM prompts plus the same `vector_hits` and `graph_context`.

## Local Startup

```bash
docker compose up -d --build
python data/seed/load_seed_data.py
cd eskos-dashboard
npm install
npm run dev
```

Useful service URLs:

- Kong proxy: `http://localhost:8000`
- Trust score: `http://localhost:8080`
- Knowledge Fabric: `http://localhost:8090`
- Content Governance: `http://localhost:8081`
- Neo4j browser: `http://localhost:7474`
- Qdrant: `http://localhost:6333`

## Example Ingest

```bash
curl -X POST http://localhost:8000/api/v1/knowledge/ingest \
  -H 'Content-Type: application/json' \
  -d '{
    "org_id": "goel-scientific",
    "source_id": "manual-upload",
    "source_type": "wordpress-webhook",
    "document_type": "product_datasheet",
    "extracted_text": "# Product Name\nLiebig Condenser\n# Specifications\nBorosilicate glass condenser.\n# Applications\nDistillation and reflux.\n# Dimensions\n250mm jacket.\n# Material\nBorosilicate Glass 3.3",
    "metadata": {
      "product_name": "Liebig Condenser",
      "material": "Borosilicate Glass 3.3",
      "dimensions": "250mm jacket",
      "applications": ["distillation", "reflux"],
      "category": "condensers"
    }
  }'
```

## Next Enterprise-Grade Milestones

1. Replace heuristic document extraction with OCR/table/layout normalization workers.
2. Add MCP sidecars for graph, vector, CMS, analytics, ERP, and PIM access.
3. Introduce Temporal workflows for ingestion, verification, human approval, and publishing state.
4. Add deterministic verification agents for specifications, units, claims, citations, and schema.
5. Add hybrid sparse/dense retrieval with BM25/RRF and cross-encoder reranking.
6. Wire OIDC and OPA into the gateway path for real RBAC/ABAC enforcement.
7. Persist governance and workflow audit ledgers in PostgreSQL for production.
8. Add WordPress/product-page publishing and Search Console/GA feedback ingestion.
