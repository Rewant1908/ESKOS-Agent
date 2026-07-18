import express from "express";
import { runAgentChat } from "./gemini/agentLoop";
import { resolveOrgId, resolveCallerId } from "./guardrails/orgScope";

const app = express();
app.use(express.json({ limit: "1mb" }));

const PORT = process.env.PORT || 8091;

app.get("/healthz", (_req, res) => res.json({ status: "ok" }));

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
    res.json({
      reply: result.reply,
      session_id: actualSessionId,
      tool_calls: result.toolCallsMade,
      dropped_context_chunks: result.droppedContextChunks,
      blocked_input: result.blockedInput,
      org_id: orgId,
    });
  } catch (err: any) {
    console.error("[agent-runtime] chat error:", err);
    res.status(500).json({ error: "agent execution failed", detail: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`[agent-runtime] listening on :${PORT}`);
  console.log(`[agent-runtime] Kong base: ${process.env.KONG_BASE_URL || "http://kong:8000"}`);
});
