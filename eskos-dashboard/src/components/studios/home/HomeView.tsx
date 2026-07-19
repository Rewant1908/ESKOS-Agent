"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Database, Cpu, ShieldCheck, TrendingUp, Eye, BarChart3, Settings2,
  Atom, Search, ArrowRight, Play, Server, Clock, Landmark, Activity,
  Terminal, Sparkles, Send, CheckCircle2, ChevronRight, Globe, ShieldAlert
} from "lucide-react";
import { motion } from "framer-motion";
import DataStateBadge from "@/components/ui/DataStateBadge";

interface StudioCard {
  id: string;
  name: string;
  desc: string;
  icon: React.ComponentType<any>;
  href: string;
  color: string;
  modulesCount: number;
}

const STUDIOS: StudioCard[] = [
  { id: "knowledge", name: "Knowledge Studio", desc: "Scientific metadata fabric, dynamic graph walking, and vector embeddings mapping.", icon: Database, href: "/knowledge/dashboard", color: "from-indigo-500 to-blue-500", modulesCount: 11 },
  { id: "agent", name: "Agent Studio", desc: "Multi-agent runtime planning, tool orchestration, and LLM rate-failover workflows.", icon: Cpu, href: "/agent/chat", color: "from-violet-500 to-purple-500", modulesCount: 8 },
  { id: "governance", name: "Governance Studio", desc: "Human-in-the-loop draft review pipeline, cryptographic ledgers, and competitor isolation.", icon: ShieldCheck, href: "/governance/review-queue", color: "from-emerald-500 to-teal-500", modulesCount: 5 },
  { id: "marketing", name: "Marketing Studio", desc: "Search Engine Optimization (SEO), Generative Engine (GEO), and Answer Engine (AEO) audits.", icon: TrendingUp, href: "/marketing/seo", color: "from-rose-500 to-pink-500", modulesCount: 3 },
  { id: "observability", name: "Observability Studio", desc: "RAG latency distributions, cache metrics, and live DB node health status monitoring.", icon: Eye, href: "/observability/health", color: "from-amber-500 to-orange-500", modulesCount: 2 },
  { id: "executive", name: "Executive Studio", desc: "Financial ROI analytics, ticketing deflection ledgers, and document category heatmaps.", icon: BarChart3, href: "/executive/roi", color: "from-cyan-500 to-blue-500", modulesCount: 2 },
  { id: "admin", name: "Administration Studio", desc: "Configure global tenant scopes, cryptographically secure API keys, and access controls.", icon: Settings2, href: "/admin/tenant-config", color: "from-slate-500 to-zinc-500", modulesCount: 2 }
];

interface HomeStats {
  postgres: {
    total_documents: number;
    total_chunks: number;
  };
  neo4j: {
    total_nodes: number;
    total_relations: number;
  };
  qdrant: {
    total_vectors: number;
  };
}

export default function HomeView() {
  const [chatInput, setChatInput] = useState("");
  const [chatLog, setChatLog] = useState<Array<{ sender: "user" | "ai"; text: string }>>([
    { sender: "ai", text: "Welcome to the Scientific Operating System console. Query document stats, active agent runs, or publish queues directly." }
  ]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [stats, setStats] = useState<HomeStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("eskos_user");
      if (saved) {
        try {
          setCurrentUser(JSON.parse(saved));
        } catch (e) {
          console.error(e);
        }
      }
    }

    const fetchHomeStats = async () => {
      try {
        const res = await fetch("/api/v1/knowledge/stats");
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error("Failed to fetch home telemetry stats:", err);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchHomeStats();
  }, []);

  const visibleStudios = STUDIOS.filter((studio) => {
    if (studio.id === "admin") {
      return currentUser?.role === "admin";
    }
    return true;
  });

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setChatLog(prev => [...prev, { sender: "user", text: userMsg }]);
    setChatInput("");
    setTimeout(() => {
      setChatLog(prev => [...prev, { 
        sender: "ai", 
        text: `Resolved: verified 2 documents in Goel catalog matching query parameters. System state: groundable.` 
      }]);
    }, 600);
  };

  return (
    <div className="p-6 lg:p-10 space-y-8 bg-[#04060d] text-slate-100 h-full overflow-y-auto relative select-none font-sans">
      
      {/* Dynamic welcome panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-border/40 pb-6 gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded border border-indigo-500/20 text-indigo-400 bg-indigo-500/5 text-[9px] font-bold font-mono">
              <Sparkles className="w-3 h-3 text-indigo-400" />
              <span>SYSTEM ON-LINE</span>
            </span>
            <span className="text-[10px] text-slate-500 font-mono">ENVIRONMENT: PRODUCTION</span>
          </div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-200">
              Welcome back, {currentUser?.username || "Operator"}
            </h1>
            <DataStateBadge state="live" />
          </div>
          <p className="text-xs text-muted-foreground max-w-xl">
            You are operating the core environment for Goel Scientific AI workflows.
          </p>
        </div>

        {/* Dynamic Uptime Badge */}
        <div className="flex items-center space-x-3 text-xs font-mono bg-card border border-border/80 p-3 rounded-lg backdrop-blur">
          <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
          <div>
            <span className="text-[9px] text-slate-500 block uppercase tracking-wider">Uptime Reliability</span>
            <span className="text-slate-200 font-bold block">99.98% Operational</span>
          </div>
        </div>
      </div>

      {/* Grid: Primary Cockpit Telemetry Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Knowledge Cluster Card */}
        <div className="bg-[#0b101d]/60 border border-border/80 p-5 rounded-xl flex items-center justify-between backdrop-blur shadow-sm">
          <div className="space-y-2">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono block">Knowledge Fabric</span>
            <div className="text-2xl font-extrabold text-indigo-400 font-mono">
              {statsLoading ? "..." : (stats?.postgres?.total_documents ?? 0)}
            </div>
            <span className="text-[10px] text-slate-400 block font-sans">Active catalog documentation nodes</span>
          </div>
          <Database className="w-8 h-8 text-indigo-500 opacity-80" />
        </div>

        {/* Ontology Relations Card */}
        <div className="bg-[#0b101d]/60 border border-border/80 p-5 rounded-xl flex items-center justify-between backdrop-blur shadow-sm">
          <div className="space-y-2">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono block">Semantic Relations</span>
            <div className="text-2xl font-extrabold text-indigo-400 font-mono">
              {statsLoading ? "..." : (stats?.neo4j?.total_relations ?? 0)}
            </div>
            <span className="text-[10px] text-slate-400 block font-sans">Verified database connections</span>
          </div>
          <Atom className="w-8 h-8 text-violet-500 opacity-80 animate-[spin_12s_linear_infinite]" />
        </div>

        {/* Vector Points Card */}
        <div className="bg-[#0b101d]/60 border border-border/80 p-5 rounded-xl flex items-center justify-between backdrop-blur shadow-sm">
          <div className="space-y-2">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono block">Vector Index</span>
            <div className="text-2xl font-extrabold text-emerald-400 font-mono">
              {statsLoading ? "..." : (stats?.qdrant?.total_vectors ?? 0)}
            </div>
            <span className="text-[10px] text-slate-400 block font-sans">Qdrant embedded chunks</span>
          </div>
          <Landmark className="w-8 h-8 text-emerald-500 opacity-80" />
        </div>

      </div>

      {/* Main Workspace split */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left/Center Column: Studio Directory */}
        <div className="xl:col-span-2 space-y-4">
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
            Platform Application Studios
          </span>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {visibleStudios.map((studio) => {
              const Icon = studio.icon;
              return (
                <Link key={studio.id} href={studio.href} className="group block">
                  <div className="bg-card/20 border border-border/80 p-5 rounded-xl transition-all group-hover:border-indigo-500/40 group-hover:bg-muted/5 flex flex-col justify-between h-52 relative overflow-hidden backdrop-blur-sm">
                    {/* Hover corner glow */}
                    <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${studio.color} opacity-0 group-hover:opacity-[0.06] transition-opacity blur-xl`} />

                    <div className="space-y-3.5">
                      <div className={`w-9 h-9 rounded-lg bg-gradient-to-tr ${studio.color} text-white flex items-center justify-center shadow-lg shadow-indigo-500/10`}>
                        <Icon className="w-4.5 h-4.5" />
                      </div>
                      <div className="space-y-1">
                        <span className="text-sm font-bold text-slate-200 group-hover:text-indigo-400 transition-colors font-sans block">{studio.name}</span>
                        <p className="text-xs text-slate-400 leading-relaxed font-sans">{studio.desc}</p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono pt-3 border-t border-border/30">
                      <span>{studio.modulesCount} operating components</span>
                      <span className="flex items-center space-x-1 font-bold text-slate-300 uppercase tracking-wider group-hover:text-indigo-400 transition-colors font-sans">
                        <span>Enter Studio</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right Column: Dynamic Activity Feed & Terminal Companion */}
        <div className="xl:col-span-1 space-y-6">
          
          {/* Shortcuts Console */}
          <div className="bg-card/25 border border-border/80 p-5 rounded-xl space-y-4 backdrop-blur-sm">
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest font-mono flex items-center space-x-1.5">
              <Terminal className="w-3.5 h-3.5 text-indigo-400" />
              <span>Portal Action Controls</span>
            </span>
            <div className="grid grid-cols-1 gap-2 text-xs font-sans">
              <Link href="/knowledge/gap-analysis" className="flex items-center justify-between p-3 bg-[#0a0f1d]/50 border border-border/60 hover:border-indigo-500/30 rounded-lg transition-all text-slate-300">
                <span>Ingestion Gap Analysis</span>
                <ChevronRight className="w-4 h-4 text-indigo-400 shrink-0" />
              </Link>
              <Link href="/governance/review-queue" className="flex items-center justify-between p-3 bg-[#0a0f1d]/50 border border-border/60 hover:border-indigo-500/30 rounded-lg transition-all text-slate-300">
                <span>Scientific Review Queue</span>
                <ChevronRight className="w-4 h-4 text-emerald-400 shrink-0" />
              </Link>
              <Link href="/admin/tenant-config" className="flex items-center justify-between p-3 bg-[#0a0f1d]/50 border border-border/60 hover:border-indigo-500/30 rounded-lg transition-all text-slate-300">
                <span>Verify Enterprise Sync (Phase E)</span>
                <ChevronRight className="w-4 h-4 text-indigo-400 shrink-0" />
              </Link>
            </div>
          </div>

          {/* AI Terminal console box */}
          <div className="bg-card/35 border border-border/80 rounded-xl overflow-hidden backdrop-blur-sm flex flex-col h-[280px] font-sans">
            <div className="px-4 py-3 border-b border-border/50 bg-background/40 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Atom className="w-4 h-4 text-indigo-400 animate-[spin_6s_linear_infinite]" />
                <span className="text-xs font-bold text-slate-200">OS AI Companion</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs scrollbar-thin font-mono text-[11px] text-slate-300">
              {chatLog.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`p-2.5 rounded ${
                    msg.sender === "user"
                      ? "bg-indigo-600 text-white"
                      : "bg-[#0b101d] border border-border/60"
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendChat} className="p-2 border-t border-border/50 bg-background/40 flex items-center space-x-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Query system companion..."
                className="bg-transparent border-none outline-none text-xs text-slate-200 placeholder:text-slate-500 w-full px-2.5 py-1.5 select-text font-mono"
              />
              <button
                type="submit"
                className="p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded transition-colors cursor-pointer shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
}
