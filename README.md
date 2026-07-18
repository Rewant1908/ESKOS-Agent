# ESKOS Agent

Enterprise Scientific Knowledge Operating System (ESKOS) is an AI-native platform for transforming fragmented enterprise knowledge into validated, searchable, and publishable intelligence.

It is designed for organizations that require **scientific accuracy**, **governed AI generation**, and **multi-channel publishing** across web, product, and support surfaces.

## Why ESKOS

Most enterprise knowledge lives across disconnected systems (ERP, PIM, CRM, CMS, docs, standards, and research assets).  
ESKOS unifies this knowledge into a structured intelligence layer that enables:

- Reliable retrieval of authoritative facts
- Grounded AI-assisted content generation
- Human-governed review before publication
- Continuous optimization for SEO, GEO, and AEO

## Core Principles

- **Create knowledge once, reuse everywhere**
- **Retrieval before generation** for factual outputs
- **Human-in-the-loop governance** for high-trust publishing
- **Traceability** from output back to source evidence
- **Modular, event-driven architecture** for enterprise scale

## Platform Architecture (High-Level)

1. **Enterprise Data Sources**  
   ERP, PIM, CRM, CMS, technical documents, standards, analytics, and external signals.

2. **Integration Layer**  
   API-first connectivity with MCP-compatible agent orchestration.

3. **Knowledge Processing**  
   Ingestion, parsing, metadata extraction, normalization, entity extraction, and indexing.

4. **Knowledge Core**  
   Knowledge Graph + domain-specific retrieval stores (multi-RAG) for precision and governance.

5. **Agent Runtime**  
   Specialized agents for ingestion, research, generation, verification, optimization, and monitoring.

6. **Human Governance Layer**  
   Expert review workflows for scientific and brand validation.

7. **Publishing & Feedback Loop**  
   Distribution to CMS/portals/support channels with performance-driven continuous learning.

## Repository Structure

- `services/` — backend services including agent runtime and platform components
- `eskos-dashboard/` — dashboard/UI application (Next.js)
- `gateway/` — API gateway and routing configuration
- `infra/` — infrastructure and deployment assets (where applicable)

## Technology Snapshot

Based on current repository composition:

- Python (55.7%)
- JavaScript (19.8%)
- TypeScript (10.1%)
- CSS (11.5%)
- Bicep (1.3%)
- Dockerfile and other supporting assets

## Getting Started

> The project is under active development; setup may vary by service.

### Dashboard (Next.js)
```bash
cd eskos-dashboard
npm install
npm run dev
```

### Agent Runtime
Refer to:
- `services/agent-runtime/README.md`

### Recommended Next Step
Standardize root-level setup docs for:
- prerequisites
- environment variables
- Docker Compose flow
- service startup order
- local development workflow

## Current Status

ESKOS is evolving toward a production-grade enterprise intelligence platform with governed AI workflows and deterministic knowledge foundations.

## License

Add your license information here (e.g., MIT, Apache-2.0, or proprietary internal license).
