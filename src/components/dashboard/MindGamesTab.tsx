"use client";

import {
  wasLogicPlayedToday,
  wasMemoryPlayedToday,
  wasWordSolvedToday,
} from "@/lib/kaiPoints";
import { useEffect, useState } from "react";
import { LogicPuzzleGame } from "./LogicPuzzleGame";
import { MemoryGame } from "./MemoryGame";
import { WordPuzzleGame } from "./WordPuzzleGame";

type GameId = "word" | "memory" | "logic" | null;

type Props = { onPoints?: () => void; initialGame?: GameId };

export function MindGamesTab({ onPoints, initialGame = null }: Props) {
  const [active, setActive] = useState<GameId>(() => initialGame);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const bump = () => setTick((x) => x + 1);
    window.addEventListener("kai-new-day", bump);
    return () => window.removeEventListener("kai-new-day", bump);
  }, []);

  const wordDone = wasWordSolvedToday();
  const memDone = wasMemoryPlayedToday();
  const logDone = wasLogicPlayedToday();
  const completed = [wordDone, memDone, logDone].filter(Boolean).length;
  const allThree = wordDone && memDone && logDone;

  const games = [
    {
      id: "word" as const,
      icon: "🔤",
      name: "Daily Word Puzzle",
      pts: 10,
      lock: wordDone,
    },
    {
      id: "memory" as const,
      icon: "🃏",
      name: "Memory Card Flip",
      pts: 15,
      lock: memDone,
    },
    {
      id: "logic" as const,
      icon: "🧩",
      name: "Logic Pattern Puzzle",
      ptsLabel: "up to +25 pts",
      pts: 25,
      lock: logDone,
    },
  ];

  return (
    <div className="space-y-6" key={tick}>
      <div className="kai-card border border-[rgba(201,168,76,0.2)] p-4">
        <div className="flex items-center justify-between gap-2 text-sm">
          <span className="font-medium text-[#E8DCC8]">
            [{completed}/3] games completed today ⚡
          </span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/[0.08]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#5c4a22] via-[#C9A84C] to-[#F5E6B3] transition-[width] duration-500"
            style={{ width: `${(completed / 3) * 100}%` }}
          />
        </div>
      </div>

      {allThree && (
        <div className="kai-msg-animate rounded-xl border border-[rgba(201,168,76,0.45)] bg-[rgba(201,168,76,0.1)] px-4 py-3 text-center text-sm font-semibold text-[#C9A84C] shadow-[0_0_24px_rgba(201,168,76,0.2)]">
          🏆 Perfect day! All games complete +10 bonus pts
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        {games.map((g) => (
          <div key={g.id} className="kai-card flex flex-col p-4">
            <div className="flex items-start justify-between gap-2">
              <span className="text-2xl">{g.icon}</span>
            </div>
            <p className="kai-heading mt-2 text-sm font-semibold tracking-[0.05em]">
              {g.name}
            </p>
            {"ptsLabel" in g ? (
              <p className="mt-1 text-xs text-[#E8DCC8]/55">{g.ptsLabel}</p>
            ) : (
              <p className="mt-1 text-xs text-[#E8DCC8]/55">+{g.pts} pts</p>
            )}
            {g.lock ? (
              <p className="mt-3 text-xs font-medium text-emerald-400/90">
                ✅ Done today ·{" "}
                {g.id === "logic"
                  ? "up to +25 pts earned"
                  : `+${g.pts} pts earned`}
              </p>
            ) : (
              <p className="kai-game-cta-pulse mt-3 text-xs font-semibold text-[#C9A84C]">
                Play today → +{g.id === "logic" ? "up to 25" : g.pts} pts
              </p>
            )}
            <button
              type="button"
              onClick={() => setActive((a) => (a === g.id ? null : g.id))}
              className="kai-btn-shimmer mt-4 min-h-[44px] w-full rounded-xl border border-[rgba(201,168,76,0.45)] bg-gradient-to-br from-[#C9A84C] to-[#F5E6B3] py-2.5 text-xs font-semibold text-black/90"
            >
              {g.lock ? "View / replay" : "Play today"}
            </button>
          </div>
        ))}
      </div>

      {active === "word" && <WordPuzzleGame onPoints={onPoints} />}
      {active === "memory" && <MemoryGame onPoints={onPoints} />}
      {active === "logic" && <LogicPuzzleGame onPoints={onPoints} />}
    </div>
  );
}
