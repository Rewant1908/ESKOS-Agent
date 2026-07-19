import express from "express";
import { runLangGraphAgentChat as runAgentChat } from "./gemini/langgraph";
import { resolveOrgId, resolveCallerId } from "./guardrails/orgScope";
import pool from "./db";
import { ToolRegistry } from "./registries/ToolRegistry";
import { PromptRegistry } from "./registries/PromptRegistry";
import { getProjectRules } from "./memory/projectRules";
import { getPersistentMemory } from "./memory/persistentMemory";

const app = express();
app.use(express.json({ limit: "1mb" }));

const PORT = process.env.PORT || 8091;

app.get("/healthz", (_req, res) => res.json({ status: "ok" }));

// ── Agent Chat ─────────────────────────────────────────────────────────────
app.post("/api/v1/agent/chat", async (req, res) => {
  const { message, session_id } = req.body || {};
  const actualSessionId = session_id || require('crypto').randomUUID();

  if (!message || typeof message !== "string" || message.trim().length === 0) {
    return res.status(400).json({ error: "`message` (non-empty string) is required" });
  }
  if (message.length > 4000) {
    return res.status(400).json({ error: "message too long (max 4000 chars)" });
  }

  const orgId = resolveOrgId(req);
  const callerId = resolveCallerId(req);

  try {
    const result = await runAgentChat(message, { orgId, callerId }, actualSessionId);

    const modelUsed = process.env.GEMINI_MODEL || "gemini-3.5-flash";
    pool.query(
      `INSERT INTO agent_runs
       (session_id, org_id, caller_id, query_text, reply_preview, trace,
        input_tokens, output_tokens, usd_cost, model, blocked_input)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        actualSessionId,
        orgId,
        callerId,
        message.slice(0, 500),
        (result.reply || "").slice(0, 300),
        JSON.stringify(result.trace || []),
        result.cost?.inputTokens || 0,
        result.cost?.outputTokens || 0,
        result.cost?.usd || 0,
        modelUsed,
        result.blockedInput || false,
      ]
    ).catch((err) => console.error("[agent-runtime] failed to log run:", err.message));

    res.json({
      reply: result.reply,
      session_id: actualSessionId,
      tool_calls: result.toolCallsMade,
      dropped_context_chunks: result.droppedContextChunks,
      blocked_input: result.blockedInput,
      org_id: orgId,
      trace: result.trace,
      cost: result.cost,
    });
  } catch (err: any) {
    console.error("[agent-runtime] chat error:", err);
    res.status(500).json({ error: "agent execution failed", detail: err.message });
  }
});

app.get("/api/v1/agent/chat", (_req, res) => {
  res.status(405).json({
    error: "Method Not Allowed",
    message: "GET is not supported for this endpoint. Please make a POST request with a JSON body containing `message` (and optionally `session_id`)."
  });
});


// ── Tool Registry ──────────────────────────────────────────────────────────
app.get("/api/v1/agent/tools", (_req, res) => {
  try {
    const tools = ToolRegistry.getTools();
    res.json({ status: "success", tools });
  } catch (err: any) {
    res.status(500).json({ error: "failed to retrieve tools", detail: err.message });
  }
});

app.post("/api/v1/agent/tools/toggle", (req, res) => {
  const { name, active } = req.body || {};
  if (!name || typeof active !== "boolean") {
    return res.status(400).json({ error: "name (string) and active (boolean) are required" });
  }
  try {
    const status = ToolRegistry.toggleTool(name, active);
    res.json({ status: "success", tool: name, active: status });
  } catch (err: any) {
    res.status(500).json({ error: "failed to toggle tool", detail: err.message });
  }
});

// ── Prompt Registry ────────────────────────────────────────────────────────
app.get("/api/v1/agent/prompts", (_req, res) => {
  try {
    const prompts = PromptRegistry.getPrompts();
    res.json({ status: "success", prompts });
  } catch (err: any) {
    res.status(500).json({ error: "failed to retrieve prompts", detail: err.message });
  }
});

app.post("/api/v1/agent/prompts", (req, res) => {
  const { id, instruction } = req.body || {};
  if (!id || !instruction || typeof instruction !== "string") {
    return res.status(400).json({ error: "id (string) and instruction (string) are required" });
  }
  try {
    PromptRegistry.updatePrompt(id, instruction);
    res.json({ status: "success", updated_prompt_id: id });
  } catch (err: any) {
    res.status(500).json({ error: "failed to update prompt", detail: err.message });
  }
});

// ── Memory and Rules Context (For UI Inspector) ────────────────────────────
app.get("/api/v1/agent/memory", (req, res) => {
  const orgId = resolveOrgId(req);
  try {
    const projectRules = getProjectRules();
    const persistentMemory = getPersistentMemory(orgId);
    res.json({
      status: "success",
      org_id: orgId,
      project_rules: projectRules || "No project rules configured.",
      persistent_memory: persistentMemory || "No persistent memories logged.",
    });
  } catch (err: any) {
    res.status(500).json({ error: "failed to retrieve memory details", detail: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`[agent-runtime] listening on :${PORT}`);
  console.log(`[agent-runtime] Kong base: ${process.env.KONG_BASE_URL || "http://kong:8000"}`);
});
