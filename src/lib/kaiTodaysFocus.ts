import { readKaiMemory, type KaiMemory } from "@/lib/kaiMemory";
import { todayKey } from "@/lib/kaiPoints";

export const DEFAULT_CHECKIN_OPENING =
  "What's the one thing you finish today that actually moves the needle? Not 'work on' — name the output.";

/** Unfinished commitment from a prior calendar day (or explicit not-done). */
export function shouldBlockTodaysFocus(m: KaiMemory): boolean {
  if (!m.lastTask) return false;
  if (m.lastCompleted === true) return false;
  const today = todayKey();
  if (m.commitmentDate && m.commitmentDate < today) return true;
  if (m.lastCompleted === false) return true;
  return false;
}

/** First KAI line when opening Daily Check-in (client). */
export function buildCheckinOpening(m: KaiMemory): string {
  if (shouldBlockTodaysFocus(m) && m.lastTask) {
    if (m.lastCompleted === false) {
      return `Yesterday you said you'd ${m.lastTask}. You didn't do it. What happened?`;
    }
    return `You committed to "${m.lastTask}" and we never closed the loop. Did you do it? One honest answer.`;
  }
  if (m.lastTask && m.lastCompleted === true) {
    return `You did what you said yesterday. Good. Now don't slow down. What's the ONE thing you finish today?`;
  }
  return DEFAULT_CHECKIN_OPENING;
}

export type TodaysFocusResult =
  | {
      blocked: true;
      headline: string;
      body: string;
      yesterdayTask: string;
    }
  | {
      blocked: false;
      tasks: string[];
    };

/**
 * If user failed yesterday's commitment, block new focus copy.
 * Otherwise return 1–2 high-impact tasks derived from their goal.
 */
export function getTodaysFocus(goalRaw: string): TodaysFocusResult {
  const goal = goalRaw.trim();
  const m = readKaiMemory();

  if (shouldBlockTodaysFocus(m)) {
    return {
      blocked: true,
      headline: "We're not moving forward until you finish yesterday.",
      body: `You committed to: "${m.lastTask}". Close the loop — then we pick the next move.`,
      yesterdayTask: m.lastTask ?? "",
    };
  }

  if (!goal) {
    return {
      blocked: false,
      tasks: [
        "Set your main goal in onboarding — one sentence you’re embarrassed not to hit.",
        "Then hit Start Check-in. KAI will hold you to specifics.",
      ],
    };
  }

  const clipped = goal.length > 100 ? `${goal.slice(0, 97)}…` : goal;
  return {
    blocked: false,
    tasks: [
      `Single concrete output today that proves progress on: ${clipped} — name it in check-in.`,
      `Protect 25 minutes of uninterrupted work on that. No inbox. No “research.”`,
    ],
  };
}
