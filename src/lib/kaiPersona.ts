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
    return "What subject or topic are you studying today? And be specific — not 'studying' but which chapter, which concept.";
  }
  if (age === "early_career" && gt === "career") {
    return "What's the one work task today that will actually move your career forward? Not the busywork — the real thing.";
  }
  if (age === "building" && gt === "startup") {
    return "What did you ship yesterday? And what's shipping today?";
  }
  if (age === "senior") {
    return "What is the highest leverage thing you can do today — the thing only you can do?";
  }
  if (gt === "study") {
    return "What subject or topic are you studying today? Be specific — chapter and concept.";
  }
  if (gt === "career") {
    return "What's the one work task today that actually moves your career forward?";
  }
  if (gt === "startup") {
    return "What did you ship yesterday — and what's shipping today?";
  }
  return "What's the one thing you finish today that actually moves the needle? Not 'work on' — name the output.";
}

export function stuckOpeningForPersona(): string {
  const age = readUserAgeGroup();
  const gt = readUserGoalType();
  if (age === "student" || gt === "study") {
    return "You're stuck — is it exam anxiety, not knowing where to start, or procrastination? Say which, then name the smallest next step.";
  }
  if (age === "early_career" || gt === "career") {
    return "You're stuck at work — office politics, a skill gap, or a hard conversation (like salary)? Name the real blocker in one line.";
  }
  if (age === "building" || gt === "startup") {
    return "Founder mode: are you stuck on product, finding users, or fundraising? Pick one — we'll unstick it fast.";
  }
  if (age === "senior") {
    return "Leadership crunch: team, strategy, or burnout? Which is eating you right now — be blunt.";
  }
  return "Got it — you're blocked. Describe exactly what you're stuck on. The more specific, the faster we solve it.";
}
