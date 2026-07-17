"""§5 Source Classification + §27 Enterprise Trust Score table.
Brand-agnostic by design — an ASTM standard is Tier 2 regardless of org_id."""

SOURCE_TRUST_TABLE = {
    # Tier 1 — Internal Enterprise (highest trust)
    "internal_approved_manual": 100,
    "erp": 100,
    "engineering_database": 99,
    "internal_sop": 98,
    "laboratory_report": 97,

    # Tier 2 — Trusted Scientific Sources
    "astm": 99,
    "iso": 99,
    "government_standard": 96,
    "peer_reviewed_journal": 97,
    "university": 95,

    # Tier 3 — Business Intelligence (never overrides internal knowledge)
    "manufacturer_website": 90,
    "distributor_website": 78,
    "competitor_website": 75,
    "marketplace_listing": 65,

    # Tier 4 — Public Internet (lowest trust, highest verification bar)
    "industry_blog": 55,
    "forum": 30,
    "unknown_website": 20,
    "ai_generated_article": 15,
}

TIER_MAP = {
    "internal_approved_manual": 1, "erp": 1, "engineering_database": 1,
    "internal_sop": 1, "laboratory_report": 1,
    "astm": 2, "iso": 2, "government_standard": 2, "peer_reviewed_journal": 2, "university": 2,
    "manufacturer_website": 3, "distributor_website": 3, "competitor_website": 3, "marketplace_listing": 3,
    "industry_blog": 4, "forum": 4, "unknown_website": 4, "ai_generated_article": 4,
}


def base_trust(source_category: str) -> int:
    return SOURCE_TRUST_TABLE.get(source_category, 20)  # default to lowest-tier trust if unclassified


def tier(source_category: str) -> int:
    return TIER_MAP.get(source_category, 4)
