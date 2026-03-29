"use client";

import type { BadgeId } from "@/lib/checkBadges";
import { getTotalPoints } from "@/lib/kaiPoints";
import { useEffect, useState } from "react";

export const KAI_LEVEL_ACK_KEY = "kaiLevelUpAcknowledged";

export const LEVEL_TIERS = [
  { tier: 1, min: 0, max: 99, name: "Recruit", emoji: "🌱" },
  { tier: 2, min: 100, max: 299, name: "Contender", emoji: "⚡" },
  { tier: 3, min: 300, max: 599, name: "Warrior", emoji: "🔥" },
  { tier: 4, min: 600, max: 999, name: "Champion", emoji: "🏆" },
  { tier: 5, min: 1000, max: 1999, name: "Legend", emoji: "👑" },
  { tier: 6, min: 2000, max: Infinity, name: "KAI Elite", emoji: "💎" },
] as const;

export type LevelTier = (typeof LEVEL_TIERS)[number];

export function levelFromPoints(points: number): LevelTier {
  for (let i = LEVEL_TIERS.length - 1; i >= 0; i -= 1) {
    const L = LEVEL_TIERS[i]!;
    if (points >= L.min) return L;
  }
  return LEVEL_TIERS[0]!;
}

export function nextLevelThreshold(current: LevelTier): number | null {
  if (current.tier >= 6) return null;
  const next = LEVEL_TIERS.find((t) => t.tier === current.tier + 1);
  return next?.min ?? null;
}

export const BADGE_INFO: Record<
  BadgeId,
  { emoji: string; name: string; how: string }
> = {
  early_bird: {
    emoji: "🌅",
    name: "Early Bird",
    how: "Complete a check-in before 8am.",
  },
  on_fire: {
    emoji: "🔥",
    name: "On Fire",
    how: "Hit a 7-day check-in streak.",
  },
  comeback_kid: {
    emoji: "💪",
    name: "Comeback Kid",
    how: "Return after missing 3+ days between check-ins.",
  },
  mind_sharp: {
    emoji: "🧠",
    name: "Mind Sharp",
    how: "Play all 3 mind games in one day.",
  },
  planner: {
    emoji: "📋",
    name: "Planner",
    how: "Use Review My Plan mode in chat.",
  },
  ideas_machine: {
    emoji: "💡",
    name: "Ideas Machine",
    how: "Send 5 messages in Brainstorm mode.",
  },
  week_winner: {
    emoji: "🏆",
    name: "Week Winner",
    how: "Earn an A on your weekly report.",
  },
  kai_faithful: {
    emoji: "⚡",
    name: "KAI Faithful",
    how: "Maintain a 30-day streak.",
  },
  unstoppable: {
    emoji: "👑",
    name: "Unstoppable",
    how: "Maintain a 90-day streak.",
  },
  goal_crusher: {
    emoji: "🎯",
    name: "Goal Crusher",
    how: "Reach 100% on a structured goal you set in KAI.",
  },
};

const BADGE_ORDER: BadgeId[] = [
  "early_bird",
  "on_fire",
  "comeback_kid",
  "mind_sharp",
  "planner",
  "ideas_machine",
  "week_winner",
  "kai_faithful",
  "unstoppable",
  "goal_crusher",
];

export function LevelProgressCard() {
  const [pts, setPts] = useState(0);

  useEffect(() => {
    const read = () => setPts(getTotalPoints());
    queueMicrotask(read);
    window.addEventListener("kai-points-earned", read);
    return () => window.removeEventListener("kai-points-earned", read);
  }, []);

  const cur = levelFromPoints(pts);
  const nextMin = nextLevelThreshold(cur);
  const span = nextMin !== null ? nextMin - cur.min : cur.max - cur.min + 1;
  const inBand = nextMin !== null ? pts - cur.min : pts - cur.min;
  const pct =
    nextMin === null
      ? 100
      : Math.min(100, Math.max(0, (inBand / Math.max(1, span)) * 100));
  const toNext =
    nextMin !== null ? Math.max(0, nextMin - pts) : 0;
  const nextName =
    nextMin !== null
      ? LEVEL_TIERS.find((t) => t.min === nextMin)?.name ?? "next"
      : "";

  return (
    <section className="rounded-2xl border border-[rgba(201,168,76,0.22)] bg-[#111111] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.55)]">
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#C9A84C]">
        Your Level
      </h2>
      <div className="flex flex-col items-center text-center">
        <span className="text-5xl leading-none" aria-hidden>
          {cur.emoji}
        </span>
        <p className="kai-heading mt-3 text-xl font-semibold text-[#F5F0E8]">
          {cur.name}
        </p>
        <p className="mt-1 text-sm tabular-nums text-[#C9A84C]/90">
          {pts.toLocaleString()} pts
        </p>
        {nextMin !== null ? (
          <>
            <div className="mt-4 h-2.5 w-full max-w-xs overflow-hidden rounded-full bg-black">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#8a7028] via-[#C9A84C] to-[#F5E6B3] transition-[width] duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-[#E8DCC8]/75">
              {pts} / {nextMin} pts to {nextName}
            </p>
            <p className="mt-1 text-xs text-[#E8DCC8]/45">
              {toNext} pts to next level
            </p>
          </>
        ) : (
          <p className="mt-4 text-sm text-[#E8DCC8]/55">Max level reached.</p>
        )}
      </div>
    </section>
  );
}

export function BadgesGrid({ earned }: { earned: Set<BadgeId> }) {
  const [tip, setTip] = useState<string | null>(null);

  return (
    <section className="rounded-2xl border border-[rgba(201,168,76,0.22)] bg-[#111111] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.55)]">
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#C9A84C]">
        Badges Earned
      </h2>
      <div className="grid grid-cols-4 gap-3">
        {BADGE_ORDER.map((id) => {
          const info = BADGE_INFO[id];
          const ok = earned.has(id);
          return (
            <button
              key={id}
              type="button"
              title={`${info.name}: ${info.how}`}
              onClick={() =>
                setTip(
                  `${info.name} — ${ok ? "Unlocked." : "Locked."} ${info.how}`,
                )
              }
              className={`flex aspect-square flex-col items-center justify-center rounded-xl border text-2xl transition ${
                ok
                  ? "border-[rgba(201,168,76,0.45)] bg-black shadow-[0_0_20px_rgba(201,168,76,0.25)]"
                  : "border-[rgba(255,255,255,0.08)] bg-[#0a0a0a] opacity-50"
              }`}
            >
              <span>{ok ? info.emoji : "🔒"}</span>
            </button>
          );
        })}
      </div>
      {tip && (
        <p className="mt-3 rounded-lg border border-[rgba(201,168,76,0.2)] bg-black/60 px-3 py-2 text-xs leading-relaxed text-[#E8DCC8]/85">
          {tip}
        </p>
      )}
    </section>
  );
}

export function LevelUpOverlay({
  tier,
  onDone,
}: {
  tier: LevelTier;
  onDone: () => void;
}) {
  useEffect(() => {
    const t = window.setTimeout(onDone, 3000);
    return () => window.clearTimeout(t);
  }, [onDone]);

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black/95 px-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="level-up-title"
    >
      <div className="kai-level-particles pointer-events-none absolute inset-0 overflow-hidden" />
      <div className="kai-level-bounce relative text-7xl">{tier.emoji}</div>
      <h2
        id="level-up-title"
        className="kai-heading relative mt-6 text-center text-[clamp(2.5rem,12vw,3.75rem)] font-bold leading-none tracking-[0.04em] text-[#C9A84C]"
      >
        LEVEL UP!
      </h2>
      <p className="kai-heading relative mt-4 text-center text-2xl text-[#F5F0E8]">
        {tier.name}
      </p>
    </div>
  );
}

export function runLevelUpCheck(setCelebration: (t: LevelTier) => void): void {
  if (typeof window === "undefined") return;
  const pts = getTotalPoints();
  const tier = levelFromPoints(pts);
  const raw = localStorage.getItem(KAI_LEVEL_ACK_KEY);
  if (!raw) {
    localStorage.setItem(KAI_LEVEL_ACK_KEY, String(tier.tier));
    return;
  }
  const ack = parseInt(raw, 10) || 0;
  if (tier.tier > ack) {
    localStorage.setItem(KAI_LEVEL_ACK_KEY, String(tier.tier));
    setCelebration(tier);
  }
}
