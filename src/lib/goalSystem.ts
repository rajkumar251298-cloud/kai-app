/**
 * Structured goals in localStorage key "userGoals".
 */

import { addPoints } from "@/lib/kaiPoints";
import { secureStorage } from "@/lib/secureStorage";

export const USER_GOALS_LS_KEY = "userGoals";

/** Flat mirror key — must match KAI_LS_USER_GOAL in kaiLocalProfile. */
const LS_FLAT_USER_GOAL = "userGoal";

export type GoalMilestone = { text: string; done: boolean };

export type UserGoal = {
  id: string;
  title: string;
  targetDate: string;
  category: "work" | "health" | "learning" | "personal";
  totalTasks: number;
  completedTasks: number;
  progressPercent: number;
  createdAt: string;
  lastUpdated: string;
  milestones: GoalMilestone[];
  /** ISO date -> score 1–10 */
  dailyScores: Record<string, number>;
};

function newId(): string {
  return `goal_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function todayIso(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseGoals(): UserGoal[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(USER_GOALS_LS_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as unknown;
    if (!Array.isArray(arr)) return [];
    return arr.filter((g): g is UserGoal => {
      if (!g || typeof g !== "object") return false;
      const o = g as Record<string, unknown>;
      return (
        typeof o.id === "string" &&
        typeof o.title === "string" &&
        typeof o.targetDate === "string"
      );
    });
  } catch {
    return [];
  }
}

function normalizeGoal(g: Partial<UserGoal> & { id: string; title: string }): UserGoal {
  const milestones = Array.isArray(g.milestones)
    ? g.milestones.map((m) => ({
        text: typeof m?.text === "string" ? m.text : "",
        done: Boolean(m?.done),
      }))
    : [];
  const dailyScores =
    g.dailyScores && typeof g.dailyScores === "object" && !Array.isArray(g.dailyScores)
      ? (g.dailyScores as Record<string, number>)
      : {};
  const doneM = milestones.filter((m) => m.done).length;
  const pct =
    typeof g.progressPercent === "number" && Number.isFinite(g.progressPercent)
      ? Math.min(100, Math.max(0, Math.round(g.progressPercent)))
      : 0;
  return {
    id: g.id,
    title: g.title.trim(),
    targetDate: (g.targetDate as string) || todayIso(),
    category:
      g.category === "health" ||
      g.category === "learning" ||
      g.category === "personal"
        ? g.category
        : "work",
    totalTasks: typeof g.totalTasks === "number" ? g.totalTasks : milestones.length,
    completedTasks: typeof g.completedTasks === "number" ? g.completedTasks : doneM,
    progressPercent: pct,
    createdAt: typeof g.createdAt === "string" ? g.createdAt : todayIso(),
    lastUpdated: typeof g.lastUpdated === "string" ? g.lastUpdated : todayIso(),
    milestones,
    dailyScores,
  };
}

export function saveGoals(goals: UserGoal[]): void {
  localStorage.setItem(USER_GOALS_LS_KEY, JSON.stringify(goals));
  const first = goals[0];
  if (first?.title?.trim()) {
    localStorage.setItem("userGoal", first.title.trim());
    localStorage.removeItem("mainGoal");
  } else {
    localStorage.removeItem("userGoal");
  }
  window.dispatchEvent(new CustomEvent("kai-goals-updated"));
}

export function loadUserGoals(): UserGoal[] {
  return parseGoals().map((g) => normalizeGoal(g));
}

export function getPrimaryGoal(): UserGoal | null {
  const list = loadUserGoals();
  return list[0] ?? null;
}

function recomputeProgressFromScores(g: UserGoal): number {
  const entries = Object.entries(g.dailyScores)
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, 7)
    .map(([, v]) => v)
    .filter((n) => n >= 1 && n <= 10);
  if (entries.length === 0) return g.progressPercent;
  const avg = entries.reduce((a, b) => a + b, 0) / entries.length;
  return Math.min(100, Math.round(avg * 10));
}

export function recordDailyGoalProgress(goalId: string, score: number): UserGoal | null {
  const list = loadUserGoals();
  const i = list.findIndex((g) => g.id === goalId);
  if (i < 0) return null;
  const g = { ...list[i]! };
  const s = Math.min(10, Math.max(1, Math.round(score)));
  const day = todayIso();
  g.dailyScores = { ...g.dailyScores, [day]: s };
  g.progressPercent = recomputeProgressFromScores(g);
  g.lastUpdated = day;
  list[i] = g;
  saveGoals(list);
  if (g.progressPercent >= 100) {
    queueMicrotask(() => {
      markGoalAchieved(goalId);
    });
  }
  return g;
}

export function updateUserGoalTitle(goalId: string, title: string): void {
  const list = loadUserGoals();
  const i = list.findIndex((g) => g.id === goalId);
  if (i < 0) return;
  list[i] = { ...list[i]!, title: title.trim(), lastUpdated: todayIso() };
  saveGoals(list);
}

export function toggleMilestone(goalId: string, index: number): UserGoal | null {
  const list = loadUserGoals();
  const i = list.findIndex((g) => g.id === goalId);
  if (i < 0) return null;
  const g = { ...list[i]! };
  const ms = [...g.milestones];
  if (index < 0 || index >= ms.length) return null;
  const was = ms[index]!.done;
  ms[index] = { ...ms[index]!, done: !was };
  g.milestones = ms;
  g.completedTasks = ms.filter((m) => m.done).length;
  g.lastUpdated = todayIso();
  list[i] = g;
  saveGoals(list);
  if (!was) {
    addPoints(15);
    window.dispatchEvent(
      new CustomEvent("kai-toast", {
        detail: { message: "Milestone unlocked 🎯 Keep going." },
      }),
    );
  }
  return g;
}

export function addUserGoal(input: {
  title: string;
  targetDate: string;
  category: UserGoal["category"];
  milestones: string[];
}): UserGoal {
  const list = loadUserGoals();
  const day = todayIso();
  const milestones: GoalMilestone[] = input.milestones
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 12)
    .map((text) => ({ text, done: false }));
  const g: UserGoal = normalizeGoal({
    id: newId(),
    title: input.title.trim(),
    targetDate: input.targetDate,
    category: input.category,
    totalTasks: Math.max(milestones.length, 3),
    completedTasks: 0,
    progressPercent: 0,
    createdAt: day,
    lastUpdated: day,
    milestones,
    dailyScores: {},
  });
  list.push(g);
  saveGoals(list);
  return g;
}

export function removeUserGoal(goalId: string): void {
  saveGoals(loadUserGoals().filter((g) => g.id !== goalId));
}

export function daysUntilTarget(targetDate: string): number | null {
  const t = new Date(`${targetDate}T12:00:00`).getTime();
  if (!Number.isFinite(t)) return null;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return Math.ceil((t - today) / (24 * 60 * 60 * 1000));
}

const GOAL_CRUSHER_KEY = "kaiGoalCrusherBadge";

export function markGoalAchieved(goalId: string): UserGoal | null {
  const list = loadUserGoals();
  const g = list.find((x) => x.id === goalId);
  if (!g) return null;
  removeUserGoal(goalId);
  localStorage.setItem(GOAL_CRUSHER_KEY, "1");
  addPoints(200);
  window.dispatchEvent(new CustomEvent("kai-goal-achieved", { detail: { title: g.title } }));
  return g;
}

export function syncLegacyUserGoalToUserGoals(): void {
  if (typeof window === "undefined") return;
  if (localStorage.getItem(USER_GOALS_LS_KEY)) return;
  const legacy =
    secureStorage.get(LS_FLAT_USER_GOAL).trim() ||
    localStorage.getItem("mainGoal")?.trim();
  if (!legacy) return;
  const d = new Date();
  d.setDate(d.getDate() + 90);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  addUserGoal({
    title: legacy,
    targetDate: `${y}-${m}-${day}`,
    category: "work",
    milestones: [
      "First concrete milestone",
      "Second milestone",
      "Third milestone",
    ],
  });
}

export function progressRatedTodayKey(goalId: string): string {
  return `kaiGoalProgressRated_${todayIso()}_${goalId}`;
}

export function hasRatedGoalProgressToday(goalId: string): boolean {
  return localStorage.getItem(progressRatedTodayKey(goalId)) === "1";
}

export function markProgressRatedToday(goalId: string): void {
  localStorage.setItem(progressRatedTodayKey(goalId), "1");
}
