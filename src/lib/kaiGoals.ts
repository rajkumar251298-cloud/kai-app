/** @deprecated Use goalSystem — thin bridge for legacy imports. */

import {
  addUserGoal,
  loadUserGoals,
  removeUserGoal,
  updateUserGoalTitle,
} from "@/lib/goalSystem";

export type KaiGoal = { id: string; text: string };

export function loadGoals(): KaiGoal[] {
  if (typeof window === "undefined") return [];
  return loadUserGoals().map((g) => ({ id: g.id, text: g.title }));
}

export function saveGoals(_goals: KaiGoal[]): void {
  /* no-op: use goalSystem.saveGoals */
}

export function addGoal(text: string): KaiGoal {
  const d = new Date();
  d.setDate(d.getDate() + 90);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const g = addUserGoal({
    title: text.trim(),
    targetDate: `${y}-${m}-${day}`,
    category: "work",
    milestones: ["Milestone 1", "Milestone 2", "Milestone 3"],
  });
  return { id: g.id, text: g.title };
}

export function updateGoal(id: string, text: string): void {
  updateUserGoalTitle(id, text);
}

export function removeGoal(id: string): void {
  removeUserGoal(id);
}

const KAI_GOAL_CRUSHER_KEY = "kaiGoalCrusherBadge";

export function markGoalCompleted(id: string): void {
  removeUserGoal(id);
  if (typeof window !== "undefined") {
    localStorage.setItem(KAI_GOAL_CRUSHER_KEY, "1");
  }
}
