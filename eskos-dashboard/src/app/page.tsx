"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { 
  Atom, Database, Cpu, ShieldCheck, Zap, Server, ChevronRight, 
  Lock, Activity, ArrowUpRight, Compass, Network, RefreshCw, BarChart3, Globe, HardDrive
} from "lucide-react";
import { motion } from "framer-motion";

export default function LandingPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [initSequence, setInitSequence] = useState(false);
  const [progress, setProgress] = useState(0);

  // Background particles simulation (Knowledge Network)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const particles: Array<{ x: number; y: number; vx: number; vy: number; radius: number }> = [];
    const particleCount = 70;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: Math.random() * 1.5 + 0.8
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "rgba(79, 70, 229, 0.3)";
      ctx.strokeStyle = "rgba(79, 70, 229, 0.05)";
      ctx.lineWidth = 0.8;

      particles.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        for (let j = idx + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 160) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const triggerLaunch = (e: React.MouseEvent) => {
    if (initSequence) return;
    e.preventDefault();
    setInitSequence(true);
    let current = 0;
    const interval = setInterval(() => {
      current += 8;
      if (current >= 100) {
        current = 100;
        clearInterval(interval);
        window.location.href = "/home/dashboard";
      }
      setProgress(current);
    }, 100);
  };

  return (
    <div className="bg-[#03060d] text-slate-100 min-h-screen font-sans selection:bg-indigo-500/30 relative overflow-x-hidden flex flex-col justify-between select-none">
      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0c1324_1px,transparent_1px),linear-gradient(to_bottom,#0c1324_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Decorative gradient glow elements */}
      <div className="absolute top-0 left-1/4 w-[700px] h-[700px] bg-indigo-600/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[600px] h-[600px] bg-violet-600/5 rounded-full blur-[180px] pointer-events-none" />

      {/* Background canvas particle graph */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none opacity-50" />

      {/* Top Header Navigation */}
      <header className="max-w-7xl mx-auto w-full px-6 h-24 flex items-center justify-between z-10 relative">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.3)] border border-indigo-500/20">
            <Atom className="w-6 h-6 animate-[spin_10s_linear_infinite]" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base tracking-widest text-slate-100 uppercase font-mono">
              ESKOS
            </span>
            <span className="text-[9px] text-indigo-400 font-mono tracking-wider">ENTERPRISE OS</span>
          </div>
        </div>

        <button
          onClick={triggerLaunch}
          className="flex items-center space-x-1.5 px-4 py-2.5 bg-slate-900 border border-indigo-500/30 hover:border-indigo-400 hover:bg-slate-800 text-slate-200 text-xs font-bold uppercase tracking-wider rounded transition-all shadow-[0_0_15px_rgba(79,70,229,0.15)] cursor-pointer font-mono"
        >
          <span>Launch Portal</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto w-full px-6 py-12 lg:py-20 z-10 relative flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Title and CTA */}
          <div className="lg:col-span-7 space-y-8 text-left">
            <div className="inline-flex items-center space-x-2.5 px-3 py-1.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase tracking-widest font-mono">
              <Activity className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              <span>ESKOS PLATFORM STATUS: 96.8% (PHASE E OPERATIONAL)</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl sm:text-7xl font-extrabold tracking-tight text-white leading-[1.05] font-sans">
                The Operating System of <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400">
                  Scientific Knowledge.
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 max-w-xl leading-relaxed font-sans font-medium">
                Unify enterprise metadata systems, dynamic ontology nodes, and multi-agent compliance audits within a highly secure, obsidian-styled client interface designed for modern AI retrieval.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={triggerLaunch}
                className="flex items-center space-x-1.5 px-6 py-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider rounded transition-all shadow-lg shadow-indigo-600/25 cursor-pointer font-sans"
              >
                <span>Initialize Workspace</span>
                <ChevronRight className="w-4 h-4" />
              </button>
              
              <a
                href="#studios"
                className="flex items-center space-x-1.5 px-6 py-4 bg-slate-950 border border-border/80 hover:bg-slate-900 text-slate-300 hover:text-white text-xs font-bold uppercase tracking-wider rounded transition-all cursor-pointer font-sans"
              >
                <span>Explore Core Services</span>
              </a>
            </div>

            {/* Loading sequence overlay */}
            {initSequence && (
              <div className="p-4 rounded border border-indigo-500/30 bg-card/60 backdrop-blur max-w-md space-y-2.5 font-mono text-[11px] text-slate-300">
                <div className="flex justify-between items-center text-[10px] text-indigo-400 uppercase font-bold tracking-wider">
                  <span>Authorizing Handshake</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-background h-1.5 rounded overflow-hidden">
                  <div className="bg-indigo-500 h-full transition-all duration-100" style={{ width: `${progress}%` }} />
                </div>
                <div className="text-[9px] text-slate-500">
                  {progress < 30 && "> Initializing Qdrant and Neo4j nodes..."}
                  {progress >= 30 && progress < 70 && "> Accessing Kong Gateway secret route proxies..."}
                  {progress >= 70 && "> Redirecting user session to workspace home console..."}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Platform Gateways Live Telemetry Interface */}
          <div className="lg:col-span-5 hidden lg:block">
            <div className="bg-[#0b101d]/85 border border-[#1e293b]/70 p-6 rounded-xl shadow-2xl backdrop-blur-md space-y-6 font-mono text-xs text-slate-300">
              <div className="flex justify-between items-center border-b border-border/40 pb-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center space-x-1.5">
                  <Server className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Gateway Telemetry Hub</span>
                </span>
                <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded border border-emerald-500/20 text-emerald-400 bg-emerald-500/5 text-[9px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping mr-1" />
                  <span>SECURE GATEWAY</span>
                </span>
              </div>

              {/* API and Ingest paths */}
              <div className="space-y-3.5">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Ingest Proxy:</span>
                  <span className="text-indigo-400">/api/v1/knowledge/ingest</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">mTLS Verification:</span>
                  <span className="text-emerald-400 font-bold uppercase">Active (Plugin Enforced)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Graph Database:</span>
                  <span className="text-slate-200">Neo4j Local Instance</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Vector Index:</span>
                  <span className="text-slate-200">Qdrant Node Clustered</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Sync Pipeline:</span>
                  <span className="text-slate-200">FastAPI Publishing microservice</span>
                </div>
              </div>

              <div className="h-px bg-border/40" />

              {/* Performance / Latency check */}
              <div className="space-y-2.5">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Gateway Latencies</span>
                <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                  <div className="bg-background/40 p-2 rounded border border-border/30">
                    <span className="text-slate-400 block mb-0.5">POST Ingest</span>
                    <span className="text-indigo-400 font-bold">14ms</span>
                  </div>
                  <div className="bg-background/40 p-2 rounded border border-border/30">
                    <span className="text-slate-400 block mb-0.5">Neo4j Query</span>
                    <span className="text-indigo-400 font-bold">8ms</span>
                  </div>
                  <div className="bg-background/40 p-2 rounded border border-border/30">
                    <span className="text-slate-400 block mb-0.5">Vector Match</span>
                    <span className="text-emerald-400 font-bold">22ms</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Grid / Core Studios */}
        <section id="studios" className="mt-24 lg:mt-32 space-y-8">
          <div className="text-center lg:text-left space-y-2">
            <span className="block text-[10px] font-bold text-indigo-400 uppercase tracking-widest font-mono">
              Core Operational Framework
            </span>
            <h2 className="text-2xl font-bold text-white tracking-wide font-sans">
              Dynamic Multi-Studio Architecture
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Knowledge Fabric */}
            <div className="bg-card/40 border border-border/80 p-6 rounded-xl flex flex-col justify-between h-52 backdrop-blur-sm hover:border-indigo-500/40 hover:shadow-[0_0_20px_rgba(79,70,229,0.06)] transition-all">
              <Database className="w-7 h-7 text-indigo-400" />
              <div className="space-y-1.5">
                <span className="text-sm font-bold text-slate-200 block font-sans">Knowledge Fabric Studio</span>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  Manage the scientific knowledge graph, dynamic vector embeddings, metadata properties, and document hierarchy.
                </p>
              </div>
            </div>

            {/* AI Agents */}
            <div className="bg-card/40 border border-border/80 p-6 rounded-xl flex flex-col justify-between h-52 backdrop-blur-sm hover:border-indigo-500/40 hover:shadow-[0_0_20px_rgba(79,70,229,0.06)] transition-all">
              <Cpu className="w-7 h-7 text-indigo-400" />
              <div className="space-y-1.5">
                <span className="text-sm font-bold text-slate-200 block font-sans">LangGraph Agent Orchestration</span>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  Configure planning states, active tools, prompt definitions, and cost-billing models for autonomous agents.
                </p>
              </div>
            </div>

            {/* Ingestion Security */}
            <div className="bg-card/40 border border-border/80 p-6 rounded-xl flex flex-col justify-between h-52 backdrop-blur-sm hover:border-indigo-500/40 hover:shadow-[0_0_20px_rgba(79,70,229,0.06)] transition-all">
              <ShieldCheck className="w-7 h-7 text-emerald-400" />
              <div className="space-y-1.5">
                <span className="text-sm font-bold text-slate-200 block font-sans">Deterministic Governance</span>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  Audit generated drafts, confirm competitor data isolation, and review automatic publishing signatures.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Technical Stack Section */}
        <section className="mt-20 lg:mt-28 space-y-6">
          <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono text-center">
            PLATFORM CORE INTEGRATIONS
          </span>
          <div className="flex flex-wrap justify-center items-center gap-6 text-[11px] font-mono text-slate-400">
            <span className="bg-[#0b101d] px-3.5 py-2 rounded border border-border/60">Next.js 15</span>
            <span className="bg-[#0b101d] px-3.5 py-2 rounded border border-border/60">FastAPI</span>
            <span className="bg-[#0b101d] px-3.5 py-2 rounded border border-border/60">Qdrant Vector</span>
            <span className="bg-[#0b101d] px-3.5 py-2 rounded border border-border/60">Neo4j Graph</span>
            <span className="bg-[#0b101d] px-3.5 py-2 rounded border border-border/60">PostgreSQL</span>
            <span className="bg-[#0b101d] px-3.5 py-2 rounded border border-border/60">Kong Gateway</span>
            <span className="bg-[#0b101d] px-3.5 py-2 rounded border border-border/60">Gemini 1.5 Pro</span>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto w-full px-6 py-8 border-t border-[#1e293b]/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-muted-foreground font-mono z-10 relative">
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 rounded bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center text-[9px] font-bold shadow-[0_0_10px_rgba(79,70,229,0.2)]">
            E
          </div>
          <span>ESKOS Enterprise Knowledge Portal</span>
        </div>
        <span>© 2026 Goel Scientific Glass Works. All rights reserved.</span>
      </footer>
    </div>
  );
}
