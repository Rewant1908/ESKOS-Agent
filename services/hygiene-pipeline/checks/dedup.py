"""§17 Duplicate Detection — exact hash + SimHash for near-duplicate/revision detection.

Uses Redis as the LSH-lite index: stores recent SimHashes and does a Hamming-distance
scan against a bounded recent window. For production scale beyond a few hundred thousand
docs/day, swap the Redis scan for a proper LSH index (e.g. bucketed SimHash banding).
"""

import hashlib
import re

import redis

SIMHASH_BITS = 64
EXACT_DUP_KEY_PREFIX = "dedup:exact:"
SIMHASH_SET_KEY = "dedup:simhash:index"  # hash -> doc_id
NEAR_DUP_HAMMING_THRESHOLD = 3   # bits differing, out of 64 — near-duplicate
REVISION_HAMMING_THRESHOLD = 10  # looser bound — likely a revised version, not identical


def exact_hash(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def _tokenize(text: str) -> list[str]:
    return re.findall(r"[a-z0-9]+", text.lower())


def _feature_hash(token: str) -> int:
    return int(hashlib.md5(token.encode("utf-8")).hexdigest(), 16) & ((1 << SIMHASH_BITS) - 1)


def simhash(text: str) -> int:
    weights = [0] * SIMHASH_BITS
    for token in _tokenize(text):
        h = _feature_hash(token)
        for bit in range(SIMHASH_BITS):
            weights[bit] += 1 if (h >> bit) & 1 else -1
    fingerprint = 0
    for bit in range(SIMHASH_BITS):
        if weights[bit] > 0:
            fingerprint |= 1 << bit
    return fingerprint


def hamming_distance(a: int, b: int) -> int:
    return bin(a ^ b).count("1")


def check(text: str, doc_id: str, org_id: str, r: redis.Redis) -> dict:
    exact = exact_hash(text)
    exact_key = f"{EXACT_DUP_KEY_PREFIX}{org_id}:{exact}"

    existing_exact = r.get(exact_key)
    if existing_exact:
        return {
            "check": "dedup",
            "verdict": "flag",
            "relationship": "exact_duplicate",
            "matches_doc_id": existing_exact.decode(),
            "reason": "identical content already ingested for this org",
        }

    fp = simhash(text)
    closest = None
    closest_distance = SIMHASH_BITS + 1

    # Bounded scan of recent fingerprints for this org (dev-scale; see docstring for prod note)
    index_key = f"{SIMHASH_SET_KEY}:{org_id}"
    for existing_doc_id, existing_fp_hex in r.hgetall(index_key).items():
        existing_fp = int(existing_fp_hex, 16)
        dist = hamming_distance(fp, existing_fp)
        if dist < closest_distance:
            closest_distance = dist
            closest = existing_doc_id.decode() if isinstance(existing_doc_id, bytes) else existing_doc_id

    # Register this document regardless of outcome (needed for future comparisons)
    r.set(exact_key, doc_id, ex=60 * 60 * 24 * 90)
    r.hset(index_key, doc_id, format(fp, "x"))

    if closest and closest_distance <= NEAR_DUP_HAMMING_THRESHOLD:
        return {
            "check": "dedup",
            "verdict": "flag",
            "relationship": "near_duplicate",
            "matches_doc_id": closest,
            "hamming_distance": closest_distance,
            "reason": "near-identical content — likely duplicate submission",
        }

    if closest and closest_distance <= REVISION_HAMMING_THRESHOLD:
        return {
            "check": "dedup",
            "verdict": "route_to_merge_candidate",
            "relationship": "possible_revision",
            "matches_doc_id": closest,
            "hamming_distance": closest_distance,
            "reason": "similar but not identical — route to Knowledge Fabric as a version candidate, not a straight reject",
        }

    return {"check": "dedup", "verdict": "pass", "relationship": "unique", "simhash": format(fp, "x")}
