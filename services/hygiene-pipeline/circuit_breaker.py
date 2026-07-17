"""§24 Circuit Breakers — per-connector (per org_id + source_id), in-process/Redis-backed.

NOTE (flagged in README): the doc's ideal implementation runs this as a Temporal.io
workflow so state survives process restarts and half-open retry scheduling is durable.
This version uses Redis counters + TTL windows, which is correct for a first working
slice but should be migrated to Temporal before this touches production ingestion volume —
Redis-only state has no durable retry scheduling and no workflow-level audit trail.
"""

import time

import redis

QUARANTINE_RATE_TRIP_THRESHOLD = 0.30   # 30% of last 100 docs quarantined -> trip
SCHEMA_FAILURE_TRIP_THRESHOLD = 5        # 5 consecutive schema failures -> trip
COOLDOWN_SECONDS = 300
HALF_OPEN_CANARY_WINDOW = 60


def _window_key(source_id: str) -> str:
    return f"cb:window:{source_id}"


def _state_key(source_id: str) -> str:
    return f"cb:state:{source_id}"  # "closed" | "open" | "half_open"


def record_outcome(r: redis.Redis, source_id: str, outcome: str) -> dict:
    """outcome: 'pass' | 'quarantine' | 'schema_failure' | 'auth_failure' | 'malicious'"""
    state = (r.get(_state_key(source_id)) or b"closed").decode()

    if state == "open":
        return {"source_id": source_id, "state": "open", "action": "reject_immediately"}

    window_key = _window_key(source_id)
    r.rpush(window_key, outcome)
    r.ltrim(window_key, -100, -1)  # keep last 100 outcomes
    r.expire(window_key, 3600)

    recent = [o.decode() for o in r.lrange(window_key, 0, -1)]
    quarantine_rate = recent.count("quarantine") / len(recent) if recent else 0

    consecutive_schema_failures = 0
    for o in reversed(recent):
        if o == "schema_failure":
            consecutive_schema_failures += 1
        else:
            break

    should_trip = (
        quarantine_rate >= QUARANTINE_RATE_TRIP_THRESHOLD
        or consecutive_schema_failures >= SCHEMA_FAILURE_TRIP_THRESHOLD
        or outcome in ("auth_failure", "malicious")
    )

    if should_trip and state == "closed":
        r.set(_state_key(source_id), "open", ex=COOLDOWN_SECONDS)
        return {
            "source_id": source_id,
            "state": "open",
            "action": "connector_suspended",
            "reason": f"quarantine_rate={quarantine_rate:.2f} consecutive_schema_failures={consecutive_schema_failures} last_outcome={outcome}",
            "cooldown_seconds": COOLDOWN_SECONDS,
            "notify_admin": True,
        }

    return {"source_id": source_id, "state": state, "action": "continue"}


def maybe_transition_to_half_open(r: redis.Redis, source_id: str) -> bool:
    """Called by a periodic sweep — if TTL on 'open' state has expired, Redis GET
    will already return None, meaning we're implicitly half-open. This function
    exists to make that transition explicit and loggable."""
    state = r.get(_state_key(source_id))
    if state is None:
        r.set(_state_key(source_id), "half_open", ex=HALF_OPEN_CANARY_WINDOW)
        return True
    return False


def record_canary_result(r: redis.Redis, source_id: str, success: bool) -> str:
    state = (r.get(_state_key(source_id)) or b"").decode()
    if state != "half_open":
        return state or "closed"

    if success:
        r.set(_state_key(source_id), "closed")
        r.delete(_window_key(source_id))
        return "closed"
    else:
        r.set(_state_key(source_id), "open", ex=COOLDOWN_SECONDS * 2)  # extended cooldown on repeat failure
        return "open"
