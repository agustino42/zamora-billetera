"use client";

import * as React from "react";
import type { Role } from "@/lib/types";

export interface Session {
  role: Role;
  name: string;
  email: string;
  wallet: string;
}

interface SessionContextValue {
  session: Session | null;
  loading: boolean;
  signIn: (session: Session) => void;
  signOut: () => void;
}

const SessionContext = React.createContext<SessionContextValue | undefined>(
  undefined,
);

const STORAGE_KEY = "zamora.session";

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = React.useState<Session | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setSession(JSON.parse(raw) as Session);
    } catch {
      // ignore
    }
    setLoading(false);
  }, []);

  const signIn = React.useCallback((next: Session) => {
    setSession(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  }, []);

  const signOut = React.useCallback(() => {
    setSession(null);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  return (
    <SessionContext.Provider value={{ session, loading, signIn, signOut }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = React.useContext(SessionContext);
  if (!ctx) {
    throw new Error("useSession debe usarse dentro de <SessionProvider>");
  }
  return ctx;
}
