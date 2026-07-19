"use client";

import React, { useState } from "react";
import { GitBranch, Compass, Search, ShieldCheck, UserCheck, Info, Database, Eye } from "lucide-react";
import DataStateBadge from "@/components/ui/DataStateBadge";

interface ProvenanceNode {
  id: string;
  step: string;
  agentOrSource: string;
  details: string;
  timestamp: string;
  status: "success" | "warning";
}

const SEED_NODES: ProvenanceNode[] = [
  { id: "prov-1", step: "User Query Input", agentOrSource: "External API Route", details: "Inquiry: What reactors are available for high temperature work?", timestamp: new Date(Date.now() - 300000).toISOString(), status: "success" },
  { id: "prov-2", step: "Agent Planning Strategy", agentOrSource: "Orchestrator Agent", details: "Decomposed prompt: Identified Goel tenant schema reactors", timestamp: new Date(Date.now() - 250000).toISOString(), status: "success" },
  { id: "prov-3", step: "Knowledge Context RAG", agentOrSource: "Qdrant Vector Cluster", details: "Matched 4 segments with average confidence 86.4%", timestamp: new Date(Date.now() - 200000).toISOString(), status: "success" },
  { id: "prov-4", step: "Neo4j Relation Walk", agentOrSource: "Graph Database", details: "Extracted 12 nodes (Material: Borosilicate, Organization: Goel)", timestamp: new Date(Date.now() - 150000).toISOString(), status: "success" },
  { id: "prov-5", step: "Compliance Scrubbing", agentOrSource: "Compliance Guard", details: "Scrubbed cross-brand leakage. Zero Borosil specs detected.", timestamp: new Date(Date.now() - 100000).toISOString(), status: "success" },
  { id: "prov-6", step: "Proposed Document Draft", agentOrSource: "Synthesis Agent", details: "Compiled draft-72b1cc.md containing verified specifications", timestamp: new Date(Date.now() - 50000).toISOString(), status: "success" },
  { id: "prov-7", step: "Human Decision Ledger", agentOrSource: "Human Supervisor", details: "Receipt a8ef21cb8b77a020cc8129ffb19b66a4f901ab8872e11 approved", timestamp: new Date().toISOString(), status: "success" }
];

export default function ProvenanceView() {
  const [selectedNode, setSelectedNode] = useState<ProvenanceNode | null>(SEED_NODES[0]);

  return (
    <div className="p-6 space-y-6 bg-background text-foreground h-full overflow-y-auto select-none">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-3">
          <h1 className="text-xl font-semibold text-slate-100 font-sans tracking-wide">Provenance Explorer</h1>
          <DataStateBadge state="simulated" />
        </div>
        <p className="text-xs text-muted-foreground mt-1 font-sans">
          Trace content lineage, generation paths, source materials, and security logs for audited document assets.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[450px]">
        {/* Left/Center: Lineage Timeline Visualizer */}
        <div className="lg:col-span-2 border border-border bg-card/20 rounded-lg p-6 relative overflow-hidden flex flex-col justify-center">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.03),rgba(255,255,255,0))]" />
          
          <div className="relative flex flex-col space-y-6 pl-6 border-l border-border/80 max-w-xl mx-auto z-10 py-4">
            {SEED_NODES.map((node, index) => {
              const isSelected = selectedNode?.id === node.id;
              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  className="relative group cursor-pointer"
                >
                  {/* Timeline dot */}
                  <div className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 transition-all flex items-center justify-center ${
                    isSelected
                      ? "bg-primary border-primary ring-4 ring-primary/25"
                      : "bg-background border-border group-hover:border-slate-500"
                  }`}>
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>

                  {/* Content card */}
                  <div className={`p-4 border rounded-lg transition-all ${
                    isSelected
                      ? "bg-card border-primary text-foreground"
                      : "bg-card/45 border-border hover:border-slate-700 text-muted-foreground hover:text-foreground"
                  }`}>
                    <div className="flex justify-between items-center text-[10px] font-mono">
                      <span className="font-semibold text-slate-300 font-sans uppercase tracking-wider">{node.step}</span>
                      <span>Step {index + 1}</span>
                    </div>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="text-xs font-bold text-slate-200 font-mono">{node.agentOrSource}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Sidebar: Details Inspector */}
        <div className="lg:col-span-1 border border-border bg-card/30 p-5 rounded-lg flex flex-col space-y-4">
          <span className="text-[10px] font-bold text-slate-200 uppercase tracking-widest font-mono flex items-center space-x-1.5">
            <Compass className="w-3.5 h-3.5 text-primary" />
            <span>Lineage Inspector</span>
          </span>

          {selectedNode ? (
            <div className="space-y-4 text-xs font-sans">
              <div>
                <span className="text-slate-300 font-semibold text-[11px] uppercase tracking-wider">{selectedNode.step}</span>
                <div className="text-[10px] text-muted-foreground mt-1">Source Agent / Provider</div>
                <div className="text-slate-200 font-mono font-bold mt-0.5">{selectedNode.agentOrSource}</div>
              </div>

              <div className="h-px bg-border" />

              <div className="space-y-2">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider font-mono">Detailed Activity Log</span>
                <p className="text-slate-300 leading-relaxed font-mono text-[11px] bg-background/50 border border-border p-3 rounded">
                  {selectedNode.details}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider font-mono">Timestamp</span>
                <div className="text-slate-400 font-mono">{new Date(selectedNode.timestamp).toLocaleString()}</div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider font-mono">Status Check</span>
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded border border-emerald-500/20 text-emerald-400 bg-emerald-500/5 text-[9px] font-bold font-mono">
                  <ShieldCheck className="w-3 h-3" />
                  <span>VERIFIED</span>
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 space-y-2 text-muted-foreground text-xs font-sans text-center">
              <Info className="w-6 h-6 text-border" />
              <p>Select a lineage step to inspect activity details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
