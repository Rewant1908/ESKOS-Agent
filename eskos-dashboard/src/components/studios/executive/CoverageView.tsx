"use client";

import React, { useState } from "react";
import { LayoutDashboard, RefreshCw, BarChart2, CheckCircle2, ShieldCheck, Database, HelpCircle, Info } from "lucide-react";

interface CoverageCategory {
  category: string;
  documentCount: number;
  chunkCount: number;
  coverageRatio: number;
  status: "COMPLETE" | "SPARSE" | "CRITICAL";
}

const SEED_COVERAGE: CoverageCategory[] = [
  { category: "Reactors & Vessels", documentCount: 4, chunkCount: 14, coverageRatio: 0.92, status: "COMPLETE" },
  { category: "Distillation Columns", documentCount: 3, chunkCount: 10, coverageRatio: 0.81, status: "COMPLETE" },
  { category: "Laboratory Glassware", documentCount: 2, chunkCount: 5, coverageRatio: 0.65, status: "SPARSE" },
  { category: "Industrial Condensers", documentCount: 1, chunkCount: 3, coverageRatio: 0.35, status: "CRITICAL" }
];

export default function CoverageView() {
  const [coverage, setCoverage] = useState<CoverageCategory[]>(SEED_COVERAGE);
  const [loading, setLoading] = useState(false);

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 500);
  };

  const totalDocuments = coverage.reduce((sum, item) => sum + item.documentCount, 0);
  const totalChunks = coverage.reduce((sum, item) => sum + item.chunkCount, 0);
  const avgCoverage = parseFloat((coverage.reduce((sum, item) => sum + item.coverageRatio, 0) / coverage.length * 100).toFixed(1));

  return (
    <div className="p-6 space-y-6 bg-background text-foreground h-full overflow-y-auto select-none">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-xl font-semibold text-slate-100 font-sans tracking-wide">Knowledge Coverage Maps</h1>
          <p className="text-xs text-muted-foreground mt-1 font-sans">
            Monitor topic coverage scores, documentation segment densities, and knowledge gap warning levels.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-card border border-border hover:bg-muted text-muted-foreground hover:text-foreground text-[10px] uppercase font-bold tracking-wider rounded transition-all cursor-pointer font-sans disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Coverage</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Coverage score */}
        <div className="bg-card border border-border p-5 rounded-lg flex items-center space-x-4">
          <div className="w-10 h-10 rounded bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest font-mono">Average Coverage Rating</span>
            <div className="text-lg font-bold font-mono text-slate-100">{avgCoverage}%</div>
          </div>
        </div>

        {/* Total Documents */}
        <div className="bg-card border border-border p-5 rounded-lg flex items-center space-x-4">
          <div className="w-10 h-10 rounded bg-blue-500/5 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Database className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest font-mono">Active Documents</span>
            <div className="text-lg font-bold font-mono text-slate-100">{totalDocuments} items</div>
          </div>
        </div>

        {/* Total Chunks */}
        <div className="bg-card border border-border p-5 rounded-lg flex items-center space-x-4">
          <div className="w-10 h-10 rounded bg-purple-500/5 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest font-mono">Active Chunk Segments</span>
            <div className="text-lg font-bold font-mono text-slate-100">{totalChunks} chunks</div>
          </div>
        </div>
      </div>

      {/* Grid of Coverage categories */}
      <div className="bg-card border border-border p-5 rounded-lg space-y-4">
        <span className="text-[10px] font-bold text-slate-200 uppercase tracking-widest font-mono flex items-center space-x-1.5">
          <BarChart2 className="w-3.5 h-3.5 text-primary" />
          <span>Documentation Category Heatmap Density</span>
        </span>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {coverage.map((c) => (
            <div key={c.category} className="border border-border/50 p-4 rounded-lg space-y-3 font-sans text-xs">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-200 text-sm">{c.category}</span>
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold border font-mono ${
                  c.status === "COMPLETE"
                    ? "border-emerald-500/20 text-emerald-400 bg-emerald-500/5"
                    : c.status === "SPARSE"
                    ? "border-amber-500/20 text-amber-400 bg-amber-500/5"
                    : "border-red-500/20 text-red-400 bg-red-500/5"
                }`}>
                  {c.status}
                </span>
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-muted-foreground text-[10px] font-mono">
                  <span>Grounding Coverage</span>
                  <span className="font-bold text-slate-300">{(c.coverageRatio * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-background h-2 rounded-full overflow-hidden">
                  <div className={`h-full ${
                    c.status === "COMPLETE" ? "bg-emerald-500" : c.status === "SPARSE" ? "bg-amber-500" : "bg-red-500"
                  }`} style={{ width: `${c.coverageRatio * 100}%` }} />
                </div>
              </div>

              <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                <span>Documents: <span className="text-slate-300">{c.documentCount}</span></span>
                <span>Chunks: <span className="text-slate-300">{c.chunkCount}</span></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Guide Info Card */}
      <div className="bg-card border border-border rounded-lg p-5 space-y-3 font-sans text-xs">
        <span className="text-[10px] font-bold text-slate-200 uppercase tracking-widest font-mono flex items-center space-x-1.5">
          <Info className="w-3.5 h-3.5 text-primary" />
          <span>Coverage Mapping Guidelines</span>
        </span>
        <p className="text-muted-foreground leading-relaxed">
          Knowledge Coverage Maps calculate the ratio of prompt queries to grounded source citations. Category rankings under 50% are flagged as CRITICAL gaps, necessitating additional scientific catalog uploads.
        </p>
      </div>
    </div>
  );
}
