/**
 * Daily check-in continuity — commitments, summaries, opening lines.
 */

import { buildCheckinOpening } from "@/lib/kaiTodaysFocus";
import type { KaiMemory } from "@/lib/kaiMemory";
import { getDisplayedStreak } from "@/lib/streakSystem";
import { getStoredUserName } from "@/lib/kaiLocalProfile";

export const PREFIX_COMMIT = "checkin_commitment_";
export const PREFIX_SUMMARY = "checkin_summary_";
export const PREFIX_STATUS = "commitment_status_";

export function calendarDateIso(d: Date): string {
  return d.toISOString().split("T")[0]!;
}

export function todayIso(): string {
  return calendarDateIso(new Date());
}

export function yesterdayIso(): string {
  return calendarDateIso(new Date(Date.now() - 86400000));
}

export function getCommitmentKey(date: string): string {
  return `${PREFIX_COMMIT}${date}`;
}

export function getSummaryKey(date: string): string {
  return `${PREFIX_SUMMARY}${date}`;
}

export function getCommitmentStatusKey(date: string): string {
  return `${PREFIX_STATUS}${date}`;
}

export type CheckinSummary = {
  date: string;
  commitment: string;
  mood: string;
  completedAt: string;
};

export function detectMood(
  messages: { role: string; content: string }[],
): string {
  const userMessages = messages
    .filter((m) => m.role === "user")
    .map((m) => m.content.toLowerCase())
    .join(" ");

  if (
    userMessages.includes("great") ||
    userMessages.includes("done") ||
    userMessages.includes("completed") ||
    userMessages.includes("finished") ||
    userMessages.includes("achieved")
  ) {
    return "winning";
  }
  if (
    userMessages.includes("stuck") ||
    userMessages.includes("blocked") ||
    userMessages.includes("struggling") ||
    userMessages.includes("hard") ||
    userMessages.includes("difficult")
  ) {
    return "struggling";
  }
  if (
    userMessages.includes("okay") ||
    userMessages.includes("fine") ||
    userMessages.includes("alright") ||
    userMessages.includes("not bad")
  ) {
    return "neutral";
  }
  return "unknown";
}

export function readSummaryForDate(date: string): CheckinSummary | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(getSummaryKey(date));
    if (!raw) return null;
    const o = JSON.parse(raw) as CheckinSummary;
    if (
      typeof o.date === "string" &&
      typeof o.commitment === "string" &&
      typeof o.mood === "string" &&
      typeof o.completedAt === "string"
    ) {
      return o;
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function saveCheckinForToday(
  commitment: string,
  mood: string,
): void {
  if (typeof window === "undefined" || !commitment.trim()) return;
  const today = todayIso();
  const c = commitment.trim();
  localStorage.setItem(getCommitmentKey(today), c);
  const payload: CheckinSummary = {
    date: today,
    commitment: c,
    mood,
    completedAt: new Date().toISOString(),
  };
  localStorage.setItem(getSummaryKey(today), JSON.stringify(payload));
  window.dispatchEvent(new CustomEvent("kai-checkin-updated"));
}

/** Payload sent with /api/chat for check-in mode. */
export function getCheckinContinuityApiPayload(): {
  yesterdayCommitment: string;
  yesterdayMood: string;
  checkedInToday: boolean;
  dayStreak: number;
  yesterdayCommitmentStatus: string;
} {
  if (typeof window === "undefined") {
    return {
      yesterdayCommitment: "",
      yesterdayMood: "",
      checkedInToday: false,
      dayStreak: 0,
      yesterdayCommitmentStatus: "",
    };
  }
  const today = todayIso();
  const y = yesterdayIso();
  const yCommit = localStorage.getItem(getCommitmentKey(y))?.trim() ?? "";
  const parsed = readSummaryForDate(y);
  const todayCommit = localStorage.getItem(getCommitmentKey(today))?.trim();
  const statusRaw = localStorage.getItem(getCommitmentStatusKey(y))?.trim() ?? "";
  return {
    yesterdayCommitment: yCommit,
    yesterdayMood: parsed?.mood ?? "",
    checkedInToday: Boolean(todayCommit),
    dayStreak: getDisplayedStreak(),
    yesterdayCommitmentStatus: statusRaw === "done" || statusRaw === "carried" ? statusRaw : "",
  };
}

/**
 * First bubble in chat — continuity-first, then legacy memory / warm daily.
 */
export function buildContinuityOpeningOrFallback(m: KaiMemory): string {
  if (typeof window === "undefined") return buildCheckinOpening(m);

  const name = getStoredUserName() || "there";
  const today = todayIso();
  const y = yesterdayIso();
  const yCommit = localStorage.getItem(getCommitmentKey(y))?.trim() ?? "";
  const ySummary = readSummaryForDate(y);
  const yMood = ySummary?.mood ?? "unknown";
  const status = localStorage.getItem(getCommitmentStatusKey(y))?.trim();
  const todayCommit = localStorage.getItem(getCommitmentKey(today))?.trim();

  if (todayCommit) {
    return `Back again! Love the energy, ${name}. How is "${truncate(todayCommit, 80)}" going — making progress?`;
  }

  if (yCommit) {
    if (status === "done") {
      return `${name}! You said you'd nail "${truncate(yCommit, 90)}" — did it land? Tell me everything 😊`;
    }
    if (status === "carried") {
      return `Hey ${name} — "${truncate(yCommit, 90)}" is still in motion. No judgement. What got in the way, and what's the smallest step today?`;
    }

    if (yMood === "winning") {
      return `${name}, you were on a roll yesterday with "${truncate(yCommit, 80)}". Did it get done? What are we building on today?`;
    }
    if (yMood === "struggling") {
      return `Yesterday felt a bit heavy around "${truncate(yCommit, 70)}". How are you today — any clearer?`;
    }
    if (yMood === "neutral") {
      return `Yesterday was steady — you were working "${truncate(yCommit, 80)}". Did you finish it, or what's the tweak for today?`;
    }

    return `${name}, last time you committed to "${truncate(yCommit, 90)}". How did it go — honestly?`;
  }

  return buildCheckinOpening(m);
}

function truncate(s: string, n: number): string {
  const t = s.trim();
  if (t.length <= n) return t;
  return `${t.slice(0, n - 1)}…`;
}

export type WeekCommitmentRow = {
  date: string;
  dayLabel: string;
  commitment: string;
  status: "done" | "carried" | "none" | "pending";
};

export function getLast7DaysCommitmentRows(): WeekCommitmentRow[] {
  if (typeof window === "undefined") return [];
  const rows: WeekCommitmentRow[] = [];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(12, 0, 0, 0);
    const iso = calendarDateIso(d);
    const commit = localStorage.getItem(getCommitmentKey(iso))?.trim() ?? "";
    const st = localStorage.getItem(getCommitmentStatusKey(iso))?.trim();
    let status: WeekCommitmentRow["status"] = "none";
    if (commit) {
      if (st === "done") status = "done";
      else if (st === "carried") status = "carried";
      else status = "pending";
    }
    rows.push({
      date: iso,
      dayLabel: dayNames[d.getDay()] ?? iso,
      commitment: commit,
      status,
    });
  }
  return rows;
}

export function followThroughCount7(): number {
  const rows = getLast7DaysCommitmentRows();
  return rows.filter((r) => r.commitment && r.status === "done").length;
}
