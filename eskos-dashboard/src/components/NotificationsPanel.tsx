"use client";

import React, { useState } from "react";
import { Bell, Sparkles, CheckCircle2, ShieldAlert, Cpu, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface NotificationItem {
  id: string;
  title: string;
  desc: string;
  type: "success" | "warning" | "alert" | "info";
  time: string;
  unread: boolean;
}

const SEED_NOTIFS: NotificationItem[] = [
  { id: "1", title: "Compliance Scrubber Blocked Leakage", desc: "Competitor reference was safely filtered out of draft output.", type: "alert", time: "2 min ago", unread: true },
  { id: "2", title: "Ingestion Core Sync Complete", desc: "14 metadata chunks from Goel catalog indexed into Qdrant.", type: "success", time: "15 min ago", unread: true },
  { id: "3", title: "Orchestrator Backup Failover", desc: "Gateway rate limit (429) hit; auto-failed back to Gemini-3.1-Lite.", type: "warning", time: "1 hour ago", unread: false }
];

export default function NotificationsPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifs, setNotifs] = useState<NotificationItem[]>(SEED_NOTIFS);

  const unreadCount = notifs.filter((n) => n.unread).length;

  const markAllRead = () => {
    setNotifs(prev => prev.map(n => ({ ...n, unread: false })));
  };

  return (
    <div className="relative select-none font-sans">
      {/* Trigger icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-1.5 bg-muted/40 border border-border/80 rounded-lg hover:border-slate-700/60 text-muted-foreground hover:text-slate-200 transition-all cursor-pointer"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-primary animate-pulse" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay background close trigger */}
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

            {/* Notification Drawer */}
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.12 }}
              className="absolute right-0 mt-2 w-80 bg-popover border border-border rounded-xl shadow-2xl overflow-hidden z-50 glass-panel"
            >
              {/* Header */}
              <div className="flex justify-between items-center px-4 py-3 border-b border-border/50 bg-background/40">
                <span className="text-xs font-semibold text-slate-200">Alert Center</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-[9px] uppercase font-bold text-primary hover:text-primary/80 transition-colors cursor-pointer"
                  >
                    Mark read
                  </button>
                )}
              </div>

              {/* List */}
              <div className="max-h-[320px] overflow-y-auto divide-y divide-border/40">
                {notifs.map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 space-y-1.5 transition-colors text-xs ${
                      item.unread ? "bg-muted/15" : "bg-transparent"
                    }`}
                  >
                    <div className="flex items-start justify-between space-x-2">
                      <div className="flex items-center space-x-2">
                        {item.type === "success" && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                        {item.type === "warning" && <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                        {item.type === "alert" && <ShieldAlert className="w-3.5 h-3.5 text-red-400 shrink-0" />}
                        {item.type === "info" && <Cpu className="w-3.5 h-3.5 text-primary shrink-0" />}
                        <span className="font-semibold text-slate-200 leading-tight">{item.title}</span>
                      </div>
                      <span className="text-[9px] text-muted-foreground font-mono shrink-0">{item.time}</span>
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed pl-5 font-sans">
                      {item.desc}
                    </p>
                  </div>
                ))}

                {notifs.length === 0 && (
                  <div className="text-center py-10 text-xs text-muted-foreground">
                    <Sparkles className="w-6 h-6 text-border mx-auto mb-2" />
                    <span>All quiet. No notifications.</span>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
