"use client";

import { useAuth } from "@/components/AuthProvider";
import { Header } from "@/components/Header";
import { HomeBackLink } from "@/components/HomeBackLink";
import {
  addGoal,
  loadGoals,
  removeGoal,
  updateGoal,
  type KaiGoal,
} from "@/lib/kaiGoals";
import {
  getConsecutiveCheckinStreak,
  getGamesPlayedTotal,
  getTotalCheckins,
  getTotalPoints,
  habitQuizProfileSaved,
  KAI_HABIT_PROFILE_KEY,
} from "@/lib/kaiPoints";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useCallback, useEffect, useState } from "react";

const CARD =
  "rounded-2xl border border-[rgba(201,168,76,0.18)] bg-[#111111] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.55)] sm:p-5";

const BTN_ROW =
  "kai-btn-shimmer flex min-h-[44px] w-full items-center justify-center rounded-xl border border-[rgba(201,168,76,0.32)] bg-black px-4 py-3 text-left text-sm font-medium text-[#E8DCC8] transition hover:border-[rgba(201,168,76,0.5)] hover:text-[#F5F0E8]";

const GOLD_CTA =
  "kai-btn-shimmer flex min-h-[48px] w-full items-center justify-center rounded-xl border border-[rgba(201,168,76,0.45)] bg-gradient-to-br from-[#C9A84C] to-[#F5E6B3] text-sm font-semibold text-black/90";

const K_USER = "userName";
const K_CHECKIN_TIME = "checkinTime";
const K_EMAIL = "kaiUserEmail";
const K_NOTIFY = "kaiPrefsNotifications";
const K_SOUND = "kaiPrefsSound";
const K_REMINDER = "kaiDailyReminderTime";

function initialsFromName(name: string | null): string {
  if (!name?.trim()) return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function initialsFromEmail(email: string | null | undefined): string {
  if (!email?.trim()) return "?";
  const ch = email.trim()[0];
  return ch ? ch.toUpperCase() : "?";
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [habitTitle, setHabitTitle] = useState<string | null>(null);
  const [points, setPoints] = useState(0);
  const [goals, setGoals] = useState<KaiGoal[]>([]);
  const [notificationsOn, setNotificationsOn] = useState(true);
  const [soundOn, setSoundOn] = useState(true);
  const [reminderTime, setReminderTime] = useState("09:00");
  const [emailDisplay, setEmailDisplay] = useState("");

  const [nameModal, setNameModal] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [timeModal, setTimeModal] = useState(false);
  const [timeDraft, setTimeDraft] = useState("");
  const [goalModal, setGoalModal] = useState<null | { mode: "add" } | { mode: "edit"; id: string; text: string }>(null);
  const [goalDraft, setGoalDraft] = useState("");
  const [shareOpen, setShareOpen] = useState(false);
  const [ratingOpen, setRatingOpen] = useState(false);
  const [rating, setRating] = useState(0);

  const refreshLocal = useCallback(() => {
    setPoints(getTotalPoints());
    setGoals(loadGoals());
    setUserName(localStorage.getItem(K_USER)?.trim() || null);
    try {
      const raw = localStorage.getItem(KAI_HABIT_PROFILE_KEY);
      if (raw) {
        const p = JSON.parse(raw) as { title?: string };
        setHabitTitle(p?.title ?? null);
      } else setHabitTitle(null);
    } catch {
      setHabitTitle(null);
    }
    setNotificationsOn(localStorage.getItem(K_NOTIFY) !== "0");
    setSoundOn(localStorage.getItem(K_SOUND) !== "0");
    setReminderTime(localStorage.getItem(K_REMINDER) || "09:00");
    setEmailDisplay(localStorage.getItem(K_EMAIL) || "Not set — add in a future update");
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      setMounted(true);
      refreshLocal();
    });
    const onEarn = () => refreshLocal();
    window.addEventListener("kai-points-earned", onEarn);
    return () => window.removeEventListener("kai-points-earned", onEarn);
  }, [refreshLocal]);

  const streak = getConsecutiveCheckinStreak();
  const checkins = getTotalCheckins();
  const gamesN = getGamesPlayedTotal();
  const quizDone = habitQuizProfileSaved();

  const persistSound = (on: boolean) => {
    localStorage.setItem(K_SOUND, on ? "1" : "0");
    setSoundOn(on);
  };

  const persistNotify = (on: boolean) => {
    localStorage.setItem(K_NOTIFY, on ? "1" : "0");
    setNotificationsOn(on);
  };

  const persistReminder = (t: string) => {
    localStorage.setItem(K_REMINDER, t);
    setReminderTime(t);
  };

  const submitName = (e: FormEvent) => {
    e.preventDefault();
    const t = nameDraft.trim();
    if (t) localStorage.setItem(K_USER, t);
    setUserName(t || null);
    setNameModal(false);
  };

  const submitTime = (e: FormEvent) => {
    e.preventDefault();
    const t = timeDraft.trim();
    if (t) localStorage.setItem(K_CHECKIN_TIME, t);
    setTimeModal(false);
  };

  const submitGoal = (e: FormEvent) => {
    e.preventDefault();
    const t = goalDraft.trim();
    if (!t) return;
    if (!goalModal) return;
    if (goalModal.mode === "add") {
      addGoal(t);
    } else {
      updateGoal(goalModal.id, t);
    }
    setGoals(loadGoals());
    setGoalModal(null);
    setGoalDraft("");
  };

  const shareText = `I’m staying accountable with KAI — ${typeof window !== "undefined" ? window.location.origin : "https://kaiapp.co"}`;

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: "KAI", text: shareText });
      } else {
        await navigator.clipboard.writeText(shareText);
      }
    } catch {
      /* ignore */
    }
    setShareOpen(false);
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      /* ignore */
    }
    router.replace("/login");
  };

  const displayName = userName?.trim() || "Your name";

  const meta = user?.user_metadata as
    | { avatar_url?: string; picture?: string }
    | undefined;
  const avatarUrl = meta?.avatar_url ?? meta?.picture ?? null;
  const accountEmail =
    user?.email?.trim() ||
    emailDisplay ||
    "Not set — add in a future update";
  const avatarInitials = user?.email
    ? initialsFromEmail(user.email)
    : initialsFromName(userName);

  if (!mounted) {
    return (
      <div className="flex min-h-screen flex-col bg-black">
        <Header />
        <div className="flex flex-1 items-center justify-center text-[#E8DCC8]/45">
          Loading…
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-black">
      <Header />

      <main className="mx-auto w-full max-w-lg flex-1 space-y-5 px-4 pb-10 pt-6 max-md:pb-[calc(80px+env(safe-area-inset-bottom,0px))] max-md:text-[15px]">
        <HomeBackLink />

        {!authLoading && !user && isSupabaseConfigured && (
          <div className="rounded-2xl border border-[rgba(201,168,76,0.35)] bg-[rgba(201,168,76,0.08)] px-4 py-4 text-center">
            <p className="text-sm font-medium text-[#C9A84C]">
              Sign in to sync your data
            </p>
            <Link
              href="/login?next=/profile"
              className="kai-btn-shimmer mt-3 inline-flex min-h-[44px] w-full items-center justify-center rounded-xl border border-[rgba(201,168,76,0.45)] bg-black py-2.5 text-sm font-semibold text-[#F5F0E8] transition hover:border-[rgba(201,168,76,0.6)]"
            >
              Sign in with Google
            </Link>
          </div>
        )}

        <header className="flex flex-col items-center text-center">
          <div
            className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-[rgba(201,168,76,0.45)] bg-gradient-to-br from-[#2a2418] to-black text-2xl font-semibold text-[#C9A84C] shadow-[0_0_32px_rgba(201,168,76,0.2)]"
            aria-hidden
          >
            {avatarUrl ? (
              // Google avatar URLs are dynamic; avoid next/image remote config.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              avatarInitials
            )}
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <h1 className="kai-heading text-3xl font-semibold tracking-[0.04em] text-[#F5F0E8] sm:text-4xl">
              {displayName}
            </h1>
            {user && (
              <span className="inline-flex items-center rounded-full border border-emerald-500/45 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400/95">
                ✅ Synced
              </span>
            )}
          </div>
          {user?.email && (
            <p className="mt-1.5 text-sm text-[#C9A84C]/90">{user.email}</p>
          )}
          {habitTitle && (
            <p className="mt-2 max-w-sm text-sm leading-snug text-[#E8DCC8]/80">
              {habitTitle}
            </p>
          )}
          <p className="mt-3 text-lg font-semibold tabular-nums text-[#C9A84C]">
            ⚡ {points} pts
          </p>
        </header>

        <section className={CARD}>
          <h2 className="kai-heading mb-3 text-sm font-semibold tracking-[0.08em] text-[#F5F0E8]">
            Account
          </h2>
          <div className="space-y-2">
            <button
              type="button"
              className={BTN_ROW}
              onClick={() => {
                setNameDraft(userName || "");
                setNameModal(true);
              }}
            >
              Edit name
            </button>
            <button
              type="button"
              className={BTN_ROW}
              onClick={() => {
                setTimeDraft(localStorage.getItem(K_CHECKIN_TIME) || "7am");
                setTimeModal(true);
              }}
            >
              Change check-in time
            </button>
            <div className="flex min-h-[44px] items-center justify-between gap-3 rounded-xl border border-[rgba(201,168,76,0.2)] bg-black px-4 py-2">
              <span className="text-sm text-[#E8DCC8]">Notifications</span>
              <button
                type="button"
                role="switch"
                aria-checked={notificationsOn}
                onClick={() => persistNotify(!notificationsOn)}
                className={`relative h-7 w-12 shrink-0 rounded-full border transition ${
                  notificationsOn
                    ? "border-[rgba(201,168,76,0.5)] bg-[rgba(201,168,76,0.25)]"
                    : "border-[rgba(201,168,76,0.15)] bg-black"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-6 w-6 rounded-full bg-[#C9A84C] transition-all ${
                    notificationsOn ? "left-6" : "left-0.5"
                  }`}
                />
              </button>
            </div>
            <div className="rounded-xl border border-[rgba(201,168,76,0.12)] bg-black/50 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-[#E8DCC8]/45">
                Email / account
              </p>
              <p className="mt-1 text-sm text-[#E8DCC8]/75">{accountEmail}</p>
            </div>
          </div>
        </section>

        <section className={CARD}>
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="kai-heading text-sm font-semibold tracking-[0.08em] text-[#F5F0E8]">
              My Goals
            </h2>
          </div>
          <ul className="space-y-2">
            {goals.length === 0 ? (
              <li className="text-sm text-[#E8DCC8]/55">No goals yet.</li>
            ) : (
              goals.map((g) => (
                <li
                  key={g.id}
                  className="flex min-h-[44px] items-center gap-2 rounded-xl border border-[rgba(201,168,76,0.15)] bg-black px-3 py-2"
                >
                  <span className="min-w-0 flex-1 text-sm text-[#E8DCC8]">
                    {g.text}
                  </span>
                  <button
                    type="button"
                    className="shrink-0 rounded-lg border border-[rgba(201,168,76,0.35)] px-3 py-2 text-xs font-medium text-[#C9A84C]"
                    onClick={() => {
                      setGoalModal({ mode: "edit", id: g.id, text: g.text });
                      setGoalDraft(g.text);
                    }}
                  >
                    Edit
                  </button>
                </li>
              ))
            )}
          </ul>
          <button
            type="button"
            className={`${GOLD_CTA} mt-4`}
            onClick={() => {
              setGoalModal({ mode: "add" });
              setGoalDraft("");
            }}
          >
            Add new goal
          </button>
        </section>

        <section className={CARD}>
          <h2 className="kai-heading mb-3 text-sm font-semibold tracking-[0.08em] text-[#F5F0E8]">
            App Settings
          </h2>
          <div className="space-y-3">
            <div className="flex min-h-[44px] items-center justify-between gap-3 rounded-xl border border-[rgba(201,168,76,0.25)] bg-black/60 px-4 py-2">
              <span className="flex items-center gap-2 text-sm text-[#C9A84C]/90">
                <span aria-hidden>🔒</span>
                Dark mode (always on)
              </span>
              <span className="text-xs text-[#E8DCC8]/45">Locked</span>
            </div>
            <div className="flex min-h-[44px] items-center justify-between gap-3 rounded-xl border border-[rgba(201,168,76,0.2)] bg-black px-4 py-2">
              <span className="text-sm text-[#E8DCC8]">Sound effects</span>
              <button
                type="button"
                role="switch"
                aria-checked={soundOn}
                onClick={() => persistSound(!soundOn)}
                className={`relative h-7 w-12 shrink-0 rounded-full border transition ${
                  soundOn
                    ? "border-[rgba(201,168,76,0.5)] bg-[rgba(201,168,76,0.25)]"
                    : "border-[rgba(201,168,76,0.15)] bg-black"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-6 w-6 rounded-full bg-[#C9A84C] transition-all ${
                    soundOn ? "left-6" : "left-0.5"
                  }`}
                />
              </button>
            </div>
            <label className="block text-sm text-[#E8DCC8]">
              <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-[#E8DCC8]/45">
                Daily reminder time
              </span>
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => persistReminder(e.target.value)}
                className="min-h-[44px] w-full rounded-xl border border-[rgba(201,168,76,0.28)] bg-black px-4 py-2.5 text-[15px] text-[#F5F0E8] focus:border-[rgba(201,168,76,0.5)] focus:outline-none focus:ring-2 focus:ring-[rgba(201,168,76,0.12)]"
              />
            </label>
          </div>
        </section>

        <section className={CARD}>
          <h2 className="kai-heading mb-3 text-sm font-semibold tracking-[0.08em] text-[#F5F0E8]">
            Progress Summary
          </h2>
          <ul className="space-y-2 text-sm text-[#E8DCC8]">
            <li className="flex justify-between gap-2 border-b border-[rgba(201,168,76,0.08)] py-2">
              <span>Current streak</span>
              <span className="font-semibold text-[#C9A84C]">{streak} days</span>
            </li>
            <li className="flex justify-between gap-2 border-b border-[rgba(201,168,76,0.08)] py-2">
              <span>Total check-ins</span>
              <span className="font-semibold tabular-nums text-[#C9A84C]">
                {checkins}
              </span>
            </li>
            <li className="flex justify-between gap-2 border-b border-[rgba(201,168,76,0.08)] py-2">
              <span>Games played</span>
              <span className="font-semibold tabular-nums text-[#C9A84C]">
                {gamesN}
              </span>
            </li>
            <li className="flex justify-between gap-2 py-2">
              <span>Habit quiz</span>
              <span className="font-semibold text-[#C9A84C]">
                {quizDone ? "Completed" : "Not yet"}
              </span>
            </li>
          </ul>
        </section>

        <section className={CARD}>
          <h2 className="kai-heading mb-3 text-sm font-semibold tracking-[0.08em] text-[#F5F0E8]">
            Support
          </h2>
          <div className="space-y-2">
            <a
              href="mailto:support@kaiapp.co"
              className={`${BTN_ROW} !justify-center`}
            >
              Contact us
            </a>
            <button
              type="button"
              className={BTN_ROW}
              onClick={() => setRatingOpen((o) => !o)}
            >
              Rate the app
            </button>
            {ratingOpen && (
              <div
                className="flex justify-center gap-1 rounded-xl border border-[rgba(201,168,76,0.15)] bg-black/40 py-3"
                aria-label="Rating"
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    className="min-h-[44px] min-w-[44px] text-2xl leading-none text-[#C9A84C] drop-shadow-[0_0_10px_rgba(201,168,76,0.35)] transition hover:scale-110"
                    aria-label={`${n} stars`}
                    onClick={() => setRating(n)}
                  >
                    {n <= rating ? "★" : "☆"}
                  </button>
                ))}
              </div>
            )}
            <button
              type="button"
              className={BTN_ROW}
              onClick={() => setShareOpen(true)}
            >
              Share KAI
            </button>
            <Link href="/privacy" className={`${BTN_ROW} !justify-center`}>
              Privacy Policy
            </Link>
            <Link href="/terms" className={`${BTN_ROW} !justify-center`}>
              Terms of Service
            </Link>
          </div>
        </section>

        {user && isSupabaseConfigured && (
          <button
            type="button"
            onClick={handleSignOut}
            className="mb-6 w-full rounded-xl border border-red-500 bg-black py-3.5 text-sm font-semibold text-red-500 transition hover:border-red-400 hover:text-red-400"
          >
            Sign out
          </button>
        )}
      </main>

      {nameModal && (
        <ModalWrap title="Edit name" onClose={() => setNameModal(false)}>
          <form onSubmit={submitName} className="space-y-3">
            <input
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              className="min-h-[44px] w-full rounded-xl border border-[rgba(201,168,76,0.28)] bg-black px-4 py-3 text-[#F5F0E8]"
              placeholder="Your name"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="rounded-lg px-4 py-2 text-sm text-[#E8DCC8]/65"
                onClick={() => setNameModal(false)}
              >
                Cancel
              </button>
              <button type="submit" className={GOLD_CTA}>
                Save
              </button>
            </div>
          </form>
        </ModalWrap>
      )}

      {timeModal && (
        <ModalWrap title="Check-in time" onClose={() => setTimeModal(false)}>
          <form onSubmit={submitTime} className="space-y-3">
            <p className="text-sm text-[#E8DCC8]/75">
              When should KAI check in? (e.g. 7am, 8:30am)
            </p>
            <input
              value={timeDraft}
              onChange={(e) => setTimeDraft(e.target.value)}
              className="min-h-[44px] w-full rounded-xl border border-[rgba(201,168,76,0.28)] bg-black px-4 py-3 text-[#F5F0E8]"
              placeholder="7am"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="rounded-lg px-4 py-2 text-sm text-[#E8DCC8]/65"
                onClick={() => setTimeModal(false)}
              >
                Cancel
              </button>
              <button type="submit" className={GOLD_CTA}>
                Save
              </button>
            </div>
          </form>
        </ModalWrap>
      )}

      {goalModal && (
        <ModalWrap
          title={goalModal.mode === "add" ? "New goal" : "Edit goal"}
          onClose={() => {
            setGoalModal(null);
            setGoalDraft("");
          }}
        >
          <form onSubmit={submitGoal} className="space-y-3">
            <textarea
              value={goalDraft}
              onChange={(e) => setGoalDraft(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-[rgba(201,168,76,0.28)] bg-black px-4 py-3 text-[#F5F0E8]"
              placeholder="What are you working toward?"
              autoFocus
            />
            {goalModal.mode === "edit" && (
              <button
                type="button"
                className="text-sm text-red-400/90"
                onClick={() => {
                  removeGoal(goalModal.id);
                  setGoals(loadGoals());
                  setGoalModal(null);
                }}
              >
                Remove goal
              </button>
            )}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="rounded-lg px-4 py-2 text-sm text-[#E8DCC8]/65"
                onClick={() => setGoalModal(null)}
              >
                Cancel
              </button>
              <button type="submit" className={GOLD_CTA} disabled={!goalDraft.trim()}>
                Save
              </button>
            </div>
          </form>
        </ModalWrap>
      )}

      {shareOpen && (
        <ModalWrap title="Share KAI" onClose={() => setShareOpen(false)}>
          <p className="text-sm text-[#E8DCC8]/80">{shareText}</p>
          <button type="button" className={`${GOLD_CTA} mt-4`} onClick={handleShare}>
            Share or copy link
          </button>
        </ModalWrap>
      )}
    </div>
  );
}

function ModalWrap({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[120] flex items-end justify-center p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/80"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-[rgba(201,168,76,0.25)] bg-[#111111] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.7)]">
        <h3 className="kai-heading text-lg font-semibold text-[#F5F0E8]">
          {title}
        </h3>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}
