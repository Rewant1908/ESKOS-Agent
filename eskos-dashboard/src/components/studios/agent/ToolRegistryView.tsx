"use client";

import React, { useEffect, useState } from "react";
import { Wrench, ToggleLeft, ToggleRight } from "lucide-react";
import DataStateBadge from "@/components/ui/DataStateBadge";

const KONG_URL = process.env.NEXT_PUBLIC_KONG_URL || "http://localhost:8000";

interface Tool {
  name: string;
  description: string;
  parameters: any;
  active: boolean;
}

export default function ToolRegistryView() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTools = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${KONG_URL}/api/v1/agent/tools`, {
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });
      const data = await res.json();
      setTools(data.tools || []);
    } catch (err) {
      console.error("Failed to fetch tools", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTools();
  }, []);

  const toggleTool = async (name: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`${KONG_URL}/api/v1/agent/tools/toggle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true"
        },
        body: JSON.stringify({ name, active: !currentStatus }),
      });
      if (res.ok) {
        setTools(prev => prev.map(t => t.name === name ? { ...t, active: !currentStatus } : t));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 space-y-6 bg-background text-foreground h-full overflow-y-auto select-none">
      <div>
        <div className="flex items-center space-x-3">
          <h1 className="text-xl font-semibold text-slate-100 font-sans tracking-wide">Tool Registry</h1>
          <DataStateBadge state="live" />
        </div>
        <p className="text-xs text-muted-foreground mt-1 font-sans">Inspect, configure, and toggle the capabilities/tools available to the AI multi-agent planner.</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-48 text-xs text-muted-foreground font-mono">LOADING REGISTRY...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tools.map((tool) => (
            <div key={tool.name} className="bg-card border border-border p-5 rounded-lg flex flex-col justify-between space-y-4">
              <div>
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-2">
                    <Wrench className="w-4 h-4 text-primary" />
                    <span className="text-xs font-bold text-slate-200 font-mono">{tool.name}</span>
                  </div>
                  <button 
                    onClick={() => toggleTool(tool.name, tool.active)}
                    className="cursor-pointer text-muted-foreground hover:text-slate-200 transition-colors bg-transparent border-none outline-none"
                  >
                    {tool.active ? (
                      <ToggleRight className="w-7 h-7 text-primary animate-in fade-in" />
                    ) : (
                      <ToggleLeft className="w-7 h-7 text-muted-foreground animate-in fade-in" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-slate-300 font-sans mt-3 leading-relaxed">{tool.description}</p>
              </div>

              {/* Schema Inspector */}
              <div className="border-t border-border/50 pt-3">
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest font-mono">JSON schema parameters</span>
                <pre className="mt-2 text-[10px] text-slate-400 font-mono bg-muted/20 p-2.5 rounded border border-border/20 max-h-32 overflow-y-auto select-text">
                  {JSON.stringify(tool.parameters, null, 2)}
                </pre>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
