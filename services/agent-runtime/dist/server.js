"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const agentLoop_1 = require("./gemini/agentLoop");
const orgScope_1 = require("./guardrails/orgScope");
const app = (0, express_1.default)();
app.use(express_1.default.json({ limit: "1mb" }));
const PORT = process.env.PORT || 8091;
app.get("/healthz", (_req, res) => res.json({ status: "ok" }));
app.post("/api/v1/agent/chat", async (req, res) => {
    const { message } = req.body || {};
    if (!message || typeof message !== "string" || message.trim().length === 0) {
        return res.status(400).json({ error: "`message` (non-empty string) is required" });
    }
    if (message.length > 4000) {
        return res.status(400).json({ error: "message too long (max 4000 chars)" });
    }
    const orgId = (0, orgScope_1.resolveOrgId)(req);
    const callerId = (0, orgScope_1.resolveCallerId)(req);
    try {
        const result = await (0, agentLoop_1.runAgentChat)(message, { orgId, callerId });
        res.json({
            reply: result.reply,
            tool_calls: result.toolCallsMade,
            dropped_context_chunks: result.droppedContextChunks,
            blocked_input: result.blockedInput,
            org_id: orgId,
        });
    }
    catch (err) {
        console.error("[agent-runtime] chat error:", err);
        res.status(500).json({ error: "agent execution failed", detail: err.message });
    }
});
app.listen(PORT, () => {
    console.log(`[agent-runtime] listening on :${PORT}`);
    console.log(`[agent-runtime] Kong base: ${process.env.KONG_BASE_URL || "http://kong:8000"}`);
});
