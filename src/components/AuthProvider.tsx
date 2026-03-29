"use client";

import { safeNextPath } from "@/lib/authPaths";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { syncUserProfileToSupabase } from "@/lib/syncUserProfileToSupabase";
import type { Session, User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isConfigured: boolean;
  refreshSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSession = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setSession(null);
      return;
    }
    try {
      const { data } = await supabase.auth.getSession();
      setSession(data.session ?? null);
    } catch {
      setSession(null);
    }
  }, []);

  /** Fallback: if ?code= lands outside /auth/callback, exchange here (Google OAuth uses /auth/callback). */
  useEffect(() => {
    if (!isSupabaseConfigured || typeof window === "undefined") return;

    const url = new URL(window.location.href);
    if (url.pathname === "/auth/callback") return;

    const code = url.searchParams.get("code");
    if (!code) return;

    let alive = true;
    void (async () => {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (!alive) return;
      if (error) {
        router.replace("/login");
        return;
      }
      if (data.session) setSession(data.session);

      url.searchParams.delete("code");
      url.searchParams.delete("error");
      url.searchParams.delete("error_description");
      const qs = url.searchParams.toString();
      window.history.replaceState(
        {},
        document.title,
        `${url.pathname}${qs ? `?${qs}` : ""}${url.hash}`,
      );

      const hasName = localStorage.getItem("userName")?.trim();
      const next = safeNextPath(sessionStorage.getItem("kaiAuthNext"));
      sessionStorage.removeItem("kaiAuthNext");
      router.replace(hasName ? next : "/onboarding");
    })();

    return () => {
      alive = false;
    };
  }, [router]);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      queueMicrotask(() => setLoading(false));
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!cancelled) setSession(data.session ?? null);
      } catch {
        if (!cancelled) setSession(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured || !session?.user) return;
    void syncUserProfileToSupabase(session.user);
  }, [session?.user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      session,
      loading,
      isConfigured: isSupabaseConfigured,
      refreshSession,
    }),
    [session, loading, refreshSession],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
