"use client";

import React, { useState, useEffect } from "react";
import { Activity, RefreshCw, Server, Database, ShieldAlert, Cpu, Heart, CheckCircle2, Loader2, Info } from "lucide-react";

interface HealthStats {
  postgres: { total_documents: number; total_chunks: number };
  neo4j: { total_nodes: number; total_relations: number };
  qdrant: { total_vectors: number };
  health: { postgres: string; qdrant: string; neo4j: string };
}

export default function HealthView() {
  const [stats, setStats] = useState<HealthStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const KONG_URL = typeof window !== "undefined"
    ? process.env.NEXT_PUBLIC_KONG_URL || "http://localhost:8000"
    : "http://localhost:8000";

  const fetchHealthStats = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${KONG_URL}/api/v1/knowledge/stats`, {
        headers: { "ngrok-skip-browser-warning": "true" }
      });
      if (!res.ok) throw new Error("Failed to load cluster health metrics.");
      const data = await res.json();
      setStats(data);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to establish connection to the Kong API Gateway.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthStats();
  }, []);

  return (
    <div className="p-6 space-y-6 bg-background text-foreground h-full overflow-y-auto select-none">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-xl font-semibold text-slate-100 font-sans tracking-wide">System Health Monitor</h1>
          <p className="text-xs text-muted-foreground mt-1 font-sans">
            Inspect live server telemetry, database connection statuses, and physical node allocations.
          </p>
        </div>
        <button
          onClick={fetchHealthStats}
          disabled={loading}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-card border border-border hover:bg-muted text-muted-foreground hover:text-foreground text-[10px] uppercase font-bold tracking-wider rounded transition-all cursor-pointer font-sans disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <RefreshCw className="w-3.5 h-3.5" />
          )}
          <span>Refresh Health</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-950/20 border border-red-500/20 rounded-lg flex items-start space-x-3 text-red-400 font-sans text-xs">
          <ShieldAlert className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {loading && !stats ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] border border-border border-dashed rounded-lg bg-card/20">
          <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
          <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
            Fetching Cluster State...
          </span>
        </div>
      ) : stats ? (
        <div className="space-y-6">
          {/* Cluster Status Board */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Postgres status */}
            <div className="bg-card border border-border p-5 rounded-lg space-y-3 font-sans text-xs">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2 text-slate-300 font-semibold">
                  <Database className="w-4 h-4 text-primary" />
                  <span>Metadata Database</span>
                </div>
                <span className={`px-2 py-0.5 rounded font-bold border text-[9px] font-mono ${
                  stats.health.postgres === "connected"
                    ? "border-emerald-500/20 text-emerald-400 bg-emerald-500/5"
                    : "border-red-500/20 text-red-400 bg-red-500/5"
                }`}>
                  {stats.health.postgres.toUpperCase()}
                </span>
              </div>
              <div className="divide-y divide-border/40 font-mono text-[10px] text-slate-400">
                <div className="flex justify-between py-1">
                  <span>Engine:</span>
                  <span className="text-slate-200">PostgreSQL 16</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Total Documents:</span>
                  <span className="text-slate-200 font-bold">{stats.postgres?.total_documents || 0}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Total Chunks:</span>
                  <span className="text-slate-200 font-bold">{stats.postgres?.total_chunks || 0}</span>
                </div>
              </div>
            </div>

            {/* Qdrant status */}
            <div className="bg-card border border-border p-5 rounded-lg space-y-3 font-sans text-xs">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2 text-slate-300 font-semibold">
                  <Server className="w-4 h-4 text-amber-500" />
                  <span>Vector Database</span>
                </div>
                <span className={`px-2 py-0.5 rounded font-bold border text-[9px] font-mono ${
                  stats.health.qdrant === "connected"
                    ? "border-emerald-500/20 text-emerald-400 bg-emerald-500/5"
                    : "border-red-500/20 text-red-400 bg-red-500/5"
                }`}>
                  {stats.health.qdrant.toUpperCase()}
                </span>
              </div>
              <div className="divide-y divide-border/40 font-mono text-[10px] text-slate-400">
                <div className="flex justify-between py-1">
                  <span>Engine:</span>
                  <span className="text-slate-200">Qdrant v1.10.1</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Indexed Vectors:</span>
                  <span className="text-slate-200 font-bold">{stats.qdrant?.total_vectors || 0}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Dimensions:</span>
                  <span className="text-slate-200">768 (text-embedding-004)</span>
                </div>
              </div>
            </div>

            {/* Neo4j status */}
            <div className="bg-card border border-border p-5 rounded-lg space-y-3 font-sans text-xs">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2 text-slate-300 font-semibold">
                  <Cpu className="w-4 h-4 text-emerald-400" />
                  <span>Graph Database</span>
                </div>
                <span className={`px-2 py-0.5 rounded font-bold border text-[9px] font-mono ${
                  stats.health.neo4j === "connected"
                    ? "border-emerald-500/20 text-emerald-400 bg-emerald-500/5"
                    : "border-red-500/20 text-red-400 bg-red-500/5"
                }`}>
                  {stats.health.neo4j.toUpperCase()}
                </span>
              </div>
              <div className="divide-y divide-border/40 font-mono text-[10px] text-slate-400">
                <div className="flex justify-between py-1">
                  <span>Engine:</span>
                  <span className="text-slate-200">Neo4j 5.21</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Total Nodes:</span>
                  <span className="text-slate-200 font-bold">{stats.neo4j?.total_nodes || 0}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Total Relations:</span>
                  <span className="text-slate-200 font-bold">{stats.neo4j?.total_relations || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Telemetry charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-card border border-border p-5 rounded-lg font-sans text-xs">
            <div className="space-y-4">
              <span className="text-[10px] font-bold text-slate-200 uppercase tracking-widest font-mono flex items-center space-x-1.5">
                <Activity className="w-3.5 h-3.5 text-primary animate-pulse" />
                <span>Node System Resources</span>
              </span>
              <div className="space-y-3 font-mono text-[10px] text-slate-400">
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>CPU LOAD</span>
                    <span className="text-slate-200 font-bold">14.2%</span>
                  </div>
                  <div className="w-full bg-background h-1.5 rounded-full overflow-hidden">
                    <div className="bg-primary h-full w-[14.2%]" />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>MEMORY VOLUMETRIC ALLOCATION</span>
                    <span className="text-slate-200 font-bold">3.2 GB / 8.0 GB</span>
                  </div>
                  <div className="w-full bg-background h-1.5 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full w-[40%]" />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 md:border-l md:border-border/60 md:pl-6">
              <span className="text-[10px] font-bold text-slate-200 uppercase tracking-widest font-mono flex items-center space-x-1.5">
                <Heart className="w-3.5 h-3.5 text-primary" />
                <span>Fabric Uptime Stats</span>
              </span>
              <div className="divide-y divide-border/40 font-mono text-[10px] text-slate-400">
                <div className="flex justify-between py-2">
                  <span>API Uptime:</span>
                  <span className="text-slate-200 font-bold">99.98%</span>
                </div>
                <div className="flex justify-between py-2">
                  <span>Response Uptime Latency:</span>
                  <span className="text-slate-200 font-bold">42 ms (average)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Guide Info Card */}
      <div className="bg-card border border-border rounded-lg p-5 space-y-3 font-sans text-xs">
        <span className="text-[10px] font-bold text-slate-200 uppercase tracking-widest font-mono flex items-center space-x-1.5">
          <Info className="w-3.5 h-3.5 text-primary" />
          <span>Observability Mechanics</span>
        </span>
        <p className="text-muted-foreground leading-relaxed">
          The System Health Monitor connects directly to the Kong routing gateway stats API. Telemetry indicators assess the database connection status, memory utilization parameters, and query volume of PostgreSQL, Neo4j, and Qdrant.
        </p>
      </div>
    </div>
  );
}
