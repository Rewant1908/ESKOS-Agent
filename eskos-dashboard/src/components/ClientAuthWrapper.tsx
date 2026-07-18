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
    const checkSession = async () => {
      try {
        const res = await fetch("/api/auth/session");
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
          localStorage.setItem("eskos_user", JSON.stringify(data.user));
          localStorage.setItem("eskos-active-tenant", data.user.tenant);
        } else {
          setUser(null);
          localStorage.removeItem("eskos_user");
        }
      } catch (e) {
        console.error("Session check failed", e);
      } finally {
        setChecking(false);
      }
    };
    checkSession();
  }, []);

  const handleLogin = (u: { username: string; role: string; tenant: string }) => {
    localStorage.setItem("eskos_user", JSON.stringify(u));
    localStorage.setItem("eskos-active-tenant", u.tenant);
    setUser(u);
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
