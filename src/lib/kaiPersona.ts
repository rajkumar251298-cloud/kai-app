import { getDisplayedStreak, ensureStreakProcessed } from "@/lib/streakSystem";

export const LS_USER_AGE_GROUP = "userAgeGroup";
export const LS_USER_GOAL_TYPE = "userGoalType";

export type UserAgeGroup =
  | "student"
  | "early_career"
  | "building"
  | "senior"
  | "";

export type UserGoalType =
  | "study"
  | "career"
  | "health"
  | "startup"
  | "";

export function readUserAgeGroup(): UserAgeGroup {
  if (typeof window === "undefined") return "";
  const v = localStorage.getItem(LS_USER_AGE_GROUP)?.trim() ?? "";
  if (
    v === "student" ||
    v === "early_career" ||
    v === "building" ||
    v === "senior"
  ) {
    return v;
  }
  return "";
}

export function readUserGoalType(): UserGoalType {
  if (typeof window === "undefined") return "";
  const v = localStorage.getItem(LS_USER_GOAL_TYPE)?.trim() ?? "";
  if (v === "study" || v === "career" || v === "health" || v === "startup") {
    return v;
  }
  return "";
}

export function homeRoleLabel(): string {
  const age = readUserAgeGroup();
  if (age === "student") return "Student";
  if (age === "early_career") return "Professional";
  if (age === "building") return "Entrepreneur";
  if (age === "senior") return "Leader";
  return "Entrepreneur";
}

export function homeGreetingSubtitle(): string {
  if (typeof window === "undefined") return "Let's make today count.";
  ensureStreakProcessed();
  const streak = getDisplayedStreak();
  const role = homeRoleLabel();
  return `${role} · ${streak} day streak 🔥`;
}

export function personaFocusSubtitle(): string {
  const age = readUserAgeGroup();
  if (age === "student") return "Let's make today's study count.";
  if (age === "early_career") return "What are you building today?";
  if (age === "building") return "Ship something today.";
  if (age === "senior") return "Lead from the front today.";
  return "Let's make today count.";
}

export function todaysFocusTasksForPersona(goalRaw: string): string[] {
  const age = readUserAgeGroup();
  const g = goalRaw.trim();
  const goalHint =
    g.length > 0
      ? (g.length > 80 ? `${g.slice(0, 77)}…` : g)
      : "your main goal";

  if (age === "student") {
    return [
      `Finish Chapter 4 revision — tie it to ${goalHint}.`,
      "Complete 20 practice questions without scrolling.",
      "Review yesterday's notes in 25 focused minutes.",
    ];
  }
  if (age === "early_career") {
    return [
      "Complete the project report — ship a draft, not a plan.",
      "Send those 3 follow-up emails you've been avoiding.",
      "Prepare for tomorrow's meeting: 3 bullets that show leverage.",
    ];
  }
  if (age === "building") {
    return [
      "Talk to 1 potential customer — notes, not vibes.",
      "Ship the feature you've been delaying; cut scope if needed.",
      "Write this week's update post — publish or it doesn't count.",
    ];
  }
  if (age === "senior") {
    return [
      "Unblock your team on the one decision only you can make.",
      "Make the call you've been postponing — today.",
      "Delegate 2 things off your plate with clear owners.",
    ];
  }
  return [
    `Single concrete output today that proves progress on: ${goalHint} — name it in check-in.`,
    `Protect 25 minutes of uninterrupted work on that. No inbox. No "research."`,
  ];
}

export function checkinDefaultOpening(): string {
  const age = readUserAgeGroup();
  const gt = readUserGoalType();
  if (age === "student" && gt === "study") {
    return "What are you studying today — which chapter or topic feels most important to touch?";
  }
  if (age === "early_career" && gt === "career") {
    return "What's one work thing today that would genuinely move you forward — even a small step counts?";
  }
  if (age === "building" && gt === "startup") {
    return "What did you get done last time we talked — and what's one small thing you'd love to ship today?";
  }
  if (age === "senior") {
    return "What's one high-leverage thing you could do today — the kind only you can do?";
  }
  if (gt === "study") {
    return "What are you studying today — which chapter or topic is on your mind?";
  }
  if (gt === "career") {
    return "What's one work win you could aim for today — even a modest one?";
  }
  if (gt === "startup") {
    return "What's one small thing you could ship or move forward today?";
  }
  return "What's one thing that would make today feel like progress for you?";
}

export function stuckOpeningForPersona(): string {
  if (typeof window === "undefined") {
    return "I'm glad you're here. What's feeling stuck — in your own words?";
  }
  const name = localStorage.getItem("userName")?.trim() || "there";
  return `${name}, I'm really glad you came here. What's feeling stuck right now — in plain words?`;
}
