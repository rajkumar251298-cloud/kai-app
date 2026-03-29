"use client";

import Link from "next/link";
import {
  countCheckinsThisWeekSoFar,
  ensureStreakProcessed,
  getDisplayedStreak,
  getFullWeekCalendarCells,
  getLongestStreak,
  localDateKey,
} from "@/lib/streakSystem";
import { useCallback, useEffect, useRef, useState } from "react";

export const LAST_STREAK_POPUP_DATE_KEY = "lastStreakPopupDate";
export const OPEN_STREAK_POPUP = "kai-open-streak-popup";

const DURATION_MS = 5000;

export function StreakPopup() {
  const [open, setOpen] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [progress, setProgress] = useState(100);
  const timerRef = useRef<number | null>(null);
  const startedAt = useRef(0);

  const close = useCallback(() => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = null;
    setFadeOut(true);
    window.setTimeout(() => {
      setOpen(false);
      setFadeOut(false);
      setProgress(100);
    }, 280);
  }, []);

  const startTimer = useCallback(() => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    startedAt.current = performance.now();
    setProgress(100);
    const tick = () => {
      const elapsed = performance.now() - startedAt.current;
      const p = Math.max(0, 100 - (elapsed / DURATION_MS) * 100);
      setProgress(p);
      if (elapsed >= DURATION_MS) {
        close();
      }
    };
    timerRef.current = window.setInterval(tick, 32);
    tick();
  }, [close]);

  useEffect(() => {
    const onOpen = (e: Event) => {
      const auto = (e as CustomEvent<{ auto?: boolean }>).detail?.auto;
      if (auto === true && typeof window !== "undefined") {
        localStorage.setItem(
          LAST_STREAK_POPUP_DATE_KEY,
          localDateKey(new Date()),
        );
      }
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setOpen(true);
      setFadeOut(false);
      setProgress(100);
      queueMicrotask(() => startTimer());
    };
    window.addEventListener(OPEN_STREAK_POPUP, onOpen);
    return () => window.removeEventListener(OPEN_STREAK_POPUP, onOpen);
  }, [startTimer]);

  if (!open) return null;

  ensureStreakProcessed();
  const current = getDisplayedStreak();
  const best = getLongestStreak();
  const weekCells = getFullWeekCalendarCells();
  const weekDone = countCheckinsThisWeekSoFar();

  return (
    <div
      className={`fixed inset-0 z-[214] flex items-center justify-center px-4 transition-opacity duration-300 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
      style={{ background: "rgba(0,0,0,0.85)" }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="streak-popup-title"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Close streak summary"
        onClick={close}
      />
      <div
        className="relative z-10 w-full max-w-[380px] overflow-hidden rounded-[20px] border border-[#C9A84C] bg-[#111111] p-8 pb-10 shadow-[0_0_40px_rgba(201,168,76,0.15)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center">
          <div className="text-[48px] leading-none" aria-hidden>
            🔥
          </div>
          <p
            id="streak-popup-title"
            className="mt-2 text-[72px] font-semibold leading-none text-[#C9A84C]"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            {current}
          </p>
          <p className="mt-1 text-base text-[#E8DCC8]/65">day streak</p>
        </div>

        <div className="mt-8 flex justify-between gap-1">
          {weekCells.map((cell) => {
            const circle =
              cell.status === "done"
                ? "flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#C9A84C] to-[#F5E6B3] text-sm font-bold text-black/85"
                : cell.status === "today_pending"
                  ? "kai-calendar-today-pulse flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#C9A84C] bg-black text-sm text-transparent"
                  : cell.status === "missed"
                    ? "flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(180,60,60,0.35)] bg-[#0a0a0a] text-sm font-bold text-red-500/90"
                    : "flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(201,168,76,0.12)] bg-black";
            return (
              <div key={cell.iso} className="flex flex-col items-center gap-1">
                <div className={circle} aria-hidden>
                  {cell.status === "done"
                    ? "✓"
                    : cell.status === "missed"
                      ? "×"
                      : null}
                </div>
                <span className="text-[10px] text-[#E8DCC8]/45">
                  {cell.shortLabel}
                </span>
              </div>
            );
          })}
        </div>

        <p className="mt-6 text-center text-sm text-white">
          {weekDone} / 7 days this week
        </p>

        <div className="mt-6 grid grid-cols-3 gap-2 text-center text-xs text-[#E8DCC8]">
          <div>
            <div className="text-lg" aria-hidden>
              🔥
            </div>
            <div className="mt-1 text-[#E8DCC8]/55">Current</div>
            <div className="font-semibold text-[#C9A84C]">{current} days</div>
          </div>
          <div>
            <div className="text-lg" aria-hidden>
              🏆
            </div>
            <div className="mt-1 text-[#E8DCC8]/55">Best</div>
            <div className="font-semibold text-[#C9A84C]">{best} days</div>
          </div>
          <div>
            <div className="text-lg" aria-hidden>
              📅
            </div>
            <div className="mt-1 text-[#E8DCC8]/55">This week</div>
            <div className="font-semibold text-[#C9A84C]">
              {weekDone}/7
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-sm font-medium text-[#C9A84C]">
          {current > 0
            ? `Keep going. ${current + 1} days tomorrow.`
            : "Start today. One check-in. That's all."}
        </p>

        <Link
          href="/chat?mode=checkin"
          onClick={close}
          className="kai-btn-shimmer mt-6 flex min-h-[48px] w-full items-center justify-center rounded-xl border border-[rgba(201,168,76,0.5)] bg-gradient-to-br from-[#C9A84C] to-[#F5E6B3] text-sm font-semibold text-black/90"
        >
          Check in now →
        </Link>

        <p className="mt-4 text-center text-xs text-[#E8DCC8]/45">
          Tap anywhere to close · auto-closes in 5s
        </p>

        <div className="absolute bottom-0 left-0 right-0 h-1 overflow-hidden bg-black/60">
          <div
            className="h-full bg-gradient-to-r from-[#8a7028] via-[#C9A84C] to-[#F5E6B3] transition-[width] duration-75 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
