"use client";

import React, { useState } from "react";
import { Layers, RefreshCw, BarChart2, CheckCircle2, ShieldCheck, Clock, Search, HelpCircle, Info } from "lucide-react";

interface QueryPerformanceEntry {
  query: string;
  latencyMs: number;
  confidenceScore: number;
  sourceDocId: string;
  timestamp: string;
}

const SEED_LOGS: QueryPerformanceEntry[] = [
  { query: "high-temperature pressure reactors", latencyMs: 28, confidenceScore: 92.5, sourceDocId: "doc-goel-01", timestamp: new Date().toISOString() },
  { query: "quartz distillation columns specification", latencyMs: 42, confidenceScore: 88.0, sourceDocId: "doc-goel-02", timestamp: new Date(Date.now() - 300000).toISOString() },
  { query: "heat-resistant borosilicate glass composition", latencyMs: 35, confidenceScore: 94.2, sourceDocId: "doc-goel-02", timestamp: new Date(Date.now() - 600000).toISOString() }
];

export default function RetrievalView() {
  const [logs, setLogs] = useState<QueryPerformanceEntry[]>(SEED_LOGS);
  const [loading, setLoading] = useState(false);

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      const newEntry: QueryPerformanceEntry = {
        query: "borosilicate glass mechanical properties",
        latencyMs: Math.floor(Math.random() * 30) + 20,
        confidenceScore: parseFloat((Math.random() * 15 + 80).toFixed(1)),
        sourceDocId: "doc-goel-02",
        timestamp: new Date().toISOString()
      };
      setLogs(prev => [newEntry, ...prev]);
      setLoading(false);
    }, 600);
  };

  const avgLatency = Math.round(logs.reduce((sum, item) => sum + item.latencyMs, 0) / logs.length);
  const avgConfidence = parseFloat((logs.reduce((sum, item) => sum + item.confidenceScore, 0) / logs.length).toFixed(1));

  return (
    <div className="p-6 space-y-6 bg-background text-foreground h-full overflow-y-auto select-none">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-xl font-semibold text-slate-100 font-sans tracking-wide">Retrieval Analytics</h1>
          <p className="text-xs text-muted-foreground mt-1 font-sans">
            Analyze RAG latency distributions, hybrid query matching scores, and document grounding metrics.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-card border border-border hover:bg-muted text-muted-foreground hover:text-foreground text-[10px] uppercase font-bold tracking-wider rounded transition-all cursor-pointer font-sans disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Avg Latency */}
        <div className="bg-card border border-border p-5 rounded-lg flex items-center space-x-4">
          <div className="w-10 h-10 rounded bg-blue-500/5 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Clock className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest font-mono">Average Latency</span>
            <div className="text-lg font-bold font-mono text-slate-100">{avgLatency} ms</div>
          </div>
        </div>

        {/* Avg Confidence */}
        <div className="bg-card border border-border p-5 rounded-lg flex items-center space-x-4">
          <div className="w-10 h-10 rounded bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest font-mono">Average Confidence</span>
            <div className="text-lg font-bold font-mono text-slate-100">{avgConfidence}%</div>
          </div>
        </div>

        {/* Vector Match Rate */}
        <div className="bg-card border border-border p-5 rounded-lg flex items-center space-x-4">
          <div className="w-10 h-10 rounded bg-purple-500/5 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest font-mono">Vector Grounding Rate</span>
            <div className="text-lg font-bold font-mono text-slate-100">100%</div>
          </div>
        </div>
      </div>

      {/* Latency and Quality charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Latency Distribution */}
        <div className="bg-card border border-border p-5 rounded-lg space-y-4">
          <span className="text-[10px] font-bold text-slate-200 uppercase tracking-widest font-mono flex items-center space-x-1.5">
            <BarChart2 className="w-3.5 h-3.5 text-primary" />
            <span>Search Pipeline Latency Distribution</span>
          </span>
          <div className="space-y-4 font-sans text-xs">
            <div className="space-y-1.5">
              <div className="flex justify-between text-slate-300 font-mono text-[10px]">
                <span>VECTOR INDEX SEARCH (QDRANT)</span>
                <span className="font-bold">12 ms</span>
              </div>
              <div className="w-full bg-background h-2 rounded-full overflow-hidden">
                <div className="bg-primary h-full w-[35%]" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-slate-300 font-mono text-[10px]">
                <span>GRAPH Walk TRAVERSAL (NEO4J)</span>
                <span className="font-bold">18 ms</span>
              </div>
              <div className="w-full bg-background h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full w-[50%]" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-slate-300 font-mono text-[10px]">
                <span>METADATA SCHEMA VALIDATION (POSTGRES)</span>
                <span className="font-bold">5 ms</span>
              </div>
              <div className="w-full bg-background h-2 rounded-full overflow-hidden">
                <div className="bg-purple-500 h-full w-[15%]" />
              </div>
            </div>
          </div>
        </div>

        {/* Match Confidence Quality */}
        <div className="bg-card border border-border p-5 rounded-lg space-y-4">
          <span className="text-[10px] font-bold text-slate-200 uppercase tracking-widest font-mono flex items-center space-x-1.5">
            <Layers className="w-3.5 h-3.5 text-primary" />
            <span>RAG Grounding Quality Ratio</span>
          </span>
          <div className="space-y-4 font-sans text-xs">
            <div className="space-y-1.5">
              <div className="flex justify-between text-slate-300 font-mono text-[10px]">
                <span>FULLY GROUNDED RAG CLAIMS</span>
                <span className="text-emerald-400 font-bold">92.0%</span>
              </div>
              <div className="w-full bg-background h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-[92%]" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-slate-300 font-mono text-[10px]">
                <span>SAFETY FILTER DROPS</span>
                <span className="text-red-400 font-bold">0.0%</span>
              </div>
              <div className="w-full bg-background h-2 rounded-full overflow-hidden">
                <div className="bg-red-500 h-full w-[0%]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Query logs table */}
      <div className="bg-card border border-border p-5 rounded-lg space-y-4">
        <span className="text-[10px] font-bold text-slate-200 uppercase tracking-widest font-mono flex items-center space-x-1.5">
          <Search className="w-3.5 h-3.5 text-primary" />
          <span>Recent Retrieval Transaction Logs</span>
        </span>
        <div className="border border-border rounded overflow-hidden">
          <table className="w-full text-left font-sans text-xs border-collapse">
            <thead>
              <tr className="bg-card border-b border-border text-[9px] uppercase font-bold text-muted-foreground tracking-wider font-mono">
                <th className="p-3">Query Parameter</th>
                <th className="p-3">Source ID</th>
                <th className="p-3">Latency</th>
                <th className="p-3 text-right">Confidence Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-slate-300 font-mono text-[11px]">
              {logs.map((item, idx) => (
                <tr key={`${item.query}-${idx}`} className="hover:bg-muted/10 transition-colors">
                  <td className="p-3 font-semibold text-slate-200 font-sans max-w-xs truncate">{item.query}</td>
                  <td className="p-3 text-slate-400">{item.sourceDocId}</td>
                  <td className="p-3 text-slate-400">{item.latencyMs} ms</td>
                  <td className="p-3 text-right text-emerald-400 font-bold">{item.confidenceScore}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
