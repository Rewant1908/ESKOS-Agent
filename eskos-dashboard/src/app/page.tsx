"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { 
  Atom, Database, Cpu, ShieldCheck, Zap, Server, ChevronRight, 
  Lock, Activity, ArrowUpRight, Compass, Network, RefreshCw, BarChart3
} from "lucide-react";
import { motion } from "framer-motion";

export default function LandingPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
    const particleCount = 60;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 1.5 + 1
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "rgba(59, 130, 246, 0.4)";
      ctx.strokeStyle = "rgba(59, 130, 246, 0.04)";
      ctx.lineWidth = 1;

      // Update & Draw particles
      particles.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        // Draw connections
        for (let j = idx + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 150) {
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

  return (
    <div className="bg-[#030712] text-foreground min-h-screen font-sans selection:bg-primary/30 relative overflow-hidden flex flex-col justify-between select-none cyber-grid">
      {/* Background canvas particle graph */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none opacity-40" />

      {/* Decorative gradient overlay */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[140px] pointer-events-none animate-soft-glow" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[160px] pointer-events-none animate-soft-glow" />

      {/* Top Header Navigation */}
      <header className="max-w-7xl mx-auto w-full px-6 h-20 flex items-center justify-between z-10 relative">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-cyan-500 text-white flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.35)]">
            <Atom className="w-5.5 h-5.5 animate-[spin_6s_linear_infinite]" />
          </div>
          <span className="font-bold text-base tracking-widest text-slate-100 uppercase">
            ESKOS
          </span>
        </div>

        <Link
          href="/home/dashboard"
          className="flex items-center space-x-1.5 px-4 py-2 bg-white hover:bg-slate-100 text-black text-xs font-bold uppercase tracking-wider rounded-lg transition-all shadow-[0_4px_20px_rgba(255,255,255,0.15)] cursor-pointer"
        >
          <span>Launch Platform</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto w-full px-6 py-16 lg:py-24 z-10 relative flex-1 flex flex-col justify-center">
        <div className="max-w-3xl space-y-8">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest font-mono">
            <Activity className="w-3.5 h-3.5 text-primary animate-pulse" />
            <span>ESKOS Build Stage: 59.1% (Phase 6 Core)</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.05] font-sans">
              The Operating System of <br />
              <span className="gradient-text-blue">Scientific Knowledge.</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-400 max-w-xl leading-relaxed font-sans">
              Deploy deterministic data routing, dynamic vector embeddings walks, and human-in-the-loop compliance checks inside a sleek enterprise interface.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/home/dashboard"
              className="flex items-center space-x-1.5 px-5 py-3.5 bg-primary hover:bg-primary/95 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-primary/20 cursor-pointer"
            >
              <span>Initialize Workspace</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
            
            <a
              href="#capabilities"
              className="flex items-center space-x-1.5 px-5 py-3.5 bg-card border border-border hover:bg-muted text-slate-300 hover:text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer"
            >
              <span>Explore Studios</span>
            </a>
          </div>
        </div>

        {/* Feature Grid / Capabilities */}
        <section id="capabilities" className="mt-24 lg:mt-32 space-y-8">
          <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
            Core Operating Capabilities
          </span>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Knowledge Fabric */}
            <div className="bg-card border border-border/80 p-6 rounded-2xl flex flex-col justify-between h-48 backdrop-blur-sm">
              <Database className="w-6 h-6 text-primary" />
              <div className="space-y-1">
                <span className="text-sm font-bold text-slate-200 block font-sans">Knowledge Fabric</span>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">Wired vector collection queries, automatic chunk parsing, and Neo4j relations map walking.</p>
              </div>
            </div>

            {/* AI Agents */}
            <div className="bg-card border border-border/80 p-6 rounded-2xl flex flex-col justify-between h-48 backdrop-blur-sm">
              <Cpu className="w-6 h-6 text-primary" />
              <div className="space-y-1">
                <span className="text-sm font-bold text-slate-200 block font-sans">Multi-Agent Planner</span>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">Orchestrate complex planning nodes, prompts registries, and live token analytics.</p>
              </div>
            </div>

            {/* Ingestion Security */}
            <div className="bg-card border border-border/80 p-6 rounded-2xl flex flex-col justify-between h-48 backdrop-blur-sm">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
              <div className="space-y-1">
                <span className="text-sm font-bold text-slate-200 block font-sans">Consensus Governance</span>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">Validate drafts, protect competitor leakage, and secure compliance signatures.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto w-full px-6 py-8 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-muted-foreground font-mono z-10 relative">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-md bg-gradient-to-tr from-primary to-cyan-500 text-white flex items-center justify-center text-[8px] font-bold">
            E
          </div>
          <span>ESKOS Enterprise Knowledge Portal</span>
        </div>
        <span>© 2026 Goel Scientific Inc. All rights reserved.</span>
      </footer>
    </div>
  );
}
