"use client";

import { dayOfYearLocal } from "@/lib/dayOfYear";
import {
  addPoints,
  getMemoryBestForDate,
  markMemoryPlayedToday,
  saveMemoryBestForDate,
  todayKey,
  wasMemoryPlayedToday,
} from "@/lib/kaiPoints";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const EMOJI_SETS = [
  { name: "Focus", emojis: ["🎯", "💪", "🔥", "⚡", "🏆", "🧠", "💡", "✅"] },
  { name: "Nature", emojis: ["🌱", "🌊", "🦋", "🌸", "🍃", "⭐", "🌙", "☀️"] },
  { name: "Sports", emojis: ["⚽", "🏀", "🎾", "🏋️", "🚴", "🏊", "🎯", "🥊"] },
  { name: "Tech", emojis: ["💻", "📱", "⌨️", "🖥️", "🔋", "📡", "🔌", "💾"] },
  { name: "Food", emojis: ["🍎", "🥑", "🍵", "🥗", "🍊", "🫐", "🥦", "🍋"] },
  { name: "Travel", emojis: ["✈️", "🗺️", "🏔️", "🌍", "🧭", "⛵", "🚀", "🏕️"] },
  { name: "Animals", emojis: ["🦁", "🐯", "🦊", "🐺", "🦅", "🐬", "🦋", "🐘"] },
  { name: "Music", emojis: ["🎵", "🎸", "🎹", "🎺", "🎻", "🥁", "🎤", "🎧"] },
  { name: "Weather", emojis: ["☀️", "🌤️", "⛅", "🌧️", "⚡", "❄️", "🌈", "🌪️"] },
  {
    name: "Emotions",
    emojis: ["😊", "💪", "🔥", "✨", "🎉", "💫", "🌟", "❤️"],
  },
] as const;

type Card = { id: number; emoji: string; pair: number };

function buildDeck(emojis: readonly string[]): Card[] {
  const pairs = emojis.map((emoji, pair) => [
    { id: pair * 2, emoji, pair },
    { id: pair * 2 + 1, emoji, pair },
  ]).flat();
  for (let i = pairs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pairs[i], pairs[j]] = [pairs[j]!, pairs[i]!];
  }
  return pairs;
}

type Props = { onPoints?: () => void };

export function MemoryGame({ onPoints }: Props) {
  const doy = dayOfYearLocal();
  const setIndex = doy % EMOJI_SETS.length;
  const theme = EMOJI_SETS[setIndex]!;
  const deck = useMemo(
    () => buildDeck([...theme.emojis]),
    [theme.emojis],
  );

  const dateKey = todayKey();
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<Set<number>>(() => new Set());
  const [moves, setMoves] = useState(0);
  const [lock, setLock] = useState(false);
  const [done, setDone] = useState(false);
  const [playedToday, setPlayedToday] = useState(() => wasMemoryPlayedToday());
  const awardedRef = useRef(false);

  const resolvePair = useCallback((a: number, b: number) => {
    const ca = deck.find((c) => c.id === a);
    const cb = deck.find((c) => c.id === b);
    if (!ca || !cb) return;
    if (ca.pair === cb.pair) {
      setMatched((prev) => new Set([...prev, ca.pair]));
      setFlipped([]);
      setLock(false);
    } else {
      window.setTimeout(() => {
        setFlipped([]);
        setLock(false);
      }, 650);
    }
  }, [deck]);

  const onCardClick = (id: number) => {
    if (lock || done || playedToday) return;
    const card = deck.find((c) => c.id === id);
    if (!card || matched.has(card.pair)) return;
    if (flipped.includes(id)) return;

    if (flipped.length === 0) {
      setFlipped([id]);
      return;
    }

    if (flipped.length === 1) {
      const first = flipped[0]!;
      setFlipped([first, id]);
      setLock(true);
      setMoves((m) => m + 1);
      resolvePair(first, id);
    }
  };

  useEffect(() => {
    if (matched.size < 8) return;
    queueMicrotask(() => {
      if (awardedRef.current || playedToday) return;
      awardedRef.current = true;
      setDone(true);
      saveMemoryBestForDate(dateKey, moves);
      if (!wasMemoryPlayedToday()) {
        markMemoryPlayedToday();
        addPoints(15);
        onPoints?.();
      }
      setPlayedToday(true);
    });
  }, [matched.size, moves, playedToday, onPoints, dateKey]);

  const bestToday = getMemoryBestForDate(dateKey);

  return (
    <div className="kai-card mt-4 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-[0.15em] text-[#C9A84C]/80">
          Memory — 8 pairs
        </p>
        <span className="text-xs text-[#E8DCC8]/55">
          Moves: <span className="tabular-nums text-[#C9A84C]">{moves}</span>
        </span>
      </div>
      <p className="mt-2 text-xs text-[#E8DCC8]/55">
        Today&apos;s theme: {theme.name} · New theme tomorrow
      </p>
      {bestToday !== null && (
        <p className="mt-1 text-xs text-[#C9A84C]/80">
          Today&apos;s best: {bestToday} moves
        </p>
      )}
      <div className="mt-3 grid grid-cols-4 gap-2">
        {deck.map((c) => {
          const isUp = flipped.includes(c.id) || matched.has(c.pair);
          return (
            <button
              key={c.id}
              type="button"
              disabled={done || playedToday || matched.has(c.pair)}
              onClick={() => onCardClick(c.id)}
              className="kai-btn-shimmer flex aspect-square items-center justify-center rounded-xl border border-[rgba(201,168,76,0.3)] bg-black text-2xl transition hover:border-[rgba(201,168,76,0.5)] disabled:opacity-40"
            >
              {isUp ? (
                c.emoji
              ) : (
                <span className="text-lg text-[#C9A84C]/35">✦</span>
              )}
            </button>
          );
        })}
      </div>
      {done && (
        <p className="kai-msg-animate mt-4 text-center text-sm text-[#C9A84C]">
          Completed in {moves} moves — +15 streak points
        </p>
      )}
      {playedToday && !done && (
        <p className="mt-4 text-center text-sm text-[#E8DCC8]/65">
          You already completed memory today. New game tomorrow.
        </p>
      )}
    </div>
  );
}
