"use client";

import React from "react";
import Link from "next/link";
import { 
  Database, 
  Cpu, 
  ShieldAlert, 
  TrendingUp, 
  Eye, 
  BarChart3, 
  Settings2 
} from "lucide-react";

interface HeaderProps {
  currentStudio: string;
}

const STUDIOS = [
  { id: "knowledge", name: "Knowledge Studio", icon: Database, href: "/knowledge/dashboard" },
  { id: "agent", name: "Agent Studio", icon: Cpu, href: "/agent/chat" },
  { id: "governance", name: "Governance Studio", icon: ShieldAlert, href: "/governance/review-queue" },
  { id: "marketing", name: "Marketing Studio", icon: TrendingUp, href: "/marketing/seo" },
  { id: "observability", name: "Observability Studio", icon: Eye, href: "/observability/health" },
  { id: "executive", name: "Executive Studio", icon: BarChart3, href: "/executive/roi" },
  { id: "admin", name: "Administration Studio", icon: Settings2, href: "/admin/tenant-config" },
];

export default function Header({ currentStudio }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-6 h-14 bg-card border-b border-border select-none z-10">
      {/* Brand Logo */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary text-primary-foreground font-bold text-lg tracking-wider">
          EK
        </div>
        <span className="font-semibold text-sm tracking-widest text-slate-200">
          ESKOS <span className="text-muted-foreground font-normal text-xs ml-1">v2.0</span>
        </span>
      </div>

      {/* Studios Switcher Tabs */}
      <nav className="flex items-center h-full space-x-1">
        {STUDIOS.map((studio) => {
          const Icon = studio.icon;
          const isActive = currentStudio === studio.id;
          return (
            <Link
              key={studio.id}
              href={studio.href}
              className={`flex items-center space-x-2 px-3 h-9 rounded-md transition-all text-xs font-medium ${
                isActive
                  ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden xl:inline">{studio.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Global Notifications/Profile Placeholder */}
      <div className="flex items-center space-x-4">
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-xs text-muted-foreground font-mono">NODE_UPTIME: 18h</span>
      </div>
    </header>
  );
}
