"use client";

import React, { useState } from "react";
import { CircleDollarSign, RefreshCw, BarChart2, TrendingUp, ShieldCheck, Clock, HelpCircle, Info, Landmark } from "lucide-react";
import DataStateBadge from "@/components/ui/DataStateBadge";

interface ROIMetrics {
  manualQueryCostUsd: number;
  aiQueryCostUsd: number;
  queriesRun: number;
  developerHoursSaved: number;
  hourlyDeveloperRate: number;
  ticketDeflectionRate: number;
  averageTicketCostUsd: number;
}

const SEED_ROI: ROIMetrics = {
  manualQueryCostUsd: 4.50,
  aiQueryCostUsd: 0.0002,
  queriesRun: 18420,
  developerHoursSaved: 284,
  hourlyDeveloperRate: 65,
  ticketDeflectionRate: 0.74,
  averageTicketCostUsd: 22.00
};

export default function ROIView() {
  const [metrics, setMetrics] = useState<ROIMetrics>(SEED_ROI);
  const [loading, setLoading] = useState(false);

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setMetrics(prev => ({
        ...prev,
        queriesRun: prev.queriesRun + Math.floor(Math.random() * 50) + 10,
        developerHoursSaved: prev.developerHoursSaved + Math.floor(Math.random() * 3) + 1
      }));
      setLoading(false);
    }, 600);
  };

  const querySavings = metrics.queriesRun * (metrics.manualQueryCostUsd - metrics.aiQueryCostUsd);
  const developerSavings = metrics.developerHoursSaved * metrics.hourlyDeveloperRate;
  const ticketSavings = (metrics.queriesRun * metrics.ticketDeflectionRate) * metrics.averageTicketCostUsd;
  const totalSavings = querySavings + developerSavings + ticketSavings;

  return (
    <div className="p-6 space-y-6 bg-background text-foreground h-full overflow-y-auto select-none">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-semibold text-slate-100 font-sans tracking-wide">ROI Analytics</h1>
            <DataStateBadge state="simulated" />
          </div>
          <p className="text-xs text-muted-foreground mt-1 font-sans">
            Inspect total estimated organization savings, support ticket deflection rates, and developer hours saved.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-card border border-border hover:bg-muted text-muted-foreground hover:text-foreground text-[10px] uppercase font-bold tracking-wider rounded transition-all cursor-pointer font-sans disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Sync ROI Metrics</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Financial Savings */}
        <div className="bg-card border border-border p-5 rounded-lg flex items-center space-x-4">
          <div className="w-10 h-10 rounded bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Landmark className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest font-mono">Net Savings</span>
            <div className="text-lg font-bold font-mono text-slate-100">${Math.round(totalSavings).toLocaleString()}</div>
          </div>
        </div>

        {/* Developer Hours Saved */}
        <div className="bg-card border border-border p-5 rounded-lg flex items-center space-x-4">
          <div className="w-10 h-10 rounded bg-blue-500/5 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Clock className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest font-mono">Developer Hours Saved</span>
            <div className="text-lg font-bold font-mono text-slate-100">{metrics.developerHoursSaved} hrs</div>
          </div>
        </div>

        {/* Ticket Deflection Rate */}
        <div className="bg-card border border-border p-5 rounded-lg flex items-center space-x-4">
          <div className="w-10 h-10 rounded bg-purple-500/5 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest font-mono">Deflection Rate</span>
            <div className="text-lg font-bold font-mono text-slate-100">{(metrics.ticketDeflectionRate * 100).toFixed(0)}%</div>
          </div>
        </div>

        {/* Queries deflections */}
        <div className="bg-card border border-border p-5 rounded-lg flex items-center space-x-4">
          <div className="w-10 h-10 rounded bg-amber-500/5 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <CircleDollarSign className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest font-mono">Resolved Queries</span>
            <div className="text-lg font-bold font-mono text-slate-100">{metrics.queriesRun.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Visual Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-card border border-border p-5 rounded-lg font-sans text-xs">
        {/* Left: Savings categories bars */}
        <div className="space-y-4">
          <span className="text-[10px] font-bold text-slate-200 uppercase tracking-widest font-mono flex items-center space-x-1.5">
            <BarChart2 className="w-3.5 h-3.5 text-primary" />
            <span>Operational Savings Categorization</span>
          </span>
          
          <div className="space-y-3 font-mono text-[10px] text-slate-400">
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>SUPPORT TICKET DEFLECTIONS</span>
                <span className="text-slate-200 font-bold">${Math.round(ticketSavings).toLocaleString()}</span>
              </div>
              <div className="w-full bg-background h-1.5 rounded-full overflow-hidden">
                <div className="bg-primary h-full w-[70%]" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <span>MANUAL RESEARCH TIME SAVED</span>
                <span className="text-slate-200 font-bold">${Math.round(querySavings).toLocaleString()}</span>
              </div>
              <div className="w-full bg-background h-1.5 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full w-[20%]" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <span>DEVELOPER COST DEFLECTION</span>
                <span className="text-slate-200 font-bold">${Math.round(developerSavings).toLocaleString()}</span>
              </div>
              <div className="w-full bg-background h-1.5 rounded-full overflow-hidden">
                <div className="bg-purple-500 h-full w-[10%]" />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Telemetry list */}
        <div className="space-y-4 md:border-l md:border-border/60 md:pl-6">
          <span className="text-[10px] font-bold text-slate-200 uppercase tracking-widest font-mono flex items-center space-x-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-primary" />
            <span>Billing Cost Telemetry Parameters</span>
          </span>
          <div className="divide-y divide-border/40 font-mono text-[10px] text-slate-400">
            <div className="flex justify-between py-2">
              <span>Manual Search Cost (per query):</span>
              <span className="text-slate-200">${metrics.manualQueryCostUsd.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-2">
              <span>AI Search Cost (per query):</span>
              <span className="text-slate-200">${metrics.aiQueryCostUsd.toFixed(4)}</span>
            </div>
            <div className="flex justify-between py-2">
              <span>Developer Hourly Rate:</span>
              <span className="text-slate-200">${metrics.hourlyDeveloperRate}/hr</span>
            </div>
            <div className="flex justify-between py-2">
              <span>Average Ticket Cost:</span>
              <span className="text-slate-200">${metrics.averageTicketCostUsd.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Guide Info Card */}
      <div className="bg-card border border-border rounded-lg p-5 space-y-3 font-sans text-xs">
        <span className="text-[10px] font-bold text-slate-200 uppercase tracking-widest font-mono flex items-center space-x-1.5">
          <Info className="w-3.5 h-3.5 text-primary" />
          <span>ROI Calculation Basis</span>
        </span>
        <p className="text-muted-foreground leading-relaxed">
          Savings metrics are calculated by deflecting customer calls and indexing pages automatically rather than compiling drafts manually.
          AI query execution costs ($0.0002) represent average token cost calculations based on active Gemini-1.5/3.1 models.
        </p>
      </div>
    </div>
  );
}
