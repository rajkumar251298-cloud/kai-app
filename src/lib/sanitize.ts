/**
 * Strip risky markup / script patterns from user-controlled strings (defense in depth).
 */

export function sanitizeInput(text: string): string {
  if (!text) return "";
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+\s*=/gi, "")
    .trim()
    .slice(0, 2000);
}

export function sanitizeShort(text: string, max: number): string {
  return sanitizeInput(text).slice(0, max);
}
