"""§14 Entropy Analysis — detects repeated spam (very low entropy) and
corrupted/malicious payloads (very high entropy)."""

import math
from collections import Counter

LOW_ENTROPY_THRESHOLD = 2.5   # bits/char — likely keyword stuffing or boilerplate repetition
HIGH_ENTROPY_THRESHOLD = 7.8  # bits/char — likely binary corruption or random content


def shannon_entropy(text: str) -> float:
    if not text:
        return 0.0
    counts = Counter(text)
    length = len(text)
    return -sum((c / length) * math.log2(c / length) for c in counts.values())


def analyze(text: str) -> dict:
    entropy = shannon_entropy(text)
    verdict = "pass"
    reason = None

    if entropy < LOW_ENTROPY_THRESHOLD:
        verdict = "flag"
        reason = f"low_entropy ({entropy:.2f} bits/char) — likely repetitive spam/boilerplate"
    elif entropy > HIGH_ENTROPY_THRESHOLD:
        verdict = "flag"
        reason = f"high_entropy ({entropy:.2f} bits/char) — likely corrupted/binary payload"

    return {"check": "entropy", "verdict": verdict, "entropy_bits_per_char": round(entropy, 3), "reason": reason}
