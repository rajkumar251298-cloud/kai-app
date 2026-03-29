"use client";

import { useAuth } from "@/components/AuthProvider";
import { Header } from "@/components/Header";
import { HomeBackLink } from "@/components/HomeBackLink";
import { KaiProgressBar } from "@/components/KaiProgressBar";
import {
  addUserGoal,
  daysUntilTarget,
  loadUserGoals,
  toggleMilestone,
  type UserGoal,
} from "@/lib/goalSystem";
import { getTotalPoints } from "@/lib/kaiPoints";
import {
  getDisplayedStreak,
  getLongestStreak,
  getWeekStreakCells,
  ensureStreakProcessed,
} from "@/lib/streakSystem";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { HabitQuizTab } from "./HabitQuizTab";
import { MindGamesTab } from "./MindGamesTab";

const CARD = "kai-card kai-card-interactive p-4 sm:p-5";

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
  const [goalsTick, setGoalsTick] = useState(0);
  const [streakTick, setStreakTick] = useState(0);
  const [addGoalOpen, setAddGoalOpen] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalCategory, setNewGoalCategory] =
    useState<UserGoal["category"]>("work");
  const [newGoalDate, setNewGoalDate] = useState("");
  const [newM1, setNewM1] = useState("");
  const [newM2, setNewM2] = useState("");
  const [newM3, setNewM3] = useState("");

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
    const onGoals = () => setGoalsTick((t) => t + 1);
    window.addEventListener("kai-goals-updated", onGoals);
    return () => window.removeEventListener("kai-goals-updated", onGoals);
  }, []);

  useEffect(() => {
    const onStreak = () => setStreakTick((t) => t + 1);
    window.addEventListener("kai-streak-updated", onStreak);
    window.addEventListener("focus", onStreak);
    return () => {
      window.removeEventListener("kai-streak-updated", onStreak);
      window.removeEventListener("focus", onStreak);
    };
  }, []);

  const [weekCells, setWeekCells] = useState<
    ReturnType<typeof getWeekStreakCells>
  >([]);
  const [streakCount, setStreakCount] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [dashGoals, setDashGoals] = useState<UserGoal[]>([]);

  useEffect(() => {
    ensureStreakProcessed();
    setWeekCells(getWeekStreakCells());
    setStreakCount(getDisplayedStreak());
    setBestStreak(getLongestStreak());
    setDashGoals(loadUserGoals());
  }, [streakTick, goalsTick]);

  useEffect(() => {
    if (toast === null) return;
    const t = window.setTimeout(() => setToast(null), 1400);
    return () => window.clearTimeout(t);
  }, [toast]);

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
              <div
                className="grid gap-1.5 sm:gap-2"
                style={{
                  gridTemplateColumns: `repeat(${Math.max(weekCells.length, 1)}, minmax(0, 1fr))`,
                }}
              >
                {weekCells.map((cell) => {
                  const box =
                    cell.status === "done"
                      ? "flex aspect-square w-full min-h-[36px] max-h-[52px] items-center justify-center rounded-xl bg-gradient-to-br from-[#C9A84C] to-[#F5E6B3] text-sm font-bold text-black/85 shadow-[0_0_18px_rgba(201,168,76,0.22)] sm:max-h-none"
                      : cell.status === "today_pending"
                        ? "kai-calendar-today-pulse flex aspect-square w-full min-h-[36px] max-h-[52px] items-center justify-center rounded-xl border-2 border-[#C9A84C] bg-black sm:max-h-none"
                        : cell.status === "missed"
                          ? "flex aspect-square w-full min-h-[36px] max-h-[52px] items-center justify-center rounded-xl border border-[rgba(180,60,60,0.25)] bg-[#1a0a0a] sm:max-h-none"
                          : "flex aspect-square w-full min-h-[36px] max-h-[52px] items-center justify-center rounded-xl border border-[rgba(201,168,76,0.1)] bg-black sm:max-h-none";
                  return (
                    <div
                      key={cell.iso}
                      className="flex flex-col items-center gap-1.5"
                    >
                      <span className="text-[10px] font-medium uppercase tracking-wide text-[#E8DCC8]/50 sm:text-[11px]">
                        {cell.shortLabel}
                      </span>
                      <div
                        className={box}
                        aria-label={`${cell.shortLabel} ${cell.status}`}
                      >
                        {cell.status === "done" ? "✓" : null}
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="mt-5 text-center text-sm font-medium text-[#C9A84C] sm:text-[15px]">
                🔥 {streakCount} day streak · Best: {bestStreak} days
              </p>
            </section>

            <section className={CARD}>
              <h2 className="kai-heading mb-4 text-sm font-semibold tracking-[0.05em]">
                Goal progress
              </h2>
              <ul className="space-y-6">
                {dashGoals.length === 0 ? (
                  <li className="text-sm text-[#E8DCC8]/55">
                    No goals yet. Add one below or finish onboarding.
                  </li>
                ) : (
                  dashGoals.map((g) => {
                    const due = daysUntilTarget(g.targetDate);
                    const dueLabel =
                      due === null
                        ? ""
                        : due < 0
                          ? `Overdue ${Math.abs(due)}d`
                          : due === 0
                            ? "Due today"
                            : `Due in ${due} days`;
                    return (
                      <li key={g.id}>
                        <div className="mb-1.5 flex items-start justify-between gap-3">
                          <span className="text-[14px] font-medium leading-snug text-[#E8DCC8]">
                            {g.title}
                          </span>
                          <span className="shrink-0 text-sm font-semibold tabular-nums text-[#C9A84C]">
                            {g.progressPercent}%
                          </span>
                        </div>
                        {dueLabel ? (
                          <p className="mb-2 text-xs text-[#E8DCC8]/50">
                            {dueLabel}
                          </p>
                        ) : null}
                        <KaiProgressBar
                          pct={g.progressPercent}
                          barClassName={barGradient(g.progressPercent)}
                        />
                        <ul className="mt-3 space-y-2">
                          {g.milestones.map((m, idx) => (
                            <li key={`${g.id}-m-${idx}`}>
                              <button
                                type="button"
                                onClick={() => {
                                  toggleMilestone(g.id, idx);
                                  setGoalsTick((t) => t + 1);
                                }}
                                className="flex w-full items-start gap-2 rounded-lg border border-transparent py-1.5 text-left text-sm transition hover:border-[rgba(201,168,76,0.2)] hover:bg-black/40"
                              >
                                <span
                                  className={
                                    m.done
                                      ? "text-[#C9A84C]"
                                      : "text-[#E8DCC8]/35"
                                  }
                                  aria-hidden
                                >
                                  {m.done ? "☑️" : "☐"}
                                </span>
                                <span
                                  className={
                                    m.done
                                      ? "text-[#E8DCC8]/60 line-through"
                                      : "text-[#E8DCC8]"
                                  }
                                >
                                  {m.text}
                                </span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      </li>
                    );
                  })
                )}
              </ul>
              <button
                type="button"
                onClick={() => {
                  const d = new Date();
                  d.setDate(d.getDate() + 90);
                  const y = d.getFullYear();
                  const mo = String(d.getMonth() + 1).padStart(2, "0");
                  const da = String(d.getDate()).padStart(2, "0");
                  setNewGoalDate(`${y}-${mo}-${da}`);
                  setNewGoalTitle("");
                  setNewM1("");
                  setNewM2("");
                  setNewM3("");
                  setAddGoalOpen(true);
                }}
                className="mt-4 text-sm font-semibold text-[#C9A84C] transition hover:text-[#F5E6B3]"
              >
                + Add another goal
              </button>
              {addGoalOpen && (
                <div className="mt-4 space-y-3 rounded-xl border border-[rgba(201,168,76,0.2)] bg-black/60 p-4">
                  <input
                    value={newGoalTitle}
                    onChange={(e) => setNewGoalTitle(e.target.value)}
                    placeholder="Goal title"
                    className="w-full rounded-lg border border-[rgba(201,168,76,0.25)] bg-black px-3 py-2 text-sm text-[#F5F0E8]"
                  />
                  <select
                    value={newGoalCategory}
                    onChange={(e) =>
                      setNewGoalCategory(e.target.value as UserGoal["category"])
                    }
                    className="w-full rounded-lg border border-[rgba(201,168,76,0.25)] bg-black px-3 py-2 text-sm text-[#F5F0E8]"
                  >
                    <option value="work">Work</option>
                    <option value="health">Health</option>
                    <option value="learning">Learning</option>
                    <option value="personal">Personal</option>
                  </select>
                  <label className="block text-xs text-[#E8DCC8]/55">
                    Target date
                    <input
                      type="date"
                      value={newGoalDate}
                      onChange={(e) => setNewGoalDate(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-[rgba(201,168,76,0.25)] bg-black px-3 py-2 text-sm text-[#F5F0E8]"
                    />
                  </label>
                  <input
                    value={newM1}
                    onChange={(e) => setNewM1(e.target.value)}
                    placeholder="Milestone 1"
                    className="w-full rounded-lg border border-[rgba(201,168,76,0.25)] bg-black px-3 py-2 text-sm text-[#F5F0E8]"
                  />
                  <input
                    value={newM2}
                    onChange={(e) => setNewM2(e.target.value)}
                    placeholder="Milestone 2"
                    className="w-full rounded-lg border border-[rgba(201,168,76,0.25)] bg-black px-3 py-2 text-sm text-[#F5F0E8]"
                  />
                  <input
                    value={newM3}
                    onChange={(e) => setNewM3(e.target.value)}
                    placeholder="Milestone 3"
                    className="w-full rounded-lg border border-[rgba(201,168,76,0.25)] bg-black px-3 py-2 text-sm text-[#F5F0E8]"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setAddGoalOpen(false)}
                      className="rounded-lg px-4 py-2 text-sm text-[#E8DCC8]/55"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const t = newGoalTitle.trim();
                        if (!t || !newGoalDate) return;
                        addUserGoal({
                          title: t,
                          targetDate: newGoalDate,
                          category: newGoalCategory,
                          milestones: [newM1, newM2, newM3],
                        });
                        setAddGoalOpen(false);
                        setGoalsTick((x) => x + 1);
                      }}
                      className="kai-btn-shimmer ml-auto rounded-lg border border-[rgba(201,168,76,0.45)] bg-gradient-to-br from-[#C9A84C] to-[#F5E6B3] px-4 py-2 text-sm font-semibold text-black/90"
                    >
                      Save goal
                    </button>
                  </div>
                </div>
              )}
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
