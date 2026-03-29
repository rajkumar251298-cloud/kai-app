"use client";

import { useEffect, useState } from "react";

type KaiProgressBarProps = {
  pct: number;
  barClassName: string;
};

/**
 * Fills from 0 → pct on mount with a smooth width transition (gold gradients via barClassName).
 */
export function KaiProgressBar({ pct, barClassName }: KaiProgressBarProps) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const reduced =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      queueMicrotask(() => setWidth(pct));
      return;
    }
    const id = requestAnimationFrame(() => setWidth(pct));
    return () => cancelAnimationFrame(id);
  }, [pct]);

  return (
    <div className="h-2.5 w-full cursor-default select-none overflow-hidden rounded-full bg-white/[0.08]">
      <div
        className={`kai-progress-inner h-full rounded-full ${barClassName}`}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}
