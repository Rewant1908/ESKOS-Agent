import { GoogleGenerativeAI } from "@google/generative-ai";
import { TOOL_DECLARATIONS, executeTool, ToolContext } from "../tools/knowledgeTools";
import { scanForInjection, filterRetrievedContext } from "../guardrails/injectionGuard";
import { getProjectRules } from "../memory/projectRules";
import { getPersistentMemory } from "../memory/persistentMemory";
import { getSessionHistory, saveSessionHistory } from "../memory/ephemeralContext";
import { PromptRegistry } from "../registries/PromptRegistry";
import { ToolRegistry } from "../registries/ToolRegistry";

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash";

let genAI: GoogleGenerativeAI | null = null;
function getClient() {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY not set");
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

export interface TraceStep {
  agent: "planner" | "researcher" | "compliance" | "authoring" | "seo" | "competitive" | "monitoring" | "learning";
  action: string;
  message?: string;
  timestamp: string;
}

export interface CostMetric {
  inputTokens: number;
  outputTokens: number;
  usd: number;
}

export interface ChatResult {
  reply: string;
  toolCallsMade: { name: string; args: Record<string, any> }[];
  droppedContextChunks: number;
  blockedInput: boolean;
  trace: TraceStep[];
  cost: CostMetric;
}

const MAX_TOOL_ROUNDS = 5;

import { runLangGraphAgentChat } from "./langgraph";

export async function runAgentChat(userMessage: string, ctx: ToolContext, sessionId: string): Promise<ChatResult> {
  return runLangGraphAgentChat(userMessage, ctx, sessionId);
}
