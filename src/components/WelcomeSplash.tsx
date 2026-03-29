"use client";

import { motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";

type ExitPhase = "enter" | "fade" | "slide";

function splashCopy(d: Date): {
  greeting: string;
  nameFallback: string;
  motivational: string;
} {
  const mins = d.getHours() * 60 + d.getMinutes();
  if (mins >= 5 * 60 && mins <= 11 * 60 + 59) {
    return {
      greeting: "Good morning",
      nameFallback: "Welcome back",
      motivational: "Your goals are waiting.",
    };
  }
  if (mins >= 12 * 60 && mins <= 16 * 60 + 59) {
    return {
      greeting: "Good afternoon",
      nameFallback: "Welcome back",
      motivational: "Stay locked in.",
    };
  }
  if (mins >= 17 * 60 && mins <= 20 * 60 + 59) {
    return {
      greeting: "Good evening",
      nameFallback: "Welcome back",
      motivational: "Finish strong today.",
    };
  }
  return {
    greeting: "Good night",
    nameFallback: "Welcome back",
    motivational: "Rest well. Tomorrow we go again.",
  };
}

type Props = { onComplete: () => void };

export function WelcomeSplash({ onComplete }: Props) {
  const [exitPhase, setExitPhase] = useState<ExitPhase>("enter");
  const [lines, setLines] = useState<{
    greeting: string;
    nameLine: string;
    motivational: string;
  } | null>(null);

  const finish = useCallback(() => {
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    queueMicrotask(() => {
      const d = new Date();
      const raw = localStorage.getItem("userName")?.trim();
      const c = splashCopy(d);
      setLines({
        greeting: c.greeting,
        nameLine: raw && raw.length > 0 ? raw : c.nameFallback,
        motivational: c.motivational,
      });
    });
  }, []);

  useEffect(() => {
    if (!lines) return;
    const fade = window.setTimeout(() => setExitPhase("fade"), 2000);
    const slide = window.setTimeout(() => setExitPhase("slide"), 2300);
    const done = window.setTimeout(() => finish(), 2500);
    return () => {
      window.clearTimeout(fade);
      window.clearTimeout(slide);
      window.clearTimeout(done);
    };
  }, [lines, finish]);

  if (!lines) {
    return (
      <div
        className="fixed inset-0 z-[200] bg-[#000000]"
        aria-hidden
      />
    );
  }

  return (
    <motion.div
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#000000] px-6"
      initial={{ y: 0 }}
      animate={{ y: exitPhase === "slide" ? "-100%" : 0 }}
      transition={{
        duration: exitPhase === "slide" ? 0.2 : 0,
        ease: [0.32, 0.72, 0, 1],
      }}
    >
      <motion.div
        className="flex max-w-sm flex-col items-center text-center"
        animate={{
          opacity: exitPhase === "fade" || exitPhase === "slide" ? 0 : 1,
        }}
        transition={{ duration: 0.3 }}
      >
        <motion.span
          className="text-2xl text-[#C9A84C]"
          aria-hidden
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.45, ease: [0.33, 1, 0.68, 1] }}
        >
          ⚡
        </motion.span>

        <motion.p
          className="kai-heading mt-8 text-2xl font-semibold tracking-[0.06em] text-[#F5F0E8] sm:text-3xl"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.45, ease: [0.33, 1, 0.68, 1] }}
        >
          {lines.greeting}
        </motion.p>

        <motion.p
          className="kai-heading mt-3 text-3xl font-bold tracking-[0.04em] text-[#C9A84C] sm:text-4xl"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.45, ease: [0.33, 1, 0.68, 1] }}
        >
          {lines.nameLine}
        </motion.p>

        <motion.p
          className="mt-6 text-sm font-medium leading-relaxed text-[#E8DCC8]/75 sm:text-[15px]"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.45, ease: [0.33, 1, 0.68, 1] }}
        >
          {lines.motivational}
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
