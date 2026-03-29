"use client";

import {
  getConsecutiveCheckinStreak,
  getLast7DaysCheckinFlags,
  getPointsEarnedToday,
  getTotalPoints,
  hasCheckinToday,
  wasLogicPlayedToday,
  wasMemoryPlayedToday,
  wasWordSolvedToday,
} from "@/lib/kaiPoints";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

const BUBBLE_KEY = "bubblePosition";
const BUBBLE_SIZE = 56;
const DRAG_THRESHOLD = 10;

type Pos = { right: number; top: number };

function defaultPos(): Pos {
  if (typeof window === "undefined") return { right: 16, top: 120 };
  const h = window.innerHeight;
  return { right: 16, top: Math.round(h * 0.7 - BUBBLE_SIZE / 2) };
}

function loadPos(): Pos {
  if (typeof window === "undefined") return defaultPos();
  try {
    const raw = localStorage.getItem(BUBBLE_KEY);
    if (!raw) return defaultPos();
    const p = JSON.parse(raw) as Pos;
    if (
      typeof p?.right === "number" &&
      typeof p?.top === "number" &&
      Number.isFinite(p.right) &&
      Number.isFinite(p.top)
    ) {
      return clampPos(p);
    }
  } catch {
    /* ignore */
  }
  return defaultPos();
}

function savePos(p: Pos): void {
  localStorage.setItem(BUBBLE_KEY, JSON.stringify(p));
}

function clampPos(p: Pos): Pos {
  if (typeof window === "undefined") return p;
  const w = window.innerWidth;
  const h = window.innerHeight;
  const pad = 8;
  return {
    right: Math.min(Math.max(pad, p.right), w - BUBBLE_SIZE - pad),
    top: Math.min(Math.max(pad, p.top), h - BUBBLE_SIZE - pad),
  };
}

export function KaiProgressBubble() {
  const [pos, setPos] = useState<Pos>(defaultPos);
  const [open, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [tick, setTick] = useState(0);

  const dragRef = useRef<{
    active: boolean;
    moved: boolean;
    startX: number;
    startY: number;
    startRight: number;
    startTop: number;
  } | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    queueMicrotask(() => {
      setPos(loadPos());
      setHydrated(true);
    });
    const onResize = () => setPos((p) => clampPos(p));
    window.addEventListener("resize", onResize);
    const onEarn = () => refresh();
    window.addEventListener("kai-points-earned", onEarn);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("kai-points-earned", onEarn);
    };
  }, [refresh]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const el = wrapRef.current;
      if (el && !el.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const snapshot = {
    checkin: hasCheckinToday(),
    ptsToday: getPointsEarnedToday(),
    totalPts: getTotalPoints(),
    streak: getConsecutiveCheckinStreak(),
    week: getLast7DaysCheckinFlags(),
    wordDone: wasWordSolvedToday(),
    memDone: wasMemoryPlayedToday(),
    logDone: wasLogicPlayedToday(),
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (open) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = {
      active: true,
      moved: false,
      startX: e.clientX,
      startY: e.clientY,
      startRight: pos.right,
      startTop: pos.top,
    };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d?.active) return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    if (Math.hypot(dx, dy) > DRAG_THRESHOLD) d.moved = true;
    const next = clampPos({
      right: d.startRight - dx,
      top: d.startTop + dy,
    });
    setPos(next);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const d = dragRef.current;
    dragRef.current = null;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    if (!d?.active) return;
    if (d.moved) {
      setPos((p) => {
        const c = clampPos(p);
        savePos(c);
        return c;
      });
      return;
    }
    setOpen((o) => !o);
    refresh();
  };

  if (!hydrated) return null;

  return (
    <div
      ref={wrapRef}
      className="pointer-events-auto fixed z-[80]"
      style={{ right: pos.right, top: pos.top, width: BUBBLE_SIZE }}
    >
      <span className="sr-only" aria-hidden>
        {tick}
      </span>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 420, damping: 28 }}
            className="absolute bottom-[calc(100%+10px)] right-0 w-[min(300px,calc(100vw-24px))] rounded-2xl border border-[rgba(201,168,76,0.35)] bg-[#111111] p-4 shadow-[0_12px_40px_rgba(0,0,0,0.65),0_0_24px_rgba(201,168,76,0.12)]"
            role="dialog"
            aria-label="Games and progress"
          >
            <div className="mb-3 flex items-start justify-between gap-2">
              <p className="kai-heading text-sm font-semibold text-[#F5F0E8]">
                Mind games
              </p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-[#E8DCC8]/70 transition hover:bg-white/5 hover:text-[#F5F0E8]"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-sm text-[#E8DCC8]">
              <div className="flex justify-between gap-2 rounded-xl border border-[rgba(201,168,76,0.15)] bg-black/50 px-3 py-2">
                <Link
                  href="/dashboard?tab=games&game=word"
                  onClick={() => setOpen(false)}
                  className="flex min-h-[44px] flex-1 flex-col items-center justify-center rounded-lg border border-[rgba(201,168,76,0.22)] bg-black py-2 text-center text-xs transition hover:border-[rgba(201,168,76,0.45)]"
                >
                  <span className="text-lg">🔤</span>
                  <span className="text-[10px] text-[#E8DCC8]/80">Word</span>
                  <span
                    className={`mt-0.5 h-1.5 w-1.5 rounded-full ${snapshot.wordDone ? "bg-emerald-500" : "bg-[#C9A84C]"}`}
                    aria-hidden
                  />
                </Link>
                <Link
                  href="/dashboard?tab=games&game=memory"
                  onClick={() => setOpen(false)}
                  className="flex min-h-[44px] flex-1 flex-col items-center justify-center rounded-lg border border-[rgba(201,168,76,0.22)] bg-black py-2 text-center text-xs transition hover:border-[rgba(201,168,76,0.45)]"
                >
                  <span className="text-lg">🃏</span>
                  <span className="text-[10px] text-[#E8DCC8]/80">
                    Memory
                  </span>
                  <span
                    className={`mt-0.5 h-1.5 w-1.5 rounded-full ${snapshot.memDone ? "bg-emerald-500" : "bg-[#C9A84C]"}`}
                    aria-hidden
                  />
                </Link>
                <Link
                  href="/dashboard?tab=games&game=logic"
                  onClick={() => setOpen(false)}
                  className="flex min-h-[44px] flex-1 flex-col items-center justify-center rounded-lg border border-[rgba(201,168,76,0.22)] bg-black py-2 text-center text-xs transition hover:border-[rgba(201,168,76,0.45)]"
                >
                  <span className="text-lg">🧩</span>
                  <span className="text-[10px] text-[#E8DCC8]/80">Logic</span>
                  <span
                    className={`mt-0.5 h-1.5 w-1.5 rounded-full ${snapshot.logDone ? "bg-emerald-500" : "bg-[#C9A84C]"}`}
                    aria-hidden
                  />
                </Link>
              </div>

              <Link
                href="/dashboard?tab=games"
                onClick={() => setOpen(false)}
                className="flex min-h-[44px] w-full items-center justify-center rounded-xl border border-[rgba(201,168,76,0.28)] bg-black text-xs font-medium text-[#C9A84C] transition hover:border-[rgba(201,168,76,0.45)]"
              >
                All games on Dashboard →
              </Link>

              <div className="border-t border-[rgba(201,168,76,0.12)] pt-3 text-xs text-[#E8DCC8]/55">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span>Check-in today</span>
                  <span aria-hidden>{snapshot.checkin ? "✅" : "⬜"}</span>
                </div>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                  <span>Points today</span>
                  <span className="font-semibold text-[#C9A84C]">
                    ⚡ {snapshot.ptsToday}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1">
                    <span aria-hidden>🔥</span>
                    Streak
                  </span>
                  <span className="font-semibold text-[#C9A84C]">
                    {snapshot.streak} days
                  </span>
                </div>
                <div className="mt-2 flex justify-between gap-1">
                  {snapshot.week.map((done, i) => (
                    <div
                      key={i}
                      className={`h-1.5 flex-1 rounded-full ${done ? "bg-[#C9A84C]" : "bg-white/[0.08]"}`}
                      title={done ? "Check-in" : "Missed"}
                    />
                  ))}
                </div>
                <p className="mt-2 text-center text-[#E8DCC8]/45">
                  Total · ⚡ {snapshot.totalPts} pts
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="flex h-14 w-14 cursor-grab touch-none items-center justify-center rounded-full border-2 border-[rgba(201,168,76,0.45)] bg-black text-xl text-[#C9A84C] shadow-[0_0_20px_rgba(201,168,76,0.2)] active:cursor-grabbing"
        style={{ width: BUBBLE_SIZE, height: BUBBLE_SIZE }}
        aria-label={open ? "Close games menu" : "Open games and progress"}
        aria-expanded={open}
      >
        ⚡
      </button>
    </div>
  );
}
