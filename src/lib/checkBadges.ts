import { getConsecutiveCheckinStreak } from "@/lib/kaiPoints";
import { isoDatesForLocalWeekContaining } from "@/lib/kaiWeeklyReport";

export const KAI_EARNED_BADGES_KEY = "earnedBadges";

export type BadgeId =
  | "early_bird"
  | "on_fire"
  | "comeback_kid"
  | "mind_sharp"
  | "planner"
  | "ideas_machine"
  | "week_winner"
  | "kai_faithful"
  | "unstoppable"
  | "goal_crusher";

function parseDatesFromStorage(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const arr = JSON.parse(
      localStorage.getItem("kaiCheckinDates") || "[]",
    ) as unknown;
    if (!Array.isArray(arr)) return [];
    return arr.filter((x): x is string => typeof x === "string").sort();
  } catch {
    return [];
  }
}

function daysBetweenIso(a: string, b: string): number {
  const t0 = new Date(`${a}T12:00:00`).getTime();
  const t1 = new Date(`${b}T12:00:00`).getTime();
  return Math.round((t1 - t0) / (24 * 60 * 60 * 1000));
}

function hadComebackGap(): boolean {
  const sorted = parseDatesFromStorage();
  if (sorted.length < 2) return false;
  for (let i = 1; i < sorted.length; i += 1) {
    const gap = daysBetweenIso(sorted[i - 1], sorted[i]);
    if (gap >= 4) return true;
  }
  return false;
}

function hadMindSharpAnyDay(): boolean {
  if (typeof window === "undefined") return false;
  const dates = parseDatesFromStorage();
  const extra = isoDatesForLocalWeekContaining(new Date());
  const all = [...new Set([...dates, ...extra])];
  for (const d of all) {
    const w = localStorage.getItem(`kaiWordPuzzle_${d}`) === "1";
    const m = localStorage.getItem(`kaiMemoryGame_${d}`) === "1";
    const l = localStorage.getItem(`kaiLogicGame_${d}`) === "1";
    if (w && m && l) return true;
  }
  return false;
}

export function loadEarnedBadges(): Set<BadgeId> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(KAI_EARNED_BADGES_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as unknown;
    if (!Array.isArray(arr)) return new Set();
    return new Set(arr.filter((x): x is BadgeId => typeof x === "string"));
  } catch {
    return new Set();
  }
}

export function saveEarnedBadges(ids: Iterable<BadgeId>): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    KAI_EARNED_BADGES_KEY,
    JSON.stringify([...new Set(ids)]),
  );
}

/**
 * Evaluates rules and merges new badges into localStorage.
 * @returns Newly awarded badge ids (this run).
 */
export function checkAndAwardBadges(): BadgeId[] {
  if (typeof window === "undefined") return [];
  const current = loadEarnedBadges();
  const newly: BadgeId[] = [];

  const tryAdd = (id: BadgeId, condition: boolean) => {
    if (condition && !current.has(id)) {
      current.add(id);
      newly.push(id);
    }
  };

  tryAdd("early_bird", localStorage.getItem("kaiEarlyBirdCheckin") === "1");
  tryAdd("on_fire", getConsecutiveCheckinStreak() >= 7);
  tryAdd("comeback_kid", hadComebackGap());
  tryAdd("mind_sharp", hadMindSharpAnyDay());
  tryAdd(
    "planner",
    parseInt(localStorage.getItem("kaiPlanModeUsesTotal") || "0", 10) >= 1,
  );
  tryAdd(
    "ideas_machine",
    parseInt(localStorage.getItem("kaiBrainstormCount") || "0", 10) >= 5,
  );
  tryAdd("week_winner", localStorage.getItem("kaiLastWeeklyGrade") === "A");
  tryAdd("kai_faithful", getConsecutiveCheckinStreak() >= 30);
  tryAdd("unstoppable", getConsecutiveCheckinStreak() >= 90);
  tryAdd("goal_crusher", localStorage.getItem("kaiGoalCrusherBadge") === "1");

  if (newly.length) {
    saveEarnedBadges(current);
  }
  return newly;
}
