"use client";

import React, { useState, useEffect } from "react";
import { Database, Network, ShieldAlert, Cpu, Layers } from "lucide-react";

export default function DashboardView() {
  const [metrics, setMetrics] = useState({
    entities: 185,
    relations: 412,
    vectors: 246,
    activeJobs: 0,
    hygienePassed: 98.4,
  });

  return (
    <div className="p-6 space-y-6 bg-background text-foreground h-full overflow-y-auto select-none">
      {/* Title */}
      <div>
        <h1 className="text-xl font-semibold text-slate-100 font-sans tracking-wide">Knowledge Studio Dashboard</h1>
        <p className="text-xs text-muted-foreground mt-1 font-sans">Real-time status of the deterministic knowledge registry and ingestion systems.</p>
      </div>

      {/* Grid of Telemetry Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Widget 1: Entities */}
        <div className="bg-card border border-border p-4 rounded-lg flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest font-mono">Knowledge Graph Nodes</span>
              <h2 className="text-2xl font-bold font-mono text-slate-200 mt-2">{metrics.entities}</h2>
            </div>
            <div className="p-2 rounded bg-muted/40 text-primary border border-border">
              <Network className="w-5 h-5" />
            </div>
          </div>
          <div className="text-[10px] text-muted-foreground mt-4 flex items-center space-x-1 font-sans">
            <span className="text-emerald-500 font-bold">+12%</span>
            <span>growth this week</span>
          </div>
        </div>

        {/* Widget 2: Relations */}
        <div className="bg-card border border-border p-4 rounded-lg flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest font-mono">Graph Relationships</span>
              <h2 className="text-2xl font-bold font-mono text-slate-200 mt-2">{metrics.relations}</h2>
            </div>
            <div className="p-2 rounded bg-muted/40 text-primary border border-border">
              <Database className="w-5 h-5" />
            </div>
          </div>
          <div className="text-[10px] text-muted-foreground mt-4 flex items-center space-x-1 font-sans">
            <span>Average 2.2 edges per node</span>
          </div>
        </div>

        {/* Widget 3: Vectors */}
        <div className="bg-card border border-border p-4 rounded-lg flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest font-mono">Qdrant Vector Points</span>
              <h2 className="text-2xl font-bold font-mono text-slate-200 mt-2">{metrics.vectors}</h2>
            </div>
            <div className="p-2 rounded bg-muted/40 text-primary border border-border">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="text-[10px] text-muted-foreground mt-4 flex items-center space-x-1 font-sans">
            <span>Dimension: 768 (text-embedding-004)</span>
          </div>
        </div>

        {/* Widget 4: Hygiene Rate */}
        <div className="bg-card border border-border p-4 rounded-lg flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest font-mono">Hygiene Pass Rate</span>
              <h2 className="text-2xl font-bold font-mono text-emerald-400 mt-2">{metrics.hygienePassed}%</h2>
            </div>
            <div className="p-2 rounded bg-muted/40 text-emerald-500 border border-border">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="text-[10px] text-muted-foreground mt-4 flex items-center space-x-1 font-sans">
            <span className="text-emerald-500 font-bold">Safe</span>
            <span>0 documents quarantined today</span>
          </div>
        </div>
      </div>

      {/* Main Content Area Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ingestion Pipelines Status */}
        <div className="bg-card border border-border rounded-lg p-5 lg:col-span-2 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider font-sans">Active Ingestion Pipelines</h3>
            <p className="text-xs text-muted-foreground mt-1 font-sans">Status of real-time Kafka event consumers.</p>
          </div>
          
          <div className="space-y-3 font-mono text-xs">
            {/* Stream 1 */}
            <div className="flex items-center justify-between p-3 rounded bg-muted/20 border border-border">
              <div className="flex items-center space-x-3">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-semibold text-slate-300">raw-ingest &rarr; hygiene-pipeline</span>
              </div>
              <span className="text-muted-foreground">Active (0 lag)</span>
            </div>

            {/* Stream 2 */}
            <div className="flex items-center justify-between p-3 rounded bg-muted/20 border border-border">
              <div className="flex items-center space-x-3">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-semibold text-slate-300">hygiene-passed &rarr; preflight-planner</span>
              </div>
              <span className="text-muted-foreground">Active (0 lag)</span>
            </div>

            {/* Stream 3 */}
            <div className="flex items-center justify-between p-3 rounded bg-muted/20 border border-border">
              <div className="flex items-center space-x-3">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-semibold text-slate-300">knowledge-fabric-ingest &rarr; store</span>
              </div>
              <span className="text-muted-foreground">Active (0 lag)</span>
            </div>
          </div>
        </div>

        {/* Database Node Distribution */}
        <div className="bg-card border border-border rounded-lg p-5 flex flex-col space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider font-sans">Database Registry</h3>
            <p className="text-xs text-muted-foreground mt-1 font-sans">Status of connection endpoints.</p>
          </div>
          
          <div className="space-y-2.5 font-mono text-xs">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">PostgreSQL Metadata:</span>
              <span className="text-emerald-400 font-semibold uppercase">connected</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Qdrant Vector DB:</span>
              <span className="text-emerald-400 font-semibold uppercase">connected</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Neo4j Knowledge Graph:</span>
              <span className="text-emerald-400 font-semibold uppercase">connected</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Redpanda Broker:</span>
              <span className="text-emerald-400 font-semibold uppercase">connected</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
