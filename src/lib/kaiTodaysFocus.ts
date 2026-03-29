import { readKaiMemory, type KaiMemory } from "@/lib/kaiMemory";
import { todayKey } from "@/lib/kaiPoints";
import { getStoredUserName } from "@/lib/kaiLocalProfile";
import { getWarmDailyCheckinOpening } from "@/lib/kaiCheckinOpenings";
import {
  checkinDefaultOpening,
  todaysFocusTasksForPersona,
} from "@/lib/kaiPersona";

export const DEFAULT_CHECKIN_OPENING = checkinDefaultOpening();

function displayNameForOpening(): string {
  if (typeof window === "undefined") return "there";
  return getStoredUserName() || "there";
}

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
  const name = displayNameForOpening();
  if (shouldBlockTodaysFocus(m) && m.lastTask) {
    if (m.lastCompleted === false) {
      return `Hey ${name} — you were aiming to ${m.lastTask}. No judgement. How did it really go?`;
    }
    return `${name}, we left "${m.lastTask}" open. Did you get to it? I'd love to hear either way.`;
  }
  if (m.lastTask && m.lastCompleted === true) {
    return `Love that you followed through on ${m.lastTask}. What's one thing that would make today feel like a win?`;
  }
  return getWarmDailyCheckinOpening();
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
      headline: "Let's gently close the loop on yesterday first.",
      body: `You were aiming for: "${m.lastTask}". No stress — when you're ready, tell KAI how it went, then we pick the next step together.`,
      yesterdayTask: m.lastTask ?? "",
    };
  }

  if (!goal) {
    return {
      blocked: false,
      tasks: [
        "Set your main goal in onboarding — one sentence that really matters to you.",
        "Then open Daily Check-in. KAI will help you turn it into small, doable steps.",
      ],
    };
  }

  return {
    blocked: false,
    tasks: todaysFocusTasksForPersona(goal),
  };
}
