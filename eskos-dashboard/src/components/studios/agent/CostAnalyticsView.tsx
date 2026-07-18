"use client";

import React, { useState } from "react";
import { CircleDollarSign, Coins, TrendingUp, RefreshCw, BarChart2, Calendar, Database, HelpCircle } from "lucide-react";

interface CostLogEntry {
  id: string;
  timestamp: string;
  agent: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
}

const SEED_COSTS: CostLogEntry[] = [
  { id: "tx-001", timestamp: new Date().toISOString(), agent: "planner", model: "gemini-3.1-flash-lite", inputTokens: 512, outputTokens: 250, costUsd: 0.000112 },
  { id: "tx-002", timestamp: new Date(Date.now() - 360000).toISOString(), agent: "researcher", model: "gemini-3.1-flash-lite", inputTokens: 1024, outputTokens: 412, costUsd: 0.000200 },
  { id: "tx-003", timestamp: new Date(Date.now() - 720000).toISOString(), agent: "compliance", model: "gemini-3.1-flash-lite", inputTokens: 300, outputTokens: 50, costUsd: 0.000038 },
  { id: "tx-004", timestamp: new Date(Date.now() - 1440000).toISOString(), agent: "planner", model: "gemini-3.5-flash", inputTokens: 2100, outputTokens: 980, costUsd: 0.000452 },
];

export default function CostAnalyticsView() {
  const [logs, setLogs] = useState<CostLogEntry[]>(SEED_COSTS);
  const [loading, setLoading] = useState(false);

  const totalInputTokens = logs.reduce((sum, item) => sum + item.inputTokens, 0);
  const totalOutputTokens = logs.reduce((sum, item) => sum + item.outputTokens, 0);
  const totalCost = logs.reduce((sum, item) => sum + item.costUsd, 0);

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      // Simulate adding a new random log entry
      const randomAgents = ["planner", "researcher", "compliance"];
      const randomModels = ["gemini-3.1-flash-lite", "gemini-3.5-flash"];
      const input = Math.floor(Math.random() * 1500) + 200;
      const output = Math.floor(Math.random() * 800) + 100;
      const newEntry: CostLogEntry = {
        id: `tx-00${logs.length + 1}`,
        timestamp: new Date().toISOString(),
        agent: randomAgents[Math.floor(Math.random() * randomAgents.length)],
        model: randomModels[Math.floor(Math.random() * randomModels.length)],
        inputTokens: input,
        outputTokens: output,
        costUsd: parseFloat(((input * 0.075 + output * 0.3) / 1000000).toFixed(6))
      };
      setLogs(prev => [newEntry, ...prev]);
      setLoading(false);
    }, 800);
  };

  return (
    <div className="p-6 space-y-6 bg-background text-foreground h-full overflow-y-auto select-none">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-xl font-semibold text-slate-100 font-sans tracking-wide">Token Cost Accounting</h1>
          <p className="text-xs text-muted-foreground mt-1 font-sans">
            Inspect model operational metrics, input/output token allocation weights, and cumulative session charge summaries.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-card border border-border hover:bg-muted text-muted-foreground hover:text-foreground text-[10px] uppercase font-bold tracking-wider rounded transition-all cursor-pointer font-sans disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Sync Billing Logs</span>
        </button>
      </div>

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
          {/* Planner weight bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-slate-300 font-mono text-[10px]">
              <span>PLANNER AGENT</span>
              <span className="font-bold">45%</span>
            </div>
            <div className="w-full bg-background h-2 rounded-full overflow-hidden">
              <div className="bg-primary h-full w-[45%]" />
            </div>
          </div>

          {/* Researcher weight bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-slate-300 font-mono text-[10px]">
              <span>RESEARCHER AGENT</span>
              <span className="font-bold">40%</span>
            </div>
            <div className="w-full bg-background h-2 rounded-full overflow-hidden">
              <div className="bg-amber-500 h-full w-[40%]" />
            </div>
          </div>

          {/* Compliance weight bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-slate-300 font-mono text-[10px]">
              <span>COMPLIANCE AUDITOR</span>
              <span className="font-bold">15%</span>
            </div>
            <div className="w-full bg-background h-2 rounded-full overflow-hidden">
              <div className="bg-red-500 h-full w-[15%]" />
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
        <div className="border border-border rounded overflow-hidden">
          <table className="w-full text-left font-sans text-xs border-collapse">
            <thead>
              <tr className="bg-card border-b border-border text-[9px] uppercase font-bold text-muted-foreground tracking-wider font-mono">
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
                  <td className="p-3 text-slate-500">{new Date(item.timestamp).toLocaleTimeString()}</td>
                  <td className="p-3 uppercase text-[10px] font-sans">
                    <span className={`px-1.5 py-0.5 rounded border font-bold ${
                      item.agent === "planner" 
                        ? "border-primary/20 text-primary bg-primary/5"
                        : item.agent === "researcher"
                        ? "border-amber-500/20 text-amber-400 bg-amber-500/5"
                        : "border-red-500/20 text-red-400 bg-red-500/5"
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
      </div>
    </div>
  );
}
