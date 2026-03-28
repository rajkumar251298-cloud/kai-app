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
    avatarClass:
      "border border-[rgba(201,168,76,0.22)] bg-gradient-to-br from-[#1c1810] to-[#0d0d0d] text-[#C9A84C]",
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
    avatarClass:
      "border border-[rgba(201,168,76,0.22)] bg-gradient-to-br from-[#1c1810] to-[#0d0d0d] text-[#C9A84C]",
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
    avatarClass:
      "border border-[rgba(201,168,76,0.22)] bg-gradient-to-br from-[#1c1810] to-[#0d0d0d] text-[#C9A84C]",
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
    avatarClass:
      "border border-[rgba(201,168,76,0.22)] bg-gradient-to-br from-[#1c1810] to-[#0d0d0d] text-[#C9A84C]",
    status: "checked_in",
    streak: 2,
    stuckDays: 1,
    lastUpdate:
      "Launch copy unclear not sure what angle to lead with",
  },
];

const CARD = "kai-card kai-card-interactive p-4";

function Avatar({
  initials,
  className,
}: {
  initials: string;
  className: string;
}) {
  return (
    <div
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${className}`}
      aria-hidden
    >
      {initials}
    </div>
  );
}

export default function BoardPage() {
  const blocked = TEAM.filter((m) => m.stuckDays != null && m.stuckDays > 0);

  return (
    <div className="flex min-h-screen flex-col bg-black">
      <Header />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 pb-10 pt-6">
        <div className="mb-2 flex items-center justify-between gap-3">
          <h1 className="kai-heading text-xl font-semibold tracking-[0.05em]">
            Team board
          </h1>
          <Link
            href="/"
            className="shrink-0 text-sm font-medium text-[#C9A84C]/90 hover:text-[#F5E6B3]"
          >
            Home
          </Link>
        </div>

        <section className="mb-10">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#E8DCC8]/55">
            Blocked
          </h2>

          {blocked.length === 0 ? (
            <p className="kai-card p-6 text-center text-sm text-[#E8DCC8]/45">
              Nobody is blocked right now.
            </p>
          ) : (
            <div className="space-y-4">
              {blocked.map((m) => (
                <article
                  key={m.id}
                  className="kai-card kai-card-interactive border border-[rgba(201,168,76,0.18)] bg-[#1A1A1A] p-4 shadow-[0_0_0_1px_rgba(201,168,76,0.06)]"
                >
                  <div className="flex gap-3">
                    <Avatar initials={m.initials} className={m.avatarClass} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-[#F5F0E8]">{m.name}</p>
                        <span className="rounded-full border border-[rgba(201,168,76,0.25)] bg-black/60 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[#C9A84C]/90">
                          Stuck {m.stuckDays} days
                        </span>
                      </div>
                      <p className="text-sm text-[#E8DCC8]/55">{m.role}</p>
                    </div>
                  </div>

                  <div className="mt-3 border-l-2 border-[rgba(201,168,76,0.35)] bg-black/40 py-2 pl-3 text-[14px] leading-relaxed text-[#E8DCC8]">
                    {m.lastUpdate}
                  </div>

                  <Link
                    href="/chat?mode=stuck"
                    className="kai-btn kai-btn-shimmer kai-glow-active mt-4 flex w-full items-center justify-center rounded-xl border border-[rgba(201,168,76,0.35)] bg-black px-4 py-2.5 text-sm font-semibold text-[#F5F0E8]"
                  >
                    Help {m.firstName} get unstuck
                  </Link>
                </article>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="kai-heading mb-3 text-sm font-semibold tracking-[0.05em]">
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
                        <p className="font-semibold text-[#F5F0E8]">{m.name}</p>
                        <p className="text-xs text-[#E8DCC8]/45">{m.role}</p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        {m.stuckDays != null && m.stuckDays > 0 && (
                          <span className="rounded border border-[rgba(201,168,76,0.3)] bg-black/50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#C9A84C]/90">
                            STUCK
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="mt-2 text-[13px] leading-snug text-[#E8DCC8]/55">
                      {m.lastUpdate}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {m.status === "checked_in" ? (
                        <span className="text-[13px] font-medium text-[#C9A84C]/85">
                          ✓ Checked in
                        </span>
                      ) : (
                        <span className="text-[13px] font-medium text-[#E8DCC8]/55">
                          ◷ Pending
                        </span>
                      )}
                      <span className="text-[13px] text-[#E8DCC8]/35">
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
