"use client";

import Link from "next/link";
import { checkAndAwardBadges } from "@/lib/checkBadges";
import { useCallback, useEffect, useState } from "react";

export function GoalAchievedOverlay() {
  const [title, setTitle] = useState<string | null>(null);

  const dismiss = useCallback(() => setTitle(null), []);

  useEffect(() => {
    const onAchieved = (e: Event) => {
      const t = (e as CustomEvent<{ title: string }>).detail?.title;
      if (t) {
        setTitle(t);
        checkAndAwardBadges();
      }
    };
    window.addEventListener("kai-goal-achieved", onAchieved);
    return () => window.removeEventListener("kai-goal-achieved", onAchieved);
  }, []);

  useEffect(() => {
    if (!title) return;
    const t = window.setTimeout(dismiss, 8000);
    return () => window.clearTimeout(t);
  }, [title, dismiss]);

  if (!title) return null;

  return (
    <div
      className="fixed inset-0 z-[212] flex flex-col items-center justify-center bg-black/95 px-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="goal-achieved-title"
    >
      <div className="kai-level-particles pointer-events-none absolute inset-0 overflow-hidden" />
      <p
        id="goal-achieved-title"
        className="kai-heading relative text-center text-3xl font-bold tracking-[0.06em] text-[#C9A84C]"
      >
        🏆 GOAL ACHIEVED
      </p>
      <p className="relative mt-6 max-w-sm text-center text-lg font-semibold text-[#F5F0E8]">
        {title}
      </p>
      <p className="relative mt-4 text-center text-sm text-[#E8DCC8]/75">
        You said you would. You did.
      </p>
      <p className="relative mt-6 text-center text-sm font-medium text-[#C9A84C]">
        Badge unlocked: Goal Crusher 🎯 · +200 pts
      </p>
      <Link
        href="/onboarding"
        onClick={dismiss}
        className="kai-btn-shimmer relative mt-10 flex min-h-[52px] w-full max-w-xs items-center justify-center rounded-xl border border-[rgba(201,168,76,0.5)] bg-gradient-to-br from-[#C9A84C] to-[#F5E6B3] text-sm font-semibold text-black/90"
      >
        Set your next goal →
      </Link>
      <button
        type="button"
        onClick={dismiss}
        className="relative mt-6 text-sm text-[#E8DCC8]/50 underline-offset-2 hover:text-[#E8DCC8]"
      >
        Close
      </button>
    </div>
  );
}
