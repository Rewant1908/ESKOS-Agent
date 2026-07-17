"""§15 Structural Validation — a document claiming to be `document_type: X`
must contain the section headers X is expected to have. Mismatch = flag,
not automatic rejection (goes to pre-flight schema validation for the final call)."""

import re

# Minimum required structural sections per declared document_type.
# Matched case-insensitively against extracted headers/section titles.
STRUCTURE_REQUIREMENTS = {
    "research_paper": ["abstract", "introduction", "methodology", "results", "references"],
    "product_datasheet": ["product name", "specifications", "applications", "dimensions", "material"],
    "sop": ["purpose", "scope", "procedure", "responsibilities"],
    "compliance_certificate": ["standard", "certification body", "validity", "scope"],
}


def extract_headers(raw_text: str) -> list[str]:
    """Naive header extraction — markdown-style or ALL-CAPS lines.
    Swap for a real document-structure parser (e.g. from the docx/pdf extraction step)
    once this sits behind real ingestion rather than raw text."""
    headers = []
    for line in raw_text.splitlines():
        stripped = line.strip()
        if not stripped:
            continue
        if stripped.startswith("#") or (stripped.isupper() and len(stripped.split()) <= 8):
            headers.append(re.sub(r"^#+\s*", "", stripped).lower())
    return headers


def validate(raw_text: str, declared_document_type: str) -> dict:
    required = STRUCTURE_REQUIREMENTS.get(declared_document_type)
    if not required:
        return {
            "check": "structural_validation",
            "verdict": "skip",
            "reason": f"no structure rules defined for document_type={declared_document_type}",
        }

    headers = extract_headers(raw_text)
    header_blob = " ".join(headers)
    missing = [section for section in required if section not in header_blob]

    verdict = "pass" if not missing else "flag"
    return {
        "check": "structural_validation",
        "verdict": verdict,
        "declared_type": declared_document_type,
        "missing_sections": missing,
        "reason": f"missing required sections: {missing}" if missing else None,
    }
