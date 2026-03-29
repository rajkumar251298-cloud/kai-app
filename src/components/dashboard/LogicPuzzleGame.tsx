"use client";

import { LOGIC_PATTERN_SETS } from "@/data/logicPatternSets";
import { dayOfYearLocal } from "@/lib/dayOfYear";
import {
  addPoints,
  markLogicPlayedToday,
  wasLogicPlayedToday,
} from "@/lib/kaiPoints";
import { useEffect, useRef, useState } from "react";

type Props = { onPoints?: () => void };

export function LogicPuzzleGame({ onPoints }: Props) {
  const patternIndex = dayOfYearLocal() % LOGIC_PATTERN_SETS.length;
  const ROUNDS = LOGIC_PATTERN_SETS[patternIndex]!;

  const [round, setRound] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);
  const [playedToday] = useState(() => wasLogicPlayedToday());
  const awardedRef = useRef(false);

  const current = ROUNDS[round]!;
  const isLast = round >= ROUNDS.length - 1;

  const selectOption = (opt: string) => {
    if (finished || playedToday || picked !== null) return;
    setPicked(opt);
  };

  const advance = () => {
    if (picked === null) return;
    const isCorrect = picked === current.answer;
    const nextCorrect = correctCount + (isCorrect ? 1 : 0);
    if (!isLast) {
      setRound((r) => r + 1);
      setCorrectCount(nextCorrect);
      setPicked(null);
      return;
    }
    setCorrectCount(nextCorrect);
    setFinished(true);
  };

  useEffect(() => {
    if (!finished || playedToday || awardedRef.current) return;
    awardedRef.current = true;
    markLogicPlayedToday();
    let pts = 0;
    if (correctCount === 5) pts = 25;
    else if (correctCount >= 3) pts = 15;
    if (pts > 0) {
      addPoints(pts);
      onPoints?.();
    }
  }, [finished, correctCount, playedToday, onPoints]);

  const displayFinal = finished ? correctCount : null;

  return (
    <div className="kai-card mt-4 p-4">
      <p className="text-xs font-medium uppercase tracking-[0.15em] text-[#C9A84C]/80">
        Logic pattern — round {Math.min(round + 1, 5)} / 5
      </p>
      <p className="mt-1 text-xs text-[#E8DCC8]/55">
        Puzzle {patternIndex + 1} of {LOGIC_PATTERN_SETS.length} · Rotates daily
      </p>
      {!finished && (
        <>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-3xl">
            {current.sequence.map((e, i) => (
              <span key={`${round}-seq-${i}`}>{e}</span>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {current.options.map((opt, oi) => (
              <button
                key={`${round}-${oi}-${opt}`}
                type="button"
                disabled={picked !== null || playedToday}
                onClick={() => selectOption(opt)}
                className={`kai-btn-shimmer rounded-xl border py-3 text-2xl transition ${
                  picked === opt
                    ? "border-[rgba(201,168,76,0.6)] bg-[rgba(201,168,76,0.12)] shadow-[0_0_20px_rgba(201,168,76,0.2)]"
                    : "border-[rgba(201,168,76,0.3)] bg-black"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
          {picked !== null && (
            <button
              type="button"
              onClick={advance}
              className="kai-btn-shimmer mt-4 w-full rounded-xl border border-[rgba(201,168,76,0.45)] bg-black py-2.5 text-sm font-medium text-[#C9A84C]"
            >
              {isLast ? "See results" : "Next round"}
            </button>
          )}
        </>
      )}
      {finished && (
        <div className="kai-msg-animate mt-4 space-y-3 rounded-xl border border-[rgba(201,168,76,0.3)] bg-black/60 p-4 text-center">
          <p className="text-lg font-semibold text-[#C9A84C]">
            {displayFinal}/5 correct
          </p>
          <p className="text-sm leading-relaxed text-[#E8DCC8]">
            {displayFinal === 5
              ? "Perfect. That's the sharp mind of someone who will hit their goals."
              : displayFinal !== null && displayFinal >= 3
                ? "Solid. Keep that pattern thinking sharp."
                : "Off day — come back tomorrow. KAI believes in you."}
          </p>
          {(displayFinal === 5 || (displayFinal ?? 0) >= 3) && (
            <p className="text-sm text-[#C9A84C]">
              +{displayFinal === 5 ? 25 : 15} streak points
            </p>
          )}
        </div>
      )}
      {playedToday && !finished && (
        <p className="mt-4 text-center text-sm text-[#E8DCC8]/65">
          You already finished today&apos;s logic puzzle.
        </p>
      )}
    </div>
  );
}
