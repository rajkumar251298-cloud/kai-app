"use client";

import { runDailyReset } from "@/lib/dailyReset";
import { useEffect } from "react";

/** Ensures daily rollover runs even before AppChrome mounts. */
export function DailyResetRunner() {
  useEffect(() => {
    queueMicrotask(() => runDailyReset());
  }, []);
  return null;
}
