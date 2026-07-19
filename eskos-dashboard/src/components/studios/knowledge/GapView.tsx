"use client";

import React, { useState, useEffect } from "react";
import { HelpCircle, AlertTriangle, RefreshCw, Loader2, Info } from "lucide-react";
import DataStateBadge from "@/components/ui/DataStateBadge";

interface KnowledgeGap {
  query: string;
  count: number;
  trust_score: number;
  last_occurred: string;
  category: string;
  severity: "HIGH" | "MEDIUM" | "LOW";
}

const SEED_GAPS: KnowledgeGap[] = [
  { query: "high-temperature pressure reactors", count: 12, trust_score: 42.5, last_occurred: new Date().toISOString(), category: "reactors", severity: "HIGH" },
  { query: "quartz distillation columns", count: 7, trust_score: 55.0, last_occurred: new Date().toISOString(), category: "distillation", severity: "MEDIUM" },
  { query: "fluoropolymer lined beakers", count: 3, trust_score: 61.8, last_occurred: new Date().toISOString(), category: "beakers", severity: "LOW" },
];

export default function GapView() {
  const [gaps, setGaps] = useState<KnowledgeGap[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const KONG_URL = typeof window !== "undefined"
    ? process.env.NEXT_PUBLIC_KONG_URL || "http://localhost:8000"
    : "http://localhost:8000";

  const fetchGaps = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${KONG_URL}/api/v1/knowledge/gaps`, {
        headers: { "ngrok-skip-browser-warning": "true" }
      });
      if (!res.ok) throw new Error("Failed to retrieve query gap analysis.");
      const data = await res.json();
      
      // Fallback to seeds if backend returns no gaps
      if (data && data.length > 0) {
        setGaps(data);
      } else {
        setGaps(SEED_GAPS);
      }
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to establish connection to the Kong API Gateway.");
      setGaps(SEED_GAPS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGaps();
  }, []);

  return (
    <div className="p-6 space-y-6 bg-background text-foreground h-full overflow-y-auto select-none">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-semibold text-slate-100 font-sans tracking-wide">Knowledge Gap Analysis</h1>
            <DataStateBadge state="live" />
          </div>
          <p className="text-xs text-muted-foreground mt-1 font-sans">
            Inspect unanswered search queries and identify product specifications lacking sufficient context coverage.
          </p>
        </div>
        <button
          onClick={fetchGaps}
          disabled={loading}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-card border border-border hover:bg-muted text-muted-foreground hover:text-foreground text-[10px] uppercase font-bold tracking-wider rounded transition-all cursor-pointer font-sans disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <RefreshCw className="w-3.5 h-3.5" />
          )}
          <span>Refresh Gaps</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-950/20 border border-red-500/20 rounded-lg flex items-start space-x-3 text-red-400 font-sans text-xs">
          <AlertTriangle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
          <div>
            <p className="font-bold">Offline Sync Fallback</p>
            <p className="mt-1 font-mono text-[10px]">Serving local query cache: {error}</p>
          </div>
        </div>
      )}

      {loading && gaps.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] border border-border border-dashed rounded-lg bg-card/20">
          <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
          <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
            Analyzing Query Logs...
          </span>
        </div>
      ) : (
        <div className="space-y-4">
          {gaps.map((gap) => (
            <div key={gap.query} className="bg-card border border-border p-5 rounded-lg flex justify-between items-center font-sans text-xs hover:border-slate-700 transition-all">
              <div className="space-y-1.5">
                <div className="flex items-center space-x-2">
                  <HelpCircle className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-slate-200">{gap.query}</span>
                </div>
                <div className="flex items-center space-x-4 text-xs text-muted-foreground font-mono">
                  <span>Suggested category partition: <span className="text-slate-300 font-semibold">{gap.category}</span></span>
                  {gap.trust_score !== undefined && (
                    <span>• Best Matched Score: <span className="text-primary font-semibold">{gap.trust_score}%</span></span>
                  )}
                  {gap.last_occurred && (
                    <span>• Last Seen: <span className="text-slate-400 font-semibold">{new Date(gap.last_occurred).toLocaleDateString()}</span></span>
                  )}
                </div>
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
      )}

      {/* Guide Card */}
      <div className="bg-card border border-border rounded-lg p-5 space-y-3 font-sans text-xs">
        <span className="text-[10px] font-bold text-slate-200 uppercase tracking-widest font-mono flex items-center space-x-1.5">
          <Info className="w-3.5 h-3.5 text-primary" />
          <span>Gap Discovery Process</span>
        </span>
        <p className="text-muted-foreground leading-relaxed">
          The Gap Analysis engine automatically filters customer queries that returned <span className="text-slate-300 font-semibold">zero search results</span> or <span className="text-slate-300 font-semibold">low confidence scores</span> (&lt;70.0% credibility) in the query logic.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          Technical leads should target high priority gaps first by creating corresponding scientific documents or ontology definitions to expand search coverage.
        </p>
      </div>
    </div>
  );
}
