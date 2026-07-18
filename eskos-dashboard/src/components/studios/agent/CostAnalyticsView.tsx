"use client";

import React from "react";
import { CircleDollarSign, Compass } from "lucide-react";

export default function CostAnalyticsView() {
  return (
    <div className="p-6 space-y-6 bg-background text-foreground h-full overflow-y-auto select-none">
      <div>
        <h1 className="text-xl font-semibold text-slate-100 font-sans tracking-wide font-sans">Cost Analytics</h1>
        <p className="text-xs text-muted-foreground mt-1 font-sans">Analyze model API costs, token usage distributions, and operational spending.</p>
      </div>

      <div className="bg-card border border-border rounded-lg p-6 flex flex-col items-center justify-center space-y-4 min-h-[450px]">
        <div className="w-16 h-16 rounded-full bg-slate-800 border border-border flex items-center justify-center text-primary">
          <CircleDollarSign className="w-8 h-8" />
        </div>
        <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-widest font-sans">Token Cost Accounting</h3>
        <p className="text-xs text-muted-foreground max-w-sm text-center font-sans">
          This panel computes cumulative token volume usage charges for LLM operations.
        </p>
        <div className="flex items-center space-x-2 text-[10px] uppercase font-bold tracking-wider text-primary border border-primary/20 px-3 py-1.5 rounded bg-primary/5 font-sans mt-4">
          <Compass className="w-3.5 h-3.5" />
          <span>Awaiting database billing tracker integration</span>
        </div>
      </div>
    </div>
  );
}
