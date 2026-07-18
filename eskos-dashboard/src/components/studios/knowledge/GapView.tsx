"use client";

import React from "react";
import { HelpCircle } from "lucide-react";

export default function GapView() {
  const gaps = [
    { query: "high-temperature pressure reactors", count: 12, category: "reactors", severity: "HIGH" },
    { query: "quartz distillation columns", count: 7, category: "distillation", severity: "MEDIUM" },
    { query: "fluoropolymer lined beakers", count: 3, category: "beakers", severity: "LOW" },
  ];

  return (
    <div className="p-6 space-y-6 bg-background text-foreground h-full overflow-y-auto select-none">
      <div>
        <h1 className="text-xl font-semibold text-slate-100 font-sans tracking-wide">Knowledge Gap Analysis</h1>
        <p className="text-xs text-muted-foreground mt-1 font-sans">Inspect unanswered search queries and identify product specifications lacking sufficient context coverage.</p>
      </div>

      <div className="space-y-4">
        {gaps.map((gap) => (
          <div key={gap.query} className="bg-card border border-border p-5 rounded-lg flex justify-between items-center font-sans text-xs">
            <div className="space-y-1.5">
              <div className="flex items-center space-x-2">
                <HelpCircle className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-slate-200">{gap.query}</span>
              </div>
              <p className="text-xs text-muted-foreground font-mono">Suggested category partition: <span className="text-slate-300 font-semibold">{gap.category}</span></p>
            </div>
            
            <div className="flex items-center space-x-4 font-mono text-[10px]">
              <span className="text-muted-foreground">{gap.count} failed queries</span>
              <span className={`px-2 py-0.5 rounded font-bold border ${
                gap.severity === "HIGH" 
                  ? "border-red-500/20 text-red-400 bg-red-500/5" 
                  : gap.severity === "MEDIUM"
                  ? "border-amber-500/20 text-amber-400 bg-amber-500/5"
                  : "border-slate-500/20 text-slate-400 bg-slate-500/5"
              }`}>
                {gap.severity} PRIORITY
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
