/**
 * Canonical localStorage keys for core profile fields (client-only).
 * Legacy keys remain readable for one release.
 * Sensitive scalar fields use secureStorage (obfuscated).
 */

import {
  getPrimaryGoal,
  syncLegacyUserGoalToUserGoals,
} from "@/lib/goalSystem";
import { secureStorage } from "@/lib/secureStorage";

/** Same as KAI_HABIT_PROFILE_KEY in kaiPoints — avoid importing kaiPoints here. */
const HABIT_PROFILE_KEY = "habitProfile";

export const KAI_LS_USER_NAME = "userName";
export const KAI_LS_USER_GOAL = "userGoal";
export const KAI_LS_CHECK_IN_TIME = "checkInTime";

const LEGACY_USER_GOAL = "mainGoal";
const LEGACY_CHECK_IN_TIME = "checkinTime";

export function getStoredUserName(): string {
  if (typeof window === "undefined") return "";
  return secureStorage.get(KAI_LS_USER_NAME).trim();
}

export function setStoredUserName(value: string): void {
  secureStorage.set(KAI_LS_USER_NAME, value);
}

export function getStoredUserGoal(): string {
  if (typeof window === "undefined") return "";
  syncLegacyUserGoalToUserGoals();
  const fromStructured = getPrimaryGoal()?.title?.trim();
  if (fromStructured) return fromStructured;
  return (
    secureStorage.get(KAI_LS_USER_GOAL).trim() ||
    localStorage.getItem(LEGACY_USER_GOAL)?.trim() ||
    ""
  );
}

export function getStoredCheckInTime(): string {
  if (typeof window === "undefined") return "";
  return (
    secureStorage.get(KAI_LS_CHECK_IN_TIME).trim() ||
    localStorage.getItem(LEGACY_CHECK_IN_TIME)?.trim() ||
    ""
  );
}

export function setStoredCheckInTime(value: string): void {
  secureStorage.set(KAI_LS_CHECK_IN_TIME, value);
}

export function getStoredHabitProfile(): string {
  if (typeof window === "undefined") return "";
  return secureStorage.get(HABIT_PROFILE_KEY);
}

export function setStoredHabitProfile(json: string): void {
  secureStorage.set(HABIT_PROFILE_KEY, json);
}

export function removeStoredHabitProfile(): void {
  secureStorage.remove(HABIT_PROFILE_KEY);
}
