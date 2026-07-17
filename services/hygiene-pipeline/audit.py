"""§26 Audit Logging — every ingestion decision becomes traceable.
Emits structured JSON to stdout in this slice; wire to your actual log sink
(e.g. OpenTelemetry collector -> your observability stack per Phase 7) later."""

import json
import sys
import time


def log_event(*, doc_id: str, org_id: str, source_id: str, connector_identity: str,
              validation_results: list[dict], trust_score: float | None,
              decision: str, security_events: list[str] | None = None) -> None:
    event = {
        "timestamp": time.time(),
        "doc_id": doc_id,
        "org_id": org_id,
        "source_id": source_id,
        "connector_identity": connector_identity,
        "validation_results": validation_results,
        "trust_score": trust_score,
        "decision": decision,  # "admitted" | "quarantined" | "rejected" | "circuit_broken"
        "security_events": security_events or [],
    }
    print(json.dumps(event), file=sys.stdout, flush=True)
