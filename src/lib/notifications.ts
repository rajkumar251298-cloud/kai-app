import { getStoredCheckInTime } from "@/lib/kaiLocalProfile";
import {
  getConsecutiveCheckinStreak,
  hasCheckinToday,
  missedYesterdayOnly,
} from "@/lib/kaiPoints";

const K_NOTIFY = "kaiPrefsNotifications";
const K_REMINDER = "kaiDailyReminderTime";
const K_PERM = "kaiNotificationPermission";

const timers: number[] = [];

function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]!;
}

const MORNING = (name: string) => [
  `${name}. Your goals called. They said you've been ghosting them. 👀`,
  `It's already 10am. Your excuses are warmed up. Get to KAI before they win. ⚡`,
  `Good morning ${name}. Or is it? Check in and let's find out. ☀️`,
  `Your future self is watching. Right now. Don't let them down. 💪`,
  `The most successful people already checked in today. Just saying. 🏆`,
];

const AFTERNOON = (name: string) => [
  `Half the day is gone ${name}. What have you actually done? ⏰`,
  `Afternoon check-in. 2 minutes. KAI is waiting. Don't ghost a coach. 😤`,
  `Your goals don't take afternoons off. Neither should you. 🎯`,
  `The gap between who you are and who you want to be closes one check-in at a time.`,
];

const EVENING = (name: string) => [
  `${name} — the day is almost gone. Did you do the thing? 🌙`,
  `Evening. How did today actually go? Be honest with KAI. 2 minutes.`,
  `Don't let today end without accounting for it. Quick check-in. ⚡`,
];

const STREAK_PROT = (name: string, streak: number) => [
  `🚨 STREAK ALERT 🚨 ${name} your ${streak} day streak ends in 3 hours. Don't waste it.`,
  `You've checked in ${streak} days straight. Tonight is not the night to stop.`,
  `${streak} days. Gone forever if you sleep now. 2 minutes. Go.`,
];

const COMEBACK = (name: string) => [
  `Yesterday happened. Today is different. Come back ${name}. ⚡`,
  `Missing one day is human. Missing two is a choice. Choose wisely.`,
  `KAI noticed you were gone. No judgement. Just come back. 🤝`,
];

const MONDAY = (name: string) => [
  `New week ${name}. New chance to be the person you keep saying you'll be. Go. 🔥`,
  `Monday energy. Most people waste it. You won't. Check in now.`,
];

const WEEKEND = (name: string) => [
  `Even on weekends your goals don't rest. 2 minute check-in ${name}. Then enjoy it. ☀️`,
  `Saturday. The people who win the week check in today too. Are you one of them?`,
];

export function saveNotificationPermissionStatus(): void {
  if (typeof window === "undefined" || typeof Notification === "undefined")
    return;
  localStorage.setItem(K_PERM, Notification.permission);
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === "undefined" || typeof Notification === "undefined") {
    return "denied";
  }
  const p = await Notification.requestPermission();
  saveNotificationPermissionStatus();
  return p;
}

function remindersEnabled(): boolean {
  return localStorage.getItem(K_NOTIFY) !== "0";
}

function permissionOk(): boolean {
  return (
    typeof Notification !== "undefined" && Notification.permission === "granted"
  );
}

/** Parse "7am", "09:00", etc. → minutes from midnight local. */
export function parseDailyTimeToMinutes(): number {
  if (typeof window === "undefined") return 10 * 60;
  const hhmm = localStorage.getItem(K_REMINDER)?.trim();
  if (hhmm && /^\d{1,2}:\d{2}$/.test(hhmm)) {
    const [h, m] = hhmm.split(":").map(Number);
    if (Number.isFinite(h) && Number.isFinite(m)) {
      return Math.min(23 * 60 + 59, Math.max(0, h * 60 + m));
    }
  }
  const raw = getStoredCheckInTime().toLowerCase().trim();
  const m = raw.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i);
  if (!m) return 7 * 60;
  let h = parseInt(m[1]!, 10);
  const min = m[2] ? parseInt(m[2], 10) : 0;
  const ap = m[3]?.toLowerCase();
  if (ap === "pm" && h < 12) h += 12;
  if (ap === "am" && h === 12) h = 0;
  return Math.min(23 * 60 + 59, Math.max(0, h * 60 + min));
}

function atTodayMinutes(ref: Date, totalMin: number): Date {
  const d = new Date(ref);
  d.setHours(Math.floor(totalMin / 60), totalMin % 60, 0, 0);
  return d;
}

function msUntil(target: Date): number {
  return Math.max(0, target.getTime() - Date.now());
}

function scheduleOnce(delayMs: number, fn: () => void): void {
  const id = window.setTimeout(() => {
    const idx = timers.indexOf(id);
    if (idx >= 0) timers.splice(idx, 1);
    fn();
  }, delayMs);
  timers.push(id);
}

function showNotif(title: string, body: string, tag: string) {
  if (!permissionOk() || !remindersEnabled()) return;
  try {
    new Notification(title, { body, tag, icon: "/favicon.ico" });
  } catch {
    /* ignore */
  }
}

export function cancelScheduledNotifications(): void {
  for (const id of timers) window.clearTimeout(id);
  timers.length = 0;
}

function rescheduleSoon() {
  scheduleOnce(60_000, () => {
    scheduleNotifications();
  });
}

/**
 * Schedules browser notifications using timeouts. Re-schedules itself periodically.
 */
export function scheduleNotifications(): void {
  cancelScheduledNotifications();
  if (typeof window === "undefined") return;
  if (!remindersEnabled() || !permissionOk()) return;

  const name = localStorage.getItem("userName")?.trim() || "there";
  const streak = getConsecutiveCheckinStreak();
  const now = new Date();
  const checkMin = parseDailyTimeToMinutes();
  const baseCheck = new Date(now);
  baseCheck.setHours(Math.floor(checkMin / 60), checkMin % 60, 0, 0);
  const morningNudge = new Date(baseCheck.getTime() + 2 * 60 * 60 * 1000);

  const afternoon = atTodayMinutes(now, 14 * 60);
  const evening = atTodayMinutes(now, 19 * 60);
  const streakH = atTodayMinutes(now, 21 * 60);

  const candidates: { at: Date; run: () => void }[] = [];

  if (!hasCheckinToday()) {
    if (morningNudge > now) {
      candidates.push({
        at: morningNudge,
        run: () => {
          if (!hasCheckinToday() && remindersEnabled())
            showNotif("KAI", pick(MORNING(name)), "kai-morning");
        },
      });
    }
    if (afternoon > now) {
      candidates.push({
        at: afternoon,
        run: () => {
          if (!hasCheckinToday() && remindersEnabled())
            showNotif("KAI", pick(AFTERNOON(name)), "kai-afternoon");
        },
      });
    }
    if (evening > now) {
      candidates.push({
        at: evening,
        run: () => {
          if (!hasCheckinToday() && remindersEnabled())
            showNotif("KAI", pick(EVENING(name)), "kai-evening");
        },
      });
    }
    if (streak > 3 && streakH > now) {
      candidates.push({
        at: streakH,
        run: () => {
          if (!hasCheckinToday() && remindersEnabled())
            showNotif(
              "KAI",
              pick(STREAK_PROT(name, streak)),
              "kai-streak",
            );
        },
      });
    }
  }

  const dow = now.getDay();
  const monM = atTodayMinutes(now, 9 * 60);
  if (dow === 1 && monM > now && !hasCheckinToday()) {
    candidates.push({
      at: monM,
      run: () => {
        if (!hasCheckinToday() && remindersEnabled())
          showNotif("KAI", pick(MONDAY(name)), "kai-monday");
      },
    });
  }
  if ((dow === 6 || dow === 0) && !hasCheckinToday()) {
    const wk = atTodayMinutes(now, 10 * 60);
    if (wk > now) {
      candidates.push({
        at: wk,
        run: () => {
          if (!hasCheckinToday() && remindersEnabled())
            showNotif("KAI", pick(WEEKEND(name)), "kai-weekend");
        },
      });
    }
  }

  const comebackAt = atTodayMinutes(now, 11 * 60);
  if (comebackAt > now && missedYesterdayOnly() && !hasCheckinToday()) {
    candidates.push({
      at: comebackAt,
      run: () => {
        if (remindersEnabled() && missedYesterdayOnly())
          showNotif("KAI", pick(COMEBACK(name)), "kai-comeback");
      },
    });
  }

  candidates.sort((a, b) => a.at.getTime() - b.at.getTime());
  const next = candidates[0];
  if (next) {
    scheduleOnce(msUntil(next.at), () => {
      next.run();
      rescheduleSoon();
    });
  } else {
    rescheduleSoon();
  }
}

export { K_NOTIFY, K_PERM };
