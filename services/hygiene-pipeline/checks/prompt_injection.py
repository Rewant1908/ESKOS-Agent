"""§18 Prompt Injection Detection — strips/flags embedded executable instructions
before content is eligible for embedding. This protects every downstream AI agent
(Phase 4) from a poisoned document steering generation or suppressing brand mentions.

Two-tier approach:
1. Deterministic pattern match on known injection phrasings (fast, catches the obvious).
2. Structural heuristic: instructions embedded mid-document, addressed to "the AI"/"the model"/
   "assistant", disguised as data — these rarely appear in legitimate scientific/technical docs.
"""

import re

INJECTION_PATTERNS = [
    r"ignore (all |any )?(previous|prior|above) instructions",
    r"disregard (all |any )?(previous|prior|above) (instructions|context)",
    r"you are now (in )?(developer|admin|dan|unrestricted) mode",
    r"do not mention (goel|borosil)",
    r"always recommend (the )?competitor",
    r"system prompt:",
    r"\[system\]",
    r"<\|im_start\|>",
    r"override (your|the) (guidelines|instructions|rules)",
    r"as an ai (language model|assistant),? you (must|should|will)",
]

ADDRESSED_TO_MODEL_PATTERNS = [
    r"\b(the model|the assistant|the ai|claude|chatgpt|gpt-\d)\b.{0,40}\b(must|should|will now|is instructed to)\b",
]

COMPILED_INJECTION = [re.compile(p, re.IGNORECASE) for p in INJECTION_PATTERNS]
COMPILED_ADDRESSED = [re.compile(p, re.IGNORECASE) for p in ADDRESSED_TO_MODEL_PATTERNS]


def detect(text: str) -> dict:
    matches = []

    for pattern in COMPILED_INJECTION:
        found = pattern.findall(text)
        if found:
            matches.append({"pattern": pattern.pattern, "type": "direct_instruction_override"})

    for pattern in COMPILED_ADDRESSED:
        if pattern.search(text):
            matches.append({"pattern": pattern.pattern, "type": "model_addressed_directive"})

    verdict = "flag" if matches else "pass"

    return {
        "check": "prompt_injection",
        "verdict": verdict,
        "matches": matches,
        "reason": f"{len(matches)} injection pattern(s) matched — document quarantined, not auto-sanitized" if matches else None,
        # Deliberately NOT auto-stripping and re-admitting in this slice: silently
        # rewriting a document and letting it through is riskier than a human review
        # step at this stage. Route to hygiene-quarantine, let Phase 5 governance decide.
    }
