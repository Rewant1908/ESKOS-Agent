# ESKOS — Enterprise Scientific Knowledge Operating System

ESKOS (Enterprise Scientific Knowledge Operating System) is an enterprise-grade, AI-native platform designed for transforming fragmented scientific knowledge, product datasheets, and ISO standards into validated, searchable, governed, and publishable intelligence.

Unlike generic chatbots or simple RAG tools, ESKOS couples a **deterministic knowledge core** (metadata registry, knowledge graph, vector indexes, provenance, and governance ledgers) with a **governed multi-agent reasoning runtime**.

---

## 🏛️ Platform Architecture

```text
                               ┌─────────────────────────────────────────┐
                               │       ESKOS Dashboard Studios           │
                               │  (Agent, Governance, Knowledge, etc.)   │
                               └────────────────────┬────────────────────┘
                                                    │
                                                    ▼
                               ┌─────────────────────────────────────────┐
                               │           Kong API Gateway              │
                               │     (CORS, Rate Limiting, Key-Auth)     │
                               └────┬───────────────┬───────────────┬────┘
                                    │               │               │
            ┌───────────────────────┘               │               └────────────────────────┐
            ▼                                       ▼                                        ▼
┌───────────────────────────────┐   ┌───────────────────────────────┐    ┌───────────────────────────────┐
│       Knowledge Fabric        │   │    Governed Agent Runtime     │    │      Content Governance       │
│  (Qdrant, Neo4j, PostgreSQL)  │   │   (LangGraph State Machine)   │    │  (Human-in-the-Loop Review)   │
└───────────────────────────────┘   └───────────────┬───────────────┘    └───────────────┬───────────────┘
                                                    │                                    │
                                                    ▼                                    ▼
                                    ┌───────────────────────────────┐    ┌───────────────────────────────┐
                                    │   PostgreSQL Run Persistence  │    │      Publishing Service       │
                                    │    (agent_runs Telemetry)     │    │   (WordPress API / Fallback)  │
                                    └───────────────────────────────┘    └───────────────────────────────┘
```

---

## 🤖 The 5 Enterprise Reasoning Agents

ESKOS features a 5-agent state graph pipeline implemented inside `services/agent-runtime/src/gemini/langgraph.ts`:

| Agent | Node Name | Purpose & Responsibilities |
| :--- | :--- | :--- |
| **Agent 1: Scientific Authoring Agent** | `authoringNode` | Transforms validated RAG research into publication-quality scientific markdown with data tables and citations. Auto-queues drafts to Content Governance for human review. |
| **Agent 2: SEO / GEO / AEO Optimization Agent** | `seoNode` | Formats technical claims for Generative AI search engines (GEO), injects 45-60 word Answer Engine snippets (AEO), and generates valid JSON-LD schemas (`@type Product`, `FAQPage`). |
| **Agent 3: Competitive Intelligence Agent** | `competitiveNode` | Executes real-time SERP scans via `web_search` to benchmark competitor specifications (Borosil Scientific vs. Goel Scientific) and identify market content gaps. |
| **Agent 4: Monitoring Intelligence Agent** | `monitoringNode` | Reasons OVER system telemetry across vector indexes (Qdrant), graph nodes (Neo4j), governance queue depth, and token cost anomalies. |
| **Agent 5: Learning & Optimization Agent** | `learningNode` | Highest-level meta-reasoning node. Analyzes human review edit patterns, retrieval precision, and trust scores to propose system improvements (prompts, ontology, retrieval ranks). |

---

## 🔐 Multi-Tenant Brand Isolation

- Strict server-side enforcement of `ctx.orgId` (`borosil-scientific`, `goel-scientific`, `shared`).
- Prevents cross-organization data leakage or cross-pollination of product specifications.
- Hardened downstream compliance audits in `complianceNode`.

---

## 📡 Service Directory & Port Mapping

| Service Name | Port | Description |
| :--- | :--- | :--- |
| **Kong API Gateway** | `8000` | Single ingress proxy routing `/api/v1/*` endpoints |
| **ESKOS Dashboard** | `3000` | Next.js Enterprise Studios Frontend |
| **Governed Agent Runtime** | `8091` | Express TypeScript service executing LangGraph agent state machines |
| **Knowledge Fabric** | `8090` | Python FastAPI service managing vector (Qdrant) & graph (Neo4j) retrieval |
| **Content Governance** | `8081` | Human-in-the-loop review ledger & audit logs (SQLite) |
| **Publishing Service** | `8092` | Distribution service pushing approved content to WordPress REST API |
| **Trust Score Service** | `8080` | Dynamic source credibility tier calculation |
| **PostgreSQL Database** | `5432` | Durable metadata registry and `agent_runs` telemetry persistence |
| **Qdrant Vector DB** | `6333` | Dense vector index |
| **Neo4j Graph DB** | `7474` | Product & scientific ontology knowledge graph |

---

## 🚀 Quick Start Guide

### Prerequisites
- Docker & Docker Compose
- Node.js 20+ & npm
- Python 3.11+

### 1. Launch Infrastructure & Microservices
```bash
docker-compose up -d --build
```

### 2. Seed Initial Knowledge Base Data (Optional)
```bash
python data/seed/load_seed_data.py
```

### 3. Launch Frontend Dashboard
```bash
cd eskos-dashboard
npm install
npm run dev
```
Open **`http://localhost:3000`** in your browser.

### 🔑 Pre-Seeded Test Credentials
- **Admin**: Username `admin` / Password `admin123` (Shared Tenant)
- **Goel Reviewer**: Username `navin` / Password `navin123` (Goel Scientific)
- **Borosil Reviewer**: Username `kp` / Password `kp123` (Borosil Scientific)

---

## 📁 Repository Structure

```text
├── eskos-dashboard/          # Next.js 16 Enterprise Studios UI
│   ├── src/app/              # Next.app App Router pages & API routes
│   └── src/components/       # Studios (Agent, Governance, Knowledge, Observability, Executive)
├── gateway/                  # Kong API Gateway configuration (kong.yml)
├── services/
│   ├── agent-runtime/        # LangGraph Multi-Agent Engine (Gemini 3.5 Flash)
│   ├── content-governance/   # Human-in-the-Loop review ledger (FastAPI + SQLite)
│   ├── knowledge-fabric/     # Qdrant + Neo4j + Postgres Knowledge Core
│   ├── publishing-service/   # WordPress REST API publisher & fallback
│   ├── trust-score/          # Source credibility scoring service
│   ├── hygiene-pipeline/     # Ingestion & sanitization pipeline
│   └── preflight-planner/    # Schema & cost routing preflight service
├── docker-compose.yml        # Multi-container orchestrator
└── ARCHITECTURE.md           # Deep architectural specification & runbook
```

---

## 📜 License
Proprietary Enterprise Software — All Rights Reserved.
