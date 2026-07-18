"use client";

import React, { useState, useEffect } from "react";
import { 
  GitMerge, Play, RotateCcw, Trash2, Settings, Plus, Info, 
  Database, ShieldCheck, Cpu, CheckCircle2, UserCheck, Search, HelpCircle, Save, Loader2 
} from "lucide-react";

interface WorkflowNode {
  id: string;
  type: "ingest" | "rag" | "graph" | "compliance" | "synthesis" | "human";
  label: string;
  x: number;
  y: number;
  params: {
    model?: string;
    temperature?: number;
    safetyThreshold?: string;
    retries?: number;
    requireAllApprovals?: boolean;
    graphRepulsion?: number;
  };
}

interface WorkflowTemplate {
  name: string;
  description: string;
  nodes: WorkflowNode[];
}

const TEMPLATES: Record<string, WorkflowTemplate> = {
  rag: {
    name: "Standard RAG Search",
    description: "Multi-stage vector search pipeline with safety validation and response synthesis.",
    nodes: [
      { id: "node-1", type: "ingest", label: "Query Ingestion", x: 50, y: 150, params: { retries: 3 } },
      { id: "node-2", type: "rag", label: "Vector Index Lookup", x: 230, y: 50, params: { model: "gemini-3.1-flash-lite", temperature: 0.1 } },
      { id: "node-3", type: "compliance", label: "Guardrail Compliance", x: 410, y: 150, params: { safetyThreshold: "HIGH" } },
      { id: "node-4", type: "synthesis", label: "Gemini Synthesis", x: 590, y: 150, params: { model: "gemini-3.1-flash-lite", temperature: 0.4 } }
    ]
  },
  dual_brand: {
    name: "Dual-Brand Auditor",
    description: "Strict isolation consensus checking for Borosil vs Goel Scientific product datasheets.",
    nodes: [
      { id: "node-1", type: "ingest", label: "Query Ingestion", x: 50, y: 150, params: { retries: 3 } },
      { id: "node-2", type: "rag", label: "Vector Search", x: 220, y: 50, params: { model: "gemini-3.1-flash-lite", temperature: 0.1 } },
      { id: "node-3", type: "graph", label: "Neo4j Relation Walk", x: 220, y: 250, params: { graphRepulsion: 150 } },
      { id: "node-4", type: "compliance", label: "Cross-Pollination Check", x: 410, y: 150, params: { safetyThreshold: "STRICT" } },
      { id: "node-5", type: "human", label: "Admin Override Panel", x: 590, y: 150, params: { requireAllApprovals: true } }
    ]
  }
};

const NODE_INFO = {
  ingest: { icon: Cpu, color: "text-blue-400 border-blue-500/20 bg-blue-500/5", desc: "Captures and normalizes incoming prompts." },
  rag: { icon: Search, color: "text-amber-400 border-amber-500/20 bg-amber-500/5", desc: "Performs dense semantic lookup on Qdrant." },
  graph: { icon: Database, color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5", desc: "Extracts Neo4j relation graph tuples." },
  compliance: { icon: ShieldCheck, color: "text-red-400 border-red-500/20 bg-red-500/5", desc: "Filters context injection & dual-brand leakage." },
  synthesis: { icon: CheckCircle2, color: "text-purple-400 border-purple-500/20 bg-purple-500/5", desc: "Generates structured final reply via Gemini." },
  human: { icon: UserCheck, color: "text-pink-400 border-pink-500/20 bg-pink-500/5", desc: "Pauses loop for human supervisor sign-off." }
};

export default function WorkflowBuilderView() {
  const [nodes, setNodes] = useState<WorkflowNode[]>(TEMPLATES.rag.nodes);
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [activeTemplate, setActiveTemplate] = useState<string>("rag");
  
  // Simulation States
  const [simulationStatus, setSimulationStatus] = useState<"idle" | "running" | "completed">("idle");
  const [currentNodeIdx, setCurrentNodeIdx] = useState<number>(-1);
  const [simLogs, setSimLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState<number>(0);
  const [saving, setSaving] = useState<boolean>(false);

  const selectTemplate = (key: string) => {
    setNodes(TEMPLATES[key].nodes);
    setActiveTemplate(key);
    setSelectedNode(null);
    resetSimulation();
  };

  const updateNodeParam = (nodeId: string, paramKey: string, val: any) => {
    setNodes(prev => prev.map(n => {
      if (n.id === nodeId) {
        return {
          ...n,
          params: { ...n.params, [paramKey]: val }
        };
      }
      return n;
    }));
    
    setSelectedNode(prev => {
      if (prev && prev.id === nodeId) {
        return {
          ...prev,
          params: { ...prev.params, [paramKey]: val }
        };
      }
      return prev;
    });
  };

  const addNode = (type: keyof typeof NODE_INFO) => {
    const newId = `node-${Date.now()}`;
    const labels: Record<string, string> = {
      ingest: "Input Capture",
      rag: "Vector Search",
      graph: "Graph Matcher",
      compliance: "Auditor Guard",
      synthesis: "LLM Compiler",
      human: "Intervention Gate"
    };

    // Auto-calculate position based on node count
    const lastNode = nodes[nodes.length - 1];
    const x = lastNode ? lastNode.x + 160 : 100;
    const y = 150;

    const newNode: WorkflowNode = {
      id: newId,
      type,
      label: labels[type],
      x,
      y,
      params: type === "rag" || type === "synthesis" 
        ? { model: "gemini-3.1-flash-lite", temperature: 0.2 } 
        : type === "compliance"
        ? { safetyThreshold: "MEDIUM" }
        : type === "human"
        ? { requireAllApprovals: false }
        : type === "graph"
        ? { graphRepulsion: 120 }
        : { retries: 3 }
    };

    setNodes(prev => [...prev, newNode]);
    setSelectedNode(newNode);
  };

  const deleteNode = (id: string) => {
    setNodes(prev => prev.filter(n => n.id !== id));
    if (selectedNode && selectedNode.id === id) {
      setSelectedNode(null);
    }
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      alert("Workflow configuration saved successfully to DB Registry!");
    }, 1200);
  };

  // Run Simulation
  const startSimulation = () => {
    resetSimulation();
    setSimulationStatus("running");
  };

  const resetSimulation = () => {
    setSimulationStatus("idle");
    setCurrentNodeIdx(-1);
    setSimLogs([]);
    setProgress(0);
  };

  useEffect(() => {
    if (simulationStatus !== "running") return;

    if (currentNodeIdx === -1) {
      setSimLogs(["[SYSTEM] Initializing Agent Studio Simulation Orchestrator..."]);
      setCurrentNodeIdx(0);
      setProgress(5);
      return;
    }

    if (currentNodeIdx >= nodes.length) {
      setSimulationStatus("completed");
      setProgress(100);
      setSimLogs(prev => [...prev, "[SYSTEM] Orchestration complete. Workflow verified successfully! ✅"]);
      return;
    }

    const currentNode = nodes[currentNodeIdx];
    const timer = setTimeout(() => {
      const logsMap: Record<string, string[]> = {
        ingest: [
          `[${currentNode.label}] Capturing search query from channel proxy...`,
          `[${currentNode.label}] Prompt parameters sanitized. Retries set to: ${currentNode.params.retries || 3}`
        ],
        rag: [
          `[${currentNode.label}] Initiating semantic lookups on Qdrant...`,
          `[${currentNode.label}] Matches retrieved. Top-k score threshold: 0.81. Model: ${currentNode.params.model || "gemini-3.1-flash-lite"}`
        ],
        graph: [
          `[${currentNode.label}] Running relation walks on Neo4j cluster...`,
          `[${currentNode.label}] Matched 18 neighbor entity clusters (repulsion coefficient: ${currentNode.params.graphRepulsion || 120})`
        ],
        compliance: [
          `[${currentNode.label}] Executing dual-brand leakage inspection rules...`,
          `[${currentNode.label}] Compliance rules passed. Safety guard level: ${currentNode.params.safetyThreshold || "MEDIUM"}`
        ],
        synthesis: [
          `[${currentNode.label}] Invoking Gemini generating service using model: ${currentNode.params.model || "gemini-3.1-flash-lite"}`,
          `[${currentNode.label}] Synthesizing complete scientific documentation report context.`
        ],
        human: [
          `[${currentNode.label}] System check paused. Intercepting execution for approval...`,
          `[${currentNode.label}] Manual bypass confirmed by Administrator supervisor context.`
        ]
      };

      setSimLogs(prev => [...prev, ...logsMap[currentNode.type]]);
      setCurrentNodeIdx(prev => prev + 1);
      setProgress(Math.round(((currentNodeIdx + 1) / nodes.length) * 95));
    }, 1500);

    return () => clearTimeout(timer);
  }, [simulationStatus, currentNodeIdx]);

  return (
    <div className="p-6 space-y-6 bg-background text-foreground h-full overflow-y-auto select-none flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-xl font-semibold text-slate-100 font-sans tracking-wide">Orchestration & Workflow Builder</h1>
          <p className="text-xs text-muted-foreground mt-1 font-sans">
            Build, edit, and orchestrate custom multi-agent processing pipelines using state machine graphs.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-card border border-border hover:bg-muted text-muted-foreground hover:text-foreground text-[10px] uppercase font-bold tracking-wider rounded transition-all cursor-pointer font-sans disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>Save Config</span>
          </button>
          
          {simulationStatus === "running" ? (
            <button
              onClick={resetSimulation}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-red-950/20 border border-red-500/30 text-red-400 text-[10px] uppercase font-bold tracking-wider rounded transition-all cursor-pointer font-sans"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Run</span>
            </button>
          ) : (
            <button
              onClick={startSimulation}
              disabled={nodes.length === 0}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-primary hover:bg-primary/90 text-white text-[10px] uppercase font-bold tracking-wider rounded transition-all cursor-pointer font-sans disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Simulate Orchestrator</span>
            </button>
          )}
        </div>
      </div>

      {/* Templates Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(TEMPLATES).map(([key, value]) => (
          <div
            key={key}
            onClick={() => selectTemplate(key)}
            className={`p-4 border rounded-lg cursor-pointer transition-all ${
              activeTemplate === key 
                ? "border-primary bg-primary/5 text-primary" 
                : "border-border bg-card/50 text-muted-foreground hover:border-slate-700"
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-200 font-sans">{value.name}</span>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border border-current ${
                activeTemplate === key ? "text-primary bg-primary/5" : "text-slate-500 bg-slate-500/5"
              }`}>
                {activeTemplate === key ? "ACTIVE" : "USE"}
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed font-sans">{value.description}</p>
          </div>
        ))}
      </div>

      {/* Workspace Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-[400px]">
        {/* Left: Toolbox */}
        <div className="lg:col-span-1 border border-border bg-card/30 p-4 rounded-lg flex flex-col space-y-3 h-full">
          <span className="text-[10px] font-bold text-slate-200 uppercase tracking-widest font-mono">Orchestrator Toolbox</span>
          <p className="text-[10px] text-muted-foreground leading-relaxed font-sans">Click to insert tool nodes into active workflow:</p>
          
          <div className="space-y-2 pt-2">
            {Object.entries(NODE_INFO).map(([type, info]) => {
              const Icon = info.icon;
              return (
                <button
                  key={type}
                  onClick={() => addNode(type as any)}
                  className="w-full flex items-center justify-between p-2.5 border border-border bg-card hover:bg-muted/50 rounded text-left transition-all text-xs"
                >
                  <div className="flex items-center space-x-2">
                    <Icon className={`w-4 h-4 ${info.color.split(" ")[0]}`} />
                    <span className="font-semibold text-slate-300 font-sans uppercase tracking-wider text-[10px]">
                      {type}
                    </span>
                  </div>
                  <Plus className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Center: Canvas */}
        <div className="lg:col-span-2 border border-border bg-card/10 rounded-lg p-6 relative overflow-hidden flex flex-col justify-center min-h-[300px]">
          {/* Grid Background */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.05),rgba(255,255,255,0))]" />
          
          {nodes.length === 0 ? (
            <div className="flex flex-col items-center justify-center space-y-2 text-muted-foreground font-sans z-10">
              <GitMerge className="w-8 h-8 text-border animate-pulse mb-2" />
              <p className="text-xs">No active workflow configured.</p>
              <p className="text-[10px] text-slate-500">Insert custom steps from the toolbox to start.</p>
            </div>
          ) : (
            <div className="relative w-full h-full flex flex-wrap items-center justify-center gap-6 z-10">
              {nodes.map((node, idx) => {
                const info = NODE_INFO[node.type];
                const Icon = info.icon;
                const isActive = simulationStatus === "running" && currentNodeIdx === idx;
                const isCompleted = simulationStatus === "running" && currentNodeIdx > idx;

                return (
                  <div key={node.id} className="flex items-center">
                    <div
                      onClick={() => setSelectedNode(node)}
                      className={`relative w-40 bg-card border rounded-lg p-3 cursor-pointer transition-all flex flex-col space-y-2 ${
                        selectedNode?.id === node.id 
                          ? "border-primary ring-1 ring-primary" 
                          : isActive
                          ? "border-emerald-500 ring-2 ring-emerald-500/30 animate-pulse"
                          : isCompleted
                          ? "border-emerald-700/60 opacity-80"
                          : "border-border hover:border-slate-600"
                      }`}
                    >
                      <div className="flex justify-between items-center text-[9px] font-mono">
                        <span className={`px-1.5 py-0.5 rounded border ${info.color} font-bold uppercase tracking-wider`}>
                          {node.type}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNode(node.id);
                          }}
                          className="text-muted-foreground hover:text-red-400 p-0.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Icon className={`w-4 h-4 shrink-0 ${info.color.split(" ")[0]}`} />
                        <span className="text-xs font-semibold text-slate-200 truncate font-sans">{node.label}</span>
                      </div>
                    </div>
                    
                    {/* SVG Connector Arrow */}
                    {idx < nodes.length - 1 && (
                      <div className="w-6 flex items-center justify-center text-muted-foreground">
                        <svg className="w-full h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="m12 5 7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Params Panel */}
        <div className="lg:col-span-1 border border-border bg-card/30 p-4 rounded-lg flex flex-col space-y-4">
          <span className="text-[10px] font-bold text-slate-200 uppercase tracking-widest font-mono">Parameters Inspector</span>
          
          {selectedNode ? (
            <div className="space-y-4 text-xs font-sans">
              <div>
                <span className="text-slate-300 font-semibold uppercase text-[10px] tracking-wider">
                  {selectedNode.label}
                </span>
                <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
                  {NODE_INFO[selectedNode.type].desc}
                </p>
              </div>

              <div className="h-px bg-border" />

              {/* Ingest Params */}
              {selectedNode.type === "ingest" && (
                <div className="space-y-3">
                  <label className="block text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Retries Limit</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={selectedNode.params.retries || 3}
                    onChange={(e) => updateNodeParam(selectedNode.id, "retries", parseInt(e.target.value))}
                    className="w-full bg-background border border-border p-2 rounded text-slate-200 outline-none focus:border-primary font-mono"
                  />
                </div>
              )}

              {/* RAG & Synthesis Params */}
              {(selectedNode.type === "rag" || selectedNode.type === "synthesis") && (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Target LLM</label>
                    <select
                      value={selectedNode.params.model || "gemini-3.1-flash-lite"}
                      onChange={(e) => updateNodeParam(selectedNode.id, "model", e.target.value)}
                      className="w-full bg-background border border-border p-2 rounded text-slate-200 outline-none focus:border-primary font-mono text-xs"
                    >
                      <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite</option>
                      <option value="gemini-2.0-flash">gemini-2.0-flash</option>
                      <option value="gemini-3.5-flash">gemini-3.5-flash</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                      <span>Temperature</span>
                      <span className="font-mono text-primary font-bold">{selectedNode.params.temperature ?? 0.2}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1.0"
                      step="0.1"
                      value={selectedNode.params.temperature ?? 0.2}
                      onChange={(e) => updateNodeParam(selectedNode.id, "temperature", parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-background border-none rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {/* Graph Params */}
              {selectedNode.type === "graph" && (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                      <span>Graph Repulsion</span>
                      <span className="font-mono text-primary font-bold">{selectedNode.params.graphRepulsion ?? 120}</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="300"
                      step="10"
                      value={selectedNode.params.graphRepulsion ?? 120}
                      onChange={(e) => updateNodeParam(selectedNode.id, "graphRepulsion", parseInt(e.target.value))}
                      className="w-full h-1.5 bg-background border-none rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {/* Compliance Params */}
              {selectedNode.type === "compliance" && (
                <div className="space-y-3">
                  <label className="block text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Safety Threshold</label>
                  <select
                    value={selectedNode.params.safetyThreshold || "MEDIUM"}
                    onChange={(e) => updateNodeParam(selectedNode.id, "safetyThreshold", e.target.value)}
                    className="w-full bg-background border border-border p-2 rounded text-slate-200 outline-none focus:border-primary font-mono text-xs"
                  >
                    <option value="LOW">LOW (Audit check only)</option>
                    <option value="MEDIUM">MEDIUM (Filter obvious leaks)</option>
                    <option value="STRICT">STRICT (Block and scrub trace)</option>
                  </select>
                </div>
              )}

              {/* Human Gate Params */}
              {selectedNode.type === "human" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Dual Approval</span>
                    <input
                      type="checkbox"
                      checked={selectedNode.params.requireAllApprovals || false}
                      onChange={(e) => updateNodeParam(selectedNode.id, "requireAllApprovals", e.target.checked)}
                      className="w-4 h-4 rounded border-border outline-none accent-primary"
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 space-y-2 text-muted-foreground text-xs font-sans text-center">
              <Info className="w-6 h-6 text-border" />
              <p>No active node selected.</p>
              <p className="text-[10px] text-slate-500">Click a node on the canvas to configure parameters.</p>
            </div>
          )}
        </div>
      </div>

      {/* Simulator Logs Drawer */}
      <div className="border border-border bg-card/20 rounded-lg p-5 flex flex-col space-y-3 h-[180px]">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-bold text-slate-200 uppercase tracking-widest font-mono flex items-center space-x-1.5">
            <Cpu className="w-3.5 h-3.5 text-primary" />
            <span>Simulation Execution Log Output</span>
          </span>
          <div className="flex items-center space-x-3 text-[10px] font-mono">
            <span className="text-muted-foreground">Progress:</span>
            <span className="text-primary font-bold">{progress}%</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-background h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-primary h-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Terminal logs list */}
        <div className="flex-1 bg-black/40 border border-border/40 rounded p-3 overflow-y-auto font-mono text-[10px] text-emerald-400 space-y-1">
          {simLogs.length === 0 ? (
            <span className="text-slate-500 select-none">Orchestrator idle. Launch simulation to trace logic flow...</span>
          ) : (
            simLogs.map((log, index) => (
              <div key={index} className="leading-relaxed">
                {log}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
