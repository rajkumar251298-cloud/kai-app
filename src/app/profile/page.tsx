"use client";

import { useAuth } from "@/components/AuthProvider";
import { Header } from "@/components/Header";
import { HomeBackLink } from "@/components/HomeBackLink";
import {
  BadgesGrid,
  LevelProgressCard,
} from "@/components/LevelSystem";
import {
  loadUserGoals,
  markGoalAchieved,
  removeUserGoal,
  updateUserGoalTitle,
  addUserGoal,
  type UserGoal,
} from "@/lib/goalSystem";
import {
  KAI_LS_CHECK_IN_TIME,
  KAI_LS_USER_NAME,
  getStoredCheckInTime,
  getStoredHabitProfile,
  getStoredUserName,
  setStoredCheckInTime,
  setStoredUserName,
} from "@/lib/kaiLocalProfile";
import {
  getConsecutiveCheckinStreak,
  getGamesPlayedTotal,
  getTotalCheckins,
  getTotalPoints,
  habitQuizProfileSaved,
} from "@/lib/kaiPoints";
import { getLongestStreak, ensureStreakProcessed } from "@/lib/streakSystem";
import {
  type BadgeId,
  checkAndAwardBadges,
  loadEarnedBadges,
} from "@/lib/checkBadges";
import {
  cancelScheduledNotifications,
  requestNotificationPermission,
  saveNotificationPermissionStatus,
  scheduleNotifications,
  K_NOTIFY,
} from "@/lib/notifications";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

const CARD =
  "rounded-2xl border border-[rgba(201,168,76,0.18)] bg-[#111111] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.55)] sm:p-5";

const BTN_ROW =
  "kai-btn-shimmer flex min-h-[44px] w-full items-center justify-center rounded-xl border border-[rgba(201,168,76,0.32)] bg-black px-4 py-3 text-left text-sm font-medium text-[#E8DCC8] transition hover:border-[rgba(201,168,76,0.5)] hover:text-[#F5F0E8]";

const GOLD_CTA =
  "kai-btn-shimmer flex min-h-[48px] w-full items-center justify-center rounded-xl border border-[rgba(201,168,76,0.45)] bg-gradient-to-br from-[#C9A84C] to-[#F5E6B3] text-sm font-semibold text-black/90";

const K_USER = KAI_LS_USER_NAME;
const K_EMAIL = "kaiUserEmail";
const K_SOUND = "kaiPrefsSound";
const K_REMINDER = "kaiDailyReminderTime";
const KAI_APP_RATING_KEY = "kaiAppRating";

const CONTACT_US_MAILTO =
  `mailto:contactkai26@gmail.com?subject=${encodeURIComponent("KAI App Support")}&body=${encodeURIComponent("Hi KAI Support Team,\n\n")}`;

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

function googleDisplayName(metadata: unknown): string | null {
  if (!metadata || typeof metadata !== "object") return null;
  const m = metadata as Record<string, unknown>;
  for (const k of ["full_name", "name"] as const) {
    const v = m[k];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return null;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [habitTitle, setHabitTitle] = useState<string | null>(null);
  const [points, setPoints] = useState(0);
  const [goals, setGoals] = useState<UserGoal[]>([]);
  const [streakUi, setStreakUi] = useState(0);
  const [longestUi, setLongestUi] = useState(0);
  const [notificationsOn, setNotificationsOn] = useState(true);
  const [soundOn, setSoundOn] = useState(true);
  const [reminderTime, setReminderTime] = useState("09:00");
  const [emailDisplay, setEmailDisplay] = useState("");

  const [nameEditing, setNameEditing] = useState(false);
  const [nameFieldDraft, setNameFieldDraft] = useState("");
  const [nameSavedFlash, setNameSavedFlash] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const [timeModal, setTimeModal] = useState(false);
  const [timeDraft, setTimeDraft] = useState("");
  const [goalModal, setGoalModal] = useState<null | { mode: "add" } | { mode: "edit"; id: string; text: string }>(null);
  const [goalDraft, setGoalDraft] = useState("");
  const [savedAppRating, setSavedAppRating] = useState(0);
  const [shareCopied, setShareCopied] = useState(false);
  const [earnedBadges, setEarnedBadges] = useState<Set<BadgeId>>(new Set());
  const shareToastTimer = useRef<number | null>(null);

  const refreshLocal = useCallback(() => {
    checkAndAwardBadges();
    setEarnedBadges(new Set(loadEarnedBadges()));
    setPoints(getTotalPoints());
    setGoals(loadUserGoals());
    ensureStreakProcessed();
    setStreakUi(getConsecutiveCheckinStreak());
    setLongestUi(getLongestStreak());
    setUserName(getStoredUserName() || null);
    try {
      const raw = getStoredHabitProfile();
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
    const r = parseInt(localStorage.getItem(KAI_APP_RATING_KEY) ?? "0", 10);
    setSavedAppRating(r >= 1 && r <= 5 ? r : 0);
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      saveNotificationPermissionStatus();
    });
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      setMounted(true);
      refreshLocal();
    });
    const onEarn = () => refreshLocal();
    window.addEventListener("kai-points-earned", onEarn);
    const onStreak = () => refreshLocal();
    window.addEventListener("kai-streak-updated", onStreak);
    return () => {
      window.removeEventListener("kai-points-earned", onEarn);
      window.removeEventListener("kai-streak-updated", onStreak);
    };
  }, [refreshLocal]);

  useEffect(() => {
    if (!mounted || typeof window === "undefined") return;
    const scrollToHash = () => {
      const id = window.location.hash?.replace(/^#/, "").trim();
      if (!id) return;
      document.getElementById(id)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    };
    queueMicrotask(scrollToHash);
    window.addEventListener("hashchange", scrollToHash);
    return () => window.removeEventListener("hashchange", scrollToHash);
  }, [mounted]);

  useEffect(() => {
    return () => {
      if (shareToastTimer.current) window.clearTimeout(shareToastTimer.current);
    };
  }, []);

  const streak = streakUi;
  const checkins = getTotalCheckins();
  const gamesN = getGamesPlayedTotal();
  const quizDone = habitQuizProfileSaved();

  const persistSound = (on: boolean) => {
    localStorage.setItem(K_SOUND, on ? "1" : "0");
    setSoundOn(on);
  };

  const persistNotify = useCallback(async (on: boolean) => {
    if (on) {
      const p = await requestNotificationPermission();
      saveNotificationPermissionStatus();
      if (p === "granted") {
        localStorage.setItem(K_NOTIFY, "1");
        setNotificationsOn(true);
        scheduleNotifications();
      } else {
        localStorage.setItem(K_NOTIFY, "0");
        setNotificationsOn(false);
      }
    } else {
      localStorage.setItem(K_NOTIFY, "0");
      setNotificationsOn(false);
      cancelScheduledNotifications();
    }
  }, []);

  const persistReminder = (t: string) => {
    localStorage.setItem(K_REMINDER, t);
    setReminderTime(t);
  };

  const openNameEdit = useCallback(() => {
    const gn = user ? googleDisplayName(user.user_metadata) : null;
    setNameFieldDraft((userName?.trim() || gn || "").trim());
    setNameEditing(true);
  }, [user, userName]);

  const saveInlineName = useCallback(async () => {
    const t = nameFieldDraft.trim();
    if (!t) {
      setNameEditing(false);
      return;
    }
    setStoredUserName(t);
    setUserName(t);
    if (user && isSupabaseConfigured) {
      try {
        await supabase.auth.updateUser({ data: { full_name: t } });
      } catch {
        /* ignore */
      }
    }
    setNameEditing(false);
    setNameSavedFlash(true);
    window.setTimeout(() => setNameSavedFlash(false), 2000);
  }, [nameFieldDraft, user]);

  useEffect(() => {
    if (!nameEditing) return;
    const id = requestAnimationFrame(() => nameInputRef.current?.focus());
    return () => cancelAnimationFrame(id);
  }, [nameEditing]);

  const submitTime = (e: FormEvent) => {
    e.preventDefault();
    const t = timeDraft.trim();
    if (t) {
      setStoredCheckInTime(t);
      localStorage.removeItem("checkinTime");
    }
    setTimeModal(false);
  };

  const submitGoal = (e: FormEvent) => {
    e.preventDefault();
    const t = goalDraft.trim();
    if (!t) return;
    if (!goalModal) return;
    if (goalModal.mode === "add") {
      const d = new Date();
      d.setDate(d.getDate() + 90);
      const y = d.getFullYear();
      const mo = String(d.getMonth() + 1).padStart(2, "0");
      const da = String(d.getDate()).padStart(2, "0");
      addUserGoal({
        title: t,
        targetDate: `${y}-${mo}-${da}`,
        category: "work",
        milestones: ["Milestone 1", "Milestone 2", "Milestone 3"],
      });
    } else {
      updateUserGoalTitle(goalModal.id, t);
    }
    setGoals(loadUserGoals());
    setGoalModal(null);
    setGoalDraft("");
  };

  const persistAppRating = useCallback((n: number) => {
    localStorage.setItem(KAI_APP_RATING_KEY, String(n));
    setSavedAppRating(n);
  }, []);

  const handleShareKai = useCallback(() => {
    const origin =
      typeof window !== "undefined" ? window.location.origin : "";
    const text = `I've been using KAI — an AI accountability coach that checks in with you every morning and actually pushes you to follow through. Try it: ${origin}`;
    void navigator.clipboard
      .writeText(text)
      .then(() => {
        if (shareToastTimer.current)
          window.clearTimeout(shareToastTimer.current);
        setShareCopied(true);
        const id = window.setTimeout(() => {
          setShareCopied(false);
          shareToastTimer.current = null;
        }, 4000);
        shareToastTimer.current = id;
      })
      .catch(() => {});
  }, []);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      /* ignore */
    }
    router.replace("/login");
  };

  const googleName = user ? googleDisplayName(user.user_metadata) : null;
  const profileDisplayName = user
    ? googleName || userName?.trim() || "KAI User"
    : userName?.trim() || null;

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

      <main className="mx-auto w-full max-w-lg flex-1 space-y-5 px-4 pb-10 pt-0 max-md:pb-[calc(80px+env(safe-area-inset-bottom,0px))] max-md:text-[15px]">
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
          <div className="mt-4 flex min-h-[3rem] flex-wrap items-center justify-center gap-2">
            {!nameEditing ? (
              <>
                {profileDisplayName ? (
                  <span className="kai-heading kai-plain-display text-3xl font-semibold tracking-[0.04em] text-[#F5F0E8] sm:text-4xl">
                    {profileDisplayName}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={openNameEdit}
                    className="kai-plain-display text-xl font-medium text-[#E8DCC8]/50 transition hover:text-[#E8DCC8]"
                  >
                    Set your name
                  </button>
                )}
                {(profileDisplayName || user) && (
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={openNameEdit}
                    className="cursor-pointer text-lg text-[#C9A84C] transition hover:text-[#F5E6B3]"
                    aria-label="Edit name"
                  >
                    ✏️
                  </button>
                )}
                {user && (
                  <span className="inline-flex items-center rounded-full border border-emerald-500/45 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400/95">
                    ✅ Synced
                  </span>
                )}
              </>
            ) : (
              <div className="flex w-full max-w-sm flex-col items-center gap-2">
                <input
                  ref={nameInputRef}
                  type="text"
                  value={nameFieldDraft}
                  onChange={(e) => setNameFieldDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void saveInlineName();
                  }}
                  onBlur={() => {
                    void saveInlineName();
                  }}
                  className="min-h-[44px] w-full rounded-xl border border-[rgba(201,168,76,0.35)] bg-black px-4 py-3 text-center text-lg text-[#F5F0E8] focus:border-[rgba(201,168,76,0.55)] focus:outline-none"
                  placeholder="Your name"
                  aria-label="Your name"
                />
                {nameSavedFlash && (
                  <span className="text-sm font-medium text-[#C9A84C]" role="status">
                    Saved ✓
                  </span>
                )}
              </div>
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

        <LevelProgressCard />
        <BadgesGrid earned={earnedBadges} />

        <section id="account" className={`${CARD} scroll-mt-24`}>
          <h2 className="kai-heading mb-3 text-sm font-semibold tracking-[0.08em] text-[#F5F0E8]">
            Account
          </h2>
          <div className="space-y-2">
            <button
              type="button"
              className={BTN_ROW}
              onClick={() => {
                setTimeDraft(getStoredCheckInTime() || "7am");
                setTimeModal(true);
              }}
            >
              Change check-in time
            </button>
            <div className="rounded-xl border border-[rgba(201,168,76,0.2)] bg-black px-4 py-3">
              <div className="flex min-h-[44px] items-center justify-between gap-3">
                <span className="text-sm text-[#E8DCC8]">Smart nudges</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={notificationsOn}
                  onClick={() => {
                    void persistNotify(!notificationsOn);
                  }}
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
              <p className="mt-2 text-sm italic leading-snug text-[#C9A84C]/85">
                e.g. Your future self is watching. Don&apos;t let them down. 💪
              </p>
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
                    <span className="font-medium">{g.title}</span>
                    <span className="ml-2 tabular-nums text-[#C9A84C]/90">
                      {g.progressPercent}%
                    </span>
                  </span>
                  <button
                    type="button"
                    className="shrink-0 rounded-lg border border-[rgba(201,168,76,0.25)] px-3 py-2 text-xs font-medium text-[#E8DCC8]/80"
                    onClick={() => {
                      markGoalAchieved(g.id);
                      setGoals(loadUserGoals());
                      checkAndAwardBadges();
                      setEarnedBadges(new Set(loadEarnedBadges()));
                    }}
                  >
                    Done
                  </button>
                  <button
                    type="button"
                    className="shrink-0 rounded-lg border border-[rgba(201,168,76,0.35)] px-3 py-2 text-xs font-medium text-[#C9A84C]"
                    onClick={() => {
                      setGoalModal({ mode: "edit", id: g.id, text: g.title });
                      setGoalDraft(g.title);
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
              <span>Best streak</span>
              <span className="font-semibold tabular-nums text-[#C9A84C]">
                {longestUi} days
              </span>
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

        <section id="support" className={`${CARD} scroll-mt-24`}>
          <h2 className="kai-heading mb-3 text-sm font-semibold tracking-[0.08em] text-[#F5F0E8]">
            Support
          </h2>
          <div className="space-y-2">
            <Link
              href="/about"
              className={`${BTN_ROW} !justify-center`}
            >
              About KAI
            </Link>
            <a href={CONTACT_US_MAILTO} className={`${BTN_ROW} !justify-center`}>
              Contact us
            </a>
            <div className="rounded-xl border border-[rgba(201,168,76,0.2)] bg-black/50 px-3 py-3">
              <p className="mb-2 text-center text-xs font-semibold uppercase tracking-[0.12em] text-[#C9A84C]/90">
                Rate the app
              </p>
              <div
                className="flex justify-center gap-0.5 sm:gap-1"
                role="group"
                aria-label="Rate KAI from 1 to 5 stars"
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    className="min-h-[48px] min-w-[44px] text-3xl leading-none text-[#C9A84C] drop-shadow-[0_0_12px_rgba(201,168,76,0.35)] transition hover:scale-110 active:scale-95"
                    aria-label={`${n} star${n === 1 ? "" : "s"}`}
                    onClick={() => persistAppRating(n)}
                  >
                    {n <= savedAppRating ? "★" : "☆"}
                  </button>
                ))}
              </div>
              {savedAppRating > 0 && (
                <p
                  className="mt-2 text-center text-sm font-medium text-[#C9A84C]"
                  role="status"
                >
                  Thanks for rating KAI ⭐
                </p>
              )}
            </div>
            <button
              type="button"
              className={BTN_ROW}
              onClick={() => void handleShareKai()}
            >
              Share KAI
            </button>
            {shareCopied && (
              <p
                className="text-center text-sm font-medium text-[#C9A84C]"
                role="status"
              >
                Link copied! Share it anywhere 🚀
              </p>
            )}
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
                  removeUserGoal(goalModal.id);
                  setGoals(loadUserGoals());
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
