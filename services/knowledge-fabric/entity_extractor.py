import re
import spacy
from typing import List, Dict, Any

try:
    nlp = spacy.load("en_core_web_sm")
except Exception:
    nlp = None

# Custom regex extractors for scientific concepts
SCIENTIFIC_PATTERNS = {
    "standard": [
        r"\b(ASTM\s+[A-Z0-9\-]+)\b",
        r"\b(ISO\s+[A-Z0-9\-]+)\b",
        r"\b(IS\s+\d+)\b",  # Bureau of Indian Standards
    ],
    "measurement": [
        r"\b(\d+(?:\.\d+)?\s*(?:mm|cm|m|ml|l|L|g|kg|°C|K|psi|bar))\b",
    ],
    "material": [
        r"\b(borosilicate(?:\s+glass)?(?:\s+3\.3)?)\b",
        r"\b(soda-lime(?:\s+glass)?)\b",
        r"\b(quartz(?:\s+glass)?)\b",
        r"\b(ptfe|polytetrafluoroethylene|teflon)\b",
        r"\b(polypropylene|pp|polyethylene|pe)\b",
    ],
    "chemical": [
        r"\b(water|h2o|acid|base|reagent|solvent|ethanol|methanol|acetone)\b",
    ]
}

# Pre-defined domain term lists
GOEL_PRODUCTS = {
    "condenser", "liebig condenser", "graham condenser", "allihn condenser", "dimroth condenser", "coil condenser",
    "flask", "round bottom flask", "flat bottom flask", "conical flask", "volumetric flask", "kjeldahl flask",
    "beaker", "griffin beaker", "tall form beaker",
    "cylinder", "measuring cylinder", "graduated cylinder",
    "burette", "pipette", "funnel", "test tube", "petri dish", "distillation apparatus",
    "heating mantle", "stirrer", "stopcock", "joint", "interchangeable joint"
}

GOEL_APPLICATIONS = {
    "distillation", "reflux", "extraction", "titration", "filtration", "evaporation",
    "heating", "cooling", "mixing", "synthesis", "organic chemistry", "laboratory"
}

def extract_entities(text: str, org_id: str) -> List[Dict[str, Any]]:
    entities = []
    text_lower = text.lower()
    
    # 1. Regex Extraction
    for etype, patterns in SCIENTIFIC_PATTERNS.items():
        for pat in patterns:
            for match in re.finditer(pat, text, re.IGNORECASE):
                val = match.group(1).strip()
                # Deduplicate same offsets
                if not any(e["start"] == match.start() for e in entities):
                    entities.append({
                        "name": val,
                        "entity_type": etype,
                        "start": match.start(),
                        "end": match.end(),
                        "confidence": 0.95
                    })

    # 2. Dictionary Lookup
    # Search for products
    for product in GOEL_PRODUCTS:
        # Avoid matching partial words
        pattern = r"\b" + re.escape(product) + r"s?\b"
        for match in re.finditer(pattern, text_lower):
            start, end = match.span()
            if not any(e["start"] <= start and e["end"] >= end for e in entities):
                # Map to proper capitalized name or original match
                original_match = text[start:end]
                entities.append({
                    "name": original_match,
                    "entity_type": "product",
                    "start": start,
                    "end": end,
                    "confidence": 0.9
                })

    # Search for applications
    for app in GOEL_APPLICATIONS:
        pattern = r"\b" + re.escape(app) + r"s?\b"
        for match in re.finditer(pattern, text_lower):
            start, end = match.span()
            if not any(e["start"] <= start and e["end"] >= end for e in entities):
                original_match = text[start:end]
                entities.append({
                    "name": original_match,
                    "entity_type": "application",
                    "start": start,
                    "end": end,
                    "confidence": 0.85
                })

    # 3. spaCy fallback for General Named Entities (Org, Person, GPE)
    if nlp:
        doc = nlp(text)
        for ent in doc.ents:
            if ent.label_ in ("ORG", "PERSON", "GPE", "DATE"):
                start, end = ent.start_char, ent.end_char
                if not any(e["start"] <= start and e["end"] >= end for e in entities):
                    etype_map = {
                        "ORG": "organization",
                        "PERSON": "person",
                        "GPE": "location",
                        "DATE": "date"
                    }
                    entities.append({
                        "name": ent.text,
                        "entity_type": etype_map.get(ent.label_, "general"),
                        "start": start,
                        "end": end,
                        "confidence": 0.8
                    })

    # Final formatting
    final_entities = []
    seen = set()
    for ent in entities:
        key = (ent["name"].lower(), ent["entity_type"])
        if key not in seen:
            seen.add(key)
            final_entities.append({
                "entity_id": f"{ent['entity_type']}:{re.sub(r'[^a-z0-9]+', '_', ent['name'].lower())}",
                "name": ent["name"],
                "entity_type": ent["entity_type"],
                "org_id": org_id,
                "confidence": ent["confidence"]
            })
            
    return final_entities
