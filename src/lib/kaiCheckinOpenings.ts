/**
 * Warm daily check-in openings — one random line per calendar day (localStorage).
 */

import { getStoredUserName } from "@/lib/kaiLocalProfile";
import { todayKey } from "@/lib/kaiPoints";

const LS_MESSAGE = "todayOpeningMessage";
const LS_DATE = "todayOpeningMessageDate";

function displayName(): string {
  if (typeof window === "undefined") return "there";
  const n = getStoredUserName();
  return n || "there";
}

type Bucket = "morning" | "afternoon" | "evening" | "late";

function timeBucket(hour: number): Bucket {
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 21) return "evening";
  return "late";
}

const POOLS: Record<Bucket, string[]> = {
  morning: [
    "Good morning [name] ☀️ How are you feeling today? What's on your plate?",
    "Morning! [name] — What's the one thing that would make today feel like a win?",
    "Hey [name] 👋 New day, new chance. What are we working on today?",
    "Morning [name] ☀️ Yesterday is done. Today is yours. What's the plan?",
  ],
  afternoon: [
    "Hey [name] — catching you mid-day 😊 How's the day going so far?",
    "Afternoon check-in [name] 🌤️ What have you knocked out today? What's still ahead?",
    "[name]! How's your day looking? Any wins to celebrate?",
  ],
  evening: [
    "Evening [name] 🌙 How did today actually go? Be honest — I'm not judging.",
    "Hey [name] — day's winding down. What happened today that you're proud of, even something small?",
    "Evening check-in time [name] ✨ Did today go the way you planned?",
  ],
  late: [
    "Still up [name]? 🌙 What are you working on at this hour?",
    "Late night check-in [name] — the dedicated ones are always up late. What's keeping you going tonight?",
  ],
};

function interpolate(template: string, name: string): string {
  return template.replace(/\[name\]/g, name);
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

/**
 * Returns today's warm opening for the current time-of-day bucket.
 * Persists in localStorage so reopening chat the same day shows the same line.
 */
export function getWarmDailyCheckinOpening(): string {
  const name = displayName();
  const day = todayKey();
  if (typeof window !== "undefined") {
    const savedDate = localStorage.getItem(LS_DATE);
    const savedMsg = localStorage.getItem(LS_MESSAGE);
    if (savedDate === day && savedMsg?.trim()) {
      return interpolate(savedMsg.trim(), name);
    }
  }

  const h = new Date().getHours();
  const bucket = timeBucket(h);
  const pool = POOLS[bucket];
  const raw = pickRandom(pool);
  const line = interpolate(raw, name);

  if (typeof window !== "undefined") {
    localStorage.setItem(LS_DATE, day);
    localStorage.setItem(LS_MESSAGE, raw);
  }

  return line;
}
