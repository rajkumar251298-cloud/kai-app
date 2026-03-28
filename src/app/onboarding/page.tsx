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
      className="flex min-h-screen flex-col bg-[#0D0D1A]"
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
                        className="rounded-full border border-[#7C3AED]/40 bg-[#1a1025] px-4 py-2.5 text-sm font-medium text-white transition hover:border-[#7C3AED] hover:bg-[#7C3AED]/10"
                      >
                        Other
                      </button>
                    ) : (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleTimePick(opt)}
                        className="rounded-full border border-[#7C3AED]/40 bg-[#1a1025] px-4 py-2.5 text-sm font-medium text-white transition hover:border-[#7C3AED] hover:bg-[#7C3AED]/10"
                      >
                        {opt}
                      </button>
                    ),
                  )}
                </div>
              ) : (
                <div className="flex max-w-sm flex-col gap-2 rounded-2xl border border-[#7C3AED]/40 bg-[#1a1025] p-3">
                  <input
                    type="text"
                    value={otherTimeDraft}
                    onChange={(e) => setOtherTimeDraft(e.target.value)}
                    placeholder="What time works for you?"
                    className="w-full rounded-lg border border-white/10 bg-[#0D0D1A] px-3 py-2 text-sm text-white placeholder:text-white/35 focus:border-[#7C3AED] focus:outline-none"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setOtherTimeOpen(false);
                        setOtherTimeDraft("");
                      }}
                      className="rounded-lg px-3 py-1.5 text-sm text-white/60 hover:text-white"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleOtherTimeConfirm}
                      className="ml-auto rounded-lg bg-[#7C3AED] px-4 py-1.5 text-sm font-medium text-white hover:bg-[#6d28d9]"
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
                className="inline-flex items-center gap-2 rounded-full bg-[#7C3AED] px-8 py-3 text-base font-semibold text-white transition hover:bg-[#6d28d9]"
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
            className="shrink-0 border-t border-white/[0.06] bg-[#0D0D1A]/95 p-4 backdrop-blur-md"
          >
            <div className="mx-auto flex max-w-2xl gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message…"
                disabled={isKaiTyping}
                className="min-h-11 flex-1 rounded-xl border border-[#7C3AED]/60 bg-[#12121C] px-4 py-2.5 text-[15px] text-white placeholder:text-white/35 focus:border-[#7C3AED] focus:outline-none focus:ring-1 focus:ring-[#7C3AED]/40 disabled:opacity-50"
                autoComplete="off"
              />
              <button
                type="submit"
                disabled={!input.trim() || isKaiTyping}
                className="shrink-0 rounded-xl bg-[#7C3AED] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#6d28d9] disabled:cursor-not-allowed disabled:opacity-40"
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
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#7C3AED] to-[#EC4899] text-base leading-none shadow-sm"
        aria-hidden
      >
        ⚡
      </div>
      <div className="max-w-[85%] rounded-2xl rounded-tl-sm border border-white/[0.06] bg-white/[0.04] px-4 py-3 text-[15px] leading-relaxed text-white/95">
        {content}
      </div>
    </div>
  );
}

function UserBubble({ content }: { content: string }) {
  return (
    <div className="kai-msg-animate flex justify-end">
      <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-[#7C3AED] px-4 py-3 text-[15px] leading-relaxed text-white">
        {content}
      </div>
    </div>
  );
}

function TypingRow() {
  return (
    <div className="flex gap-3">
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#7C3AED] to-[#EC4899] text-base leading-none opacity-90"
        aria-hidden
      >
        ⚡
      </div>
      <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm border border-white/[0.06] bg-white/[0.04] px-4 py-3">
        <span className="kai-typing-dot inline-block h-2 w-2 rounded-full bg-[#7C3AED]" />
        <span className="kai-typing-dot inline-block h-2 w-2 rounded-full bg-[#7C3AED]" />
        <span className="kai-typing-dot inline-block h-2 w-2 rounded-full bg-[#7C3AED]" />
      </div>
    </div>
  );
}
