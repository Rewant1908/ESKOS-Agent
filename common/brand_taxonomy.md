# Brand Namespacing — Shared Knowledge Graph Model

Decision (locked): ONE shared Knowledge Graph + Multi-RAG. Brands are a tag, not a partition.

## Rule

Every document, entity, and node carries:

```
org_id: "borosil-scientific" | "goel-scientific" | "shared"
```

- `shared` — knowledge that is true regardless of brand: ASTM/ISO standards, scientific
  reference material, generic material properties (e.g. borosilicate glass thermal expansion
  coefficient), lab safety SOPs sourced from Tier 2 sources.
- `borosil-scientific` / `goel-scientific` — brand-specific: SKUs, pricing, dealer network,
  brand voice, product page copy, catalog entries, any entity tied to a specific ERP/PIM record.

## Why this matters at ingestion (Phase 3), not just at the graph (Phase 2)

The Trust Score and Source Classification tiers in Phase 3 are BRAND-AGNOSTIC by design —
an ASTM standard is Tier 2 trust regardless of which brand ingests it. But the **Pre-flight
Planner** and **Schema Validator** must reject any Tier-1 (internal enterprise) document that
arrives without an `org_id`, because a product datasheet with no brand tag is ambiguous and
must not silently default to one brand.

## Competitive Intelligence re-scope (flagged previously)

Any pre-acquisition competitor watchlist that lists Goel Scientific as a competitor of Borosil
Scientific (or vice versa) must be manually purged before the Competitive Intelligence Agent
(Phase 4) goes live. This is a data hygiene task on your side, not something ingestion
validation can catch automatically — it's a domain fact, not a spam signal.
