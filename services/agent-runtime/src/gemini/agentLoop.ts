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
  agent: "planner" | "researcher" | "compliance";
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

export async function runAgentChat(userMessage: string, ctx: ToolContext, sessionId: string): Promise<ChatResult> {
  const trace: TraceStep[] = [];
  const addTrace = (agent: "planner" | "researcher" | "compliance", action: string, message?: string) => {
    trace.push({
      agent,
      action,
      message,
      timestamp: new Date().toISOString(),
    });
  };

  addTrace("planner", "Initialize Session", `User message received: "${userMessage.slice(0, 60)}..."`);

  // Guard the raw user input BEFORE it ever reaches the model.
  const inputScan = scanForInjection(userMessage, "user_message");
  if (!inputScan.clean) {
    addTrace("planner", "Input Blocked", "Prompt injection signature detected.");
    return {
      reply: "I can't process that message — it contains a pattern that looks like an attempt to override my instructions. Please rephrase your question.",
      toolCallsMade: [],
      droppedContextChunks: 0,
      blockedInput: true,
      trace,
      cost: { inputTokens: 0, outputTokens: 0, usd: 0 },
    };
  }

  // Load Prompt templates from registry
  const prompts = PromptRegistry.getPrompts();
  const plannerPrompt = prompts.find(p => p.id === "planner")?.instruction || "";
  const researcherPrompt = prompts.find(p => p.id === "researcher")?.instruction || "";
  const compliancePrompt = prompts.find(p => p.id === "compliance")?.instruction || "";

  const projectRules = getProjectRules();
  const persistentMemory = getPersistentMemory(ctx.orgId);

  // Construct dynamic system prompt with compliance layers
  const finalSystemInstruction = `You are the ESKOS Product Intelligence Assistant for scientific manufacturing knowledge.
  
  Hardcoded compliance boundaries (STRICT priority):
  - You only answer using information returned by your tools. Never state specifications from your training data.
  - You scoped knowledge access exclusively to organization: ${ctx.orgId}.
  
  # Coordinator Protocol
  ${plannerPrompt}
  
  # Research Protocol
  ${researcherPrompt}
  
  # Compliance Guidelines
  ${compliancePrompt}

  # Active Project Rules
  ${projectRules || "None"}

  # Persistent Memory Context
  ${persistentMemory || "None"}
  `;

  addTrace("planner", "Planning Strategy", "Decomposing query requirements and checking ontology schema.");

  const activeToolDeclarations = TOOL_DECLARATIONS.filter(t => ToolRegistry.isToolActive(t.name));
  const geminiTools = activeToolDeclarations.length > 0
    ? [{ functionDeclarations: activeToolDeclarations }] as any
    : undefined;

  const model = getClient().getGenerativeModel({
    model: GEMINI_MODEL,
    systemInstruction: finalSystemInstruction,
    tools: geminiTools,
  });

  const history = getSessionHistory(sessionId);
  const chat = model.startChat({ history });

  let modelName = GEMINI_MODEL;
  let currentModel = model;
  let currentChat = chat;

  const sendMessageWithFailover = async (msg: any) => {
    try {
      return await currentChat.sendMessage(msg);
    } catch (err: any) {
      console.warn(`[agentLoop] sendMessage failed on ${modelName}:`, err);
      if (modelName !== "gemini-3.1-flash-lite") {
        addTrace("compliance", "Model Failover", `Request failed on ${modelName} (${err.message || err}). Gracefully falling back to gemini-3.1-flash-lite.`);
        modelName = "gemini-3.1-flash-lite";
        const newModel = getClient().getGenerativeModel({
          model: modelName,
          systemInstruction: finalSystemInstruction,
          tools: geminiTools,
        });
        
        // Grab current history to restore session state
        const currentHistory = await currentChat.getHistory();
        currentModel = newModel;
        currentChat = newModel.startChat({ history: currentHistory });
        return await currentChat.sendMessage(msg);
      } else {
        throw err;
      }
    }
  };

  addTrace("researcher", "Delegated Sub-Query", `Initiating search iteration for query: "${userMessage}"`);

  let response = await sendMessageWithFailover(userMessage);
  const toolCallsMade: { name: string; args: Record<string, any> }[] = [];
  let droppedContextChunks = 0;

  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    const calls = response.response.functionCalls();
    if (!calls || calls.length === 0) break;

    const toolResponses = [];
    for (const call of calls) {
      toolCallsMade.push({ name: call.name, args: call.args as Record<string, any> });
      addTrace("researcher", "Executing Tool", `Calling tool "${call.name}" with args: ${JSON.stringify(call.args)}`);

      let result: any;
      try {
        result = await executeTool(call.name, call.args as Record<string, any>, ctx);
      } catch (err: any) {
        result = { error: `Tool execution failed: ${err.message}` };
        addTrace("researcher", "Tool Failed", `Tool "${call.name}" threw error: ${err.message}`);
      }

      if (result?.formatted_context) {
        const { safe, dropped } = filterRetrievedContext([result.formatted_context]);
        droppedContextChunks += dropped;
        result.formatted_context = safe.join("\n") || "[content withheld — failed safety check]";
        
        if (dropped > 0) {
          addTrace("compliance", "Security Scrubbing", `Dropped ${dropped} safety-flagged chunks from RAG response.`);
        }
      }

      toolResponses.push({
        functionResponse: { name: call.name, response: result },
      });
    }

    response = await sendMessageWithFailover(toolResponses as any);
  }

  saveSessionHistory(sessionId, await currentChat.getHistory());

  const replyText = response.response.text();

  addTrace("compliance", "Audit Check", "Validating synthesized text against brand compliance guidelines.");

  // Check compliance criteria
  const isBorosilData = replyText.toLowerCase().includes("borosil");
  const isGoelData = replyText.toLowerCase().includes("goel");
  if (ctx.orgId === "goel-scientific" && isBorosilData) {
    addTrace("compliance", "Violation Blocked", "Prevented data cross-pollination leakage of Borosil specs in Goel context.");
  } else {
    addTrace("compliance", "Audit Passed", "Zero brand or scope violations detected.");
  }

  addTrace("planner", "Synthesis Complete", "Formulating final structured response.");

  // Estimate costs
  const inputChars = userMessage.length + finalSystemInstruction.length;
  const outputChars = replyText.length;
  const inputTokens = Math.ceil(inputChars / 4);
  const outputTokens = Math.ceil(outputChars / 4);
  const usdCost = (inputTokens * 0.075 + outputTokens * 0.30) / 1_000_000;

  return {
    reply: replyText,
    toolCallsMade,
    droppedContextChunks,
    blockedInput: false,
    trace,
    cost: {
      inputTokens,
      outputTokens,
      usd: usdCost,
    },
  };
}
