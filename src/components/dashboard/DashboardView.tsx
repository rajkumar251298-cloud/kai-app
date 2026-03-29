"use client";

import { useAuth } from "@/components/AuthProvider";
import { Header } from "@/components/Header";
import { HomeBackLink } from "@/components/HomeBackLink";
import { KaiProgressBar } from "@/components/KaiProgressBar";
import { getTotalPoints } from "@/lib/kaiPoints";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { HabitQuizTab } from "./HabitQuizTab";
import { MindGamesTab } from "./MindGamesTab";

const CARD = "kai-card kai-card-interactive p-4 sm:p-5";

const WEEK_DONE = [true, true, true, false, true, true, false] as const;

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

const GOALS: { label: string; pct: number }[] = [
  { label: "Launch KAI app in 90 days", pct: 72 },
  { label: "Get first 10 paying users", pct: 40 },
  { label: "Do daily check-ins without missing", pct: 88 },
];

function barGradient(pct: number) {
  if (pct >= 70) {
    return "bg-gradient-to-r from-[#5c4a22] via-[#C9A84C] to-[#F5E6B3]";
  }
  if (pct >= 40) {
    return "bg-gradient-to-r from-[#4a3d18] to-[#C9A84C]/75";
  }
  return "bg-gradient-to-r from-[#2a2418] to-[#6b5a2e]";
}

const SESSIONS = [
  { icon: "☀️", label: "Daily Check-ins", count: 5 },
  { icon: "🧠", label: "Stuck sessions", count: 2 },
  { icon: "🗺️", label: "Plan reviews", count: 1 },
  { icon: "💡", label: "Brainstorms", count: 3 },
] as const;

type Tab = "progress" | "games" | "quiz";

function parseTabParam(raw: string | null): Tab {
  if (raw === "games" || raw === "quiz") return raw;
  return "progress";
}

function parseGameParam(
  raw: string | null,
): "word" | "memory" | "logic" | null {
  if (raw === "word" || raw === "memory" || raw === "logic") return raw;
  return null;
}

const LS_USER = "userName";

export function DashboardView() {
  const router = useRouter();
  const { session, loading: authLoading, isConfigured } = useAuth();
  const searchParams = useSearchParams();
  const tabFromUrl = parseTabParam(searchParams.get("tab"));
  const gameFromUrl = parseGameParam(searchParams.get("game"));
  const queryKey = searchParams.toString();

  const [tab, setTab] = useState<Tab>(tabFromUrl);
  const [points, setPoints] = useState(0);
  const [toast, setToast] = useState<number | null>(null);
  const [localUserName, setLocalUserName] = useState<string | null>(null);

  useEffect(() => {
    const read = () =>
      setLocalUserName(localStorage.getItem(LS_USER)?.trim() || null);
    queueMicrotask(read);
    window.addEventListener("storage", read);
    window.addEventListener("focus", read);
    return () => {
      window.removeEventListener("storage", read);
      window.removeEventListener("focus", read);
    };
  }, []);

  const sessionAuthed = Boolean(session?.user);
  const localAuthed = Boolean(localUserName && localUserName.length > 0);
  const authenticated = sessionAuthed || localAuthed;
  const authReady = !isConfigured || !authLoading;

  const refreshPoints = useCallback(() => {
    setPoints(getTotalPoints());
  }, []);

  const onPoints = useCallback(() => {
    refreshPoints();
  }, [refreshPoints]);

  useEffect(() => {
    const sp = new URLSearchParams(queryKey);
    queueMicrotask(() => setTab(parseTabParam(sp.get("tab"))));
  }, [queryKey]);

  const syncTab = (t: Tab) => {
    setTab(t);
    const p = new URLSearchParams(searchParams.toString());
    if (t !== "games") p.delete("game");
    if (t === "progress") {
      p.delete("tab");
    } else {
      p.set("tab", t);
    }
    const q = p.toString();
    router.replace(q ? `/dashboard?${q}` : "/dashboard", { scroll: false });
  };

  useEffect(() => {
    queueMicrotask(() => refreshPoints());
    const onEarn = (e: Event) => {
      const d = (e as CustomEvent<{ amount: number }>).detail;
      if (d?.amount) setToast(d.amount);
    };
    window.addEventListener("kai-points-earned", onEarn);
    return () => window.removeEventListener("kai-points-earned", onEarn);
  }, [refreshPoints]);

  useEffect(() => {
    if (toast === null) return;
    const t = window.setTimeout(() => setToast(null), 1400);
    return () => window.clearTimeout(t);
  }, [toast]);

  const doneCount = WEEK_DONE.filter(Boolean).length;
  const missedLastDay = !WEEK_DONE[6] && doneCount > 0;
  const streakCopy = missedLastDay
    ? "You broke the streak.\nStart again today — or don't."
    : doneCount === 0
      ? "You haven't shown up this week. That doesn't fix itself."
      : `You showed up ${doneCount} days this week.\nMost people quit at 3.`;

  const tabBtn = (id: Tab, label: string) => {
    const active = tab === id;
    return (
      <button
        type="button"
        onClick={() => syncTab(id)}
        className={`relative flex-1 px-2 py-3 text-center text-sm font-medium transition sm:text-[15px] ${
          active
            ? "text-[#C9A84C]"
            : "text-[#E8DCC8]/55 hover:text-[#E8DCC8]/85"
        }`}
      >
        {label}
        {active && (
          <span className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-gradient-to-r from-[#C9A84C] to-[#F5E6B3]" />
        )}
      </button>
    );
  };

  if (!authReady) {
    return (
      <div className="flex min-h-screen flex-col bg-black">
        <Header />
        <main className="flex flex-1 items-center justify-center px-6 text-sm text-[#E8DCC8]/55">
          Loading…
        </main>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="flex min-h-screen flex-col bg-black">
        <Header />
        <div className="flex min-h-[calc(100vh-4rem)] flex-1 flex-col items-center justify-center bg-[#000000] px-6">
          <div className="flex max-w-sm flex-col items-center text-center">
            <span className="text-3xl text-[#C9A84C]" aria-hidden>
              ⚡
            </span>
            <h1 className="kai-heading mt-8 text-[28px] font-semibold leading-tight text-white">
              Unlock Your Dashboard
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-[#E8DCC8]/55">
              Sign in to access games, streaks, and your progress
            </p>
            <Link
              href="/login?next=/dashboard"
              className="kai-btn-shimmer mt-8 flex min-h-[48px] w-full max-w-xs items-center justify-center rounded-xl border border-[rgba(201,168,76,0.45)] bg-gradient-to-br from-[#C9A84C] to-[#F5E6B3] text-sm font-semibold text-black/90"
            >
              Sign in with Google
            </Link>
            <p className="mt-6 text-xs text-[#E8DCC8]/45">
              Already have an account? Sign in above
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-black">
      <Header />
      {toast !== null && (
        <div
          className="kai-points-toast pointer-events-none fixed left-1/2 top-20 z-[60] -translate-x-1/2 rounded-full border border-[rgba(201,168,76,0.45)] bg-black/95 px-4 py-2 text-sm font-semibold text-[#C9A84C] shadow-[0_0_24px_rgba(201,168,76,0.25)]"
          role="status"
        >
          +{toast} pts
        </div>
      )}
      <main className="mx-auto w-full max-w-lg flex-1 space-y-6 px-4 pb-10 pt-0 max-md:pb-[calc(80px+env(safe-area-inset-bottom,0px))] max-md:text-[15px]">
        <HomeBackLink />
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="kai-heading min-w-0 flex-1 truncate text-xl font-semibold tracking-[0.05em]">
            Dashboard
          </h1>
          <span className="shrink-0 rounded-full border border-[rgba(201,168,76,0.35)] bg-[#111111] px-3 py-1 text-xs font-semibold tabular-nums text-[#C9A84C] shadow-[0_0_16px_rgba(201,168,76,0.15)]">
            ⚡ {points} pts
          </span>
        </div>

        <div className="flex border-b border-[rgba(201,168,76,0.15)]">
          {tabBtn("progress", "📊 Progress")}
          {tabBtn("games", "🎮 Mind Games")}
          {tabBtn("quiz", "🧠 Habit Quiz")}
        </div>

        {tab === "progress" && (
          <>
            <section className={CARD}>
              <h2 className="kai-heading mb-4 text-sm font-semibold tracking-[0.05em]">
                Weekly streak
              </h2>
              <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                {DAYS.map((day, i) => {
                  const done = WEEK_DONE[i];
                  return (
                    <div key={day} className="flex flex-col items-center gap-1.5">
                      <span className="text-[10px] font-medium uppercase tracking-wide text-[#E8DCC8]/50 sm:text-[11px]">
                        {day}
                      </span>
                      <div
                        className={
                          done
                            ? "flex aspect-square w-full min-h-[36px] max-h-[52px] items-center justify-center rounded-xl bg-gradient-to-br from-[#C9A84C] to-[#F5E6B3] text-sm font-bold text-black/85 shadow-[0_0_18px_rgba(201,168,76,0.22)] sm:max-h-none"
                            : "flex aspect-square w-full min-h-[36px] max-h-[52px] items-center justify-center rounded-xl border border-[rgba(201,168,76,0.1)] bg-black sm:max-h-none"
                        }
                        aria-label={done ? `${day} completed` : `${day} missed`}
                      >
                        {done ? "✓" : null}
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="mt-5 whitespace-pre-line text-center text-sm leading-relaxed text-[#E8DCC8] sm:text-[15px]">
                {streakCopy}
              </p>
            </section>

            <section className={CARD}>
              <h2 className="kai-heading mb-4 text-sm font-semibold tracking-[0.05em]">
                Goal progress
              </h2>
              <ul className="space-y-5">
                {GOALS.map((g) => (
                  <li key={g.label}>
                    <div className="mb-1.5 flex items-start justify-between gap-3">
                      <span className="text-[14px] leading-snug text-[#E8DCC8]">
                        {g.label}
                      </span>
                      <span className="shrink-0 text-sm font-semibold tabular-nums text-[#C9A84C]">
                        {g.pct}%
                      </span>
                    </div>
                    <KaiProgressBar
                      pct={g.pct}
                      barClassName={barGradient(g.pct)}
                    />
                  </li>
                ))}
              </ul>
            </section>

            <section className={CARD}>
              <h2 className="kai-heading mb-4 text-sm font-semibold tracking-[0.05em]">
                Sessions this week
              </h2>
              <ul className="space-y-3">
                {SESSIONS.map((row) => (
                  <li
                    key={row.label}
                    className="flex items-center justify-between gap-3 border-b border-[rgba(201,168,76,0.08)] pb-3 last:border-0 last:pb-0"
                  >
                    <span className="flex items-center gap-2.5 text-[15px] text-[#E8DCC8]">
                      <span className="text-lg opacity-[0.72]" aria-hidden>
                        {row.icon}
                      </span>
                      {row.label}
                    </span>
                    <span className="text-lg font-bold tabular-nums text-[#C9A84C]">
                      {row.count}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            <Link
              href="/report"
              className="kai-btn-shimmer flex min-h-[48px] w-full items-center justify-center rounded-xl border border-[rgba(201,168,76,0.45)] bg-black py-3 text-sm font-semibold text-[#C9A84C] transition hover:border-[rgba(201,168,76,0.6)]"
            >
              View Weekly Report →
            </Link>
          </>
        )}

        {tab === "games" && (
          <MindGamesTab
            key={gameFromUrl ?? "mind-games"}
            onPoints={onPoints}
            initialGame={gameFromUrl}
          />
        )}

        {tab === "quiz" && <HabitQuizTab onPoints={onPoints} />}
      </main>
    </div>
  );
}
