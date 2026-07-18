"use client";

import React, { useState } from "react";
import { Users, Save, RefreshCw, ToggleLeft, ToggleRight, ShieldAlert, Cpu, Award, Globe, Loader2, Info } from "lucide-react";

interface TenantConfig {
  orgId: string;
  orgName: string;
  industry: string;
  region: string;
  dualBrandIsolation: boolean;
  autonomousApprovals: boolean;
  strictSafetyScrub: boolean;
}

const SEED_CONFIG: TenantConfig = {
  orgId: "goel-scientific",
  orgName: "Goel Scientific Glass Works",
  industry: "Scientific Glassware Manufacturing",
  region: "asia-south1",
  dualBrandIsolation: true,
  autonomousApprovals: false,
  strictSafetyScrub: true
};

export default function TenantConfigView() {
  const [config, setConfig] = useState<TenantConfig>(SEED_CONFIG);
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      alert("Tenant settings updated successfully inside Registry!");
    }, 1000);
  };

  const toggleParam = (key: keyof TenantConfig) => {
    setConfig(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="p-6 space-y-6 bg-background text-foreground h-full overflow-y-auto select-none">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-xl font-semibold text-slate-100 font-sans tracking-wide">Tenant Settings</h1>
          <p className="text-xs text-muted-foreground mt-1 font-sans">
            Configure organization settings, region mappings, and multi-agent compliance rules.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-primary hover:bg-primary/95 text-white text-[10px] uppercase font-bold tracking-wider rounded transition-all cursor-pointer font-sans disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Save className="w-3.5 h-3.5" />
          )}
          <span>Save Settings</span>
        </button>
      </div>

      {/* Main Settings Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left/Center: General Info settings */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border p-5 rounded-lg space-y-4 font-sans text-xs">
            <span className="text-[10px] font-bold text-slate-200 uppercase tracking-widest font-mono flex items-center space-x-1.5 border-b border-border/60 pb-3">
              <Globe className="w-3.5 h-3.5 text-primary" />
              <span>General Tenant Properties</span>
            </span>

            {/* Org ID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] text-muted-foreground uppercase font-bold tracking-wider font-mono">Organization ID</label>
                <input
                  type="text"
                  value={config.orgId}
                  disabled
                  className="w-full bg-background border border-border p-2.5 rounded text-xs text-slate-400 outline-none font-mono cursor-not-allowed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] text-muted-foreground uppercase font-bold tracking-wider font-mono">Organization Name</label>
                <input
                  type="text"
                  value={config.orgName}
                  onChange={(e) => setConfig({ ...config, orgName: e.target.value })}
                  className="w-full bg-background border border-border p-2.5 rounded text-xs text-slate-200 outline-none focus:border-primary font-sans"
                />
              </div>
            </div>

            {/* Region / Industry */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] text-muted-foreground uppercase font-bold tracking-wider font-mono">Industry Vertical</label>
                <input
                  type="text"
                  value={config.industry}
                  onChange={(e) => setConfig({ ...config, industry: e.target.value })}
                  className="w-full bg-background border border-border p-2.5 rounded text-xs text-slate-200 outline-none focus:border-primary font-sans"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] text-muted-foreground uppercase font-bold tracking-wider font-mono">Hosting Region</label>
                <select
                  value={config.region}
                  onChange={(e) => setConfig({ ...config, region: e.target.value })}
                  className="w-full bg-background border border-border p-2.5 rounded text-xs text-slate-200 outline-none focus:border-primary font-mono"
                >
                  <option value="asia-south1">asia-south1 (Mumbai)</option>
                  <option value="us-central1">us-central1 (Iowa)</option>
                  <option value="europe-west3">europe-west3 (Frankfurt)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Toggle compliance options */}
        <div className="lg:col-span-1 border border-border bg-card/30 p-5 rounded-lg flex flex-col space-y-4">
          <span className="text-[10px] font-bold text-slate-200 uppercase tracking-widest font-mono flex items-center space-x-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-primary" />
            <span>Compliance Rules</span>
          </span>

          <div className="space-y-4 text-xs font-sans">
            {/* Dual Brand Isolation Toggle */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[11px] font-semibold text-slate-200">Dual-Brand Isolation</span>
                <p className="text-[9px] text-slate-500 max-w-[180px] leading-relaxed">Block cross-pollination leaks with Borosil.</p>
              </div>
              <button onClick={() => toggleParam("dualBrandIsolation")} className="bg-transparent border-none outline-none cursor-pointer text-primary">
                {config.dualBrandIsolation ? (
                  <ToggleRight className="w-8 h-8 text-primary animate-in fade-in" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-slate-500 animate-in fade-in" />
                )}
              </button>
            </div>

            {/* Autonomous Approvals Toggle */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[11px] font-semibold text-slate-200">Autonomous Approvals</span>
                <p className="text-[9px] text-slate-500 max-w-[180px] leading-relaxed">Allow AI agent to self-verify minor changes.</p>
              </div>
              <button onClick={() => toggleParam("autonomousApprovals")} className="bg-transparent border-none outline-none cursor-pointer text-primary">
                {config.autonomousApprovals ? (
                  <ToggleRight className="w-8 h-8 text-primary animate-in fade-in" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-slate-500 animate-in fade-in" />
                )}
              </button>
            </div>

            {/* Strict Safety Scrubbing Toggle */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[11px] font-semibold text-slate-200">Strict Safety Scrubbing</span>
                <p className="text-[9px] text-slate-500 max-w-[180px] leading-relaxed">Scrub RAG chunks for injection patterns.</p>
              </div>
              <button onClick={() => toggleParam("strictSafetyScrub")} className="bg-transparent border-none outline-none cursor-pointer text-primary">
                {config.strictSafetyScrub ? (
                  <ToggleRight className="w-8 h-8 text-primary animate-in fade-in" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-slate-500 animate-in fade-in" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Guide Card */}
      <div className="bg-card border border-border rounded-lg p-5 space-y-3 font-sans text-xs">
        <span className="text-[10px] font-bold text-slate-200 uppercase tracking-widest font-mono flex items-center space-x-1.5">
          <Info className="w-3.5 h-3.5 text-primary" />
          <span>Tenant Configuration Notice</span>
        </span>
        <p className="text-muted-foreground leading-relaxed">
          Tenant Settings define organization-level credentials, network parameters, and security policies. Modifying these limits will alter the compliance guardrail behavior across all active chat sessions.
        </p>
      </div>
    </div>
  );
}
