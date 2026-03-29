"use client";

import {
  LevelUpOverlay,
  type LevelTier,
  runLevelUpCheck,
} from "@/components/LevelSystem";
import { checkAndAwardBadges } from "@/lib/checkBadges";
import { scheduleNotifications } from "@/lib/notifications";
import { useCallback, useEffect, useState } from "react";

export function AppBootstrap() {
  const [levelTier, setLevelTier] = useState<LevelTier | null>(null);
  const [newDayToast, setNewDayToast] = useState(false);

  const dismissNewDay = useCallback(() => setNewDayToast(false), []);

  useEffect(() => {
    const onNewDay = () => setNewDayToast(true);
    window.addEventListener("kai-new-day", onNewDay);
    return () => window.removeEventListener("kai-new-day", onNewDay);
  }, []);

  useEffect(() => {
    if (!newDayToast) return;
    const t = window.setTimeout(dismissNewDay, 4500);
    return () => window.clearTimeout(t);
  }, [newDayToast, dismissNewDay]);

  useEffect(() => {
    const boot = () => {
      checkAndAwardBadges();
      scheduleNotifications();
      runLevelUpCheck(setLevelTier);
    };
    queueMicrotask(boot);
    const onEarn = () => {
      checkAndAwardBadges();
      runLevelUpCheck(setLevelTier);
    };
    window.addEventListener("kai-points-earned", onEarn);
    return () => window.removeEventListener("kai-points-earned", onEarn);
  }, []);

  return (
    <>
      {newDayToast && (
        <div
          className="pointer-events-none fixed bottom-6 left-1/2 z-[190] w-[min(92vw,24rem)] -translate-x-1/2 rounded-xl border border-[rgba(201,168,76,0.35)] bg-black/95 px-4 py-3 text-center text-sm text-[#E8DCC8] shadow-[0_8px_32px_rgba(0,0,0,0.6)]"
          role="status"
        >
          <span className="font-medium text-[#C9A84C]">New day</span> — new
          games available.
        </div>
      )}
      {levelTier ? (
        <LevelUpOverlay tier={levelTier} onDone={() => setLevelTier(null)} />
      ) : null}
    </>
  );
}
