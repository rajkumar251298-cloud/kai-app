import { Header } from "@/components/Header";
import { KaiProgressBar } from "@/components/KaiProgressBar";
import Link from "next/link";

const CARD = "kai-card kai-card-interactive p-4 sm:p-5";

const WEEK_DONE = [true, true, true, false, true, true, false] as const;

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

const GOALS: { label: string; pct: number }[] = [
  { label: "Launch KAI app in 90 days", pct: 72 },
  { label: "Get first 10 paying users", pct: 40 },
  { label: "Do daily check-ins without missing", pct: 88 },
];

function barGradient(pct: number) {
  if (pct >= 70) {
    return "bg-gradient-to-r from-[#5c4a22] via-[#C9A84C] to-[#F5E6B3]";
  }
  if (pct >= 40) {
    return "bg-gradient-to-r from-[#4a3d18] to-[#C9A84C]/75";
  }
  return "bg-gradient-to-r from-[#2a2418] to-[#6b5a2e]";
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
    <div className="flex min-h-screen flex-col bg-black">
      <Header />
      <main className="mx-auto w-full max-w-lg flex-1 space-y-6 px-4 pb-10 pt-6">
        <div className="flex items-center justify-between gap-3">
          <h1 className="kai-heading text-xl font-semibold tracking-[0.05em]">
            Dashboard
          </h1>
          <Link
            href="/"
            className="text-sm font-medium text-[#C9A84C]/90 transition hover:text-[#F5E6B3]"
          >
            Home
          </Link>
        </div>

        <section className={CARD}>
          <h2 className="kai-heading mb-4 text-sm font-semibold tracking-[0.05em]">
            Weekly streak
          </h2>
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {DAYS.map((day, i) => {
              const done = WEEK_DONE[i];
              return (
                <div key={day} className="flex flex-col items-center gap-1.5">
                  <span className="text-[10px] font-medium uppercase tracking-wide text-[#E8DCC8]/50 sm:text-[11px]">
                    {day}
                  </span>
                  <div
                    className={
                      done
                        ? "flex aspect-square w-full min-h-[36px] max-h-[52px] items-center justify-center rounded-xl bg-gradient-to-br from-[#C9A84C] to-[#F5E6B3] text-sm font-bold text-black/85 shadow-[0_0_18px_rgba(201,168,76,0.22)] sm:max-h-none"
                        : "flex aspect-square w-full min-h-[36px] max-h-[52px] items-center justify-center rounded-xl border border-[rgba(201,168,76,0.1)] bg-black sm:max-h-none"
                    }
                    aria-label={done ? `${day} completed` : `${day} missed`}
                  >
                    {done ? "✓" : null}
                  </div>
                </div>
              );
            })}
          </div>
          <p className="kai-heading mt-5 text-center text-3xl font-semibold tracking-[0.05em] sm:text-4xl">
            {doneCount} / 7 days
          </p>
        </section>

        <section className={CARD}>
          <h2 className="kai-heading mb-4 text-sm font-semibold tracking-[0.05em]">
            Goal progress
          </h2>
          <ul className="space-y-5">
            {GOALS.map((g) => (
              <li key={g.label}>
                <div className="mb-1.5 flex items-start justify-between gap-3">
                  <span className="text-[14px] leading-snug text-[#E8DCC8]">
                    {g.label}
                  </span>
                  <span className="shrink-0 text-sm font-semibold tabular-nums text-[#C9A84C]">
                    {g.pct}%
                  </span>
                </div>
                <KaiProgressBar pct={g.pct} barClassName={barGradient(g.pct)} />
              </li>
            ))}
          </ul>
        </section>

        <section className={CARD}>
          <h2 className="kai-heading mb-4 text-sm font-semibold tracking-[0.05em]">
            Sessions this week
          </h2>
          <ul className="space-y-3">
            {SESSIONS.map((row) => (
              <li
                key={row.label}
                className="flex items-center justify-between gap-3 border-b border-[rgba(201,168,76,0.08)] pb-3 last:border-0 last:pb-0"
              >
                <span className="flex items-center gap-2.5 text-[15px] text-[#E8DCC8]">
                  <span className="text-lg opacity-[0.72]" aria-hidden>
                    {row.icon}
                  </span>
                  {row.label}
                </span>
                <span className="text-lg font-bold tabular-nums text-[#C9A84C]">
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
