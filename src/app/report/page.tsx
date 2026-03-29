"use client";

import { Header } from "@/components/Header";
import { RouterBackButton } from "@/components/RouterBackButton";
import { memoryForApi, stripKaiMachineLines } from "@/lib/kaiMemory";
import { KAI_LS_USER_NAME, getStoredUserGoal } from "@/lib/kaiLocalProfile";
import {
  GRADE_COPY,
  computeWeeklyReport,
  persistWeeklyGradeForBadges,
} from "@/lib/kaiWeeklyReport";
import { useCallback, useEffect, useMemo, useState } from "react";

export default function WeeklyReportPage() {
  const snapshot = useMemo(() => computeWeeklyReport(new Date()), []);
  const copy = GRADE_COPY[snapshot.grade];

  const [aiTake, setAiTake] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(true);
  const [aiError, setAiError] = useState<string | null>(null);
  const [shareDone, setShareDone] = useState(false);

  useEffect(() => {
    persistWeeklyGradeForBadges(snapshot.grade);
  }, [snapshot.grade]);

  useEffect(() => {
    let cancelled = false;
    const userName =
      typeof window !== "undefined"
        ? localStorage.getItem(KAI_LS_USER_NAME)?.trim() || "there"
        : "there";
    const userGoal = typeof window !== "undefined" ? getStoredUserGoal() : "";
    const prompt = `Generate a personal weekly performance review for ${userName}. They completed ${snapshot.checkins} check-ins out of 7 this week, maintained a ${snapshot.streak} day streak, played ${snapshot.gamesPlayed} games, and earned ${snapshot.pointsEarned} points. Write 3-4 sentences as KAI the accountability coach. Be honest, specific, warm but direct. Reference their actual numbers. End with one sharp challenge for next week.`;

    (async () => {
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [{ role: "user", content: prompt }],
            userName,
            userGoal,
            chatMode: "checkin",
            memory: memoryForApi(),
          }),
        });
        const data: { reply?: string; error?: string } = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Request failed");
        const reply = data.reply?.trim();
        if (!reply) throw new Error("Empty reply");
        if (!cancelled) {
          setAiTake(stripKaiMachineLines(reply));
          setAiError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setAiError(e instanceof Error ? e.message : "Could not load KAI take.");
        }
      } finally {
        if (!cancelled) setAiLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [snapshot.checkins, snapshot.gamesPlayed, snapshot.pointsEarned, snapshot.streak]);

  const share = useCallback(() => {
    const text = `My KAI weekly report: ${snapshot.grade} — ${copy.label}
Check-ins: ${snapshot.checkins}/7 | Streak: ${snapshot.streak} days | Points: ${snapshot.pointsEarned}
Getting coached by AI every day 💪
#KAI #KeepAtIt`;
    void navigator.clipboard.writeText(text).then(() => {
      setShareDone(true);
      window.setTimeout(() => setShareDone(false), 4000);
    });
  }, [copy.label, snapshot.checkins, snapshot.grade, snapshot.pointsEarned, snapshot.streak]);

  return (
    <div className="flex min-h-screen flex-col bg-black">
      <Header />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 pb-12 pt-0 max-md:pb-[calc(80px+env(safe-area-inset-bottom,0px))] max-md:text-[15px]">
        <RouterBackButton />
        <h1 className="kai-heading mt-2 text-center text-3xl font-semibold tracking-[0.04em] text-[#F5F0E8] sm:text-4xl">
          Weekly Report
        </h1>
        <p className="mt-2 text-center text-sm text-[#C9A84C]/85">
          {snapshot.weekLabel}
        </p>

        <div className="kai-card mx-auto mt-8 max-w-md rounded-2xl border-2 border-[rgba(201,168,76,0.45)] bg-[#111111] px-6 py-10 text-center shadow-[0_0_40px_rgba(201,168,76,0.12)]">
          <p
            className="kai-heading text-[120px] font-bold leading-none tracking-tight text-[#C9A84C] sm:text-[120px]"
            style={{ fontSize: "clamp(4.5rem, 22vw, 7.5rem)" }}
          >
            {snapshot.grade}
          </p>
          <p className="kai-heading mt-4 text-lg font-semibold text-[#F5F0E8]">
            {copy.label}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-[#E8DCC8]/88">
            {copy.line}
          </p>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { icon: "✅", label: "Check-ins", value: `${snapshot.checkins}/7` },
            { icon: "🔥", label: "Streak", value: `${snapshot.streak} days` },
            {
              icon: "🎮",
              label: "Games",
              value: `${snapshot.gamesPlayed} played`,
            },
            {
              icon: "⚡",
              label: "Points",
              value: `${snapshot.pointsEarned} earned`,
            },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-[rgba(201,168,76,0.2)] bg-[#111111] px-3 py-3 text-center"
            >
              <div className="text-lg" aria-hidden>
                {s.icon}
              </div>
              <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-[#E8DCC8]/50">
                {s.label}
              </p>
              <p className="mt-0.5 text-sm font-semibold tabular-nums text-[#C9A84C]">
                {s.value}
              </p>
            </div>
          ))}
        </div>

        <section className="mt-10 rounded-2xl border border-[rgba(201,168,76,0.22)] border-l-[4px] border-l-[#C9A84C] bg-[#111111] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.55)]">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C9A84C]">
            KAI&apos;s Take
          </h2>
          {aiLoading && (
            <div className="mt-4 flex items-center gap-2 text-sm text-[#E8DCC8]/65">
              <span className="kai-typing-dot inline-block h-2 w-2 rounded-full bg-[#C9A84C]" />
              <span className="kai-typing-dot inline-block h-2 w-2 rounded-full bg-[#C9A84C]" />
              <span className="kai-typing-dot inline-block h-2 w-2 rounded-full bg-[#C9A84C]" />
              <span className="ml-1">KAI is writing…</span>
            </div>
          )}
          {!aiLoading && aiError && (
            <p className="mt-4 text-sm text-[#E8DCC8]/70">{aiError}</p>
          )}
          {!aiLoading && aiTake && (
            <p className="mt-4 text-sm leading-relaxed text-[#E8DCC8]/90">
              {aiTake}
            </p>
          )}
        </section>

        <button
          type="button"
          onClick={share}
          className="kai-btn-shimmer mt-10 w-full rounded-xl border border-[rgba(201,168,76,0.45)] bg-gradient-to-br from-[#C9A84C] to-[#F5E6B3] py-3.5 text-sm font-semibold text-black/90"
        >
          Share my report card 🏆
        </button>
        {shareDone && (
          <p className="mt-3 text-center text-sm font-medium text-[#C9A84C]">
            Copied! Post it anywhere 🚀
          </p>
        )}
      </main>
    </div>
  );
}
