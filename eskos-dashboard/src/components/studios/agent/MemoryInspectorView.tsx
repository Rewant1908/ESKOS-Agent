"use client";

import React, { useEffect, useState } from "react";
import { ShieldAlert, Layers } from "lucide-react";
import DataStateBadge from "@/components/ui/DataStateBadge";

const KONG_URL = process.env.NEXT_PUBLIC_KONG_URL || "http://localhost:8000";

export default function MemoryInspectorView() {
  const [memory, setMemory] = useState({
    project_rules: "",
    persistent_memory: "",
    org_id: "",
  });
  const [loading, setLoading] = useState(true);

  const fetchMemory = async () => {
    setLoading(true);
    try {
      const activeTenant = typeof window !== "undefined"
        ? localStorage.getItem("eskos-active-tenant") || "goel-scientific"
        : "goel-scientific";

      const res = await fetch(`${KONG_URL}/api/v1/agent/memory`, {
        headers: { 
          "x-eskos-org-id": activeTenant,
          "ngrok-skip-browser-warning": "true" 
        }
      });
      const data = await res.json();
      setMemory({
        project_rules: data.project_rules || "None",
        persistent_memory: data.persistent_memory || "None",
        org_id: data.org_id || activeTenant,
      });
    } catch (err) {
      console.error("Failed to fetch memory", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMemory();
  }, []);

  return (
    <div className="p-6 space-y-6 bg-background text-foreground h-full overflow-y-auto select-none">
      <div>
        <div className="flex items-center space-x-3">
          <h1 className="text-xl font-semibold text-slate-100 font-sans tracking-wide">Memory Inspector</h1>
          <DataStateBadge state="live" />
        </div>
        <p className="text-xs text-muted-foreground mt-1 font-sans">Inspect the three-layer hierarchical memory engine: Ephemeral chat, local compliance rules, and persistent organization facts.</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-48 text-xs text-muted-foreground font-mono">LOADING MEMORY ARTIFACTS...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Rules layer */}
          <div className="bg-card border border-border rounded-lg p-5 flex flex-col space-y-4">
            <div className="flex items-center space-x-2 border-b border-border pb-3">
              <ShieldAlert className="w-4 h-4 text-primary" />
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest font-mono">Layer 2: Local Project Rules (AGENT_RULES.md)</h3>
            </div>
            <pre className="flex-1 text-[10px] text-slate-300 font-mono bg-muted/20 border border-border/20 p-4 rounded-lg overflow-y-auto select-text leading-relaxed whitespace-pre-wrap">
              {memory.project_rules}
            </pre>
          </div>

          {/* Persistent memory layer */}
          <div className="bg-card border border-border rounded-lg p-5 flex flex-col space-y-4">
            <div className="flex items-center space-x-2 border-b border-border pb-3">
              <Layers className="w-4 h-4 text-primary" />
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest font-mono">Layer 3: Persistent Memory (Scope: {memory.org_id})</h3>
            </div>
            <pre className="flex-1 text-[10px] text-slate-300 font-mono bg-muted/20 border border-border/20 p-4 rounded-lg overflow-y-auto select-text leading-relaxed whitespace-pre-wrap">
              {memory.persistent_memory}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
