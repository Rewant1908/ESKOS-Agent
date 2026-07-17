"""§16 Semantic Spam Detection.

This is a HEURISTIC placeholder, explicitly called out in the README as a stub.
Replace `classify()` with a call to a quantized local SLM once you have labeled
examples of accepted vs. rejected ESKOS documents to fine-tune/calibrate against.
Keeping the interface identical means swapping the implementation later doesn't
touch any calling code.
"""

import re
from collections import Counter

# Rough scientific/industrial domain vocabulary — used only to flag content that
# looks completely off-domain (e.g. generic marketing fluff, unrelated spam).
# This is NOT the source of truth for taxonomy — Phase 2's ontology owns that.
DOMAIN_SIGNAL_TERMS = {
    "specification", "material", "borosilicate", "astm", "iso", "tolerance",
    "laboratory", "calibration", "dimension", "capacity", "temperature",
    "compliance", "standard", "certification", "application", "assembly",
    "compatibility", "procedure", "reagent", "apparatus", "glassware",
}

AI_BOILERPLATE_PHRASES = [
    "as an ai language model", "in today's fast-paced world", "unlock the power of",
    "in conclusion, it is clear that", "revolutionize your", "game-changing solution",
]


def keyword_stuffing_score(text: str) -> float:
    words = re.findall(r"[a-z]+", text.lower())
    if len(words) < 20:
        return 0.0
    counts = Counter(words)
    top_word, top_count = counts.most_common(1)[0]
    return top_count / len(words)  # >0.08 on a single non-stopword term is suspicious


def off_domain_score(text: str) -> float:
    words = set(re.findall(r"[a-z]+", text.lower()))
    if not words:
        return 1.0
    overlap = len(words & DOMAIN_SIGNAL_TERMS)
    # Not finding domain terms doesn't guarantee spam (a valid SOP might use different
    # vocabulary) — this score should always be combined with other checks, never
    # used alone to reject.
    return max(0.0, 1.0 - (overlap / 5))


def ai_boilerplate_score(text: str) -> float:
    lowered = text.lower()
    hits = sum(1 for phrase in AI_BOILERPLATE_PHRASES if phrase in lowered)
    return min(1.0, hits * 0.3)


def classify(text: str) -> dict:
    stuffing = keyword_stuffing_score(text)
    off_domain = off_domain_score(text)
    boilerplate = ai_boilerplate_score(text)

    composite = round((stuffing * 2 + off_domain + boilerplate * 1.5) / 4.5, 3)
    verdict = "flag" if composite > 0.55 else "pass"

    return {
        "check": "semantic_spam",
        "verdict": verdict,
        "scores": {
            "keyword_stuffing": round(stuffing, 3),
            "off_domain_probability": round(off_domain, 3),
            "ai_boilerplate": round(boilerplate, 3),
            "composite": composite,
        },
        "reason": "composite semantic-spam score above threshold" if verdict == "flag" else None,
        "note": "heuristic placeholder — replace with local SLM classifier per README",
    }
