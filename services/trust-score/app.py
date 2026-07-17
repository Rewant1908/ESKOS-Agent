"""§23 Trust Scoring — combines source authority, freshness, references,
reviewer approval, metadata completeness, consistency, version validity,
and enterprise ownership into a single 0-100 score that drives retrieval
priority, generation confidence, human review requirements, and publishing
eligibility (Phase 4/5 consumers).

Exposed as a small HTTP service so hygiene-pipeline / preflight-planner /
Phase 4 agents can all call it consistently instead of reimplementing scoring.
"""

import time
from datetime import datetime, timezone

from flask import Flask, jsonify, request

from tiers import base_trust, tier

app = Flask(__name__)

WEIGHTS = {
    "source_authority": 0.30,
    "freshness": 0.15,
    "scientific_references": 0.10,
    "reviewer_approval": 0.20,
    "metadata_completeness": 0.10,
    "consistency": 0.05,
    "version_validity": 0.05,
    "enterprise_ownership": 0.05,
}


def freshness_score(document_date_iso: str | None, max_age_days: int = 730) -> float:
    if not document_date_iso:
        return 0.4  # unknown age — penalized but not zeroed
    try:
        doc_date = datetime.fromisoformat(document_date_iso).replace(tzinfo=timezone.utc)
    except ValueError:
        return 0.4
    age_days = (datetime.now(timezone.utc) - doc_date).days
    if age_days < 0:
        return 1.0
    return max(0.0, 1.0 - (age_days / max_age_days))


def metadata_completeness_score(metadata: dict, required_fields: list[str]) -> float:
    if not required_fields:
        return 1.0
    present = sum(1 for f in required_fields if metadata.get(f))
    return present / len(required_fields)


def compute_trust_score(payload: dict) -> dict:
    source_category = payload["source_category"]
    org_id = payload.get("org_id", "shared")
    document_date = payload.get("document_date")
    reference_count = payload.get("scientific_reference_count", 0)
    reviewer_approved = payload.get("reviewer_approved", False)
    metadata = payload.get("metadata", {})
    required_fields = payload.get("required_metadata_fields", [])
    is_version_conflict = payload.get("is_version_conflict", False)
    is_enterprise_owned = payload.get("is_enterprise_owned", org_id != "shared" or source_category.startswith("internal"))

    components = {
        "source_authority": base_trust(source_category) / 100,
        "freshness": freshness_score(document_date),
        "scientific_references": min(1.0, reference_count / 5),
        "reviewer_approval": 1.0 if reviewer_approved else 0.3,
        "metadata_completeness": metadata_completeness_score(metadata, required_fields),
        "consistency": 0.0 if is_version_conflict else 1.0,
        "version_validity": 0.0 if is_version_conflict else 1.0,
        "enterprise_ownership": 1.0 if is_enterprise_owned else 0.5,
    }

    weighted_score = sum(components[k] * WEIGHTS[k] for k in WEIGHTS)
    final_score = round(weighted_score * 100, 2)

    return {
        "source_category": source_category,
        "trust_tier": tier(source_category),
        "org_id": org_id,
        "components": {k: round(v, 3) for k, v in components.items()},
        "trust_score": final_score,
        "publishing_eligible": final_score >= 70,
        "requires_human_review": final_score < 85,
        "computed_at": time.time(),
    }


@app.route("/api/v1/knowledge/trust-score", methods=["POST"])
def trust_score_endpoint():
    payload = request.get_json(force=True)
    if "source_category" not in payload:
        return jsonify({"error": "source_category is required"}), 400
    return jsonify(compute_trust_score(payload))


@app.route("/healthz", methods=["GET"])
def healthz():
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
