"use client";

import { Header } from "@/components/Header";
import { WelcomeSplash } from "@/components/WelcomeSplash";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { KAI_HABIT_PROFILE_KEY } from "@/lib/kaiPoints";
import { FormEvent, useCallback, useEffect, useState } from "react";

const MotionLink = motion.create(Link);

const FOCUS_ITEMS = [
  "Reach out to 2 potential users",
  "Finalize onboarding UI",
] as const;

const MODE_CARD =
  "kai-card kai-card-interactive kai-btn-shimmer block border border-[rgba(201,168,76,0.22)] bg-black p-4 text-left transition-[border-color,box-shadow] duration-[250ms] ease hover:border-[rgba(201,168,76,0.38)]";

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

/** Device-local time: morning 5:00–11:59, afternoon 12:00–16:59, evening 17:00–20:59, night otherwise. */
function greetingForTime(d: Date): { greeting: string; subtitle: string } {
  const mins = d.getHours() * 60 + d.getMinutes();
  if (mins >= 5 * 60 && mins <= 11 * 60 + 59) {
    return {
      greeting: "Good morning",
      subtitle: "Let's make today count.",
    };
  }
  if (mins >= 12 * 60 && mins <= 16 * 60 + 59) {
    return {
      greeting: "Good afternoon",
      subtitle: "How's the day going so far?",
    };
  }
  if (mins >= 17 * 60 && mins <= 20 * 60 + 59) {
    return {
      greeting: "Good evening",
      subtitle: "Evening check-in time.",
    };
  }
  return {
    greeting: "Hey",
    subtitle: "Still grinding? Respect.",
  };
}

export default function Home() {
  const router = useRouter();
  const [showSplash, setShowSplash] = useState(true);
  const onSplashComplete = useCallback(() => setShowSplash(false), []);
  const [greetingLine, setGreetingLine] = useState("Good morning, there.");
  const [daySubtitle, setDaySubtitle] = useState("Let's make today count.");
  const [brainstormOpen, setBrainstormOpen] = useState(false);
  const [brainstormTopic, setBrainstormTopic] = useState("");
  const [habitCoachLine, setHabitCoachLine] = useState<string | null>(null);

  useEffect(() => {
    queueMicrotask(() => {
      try {
        const stored = localStorage.getItem("userName")?.trim();
        const who = stored && stored.length > 0 ? stored : "there";
        const { greeting, subtitle } = greetingForTime(new Date());
        setGreetingLine(`${greeting}, ${who}.`);
        setDaySubtitle(subtitle);
        const raw = localStorage.getItem(KAI_HABIT_PROFILE_KEY);
        if (raw) {
          const p = JSON.parse(raw) as { title?: string };
          if (p?.title) {
            setHabitCoachLine(
              `KAI has you down as ${p.title} — coaching is tuned to your patterns.`,
            );
          }
        }
      } catch {
        setGreetingLine("Good morning, there.");
        setDaySubtitle("Let's make today count.");
      }
    });
  }, []);

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
      className="flex min-h-screen flex-col bg-black"
      style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}
    >
      {showSplash && <WelcomeSplash onComplete={onSplashComplete} />}

      <Header />

      <main className="mx-auto w-full max-w-lg flex-1 px-6 pb-10 pt-8 max-md:pb-[calc(80px+env(safe-area-inset-bottom,0px))] max-md:text-[15px]">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.33, 1, 0.68, 1] }}
        >
          <h1
            className="kai-heading text-2xl font-semibold leading-tight tracking-[0.05em] sm:text-3xl"
            suppressHydrationWarning
          >
            {greetingLine}
          </h1>
          <p className="mt-2 text-sm text-[#E8DCC8]">{daySubtitle}</p>
          {habitCoachLine && (
            <p className="mt-3 text-sm leading-snug text-[#C9A84C]/85">
              {habitCoachLine}
            </p>
          )}
        </motion.div>

        <motion.div
          className="mb-8 mt-8 grid grid-cols-2 gap-3"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.08, ease: [0.33, 1, 0.68, 1] }}
        >
          {MODES.map((m) =>
            "href" in m ? (
              <MotionLink
                key={m.title}
                href={m.href}
                className={MODE_CARD}
                whileHover={{ y: -3 }}
                transition={{ type: "spring", stiffness: 400, damping: 28 }}
              >
                <span className="text-2xl opacity-[0.72]">{m.emoji}</span>
                <p className="kai-heading mt-2 text-sm font-semibold tracking-[0.05em]">
                  {m.title}
                </p>
                <p className="mt-1 text-xs leading-snug text-[#E8DCC8]/75">
                  {m.subtitle}
                </p>
              </MotionLink>
            ) : (
              <motion.button
                key={m.key}
                type="button"
                onClick={openBrainstorm}
                className={`${MODE_CARD} w-full text-left`}
                whileHover={{ y: -3 }}
                transition={{ type: "spring", stiffness: 400, damping: 28 }}
              >
                <span className="text-2xl">{m.emoji}</span>
                <p className="kai-heading mt-2 text-sm font-semibold tracking-[0.05em]">
                  {m.title}
                </p>
                <p className="mt-1 text-xs leading-snug text-[#E8DCC8]/75">
                  {m.subtitle}
                </p>
              </motion.button>
            ),
          )}
        </motion.div>

        <motion.section
          className="kai-card mt-8 p-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.12, ease: [0.33, 1, 0.68, 1] }}
        >
          <h2 className="kai-heading mb-4 text-lg font-semibold tracking-[0.05em]">
            Today&apos;s Focus
          </h2>

          <ul className="space-y-3 text-sm leading-relaxed text-[#E8DCC8]">
            {FOCUS_ITEMS.map((line) => (
              <li key={line} className="flex items-start gap-2">
                <span className="shrink-0 text-[#C9A84C]" aria-hidden>
                  •
                </span>
                <span>{line}</span>
              </li>
            ))}
          </ul>

          <MotionLink
            href="/chat?mode=checkin"
            className="kai-btn kai-btn-shimmer relative mt-6 flex w-full items-center justify-center rounded-xl border border-[rgba(201,168,76,0.38)] bg-black py-3 text-[15px] font-medium text-[#F5F0E8]"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 520, damping: 32 }}
          >
            Start Check-in
          </MotionLink>
        </motion.section>

        <motion.nav
          className="mt-10 flex flex-wrap justify-center gap-x-8 gap-y-2 text-xs text-[#E8DCC8]/55"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35, delay: 0.28, ease: [0.33, 1, 0.68, 1] }}
          aria-label="More actions"
        >
          <Link
            href="/chat?mode=plan"
            className="transition-colors hover:text-[#C9A84C]"
          >
            Review plan
          </Link>
          <Link
            href="/dashboard"
            className="transition-colors hover:text-[#C9A84C]"
          >
            Dashboard
          </Link>
          <Link
            href="/board"
            className="transition-colors hover:text-[#C9A84C]"
          >
            Team board
          </Link>
        </motion.nav>
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
            className="absolute inset-0 bg-black/75"
            aria-label="Close dialog"
            onClick={() => setBrainstormOpen(false)}
          />
          <div className="kai-card relative z-10 w-full max-w-md p-5">
            <h3
              id="brainstorm-title"
              className="kai-heading text-lg font-semibold"
            >
              What do you want to brainstorm?
            </h3>
            <p className="mt-1 text-sm text-[#E8DCC8]/75">
              Add a short topic — we&apos;ll open the chat with that context.
            </p>
            <form onSubmit={submitBrainstorm} className="mt-4 space-y-3">
              <input
                type="text"
                value={brainstormTopic}
                onChange={(e) => setBrainstormTopic(e.target.value)}
                placeholder="e.g. Pricing strategy for KAI"
                className="w-full rounded-xl border border-[rgba(201,168,76,0.28)] bg-black px-4 py-3 text-[15px] text-[#F5F0E8] placeholder:text-[#E8DCC8]/35 focus:border-[rgba(201,168,76,0.5)] focus:outline-none focus:ring-2 focus:ring-[rgba(201,168,76,0.15)]"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setBrainstormOpen(false)}
                  className="rounded-lg px-4 py-2 text-sm text-[#E8DCC8]/70 hover:text-[#F5F0E8]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!brainstormTopic.trim()}
                  className="kai-btn-shimmer rounded-lg border border-[rgba(201,168,76,0.4)] bg-gradient-to-br from-[#C9A84C] to-[#F5E6B3] px-4 py-2 text-sm font-semibold text-black/90 hover:opacity-95 disabled:opacity-40"
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
