"use client";

import React, { useState, useEffect } from "react";
import { Users, Server, Zap, CheckCircle2, Shield } from "lucide-react";

export default function Footer() {
  const [tenant, setTenant] = useState("goel-scientific");
  const [cacheHitRate, setCacheHitRate] = useState(89);

  useEffect(() => {
    const interval = setInterval(() => {
      setCacheHitRate((prev) => {
        const delta = Math.floor(Math.random() * 3) - 1;
        const next = prev + delta;
        return Math.max(85, Math.min(95, next));
      });
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleTenantChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTenant = e.target.value;
    setTenant(newTenant);
    if (typeof window !== "undefined") {
      localStorage.setItem("eskos-active-tenant", newTenant);
      window.dispatchEvent(new Event("eskos-tenant-changed"));
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("eskos-active-tenant");
      if (stored) setTenant(stored);
    }
  }, []);

  return (
    <footer className="flex items-center justify-between px-6 h-10 bg-card/35 backdrop-blur-md border-t border-border/80 select-none z-10 text-[10px] text-muted-foreground font-mono glass-panel">
      {/* Tenant Context Selector */}
      <div className="flex items-center space-x-3">
        <Users className="w-3.5 h-3.5 text-primary shrink-0" />
        <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 font-sans">Tenant Partition:</span>
        <div className="relative">
          <select
            value={tenant}
            onChange={handleTenantChange}
            className="bg-transparent text-slate-200 border-none outline-none focus:ring-0 cursor-pointer font-bold py-0.5 rounded font-sans pr-1"
          >
            <option value="goel-scientific" className="bg-popover text-foreground">goel-scientific</option>
            <option value="borosil-scientific" className="bg-popover text-foreground">borosil-scientific</option>
            <option value="shared" className="bg-popover text-foreground">shared-tenant</option>
          </select>
        </div>
      </div>

      {/* Operational Indicators */}
      <div className="hidden md:flex items-center space-x-6 text-[9px] tracking-wider uppercase font-semibold font-sans">
        <div className="flex items-center space-x-2">
          <Server className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          <span className="text-slate-400">Gateway: <span className="text-emerald-400 font-bold font-mono">ONLINE</span></span>
        </div>
        <div className="flex items-center space-x-2">
          <Zap className="w-3.5 h-3.5 text-primary shrink-0" />
          <span className="text-slate-400">Cache Hit: <span className="text-primary font-bold font-mono">{cacheHitRate}%</span></span>
        </div>
        <div className="flex items-center space-x-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          <span className="text-slate-400">Services: <span className="text-emerald-400 font-bold font-mono">HEALTHY</span></span>
        </div>
      </div>
    </footer>
  );
}
