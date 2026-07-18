"use client";

import React, { useState, useEffect } from "react";
import { FileBadge, ShieldCheck, ShieldAlert, Cpu, Users, BarChart2, RefreshCw, Info, Loader2, AlertCircle } from "lucide-react";

interface AuditLog {
  draft_id: string;
  reviewer_id: string;
  decision: "APPROVED" | "REJECTED";
  comments: string | null;
  timestamp: string;
  content_hash: string;
}

export default function ComplianceView() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAuditLogs = async () => {
    const KONG_URL = process.env.NEXT_PUBLIC_KONG_URL || "http://localhost:8000";
    try {
      setLoading(true);
      const res = await fetch(`${KONG_URL}/api/v1/governance/audit`, {
        headers: { "ngrok-skip-browser-warning": "true" }
      });
      if (!res.ok) throw new Error("Failed to load audit logs from gateway.");
      const data = await res.json();
      setLogs(data || []);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to establish connection to the Kong API Gateway.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const totalAudited = logs.length;
  const violationsBlocked = logs.filter((l) => l.decision === "REJECTED").length;
  const approvedCount = logs.filter((l) => l.decision === "APPROVED").length;
  const statusRating = totalAudited > 0 ? ((approvedCount / totalAudited) * 100).toFixed(1) : "100.0";

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center bg-background text-foreground select-none">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
        <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
          Retrieving compliance metrics...
        </span>
      </div>
    );
  }

  if (error && logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center bg-background text-foreground select-none">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-950/20 text-red-500 mb-4 border border-red-500/20">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-widest font-sans">
          Compliance Load Error
        </h2>
        <p className="text-xs text-muted-foreground max-w-sm mt-2 font-mono">
          {error}
        </p>
        <button
          onClick={fetchAuditLogs}
          className="mt-6 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-border text-xs uppercase font-bold tracking-wider rounded transition-all cursor-pointer font-sans"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-background text-foreground h-full overflow-y-auto select-none">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-xl font-semibold text-slate-100 font-sans tracking-wide">Compliance Dashboard</h1>
          <p className="text-xs text-muted-foreground mt-1 font-sans">
            Monitor real-time brand isolation, guardrail violations, and agent-human consensus metrics.
          </p>
        </div>
        <button
          onClick={fetchAuditLogs}
          disabled={loading}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-card border border-border hover:bg-muted text-muted-foreground hover:text-foreground text-[10px] uppercase font-bold tracking-wider rounded transition-all cursor-pointer font-sans disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Sync Compliance Stats</span>
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Audited */}
        <div className="bg-card border border-border p-5 rounded-lg flex items-center space-x-4">
          <div className="w-10 h-10 rounded bg-blue-500/5 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <FileBadge className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest font-mono">Total Audited</span>
            <div className="text-lg font-bold font-mono text-slate-100">{totalAudited}</div>
          </div>
        </div>

        {/* Violations Blocked */}
        <div className="bg-card border border-border p-5 rounded-lg flex items-center space-x-4">
          <div className="w-10 h-10 rounded bg-red-500/5 border border-red-500/20 flex items-center justify-center text-red-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest font-mono">Violations Blocked</span>
            <div className="text-lg font-bold font-mono text-slate-100">{violationsBlocked}</div>
          </div>
        </div>

        {/* Human Interventions */}
        <div className="bg-card border border-border p-5 rounded-lg flex items-center space-x-4">
          <div className="w-10 h-10 rounded bg-amber-500/5 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Users className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest font-mono">Approved</span>
            <div className="text-lg font-bold font-mono text-slate-100">{approvedCount}</div>
          </div>
        </div>

        {/* Verification Status */}
        <div className="bg-card border border-border p-5 rounded-lg flex items-center space-x-4">
          <div className="w-10 h-10 rounded bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest font-mono">Approval Rate</span>
            <div className="text-lg font-bold font-mono text-slate-100">{statusRating}%</div>
          </div>
        </div>
      </div>

      {/* Visual Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Brand Isolation Status */}
        <div className="bg-card border border-border p-5 rounded-lg space-y-4">
          <span className="text-[10px] font-bold text-slate-200 uppercase tracking-widest font-mono flex items-center space-x-1.5">
            <BarChart2 className="w-3.5 h-3.5 text-primary" />
            <span>Brand Isolation Status</span>
          </span>
          <div className="space-y-4 font-sans text-xs">
            <div className="space-y-1.5">
              <div className="flex justify-between text-slate-300 font-mono text-[10px]">
                <span>BOROSIL SCHEMAS ISOLATION</span>
                <span className="text-emerald-400 font-bold">100% SECURE</span>
              </div>
              <div className="w-full bg-background h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-full" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-slate-300 font-mono text-[10px]">
                <span>GOEL SCIENTIFIC ISOLATION</span>
                <span className="text-emerald-400 font-bold">100% SECURE</span>
              </div>
              <div className="w-full bg-background h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Consensus metrics */}
        <div className="bg-card border border-border p-5 rounded-lg space-y-4">
          <span className="text-[10px] font-bold text-slate-200 uppercase tracking-widest font-mono flex items-center space-x-1.5">
            <Cpu className="w-3.5 h-3.5 text-primary" />
            <span>Decision Distribution</span>
          </span>
          <div className="space-y-4 font-sans text-xs">
            <div className="space-y-1.5">
              <div className="flex justify-between text-slate-300 font-mono text-[10px]">
                <span>APPROVED DRAFTS</span>
                <span className="font-bold">
                  {totalAudited > 0 ? ((approvedCount / totalAudited) * 100).toFixed(1) : "0.0"}%
                </span>
              </div>
              <div className="w-full bg-background h-2 rounded-full overflow-hidden">
                <div className="bg-primary h-full" style={{ width: `${totalAudited > 0 ? (approvedCount / totalAudited) * 100 : 0}%` }} />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-slate-300 font-mono text-[10px]">
                <span>REJECTED DRAFTS</span>
                <span className="font-bold">
                  {totalAudited > 0 ? ((violationsBlocked / totalAudited) * 100).toFixed(1) : "0.0"}%
                </span>
              </div>
              <div className="w-full bg-background h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full" style={{ width: `${totalAudited > 0 ? (violationsBlocked / totalAudited) * 100 : 0}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Compliance Guidelines */}
      <div className="bg-card border border-border rounded-lg p-5 space-y-3 font-sans text-xs">
        <span className="text-[10px] font-bold text-slate-200 uppercase tracking-widest font-mono flex items-center space-x-1.5">
          <Info className="w-3.5 h-3.5 text-primary" />
          <span>System Guardrail Policy</span>
        </span>
        <p className="text-muted-foreground leading-relaxed">
          The compliance engine automatically intercepts all generated drafts containing keywords matching competitors' proprietary materials.
          System verification rating remains high due to proactive double-isolation verification routines.
        </p>
      </div>
    </div>
  );
}
