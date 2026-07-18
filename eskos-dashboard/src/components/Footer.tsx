"use client";

import React, { useState, useEffect } from "react";
import { Users, Server, Zap, CheckCircle2 } from "lucide-react";

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
    <footer className="flex items-center justify-between px-6 h-10 bg-card border-t border-border select-none z-10 text-xs text-muted-foreground font-mono">
      {/* Tenant Context Selector */}
      <div className="flex items-center space-x-3">
        <Users className="w-3.5 h-3.5 text-primary" />
        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-sans">Tenant Partition:</span>
        <select
          value={tenant}
          onChange={handleTenantChange}
          className="bg-transparent text-slate-200 border-none outline-none focus:ring-0 cursor-pointer font-semibold text-xs py-0.5 rounded font-sans"
        >
          <option value="goel-scientific" className="bg-card text-foreground">goel-scientific</option>
          <option value="borosil-scientific" className="bg-card text-foreground">borosil-scientific</option>
          <option value="shared" className="bg-card text-foreground">shared-tenant</option>
        </select>
      </div>

      {/* Operational Indicators */}
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2">
          <Server className="w-3.5 h-3.5 text-emerald-500" />
          <span>Kong Gateway: <span className="text-slate-200 font-semibold">online</span></span>
        </div>
        <div className="flex items-center space-x-2">
          <Zap className="w-3.5 h-3.5 text-primary" />
          <span>Cache Hit: <span className="text-slate-200 font-semibold">{cacheHitRate}%</span></span>
        </div>
        <div className="flex items-center space-x-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          <span>Fabric Services: <span className="text-slate-200 font-semibold">healthy</span></span>
        </div>
      </div>
    </footer>
  );
}
