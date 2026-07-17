# ESKOS — Phase 3: Trust Firewall & Intelligent Ingestion

Reference: `PHASE 3 — TRUST, SECURITY & INTELLIGENT INGESTION` in the ESKOS master document.
This repo is the first working implementation slice. It targets the shared-knowledge-graph,
brand-tagged-entity model agreed for Borosil Scientific + Goel Scientific (`org_id` on every
document/entity — see `common/brand_taxonomy.md`).

## What's implemented in this slice

| Doc Section | Component | Status |
|---|---|---|
| §5 Source Classification | `services/trust-score/tiers.py` | done |
| §6 Identity Verification | `gateway/kong/kong.yml` (mTLS consumer certs) | done |
| §7 Cloudflare Edge | `services/edge-worker/ja4_pow_worker.js` | done (Worker script) |
| §8 JA4 Fingerprinting | `services/edge-worker/ja4_pow_worker.js` | done |
| §9 Dynamic Proof of Work | `services/edge-worker/ja4_pow_worker.js` | done |
| §10 mTLS | `gateway/envoy/envoy.yaml` | done |
| §11 API Gateway | `gateway/kong/kong.yml` | done |
| §12 Streaming | `docker-compose.yml` (Redpanda = Kafka-API compatible) | done |
| §13 Hygiene Pipeline | `services/hygiene-pipeline/` | done (Python stream consumer; swap for real Flink job later) |
| §14 Entropy Analysis | `services/hygiene-pipeline/checks/entropy.py` | done |
| §15 Structural Validation | `services/hygiene-pipeline/checks/structural.py` | done |
| §16 Semantic Spam Detection | `services/hygiene-pipeline/checks/semantic_spam.py` | stub (heuristic now, SLM later) |
| §17 Duplicate Detection | `services/hygiene-pipeline/checks/dedup.py` | done (SimHash) |
| §18 Prompt Injection Detection | `services/hygiene-pipeline/checks/prompt_injection.py` | done |
| §19 Malware Isolation | not in this slice | TODO — needs Firecracker/gVisor infra, out of scope for a code scaffold |
| §20 Pre-flight Planning | `services/preflight-planner/app.py` | done |
| §21 Schema Validation | `services/preflight-planner/schemas/*.json` | done |
| §22 Real-Time vs Batch | `services/preflight-planner/app.py` (`route_priority`) | done |
| §23 Trust Scoring | `services/trust-score/app.py` | done |
| §24 Circuit Breakers | `services/hygiene-pipeline/circuit_breaker.py` | done (in-process; Temporal version noted as TODO) |
| §25 DLQ | `docker-compose.yml` topics + `services/hygiene-pipeline/dlq.py` | done |
| §26 Audit Logging | `services/hygiene-pipeline/audit.py` | done (stdout JSON now, ship to your log sink later) |

## Explicitly NOT done here (needs your call before building)

- **Temporal.io orchestration** for circuit breakers / real-time-vs-batch scheduling — this
  scaffold uses in-process logic so you can run and test locally. Swapping to Temporal is a
  follow-up once you're ready to run this on real infra.
- **Real Flink cluster** — `services/hygiene-pipeline` is a Python Kafka consumer doing the
  same checks Flink would. It's functionally equivalent for dev/testing at low volume, not a
  production-throughput replacement.
- **Sandbox isolation (§19)** — needs Firecracker/gVisor host-level setup, can't be meaningfully
  scaffolded as application code.
- **Local SLM for semantic spam (§16)** — currently a heuristic (keyword-stuffing ratio +
  off-domain keyword check against your scientific taxonomy). Swap in a quantized classifier
  when you have labeled training data.

## Quickstart

```bash
docker compose up -d
# Kong admin:   http://localhost:8001
# Kong proxy:   http://localhost:8000
# Redpanda:     localhost:9092
python services/preflight-planner/app.py   # runs a smoke test document through the pipeline
```

## Brand tagging

Every document entering the pipeline requires an `org_id` header/field:
`borosil-scientific` or `goel-scientific`. See `common/brand_taxonomy.md` for the full
namespacing rule before this touches the Knowledge Graph in Phase 2.
