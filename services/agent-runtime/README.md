# ESKOS Agent Runtime v2 — Replacement

This replaces `services/agent-runtime/` entirely. It does NOT reuse, import, or
depend on anything from the old `src/AgentTool/` folder — delete that folder
(and its `built-in/` subfolder) when you swap this in.

## What it actually does (unlike the old stub)

The old `index.ts` printed a hardcoded fake response. This one runs a real
Gemini function-calling loop:

```
User message
  -> input injection scan (blocks obvious override attempts before the model ever sees them)
  -> Gemini decides which tool(s) to call (knowledge_context, knowledge_query,
     knowledge_entity_neighbors, trust_score_lookup, submit_governance_draft)
  -> each tool call goes through Kong (http://kong:8000), not directly to a backend service
  -> retrieved context is scanned again before being handed back to the model
  -> Gemini produces a grounded answer citing what the tools returned
```

## Deliberately NOT a tool: approve/reject governance drafts

The agent can *submit* a draft for review. It can never approve or publish
one — that stays behind the human-authenticated governance path. This mirrors
ESKOS's own stated principle: "Human experts govern before publication."
If you ever feel tempted to add an `approve_draft` tool for convenience,
don't — that's the one line this system shouldn't let an LLM cross on its own.

## Required wiring before this is usable end-to-end

1. **Add a Kong route** for `/api/v1/agent/chat` -> `http://agent-runtime:8091`,
   same pattern as the other services in `gateway/kong/kong.yml`. Rate-limit
   it — a chat endpoint calling an LLM per request is the most expensive
   route in the system, don't leave it unlimited.
2. **Fix `docker-compose.yml`**: the `agent-runtime` service currently has no
   `ports:` mapping and no build pointing at this folder — update it to build
   `./services/agent-runtime` (this replacement) and expose `8091`.
3. **`resolveOrgId` is a placeholder** (see `src/guardrails/orgScope.ts`) —
   it trusts an `x-eskos-org-id` header. That's fine for local dev with the
   dashboard setting it explicitly, but it is NOT real auth. Once Kong
   key-auth/OIDC is wired in (still an open item from Phase 3), replace this
   with a real lookup against the authenticated session/consumer.
4. **Set `GEMINI_MODEL`** — defaults to `gemini-3.5-flash` in
   `src/gemini/agentLoop.ts`, but verify against Google's current model list
   before relying on that default; model identifiers change over time.

## Testing locally without Docker

```bash
cd services/agent-runtime
npm install
GEMINI_API_KEY=xxx KONG_BASE_URL=http://localhost:8000 npm run dev

curl -X POST http://localhost:8091/api/v1/agent/chat \
  -H 'Content-Type: application/json' \
  -H 'x-eskos-org-id: goel-scientific' \
  -d '{"message": "What condensers does Goel Scientific sell?"}'
```
