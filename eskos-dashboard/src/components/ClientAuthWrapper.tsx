"use client";

import React, { useState, useEffect } from "react";
import LoginPage from "./LoginPage";

interface ClientAuthWrapperProps {
  children: React.ReactNode;
}

export default function ClientAuthWrapper({ children }: ClientAuthWrapperProps) {
  const [user, setUser] = useState<any>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("eskos_user");
        if (saved) {
          setUser(JSON.parse(saved));
        }
      } catch (e) {
        console.error("Failed to parse user session", e);
      }
      setChecking(false);
    }
  }, []);

  const handleLogin = (u: { username: string; role: string; tenant: string }) => {
    localStorage.setItem("eskos_user", JSON.stringify(u));
    localStorage.setItem("eskos-active-tenant", u.tenant);
    setUser(u);
    // Dispatch event to trigger tenant state reload in footer
    window.dispatchEvent(new Event("eskos-tenant-changed"));
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-[#03050a] flex items-center justify-center text-xs font-mono text-muted-foreground uppercase tracking-widest">
        Verifying Session...
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return <>{children}</>;
}
