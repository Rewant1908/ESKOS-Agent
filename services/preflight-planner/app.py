"""§20 Pre-flight Planning Engine, §21 Schema Validation, §22 Real-Time vs Batch.

Runs AFTER hygiene-pipeline admits a document (consumes `hygiene-passed`), BEFORE
it reaches the Knowledge Fabric. Answers: token size? embedding cost? schema valid?
real-time or batch? Then routes accordingly.

Also runs as a standalone smoke test when executed directly (`python app.py`) —
useful for local dev without spinning up the whole Kafka stack first.
"""

import json
import os
from pathlib import Path

import jsonschema

# --- Cost model constants (tune to your actual embedding provider pricing) ---
EMBEDDING_RATE_PER_1K_TOKENS = 0.00002     # example: text-embedding-3-small-equivalent
GRAPH_WRITE_UNIT_COST = 0.00005            # per chunk, arbitrary internal unit cost
MAX_REALTIME_TOKENS = 50_000               # above this, force batch lane regardless of source
MAX_DAILY_COST_PER_SOURCE = 25.00          # USD — circuit-breaker-adjacent budget gate

SCHEMA_DIR = Path(__file__).parent / "schemas"
SCHEMA_MAP = {
    "product_datasheet": "product_datasheet.schema.json",
    "research_paper": "research_paper.schema.json",
    "sop": "sop.schema.json",
}

REALTIME_SOURCE_TYPES = {"wordpress-webhook", "product-spec-update", "erp-connector"}
BATCH_SOURCE_TYPES = {"bulk-upload", "research-paper-corpus", "competitor-crawl", "historical-manual-import"}


def _load_schema(document_type: str) -> dict | None:
    filename = SCHEMA_MAP.get(document_type)
    if not filename:
        return None
    with open(SCHEMA_DIR / filename) as f:
        return json.load(f)


def estimate_tokens(text: str) -> int:
    # Rough approximation: ~4 chars/token for English technical text.
    # Swap for a real tokenizer (tiktoken or provider-specific) before this
    # feeds actual budget decisions in production.
    return max(1, len(text) // 4)


def estimate_cost(token_count: int, chunk_count: int) -> float:
    embedding_cost = (token_count / 1000) * EMBEDDING_RATE_PER_1K_TOKENS
    graph_cost = chunk_count * GRAPH_WRITE_UNIT_COST
    return round(embedding_cost + graph_cost, 6)


def estimate_chunk_count(token_count: int, chunk_size_tokens: int = 500) -> int:
    return max(1, -(-token_count // chunk_size_tokens))  # ceiling division


def validate_schema(metadata: dict, document_type: str) -> dict:
    schema = _load_schema(document_type)
    if schema is None:
        return {"check": "schema_validation", "verdict": "flag",
                "reason": f"no registered schema for document_type={document_type}"}

    try:
        jsonschema.validate(instance=metadata, schema=schema)
        return {"check": "schema_validation", "verdict": "pass"}
    except jsonschema.ValidationError as e:
        return {"check": "schema_validation", "verdict": "flag",
                "reason": f"missing/invalid field: {e.message}", "path": list(e.path)}


def route_priority(source_type: str, token_count: int) -> str:
    if token_count > MAX_REALTIME_TOKENS:
        return "batch"
    if source_type in REALTIME_SOURCE_TYPES:
        return "real_time"
    if source_type in BATCH_SOURCE_TYPES:
        return "batch"
    return "batch"  # unknown source types default to the slower, cheaper lane


def plan(record: dict) -> dict:
    text = record["extracted_text"]
    metadata = record.get("metadata", {})
    document_type = record.get("document_type", "unknown")
    source_type = record.get("source_type", "unknown")
    org_id = record.get("org_id")

    token_count = estimate_tokens(text)
    chunk_count = estimate_chunk_count(token_count)
    cost = estimate_cost(token_count, chunk_count)
    priority = route_priority(source_type, token_count)
    schema_result = validate_schema({**metadata, "org_id": org_id}, document_type)

    plan_result = {
        "doc_id": record.get("doc_id"),
        "org_id": org_id,
        "document_type": document_type,
        "estimated_tokens": token_count,
        "estimated_chunk_count": chunk_count,
        "estimated_cost_usd": cost,
        "priority_lane": priority,
        "schema_validation": schema_result,
    }

    if schema_result["verdict"] == "flag":
        plan_result["decision"] = "quarantine_schema_violation"
    elif cost > MAX_DAILY_COST_PER_SOURCE:
        plan_result["decision"] = "hold_for_budget_approval"
    else:
        plan_result["decision"] = "proceed_to_knowledge_fabric"

    return plan_result


if __name__ == "__main__":
    # Smoke test — no Kafka required.
    sample = {
        "doc_id": "smoke-test-001",
        "org_id": "goel-scientific",
        "document_type": "product_datasheet",
        "source_type": "wordpress-webhook",
        "extracted_text": "Borosilicate condenser with 250mm jacket length. " * 40,
        "metadata": {
            "product_name": "Liebig Condenser 250mm",
            "material": "Borosilicate Glass 3.3",
            "dimensions": "250mm jacket, 24/29 joint",
            "applications": ["distillation", "reflux"],
            "category": "condensers",
        },
    }
    result = plan(sample)
    print(json.dumps(result, indent=2))
