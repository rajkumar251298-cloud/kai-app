"use client";

import { useAuth } from "@/components/AuthProvider";
import { isSupabaseConfigured } from "@/lib/supabase";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

function isPublicPath(pathname: string) {
  if (pathname === "/") return true;
  if (pathname === "/splash" || pathname.startsWith("/splash/")) return true;
  if (pathname === "/onboarding" || pathname.startsWith("/onboarding/"))
    return true;
  if (pathname === "/login" || pathname.startsWith("/login/")) return true;
  if (pathname === "/auth/callback" || pathname.startsWith("/auth/callback/"))
    return true;
  if (pathname === "/board" || pathname.startsWith("/board/")) return true;
  if (pathname === "/profile" || pathname.startsWith("/profile/")) return true;
  if (pathname === "/privacy" || pathname.startsWith("/privacy/")) return true;
  if (pathname === "/terms" || pathname.startsWith("/terms/")) return true;
  if (pathname === "/report" || pathname.startsWith("/report/")) return true;
  return false;
}

function requiresAuthSession(pathname: string) {
  if (pathname === "/chat" || pathname.startsWith("/chat/")) return true;
  return false;
}

export function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { session, loading, isConfigured } = useAuth();
  const redirected = useRef(false);

  useEffect(() => {
    redirected.current = false;
  }, [pathname]);

  useEffect(() => {
    if (!isConfigured) {
      return;
    }
    if (loading) return;
    if (isPublicPath(pathname)) return;
    if (!requiresAuthSession(pathname)) return;
    if (session) return;
    if (redirected.current) return;
    redirected.current = true;
    router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [isConfigured, loading, pathname, router, session]);

  const gateLoading =
    isSupabaseConfigured && loading && requiresAuthSession(pathname);

  if (gateLoading) {
    return (
      <div
        className="min-h-screen bg-black"
        aria-busy="true"
        aria-label="Loading"
      />
    );
  }

  if (
    isConfigured &&
    !loading &&
    requiresAuthSession(pathname) &&
    !session &&
    !isPublicPath(pathname)
  ) {
    return (
      <div
        className="min-h-screen bg-black"
        aria-busy="true"
        aria-label="Redirecting to sign in"
      />
    );
  }

  return <>{children}</>;
}
