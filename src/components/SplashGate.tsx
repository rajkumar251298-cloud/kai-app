"use client";

import { PageTransition } from "@/components/PageTransition";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * First visit to `/`: redirect to `/splash` until `splashSeen` is in localStorage.
 */
export function SplashGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (pathname === "/" && !localStorage.getItem("splashSeen")) {
      router.replace("/splash");
      return;
    }
    queueMicrotask(() => setReady(true));
  }, [pathname, router]);

  if (!ready) {
    return <div className="min-h-screen bg-black" aria-hidden />;
  }

  return <PageTransition>{children}</PageTransition>;
}
