"use client";

import React, { useState } from "react";
import { Key, RefreshCw, Copy, CheckCircle2, Lock, Plus, ToggleLeft, ToggleRight, Trash2, Info } from "lucide-react";

interface ApiKeyItem {
  name: string;
  keyPrefix: string;
  scope: string;
  status: "ACTIVE" | "INACTIVE";
  created: string;
}

const SEED_KEYS: ApiKeyItem[] = [
  { name: "Kong Gateway Admin Access", keyPrefix: "eskos-gov-demo...", scope: "read-write", status: "ACTIVE", created: "2026-05-14" },
  { name: "Qdrant Vector Cluster Agent", keyPrefix: "qdr-cls-demo...", scope: "read-only", status: "ACTIVE", created: "2026-06-02" },
  { name: "Neo4j Relation Manager", keyPrefix: "n4j-rel-demo...", scope: "read-write", status: "ACTIVE", created: "2026-06-18" }
];

export default function ApiKeysView() {
  const [keys, setKeys] = useState<ApiKeyItem[]>(SEED_KEYS);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const handleCopy = (idx: number) => {
    setCopiedIdx(idx);
    navigator.clipboard.writeText("eskos-gov-demo-0000-not-a-real-key");
    setTimeout(() => setCopiedIdx(null), 1000);
  };

  const handleToggle = (idx: number) => {
    setKeys(prev => prev.map((item, index) => {
      if (index === idx) {
        return {
          ...item,
          status: item.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"
        };
      }
      return item;
    }));
  };

  const handleCreateKey = () => {
    const newKey: ApiKeyItem = {
      name: `External Client App ${keys.length + 1}`,
      keyPrefix: `eskos-ext-${Math.random().toString(36).substring(2, 6)}...`,
      scope: "read-only",
      status: "ACTIVE",
      created: new Date().toISOString().split("T")[0]
    };
    setKeys(prev => [...prev, newKey]);
  };

  return (
    <div className="p-6 space-y-6 bg-background text-foreground h-full overflow-y-auto select-none">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-xl font-semibold text-slate-100 font-sans tracking-wide">API Configuration</h1>
          <p className="text-xs text-muted-foreground mt-1 font-sans">
            Provision API keys, configure developer scopes, and manage credentials for secure system ingestion.
          </p>
        </div>
        <button
          onClick={handleCreateKey}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-primary hover:bg-primary/95 text-white text-[10px] uppercase font-bold tracking-wider rounded transition-all cursor-pointer font-sans"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Provision Key</span>
        </button>
      </div>

      {/* Grid List of Keys */}
      <div className="space-y-4">
        {keys.map((item, idx) => (
          <div
            key={`${item.name}-${idx}`}
            className="bg-card border border-border p-5 rounded-lg flex flex-col md:flex-row md:items-center md:justify-between gap-4 font-sans text-xs hover:border-slate-700 transition-all"
          >
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center space-x-3">
                <Key className="w-4 h-4 text-primary shrink-0" />
                <span className="text-sm font-semibold text-slate-200">{item.name}</span>
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold border font-mono ${
                  item.status === "ACTIVE"
                    ? "border-emerald-500/20 text-emerald-400 bg-emerald-500/5"
                    : "border-slate-500/20 text-slate-400 bg-slate-500/5"
                }`}>
                  {item.status}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-[10px] text-muted-foreground font-mono">
                <span>Scope: <span className="text-slate-400 font-semibold">{item.scope}</span></span>
                <span>•</span>
                <span>Created: <span className="text-slate-400 font-semibold">{item.created}</span></span>
              </div>
            </div>

            {/* Prefix & Actions */}
            <div className="flex items-center space-x-3 shrink-0">
              <span className="font-mono text-slate-400 bg-background/50 border border-border/60 px-2.5 py-1 rounded text-[10px]">
                {item.keyPrefix}
              </span>
              
              {/* Copy key */}
              <button
                onClick={() => handleCopy(idx)}
                className="p-1.5 bg-muted/35 border border-border hover:bg-muted text-muted-foreground hover:text-foreground rounded transition-all cursor-pointer"
                title="Copy API Key Value"
              >
                {copiedIdx === idx ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>

              {/* Status Toggle */}
              <button
                onClick={() => handleToggle(idx)}
                className="bg-transparent border-none outline-none cursor-pointer"
                title={item.status === "ACTIVE" ? "Revoke Key" : "Activate Key"}
              >
                {item.status === "ACTIVE" ? (
                  <ToggleRight className="w-7 h-7 text-primary" />
                ) : (
                  <ToggleLeft className="w-7 h-7 text-slate-500" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Guide Info Card */}
      <div className="bg-card border border-border rounded-lg p-5 space-y-3 font-sans text-xs">
        <span className="text-[10px] font-bold text-slate-200 uppercase tracking-widest font-mono flex items-center space-x-1.5">
          <Lock className="w-3.5 h-3.5 text-primary" />
          <span>Security & API Scope Guidelines</span>
        </span>
        <p className="text-muted-foreground leading-relaxed">
          Access keys authenticate requests to `/api/v1/*` routes on the Kong Gateway.
          Revoking a key immediately halts associated downstream pipelines. Never share administrative API keys over insecure channels.
        </p>
      </div>
    </div>
  );
}
