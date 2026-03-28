import { Header } from "@/components/Header";
import Link from "next/link";

const CARD =
  "rounded-[14px] border border-white/[0.07] bg-[#12121C] p-4 sm:p-5";

/** Mon–Sun; true = completed that day */
const WEEK_DONE = [true, true, true, false, true, true, false] as const;

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

const GOALS: { label: string; pct: number }[] = [
  { label: "Launch KAI app in 90 days", pct: 72 },
  { label: "Get first 10 paying users", pct: 40 },
  { label: "Do daily check-ins without missing", pct: 88 },
];

function barColor(pct: number) {
  if (pct >= 70) return "bg-emerald-500";
  if (pct >= 40) return "bg-amber-500";
  return "bg-red-500";
}

const SESSIONS = [
  { icon: "☀️", label: "Daily Check-ins", count: 5 },
  { icon: "🧠", label: "Stuck sessions", count: 2 },
  { icon: "🗺️", label: "Plan reviews", count: 1 },
  { icon: "💡", label: "Brainstorms", count: 3 },
] as const;

export default function DashboardPage() {
  const doneCount = WEEK_DONE.filter(Boolean).length;

  return (
    <div
      className="flex min-h-screen flex-col bg-[#0D0D1A]"
      style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}
    >
      <Header />
      <main className="mx-auto w-full max-w-lg flex-1 space-y-6 px-4 pb-10 pt-4">
        <div className="flex items-center justify-between gap-3">
          <h1
            className="text-xl font-bold text-white"
            style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}
          >
            Dashboard
          </h1>
          <Link
            href="/"
            className="text-sm font-medium text-[#7C3AED] hover:underline"
          >
            Home
          </Link>
        </div>

        {/* Card 1 — Weekly Streak */}
        <section className={CARD}>
          <h2
            className="mb-4 text-sm font-semibold text-white/90"
            style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}
          >
            Weekly streak
          </h2>
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {DAYS.map((day, i) => {
              const done = WEEK_DONE[i];
              return (
                <div key={day} className="flex flex-col items-center gap-1.5">
                  <span className="text-[10px] font-medium uppercase tracking-wide text-white/45 sm:text-[11px]">
                    {day}
                  </span>
                  <div
                    className={
                      done
                        ? "flex aspect-square w-full min-h-[36px] max-h-[52px] items-center justify-center rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#EC4899] text-sm font-bold text-white shadow-sm sm:max-h-none"
                        : "flex aspect-square w-full min-h-[36px] max-h-[52px] items-center justify-center rounded-lg border border-white/[0.08] bg-[#0D0D1A] sm:max-h-none"
                    }
                    aria-label={done ? `${day} completed` : `${day} missed`}
                  >
                    {done ? "✓" : null}
                  </div>
                </div>
              );
            })}
          </div>
          <p
            className="mt-5 text-center text-3xl font-bold tracking-tight text-white sm:text-4xl"
            style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}
          >
            {doneCount} / 7 days
          </p>
        </section>

        {/* Card 2 — Goal Progress */}
        <section className={CARD}>
          <h2
            className="mb-4 text-sm font-semibold text-white/90"
            style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}
          >
            Goal progress
          </h2>
          <ul className="space-y-5">
            {GOALS.map((g) => (
              <li key={g.label}>
                <div className="mb-1.5 flex items-start justify-between gap-3">
                  <span className="text-[14px] leading-snug text-white/90">
                    {g.label}
                  </span>
                  <span
                    className="shrink-0 text-sm font-semibold tabular-nums text-white/80"
                    style={{
                      fontFamily: "var(--font-space-grotesk), sans-serif",
                    }}
                  >
                    {g.pct}%
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/[0.08]">
                  <div
                    className={`h-full rounded-full transition-all ${barColor(g.pct)}`}
                    style={{ width: `${g.pct}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Card 3 — Sessions This Week */}
        <section className={CARD}>
          <h2
            className="mb-4 text-sm font-semibold text-white/90"
            style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}
          >
            Sessions this week
          </h2>
          <ul className="space-y-3">
            {SESSIONS.map((row) => (
              <li
                key={row.label}
                className="flex items-center justify-between gap-3 border-b border-white/[0.05] pb-3 last:border-0 last:pb-0"
              >
                <span className="flex items-center gap-2.5 text-[15px] text-white/90">
                  <span className="text-lg" aria-hidden>
                    {row.icon}
                  </span>
                  {row.label}
                </span>
                <span
                  className="text-lg font-bold tabular-nums text-[#7C3AED]"
                  style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}
                >
                  {row.count}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
