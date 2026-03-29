/**
 * Canonical localStorage keys for core profile fields (client-only).
 * Legacy keys remain readable for one release.
 */

import {
  getPrimaryGoal,
  syncLegacyUserGoalToUserGoals,
} from "@/lib/goalSystem";

export const KAI_LS_USER_NAME = "userName";
export const KAI_LS_USER_GOAL = "userGoal";
export const KAI_LS_CHECK_IN_TIME = "checkInTime";

const LEGACY_USER_GOAL = "mainGoal";
const LEGACY_CHECK_IN_TIME = "checkinTime";

export function getStoredUserGoal(): string {
  if (typeof window === "undefined") return "";
  syncLegacyUserGoalToUserGoals();
  const fromStructured = getPrimaryGoal()?.title?.trim();
  if (fromStructured) return fromStructured;
  return (
    localStorage.getItem(KAI_LS_USER_GOAL)?.trim() ||
    localStorage.getItem(LEGACY_USER_GOAL)?.trim() ||
    ""
  );
}

export function getStoredCheckInTime(): string {
  if (typeof window === "undefined") return "";
  return (
    localStorage.getItem(KAI_LS_CHECK_IN_TIME)?.trim() ||
    localStorage.getItem(LEGACY_CHECK_IN_TIME)?.trim() ||
    ""
  );
}
