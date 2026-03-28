"use client";

import { Header } from "@/components/Header";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

const CARD =
  "rounded-[14px] border border-white/[0.07] bg-[#12121C] p-4 text-left transition hover:bg-white/[0.04]";

const SAMPLE_GOALS = [
  "Launch KAI app in 90 days",
  "Get first 10 paying users",
  "Do daily check-ins without missing",
] as const;

const SAMPLE_PLAN = [
  "Monday: Set up project and first screens",
  "Tuesday-Wednesday: Build chat and API",
  "Thursday: Test with 5 real people",
  "Friday: Fix bugs and improve KAI responses",
] as const;

/** Demo: set to 0 to hide the blocked-teammates alert */
const TEAMMATES_BLOCKED = 2;

const MODES = [
  {
    href: "/chat?mode=checkin",
    emoji: "☀️",
    title: "Daily Check-in",
    subtitle: "How's your day going?",
  },
  {
    href: "/chat?mode=stuck",
    emoji: "🧠",
    title: "I'm Stuck",
    subtitle: "Let's unblock you fast",
  },
  {
    href: "/chat?mode=plan",
    emoji: "🗺️",
    title: "Review My Plan",
    subtitle: "Critique your week",
  },
  {
    key: "brainstorm",
    emoji: "💡",
    title: "Brainstorm",
    subtitle: "Generate options fast",
  },
] as const;

export default function Home() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState<string | null>(null);
  const [brainstormOpen, setBrainstormOpen] = useState(false);
  const [brainstormTopic, setBrainstormTopic] = useState("");

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem("userName");
      setName(stored?.trim() || null);
    } catch {
      setName(null);
    }
  }, []);

  const displayName =
    mounted && name && name.length > 0 ? name : "there";

  const openBrainstorm = () => {
    setBrainstormTopic("");
    setBrainstormOpen(true);
  };

  const submitBrainstorm = (e: FormEvent) => {
    e.preventDefault();
    const t = brainstormTopic.trim();
    if (!t) return;
    setBrainstormOpen(false);
    router.push(`/chat?mode=ideas&topic=${encodeURIComponent(t)}`);
  };

  return (
    <div
      className="flex min-h-screen flex-col bg-[#0D0D1A]"
      style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}
    >
      <Header />

      <main className="mx-auto w-full max-w-lg flex-1 px-4 pb-10 pt-4">
        <section className="mb-6">
          <h1
            className="text-2xl font-bold leading-tight text-white sm:text-[26px]"
            style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}
            suppressHydrationWarning
          >
            Good morning, {displayName} 👋
          </h1>
          <p className="mt-1.5 text-[15px] text-[#9CA3AF]">
            Entrepreneur · 5/7 day streak 🔥
          </p>
        </section>

        {TEAMMATES_BLOCKED > 0 && (
          <Link
            href="/board"
            className={`${CARD} mb-6 flex items-start gap-3 border-red-500/60 bg-red-950/35 hover:bg-red-950/45`}
          >
            <span className="text-xl" aria-hidden>
              🚨
            </span>
            <div>
              <p className="text-sm font-semibold text-red-100">
                {TEAMMATES_BLOCKED} teammates blocked right now
              </p>
              <p className="mt-0.5 text-xs text-red-200/80">Open team board →</p>
            </div>
          </Link>
        )}

        <div className="mb-8 grid grid-cols-2 gap-3">
          {MODES.map((m) =>
            "href" in m ? (
              <Link key={m.title} href={m.href} className={`${CARD} block`}>
                <span className="text-2xl">{m.emoji}</span>
                <p
                  className="mt-2 text-sm font-semibold text-white"
                  style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}
                >
                  {m.title}
                </p>
                <p className="mt-1 text-xs leading-snug text-[#9CA3AF]">
                  {m.subtitle}
                </p>
              </Link>
            ) : (
              <button
                key={m.key}
                type="button"
                onClick={openBrainstorm}
                className={`${CARD} w-full`}
              >
                <span className="text-2xl">{m.emoji}</span>
                <p
                  className="mt-2 text-sm font-semibold text-white"
                  style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}
                >
                  {m.title}
                </p>
                <p className="mt-1 text-left text-xs leading-snug text-[#9CA3AF]">
                  {m.subtitle}
                </p>
              </button>
            ),
          )}
        </div>

        <section className={`${CARD} mb-4`}>
          <h2
            className="mb-3 text-sm font-semibold text-white"
            style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}
          >
            Active Goals
          </h2>
          <ul className="space-y-3">
            {SAMPLE_GOALS.map((g) => (
              <li key={g} className="flex gap-3">
                <span
                  className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border border-[#7C3AED] bg-[#7C3AED]/15 text-[11px] text-[#7C3AED]"
                  aria-hidden
                >
                  ✓
                </span>
                <span className="text-[15px] leading-snug text-white/90">{g}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className={`${CARD} border-l-[3px] border-l-[#7C3AED] pl-4`}>
          <h2
            className="mb-3 text-sm font-semibold text-white"
            style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}
          >
            This Week&apos;s Plan
          </h2>
          <ul className="space-y-2.5 text-[15px] leading-relaxed text-white/85">
            {SAMPLE_PLAN.map((line) => (
              <li key={line} className="flex gap-2">
                <span className="text-[#7C3AED]" aria-hidden>
                  ·
                </span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </section>
      </main>

      {brainstormOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="brainstorm-title"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/60"
            aria-label="Close dialog"
            onClick={() => setBrainstormOpen(false)}
          />
          <div className="relative z-10 w-full max-w-md rounded-[14px] border border-white/[0.07] bg-[#12121C] p-5 shadow-xl">
            <h3
              id="brainstorm-title"
              className="text-lg font-bold text-white"
              style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}
            >
              What do you want to brainstorm?
            </h3>
            <p className="mt-1 text-sm text-[#9CA3AF]">
              Add a short topic — we&apos;ll open the chat with that context.
            </p>
            <form onSubmit={submitBrainstorm} className="mt-4 space-y-3">
              <input
                type="text"
                value={brainstormTopic}
                onChange={(e) => setBrainstormTopic(e.target.value)}
                placeholder="e.g. Pricing strategy for KAI"
                className="w-full rounded-xl border border-[#7C3AED]/50 bg-[#0D0D1A] px-4 py-3 text-[15px] text-white placeholder:text-white/35 focus:border-[#7C3AED] focus:outline-none focus:ring-1 focus:ring-[#7C3AED]/40"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setBrainstormOpen(false)}
                  className="rounded-lg px-4 py-2 text-sm text-white/70 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!brainstormTopic.trim()}
                  className="rounded-lg bg-[#7C3AED] px-4 py-2 text-sm font-semibold text-white hover:bg-[#6d28d9] disabled:opacity-40"
                >
                  Open chat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
