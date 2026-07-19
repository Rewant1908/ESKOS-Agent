"use client";

import React, { useState, useEffect } from "react";
import { Cpu, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import DataStateBadge from "@/components/ui/DataStateBadge";

interface TraceStep {
  agent: string;
  action: string;
  message: string;
  timestamp: string;
}

interface AgentRun {
  id: number;
  session_id: string;
  org_id: string;
  caller_id: string;
  query_text: string;
  reply_preview: string | null;
  trace: TraceStep[];
  input_tokens: number;
  output_tokens: number;
  usd_cost: number;
  model: string;
  blocked_input: boolean;
  created_at: string;
}

export default function AgentMonitoringView() {
  const [runs, setRuns] = useState<AgentRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedRunId, setExpandedRunId] = useState<number | null>(null);

  const fetchRuns = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/agent/runs");
      if (!res.ok) throw new Error("Failed to load agent runs.");
      const data = await res.json();
      setRuns(data.runs || []);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load agent metrics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRuns();
  }, []);

  const totalSteps = runs.reduce((sum, r) => sum + (r.trace?.length || 0), 0);
  const avgSteps = runs.length > 0 ? (totalSteps / runs.length).toFixed(1) : "0";
  const blockedCount = runs.filter((r) => r.blocked_input).length;

  if (loading && runs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center bg-background text-foreground select-none">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
        <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
          Querying agent trace metrics...
        </span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-background text-foreground h-full overflow-y-auto select-none font-sans">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-semibold text-slate-100 font-sans tracking-wide">Agent Monitoring</h1>
            <DataStateBadge state="live" />
          </div>
          <p className="text-xs text-muted-foreground mt-1 font-sans">
            Monitor active agent tasks, latency telemetry, and model execution times in real-time.
          </p>
        </div>
        <button
          onClick={fetchRuns}
          disabled={loading}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-card border border-border hover:bg-muted text-muted-foreground hover:text-foreground text-[10px] uppercase font-bold tracking-wider rounded transition-all cursor-pointer font-sans disabled:opacity-50 font-sans"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Runs</span>
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono">
          ⚠️ {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card/40 border border-border/80 p-4 rounded-xl flex flex-col justify-between backdrop-blur-sm">
          <div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest font-mono">Avg Orchestration Steps</span>
            <h2 className="text-2xl font-bold font-mono text-slate-200 mt-2">
              {runs.length > 0 ? `${avgSteps} steps` : "0 steps"}
            </h2>
          </div>
        </div>

        <div className="bg-card/40 border border-border/80 p-4 rounded-xl flex flex-col justify-between backdrop-blur-sm">
          <div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest font-mono">Active Hand-offs</span>
            <h2 className="text-2xl font-bold font-mono text-slate-200 mt-2">0 active</h2>
          </div>
        </div>

        <div className="bg-card/40 border border-border/80 p-4 rounded-xl flex flex-col justify-between backdrop-blur-sm">
          <div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest font-mono">Blocked Runs</span>
            <h2 className="text-2xl font-bold font-mono text-amber-500 mt-2">{blockedCount} runs</h2>
          </div>
        </div>
      </div>

      <div className="bg-card/40 border border-border/80 rounded-xl p-5 space-y-4 backdrop-blur-sm">
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest font-mono">Recent Execution Runs</h3>
        
        {runs.length === 0 ? (
          <div className="p-6 text-center border border-dashed border-border/60 rounded-xl text-muted-foreground text-xs">
            No agent trace execution runs found in the database.
          </div>
        ) : (
          <div className="space-y-2.5 font-mono text-xs text-muted-foreground">
            {runs.map((run) => (
              <div key={run.id} className="flex flex-col p-3.5 rounded-lg bg-card/20 border border-border/80 gap-3 hover:border-slate-800 transition-colors">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Cpu className="w-4 h-4 text-primary shrink-0" />
                      <span className="text-slate-200 font-semibold">run-{run.id}</span>
                      <span className="text-[10px] text-muted-foreground font-sans">
                        {new Date(run.created_at).toLocaleString()}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">({run.model})</span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-sans truncate max-w-lg">
                      Query: "{run.query_text}"
                    </p>
                  </div>
                  <div className="flex items-center space-x-4 shrink-0 text-[11px]">
                    <span>{run.trace?.length || 0} steps</span>
                    <span>{run.input_tokens + run.output_tokens} tks</span>
                    <span className={`font-bold uppercase ${
                      run.blocked_input 
                        ? "text-rose-400" 
                        : "text-emerald-400"
                    }`}>
                      {run.blocked_input ? "BLOCKED" : "PASSED"}
                    </span>
                    <button
                      onClick={() => setExpandedRunId(expandedRunId === run.id ? null : run.id)}
                      className="text-[10px] text-primary hover:underline font-sans cursor-pointer"
                    >
                      {expandedRunId === run.id ? "Hide Trace" : "View Trace"}
                    </button>
                  </div>
                </div>

                {expandedRunId === run.id && run.trace && run.trace.length > 0 && (
                  <div className="mt-3 border-t border-border/60 pt-3 space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Orchestration Trace Steps</span>
                    <div className="space-y-3 pl-2 border-l border-primary/20">
                      {run.trace.map((step, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex items-center space-x-2 text-[10px]">
                            <span className="text-primary font-semibold uppercase">{step.agent}</span>
                            <span className="text-slate-500">&rarr;</span>
                            <span className="text-slate-300 italic">{step.action}</span>
                            {step.timestamp && (
                              <span className="text-[9px] text-slate-600 font-sans ml-auto">
                                {new Date(step.timestamp).toLocaleTimeString()}
                              </span>
                            )}
                          </div>
                          {step.message && (
                            <p className="text-[10px] text-slate-400 pl-4 font-sans whitespace-pre-wrap">{step.message}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
