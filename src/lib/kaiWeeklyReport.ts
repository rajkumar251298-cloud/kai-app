import { loadGoals } from "@/lib/kaiGoals";
import {
  countCheckinsOnDates,
  countGamesPlayedOnDates,
  getConsecutiveCheckinStreak,
  getPointsEarnedForDate,
} from "@/lib/kaiPoints";

export const KAI_LAST_WEEKLY_GRADE_KEY = "kaiLastWeeklyGrade";

export type LetterGrade = "A" | "B" | "C" | "D" | "F";

export function startOfWeekMondayLocal(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  const day = x.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  x.setDate(x.getDate() + diff);
  return x;
}

export function endOfWeekSundayLocal(startMonday: Date): Date {
  const x = new Date(startMonday);
  x.setDate(x.getDate() + 6);
  x.setHours(23, 59, 59, 999);
  return x;
}

/** ISO date strings (local calendar) for Mon–Sun week containing `d`. */
export function isoDatesForLocalWeekContaining(d: Date): string[] {
  const start = startOfWeekMondayLocal(d);
  const out: string[] = [];
  for (let i = 0; i < 7; i += 1) {
    const x = new Date(start);
    x.setDate(start.getDate() + i);
    const y = x.getFullYear();
    const m = String(x.getMonth() + 1).padStart(2, "0");
    const day = String(x.getDate()).padStart(2, "0");
    out.push(`${y}-${m}-${day}`);
  }
  return out;
}

export function formatWeekSubtitle(d: Date): string {
  const dates = isoDatesForLocalWeekContaining(d);
  const a = new Date(`${dates[0]}T12:00:00`);
  const b = new Date(`${dates[6]}T12:00:00`);
  const fmt = (x: Date) =>
    x.toLocaleDateString("en-US", { month: "long", day: "numeric" });
  const y = a.getFullYear();
  return `Week of ${fmt(a)} – ${fmt(b)}, ${y}`;
}

function goalsSubscore(checkinsWeek: number, goalsCount: number): number {
  if (goalsCount === 0) return 55;
  return Math.min(100, Math.round(35 + (checkinsWeek / 7) * 65));
}

export function letterFromScore(score: number): LetterGrade {
  if (score >= 90) return "A";
  if (score >= 75) return "B";
  if (score >= 50) return "C";
  if (score >= 25) return "D";
  return "F";
}

export const GRADE_COPY: Record<
  LetterGrade,
  { label: string; line: string }
> = {
  A: {
    label: "Exceptional Week",
    line: "You showed up every day. That's rare.",
  },
  B: {
    label: "Solid Progress",
    line: "Good week. Now make next week better.",
  },
  C: {
    label: "Room to Grow",
    line: "You started strong. Finish stronger.",
  },
  D: {
    label: "Slipping — Time to Reset",
    line: "Everyone slips. What matters is today.",
  },
  F: {
    label: "KAI Missed You This Week",
    line: "No judgement. Just come back.",
  },
};

export type WeeklyReportSnapshot = {
  weekDates: string[];
  weekLabel: string;
  checkins: number;
  gamesPlayed: number;
  streak: number;
  pointsEarned: number;
  score: number;
  grade: LetterGrade;
};

export function computeWeeklyReport(now = new Date()): WeeklyReportSnapshot {
  const weekDates = isoDatesForLocalWeekContaining(now);
  const checkins = countCheckinsOnDates(weekDates);
  const gamesPlayed = countGamesPlayedOnDates(weekDates);
  const streak = getConsecutiveCheckinStreak();
  const goalsCount = loadGoals().length;

  let pointsEarned = 0;
  for (const iso of weekDates) {
    pointsEarned += getPointsEarnedForDate(iso);
  }

  const checkinScore = (checkins / 7) * 100;
  const gamesScore = Math.min(100, (gamesPlayed / 21) * 100);
  const streakScore = Math.min(100, (Math.min(streak, 7) / 7) * 100);
  const goalScore = goalsSubscore(checkins, goalsCount);

  const score = Math.round(
    checkinScore * 0.4 +
      gamesScore * 0.2 +
      streakScore * 0.2 +
      goalScore * 0.2,
  );

  const grade = letterFromScore(score);

  return {
    weekDates,
    weekLabel: formatWeekSubtitle(now),
    checkins,
    gamesPlayed,
    streak,
    pointsEarned,
    score,
    grade,
  };
}

export function persistWeeklyGradeForBadges(grade: LetterGrade): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KAI_LAST_WEEKLY_GRADE_KEY, grade);
}
