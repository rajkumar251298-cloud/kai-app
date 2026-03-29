/** Safe in-app path from ?next= or sessionStorage (open redirect hardening). */
export function safeNextPath(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/";
  return raw;
}
