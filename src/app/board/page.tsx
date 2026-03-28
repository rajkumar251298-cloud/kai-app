import { Header } from "@/components/Header";
import Link from "next/link";

type CheckInStatus = "checked_in" | "pending";

type TeamMember = {
  id: string;
  name: string;
  firstName: string;
  initials: string;
  role: string;
  avatarClass: string;
  status: CheckInStatus;
  streak: number;
  stuckDays: number | null;
  lastUpdate: string;
};

const TEAM: TeamMember[] = [
  {
    id: "1",
    name: "Alex R",
    firstName: "Alex",
    initials: "AR",
    role: "Engineer",
    avatarClass: "bg-gradient-to-br from-violet-500 to-purple-600",
    status: "checked_in",
    streak: 6,
    stuckDays: null,
    lastUpdate: "Working on auth flow nearly done",
  },
  {
    id: "2",
    name: "Sam K",
    firstName: "Sam",
    initials: "SK",
    role: "Designer",
    avatarClass: "bg-gradient-to-br from-fuchsia-500 to-pink-600",
    status: "pending",
    streak: 3,
    stuckDays: 2,
    lastUpdate:
      "Can't decide onboarding UI — 3 options no winner",
  },
  {
    id: "3",
    name: "Jordan M",
    firstName: "Jordan",
    initials: "JM",
    role: "Engineer",
    avatarClass: "bg-gradient-to-br from-blue-500 to-indigo-600",
    status: "checked_in",
    streak: 7,
    stuckDays: null,
    lastUpdate: "Deployed staging env writing tests",
  },
  {
    id: "4",
    name: "Morgan L",
    firstName: "Morgan",
    initials: "ML",
    role: "Marketing",
    avatarClass: "bg-gradient-to-br from-emerald-500 to-teal-600",
    status: "checked_in",
    streak: 2,
    stuckDays: 1,
    lastUpdate:
      "Launch copy unclear not sure what angle to lead with",
  },
];

const CARD =
  "rounded-[14px] border border-white/[0.07] bg-[#12121C] p-4";

function Avatar({
  initials,
  className,
}: {
  initials: string;
  className: string;
}) {
  return (
    <div
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white ${className}`}
      aria-hidden
    >
      {initials}
    </div>
  );
}

export default function BoardPage() {
  const blocked = TEAM.filter((m) => m.stuckDays != null && m.stuckDays > 0);

  return (
    <div
      className="flex min-h-screen flex-col bg-[#0D0D1A]"
      style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}
    >
      <Header />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 pb-10 pt-4">
        <div className="mb-2 flex items-center justify-between gap-3">
          <h1
            className="text-xl font-bold text-white"
            style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}
          >
            Team board
          </h1>
          <Link
            href="/"
            className="shrink-0 text-sm font-medium text-[#7C3AED] hover:underline"
          >
            Home
          </Link>
        </div>

        {/* —— BLOCKED —— */}
        <section className="mb-10">
          <h2 className="mb-3 text-sm font-bold tracking-wide text-red-400">
            🚨 Blocked
          </h2>

          {blocked.length === 0 ? (
            <p className="rounded-[14px] border border-white/[0.07] bg-[#12121C] px-4 py-6 text-center text-sm text-white/50">
              Nobody is blocked right now.
            </p>
          ) : (
            <div className="space-y-4">
              {blocked.map((m) => (
                <article
                  key={m.id}
                  className="rounded-[14px] border border-red-500/45 bg-red-950/25 p-4"
                >
                  <div className="flex gap-3">
                    <Avatar initials={m.initials} className={m.avatarClass} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-white">{m.name}</p>
                        <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-red-300">
                          Stuck {m.stuckDays} days
                        </span>
                      </div>
                      <p className="text-sm text-white/55">{m.role}</p>
                    </div>
                  </div>

                  <div className="mt-3 border-l-2 border-red-400/70 bg-black/20 py-2 pl-3 text-[14px] leading-relaxed text-white/85">
                    {m.lastUpdate}
                  </div>

                  <Link
                    href="/chat?mode=stuck"
                    className="mt-4 flex w-full items-center justify-center rounded-xl bg-[#7C3AED] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#6d28d9]"
                  >
                    Help {m.firstName} get unstuck
                  </Link>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* —— ALL TEAM —— */}
        <section>
          <h2
            className="mb-3 text-sm font-bold tracking-wide text-white/90"
            style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}
          >
            All Team
          </h2>
          <ul className="space-y-3">
            {TEAM.map((m) => (
              <li key={m.id} className={CARD}>
                <div className="flex gap-3">
                  <Avatar initials={m.initials} className={m.avatarClass} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-white">{m.name}</p>
                        <p className="text-xs text-white/45">{m.role}</p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        {m.stuckDays != null && m.stuckDays > 0 && (
                          <span className="rounded bg-red-500/25 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-red-300">
                            STUCK
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="mt-2 text-[13px] leading-snug text-white/50">
                      {m.lastUpdate}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {m.status === "checked_in" ? (
                        <span className="text-[13px] font-medium text-emerald-400">
                          ✅ Checked in
                        </span>
                      ) : (
                        <span className="text-[13px] font-medium text-amber-400">
                          ⏳ Pending
                        </span>
                      )}
                      <span className="text-[13px] text-white/40">
                        · {m.streak} day streak
                      </span>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
