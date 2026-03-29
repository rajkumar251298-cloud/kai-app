"use client";

import { Header } from "@/components/Header";
import { WelcomeSplash } from "@/components/WelcomeSplash";
import { getStoredUserGoal } from "@/lib/kaiLocalProfile";
import { writeKaiMemory } from "@/lib/kaiMemory";
import {
  getTodaysFocus,
  type TodaysFocusResult,
} from "@/lib/kaiTodaysFocus";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useCallback, useEffect, useState } from "react";

const MotionLink = motion.create(Link);

const MODE_CARD =
  "kai-card kai-card-interactive kai-btn-shimmer block border border-[rgba(201,168,76,0.22)] bg-black p-4 text-left transition-[border-color,box-shadow,transform] duration-[250ms] ease hover:border-[rgba(201,168,76,0.38)]";

const MORE_MODES = [
  {
    href: "/chat?mode=stuck",
    emoji: "🧠",
    title: "I'm Stuck",
    subtitle: "Unblock fast",
  },
  {
    href: "/chat?mode=plan",
    emoji: "🗺️",
    title: "Review My Plan",
    subtitle: "Gaps and risks",
  },
  {
    key: "brainstorm",
    emoji: "💡",
    title: "Brainstorm",
    subtitle: "Generate options",
  },
] as const;

/** Device-local time: morning 5:00–11:59, afternoon 12:00–16:59, evening 17:00–20:59, night otherwise. */
function greetingForTime(d: Date): { greeting: string; subtitle: string } {
  const mins = d.getHours() * 60 + d.getMinutes();
  if (mins >= 5 * 60 && mins <= 11 * 60 + 59) {
    return {
      greeting: "Good morning",
      subtitle: "I'm watching. Make it count.",
    };
  }
  if (mins >= 12 * 60 && mins <= 16 * 60 + 59) {
    return {
      greeting: "Good afternoon",
      subtitle: "Still on the hook for what you said.",
    };
  }
  if (mins >= 17 * 60 && mins <= 20 * 60 + 59) {
    return {
      greeting: "Good evening",
      subtitle: "Don't drift — close the day honestly.",
    };
  }
  return {
    greeting: "Hey",
    subtitle: "You're still up. So am I.",
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
  const [moreOpen, setMoreOpen] = useState(false);
  const [focusKey, setFocusKey] = useState(0);

  const refreshFocus = useCallback(() => setFocusKey((k) => k + 1), []);

  const [focus, setFocus] = useState<TodaysFocusResult>(() =>
    getTodaysFocus(""),
  );

  useEffect(() => {
    queueMicrotask(() => {
      try {
        const stored = localStorage.getItem("userName")?.trim();
        const who = stored && stored.length > 0 ? stored : "there";
        const { greeting, subtitle } = greetingForTime(new Date());
        setGreetingLine(`${greeting}, ${who}.`);
        setDaySubtitle(subtitle);
      } catch {
        setGreetingLine("Good morning, there.");
        setDaySubtitle("Let's make today count.");
      }
    });
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      setFocus(getTodaysFocus(getStoredUserGoal()));
    });
  }, [focusKey]);

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

  const markYesterdayDone = () => {
    writeKaiMemory({ lastCompleted: true });
    refreshFocus();
  };

  const markYesterdayNotDone = () => {
    writeKaiMemory({ lastCompleted: false });
    router.push("/chat?mode=checkin");
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
        </motion.div>

        <motion.section
          className="kai-card kai-glow-active mt-8 p-6"
          key={`focus-${focusKey}`}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.06, ease: [0.33, 1, 0.68, 1] }}
        >
          <h2 className="kai-heading mb-4 text-lg font-semibold tracking-[0.05em]">
            Today&apos;s Focus
          </h2>

          {focus.blocked ? (
            <div className="space-y-4 text-sm leading-relaxed text-[#E8DCC8]">
              <p className="font-medium text-[#F5F0E8]">{focus.headline}</p>
              <p>{focus.body}</p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={markYesterdayDone}
                  className="kai-btn-shimmer rounded-xl border border-[rgba(201,168,76,0.4)] bg-gradient-to-br from-[#C9A84C] to-[#F5E6B3] px-4 py-2.5 text-sm font-semibold text-black/90"
                >
                  I finished it
                </button>
                <button
                  type="button"
                  onClick={markYesterdayNotDone}
                  className="rounded-xl border border-[rgba(201,168,76,0.2)] bg-black px-4 py-2.5 text-sm font-medium text-[#E8DCC8] transition-colors hover:border-[rgba(201,168,76,0.35)]"
                >
                  I didn&apos;t — tell KAI
                </button>
              </div>
            </div>
          ) : (
            <ul className="space-y-3 text-sm leading-relaxed text-[#E8DCC8]">
              {focus.tasks.map((line) => (
                <li key={line} className="flex items-start gap-2">
                  <span className="shrink-0 text-[#C9A84C]" aria-hidden>
                    •
                  </span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          )}

          <MotionLink
            href="/chat?mode=checkin"
            className="kai-btn kai-btn-shimmer kai-glow-active relative mt-6 flex w-full items-center justify-center rounded-xl border border-[rgba(201,168,76,0.38)] bg-black py-3 text-[15px] font-medium text-[#F5F0E8]"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 520, damping: 32 }}
          >
            Start Check-in
          </MotionLink>
        </motion.section>

        <motion.div
          className="mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35, delay: 0.12 }}
        >
          <button
            type="button"
            onClick={() => setMoreOpen((o) => !o)}
            className="flex w-full items-center justify-between rounded-xl border border-[rgba(201,168,76,0.15)] bg-[#111111] px-4 py-3 text-left text-sm font-medium text-[#E8DCC8] transition-[border-color,transform] duration-200 hover:border-[rgba(201,168,76,0.28)]"
            aria-expanded={moreOpen}
          >
            <span>More</span>
            <span className="text-[#C9A84C]" aria-hidden>
              {moreOpen ? "−" : "+"}
            </span>
          </button>

          {moreOpen && (
            <div className="mt-3 grid grid-cols-2 gap-3">
              {MORE_MODES.map((m) =>
                "href" in m ? (
                  <MotionLink
                    key={m.title}
                    href={m.href}
                    className={MODE_CARD}
                    whileHover={{ y: -4 }}
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
                    whileHover={{ y: -4 }}
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
            </div>
          )}

          <nav
            className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs font-medium md:hidden"
            aria-label="More actions"
          >
            <Link
              href="/dashboard"
              className="text-white/50 transition-colors duration-200 hover:text-[#C9A84C]/80"
            >
              Dashboard
            </Link>
            <Link
              href="/board"
              className="text-white/50 transition-colors duration-200 hover:text-[#C9A84C]/80"
            >
              Team Board
            </Link>
            <Link
              href="/profile"
              className="text-white/50 transition-colors duration-200 hover:text-[#C9A84C]/80"
            >
              Profile
            </Link>
          </nav>
        </motion.div>
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
