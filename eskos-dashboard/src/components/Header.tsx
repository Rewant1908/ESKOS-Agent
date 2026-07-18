"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Database, 
  Cpu, 
  ShieldAlert, 
  TrendingUp, 
  Eye, 
  BarChart3, 
  Settings2,
  Atom
} from "lucide-react";
import CommandPalette from "./CommandPalette";
import NotificationsPanel from "./NotificationsPanel";
import UserProfile from "./UserProfile";

interface HeaderProps {
  currentStudio: string;
}

const STUDIOS = [
  { id: "knowledge", name: "Knowledge", icon: Database, href: "/knowledge/dashboard" },
  { id: "agent", name: "Agent Studio", icon: Cpu, href: "/agent/chat" },
  { id: "governance", name: "Governance", icon: ShieldAlert, href: "/governance/review-queue" },
  { id: "marketing", name: "Marketing", icon: TrendingUp, href: "/marketing/seo" },
  { id: "observability", name: "Observe", icon: Eye, href: "/observability/health" },
  { id: "executive", name: "Executive", icon: BarChart3, href: "/executive/roi" },
  { id: "admin", name: "Admin", icon: Settings2, href: "/admin/tenant-config" },
];

export default function Header({ currentStudio }: HeaderProps) {
  const getIsActive = (studioId: string) => {
    return currentStudio === studioId;
  };

  const [currentUser, setCurrentUser] = React.useState<any>(null);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("eskos_user");
      if (saved) {
        try {
          setCurrentUser(JSON.parse(saved));
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  const visibleStudios = STUDIOS.filter((studio) => {
    if (studio.id === "admin") {
      return currentUser?.role === "admin";
    }
    return true;
  });

  return (
    <header className="flex items-center justify-between px-6 h-14 bg-card/40 backdrop-blur-md border-b border-border/80 select-none z-30 relative glass-panel">
      {/* Brand Logo & Portal link */}
      <div className="flex items-center space-x-6">
        <Link href="/" className="flex items-center space-x-2.5 group cursor-pointer">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-cyan-500 text-white font-bold text-lg shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all group-hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]">
            <Atom className="w-5 h-5 animate-[spin_6s_linear_infinite]" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm tracking-widest text-slate-100 uppercase font-sans">
              ESKOS
            </span>
            <span className="text-[8px] text-muted-foreground font-mono leading-none tracking-widest uppercase mt-0.5">
              Knowledge Core v2.0
            </span>
          </div>
        </Link>
      </div>

      {/* Global Command Center search trigger in center */}
      <div className="hidden lg:flex flex-1 justify-center max-w-sm px-6">
        <CommandPalette />
      </div>

      {/* Studios Switcher Tabs */}
      <nav className="hidden xl:flex items-center h-full space-x-1.5 font-sans">
        {visibleStudios.map((studio) => {
          const Icon = studio.icon;
          const isActive = getIsActive(studio.id);
          return (
            <Link
              key={studio.id}
              href={studio.href}
              className={`flex items-center space-x-2 px-3.5 h-8.5 rounded-lg transition-all text-xs font-semibold select-none border ${
                isActive
                  ? "bg-primary border-primary text-white shadow-lg shadow-primary/20 font-bold"
                  : "text-muted-foreground border-transparent hover:text-slate-200 hover:bg-muted/30"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{studio.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Right control utilities */}
      <div className="flex items-center space-x-3.5">
        {/* Platform Completion Stage Badge */}
        <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 bg-primary/10 border border-primary/25 rounded-full text-[10px] font-bold font-mono tracking-wider text-primary uppercase shadow-[0_0_12px_rgba(79,70,229,0.15)]">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span>ESKOS BUILD: 59.1%</span>
        </div>

        {/* Notifications */}
        <NotificationsPanel />

        {/* Workspace Selector dropdown */}
        <UserProfile />
      </div>
    </header>
  );
}
