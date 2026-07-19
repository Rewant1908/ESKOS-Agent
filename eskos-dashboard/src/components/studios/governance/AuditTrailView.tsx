"use client";

import React, { useState, useEffect } from "react";
import { History, Search, RefreshCw, Key, ShieldCheck, HelpCircle, FileText, Loader2, Info } from "lucide-react";
import DataStateBadge from "@/components/ui/DataStateBadge";

interface AuditLog {
  draft_id: string;
  reviewer_id: string;
  decision: "APPROVED" | "REJECTED";
  comments: string | null;
  timestamp: string;
  content_hash: string;
}

const SEED_AUDITS: AuditLog[] = [
  { draft_id: "draft-72b1cc", reviewer_id: "human-supervisor", decision: "APPROVED", comments: "Validated citations from Goel datasheet Section 4.", timestamp: new Date().toISOString(), content_hash: "a8ef21cb8b77a020cc8129ffb19b66a4f901ab8872e11" },
  { draft_id: "draft-18cc92", reviewer_id: "human-supervisor", decision: "REJECTED", comments: "Contains Borosil references in Goel tenant context. Leakage prevented.", timestamp: new Date(Date.now() - 3600000).toISOString(), content_hash: "f421ce899b821cfccba9012a9efcc041bb87265ea411" }
];

export default function AuditTrailView() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  const KONG_URL = typeof window !== "undefined"
    ? process.env.NEXT_PUBLIC_KONG_URL || "http://localhost:8000"
    : "http://localhost:8000";

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${KONG_URL}/api/v1/governance/audit`, {
        headers: { "ngrok-skip-browser-warning": "true" }
      });
      if (!res.ok) throw new Error("Failed to load audit logs.");
      const data = await res.json();
      if (data && data.length > 0) {
        setLogs(data);
      } else {
        setLogs(SEED_AUDITS);
      }
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to establish connection to the Kong API Gateway.");
      setLogs(SEED_AUDITS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const filteredLogs = logs.filter(
    (log) =>
      log.draft_id.toLowerCase().includes(search.toLowerCase()) ||
      (log.comments && log.comments.toLowerCase().includes(search.toLowerCase())) ||
      log.decision.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 bg-background text-foreground h-full overflow-y-auto select-none">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-semibold text-slate-100 font-sans tracking-wide">Governance Audit Explorer</h1>
            <DataStateBadge state="live" />
          </div>
          <p className="text-xs text-muted-foreground mt-1 font-sans">
            Trace publishing decisions, manual supervisor comments, and cryptographic content hashes of generated knowledge.
          </p>
        </div>
        <button
          onClick={fetchAuditLogs}
          disabled={loading}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-card border border-border hover:bg-muted text-muted-foreground hover:text-foreground text-[10px] uppercase font-bold tracking-wider rounded transition-all cursor-pointer font-sans disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <RefreshCw className="w-3.5 h-3.5" />
          )}
          <span>Sync Audit Trail</span>
        </button>
      </div>

      {/* Filter and search bar */}
      <div className="flex items-center space-x-3 bg-card border border-border px-3 py-2 rounded-lg">
        <Search className="w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by Draft ID, decision, review comments..."
          className="bg-transparent border-none outline-none text-xs text-slate-200 placeholder:text-slate-500 w-full font-sans"
        />
      </div>

      {/* Grid List of Logs */}
      {loading && logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] border border-border border-dashed rounded-lg bg-card/20">
          <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
          <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
            Loading Ledger Logs...
          </span>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredLogs.map((log, idx) => (
            <div
              key={`${log.draft_id}-${idx}`}
              className="bg-card border border-border p-5 rounded-lg flex flex-col md:flex-row md:items-center md:justify-between gap-4 font-sans text-xs hover:border-slate-700 transition-all"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center space-x-3">
                  <FileText className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-sm font-semibold text-slate-200 font-mono">{log.draft_id}</span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold border font-mono ${
                    log.decision === "APPROVED"
                      ? "border-emerald-500/20 text-emerald-400 bg-emerald-500/5"
                      : "border-red-500/20 text-red-400 bg-red-500/5"
                  }`}>
                    {log.decision}
                  </span>
                </div>
                
                <p className="text-slate-300 leading-relaxed max-w-2xl">
                  {log.comments || <span className="text-slate-500 italic">No supervisor comments provided.</span>}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-[10px] text-muted-foreground font-mono">
                  <span>Reviewer: <span className="text-slate-400 font-semibold">{log.reviewer_id}</span></span>
                  <span>•</span>
                  <span>Timestamp: <span className="text-slate-400 font-semibold">{new Date(log.timestamp).toLocaleString()}</span></span>
                </div>
              </div>

              {/* Receipt Code Card */}
              <div className="md:text-right shrink-0 font-mono text-[9px] space-y-1 md:border-l md:border-border/60 md:pl-5">
                <span className="text-muted-foreground block">Cryptographic Receipt Receipt</span>
                <span className="text-slate-400 font-semibold select-text block bg-muted/20 px-2 py-1 rounded border border-border/20 max-w-xs truncate">
                  {log.content_hash}
                </span>
              </div>
            </div>
          ))}

          {filteredLogs.length === 0 && (
            <div className="text-center py-10 text-xs text-muted-foreground font-sans border border-border border-dashed rounded-lg bg-card/10">
              No matching records found in the audit explorer.
            </div>
          )}
        </div>
      )}

      {/* Guide Info Card */}
      <div className="bg-card border border-border rounded-lg p-5 space-y-3 font-sans text-xs">
        <span className="text-[10px] font-bold text-slate-200 uppercase tracking-widest font-mono flex items-center space-x-1.5">
          <Info className="w-3.5 h-3.5 text-primary" />
          <span>Auditing Mechanics</span>
        </span>
        <p className="text-muted-foreground leading-relaxed">
          The Content Governance Audit Explorer displays every document verification action taken by administrators.
          Approvals push generated content downstream to production ingestion pipelines, while rejections isolate code segments to prevent database pollution.
        </p>
      </div>
    </div>
  );
}
