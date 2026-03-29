import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";

function looksConfigured(url: string, key: string): boolean {
  if (!url || !key) return false;
  if (!url.startsWith("https://")) return false;
  const lower = url.toLowerCase();
  if (
    lower.includes("placeholder") ||
    lower.includes("your-project") ||
    lower.includes("example.supabase")
  ) {
    return false;
  }
  if (key.length < 20) return false;
  return true;
}

/** True when real Supabase URL + anon key are set (not placeholders). */
export const isSupabaseConfigured = looksConfigured(rawUrl, rawKey);

/** Dummy host so createClient never receives empty strings; requests no-op until real env is set. */
const FALLBACK_URL = "https://invalid.supabase.co";
const FALLBACK_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiJ9.invalid";

export const supabase: SupabaseClient = createClient(
  isSupabaseConfigured ? rawUrl : FALLBACK_URL,
  isSupabaseConfigured ? rawKey : FALLBACK_KEY,
  {
    auth: {
      persistSession: isSupabaseConfigured,
      autoRefreshToken: isSupabaseConfigured,
      detectSessionInUrl: isSupabaseConfigured,
    },
  },
);
