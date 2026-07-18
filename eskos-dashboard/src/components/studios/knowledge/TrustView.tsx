"use client";

import React, { useState } from "react";
import { ShieldCheck, Sliders, Check } from "lucide-react";

export default function TrustView() {
  const [grades, setGrades] = useState({
    datasheet: 95,
    manual: 80,
    web: 60,
  });

  return (
    <div className="p-6 space-y-6 bg-background text-foreground h-full overflow-y-auto select-none">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-xl font-semibold text-slate-100 font-sans tracking-wide">Trust Center</h1>
          <p className="text-xs text-muted-foreground mt-1 font-sans">Configure credibility and source reliability scoring parameters used during retrieval ranking.</p>
        </div>
        <button className="flex items-center space-x-1.5 px-3 py-1.5 bg-primary hover:bg-primary/95 text-white text-[10px] uppercase font-bold tracking-wider rounded transition-all cursor-pointer font-sans">
          <Check className="w-3.5 h-3.5" />
          <span>Save Changes</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sliders Card */}
        <div className="bg-card border border-border rounded-lg p-5 md:col-span-2 space-y-6">
          <div className="flex items-center space-x-2 border-b border-border pb-3">
            <Sliders className="w-4 h-4 text-primary" />
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest font-mono">Source Category Grader</h3>
          </div>

          <div className="space-y-4 text-xs font-mono">
            {/* Slider 1 */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Official Datasheets</span>
                <span className="text-primary font-bold">{grades.datasheet}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={grades.datasheet}
                onChange={(e) => setGrades({ ...grades, datasheet: parseInt(e.target.value) })}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            {/* Slider 2 */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Manual Ingest & ERP Connectors</span>
                <span className="text-primary font-bold">{grades.manual}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={grades.manual}
                onChange={(e) => setGrades({ ...grades, manual: parseInt(e.target.value) })}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            {/* Slider 3 */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Scraped Web & Blogs</span>
                <span className="text-primary font-bold">{grades.web}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={grades.web}
                onChange={(e) => setGrades({ ...grades, web: parseInt(e.target.value) })}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>
          </div>
        </div>

        {/* Info panel */}
        <div className="bg-card border border-border rounded-lg p-5 space-y-4">
          <div className="flex items-center space-x-2 border-b border-border pb-3">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest font-mono">Trust System Status</h3>
          </div>
          <div className="space-y-2 font-mono text-[10px] text-muted-foreground">
            <div className="flex justify-between">
              <span>Security Guard:</span>
              <span className="text-emerald-400 font-semibold uppercase">active</span>
            </div>
            <div className="flex justify-between">
              <span>Injection filter:</span>
              <span className="text-emerald-400 font-semibold uppercase">active</span>
            </div>
            <div className="flex justify-between">
              <span>Spacy parser:</span>
              <span className="text-emerald-400 font-semibold uppercase">healthy</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
