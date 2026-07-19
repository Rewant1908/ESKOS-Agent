"use client";
import React from "react";

type DataState = "live" | "simulated" | "stale";

const CONFIG: Record<DataState, { label: string; symbol: string; className: string }> = {
  live: { label: "Live Data", symbol: "\u25CF", className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" },
  simulated: { label: "Simulated", symbol: "\u25D0", className: "bg-amber-500/10 text-amber-400 border-amber-500/30" },
  stale: { label: "Stale", symbol: "\u25CB", className: "bg-zinc-500/10 text-zinc-400 border-zinc-500/30" },
};

export default function DataStateBadge({ state }: { state: DataState }) {
  const config = CONFIG[state];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${config.className}`}
      role="status"
      aria-label={`Data status: ${config.label}`}
    >
      <span aria-hidden="true">{config.symbol}</span>
      {config.label}
    </span>
  );
}
