/**
 * ESKOS Agent Tools — every tool call goes THROUGH Kong (never directly to a
 * backend service), so Phase 3's rate-limiting, CORS, and (once re-enabled)
 * auth plugins apply to agent traffic exactly like they apply to the dashboard.
 *
 * Hard rule enforced in this file, not left to the model's judgement:
 * org_id sent to every tool call comes from the server-side request context
 * (resolved from the authenticated caller), never from the model's own
 * tool-call arguments and never parsed out of the user's message text.
 * This is what actually prevents a Goel-scoped session from reading or
 * writing Borosil-tagged knowledge, regardless of what the user types.
 */

import axios from "axios";
import { appendPersistentMemory } from "../memory/persistentMemory";

const KONG_BASE_URL = process.env.KONG_BASE_URL || "http://kong:8000";

export interface ToolContext {
  orgId: "borosil-scientific" | "goel-scientific" | "shared";
  callerId: string; // resolved from auth, used for audit trail
}

// ── Tool schemas (Gemini function-calling format) ──────────────────────────

// Typed loosely (any[]) on purpose — the @google/generative-ai SDK's strict
// FunctionDeclaration type wants SchemaType enum values instead of raw JSON
// Schema strings, and fighting that mismatch isn't worth it here since this
// array is validated at runtime by the Gemini API itself.
export const TOOL_DECLARATIONS: any[] = [
  {
    name: "knowledge_context",
    description:
      "Retrieve formatted, LLM-ready context from the ESKOS Knowledge Fabric for a natural-language question. Use this first for any product/technical question.",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string", description: "The user's question, in natural language." },
        rag_type: {
          type: "string",
          enum: ["product", "scientific", "seo", "marketing", "competitor", "research", "support", "compliance"],
          description: "Which domain RAG to search. Default to 'product' for product questions.",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "knowledge_query",
    description:
      "Run a structured hybrid query (vector + graph) against the Knowledge Fabric when you need raw hits and graph relationships, not just prose context.",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string" },
        rag_type: { type: "string" },
      },
      required: ["query"],
    },
  },
  {
    name: "knowledge_entity_neighbors",
    description: "Fetch the graph neighbors of a known entity (product, material, application, standard) by its entity_id.",
    parameters: {
      type: "object",
      properties: {
        entity_id: { type: "string" },
      },
      required: ["entity_id"],
    },
  },
  {
    name: "trust_score_lookup",
    description: "Get the computed trust score / tier for a source category, to explain confidence in an answer.",
    parameters: {
      type: "object",
      properties: {
        source_category: { type: "string" },
      },
      required: ["source_category"],
    },
  },
  {
    name: "submit_governance_draft",
    description:
      "Submit a proposed content draft for HUMAN REVIEW. This does NOT publish anything. Use this when the user asks you to draft/write content, not when just answering a question.",
    parameters: {
      type: "object",
      properties: {
        title: { type: "string" },
        draft_text: { type: "string" },
        source_doc_ids: {
          type: "array",
          items: { type: "string" },
          description: "doc_ids of the knowledge sources this draft is grounded in — required for traceability.",
        },
      },
      required: ["title", "draft_text", "source_doc_ids"],
    },
  },
  {
    name: "remember_fact",
    description: "Persist an important fact or preference into the organization's long-term memory. This applies across all sessions for the current organization.",
    parameters: {
      type: "object",
      properties: {
        fact: { type: "string", description: "The fact to remember." },
      },
      required: ["fact"],
    },
  },
];

// Deliberately NOT exposed as a tool: approve/reject on governance drafts.
// That action stays exclusively behind the human-authenticated governance
// UI/API path — an autonomous agent must never be able to self-approve
// its own (or anyone else's) draft. See ESKOS Core Principle #5.

// ── Tool implementations ────────────────────────────────────────────────

export async function executeTool(name: string, args: Record<string, any>, ctx: ToolContext) {
  switch (name) {
    case "knowledge_context":
      return callKnowledgeFabric("/api/v1/knowledge/context", {
        query: args.query,
        org_id: ctx.orgId,
        rag_type: args.rag_type || "product",
      });

    case "knowledge_query":
      return callKnowledgeFabric("/api/v1/knowledge/query", {
        query: args.query,
        org_id: ctx.orgId,
        rag_type: args.rag_type || "product",
      });

    case "knowledge_entity_neighbors":
      return callKnowledgeFabricGet(`/api/v1/knowledge/entity/${encodeURIComponent(args.entity_id)}/neighbors`, {
        org_id: ctx.orgId,
      });

    case "trust_score_lookup":
      return callTrustScore(args.source_category, ctx.orgId);

    case "submit_governance_draft":
      return submitGovernanceDraft(args, ctx);

    case "remember_fact":
      appendPersistentMemory(ctx.orgId, args.fact);
      return { status: "success", memory_appended: true };

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

async function callKnowledgeFabric(path: string, body: Record<string, any>) {
  const { data } = await axios.post(`${KONG_BASE_URL}${path}`, body, { timeout: 10_000 });
  return data;
}

async function callKnowledgeFabricGet(path: string, params: Record<string, any>) {
  const { data } = await axios.get(`${KONG_BASE_URL}${path}`, { params, timeout: 10_000 });
  return data;
}

async function callTrustScore(sourceCategory: string, orgId: string) {
  const { data } = await axios.post(
    `${KONG_BASE_URL}/api/v1/knowledge/trust-score`,
    { source_category: sourceCategory, org_id: orgId },
    { timeout: 10_000 }
  );
  return data;
}

async function submitGovernanceDraft(args: Record<string, any>, ctx: ToolContext) {
  const { data } = await axios.post(
    `${KONG_BASE_URL}/api/v1/governance/drafts`,
    {
      title: args.title,
      draft_text: args.draft_text,
      source_doc_ids: args.source_doc_ids,
      org_id: ctx.orgId,
      submitted_by: `agent:${ctx.callerId}`,
      status: "pending_review",
    },
    { timeout: 10_000 }
  );
  return data;
}
