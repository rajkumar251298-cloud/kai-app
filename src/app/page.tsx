"use client";

import AuthCard from "@/components/AuthCard";
import { Header } from "@/components/Header";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

const MotionLink = motion.create(Link);

const FOCUS_ITEMS = [
  "Reach out to 2 potential users",
  "Finalize onboarding UI",
] as const;

const TEAMMATES_BLOCKED = 2;

export default function Home() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState<string | null>(null);
  const [brainstormOpen, setBrainstormOpen] = useState(false);
  const [brainstormTopic, setBrainstormTopic] = useState("");
  const [step, setStep] = useState(1);

  useEffect(() => {
    queueMicrotask(() => {
      setMounted(true);
      try {
        const stored = localStorage.getItem("userName");
        setName(stored?.trim() || null);
      } catch {
        setName(null);
      }
    });
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
      className="flex min-h-screen flex-col bg-black"
      style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}
    >
      <Header />

      <main className="mx-auto w-full max-w-lg flex-1 px-6 pb-10 pt-8">
        {TEAMMATES_BLOCKED > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.33, 1, 0.68, 1] }}
          >
            <Link
              href="/board"
              className="kai-card kai-card-interactive mb-8 flex items-start gap-3 p-4 transition-colors hover:border-[rgba(201,168,76,0.22)]"
            >
              <span className="text-xl opacity-90" aria-hidden>
                🚨
              </span>
              <div>
                <p className="text-sm font-semibold text-[#F5F0E8]">
                  {TEAMMATES_BLOCKED} teammates blocked right now
                </p>
                <p className="mt-0.5 text-xs text-[#E8DCC8]/65">
                  Open team board →
                </p>
              </div>
            </Link>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.33, 1, 0.68, 1] }}
        >
          <h1
            className="kai-heading text-2xl font-semibold leading-tight tracking-[0.05em] sm:text-3xl"
            suppressHydrationWarning
          >
            Good morning, {displayName}.
          </h1>
          <p className="mt-2 text-sm text-[#E8DCC8]">
            Let&apos;s make today count.
          </p>
        </motion.div>

        {step === 1 && (
          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="kai-btn-shimmer rounded-xl border border-[rgba(201,168,76,0.38)] bg-black px-8 py-3 text-sm font-medium text-[#F5F0E8]"
            >
              Continue
            </button>
          </div>
        )}

        {step === 3 && <AuthCard />}

        {step >= 2 && (
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

            {step === 2 && (
              <div className="mt-6 flex justify-center">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="kai-btn-shimmer rounded-xl border border-[rgba(201,168,76,0.38)] bg-black px-8 py-3 text-sm font-medium text-[#F5F0E8]"
                >
                  Continue
                </button>
              </div>
            )}

            {step >= 3 && (
              <MotionLink
                href="/chat?mode=checkin"
                className="kai-btn kai-btn-shimmer relative mt-6 flex w-full items-center justify-center rounded-xl border border-[rgba(201,168,76,0.38)] bg-black py-3 text-[15px] font-medium text-[#F5F0E8]"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 520, damping: 32 }}
              >
                Start Check-in
              </MotionLink>
            )}
          </motion.section>
        )}

        {step >= 3 && (
          <>
            <motion.div
              className="mt-10 grid grid-cols-2 gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.28, ease: [0.33, 1, 0.68, 1] }}
            >
              <MotionLink
                href="/chat?mode=stuck"
                className="kai-card kai-card-interactive block p-4 text-left"
                whileHover={{ y: -3 }}
                transition={{ type: "spring", stiffness: 400, damping: 28 }}
              >
                <h3 className="text-sm font-medium text-[#F5F0E8]">
                  I&apos;m Stuck
                </h3>
                <p className="mt-1 text-xs text-[#E8DCC8]/80">Unblock fast</p>
              </MotionLink>

              <motion.button
                type="button"
                onClick={openBrainstorm}
                className="kai-card kai-card-interactive w-full p-4 text-left"
                whileHover={{ y: -3 }}
                transition={{ type: "spring", stiffness: 400, damping: 28 }}
              >
                <h3 className="text-sm font-medium text-[#F5F0E8]">
                  Brainstorm
                </h3>
                <p className="mt-1 text-xs text-[#E8DCC8]/80">Generate ideas</p>
              </motion.button>
            </motion.div>

            <motion.nav
              className="mt-10 flex flex-wrap justify-center gap-x-8 gap-y-2 text-xs text-[#E8DCC8]/55"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.35, delay: 0.4 }}
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
          </>
        )}
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
