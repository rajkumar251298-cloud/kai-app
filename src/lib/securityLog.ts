/**
 * Server-side security event logging (requires SUPABASE_SERVICE_ROLE_KEY).
 * Inserts bypass RLS when using the service role.
 */

import { createClient } from "@supabase/supabase-js";

export async function logSecurityEvent(
  event: string,
  details: string,
  opts?: { userId?: string; userAgent?: string | null },
): Promise<void> {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
    if (!url || !key) return;

    const supabase = createClient(url, key);
    await supabase.from("security_logs").insert({
      event_type: event,
      details: details.slice(0, 200),
      user_id: opts?.userId ?? "anonymous",
      user_agent: opts?.userAgent?.slice(0, 100) ?? null,
    });
  } catch {
    /* logging must never break callers */
  }
}
