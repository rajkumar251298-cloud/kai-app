/** Local calendar: 0 = Jan 1, up to 364/365. */
export function dayOfYearLocal(): number {
  const d = new Date();
  const y = d.getFullYear();
  const jan1 = new Date(y, 0, 1);
  return Math.floor((d.getTime() - jan1.getTime()) / 86_400_000);
}

/** 1-based day index for display (Jan 1 → 1). */
export function dayOfYearDisplay(): number {
  return dayOfYearLocal() + 1;
}
