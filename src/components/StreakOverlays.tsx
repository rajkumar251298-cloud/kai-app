"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type BrokenDetail = { previousStreak: number; longestStreak: number };
type FreezeDetail = { protectedStreak: number };
type MilestoneDetail = { days: number };

const MILESTONE_COPY: Record<
  number,
  { emoji: string; line: string }
> = {
  7: {
    emoji: "🔥",
    line: "One week straight. You're not like most people.",
  },
  14: {
    emoji: "⚡",
    line: "Two weeks. The habit is forming.",
  },
  21: {
    emoji: "💪",
    line: "21 days. Scientists say this is where habits become automatic.",
  },
  30: {
    emoji: "🏆",
    line: "30 days. You are in the top 5% of KAI users.",
  },
  60: {
    emoji: "👑",
    line: "60 days. This is rare. Most people quit by now.",
  },
  90: {
    emoji: "💎",
    line: "90 days. You did what you said you would. Remember this moment.",
  },
};

export function StreakOverlays() {
  const [broken, setBroken] = useState<BrokenDetail | null>(null);
  const [freeze, setFreeze] = useState<FreezeDetail | null>(null);
  const [milestone, setMilestone] = useState<MilestoneDetail | null>(null);

  const dismissMilestone = useCallback(() => setMilestone(null), []);

  useEffect(() => {
    const onBroken = (e: Event) => {
      const d = (e as CustomEvent<BrokenDetail>).detail;
      if (d?.previousStreak != null) setBroken(d);
    };
    const onFreeze = (e: Event) => {
      const d = (e as CustomEvent<FreezeDetail>).detail;
      if (d?.protectedStreak != null) setFreeze(d);
    };
    const onMilestone = (e: Event) => {
      const d = (e as CustomEvent<MilestoneDetail>).detail;
      if (d?.days != null) setMilestone(d);
    };
    window.addEventListener("kai-streak-broken", onBroken);
    window.addEventListener("kai-streak-freeze-used", onFreeze);
    window.addEventListener("kai-streak-milestone", onMilestone);
    return () => {
      window.removeEventListener("kai-streak-broken", onBroken);
      window.removeEventListener("kai-streak-freeze-used", onFreeze);
      window.removeEventListener("kai-streak-milestone", onMilestone);
    };
  }, []);

  useEffect(() => {
    if (!milestone) return;
    const t = window.setTimeout(dismissMilestone, 3000);
    return () => window.clearTimeout(t);
  }, [milestone, dismissMilestone]);

  return (
    <>
      {broken && (
        <div
          className="fixed inset-0 z-[210] flex flex-col items-center justify-center bg-black px-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="streak-broken-title"
        >
          <div
            className="kai-streak-heart-bounce text-8xl leading-none"
            aria-hidden
          >
            💔
          </div>
          <h2
            id="streak-broken-title"
            className="mt-8 text-center text-[28px] leading-tight text-white"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            Your {broken.previousStreak} day streak is gone.
          </h2>
          <p className="mt-4 max-w-sm text-center text-sm leading-relaxed text-[#E8DCC8]/65">
            It happens. What matters is what you do right now.
          </p>
          <Link
            href="/chat?mode=checkin"
            onClick={() => setBroken(null)}
            className="kai-btn-shimmer mt-10 flex min-h-[52px] w-full max-w-xs items-center justify-center rounded-xl border border-[rgba(201,168,76,0.5)] bg-gradient-to-br from-[#C9A84C] to-[#F5E6B3] text-sm font-semibold text-black/90"
          >
            Start a new streak →
          </Link>
          <p className="mt-6 text-center text-xs text-[#E8DCC8]/45">
            Your longest streak was {broken.longestStreak} days
          </p>
          <button
            type="button"
            onClick={() => setBroken(null)}
            className="mt-8 text-sm text-[#E8DCC8]/50 underline-offset-2 hover:text-[#E8DCC8]"
          >
            Dismiss
          </button>
        </div>
      )}

      {freeze && (
        <div
          className="fixed inset-0 z-[205] flex items-center justify-center bg-black/90 px-6"
          role="dialog"
          aria-modal="true"
        >
          <div className="max-w-md rounded-2xl border border-[rgba(201,168,76,0.35)] bg-[#111111] p-6 shadow-[0_0_40px_rgba(201,168,76,0.15)]">
            <p className="text-center text-[15px] leading-relaxed text-[#E8DCC8]">
              KAI used your Streak Freeze to protect your {freeze.protectedStreak}{" "}
              day streak. You get 1 per week. Don&apos;t waste it. 😤
            </p>
            <button
              type="button"
              onClick={() => setFreeze(null)}
              className="kai-btn-shimmer mt-6 w-full rounded-xl border border-[rgba(201,168,76,0.45)] bg-black py-3 text-sm font-semibold text-[#C9A84C]"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {milestone && MILESTONE_COPY[milestone.days] && (
        <div
          className="fixed inset-0 z-[208] flex flex-col items-center justify-center bg-black/95 px-6"
          role="dialog"
          aria-modal="true"
        >
          <div className="kai-level-particles pointer-events-none absolute inset-0 overflow-hidden" />
          <div className="kai-streak-milestone-bounce relative text-7xl">
            {MILESTONE_COPY[milestone.days]!.emoji}
          </div>
          <p className="relative mt-8 max-w-sm text-center text-lg font-medium leading-relaxed text-[#F5F0E8]">
            {MILESTONE_COPY[milestone.days]!.line}
          </p>
        </div>
      )}
    </>
  );
}
