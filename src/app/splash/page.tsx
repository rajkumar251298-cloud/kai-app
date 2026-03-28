"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

const SPLASH_KEY = "splashSeen";
const REDIRECT_MS = 2500;

export default function SplashPage() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(SPLASH_KEY)) {
      router.replace("/");
      return;
    }
    const t = window.setTimeout(() => {
      localStorage.setItem(SPLASH_KEY, "1");
      router.replace("/");
    }, REDIRECT_MS);
    return () => window.clearTimeout(t);
  }, [router]);

  return (
    <div className="fixed inset-0 z-[200] flex min-h-screen flex-col items-center justify-center bg-black">
      <div
        className="relative flex flex-col items-center justify-center"
        aria-busy="true"
        aria-label="KAI loading"
      >
        <div className="relative flex flex-col items-center">
          {/* Gold glow — soft pulse behind wordmark */}
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 h-[min(44vw,190px)] w-[min(44vw,190px)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(201,168,76,0.36)_0%,rgba(201,168,76,0.09)_46%,transparent_72%)] blur-3xl kai-splash-glow"
            aria-hidden
          />

          <h1 className="kai-heading kai-splash-logo relative z-10 text-[120px] font-semibold leading-none tracking-[0.02em] text-[#C9A84C]">
            KAI
          </h1>
        </div>

        <p className="kai-splash-tagline relative z-10 mt-5 text-sm font-medium tracking-[0.2em] text-[#E8DCC8]/90">
          Keep At It
        </p>
      </div>
    </div>
  );
}
