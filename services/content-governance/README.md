# ESKOS Content Governance Service

Enforces human-in-the-loop review for all agent-generated content before
it can be published. Implements the ESKOS Core Principle: "Human experts
govern before publication."

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/v1/governance/drafts` | **API Key required** | Submit a new draft for review |
| `GET` | `/api/v1/governance/drafts` | Public | List drafts (filterable by status) |
| `POST` | `/api/v1/governance/review` | **API Key required** | Approve or reject a draft |
| `GET` | `/api/v1/governance/audit` | Public | Retrieve audit log entries |

## Authentication

Governance **write** routes (`POST /drafts` and `POST /review`) are protected
by Kong's `key-auth` plugin. All requests to these endpoints must include
a valid API key in the `apikey` header:

```bash
curl -X POST http://localhost:8000/api/v1/governance/review \
  -H "Content-Type: application/json" \
  -H "apikey: <YOUR_GOVERNANCE_API_KEY>" \
  -d '{"draft_id": "...", "reviewer_id": "...", "decision": "APPROVED"}'
```

### Provisioned Consumer

| Consumer | Key (placeholder) | Notes |
|----------|-------------------|-------|
| `governance-reviewer` | `eskos-gov-key-CHANGE-ME-b4f92a71c8` | **Replace before production** — this is a placeholder key defined in `gateway/kong/kong.yml` |

> **Security note**: The placeholder key in `kong.yml` must be rotated before
> any production deployment. Store the real key in a secrets manager and
> inject it via environment variable or volume mount at deploy time.

## Review Endpoint — Request Body

The review endpoint (`POST /api/v1/governance/review`) expects a JSON body:

```json
{
  "draft_id": "string",
  "reviewer_id": "string",
  "decision": "APPROVED | REJECTED",
  "comments": "optional string"
}
```

Note: `draft_id` is passed in the request body (not the URL path) to avoid
Kong route path collisions with the draft submission endpoint.
