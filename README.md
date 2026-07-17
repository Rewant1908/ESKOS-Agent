# ESKOS Agent System

This repository contains the complete implementation of the ESKOS Agent System, spanning from Trust Firewall & Intelligent Ingestion (Phase 3), to the Knowledge Fabric (Phase 4), and Content Governance (Phase 5).

The system targets a shared-knowledge-graph, brand-tagged-entity model agreed for Borosil Scientific + Goel Scientific (`org_id` on every document/entity — see `common/brand_taxonomy.md`).

For the executable service flow, payload contracts, and local runbook, see `ARCHITECTURE.md`.

## System Components & Phases

### Phase 3: Trust Firewall & Intelligent Ingestion
The ingestion and hygiene backbone that ensures only safe, structurally sound, and non-spam data enters the system.
- **Edge Security**: JA4 Fingerprinting & Dynamic Proof of Work (Cloudflare Worker).
- **API Gateway**: Kong (mTLS, rate-limiting, RBAC).
- **Hygiene Pipeline**: Entropy Analysis, Structural Validation, Semantic Spam Heuristics, Duplicate Detection (SimHash), and Prompt Injection Detection.
- **Pre-flight Planner**: Schema validation, token/cost estimation, and RT vs. Batch routing.
- **Trust Scoring**: 4-tier source classification and weighted scoring.
- **Streaming & State**: Redpanda (Kafka-compatible) and Redis (circuit breakers, DLQ routing).

### Phase 4: Knowledge Fabric
The cognitive core of the system that structures, links, and serves data to the agents.
- **Graph Database**: Neo4j for semantic relationships and entity resolution.
- **Vector Database**: Qdrant for semantic search and multi-RAG storage.
- **Metadata Registry**: PostgreSQL for provenance and metadata tracking.
- **Knowledge Fabric Service**: Orchestrates chunking, embeddings, entity extraction, and RAG retrieval.

### Phase 5 & Agents: Content Governance & Agent Runtime
- **Content Governance**: Enforces OPA policies and ensures compliance across brands.
- **Agent Runtime**: The execution environment for the autonomous agents, integrating with the Knowledge Fabric to perform complex, multi-step reasoning.
- **Dashboard**: A React-based user interface (`eskos-dashboard`) for visualizing the knowledge graph, monitoring trust scores, and interacting with the AI agents.

## Quickstart

### Prerequisites
- WSL2 (Ubuntu 24.04 recommended)
- Docker Engine (v23.0+) and Docker Compose v2 (`docker-compose-plugin`)
- Node.js 20+ (for the dashboard)

### Starting the Backend Infrastructure

```bash
# Start all core services (Redpanda, Neo4j, Qdrant, Postgres, Kong, Redis, plus all Python microservices)
docker compose up -d

# Kong admin:   http://localhost:8001
# Kong proxy:   http://localhost:8000
# Neo4j:        http://localhost:7474
```

### Starting the Dashboard (UI)

```bash
cd eskos-dashboard
npm install
npm run dev
# Dashboard runs on http://localhost:5173
```

## Brand Tagging

Every document entering the pipeline requires an `org_id` header/field:
`borosil-scientific` or `goel-scientific`. See `common/brand_taxonomy.md` for the full namespacing rules before this touches the Knowledge Graph.

## Note on Production Readiness
- **Temporal.io orchestration** for circuit breakers / real-time-vs-batch scheduling is currently implemented in-process for local development. Swapping to Temporal is a follow-up once you're ready to run this on real infra.
- **Real Flink cluster** — `services/hygiene-pipeline` is a Python Kafka consumer doing the same checks Flink would. It's functionally equivalent for dev/testing at low volume, not a production-throughput replacement.
- **Sandbox isolation (§19)** — needs Firecracker/gVisor host-level setup, out of scope for application scaffold.
