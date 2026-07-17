"""§13 Hygiene Pipeline — main consumer.

Pipeline order (cheapest/deterministic first, matches doc §13 exactly):
Document -> Text Extraction -> Integrity Check -> Entropy Analysis ->
Structure Validation -> Duplicate Detection -> Prompt Injection Detection ->
Semantic Spam Classification -> Routing

This is a Python Kafka consumer standing in for the Flink job described in the doc.
It's functionally equivalent for dev/test throughput; swap for a real Flink job
(PyFlink or Java) before running production ingestion volume — see README.
"""

import json
import os
import uuid

import redis
from confluent_kafka import Consumer, Producer

from checks import dedup, entropy, prompt_injection, semantic_spam, structural
import audit
import circuit_breaker
import dlq

KAFKA_BROKERS = os.environ.get("KAFKA_BROKERS", "localhost:9092")
REDIS_URL = os.environ.get("REDIS_URL", "redis://localhost:6379/0")

INPUT_TOPIC = "raw-ingest"
PASSED_TOPIC = "hygiene-passed"
QUARANTINE_TOPIC = "hygiene-quarantine"

r = redis.Redis.from_url(REDIS_URL)
producer = Producer({"bootstrap.servers": KAFKA_BROKERS})


def run_hygiene_checks(record: dict) -> dict:
    """Runs the full check sequence and returns a combined result."""
    text = record["extracted_text"]
    org_id = record["org_id"]
    doc_id = record.get("doc_id") or str(uuid.uuid4())
    source_id = record["source_id"]
    declared_type = record.get("document_type", "unknown")

    results = []

    # Integrity check — payload sanity before spending any CPU on analysis
    if not text or len(text.strip()) < 10:
        results.append({"check": "integrity", "verdict": "flag", "reason": "empty or near-empty extracted text"})
        return _finalize(doc_id, org_id, source_id, record, results, decision="quarantined",
                          failure_category="parse_failed")

    results.append(entropy.analyze(text))
    results.append(structural.validate(text, declared_type))
    results.append(dedup.check(text, doc_id, org_id, r))
    results.append(prompt_injection.detect(text))
    results.append(semantic_spam.classify(text))

    # Decision logic: prompt injection is a hard quarantine (never auto-pass).
    # Everything else uses a simple "any flag -> quarantine" rule for this slice;
    # tune per-check severity weighting once you have real quarantine-rate data.
    injection_result = next(res for res in results if res["check"] == "prompt_injection")
    if injection_result["verdict"] == "flag":
        return _finalize(doc_id, org_id, source_id, record, results, decision="quarantined",
                          failure_category="prompt_injection")

    dedup_result = next(res for res in results if res["check"] == "dedup")
    if dedup_result["verdict"] == "flag":
        return _finalize(doc_id, org_id, source_id, record, results, decision="quarantined",
                          failure_category="spam_detected")

    any_other_flag = any(res["verdict"] == "flag" for res in results if res["check"] not in ("dedup", "prompt_injection"))
    decision = "quarantined" if any_other_flag else "admitted"
    failure_category = "spam_detected" if any_other_flag else None

    return _finalize(doc_id, org_id, source_id, record, results, decision=decision,
                      failure_category=failure_category)


def _finalize(doc_id, org_id, source_id, record, results, decision, failure_category=None) -> dict:
    outcome_for_breaker = "quarantine" if decision == "quarantined" else "pass"
    if failure_category == "schema_violation":
        outcome_for_breaker = "schema_failure"

    breaker_result = circuit_breaker.record_outcome(r, source_id, outcome_for_breaker)

    if breaker_result["action"] == "reject_immediately":
        decision = "circuit_broken"

    audit.log_event(
        doc_id=doc_id,
        org_id=org_id,
        source_id=source_id,
        connector_identity=record.get("connector_identity", "unknown"),
        validation_results=results,
        trust_score=None,  # assigned downstream by the trust-score service
        decision=decision,
        security_events=[r["check"] for r in results if r.get("verdict") == "flag"],
    )

    output = {
        "doc_id": doc_id,
        "org_id": org_id,
        "source_id": source_id,
        "document_type": record.get("document_type"),
        "extracted_text": record["extracted_text"],
        "validation_results": results,
        "decision": decision,
        "breaker_state": breaker_result,
    }

    if decision == "admitted":
        producer.produce(PASSED_TOPIC, key=doc_id, value=json.dumps(output).encode("utf-8"))
    elif decision == "circuit_broken":
        envelope = dlq.build_envelope(
            doc_id, org_id, source_id, "circuit_breaker",
            breaker_result.get("reason", "connector suspended"),
            payload_ref=f"quarantine-store://{org_id}/{doc_id}",
        )
        dlq.route(producer, "circuit_broken", envelope)
    else:
        producer.produce(QUARANTINE_TOPIC, key=doc_id, value=json.dumps(output).encode("utf-8"))
        if failure_category:
            envelope = dlq.build_envelope(
                doc_id, org_id, source_id, "hygiene_pipeline",
                f"failed checks: {[res['check'] for res in results if res.get('verdict') == 'flag']}",
                payload_ref=f"quarantine-store://{org_id}/{doc_id}",
            )
            dlq.route(producer, failure_category, envelope)

    producer.flush()
    return output


def main():
    consumer = Consumer({
        "bootstrap.servers": KAFKA_BROKERS,
        "group.id": "hygiene-pipeline",
        "auto.offset.reset": "earliest",
    })
    consumer.subscribe([INPUT_TOPIC])

    print(f"[hygiene-pipeline] listening on {INPUT_TOPIC} @ {KAFKA_BROKERS}", flush=True)

    try:
        while True:
            msg = consumer.poll(1.0)
            if msg is None:
                continue
            if msg.error():
                print(f"[hygiene-pipeline] consumer error: {msg.error()}", flush=True)
                continue

            record = json.loads(msg.value().decode("utf-8"))
            result = run_hygiene_checks(record)
            print(f"[hygiene-pipeline] {result['doc_id']} -> {result['decision']}", flush=True)
    except KeyboardInterrupt:
        pass
    finally:
        consumer.close()


if __name__ == "__main__":
    main()
