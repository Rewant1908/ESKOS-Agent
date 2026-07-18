"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Database, Cpu, ShieldCheck, TrendingUp, Eye, BarChart3, Settings2,
  Atom, Search, ArrowRight, Play, Server, Clock, Landmark, Activity,
  Terminal, Sparkles, Send, CheckCircle2
} from "lucide-react";
import { motion } from "framer-motion";

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
  { id: "knowledge", name: "Knowledge Studio", desc: "Scientific metadata fabric, dynamic graph walking, and vector embeddings mapping.", icon: Database, href: "/knowledge/dashboard", color: "from-blue-500 to-indigo-500", modulesCount: 11 },
  { id: "agent", name: "Agent Studio", desc: "Multi-agent runtime planning, tool orchestration, and LLM rate-failover workflows.", icon: Cpu, href: "/agent/chat", color: "from-violet-500 to-purple-500", modulesCount: 8 },
  { id: "governance", name: "Governance Studio", desc: "Human-in-the-loop draft review pipeline, cryptographic ledgers, and competitor isolation.", icon: ShieldCheck, href: "/governance/review-queue", color: "from-emerald-500 to-teal-500", modulesCount: 5 },
  { id: "marketing", name: "Marketing Studio", desc: "Search Engine Optimization (SEO), Generative Engine (GEO), and Answer Engine (AEO) audits.", icon: TrendingUp, href: "/marketing/seo", color: "from-rose-500 to-pink-500", modulesCount: 3 },
  { id: "observability", name: "Observability Studio", desc: "RAG latency distributions, cache metrics, and live DB node health status monitoring.", icon: Eye, href: "/observability/health", color: "from-amber-500 to-orange-500", modulesCount: 2 },
  { id: "executive", name: "Executive Studio", desc: "Financial ROI analytics, ticketing deflection ledgers, and document category heatmaps.", icon: BarChart3, href: "/executive/roi", color: "from-cyan-500 to-blue-500", modulesCount: 2 }
];

export default function HomeView() {
  const [chatInput, setChatInput] = useState("");
  const [chatLog, setChatLog] = useState<Array<{ sender: "user" | "ai"; text: string }>>([
    { sender: "ai", text: "Welcome to the Scientific Operating System. Ask me anything about the Goel Scientific database or active agents." }
  ]);

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setChatLog(prev => [...prev, { sender: "user", text: userMsg }]);
    setChatInput("");
    setTimeout(() => {
      setChatLog(prev => [...prev, { 
        sender: "ai", 
        text: `Analysis complete. Matched 4 document chunks in Goel Reactors collection with average confidence 94.2%. Lineage trace ID: a8ef21cb8b.` 
      }]);
    }, 600);
  };

  return (
    <div className="p-6 lg:p-10 space-y-10 bg-background text-foreground h-full overflow-y-auto cyber-grid relative">
      {/* Background glow backplates */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none animate-soft-glow" />

      {/* Hero Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 z-10 relative">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Platform Online</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-white font-sans leading-none">
            Scientific Knowledge Operating System
          </h1>
          <p className="text-sm text-slate-400 font-sans max-w-xl leading-relaxed">
            Manage your scientific knowledge fabric. Synthesize documentation, route multi-agent planning loops, and audit compliance metrics within an obsidian core.
          </p>
        </div>

        {/* Global summary stats */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
          <div className="bg-card/40 border border-border/80 px-4 py-3 rounded-xl flex items-center space-x-3 backdrop-blur-sm">
            <Server className="w-5 h-5 text-primary" />
            <div>
              <span className="text-[9px] text-muted-foreground block uppercase font-bold tracking-wider">Gateway State</span>
              <span className="text-slate-200 font-bold block mt-0.5">goel-scientific</span>
            </div>
          </div>

          <div className="bg-card/40 border border-border/80 px-4 py-3 rounded-xl flex items-center space-x-3 backdrop-blur-sm">
            <Landmark className="w-5 h-5 text-emerald-400" />
            <div>
              <span className="text-[9px] text-muted-foreground block uppercase font-bold tracking-wider">Net Savings</span>
              <span className="text-emerald-400 font-bold block mt-0.5">$394,200</span>
            </div>
          </div>

          <div className="bg-card/40 border border-border/80 px-4 py-3 rounded-xl flex items-center space-x-3 backdrop-blur-sm shadow-[0_0_15px_rgba(79,70,229,0.12)]">
            <Atom className="w-5 h-5 text-primary animate-[spin_4s_linear_infinite]" />
            <div>
              <span className="text-[9px] text-muted-foreground block uppercase font-bold tracking-wider">Build Stage</span>
              <span className="text-primary font-bold block mt-0.5">59.1% Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Level Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 z-10 relative">
        {/* Left/Center Column: Studios Cards */}
        <div className="xl:col-span-2 space-y-6">
          <span className="block text-[10px] font-bold text-slate-200 uppercase tracking-widest font-mono">
            Operating System Studios
          </span>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {STUDIOS.map((studio, idx) => {
              const Icon = studio.icon;
              return (
                <Link key={studio.id} href={studio.href} className="group block">
                  <div className="bg-card/30 border border-border/80 p-5 rounded-xl transition-all group-hover:border-primary/50 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.08)] flex flex-col justify-between h-56 relative overflow-hidden backdrop-blur-sm">
                    {/* Corner gradient glow */}
                    <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${studio.color} opacity-0 group-hover:opacity-10 transition-opacity blur-2xl`} />

                    <div className="space-y-3">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-tr ${studio.color} text-white flex items-center justify-center shadow-lg`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <span className="text-sm font-bold text-slate-200 group-hover:text-primary transition-colors font-sans block">{studio.name}</span>
                        <p className="text-xs text-slate-400 leading-relaxed font-sans">{studio.desc}</p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-muted-foreground font-mono pt-3 border-t border-border/30">
                      <span>{studio.modulesCount} active modules</span>
                      <span className="flex items-center space-x-1 font-bold text-slate-300 uppercase tracking-wider group-hover:text-primary transition-colors font-sans">
                        <span>Launch</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right Column: AI Assistant Terminal & Actions */}
        <div className="xl:col-span-1 space-y-6">
          {/* Quick Actions */}
          <div className="bg-card/20 border border-border/80 p-5 rounded-xl space-y-4 backdrop-blur-sm">
            <span className="text-[10px] font-bold text-slate-200 uppercase tracking-widest font-mono flex items-center space-x-1.5">
              <Activity className="w-3.5 h-3.5 text-primary" />
              <span>Console Shortcuts</span>
            </span>
            <div className="grid grid-cols-1 gap-2 text-xs font-sans">
              <Link href="/knowledge/gap-analysis" className="flex items-center justify-between p-3 bg-background/50 border border-border/60 hover:border-slate-700 hover:bg-muted/10 rounded-lg transition-all text-slate-300">
                <span>Run Gap Analysis Audit</span>
                <Play className="w-3.5 h-3.5 text-primary shrink-0" />
              </Link>
              <Link href="/governance/review-queue" className="flex items-center justify-between p-3 bg-background/50 border border-border/60 hover:border-slate-700 hover:bg-muted/10 rounded-lg transition-all text-slate-300">
                <span>Verify Pending Review Queue</span>
                <Play className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              </Link>
              <Link href="/admin/api-keys" className="flex items-center justify-between p-3 bg-background/50 border border-border/60 hover:border-slate-700 hover:bg-muted/10 rounded-lg transition-all text-slate-300">
                <span>Provision Client API Key</span>
                <Play className="w-3.5 h-3.5 text-primary shrink-0" />
              </Link>
            </div>
          </div>

          {/* AI Companion */}
          <div className="bg-card/35 border border-border/80 rounded-xl overflow-hidden backdrop-blur-sm flex flex-col h-[320px] font-sans">
            {/* Header */}
            <div className="px-4 py-3 border-b border-border/50 bg-background/40 flex items-center space-x-2">
              <Atom className="w-4 h-4 text-primary animate-[spin_4s_linear_infinite]" />
              <span className="text-xs font-bold text-slate-200">OS Copilot Companion</span>
            </div>

            {/* Chatlog */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs scrollbar-thin">
              {chatLog.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`p-3 rounded-lg max-w-[85%] leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-primary text-white"
                      : "bg-background/80 border border-border/60 text-slate-300 font-mono text-[11px]"
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Input form */}
            <form onSubmit={handleSendChat} className="p-2.5 border-t border-border/50 bg-background/40 flex items-center space-x-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask active copilot..."
                className="bg-transparent border-none outline-none text-xs text-slate-200 placeholder:text-slate-500 w-full px-2.5 py-1.5 select-text"
              />
              <button
                type="submit"
                className="p-1.5 bg-primary hover:bg-primary/95 text-white rounded-lg transition-colors cursor-pointer shrink-0"
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
