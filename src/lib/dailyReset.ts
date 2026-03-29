import { todayKey } from "@/lib/kaiPoints";

export const LAST_VISIT_DATE_KEY = "lastVisitDate";

/**
 * Run on app load / visibility. If calendar date changed since last visit,
 * dispatches `kai-new-day` for UI (toast, game tab refresh).
 * Does not remove date-scoped game keys (those rotate by key automatically).
 */
export function runDailyReset(): boolean {
  if (typeof window === "undefined") return false;
  const t = todayKey();
  const last = localStorage.getItem(LAST_VISIT_DATE_KEY);
  localStorage.setItem(LAST_VISIT_DATE_KEY, t);
  if (last && last !== t) {
    queueMicrotask(() => {
      window.dispatchEvent(
        new CustomEvent("kai-new-day", {
          detail: { previous: last, today: t },
        }),
      );
    });
    return true;
  }
  return false;
}
