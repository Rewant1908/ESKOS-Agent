"use client";

import React from "react";
import { AlertTriangle, Wrench } from "lucide-react";

interface FallbackViewProps {
  studio: string;
  module: string;
}

export default function FallbackView({ studio, module }: FallbackViewProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center select-none bg-background text-foreground">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-slate-800 text-slate-400 mb-4 border border-border">
        <Wrench className="w-6 h-6" />
      </div>
      <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-widest font-sans">
        {studio.replace("-", " ")} Studio: {module.replace("-", " ")}
      </h2>
      <p className="text-xs text-muted-foreground max-w-sm mt-2 font-sans">
        This module is currently scheduled for development. It belongs to the next phase of the ESKOS implementation sequence.
      </p>
      <div className="mt-6 flex items-center space-x-2 text-[10px] uppercase font-bold tracking-wider text-primary border border-primary/20 px-3 py-1.5 rounded bg-primary/5 font-sans">
        <AlertTriangle className="w-3.5 h-3.5" />
        <span>Awaiting Phase Roadmap Trigger</span>
      </div>
    </div>
  );
}
