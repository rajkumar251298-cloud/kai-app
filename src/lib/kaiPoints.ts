/** Streak points — localStorage (client-only). */

import {
  addLocalDays,
  ensureStreakProcessed,
  getCheckinHistory,
  getDisplayedStreak,
  localDateKey,
  recordStreakCheckin,
} from "@/lib/streakSystem";

export const KAI_POINTS_KEY = "kaiTotalPoints";
export const KAI_HABIT_PROFILE_KEY = "habitProfile";
export const KAI_HABIT_QUIZ_DONE_KEY = "kaiHabitQuizPointsAwarded";

export function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Local calendar date (for check-in streak alignment with streakSystem). */
export function todayKeyLocal(): string {
  if (typeof window === "undefined") return todayKey();
  return localDateKey(new Date());
}

export function getTotalPoints(): number {
  if (typeof window === "undefined") return 0;
  const v = localStorage.getItem(KAI_POINTS_KEY);
  return v ? parseInt(v, 10) || 0 : 0;
}

export function setTotalPoints(n: number): void {
  localStorage.setItem(KAI_POINTS_KEY, String(Math.max(0, n)));
}

const KAI_CHECKIN_DATES_KEY = "kaiCheckinDates";
const KAI_TOTAL_CHECKINS_KEY = "kaiTotalCheckins";
const KAI_GAMES_PLAYED_KEY = "kaiGamesPlayedTotal";

function pointsEarnedTodayKey(): string {
  return `kaiPointsEarned_${todayKey()}`;
}

function addToPointsEarnedToday(amount: number): void {
  if (typeof window === "undefined" || amount <= 0) return;
  const key = pointsEarnedTodayKey();
  const cur = parseInt(localStorage.getItem(key) || "0", 10);
  localStorage.setItem(key, String(cur + amount));
}

export function getPointsEarnedToday(): number {
  if (typeof window === "undefined") return 0;
  return parseInt(localStorage.getItem(pointsEarnedTodayKey()) || "0", 10) || 0;
}

export function hasCheckinToday(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(`kaiDailyCheckin_${todayKeyLocal()}`) === "1";
}

function getCheckinDateSet(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const arr = JSON.parse(
      localStorage.getItem(KAI_CHECKIN_DATES_KEY) || "[]",
    ) as unknown;
    if (!Array.isArray(arr)) return new Set();
    return new Set(arr.filter((x): x is string => typeof x === "string"));
  } catch {
    return new Set();
  }
}

function recordCheckinDate(t: string): void {
  const set = getCheckinDateSet();
  if (set.has(t)) return;
  set.add(t);
  const arr = [...set].sort();
  localStorage.setItem(
    KAI_CHECKIN_DATES_KEY,
    JSON.stringify(arr.slice(-200)),
  );
}

function bumpTotalCheckins(): void {
  const n =
    parseInt(localStorage.getItem(KAI_TOTAL_CHECKINS_KEY) || "0", 10) + 1;
  localStorage.setItem(KAI_TOTAL_CHECKINS_KEY, String(n));
}

export function getTotalCheckins(): number {
  if (typeof window === "undefined") return 0;
  return parseInt(localStorage.getItem(KAI_TOTAL_CHECKINS_KEY) || "0", 10) || 0;
}

function bumpGamesPlayedCount(): void {
  const n =
    parseInt(localStorage.getItem(KAI_GAMES_PLAYED_KEY) || "0", 10) + 1;
  localStorage.setItem(KAI_GAMES_PLAYED_KEY, String(n));
}

export function getGamesPlayedTotal(): number {
  if (typeof window === "undefined") return 0;
  return parseInt(localStorage.getItem(KAI_GAMES_PLAYED_KEY) || "0", 10) || 0;
}

function addUtcDays(isoDate: string, deltaDays: number): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  const dt = new Date(Date.UTC(y, (m ?? 1) - 1, (d ?? 1) + deltaDays));
  return dt.toISOString().slice(0, 10);
}

/** UTC calendar: checked in 2 days ago but not yesterday (missed one day). */
export function missedYesterdayOnly(): boolean {
  const set = getCheckinDateSet();
  const t = todayKey();
  const y = addUtcDays(t, -1);
  const y2 = addUtcDays(t, -2);
  return !set.has(y) && set.has(y2);
}

/** Consecutive local calendar days with check-in (Duolingo-style streak). */
export function getConsecutiveCheckinStreak(): number {
  if (typeof window === "undefined") return 0;
  ensureStreakProcessed();
  return getDisplayedStreak();
}

/** Seven dots: oldest → newest (rolling week ending today, local). */
export function getLast7DaysCheckinFlags(): boolean[] {
  if (typeof window === "undefined") return [];
  ensureStreakProcessed();
  const set = new Set(getCheckinHistory());
  const t = localDateKey(new Date());
  const out: boolean[] = [];
  for (let i = 6; i >= 0; i -= 1) {
    out.push(set.has(addLocalDays(t, -i)));
  }
  return out;
}

export function habitQuizProfileSaved(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(localStorage.getItem(KAI_HABIT_PROFILE_KEY)?.trim());
}

export function addPoints(amount: number): number {
  const next = getTotalPoints() + amount;
  setTotalPoints(next);
  if (typeof window !== "undefined") {
    if (amount > 0) addToPointsEarnedToday(amount);
    window.dispatchEvent(
      new CustomEvent("kai-points-earned", { detail: { amount } }),
    );
  }
  return next;
}

export function wasWordSolvedToday(): boolean {
  return localStorage.getItem(`kaiWordPuzzle_${todayKey()}`) === "1";
}

export function markWordSolvedToday(): void {
  const k = `kaiWordPuzzle_${todayKey()}`;
  const was = localStorage.getItem(k) === "1";
  localStorage.setItem(k, "1");
  if (!was) bumpGamesPlayedCount();
  tryAwardAllGamesBonus();
}

export function wasMemoryPlayedToday(): boolean {
  return localStorage.getItem(`kaiMemoryGame_${todayKey()}`) === "1";
}

export function markMemoryPlayedToday(): void {
  const k = `kaiMemoryGame_${todayKey()}`;
  const was = localStorage.getItem(k) === "1";
  localStorage.setItem(k, "1");
  if (!was) bumpGamesPlayedCount();
  tryAwardAllGamesBonus();
}

export function wasLogicPlayedToday(): boolean {
  return localStorage.getItem(`kaiLogicGame_${todayKey()}`) === "1";
}

export function markLogicPlayedToday(): void {
  const k = `kaiLogicGame_${todayKey()}`;
  const was = localStorage.getItem(k) === "1";
  localStorage.setItem(k, "1");
  if (!was) bumpGamesPlayedCount();
  tryAwardAllGamesBonus();
}

export function getMemoryBestMoves(): number | null {
  const v = localStorage.getItem("kaiMemoryBestMoves");
  if (!v) return null;
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : null;
}

export function saveMemoryBestMoves(moves: number): void {
  const cur = getMemoryBestMoves();
  if (cur === null || moves < cur) {
    localStorage.setItem("kaiMemoryBestMoves", String(moves));
  }
}

function memoryBestScoreKey(isoDate: string): string {
  return `memoryBestScore_${isoDate}`;
}

export function getMemoryBestForDate(isoDate: string): number | null {
  if (typeof window === "undefined") return null;
  const v = localStorage.getItem(memoryBestScoreKey(isoDate));
  if (!v) return null;
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : null;
}

export function saveMemoryBestForDate(isoDate: string, moves: number): void {
  const cur = getMemoryBestForDate(isoDate);
  if (cur === null || moves < cur) {
    localStorage.setItem(memoryBestScoreKey(isoDate), String(moves));
  }
}

const PERFECT_GAMES_KEY_PREFIX = "kaiPerfectGames_";
const DAILY_REFLECTION_PTS_PREFIX = "kaiDailyReflectionPts_";

/** +5 once per calendar day after answering the daily reflection. */
export function tryAwardDailyReflectionPoints(): boolean {
  if (typeof window === "undefined") return false;
  const k = `${DAILY_REFLECTION_PTS_PREFIX}${todayKey()}`;
  if (localStorage.getItem(k)) return false;
  localStorage.setItem(k, "1");
  addPoints(5);
  return true;
}

/** +10 once per day when word, memory, and logic are all completed. */
export function tryAwardAllGamesBonus(): void {
  if (typeof window === "undefined") return;
  if (!wasWordSolvedToday() || !wasMemoryPlayedToday() || !wasLogicPlayedToday())
    return;
  const k = `${PERFECT_GAMES_KEY_PREFIX}${todayKey()}`;
  if (localStorage.getItem(k)) return;
  localStorage.setItem(k, "1");
  addPoints(10);
}

function yesterdayKey(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export function getPointsEarnedForDate(isoDate: string): number {
  if (typeof window === "undefined") return 0;
  return (
    parseInt(localStorage.getItem(`kaiPointsEarned_${isoDate}`) || "0", 10) ||
    0
  );
}

/** Count distinct game plays (word / memory / logic) on the given ISO dates. */
export function countGamesPlayedOnDates(dates: string[]): number {
  if (typeof window === "undefined") return 0;
  let n = 0;
  for (const d of dates) {
    if (localStorage.getItem(`kaiWordPuzzle_${d}`) === "1") n += 1;
    if (localStorage.getItem(`kaiMemoryGame_${d}`) === "1") n += 1;
    if (localStorage.getItem(`kaiLogicGame_${d}`) === "1") n += 1;
  }
  return n;
}

/** How many of the given ISO dates have a recorded check-in. */
export function countCheckinsOnDates(dates: string[]): number {
  const set = getCheckinDateSet();
  return dates.reduce((acc, d) => acc + (set.has(d) ? 1 : 0), 0);
}

/** +20 once per calendar day when daily check-in is marked complete (call from chat/home). */
export function tryAwardDailyCheckin(): boolean {
  const t = todayKeyLocal();
  const k = `kaiDailyCheckin_${t}`;
  if (localStorage.getItem(k)) return false;
  const res = recordStreakCheckin();
  if (res.alreadyCheckedIn) return false;
  localStorage.setItem(k, "1");
  recordCheckinDate(t);
  bumpTotalCheckins();
  addPoints(20);
  bumpCheckinStreak();
  const h = new Date().getHours();
  if (h < 8) {
    localStorage.setItem("kaiEarlyBirdCheckin", "1");
  }
  return true;
}

/** +100 every time a 7-day consecutive check-in streak completes. */
function bumpCheckinStreak(): void {
  const t = todayKey();
  const last = localStorage.getItem("kaiLastCheckinDate");
  const prevCount = parseInt(localStorage.getItem("kaiStreakCount") || "0", 10);
  let next = 1;
  if (last === yesterdayKey()) next = prevCount + 1;
  else if (last === t) return;
  localStorage.setItem("kaiLastCheckinDate", t);
  if (next >= 7) {
    addPoints(100);
    next = 0;
  }
  localStorage.setItem("kaiStreakCount", String(next));
}

export function habitQuizPointsAlreadyAwarded(): boolean {
  return localStorage.getItem(KAI_HABIT_QUIZ_DONE_KEY) === "1";
}

export function markHabitQuizPointsAwarded(): void {
  localStorage.setItem(KAI_HABIT_QUIZ_DONE_KEY, "1");
}
