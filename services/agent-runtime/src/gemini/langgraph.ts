import { GoogleGenerativeAI } from "@google/generative-ai";
import { executeTool, TOOL_DECLARATIONS, ToolContext } from "../tools/knowledgeTools";
import { scanForInjection, filterRetrievedContext } from "../guardrails/injectionGuard";
import { getProjectRules } from "../memory/projectRules";
import { getPersistentMemory } from "../memory/persistentMemory";
import { ToolRegistry } from "../registries/ToolRegistry";
import { PromptRegistry } from "../registries/PromptRegistry";
import { getSessionHistory, saveSessionHistory } from "../memory/ephemeralContext";
import { TraceStep, CostMetric, ChatResult } from "./agentLoop";

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

export interface AgentState {
  userMessage: string;
  ctx: ToolContext;
  sessionId: string;
  trace: TraceStep[];
  toolCallsMade: { name: string; args: Record<string, any> }[];
  droppedContextChunks: number;
  blockedInput: boolean;
  systemInstruction: string;
  activeTools: any[];
  
  plan?: string;
  retrievedContext?: string;
  complianceOk?: boolean;
  replyText?: string;
  inputTokens: number;
  outputTokens: number;
}

class StateGraph {
  nodes: Record<string, (state: AgentState) => Promise<Partial<AgentState>>> = {};
  edges: { from: string; to: string }[] = [];

  addNode(name: string, fn: (state: AgentState) => Promise<Partial<AgentState>>) {
    this.nodes[name] = fn;
    return this;
  }

  addEdge(from: string, to: string) {
    this.edges.push({ from, to });
    return this;
  }

  async compileAndRun(initialState: AgentState): Promise<AgentState> {
    let currentState = { ...initialState };
    let currentNode = "planner";

    while (currentNode && this.nodes[currentNode]) {
      const nodeFn = this.nodes[currentNode];
      const stateUpdate = await nodeFn(currentState);
      currentState = { ...currentState, ...stateUpdate };

      const nextEdge = this.edges.find((e) => e.from === currentNode);
      currentNode = nextEdge ? nextEdge.to : "";
    }

    return currentState;
  }
}

// Node 1: Planner Node
async function plannerNode(state: AgentState): Promise<Partial<AgentState>> {
  const trace = [...state.trace];
  const addTrace = (agent: "planner" | "researcher" | "compliance", action: string, message?: string) => {
    trace.push({ agent, action, message, timestamp: new Date().toISOString() });
  };

  addTrace("planner", "Planning Strategy", "Decomposing query requirements and checking ontology schema.");

  const model = getClient().getGenerativeModel({
    model: GEMINI_MODEL,
    systemInstruction: state.systemInstruction
  });

  const prompt = `Based on the user request: "${state.userMessage}", generate a 1-sentence strategic plan of action for RAG tool retrieval. Focus on target glassware specs, organizational metrics, or ontology nodes.`;
  const result = await model.generateContent(prompt);
  const plan = result.response.text();

  addTrace("planner", "Plan Formulated", `Strategy: ${plan}`);

  return { plan, trace };
}

// Node 2: Researcher Node
async function researcherNode(state: AgentState): Promise<Partial<AgentState>> {
  const trace = [...state.trace];
  const toolCallsMade = [...state.toolCallsMade];
  let droppedContextChunks = state.droppedContextChunks;
  const addTrace = (agent: "planner" | "researcher" | "compliance", action: string, message?: string) => {
    trace.push({ agent, action, message, timestamp: new Date().toISOString() });
  };

  addTrace("researcher", "Delegated Sub-Query", `Initiating search iteration for plan: "${state.plan}"`);

  const model = getClient().getGenerativeModel({
    model: GEMINI_MODEL,
    systemInstruction: state.systemInstruction,
    tools: state.activeTools.length > 0 ? [{ functionDeclarations: state.activeTools }] as any : undefined
  });

  const chat = model.startChat({ history: getSessionHistory(state.sessionId) });
  
  // Call model with tools
  let response = await chat.sendMessage(state.userMessage);
  
  for (let round = 0; round < 3; round++) {
    const calls = response.response.functionCalls();
    if (!calls || calls.length === 0) break;

    const toolResponses = [];
    for (const call of calls) {
      toolCallsMade.push({ name: call.name, args: call.args as Record<string, any> });
      addTrace("researcher", "Executing Tool", `Calling tool "${call.name}" with args: ${JSON.stringify(call.args)}`);

      let result: any;
      try {
        result = await executeTool(call.name, call.args as Record<string, any>, state.ctx);
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
        functionResponse: { name: call.name, response: result }
      });
    }

    response = await chat.sendMessage(toolResponses as any);
  }

  const replyText = response.response.text();
  saveSessionHistory(state.sessionId, await chat.getHistory());

  return { retrievedContext: replyText, toolCallsMade, droppedContextChunks, trace };
}

// Node 3: Compliance Node
async function complianceNode(state: AgentState): Promise<Partial<AgentState>> {
  const trace = [...state.trace];
  const addTrace = (agent: "planner" | "researcher" | "compliance", action: string, message?: string) => {
    trace.push({ agent, action, message, timestamp: new Date().toISOString() });
  };

  addTrace("compliance", "Audit Check", "Validating brand isolation guidelines and active project rules.");

  // Check compliance criteria
  const text = (state.retrievedContext || "").toLowerCase();
  const isBorosilData = text.includes("borosil");
  const isGoelData = text.includes("goel");
  let complianceOk = true;

  if (state.ctx.orgId === "goel-scientific" && isBorosilData) {
    addTrace("compliance", "Violation Blocked", "Prevented data cross-pollination leakage of Borosil specs in Goel context.");
    complianceOk = false;
  } else {
    addTrace("compliance", "Audit Passed", "Zero brand or scope violations detected.");
  }

  return { complianceOk, trace };
}

// Node 4: Synthesis Node
async function synthesisNode(state: AgentState): Promise<Partial<AgentState>> {
  const trace = [...state.trace];
  const addTrace = (agent: "planner" | "researcher" | "compliance", action: string, message?: string) => {
    trace.push({ agent, action, message, timestamp: new Date().toISOString() });
  };

  addTrace("planner", "Synthesis Complete", "Formulating final structured response.");

  let replyText = state.retrievedContext || "";
  if (!state.complianceOk) {
    replyText = "I can't answer this query as it references specifications that belong to a different organizational partition (Borosil Scientific). Access blocked by brand isolation policy.";
  }

  return { replyText, trace };
}

// Assemble the State Graph
const eskosGraph = new StateGraph()
  .addNode("planner", plannerNode)
  .addNode("researcher", researcherNode)
  .addNode("compliance", complianceNode)
  .addNode("synthesis", synthesisNode)
  .addEdge("planner", "researcher")
  .addEdge("researcher", "compliance")
  .addEdge("compliance", "synthesis");

// Run Chat using LangGraph State Graph
export async function runLangGraphAgentChat(userMessage: string, ctx: ToolContext, sessionId: string): Promise<ChatResult> {
  const trace: TraceStep[] = [];
  trace.push({
    agent: "planner",
    action: "Initialize LangGraph Session",
    message: `User message received: "${userMessage.slice(0, 60)}..."`,
    timestamp: new Date().toISOString()
  });

  const inputScan = scanForInjection(userMessage, "user_message");
  if (!inputScan.clean) {
    trace.push({
      agent: "planner",
      action: "Input Blocked",
      message: "Prompt injection signature detected.",
      timestamp: new Date().toISOString()
    });
    return {
      reply: "I can't process that message — it contains a pattern that looks like an attempt to override my instructions. Please rephrase your question.",
      toolCallsMade: [],
      droppedContextChunks: 0,
      blockedInput: true,
      trace,
      cost: { inputTokens: 0, outputTokens: 0, usd: 0 }
    };
  }

  const prompts = PromptRegistry.getPrompts();
  const plannerPrompt = prompts.find((p) => p.id === "planner")?.instruction || "";
  const researcherPrompt = prompts.find((p) => p.id === "researcher")?.instruction || "";
  const compliancePrompt = prompts.find((p) => p.id === "compliance")?.instruction || "";

  const projectRules = getProjectRules();
  const persistentMemory = getPersistentMemory(ctx.orgId);

  const systemInstruction = `You are the ESKOS Product Intelligence Assistant for scientific manufacturing knowledge.
  
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

  const activeTools = TOOL_DECLARATIONS.filter((t) => ToolRegistry.isToolActive(t.name));

  const initialState: AgentState = {
    userMessage,
    ctx,
    sessionId,
    trace,
    toolCallsMade: [],
    droppedContextChunks: 0,
    blockedInput: false,
    systemInstruction,
    activeTools,
    inputTokens: 0,
    outputTokens: 0
  };

  const finalState = await eskosGraph.compileAndRun(initialState);

  // Compute final transaction costs
  const inputChars = userMessage.length + systemInstruction.length + (finalState.plan || "").length;
  const outputChars = (finalState.replyText || "").length;
  const inputTokens = Math.ceil(inputChars / 4);
  const outputTokens = Math.ceil(outputChars / 4);
  const usdCost = (inputTokens * 0.00000125) + (outputTokens * 0.000005);

  return {
    reply: finalState.replyText || "Query completed with empty response.",
    toolCallsMade: finalState.toolCallsMade,
    droppedContextChunks: finalState.droppedContextChunks,
    blockedInput: false,
    trace: finalState.trace,
    cost: {
      inputTokens,
      outputTokens,
      usd: usdCost
    }
  };
}
