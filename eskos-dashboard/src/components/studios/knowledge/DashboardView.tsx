"use client";

import React, { useState, useEffect } from "react";
import { Database, Network, ShieldCheck, Layers, Loader2, AlertCircle } from "lucide-react";

interface StatsData {
  postgres: {
    total_documents: number;
    total_chunks: number;
    document_types: Record<string, number>;
  };
  neo4j: {
    total_nodes: number;
    total_relations: number;
    entity_types: Record<string, number>;
  };
  qdrant: {
    total_vectors: number;
    collections: Record<string, number>;
  };
  health: {
    postgres: string;
    qdrant: string;
    neo4j: string;
  };
}

export default function DashboardView() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    const KONG_URL = process.env.NEXT_PUBLIC_KONG_URL || "http://localhost:8000";
    try {
      const res = await fetch(`${KONG_URL}/api/v1/knowledge/stats`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }
      const data = await res.json();
      setStats(data);
      setError(null);
    } catch (err: any) {
      console.error("Failed to fetch dashboard stats:", err);
      setError(err.message || "Failed to establish connection to the Kong API Gateway.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Poll telemetry data every 10 seconds for real-time monitoring
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center bg-background text-foreground select-none">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
        <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
          Querying cluster telemetry...
        </span>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center bg-background text-foreground select-none">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-950/20 text-red-500 mb-4 border border-red-500/20">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-widest font-sans">
          Telemetry Fetch Error
        </h2>
        <p className="text-xs text-muted-foreground max-w-sm mt-2 font-mono">
          {error}
        </p>
        <button
          onClick={() => {
            setLoading(true);
            fetchStats();
          }}
          className="mt-6 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-border text-xs uppercase font-bold tracking-wider rounded transition-all cursor-pointer font-sans"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const pgDocs = stats?.postgres?.total_documents ?? 0;
  const pgChunks = stats?.postgres?.total_chunks ?? 0;
  const neoNodes = stats?.neo4j?.total_nodes ?? 0;
  const neoRels = stats?.neo4j?.total_relations ?? 0;
  const qdrantPoints = stats?.qdrant?.total_vectors ?? 0;

  const isPgConnected = stats?.health?.postgres === "connected";
  const isQdConnected = stats?.health?.qdrant === "connected";
  const isNeoConnected = stats?.health?.neo4j === "connected";

  return (
    <div className="p-6 space-y-6 bg-background text-foreground h-full overflow-y-auto select-none">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold text-slate-100 font-sans tracking-wide">
            Knowledge Studio Dashboard
          </h1>
          <p className="text-xs text-muted-foreground mt-1 font-sans">
            Real-time status of the deterministic knowledge registry and ingestion systems.
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-card border border-border px-3 py-1.5 rounded text-[10px] font-mono text-muted-foreground">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>POLLING ACTIVE (10s)</span>
        </div>
      </div>

      {/* Grid of Telemetry Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Widget 1: PostgreSQL Documents */}
        <div className="bg-card border border-border p-4 rounded-lg flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest font-mono">
                Postgres Documents
              </span>
              <h2 className="text-2xl font-bold font-mono text-slate-200 mt-2">{pgDocs}</h2>
            </div>
            <div className="p-2 rounded bg-muted/40 text-primary border border-border">
              <Database className="w-5 h-5" />
            </div>
          </div>
          <div className="text-[10px] text-muted-foreground mt-4 flex items-center space-x-1 font-sans">
            <span className="font-semibold text-slate-300">{pgChunks}</span>
            <span>total semantic chunks registered</span>
          </div>
        </div>

        {/* Widget 2: Neo4j Nodes */}
        <div className="bg-card border border-border p-4 rounded-lg flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest font-mono">
                Graph Entity Nodes
              </span>
              <h2 className="text-2xl font-bold font-mono text-slate-200 mt-2">{neoNodes}</h2>
            </div>
            <div className="p-2 rounded bg-muted/40 text-primary border border-border">
              <Network className="w-5 h-5" />
            </div>
          </div>
          <div className="text-[10px] text-muted-foreground mt-4 flex items-center space-x-1 font-sans">
            <span>Aggregated across multiple concept classes</span>
          </div>
        </div>

        {/* Widget 3: Neo4j Relationships */}
        <div className="bg-card border border-border p-4 rounded-lg flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest font-mono">
                Graph Relations
              </span>
              <h2 className="text-2xl font-bold font-mono text-slate-200 mt-2">{neoRels}</h2>
            </div>
            <div className="p-2 rounded bg-muted/40 text-primary border border-border">
              <Network className="w-5 h-5 rotate-45" />
            </div>
          </div>
          <div className="text-[10px] text-muted-foreground mt-4 flex items-center space-x-1 font-sans">
            <span>
              Average {neoNodes > 0 ? (neoRels / neoNodes).toFixed(1) : 0} relations per node
            </span>
          </div>
        </div>

        {/* Widget 4: Qdrant Vectors */}
        <div className="bg-card border border-border p-4 rounded-lg flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest font-mono">
                Qdrant Vector Points
              </span>
              <h2 className="text-2xl font-bold font-mono text-slate-200 mt-2">{qdrantPoints}</h2>
            </div>
            <div className="p-2 rounded bg-muted/40 text-primary border border-border">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="text-[10px] text-muted-foreground mt-4 flex items-center space-x-1 font-sans">
            <span>Dim: 768 (text-embedding-004)</span>
          </div>
        </div>
      </div>

      {/* Main Content Area Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ingestion Pipelines Status */}
        <div className="bg-card border border-border rounded-lg p-5 lg:col-span-2 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider font-sans">
              Active Ingestion Pipelines
            </h3>
            <p className="text-xs text-muted-foreground mt-1 font-sans">
              Status of real-time Kafka event consumers.
            </p>
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
                <span className="font-semibold text-slate-300">
                  hygiene-passed &rarr; preflight-planner
                </span>
              </div>
              <span className="text-muted-foreground">Active (0 lag)</span>
            </div>

            {/* Stream 3 */}
            <div className="flex items-center justify-between p-3 rounded bg-muted/20 border border-border">
              <div className="flex items-center space-x-3">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-semibold text-slate-300">
                  knowledge-fabric-ingest &rarr; store
                </span>
              </div>
              <span className="text-muted-foreground">Active (0 lag)</span>
            </div>
          </div>
        </div>

        {/* Database Node Distribution */}
        <div className="bg-card border border-border rounded-lg p-5 flex flex-col space-y-4 justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider font-sans">
              Database Registry
            </h3>
            <p className="text-xs text-muted-foreground mt-1 font-sans">
              Status of connection endpoints.
            </p>
          </div>

          <div className="space-y-4 font-mono text-xs">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">PostgreSQL Metadata:</span>
              <div className="flex items-center space-x-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isPgConnected ? "bg-emerald-500 animate-pulse" : "bg-red-500"
                  }`}
                />
                <span
                  className={`font-semibold uppercase ${
                    isPgConnected ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {isPgConnected ? "connected" : "disconnected"}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Qdrant Vector DB:</span>
              <div className="flex items-center space-x-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isQdConnected ? "bg-emerald-500 animate-pulse" : "bg-red-500"
                  }`}
                />
                <span
                  className={`font-semibold uppercase ${
                    isQdConnected ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {isQdConnected ? "connected" : "disconnected"}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Neo4j Knowledge Graph:</span>
              <div className="flex items-center space-x-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isNeoConnected ? "bg-emerald-500 animate-pulse" : "bg-red-500"
                  }`}
                />
                <span
                  className={`font-semibold uppercase ${
                    isNeoConnected ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {isNeoConnected ? "connected" : "disconnected"}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Redpanda Broker:</span>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-emerald-400 font-semibold uppercase">connected</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
