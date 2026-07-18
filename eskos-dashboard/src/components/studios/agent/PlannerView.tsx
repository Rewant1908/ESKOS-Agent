"use client";

import React from "react";
import { ArrowRight, Play } from "lucide-react";

export default function PlannerView() {
  const steps = [
    { id: "step-1", agent: "planner", task: "Analyze incoming query request & resolve schema parameters" },
    { id: "step-2", agent: "researcher", task: "Execute dynamic hybrid vector-graph query against knowledge base" },
    { id: "step-3", agent: "compliance", task: "Scrub RAG chunks for injection signals & dual-brand isolation" },
    { id: "step-4", agent: "planner", task: "Synthesize response context with precise mathematical grounding" }
  ];

  return (
    <div className="p-6 space-y-6 bg-background text-foreground h-full overflow-y-auto select-none">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-xl font-semibold text-slate-100 font-sans tracking-wide">Multi-Agent Planner</h1>
          <p className="text-xs text-muted-foreground mt-1 font-sans">Inspect the high-level task planner steps and decomposition strategy used to resolve complex queries.</p>
        </div>
        <button className="flex items-center space-x-1.5 px-3 py-1.5 bg-primary hover:bg-primary/95 text-white text-[10px] uppercase font-bold tracking-wider rounded transition-all cursor-pointer font-sans">
          <Play className="w-3.5 h-3.5" />
          <span>Execute Test Run</span>
        </button>
      </div>

      <div className="bg-card border border-border rounded-lg p-6 space-y-8 min-h-[400px] flex flex-col justify-center">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-3">
          {steps.map((step, idx) => (
            <React.Fragment key={step.id}>
              {/* Step box */}
              <div className="w-64 bg-background border border-border p-4 rounded-lg flex flex-col space-y-3 relative group hover:border-primary/50 transition-colors">
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span className="text-primary font-bold uppercase tracking-wider">{step.agent}</span>
                  <span className="text-muted-foreground">{step.id}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">{step.task}</p>
              </div>

              {/* Arrow spacer */}
              {idx < steps.length - 1 && (
                <div className="text-muted-foreground flex justify-center rotate-90 lg:rotate-0">
                  <ArrowRight className="w-5 h-5 text-border" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
