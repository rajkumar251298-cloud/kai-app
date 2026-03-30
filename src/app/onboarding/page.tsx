"use client";

import { Header } from "@/components/Header";
import {
  KAI_LS_CHECK_IN_TIME,
  KAI_LS_USER_GOAL,
  KAI_LS_USER_NAME,
  getStoredUserName,
  setStoredCheckInTime,
  setStoredUserName,
} from "@/lib/kaiLocalProfile";
import { addUserGoal } from "@/lib/goalSystem";
import {
  setStoredUserAgeGroup,
  setStoredUserGoalType,
} from "@/lib/kaiPersona";
import {
  LS_KAI_PERSONA,
  LS_USER_GENDER,
  PERSONA_OPTIONS,
  type KaiPersonaId,
  type UserGenderPref,
} from "@/lib/kaiRelationshipPersona";
import Link from "next/link";
import {
  FormEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  KAI_TEXTAREA_MAX_PX,
  scrollInputIntoView,
  useAutoGrowTextarea,
} from "@/components/AutoGrowChatInput";

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

const STORAGE_KEYS = {
  userName: KAI_LS_USER_NAME,
  userGoal: KAI_LS_USER_GOAL,
  checkInTime: KAI_LS_CHECK_IN_TIME,
  ninetyDayVision: "ninetyDayVision",
  blockerPattern: "blockerPattern",
} as const;

const INTRO_1 = "Hey! I'm KAI 👋";
const INTRO_2 =
  "I'm your personal accountability coach — think of me as that friend who actually checks in on you every day and genuinely cares whether you win.";
const INTRO_3 = "Before we get started — what's your name?";

const MSG_6 =
  "I love that. Here's what I want you to know — I'm not going to judge you, lecture you, or make you feel bad on hard days. I'm just going to show up every morning and ask how it's going. That's it. Simple. Now — if things actually went right over the next 90 days, what would be different in your life?";

const MSG_7 =
  "That's a real goal. I can work with that. One more thing — what usually gets in the way when you're trying to follow through? Be honest, no judgement.";

const MSG_8 =
  "Totally normal — almost everyone says something similar. The good news? That's exactly what I'm here for. What time works for your daily check-in? I'll show up right on time, every day.";

function msg9(timeLabel: string, name: string) {
  return `Perfect. I'll be here at ${timeLabel} every day.\n${name} — I want you to know something. Most people download apps like this and never really use them. I don't think you're most people — otherwise you wouldn't have made it this far.\nLet's show up for each other. Starting tomorrow morning. 😊⚡`;
}

type SelfId =
  | "student"
  | "professional"
  | "builder"
  | "health"
  | "personal"
  | "starting";

const SELF_OPTIONS: {
  id: SelfId;
  emoji: string;
  label: string;
  age: string;
  goalType: string;
}[] = [
  {
    id: "student",
    emoji: "🎓",
    label: "Student grinding for goals",
    age: "student",
    goalType: "study",
  },
  {
    id: "professional",
    emoji: "💼",
    label: "Professional levelling up",
    age: "early_career",
    goalType: "career",
  },
  {
    id: "builder",
    emoji: "🚀",
    label: "Building my own thing",
    age: "building",
    goalType: "startup",
  },
  {
    id: "health",
    emoji: "🏋️",
    label: "Working on my health",
    age: "early_career",
    goalType: "health",
  },
  {
    id: "personal",
    emoji: "🎯",
    label: "Chasing a big personal goal",
    age: "early_career",
    goalType: "career",
  },
  {
    id: "starting",
    emoji: "🌱",
    label: "Just starting my journey",
    age: "early_career",
    goalType: "career",
  },
];

const MSG_5_BY_SELF: Record<SelfId, string> = {
  student: `A student with drive — I love that. The habits you build now will define your entire career. Let's make them count. What's the one goal that matters most to you right now — your studies, a skill, or something else?`,
  professional: `A professional ready to level up — that takes guts. Most people just coast along. Not you. What's the one area you most want to grow in right now?`,
  builder: `A builder! This is my favourite kind of person to coach. You're creating something from nothing — that takes real courage. What are you building? One sentence is enough.`,
  health: `Health goals are the foundation of everything else. When you feel good, you do good. What does your health goal look like? More energy? Fitness? Better habits?`,
  personal: `A big personal goal — now we're talking. These are the ones that actually change your life when you hit them. What's the goal? Don't hold back.`,
  starting: `Everyone starts somewhere — and the fact that you're here means you're already ahead of most people. What made you decide to start today? What do you want to change?`,
};

type ChatRole = "kai" | "user";

type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
};

type Phase =
  | "intro"
  | "wait_name"
  | "wait_self_pick"
  | "wait_persona"
  | "wait_gender"
  | "wait_goal_text"
  | "wait_vision"
  | "wait_blocker"
  | "wait_time"
  | "done";

function newId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export default function OnboardingPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [phase, setPhase] = useState<Phase>("intro");
  const [isKaiTyping, setIsKaiTyping] = useState(true);
  const [input, setInput] = useState("");
  const [userFirstName, setUserFirstName] = useState("");
  const [selectedSelfId, setSelectedSelfId] = useState<SelfId | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const onTextareaInput = useAutoGrowTextarea();

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, []);

  useLayoutEffect(() => {
    scrollToBottom();
  }, [messages, isKaiTyping, phase, scrollToBottom]);

  useEffect(() => {
    let cancelled = false;

    async function runIntro() {
      setIsKaiTyping(true);
      await delay(300);
      if (cancelled) return;
      setMessages([{ id: newId(), role: "kai", content: INTRO_1 }]);
      setIsKaiTyping(false);
      await delay(900);
      if (cancelled) return;
      setMessages((prev) => [
        ...prev,
        { id: newId(), role: "kai", content: INTRO_2 },
      ]);
      await delay(1200);
      if (cancelled) return;
      setMessages((prev) => [
        ...prev,
        { id: newId(), role: "kai", content: INTRO_3 },
      ]);
      setPhase("wait_name");
    }

    void runIntro();
    return () => {
      cancelled = true;
    };
  }, []);

  const pushKai = useCallback(async (content: string) => {
    setIsKaiTyping(true);
    await delay(600);
    setMessages((prev) => [...prev, { id: newId(), role: "kai", content }]);
    setIsKaiTyping(false);
  }, []);

  const pushUser = useCallback((content: string) => {
    setMessages((prev) => [...prev, { id: newId(), role: "user", content }]);
  }, []);

  const handleSend = async (e?: FormEvent) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text || isKaiTyping) return;

    if (phase === "wait_name") {
      setInput("");
      queueMicrotask(() => {
        const el = textareaRef.current;
        if (el) {
          el.style.height = "auto";
          el.style.overflow = "hidden";
        }
      });
      pushUser(text);
      if (typeof window !== "undefined") {
        setStoredUserName(text);
      }
      setUserFirstName(text);
      setPhase("wait_self_pick");
      await pushKai(
        `Love that name, ${text} 😊 Tell me about yourself in one line — what best describes you right now?`,
      );
      return;
    }

    if (phase === "wait_goal_text") {
      setInput("");
      pushUser(text);
      if (typeof window !== "undefined") {
        localStorage.removeItem("mainGoal");
        const d = new Date();
        d.setDate(d.getDate() + 90);
        const y = d.getFullYear();
        const mo = String(d.getMonth() + 1).padStart(2, "0");
        const da = String(d.getDate()).padStart(2, "0");
        addUserGoal({
          title: text,
          targetDate: `${y}-${mo}-${da}`,
          category: "work",
          milestones: ["Checkpoint 1", "Checkpoint 2", "Checkpoint 3"],
        });
      }
      setPhase("wait_vision");
      await pushKai(MSG_6);
      return;
    }

    if (phase === "wait_vision") {
      setInput("");
      queueMicrotask(() => {
        const el = textareaRef.current;
        if (el) {
          el.style.height = "auto";
          el.style.overflow = "hidden";
        }
      });
      pushUser(text);
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEYS.ninetyDayVision, text);
      }
      setPhase("wait_blocker");
      await pushKai(MSG_7);
      return;
    }

    if (phase === "wait_blocker") {
      setInput("");
      queueMicrotask(() => {
        const el = textareaRef.current;
        if (el) {
          el.style.height = "auto";
          el.style.overflow = "hidden";
        }
      });
      pushUser(text);
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEYS.blockerPattern, text);
      }
      setPhase("wait_time");
      await pushKai(MSG_8);
      return;
    }
  };

  const finishWithTime = async (timeLabel: string) => {
    if (isKaiTyping || phase !== "wait_time") return;
    pushUser(timeLabel);
    if (typeof window !== "undefined") {
      setStoredCheckInTime(timeLabel);
      localStorage.removeItem("checkinTime");
    }
    const name =
      userFirstName.trim() ||
      (typeof window !== "undefined" ? getStoredUserName() || "friend" : "friend");
    await pushKai(msg9(timeLabel, name));
    setPhase("done");
  };

  const pickSelf = async (opt: (typeof SELF_OPTIONS)[number]) => {
    if (phase !== "wait_self_pick" || isKaiTyping) return;
    pushUser(`${opt.emoji} ${opt.label}`);
    if (typeof window !== "undefined") {
      setStoredUserAgeGroup(opt.age);
      setStoredUserGoalType(opt.goalType);
    }
    setSelectedSelfId(opt.id);
    setPhase("wait_persona");
    const who = userFirstName.trim() || "there";
    await pushKai(
      `One more thing ${who} — everyone responds differently to support. How would you like me to show up for you on hard days?`,
    );
  };

  const pickPersona = async (id: KaiPersonaId) => {
    if (phase !== "wait_persona" || isKaiTyping) return;
    const opt = PERSONA_OPTIONS.find((o) => o.id === id);
    pushUser(opt ? `${opt.emoji} ${opt.title}` : id);
    if (typeof window !== "undefined") {
      localStorage.setItem(LS_KAI_PERSONA, id);
    }
    setPhase("wait_gender");
    await pushKai(
      `One tiny thing — just so I can talk to you naturally — how do you identify?`,
    );
  };

  const pickGender = async (g: UserGenderPref) => {
    if (phase !== "wait_gender" || isKaiTyping) return;
    const labels: Record<UserGenderPref, string> = {
      male: "He / Him",
      female: "She / Her",
      neutral: "They / Them or prefer not to say",
    };
    pushUser(labels[g]);
    if (typeof window !== "undefined") {
      localStorage.setItem(LS_USER_GENDER, g);
    }
    const sid = selectedSelfId ?? "starting";
    setPhase("wait_goal_text");
    await pushKai(MSG_5_BY_SELF[sid]);
  };

  const showTextInput =
    phase === "wait_name" ||
    phase === "wait_goal_text" ||
    phase === "wait_vision" ||
    phase === "wait_blocker";

  const timeOptions = [
    "6am",
    "7am",
    "8am",
    "9am",
    "10am",
    "Evening",
  ] as const;

  return (
    <div
      className="flex min-h-screen flex-col bg-black max-md:pb-[calc(80px+env(safe-area-inset-bottom,0px))] max-md:text-[15px]"
      style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}
    >
      <Header />
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col overflow-hidden">
        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
          {messages.map((m) =>
            m.role === "kai" ? (
              <KaiBubble key={m.id} content={m.content} />
            ) : (
              <UserBubble key={m.id} content={m.content} />
            ),
          )}

          {isKaiTyping && <TypingRow />}

          {phase === "wait_self_pick" && !isKaiTyping && (
            <div className="kai-msg-animate grid max-w-lg grid-cols-2 gap-2 pt-1 pl-[52px] pr-2">
              {SELF_OPTIONS.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => void pickSelf(o)}
                  className="kai-btn-shimmer rounded-xl border border-[rgba(201,168,76,0.35)] bg-black px-3 py-3 text-left text-sm font-medium leading-snug text-[#E8DCC8] transition hover:border-[rgba(201,168,76,0.55)]"
                >
                  {o.emoji} {o.label}
                </button>
              ))}
            </div>
          )}

          {phase === "wait_persona" && !isKaiTyping && (
            <div className="kai-msg-animate grid max-w-lg grid-cols-1 gap-2 pt-1 pl-[52px] pr-2 sm:grid-cols-2">
              {PERSONA_OPTIONS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => void pickPersona(p.id)}
                  className="kai-btn-shimmer flex flex-col items-start gap-1 rounded-xl border border-[rgba(201,168,76,0.35)] bg-black px-3 py-3 text-left transition hover:border-[rgba(201,168,76,0.55)]"
                >
                  <span className="text-base font-semibold text-[#F5F0E8]">
                    {p.emoji} {p.title}
                  </span>
                  <span className="text-xs leading-snug text-[#E8DCC8]/75">
                    {p.description}
                  </span>
                </button>
              ))}
            </div>
          )}

          {phase === "wait_gender" && !isKaiTyping && (
            <div className="kai-msg-animate flex max-w-lg flex-col gap-2 pt-1 pl-[52px] pr-2">
              {(
                [
                  ["male", "He / Him"],
                  ["female", "She / Her"],
                  [
                    "neutral",
                    "They / Them or prefer not to say",
                  ],
                ] as const
              ).map(([g, label]) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => void pickGender(g)}
                  className="kai-btn-shimmer rounded-xl border border-[rgba(201,168,76,0.35)] bg-black px-4 py-3 text-left text-sm font-medium text-[#E8DCC8] transition hover:border-[rgba(201,168,76,0.55)]"
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          {phase === "wait_time" && !isKaiTyping && (
            <div className="kai-msg-animate pt-1 pl-[52px]">
              <div className="flex max-w-full flex-wrap gap-2">
                {timeOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => void finishWithTime(opt)}
                    className="kai-btn-shimmer rounded-full border border-[rgba(201,168,76,0.35)] bg-black px-4 py-2.5 text-sm font-medium text-[#C9A84C] transition hover:border-[rgba(201,168,76,0.55)] hover:bg-[#111111]"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {phase === "done" && (
            <div className="kai-msg-animate flex justify-center pt-4">
              <Link
                href="/"
                className="kai-btn-shimmer inline-flex items-center gap-2 rounded-full border border-[rgba(201,168,76,0.4)] bg-gradient-to-br from-[#C9A84C] to-[#F5E6B3] px-8 py-3 text-base font-semibold text-black/90 hover:opacity-95"
              >
                I&apos;m ready →
              </Link>
            </div>
          )}

          <div ref={bottomRef} className="h-px w-full shrink-0" aria-hidden />
        </div>

        {showTextInput && (
          <form
            onSubmit={handleSend}
            className="shrink-0 border-t border-[rgba(201,168,76,0.12)] bg-black/95 p-4 backdrop-blur-md"
          >
            <div className="mx-auto flex max-w-2xl items-end gap-2">
              <textarea
                ref={textareaRef}
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onInput={(e) => {
                  onTextareaInput(e);
                }}
                onFocus={() => scrollInputIntoView(textareaRef)}
                placeholder="Type your answer..."
                disabled={isKaiTyping}
                style={{
                  resize: "none",
                  maxHeight: KAI_TEXTAREA_MAX_PX,
                  overflow: "hidden",
                }}
                className="min-h-[44px] flex-1 rounded-xl border border-[rgba(201,168,76,0.28)] bg-[#111111] px-4 py-2.5 text-[15px] leading-relaxed text-[#F5F0E8] placeholder:text-[#E8DCC8]/35 focus:border-[rgba(201,168,76,0.5)] focus:outline-none focus:ring-2 focus:ring-[rgba(201,168,76,0.15)] disabled:opacity-50"
                autoComplete="off"
              />
              <button
                type="submit"
                disabled={!input.trim() || isKaiTyping}
                className="kai-btn-shimmer shrink-0 rounded-xl border border-[rgba(201,168,76,0.4)] bg-gradient-to-br from-[#C9A84C] to-[#F5E6B3] px-5 py-2.5 text-sm font-semibold text-black/90 hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Send
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function KaiBubble({ content }: { content: string }) {
  return (
    <div className="kai-msg-animate flex gap-3">
      <div
        className="kai-icon flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[rgba(201,168,76,0.15)] bg-[#111111] text-base leading-none shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
        aria-hidden
      >
        ⚡
      </div>
      <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-tl-sm border border-[rgba(201,168,76,0.15)] border-l-[3px] border-l-[#C9A84C] bg-[#111111] px-4 py-3 text-[15px] leading-relaxed text-[#E8DCC8] shadow-[0_10px_30px_rgba(0,0,0,0.6)]">
        {content}
      </div>
    </div>
  );
}

function UserBubble({ content }: { content: string }) {
  return (
    <div className="kai-msg-animate flex justify-end">
      <div className="max-w-[85%] rounded-2xl rounded-tr-sm border border-[rgba(201,168,76,0.25)] bg-gradient-to-br from-[#C9A84C] to-[#F5E6B3] px-4 py-3 text-[15px] leading-relaxed text-black/90">
        {content}
      </div>
    </div>
  );
}

function TypingRow() {
  return (
    <div className="flex gap-3">
      <div
        className="kai-icon flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[rgba(201,168,76,0.15)] bg-[#111111] text-base leading-none opacity-90"
        aria-hidden
      >
        ⚡
      </div>
      <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm border border-[rgba(201,168,76,0.15)] bg-[#111111] px-4 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.6)]">
        <span className="kai-typing-dot inline-block h-2 w-2 rounded-full bg-[#C9A84C]" />
        <span className="kai-typing-dot inline-block h-2 w-2 rounded-full bg-[#C9A84C]" />
        <span className="kai-typing-dot inline-block h-2 w-2 rounded-full bg-[#C9A84C]" />
      </div>
    </div>
  );
}
