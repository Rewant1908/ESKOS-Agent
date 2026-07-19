"use client";

import React, { useState, useEffect } from "react";
import { CircleDollarSign, Coins, TrendingUp, RefreshCw, BarChart2, Database, Loader2 } from "lucide-react";
import DataStateBadge from "@/components/ui/DataStateBadge";

interface QueryLog {
  id: number;
  query_text: string;
  trust_score: number;
  matched_chunks_count: number;
  response_status: string;
  created_at: string;
}

interface CostLogEntry {
  id: string;
  timestamp: string;
  agent: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
}

export default function CostAnalyticsView() {
  const [logs, setLogs] = useState<CostLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCostLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/agent/runs");
      if (!res.ok) throw new Error("Failed to load operational runs.");
      const data = await res.json();
      
      const runs: QueryLog[] = data.runs || [];
      const costEntries: CostLogEntry[] = runs.map((run) => {
        // Standard RAG token scaling calculations
        const input = Math.round(run.matched_chunks_count * 180 + 320);
        const output = 350;
        // Gemini-1.5-Pro Pricing: $1.25 / 1M input tokens, $5.00 / 1M output tokens
        const cost = (input * 0.00000125) + (output * 0.000005);
        
        return {
          id: `tx-0${run.id}`,
          timestamp: run.created_at,
          agent: run.trust_score > 80 ? "synthesis" : "researcher",
          model: "gemini-1.5-pro",
          inputTokens: input,
          outputTokens: output,
          costUsd: parseFloat(cost.toFixed(6))
        };
      });

      setLogs(costEntries);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load cost accounting telemetry.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCostLogs();
  }, []);

  const totalInputTokens = logs.reduce((sum, item) => sum + item.inputTokens, 0);
  const totalOutputTokens = logs.reduce((sum, item) => sum + item.outputTokens, 0);
  const totalCost = logs.reduce((sum, item) => sum + item.costUsd, 0);

  const synthesisCost = logs.filter(l => l.agent === "synthesis").reduce((sum, l) => sum + l.costUsd, 0);
  const researcherCost = logs.filter(l => l.agent === "researcher").reduce((sum, l) => sum + l.costUsd, 0);
  const totalExp = synthesisCost + researcherCost;

  const synthesisPercent = totalExp > 0 ? Math.round((synthesisCost / totalExp) * 100) : 50;
  const researcherPercent = totalExp > 0 ? Math.round((researcherCost / totalExp) * 100) : 50;

  if (loading && logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center bg-background text-foreground select-none">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
        <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
          Querying ledger accounts...
        </span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-background text-foreground h-full overflow-y-auto select-none font-sans">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-semibold text-slate-100 font-sans tracking-wide">Token Cost Accounting</h1>
            <DataStateBadge state="simulated" />
          </div>
          <p className="text-xs text-muted-foreground mt-1 font-sans">
            Inspect model operational metrics, input/output token allocation weights, and cumulative session charge summaries.
          </p>
        </div>
        <button
          onClick={fetchCostLogs}
          disabled={loading}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-card border border-border hover:bg-muted text-muted-foreground hover:text-foreground text-[10px] uppercase font-bold tracking-wider rounded transition-all cursor-pointer font-sans disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Sync Billing Logs</span>
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono">
          ⚠️ {error}
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Cost card */}
        <div className="bg-card border border-border p-5 rounded-lg flex items-center space-x-4">
          <div className="w-10 h-10 rounded bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CircleDollarSign className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest font-mono">Cumulative Expenditure</span>
            <div className="text-lg font-bold font-mono text-slate-100">${totalCost.toFixed(6)}</div>
          </div>
        </div>

        {/* Input tokens card */}
        <div className="bg-card border border-border p-5 rounded-lg flex items-center space-x-4">
          <div className="w-10 h-10 rounded bg-blue-500/5 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Coins className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest font-mono">Input Tokens Volume</span>
            <div className="text-lg font-bold font-mono text-slate-100">{totalInputTokens.toLocaleString()}</div>
          </div>
        </div>

        {/* Output tokens card */}
        <div className="bg-card border border-border p-5 rounded-lg flex items-center space-x-4">
          <div className="w-10 h-10 rounded bg-purple-500/5 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest font-mono">Output Tokens Volume</span>
            <div className="text-lg font-bold font-mono text-slate-100">{totalOutputTokens.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Breakdown Chart Simulation */}
      <div className="bg-card border border-border p-5 rounded-lg space-y-4">
        <span className="text-[10px] font-bold text-slate-200 uppercase tracking-widest font-mono flex items-center space-x-1.5">
          <BarChart2 className="w-3.5 h-3.5 text-primary" />
          <span>Operational Expenditure Allocation Weight</span>
        </span>
        <div className="space-y-3 font-sans text-xs">
          {/* Synthesis weight bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-slate-300 font-mono text-[10px]">
              <span>SYNTHESIS AGENT</span>
              <span className="font-bold">{synthesisPercent}%</span>
            </div>
            <div className="w-full bg-background h-2 rounded-full overflow-hidden">
              <div className="bg-primary h-full" style={{ width: `${synthesisPercent}%` }} />
            </div>
          </div>

          {/* Researcher weight bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-slate-300 font-mono text-[10px]">
              <span>RESEARCHER AGENT</span>
              <span className="font-bold">{researcherPercent}%</span>
            </div>
            <div className="w-full bg-background h-2 rounded-full overflow-hidden">
              <div className="bg-amber-500 h-full" style={{ width: `${researcherPercent}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Transaction billing log list */}
      <div className="bg-card border border-border p-5 rounded-lg space-y-4">
        <span className="text-[10px] font-bold text-slate-200 uppercase tracking-widest font-mono flex items-center space-x-1.5">
          <Database className="w-3.5 h-3.5 text-primary" />
          <span>Transactional Operational Billing Logs</span>
        </span>
        
        {logs.length === 0 ? (
          <div className="p-6 text-center border border-dashed border-border/60 rounded-xl text-muted-foreground text-xs">
            No billing records found in current logs.
          </div>
        ) : (
          <div className="border border-border rounded overflow-hidden">
            <table className="w-full text-left font-sans text-xs border-collapse">
              <thead>
                <tr className="bg-card border-b border-border text-[9px] uppercase font-bold text-muted-foreground tracking-wider font-mono font-bold">
                  <th className="p-3">Log ID</th>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Agent Group</th>
                  <th className="p-3">Execution Model</th>
                  <th className="p-3">Tokens (In / Out)</th>
                  <th className="p-3 text-right">Cost (USD)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 text-slate-300 font-mono text-[11px]">
                {logs.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/10 transition-colors">
                    <td className="p-3 font-semibold text-slate-400">{item.id}</td>
                    <td className="p-3 text-slate-500">{new Date(item.timestamp).toLocaleString()}</td>
                    <td className="p-3 uppercase text-[10px] font-sans">
                      <span className={`px-1.5 py-0.5 rounded border font-bold ${
                        item.agent === "synthesis" 
                          ? "border-primary/20 text-primary bg-primary/5"
                          : "border-amber-500/20 text-amber-400 bg-amber-500/5"
                      }`}>
                        {item.agent}
                      </span>
                    </td>
                    <td className="p-3 text-slate-400">{item.model}</td>
                    <td className="p-3 text-slate-300">{item.inputTokens} / {item.outputTokens}</td>
                    <td className="p-3 text-right text-emerald-400 font-bold">${item.costUsd.toFixed(6)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
