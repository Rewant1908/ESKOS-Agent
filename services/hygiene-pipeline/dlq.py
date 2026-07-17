"""§25 Dead Letter Queues — rejected documents are never discarded, always
categorized with enough metadata to be reprocessed after correction."""

import json
import time

FAILURE_TOPIC_MAP = {
    "schema_violation": "dlq.schema-violation",
    "spam_detected": "dlq.spam-detected",
    "parse_failed": "dlq.parse-failed",
    "prompt_injection": "dlq.prompt-injection",
    "circuit_broken": "dlq.circuit-broken",
}


def build_envelope(doc_id: str, org_id: str, source_id: str, failure_stage: str,
                    failure_reason: str, payload_ref: str, retry_count: int = 0) -> dict:
    return {
        "doc_id": doc_id,
        "org_id": org_id,
        "source_id": source_id,
        "failure_stage": failure_stage,
        "failure_reason": failure_reason,
        "payload_ref": payload_ref,  # object storage URI — never the raw payload inline
        "retry_count": retry_count,
        "timestamp": time.time(),
        "status": "unresolved",
    }


def route(producer, failure_category: str, envelope: dict) -> str:
    topic = FAILURE_TOPIC_MAP.get(failure_category)
    if not topic:
        raise ValueError(f"Unknown DLQ failure category: {failure_category}")

    producer.produce(topic, key=envelope["doc_id"], value=json.dumps(envelope).encode("utf-8"))
    producer.flush()
    return topic
