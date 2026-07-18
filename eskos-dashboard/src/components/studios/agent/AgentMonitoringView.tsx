"use client";

import React from "react";
import { Cpu } from "lucide-react";

export default function AgentMonitoringView() {
  const jobs = [
    { id: "run-287a", agent: "planner", status: "completed", latency: "1420ms", usage: "1284 tks" },
    { id: "run-287b", agent: "researcher", status: "completed", latency: "860ms", usage: "512 tks" },
    { id: "run-287c", agent: "compliance", status: "completed", latency: "210ms", usage: "340 tks" },
  ];

  return (
    <div className="p-6 space-y-6 bg-background text-foreground h-full overflow-y-auto select-none">
      <div>
        <h1 className="text-xl font-semibold text-slate-100 font-sans tracking-wide">Agent Monitoring</h1>
        <p className="text-xs text-muted-foreground mt-1 font-sans">Monitor active agent tasks, latency telemetry, and model execution times in real-time.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border p-4 rounded-lg flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest font-mono">Average Latency</span>
            <h2 className="text-2xl font-bold font-mono text-slate-200 mt-2">1,120ms</h2>
          </div>
        </div>

        <div className="bg-card border border-border p-4 rounded-lg flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest font-mono">Active Hand-offs</span>
            <h2 className="text-2xl font-bold font-mono text-slate-200 mt-2">0 active</h2>
          </div>
        </div>

        <div className="bg-card border border-border p-4 rounded-lg flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest font-mono">Compliance Violations Blocked</span>
            <h2 className="text-2xl font-bold font-mono text-emerald-400 mt-2">0 blocks</h2>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-5 space-y-4">
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest font-mono">Recent Execution Runs</h3>
        <div className="space-y-2.5 font-mono text-xs text-muted-foreground">
          {jobs.map((job) => (
            <div key={job.id} className="flex justify-between items-center p-3 rounded bg-muted/20 border border-border">
              <div className="flex items-center space-x-2">
                <Cpu className="w-4 h-4 text-primary" />
                <span className="text-slate-200 font-semibold">{job.id}</span>
                <span>({job.agent})</span>
              </div>
              <div className="flex items-center space-x-4">
                <span>{job.latency}</span>
                <span>{job.usage}</span>
                <span className="text-emerald-400 font-bold uppercase">{job.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
