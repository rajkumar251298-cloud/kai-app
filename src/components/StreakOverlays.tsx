"use client";

import { OPEN_STREAK_POPUP } from "@/components/StreakPopup";
import Link from "next/link";
import { useEffect, useState } from "react";

type BrokenDetail = { previousStreak: number; longestStreak: number };
type FreezeDetail = { protectedStreak: number };

export function StreakOverlays() {
  const [broken, setBroken] = useState<BrokenDetail | null>(null);
  const [freeze, setFreeze] = useState<FreezeDetail | null>(null);

  useEffect(() => {
    const onBroken = (e: Event) => {
      const d = (e as CustomEvent<BrokenDetail>).detail;
      if (d?.previousStreak != null) setBroken(d);
    };
    const onFreeze = (e: Event) => {
      const d = (e as CustomEvent<FreezeDetail>).detail;
      if (d?.protectedStreak != null) setFreeze(d);
    };
    const onMilestone = () => {
      window.dispatchEvent(new CustomEvent(OPEN_STREAK_POPUP));
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
    </>
  );
}
