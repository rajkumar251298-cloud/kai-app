import {
  getStoredCheckInTime,
  getStoredUserGoal,
  getStoredUserName,
} from "@/lib/kaiLocalProfile";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

let lastSyncKey = "";
let lastSyncAt = 0;
const DEDUP_MS = 2500;

/**
 * True when PostgREST/Postgres indicates `public.users` is not available
 * (not created, not in schema cache, wrong name). Used to treat that case as a no-op.
 */
function isMissingUsersTableError(err: {
  code?: string;
  message?: string;
}): boolean {
  const code = String(err.code ?? "");
  if (code === "42P01") return true;

  const msg = (err.message ?? "").toLowerCase();
  if (!msg) return false;
  if (msg.includes("schema cache") && msg.includes("users")) return true;
  if (msg.includes("could not find the table") && msg.includes("users"))
    return true;
  if (
    msg.includes("relation") &&
    msg.includes("users") &&
    msg.includes("does not exist")
  ) {
    return true;
  }
  return false;
}

/**
 * Upserts onboarding fields from localStorage into public.users.
 * On success: returns undefined. On any failure (network, RLS, missing `users` table, etc.): returns null.
 * Never throws and never logs.
 */
export async function syncUserProfileToSupabase(
  user: User,
): Promise<void | null> {
  try {
    if (typeof window === "undefined" || !isSupabaseConfigured) {
      return;
    }

    const now = Date.now();
    if (user.id === lastSyncKey && now - lastSyncAt < DEDUP_MS) {
      return;
    }

    const name = getStoredUserName();
    const goal = getStoredUserGoal();
    const time = getStoredCheckInTime();

    const { error } = await supabase.from("users").upsert(
      {
        id: user.id,
        name: name?.trim() || null,
        goal: goal?.trim() || null,
        checkin_time: time?.trim() || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    );

    if (error) {
      if (isMissingUsersTableError(error)) {
        return null;
      }
      return null;
    }

    lastSyncKey = user.id;
    lastSyncAt = now;
    return;
  } catch {
    return null;
  }
}
