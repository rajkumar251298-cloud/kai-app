/**
 * Duolingo-style streak: localStorage source of truth.
 * Keys: lastCheckinDate, currentStreak, longestStreak, checkinHistory,
 * streakFreezeUsed (weekly token), streakFreezeWeekId (Monday key).
 */

const LS_LAST = "lastCheckinDate";
const LS_CURRENT = "currentStreak";
const LS_LONGEST = "longestStreak";
const LS_HISTORY = "checkinHistory";
/** "1" when this ISO week's freeze has been consumed */
const LS_FREEZE_USED = "streakFreezeUsed";
/** YYYY-MM-DD of the Monday starting the week for LS_FREEZE_USED */
const LS_FREEZE_WEEK = "streakFreezeWeekId";

const KAI_CHECKIN_DATES_KEY = "kaiCheckinDates";

let loadRan = false;

export function localDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function addLocalDays(iso: string, delta: number): string {
  const [y, mo, da] = iso.split("-").map(Number);
  const dt = new Date(y!, (mo ?? 1) - 1, (da ?? 1) + delta);
  return localDateKey(dt);
}

export function daysBetweenIso(a: string, b: string): number {
  const t0 = new Date(`${a}T12:00:00`).getTime();
  const t1 = new Date(`${b}T12:00:00`).getTime();
  return Math.round((t1 - t0) / (24 * 60 * 60 * 1000));
}

/** Local-calendar Monday of the week containing `d` (Mon–Sun week). */
export function mondayOfWeekContaining(d: Date): string {
  const c = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = c.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  c.setDate(c.getDate() + diff);
  return localDateKey(c);
}

function readHistory(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LS_HISTORY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as unknown;
    if (!Array.isArray(arr)) return [];
    return [...new Set(arr.filter((x): x is string => typeof x === "string"))].sort();
  } catch {
    return [];
  }
}

function writeHistory(dates: string[]): void {
  const sorted = [...new Set(dates)].sort();
  localStorage.setItem(LS_HISTORY, JSON.stringify(sorted.slice(-400)));
  syncKaiCheckinDates(sorted);
}

function syncKaiCheckinDates(sorted: string[]): void {
  localStorage.setItem(
    KAI_CHECKIN_DATES_KEY,
    JSON.stringify(sorted.slice(-200)),
  );
}

function migrateFromLegacy(): void {
  if (localStorage.getItem(LS_HISTORY)) return;
  try {
    const raw = localStorage.getItem(KAI_CHECKIN_DATES_KEY);
    if (!raw) return;
    const arr = JSON.parse(raw) as unknown;
    if (!Array.isArray(arr)) return;
    const dates = arr.filter((x): x is string => typeof x === "string");
    if (dates.length === 0) return;
    localStorage.setItem(LS_HISTORY, JSON.stringify([...new Set(dates)].sort()));
    if (!localStorage.getItem(LS_CURRENT)) {
      const today = localDateKey(new Date());
      let n = 0;
      let k = today;
      const set = new Set(dates);
      while (set.has(k)) {
        n += 1;
        k = addLocalDays(k, -1);
      }
      localStorage.setItem(LS_CURRENT, String(n));
      localStorage.setItem(LS_LONGEST, String(n));
      const last = [...dates].sort().pop();
      if (last) localStorage.setItem(LS_LAST, last);
    }
  } catch {
    /* ignore */
  }
}

function readInt(key: string, fallback: number): number {
  const v = parseInt(localStorage.getItem(key) || "", 10);
  return Number.isFinite(v) ? v : fallback;
}

function ensureFreezeWeekRollover(): void {
  const todayMon = mondayOfWeekContaining(new Date());
  const stored = localStorage.getItem(LS_FREEZE_WEEK);
  if (stored !== todayMon) {
    localStorage.setItem(LS_FREEZE_WEEK, todayMon);
    localStorage.setItem(LS_FREEZE_USED, "0");
  }
}

/** Freeze available = weekly token not consumed */
export function hasStreakFreezeAvailable(): boolean {
  if (typeof window === "undefined") return false;
  ensureFreezeWeekRollover();
  return localStorage.getItem(LS_FREEZE_USED) !== "1";
}

export type StreakLoadResult = {
  broken?: { previousStreak: number; longestStreak: number };
  freezeUsed?: { protectedStreak: number };
};

export function ensureStreakProcessed(): void {
  if (typeof window === "undefined" || loadRan) return;
  loadRan = true;
  processStreakOnAppLoad();
}

function emitBroken(previousStreak: number, longestStreak: number): void {
  queueMicrotask(() => {
    window.dispatchEvent(
      new CustomEvent("kai-streak-broken", {
        detail: { previousStreak, longestStreak },
      }),
    );
  });
}

function emitFreeze(protectedStreak: number): void {
  queueMicrotask(() => {
    window.dispatchEvent(
      new CustomEvent("kai-streak-freeze-used", {
        detail: { protectedStreak },
      }),
    );
  });
}

/**
 * Run once per full page load. Handles gap since last check-in, freeze, broken streak.
 */
export function processStreakOnAppLoad(): StreakLoadResult {
  if (typeof window === "undefined") return {};
  migrateFromLegacy();
  ensureFreezeWeekRollover();

  const today = localDateKey(new Date());
  let history = readHistory();
  const set = new Set(history);

  if (history.length > 0) {
    const latest = history[history.length - 1]!;
    localStorage.setItem(LS_LAST, latest);
  }

  let last = localStorage.getItem(LS_LAST)?.trim() || "";
  let current = readInt(LS_CURRENT, 0);
  const longest = readInt(LS_LONGEST, 0);

  if (!last) {
    localStorage.setItem(LS_CURRENT, "0");
    if (!localStorage.getItem(LS_LONGEST)) {
      localStorage.setItem(LS_LONGEST, "0");
    }
    if (history.length) writeHistory(history);
    return {};
  }

  const diff = daysBetweenIso(last, today);

  if (diff <= 0) {
    if (history.length) writeHistory(history);
    return {};
  }

  if (diff === 1) {
    if (history.length) writeHistory(history);
    return {};
  }

  if (diff === 2) {
    const missed = addLocalDays(last, 1);
    if (set.has(missed)) {
      localStorage.setItem(LS_LAST, missed);
      writeHistory(history);
      return {};
    }
    if (hasStreakFreezeAvailable()) {
      set.add(missed);
      history = [...set].sort();
      writeHistory(history);
      localStorage.setItem(LS_LAST, missed);
      localStorage.setItem(LS_FREEZE_USED, "1");
      emitFreeze(current);
      return { freezeUsed: { protectedStreak: current } };
    }
    const prev = current;
    localStorage.setItem(LS_CURRENT, "0");
    if (prev > 0) emitBroken(prev, Math.max(longest, prev));
    writeHistory(history);
    return {
      broken: { previousStreak: prev, longestStreak: Math.max(longest, prev) },
    };
  }

  {
    const prev = current;
    localStorage.setItem(LS_CURRENT, "0");
    if (prev > 0) emitBroken(prev, Math.max(longest, prev));
    writeHistory(history);
    return {
      broken: { previousStreak: prev, longestStreak: Math.max(longest, prev) },
    };
  }
}

const MILESTONES = [7, 14, 21, 30, 60, 90] as const;

export type RecordCheckinResult = {
  alreadyCheckedIn: boolean;
  newStreak: number;
  milestone?: (typeof MILESTONES)[number];
};

/**
 * Call when user completes daily check-in (once per local day).
 */
export function recordStreakCheckin(): RecordCheckinResult {
  if (typeof window === "undefined") {
    return { alreadyCheckedIn: true, newStreak: 0 };
  }
  ensureStreakProcessed();
  migrateFromLegacy();
  ensureFreezeWeekRollover();

  const today = localDateKey(new Date());
  const history = readHistory();
  const set = new Set(history);

  if (set.has(today)) {
    return { alreadyCheckedIn: true, newStreak: readInt(LS_CURRENT, 0) };
  }

  const yesterday = addLocalDays(today, -1);
  let current = readInt(LS_CURRENT, 0);
  const longest = readInt(LS_LONGEST, 0);
  const last = localStorage.getItem(LS_LAST)?.trim() || "";

  let newStreak: number;
  if (set.has(yesterday)) {
    newStreak = current + 1;
  } else if (last === yesterday) {
    newStreak = current + 1;
  } else {
    newStreak = 1;
  }

  set.add(today);
  const nextHist = [...set].sort();
  writeHistory(nextHist);

  const nextLongest = Math.max(longest, newStreak);
  localStorage.setItem(LS_CURRENT, String(newStreak));
  localStorage.setItem(LS_LONGEST, String(nextLongest));
  localStorage.setItem(LS_LAST, today);

  let milestone: (typeof MILESTONES)[number] | undefined;
  for (const m of MILESTONES) {
    if (newStreak === m) milestone = m;
  }
  if (milestone) {
    queueMicrotask(() => {
      window.dispatchEvent(
        new CustomEvent("kai-streak-milestone", {
          detail: { days: milestone },
        }),
      );
    });
  }

  window.dispatchEvent(new CustomEvent("kai-streak-updated"));

  return { alreadyCheckedIn: false, newStreak, milestone };
}

/** Streak count shown in UI (after load processing). */
export function getDisplayedStreak(): number {
  if (typeof window === "undefined") return 0;
  ensureStreakProcessed();
  return readInt(LS_CURRENT, 0);
}

export function getLongestStreak(): number {
  if (typeof window === "undefined") return 0;
  ensureStreakProcessed();
  return readInt(LS_LONGEST, 0);
}

export function isCheckedInLocalDate(iso: string): boolean {
  if (typeof window === "undefined") return false;
  ensureStreakProcessed();
  return readHistory().includes(iso);
}

export type WeekCellStatus = "done" | "missed" | "today_pending" | "future";

export type WeekStreakCell = {
  iso: string;
  shortLabel: string;
  status: WeekCellStatus;
};

/** Monday through today (local), for weekly streak UI. */
export function getWeekStreakCells(now = new Date()): WeekStreakCell[] {
  if (typeof window === "undefined") return [];
  ensureStreakProcessed();
  const today = localDateKey(now);
  const monday = mondayOfWeekContaining(now);
  const set = new Set(readHistory());
  const labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const out: WeekStreakCell[] = [];
  for (let d = monday; d <= today; d = addLocalDays(d, 1)) {
    const dt = new Date(`${d}T12:00:00`);
    const shortLabel = labels[dt.getDay()] ?? "—";
    let status: WeekCellStatus;
    if (d === today) {
      status = set.has(d) ? "done" : "today_pending";
    } else if (set.has(d)) {
      status = "done";
    } else {
      status = "missed";
    }
    out.push({ iso: d, shortLabel, status });
  }
  return out;
}

export function getCheckinHistory(): string[] {
  if (typeof window === "undefined") return [];
  ensureStreakProcessed();
  return readHistory();
}
