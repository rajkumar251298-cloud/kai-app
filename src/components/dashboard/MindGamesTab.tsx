"use client";

import {
  wasLogicPlayedToday,
  wasMemoryPlayedToday,
  wasWordSolvedToday,
} from "@/lib/kaiPoints";
import { useState } from "react";
import { LogicPuzzleGame } from "./LogicPuzzleGame";
import { MemoryGame } from "./MemoryGame";
import { WordPuzzleGame } from "./WordPuzzleGame";

type GameId = "word" | "memory" | "logic" | null;

type Props = { onPoints?: () => void; initialGame?: GameId };

export function MindGamesTab({ onPoints, initialGame = null }: Props) {
  const [active, setActive] = useState<GameId>(() => initialGame);

  const wordLock = wasWordSolvedToday();
  const memLock = wasMemoryPlayedToday();
  const logLock = wasLogicPlayedToday();

  const games = [
    {
      id: "word" as const,
      icon: "🔤",
      name: "Daily Word Puzzle",
      pts: "+10 pts",
      lock: wordLock,
    },
    {
      id: "memory" as const,
      icon: "🃏",
      name: "Memory Card Flip",
      pts: "+15 pts",
      lock: memLock,
    },
    {
      id: "logic" as const,
      icon: "🧩",
      name: "Logic Pattern Puzzle",
      pts: "up to +25 pts",
      lock: logLock,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        {games.map((g) => (
          <div key={g.id} className="kai-card flex flex-col p-4">
            <div className="flex items-start justify-between gap-2">
              <span className="text-2xl">{g.icon}</span>
              {g.lock && (
                <span className="text-sm text-[#C9A84C]/50" title="Played today">
                  🔒
                </span>
              )}
            </div>
            <p className="kai-heading mt-2 text-sm font-semibold tracking-[0.05em]">
              {g.name}
            </p>
            <p className="mt-1 text-xs text-[#E8DCC8]/55">{g.pts}</p>
            <button
              type="button"
              onClick={() => setActive((a) => (a === g.id ? null : g.id))}
              className="kai-btn-shimmer mt-4 min-h-[44px] w-full rounded-xl border border-[rgba(201,168,76,0.45)] bg-gradient-to-br from-[#C9A84C] to-[#F5E6B3] py-2.5 text-xs font-semibold text-black/90"
            >
              Play today
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
