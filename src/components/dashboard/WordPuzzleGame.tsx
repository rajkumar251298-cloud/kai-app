"use client";

import {
  addPoints,
  markWordSolvedToday,
  todayKey,
  wasWordSolvedToday,
} from "@/lib/kaiPoints";
import { useCallback, useMemo, useState } from "react";

const WORDS = [
  "GROWTH",
  "HABITS",
  "TARGET",
  "HUSTLE",
  "REWARD",
  "COMMIT",
  "DRIVEN",
  "STRIVE",
] as const;

function seedFromDate(d: string): number {
  let h = 0;
  for (let i = 0; i < d.length; i++) h = (h << 5) - h + d.charCodeAt(i);
  return Math.abs(h);
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type Props = { onPoints?: () => void };

export function WordPuzzleGame({ onPoints }: Props) {
  const word = useMemo(() => {
    const d = todayKey();
    return WORDS[seedFromDate(d) % WORDS.length];
  }, []);

  const [shuffled] = useState(() => shuffle(word.split("")));
  const [progress, setProgress] = useState<string[]>([]);
  const [shake, setShake] = useState(false);
  const [won, setWon] = useState(false);
  const [alreadyDone] = useState(() => wasWordSolvedToday());

  const triggerShake = useCallback(() => {
    setShake(true);
    window.setTimeout(() => setShake(false), 500);
  }, []);

  const onLetterTap = (letter: string, index: number) => {
    if (won || alreadyDone) return;
    const nextLen = progress.length;
    if (nextLen >= word.length) return;
    const expected = word[nextLen];
    if (letter !== expected) {
      triggerShake();
      setProgress([]);
      return;
    }
    const next = [...progress, `${index}:${letter}`];
    const chars = next.map((s) => s.split(":")[1]!);
    setProgress(next);
    if (chars.join("") === word) {
      setWon(true);
      if (!wasWordSolvedToday()) {
        markWordSolvedToday();
        addPoints(10);
        onPoints?.();
      }
    }
  };

  const used = new Set(progress.map((p) => parseInt(p.split(":")[0]!, 10)));

  return (
    <div className="kai-card mt-4 p-4">
      <p className="text-xs font-medium uppercase tracking-[0.15em] text-[#C9A84C]/80">
        Daily Word Puzzle
      </p>
      <p className="mt-1 text-sm text-[#E8DCC8]/85">
        Tap letters in order to spell the 6-letter word.
      </p>
      <div className="mt-4 flex min-h-[44px] flex-wrap items-center justify-center gap-2">
        {word.split("").map((_, i) => (
          <span
            key={i}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-[rgba(201,168,76,0.25)] bg-black text-lg font-semibold text-[#F5F0E8]"
          >
            {progress[i] ? progress[i]!.split(":")[1] : "·"}
          </span>
        ))}
      </div>
      <div
        className={`mt-4 flex flex-wrap justify-center gap-2 ${shake ? "kai-letter-shake" : ""}`}
      >
        {shuffled.map((letter, index) => {
          const disabled = used.has(index) || won || alreadyDone;
          return (
            <button
              key={`${letter}-${index}`}
              type="button"
              disabled={disabled}
              onClick={() => onLetterTap(letter, index)}
              className="kai-btn-shimmer h-11 w-11 rounded-xl border border-[rgba(201,168,76,0.4)] bg-black text-base font-bold text-[#C9A84C] transition hover:border-[rgba(201,168,76,0.6)] hover:text-[#F5E6B3] disabled:opacity-25"
            >
              {letter}
            </button>
          );
        })}
      </div>
      {won && (
        <div className="kai-msg-animate mt-4 rounded-xl border border-[rgba(201,168,76,0.35)] bg-[rgba(201,168,76,0.08)] p-3 text-center shadow-[0_0_24px_rgba(201,168,76,0.2)]">
          <p className="text-2xl" aria-hidden>
            ✓
          </p>
          <p className="mt-1 text-sm font-semibold text-[#C9A84C]">
            +10 streak points
          </p>
        </div>
      )}
      {alreadyDone && !won && (
        <p className="mt-4 text-center text-sm text-[#E8DCC8]/65">
          You already solved today&apos;s word. Come back tomorrow.
        </p>
      )}
    </div>
  );
}
