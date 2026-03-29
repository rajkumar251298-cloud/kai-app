"use client";

import { Header } from "@/components/Header";
import Link from "next/link";
import {
  FormEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

const STORAGE_KEYS = {
  userName: "userName",
  mainGoal: "mainGoal",
  ninetyDayVision: "ninetyDayVision",
  blockerPattern: "blockerPattern",
  checkinTime: "checkinTime",
} as const;

const INTRO_MESSAGES = [
  "Hey. I'm KAI — your personal accountability coach.",
  "I'm not here to just track your tasks. I'm here to make sure you actually become the person you're trying to be.",
  "What's your name?",
] as const;

const MSG_5 =
  "If 90 days from now things actually went right, what would be different in your life?";

const MSG_6 =
  "When you've failed to follow through in the past, what usually got in the way? Be honest.";

const MSG_7 = "What time do you want me to show up every day?";

function msg4(name: string) {
  return `Good to meet you, ${name}. What's the one thing you keep saying you'll do but haven't yet?`;
}

function msg8(timeLabel: string) {
  return `Perfect. I'll be here at ${timeLabel}. Most people who use tools like this don't follow through. I don't think you're most people. See you tomorrow morning. Don't be late. 😏`;
}

type ChatRole = "kai" | "user";

type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
};

type Phase =
  | "intro"
  | "wait_name"
  | "wait_goal"
  | "wait_vision"
  | "wait_blocker"
  | "wait_time"
  | "ai_chat";

function newId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function toApiMessages(
  list: ChatMessage[],
): { role: "user" | "assistant"; content: string }[] {
  return list.map((m) => ({
    role: m.role === "kai" ? "assistant" : "user",
    content: m.content,
  }));
}

export default function OnboardingPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [phase, setPhase] = useState<Phase>("intro");
  const [isKaiTyping, setIsKaiTyping] = useState(true);
  const [input, setInput] = useState("");
  const [otherTimeOpen, setOtherTimeOpen] = useState(false);
  const [otherTimeDraft, setOtherTimeDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, []);

  useLayoutEffect(() => {
    scrollToBottom();
  }, [messages, isKaiTyping, phase, scrollToBottom]);

  useEffect(() => {
    let cancelled = false;

    async function runIntro() {
      for (let i = 0; i < INTRO_MESSAGES.length; i++) {
        setIsKaiTyping(true);
        await delay(900);
        if (cancelled) return;
        setMessages((prev) => [
          ...prev,
          { id: newId(), role: "kai", content: INTRO_MESSAGES[i] },
        ]);
        setIsKaiTyping(false);
      }
      if (cancelled) return;
      setPhase("wait_name");
    }

    runIntro();
    return () => {
      cancelled = true;
    };
  }, []);

  const pushKai = useCallback(async (content: string) => {
    setIsKaiTyping(true);
    await delay(900);
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
      pushUser(text);
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEYS.userName, text);
      }
      setPhase("wait_goal");
      await pushKai(msg4(text));
      return;
    }

    if (phase === "wait_goal") {
      setInput("");
      pushUser(text);
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEYS.mainGoal, text);
      }
      setPhase("wait_vision");
      await pushKai(MSG_5);
      return;
    }

    if (phase === "wait_vision") {
      setInput("");
      pushUser(text);
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEYS.ninetyDayVision, text);
      }
      setPhase("wait_blocker");
      await pushKai(MSG_6);
      return;
    }

    if (phase === "wait_blocker") {
      setInput("");
      pushUser(text);
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEYS.blockerPattern, text);
      }
      await pushKai(MSG_7);
      setPhase("wait_time");
      return;
    }

    if (phase === "ai_chat") {
      const userMsg: ChatMessage = {
        id: newId(),
        role: "user",
        content: text,
      };
      const nextMessages = [...messages, userMsg];
      setInput("");
      setMessages(nextMessages);
      setIsKaiTyping(true);

      const userName =
        typeof window !== "undefined"
          ? localStorage.getItem(STORAGE_KEYS.userName) ?? ""
          : "";
      const userGoal =
        typeof window !== "undefined"
          ? localStorage.getItem(STORAGE_KEYS.mainGoal) ?? ""
          : "";

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: toApiMessages(nextMessages),
            userName,
            userGoal,
            chatMode: "checkin",
          }),
        });
        const data: { reply?: string; error?: string } = await res.json();
        if (!res.ok) {
          throw new Error(data.error ?? "Request failed");
        }
        const reply = data.reply?.trim();
        if (!reply) {
          throw new Error("Empty reply from assistant");
        }
        setMessages((prev) => [
          ...prev,
          { id: newId(), role: "kai", content: reply },
        ]);
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Something went wrong.";
        setMessages((prev) => [
          ...prev,
          {
            id: newId(),
            role: "kai",
            content: `Sorry — I couldn’t reach KAI right now. (${msg})`,
          },
        ]);
      } finally {
        setIsKaiTyping(false);
      }
      return;
    }
  };

  const finishWithTime = async (timeLabel: string) => {
    if (isKaiTyping) return;
    pushUser(timeLabel);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.checkinTime, timeLabel);
    }
    setOtherTimeOpen(false);
    await pushKai(msg8(timeLabel));
    setPhase("ai_chat");
  };

  const handleTimePick = (label: string) => {
    if (phase !== "wait_time" || isKaiTyping) return;
    void finishWithTime(label);
  };

  const handleOtherTimeConfirm = () => {
    const t = otherTimeDraft.trim();
    if (!t || phase !== "wait_time" || isKaiTyping) return;
    void finishWithTime(t);
    setOtherTimeDraft("");
  };

  const showTextInput =
    phase === "wait_name" ||
    phase === "wait_goal" ||
    phase === "wait_vision" ||
    phase === "wait_blocker" ||
    phase === "ai_chat";

  const timeOptions = ["6am", "7am", "8am", "9am", "Other"] as const;

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

          {phase === "wait_time" && !isKaiTyping && (
            <div className="kai-msg-animate pt-1 pl-[52px]">
              {!otherTimeOpen ? (
                <div className="flex max-w-full flex-wrap gap-2">
                  {timeOptions.map((opt) =>
                    opt === "Other" ? (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setOtherTimeOpen(true)}
                        className="kai-btn-shimmer rounded-full border border-[rgba(201,168,76,0.35)] bg-black px-4 py-2.5 text-sm font-medium text-[#C9A84C] transition hover:border-[rgba(201,168,76,0.55)] hover:bg-[#111111]"
                      >
                        Other
                      </button>
                    ) : (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleTimePick(opt)}
                        className="kai-btn-shimmer rounded-full border border-[rgba(201,168,76,0.35)] bg-black px-4 py-2.5 text-sm font-medium text-[#C9A84C] transition hover:border-[rgba(201,168,76,0.55)] hover:bg-[#111111]"
                      >
                        {opt}
                      </button>
                    ),
                  )}
                </div>
              ) : (
                <div className="kai-card flex max-w-sm flex-col gap-2 p-3">
                  <input
                    type="text"
                    value={otherTimeDraft}
                    onChange={(e) => setOtherTimeDraft(e.target.value)}
                    placeholder="What time works for you?"
                    className="w-full rounded-lg border border-[rgba(201,168,76,0.2)] bg-black px-3 py-2 text-sm text-[#E8DCC8] placeholder:text-[#E8DCC8]/35 focus:border-[rgba(201,168,76,0.5)] focus:outline-none focus:ring-2 focus:ring-[rgba(201,168,76,0.12)]"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setOtherTimeOpen(false);
                        setOtherTimeDraft("");
                      }}
                      className="rounded-lg px-3 py-1.5 text-sm text-[#E8DCC8]/55 hover:text-[#F5F0E8]"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleOtherTimeConfirm}
                      className="kai-btn-shimmer ml-auto rounded-lg border border-[rgba(201,168,76,0.4)] bg-gradient-to-br from-[#C9A84C] to-[#F5E6B3] px-4 py-1.5 text-sm font-medium text-black/90 hover:opacity-95"
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {phase === "ai_chat" && (
            <div className="kai-msg-animate flex justify-center pt-4">
              <Link
                href="/"
                className="kai-btn-shimmer inline-flex items-center gap-2 rounded-full border border-[rgba(201,168,76,0.4)] bg-gradient-to-br from-[#C9A84C] to-[#F5E6B3] px-8 py-3 text-base font-semibold text-black/90 hover:opacity-95"
              >
                Let&apos;s go →
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
            <div className="mx-auto flex max-w-2xl gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message…"
                disabled={isKaiTyping}
                className="min-h-11 flex-1 rounded-xl border border-[rgba(201,168,76,0.28)] bg-[#111111] px-4 py-2.5 text-[15px] text-[#F5F0E8] placeholder:text-[#E8DCC8]/35 focus:border-[rgba(201,168,76,0.5)] focus:outline-none focus:ring-2 focus:ring-[rgba(201,168,76,0.15)] disabled:opacity-50"
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
      <div className="max-w-[85%] rounded-2xl rounded-tl-sm border border-[rgba(201,168,76,0.15)] border-l-[3px] border-l-[#C9A84C] bg-[#111111] px-4 py-3 text-[15px] leading-relaxed text-[#E8DCC8] shadow-[0_10px_30px_rgba(0,0,0,0.6)]">
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
