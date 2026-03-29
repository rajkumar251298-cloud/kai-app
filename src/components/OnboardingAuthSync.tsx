"use client";

import { useAuth } from "@/components/AuthProvider";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/** Paths that work without a Supabase session (core app + auth + legal). */
function allowWithoutSupabaseUser(pathname: string) {
  if (pathname === "/") return true;
  if (pathname === "/board" || pathname.startsWith("/board/")) return true;
  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/"))
    return true;
  if (pathname === "/profile" || pathname.startsWith("/profile/")) return true;
  if (pathname === "/chat" || pathname.startsWith("/chat/")) return true;
  if (pathname === "/onboarding" || pathname.startsWith("/onboarding/"))
    return true;
  if (pathname === "/login" || pathname.startsWith("/login/")) return true;
  if (pathname === "/auth/callback" || pathname.startsWith("/auth/callback/"))
    return true;
  if (pathname === "/splash" || pathname.startsWith("/splash/")) return true;
  if (pathname === "/privacy" || pathname.startsWith("/privacy/")) return true;
  if (pathname === "/terms" || pathname.startsWith("/terms/")) return true;
  return false;
}

/**
 * When Supabase is configured: signed-out users may use Home, Board, Dashboard, etc.;
 * only unknown routes get sent to onboarding. Signed-in users leave /onboarding for home.
 */
export function OnboardingAuthSync({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { loading, isConfigured } = useAuth();
  const [syncing, setSyncing] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured || !isConfigured) {
      queueMicrotask(() => setSyncing(false));
      return;
    }

    if (loading) return;

    let alive = true;

    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!alive) return;

      if (!data.user && !allowWithoutSupabaseUser(pathname)) {
        router.replace("/onboarding");
      } else if (
        data.user &&
        (pathname === "/onboarding" || pathname.startsWith("/onboarding/"))
      ) {
        router.replace("/");
      }

      if (alive) setSyncing(false);
    };

    void checkUser();
    return () => {
      alive = false;
    };
  }, [pathname, loading, isConfigured, router]);

  if (!isSupabaseConfigured || !isConfigured) {
    return <>{children}</>;
  }

  if (loading || syncing) {
    return (
      <div
        className="min-h-screen bg-black"
        aria-busy="true"
        aria-label="Loading"
      />
    );
  }

  return <>{children}</>;
}
