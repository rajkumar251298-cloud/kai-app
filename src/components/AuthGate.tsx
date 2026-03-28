"use client";

import { supabase } from "@/lib/supabase";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Routes that do not require a Supabase session.
 * Core screens use localStorage + optional sign-in; only redirect to onboarding
 * when we add stricter protected routes later.
 */
function isPublicPath(pathname: string) {
  if (pathname === "/") return true;
  if (pathname === "/splash" || pathname.startsWith("/splash/")) return true;
  if (pathname === "/onboarding" || pathname.startsWith("/onboarding/"))
    return true;
  if (pathname === "/board" || pathname.startsWith("/board/")) return true;
  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/"))
    return true;
  if (pathname === "/chat" || pathname.startsWith("/chat/")) return true;
  return false;
}

export function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function checkUser() {
      if (isPublicPath(pathname)) {
        if (!cancelled) setLoading(false);
        return;
      }

      const { data } = await supabase.auth.getUser();
      if (cancelled) return;

      if (!data.user) {
        router.replace("/onboarding");
      }
      if (!cancelled) setLoading(false);
    }

    void checkUser();
    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  if (loading) {
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
