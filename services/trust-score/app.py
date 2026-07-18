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
import os
import json
import redis

from tiers import base_trust, tier, SOURCE_TRUST_TABLE

app = Flask(__name__)

REDIS_URL = os.environ.get("REDIS_URL", "redis://redis:6379/0")
try:
    r_client = redis.from_url(REDIS_URL)
except Exception as e:
    print(f"[trust-score] Redis connection failed: {e}", flush=True)
    r_client = None

DEFAULT_WEIGHTS = {
    "source_authority": 0.30,
    "freshness": 0.15,
    "scientific_references": 0.10,
    "reviewer_approval": 0.20,
    "metadata_completeness": 0.10,
    "consistency": 0.05,
    "version_validity": 0.05,
    "enterprise_ownership": 0.05,
}

def get_weights() -> dict:
    if r_client:
        try:
            cached = r_client.get("trust_score:weights")
            if cached:
                return json.loads(cached)
        except Exception as e:
            print(f"[trust-score] Redis get_weights error: {e}", flush=True)
    return DEFAULT_WEIGHTS

def set_weights(weights: dict) -> None:
    if r_client:
        try:
            r_client.set("trust_score:weights", json.dumps(weights))
        except Exception as e:
            print(f"[trust-score] Redis set_weights error: {e}", flush=True)

def get_source_trust_table() -> dict:
    if r_client:
        try:
            cached = r_client.get("trust_score:source_trust")
            if cached:
                return json.loads(cached)
        except Exception as e:
            print(f"[trust-score] Redis get_source_trust error: {e}", flush=True)
    return SOURCE_TRUST_TABLE

def set_source_trust_table(table: dict) -> None:
    if r_client:
        try:
            r_client.set("trust_score:source_trust", json.dumps(table))
        except Exception as e:
            print(f"[trust-score] Redis set_source_trust error: {e}", flush=True)



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

    source_table = get_source_trust_table()
    source_authority = source_table.get(source_category, 20)
    weights = get_weights()

    components = {
        "source_authority": source_authority / 100,
        "freshness": freshness_score(document_date),
        "scientific_references": min(1.0, reference_count / 5),
        "reviewer_approval": 1.0 if reviewer_approved else 0.3,
        "metadata_completeness": metadata_completeness_score(metadata, required_fields),
        "consistency": 0.0 if is_version_conflict else 1.0,
        "version_validity": 0.0 if is_version_conflict else 1.0,
        "enterprise_ownership": 1.0 if is_enterprise_owned else 0.5,
    }

    weighted_score = sum(components[k] * weights[k] for k in weights)
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


@app.route("/api/v1/knowledge/trust-score/config", methods=["GET", "POST"])
def trust_score_config_endpoint():
    if request.method == "GET":
        return jsonify({
            "weights": get_weights(),
            "source_trust": get_source_trust_table()
        })
    else:
        payload = request.get_json(force=True)
        if "weights" in payload:
            weights = payload["weights"]
            total = sum(weights.values())
            # Guard against invalid weight distributions
            if abs(total - 1.0) > 0.01:
                return jsonify({"error": f"Weight configuration must sum to exactly 1.0, got {total:.2f}"}), 400
            set_weights(weights)
        if "source_trust" in payload:
            set_source_trust_table(payload["source_trust"])
        return jsonify({"status": "success", "message": "Trust configuration updated."})



@app.route("/api/v1/metrics/seo", methods=["POST"])
def seo_metrics_endpoint():
    payload = request.get_json(force=True)
    content = payload.get("content", "")
    target_keywords = payload.get("keywords", [])
    
    if not content or not target_keywords:
        return jsonify({"error": "content and keywords are required"}), 400
        
    content_lower = content.lower()
    keyword_hits = {}
    
    for kw in target_keywords:
        kw_lower = kw.lower()
        count = content_lower.count(kw_lower)
        keyword_hits[kw] = count
        
    word_count = len(content.split())
    if word_count == 0:
        return jsonify({"seo_score": 0.0, "details": "empty content"})
        
    total_keyword_matches = sum(keyword_hits.values())
    keyword_density = total_keyword_matches / word_count
    
    # Ideal keyword density for SEO is roughly 1-3%. 
    # Let's map density to a 0-100 score. 0.02 is ideal (100).
    if keyword_density == 0:
        score = 0.0
    elif keyword_density <= 0.03:
        score = (keyword_density / 0.02) * 100
        score = min(100.0, score)
    else:
        # Penalize for keyword stuffing
        score = max(0.0, 100.0 - ((keyword_density - 0.03) * 1000))
        
    return jsonify({
        "seo_score": round(score, 2),
        "keyword_density": round(keyword_density, 4),
        "word_count": word_count,
        "keyword_hits": keyword_hits
    })

@app.route("/healthz", methods=["GET"])
def healthz():
    return jsonify({"status": "ok"})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
