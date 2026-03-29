"use client";

import {
  KAI_LS_USER_NAME,
  getStoredUserGoal,
} from "@/lib/kaiLocalProfile";
import {
  buildCheckinOpening,
  DEFAULT_CHECKIN_OPENING,
} from "@/lib/kaiTodaysFocus";
import {
  memoryForApi,
  parseAndApplyKaiMemoryFromReply,
  readKaiMemory,
  stripKaiMachineLines,
} from "@/lib/kaiMemory";
import { todayKey, tryAwardDailyCheckin } from "@/lib/kaiPoints";
import { HomeBackLink } from "@/components/HomeBackLink";
import { useSearchParams } from "next/navigation";
import {
  FormEvent,
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type ChatMode = "checkin" | "stuck" | "plan" | "ideas";

type ChatMessage = {
  id: string;
  role: "kai" | "user";
  content: string;
};

const STORAGE_KEYS = {
  userName: KAI_LS_USER_NAME,
} as const;

const OPENINGS: Record<ChatMode, string> = {
  checkin: DEFAULT_CHECKIN_OPENING,
  stuck:
    "Got it — you're blocked. Describe exactly what you're stuck on. The more specific, the faster we solve it.",
  plan:
    "Let's review your week. What do you want me to focus on — gaps, risks, or priorities?",
  ideas:
    "What do you want to brainstorm? Give me the topic and any constraints.",
};

const BANNER: Record<
  ChatMode,
  { emoji: string; title: string; barClass: string }
> = {
  checkin: {
    emoji: "☀️",
    title: "Daily Check-in",
    barClass:
      "border-[rgba(201,168,76,0.2)] bg-[rgba(201,168,76,0.05)] text-[#F5F0E8]",
  },
  stuck: {
    emoji: "🧠",
    title: "I'm Stuck — Let's unblock you",
    barClass:
      "border-[rgba(201,168,76,0.18)] bg-[rgba(201,168,76,0.04)] text-[#F5F0E8]",
  },
  plan: {
    emoji: "🗺️",
    title: "Review My Plan",
    barClass:
      "border-[rgba(201,168,76,0.22)] bg-[rgba(201,168,76,0.06)] text-[#F5F0E8]",
  },
  ideas: {
    emoji: "💡",
    title: "Brainstorm Ideas",
    barClass:
      "border-[rgba(201,168,76,0.25)] bg-[rgba(201,168,76,0.07)] text-[#F5F0E8]",
  },
};

const INPUT_ACCENT =
  "border-[rgba(201,168,76,0.28)] focus:border-[rgba(201,168,76,0.5)] focus:ring-2 focus:ring-[rgba(201,168,76,0.15)]";

function parseMode(raw: string | null): ChatMode {
  const m = raw ?? "checkin";
  if (m === "checkin" || m === "stuck" || m === "plan" || m === "ideas") {
    return m;
  }
  return "checkin";
}

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

function StreamingKaiBubble({
  fullText,
  onComplete,
}: {
  fullText: string;
  onComplete: (full: string) => void;
}) {
  const visibleText = useMemo(
    () => stripKaiMachineLines(fullText),
    [fullText],
  );
  const tokens = useMemo(() => visibleText.split(/(\s+)/), [visibleText]);
  const [count, setCount] = useState(0);
  const finished = useRef(false);

  // Reset is handled by remounting when `fullText` changes (see key on parent).
  // Avoids a race between async setCount(0) and the typing effect.

  useEffect(() => {
    if (tokens.length === 0) {
      if (!finished.current) {
        finished.current = true;
        onComplete(fullText);
      }
      return;
    }
    if (count >= tokens.length) {
      if (!finished.current) {
        finished.current = true;
        onComplete(fullText);
      }
      return;
    }
    const id = window.setTimeout(() => setCount((c) => c + 1), 18);
    return () => window.clearTimeout(id);
  }, [count, tokens, tokens.length, fullText, onComplete]);

  const shown = tokens.slice(0, count).join("");
  return <KaiBubble content={shown} />;
}

function ChatInner() {
  const searchParams = useSearchParams();
  const mode = parseMode(searchParams.get("mode"));
  const topic = searchParams.get("topic")?.trim() ?? "";

  const [openingLine, setOpeningLine] = useState<string>(() => {
    if (mode === "ideas" && topic) {
      return `${OPENINGS.ideas}\n\n(Topic from home: ${topic})`;
    }
    if (mode === "checkin") return DEFAULT_CHECKIN_OPENING;
    return OPENINGS[mode];
  });

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isAwaitingApi, setIsAwaitingApi] = useState(false);
  const [streaming, setStreaming] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const checkinPointsAwarded = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined" || mode !== "plan") return;
    const k = `kaiPlanModeLogged_${todayKey()}`;
    if (localStorage.getItem(k)) return;
    localStorage.setItem(k, "1");
    const n =
      parseInt(localStorage.getItem("kaiPlanModeUsesTotal") || "0", 10) + 1;
    localStorage.setItem("kaiPlanModeUsesTotal", String(n));
  }, [mode]);

  useLayoutEffect(() => {
    if (mode === "ideas" && topic) {
      setOpeningLine(`${OPENINGS.ideas}\n\n(Topic from home: ${topic})`);
      return;
    }
    if (mode === "checkin") {
      setOpeningLine(buildCheckinOpening(readKaiMemory()));
      return;
    }
    setOpeningLine(OPENINGS[mode]);
  }, [mode, topic]);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, []);

  useLayoutEffect(() => {
    scrollToBottom();
  }, [messages, isAwaitingApi, streaming, scrollToBottom]);

  const onStreamComplete = useCallback((full: string) => {
    const { display } = parseAndApplyKaiMemoryFromReply(full);
    setMessages((prev) => [
      ...prev,
      { id: newId(), role: "kai", content: display },
    ]);
    setStreaming(null);
  }, []);

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || isAwaitingApi || streaming !== null) return;

    const userMsg: ChatMessage = {
      id: newId(),
      role: "user",
      content: text,
    };
    const nextThread = [...messages, userMsg];
    setMessages(nextThread);
    setInput("");
    setIsAwaitingApi(true);

    if (mode === "ideas" && typeof window !== "undefined") {
      const c =
        parseInt(localStorage.getItem("kaiBrainstormCount") || "0", 10) + 1;
      localStorage.setItem("kaiBrainstormCount", String(c));
    }

    const userName =
      typeof window !== "undefined"
        ? localStorage.getItem(STORAGE_KEYS.userName) ?? ""
        : "";
    const userGoal =
      typeof window !== "undefined" ? getStoredUserGoal() : "";

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: toApiMessages(nextThread),
          userName,
          userGoal,
          chatMode: mode,
          memory: memoryForApi(),
        }),
      });
      const data: { reply?: string; error?: string } = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Request failed");
      }
      const reply = data.reply?.trim();
      if (!reply) {
        throw new Error("Empty reply");
      }
      const pauseMs = 800 + Math.random() * 400;
      await new Promise((r) => window.setTimeout(r, pauseMs));
      setIsAwaitingApi(false);
      setStreaming(reply);
      if (mode === "checkin" && !checkinPointsAwarded.current) {
        checkinPointsAwarded.current = true;
        tryAwardDailyCheckin();
      }
    } catch (err) {
      setIsAwaitingApi(false);
      const msg = err instanceof Error ? err.message : "Error";
      setMessages((prev) => [
        ...prev,
        {
          id: newId(),
          role: "kai",
          content: `Sorry — something went wrong. (${msg})`,
        },
      ]);
    }
  };

  const banner = BANNER[mode];

  return (
    <div
      className="flex min-h-screen flex-col bg-black max-md:pb-[calc(80px+env(safe-area-inset-bottom,0px))] max-md:text-[15px]"
      style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}
    >
      <div
        className={`sticky top-0 z-20 border-b px-4 py-3 backdrop-blur-md ${banner.barClass} border`}
      >
        <div className="mx-auto flex max-w-lg flex-col gap-1">
          <HomeBackLink bare labelBack />
          <div className="flex min-w-0 items-center gap-2">
            <span className="text-lg" aria-hidden>
              {banner.emoji}
            </span>
            <span className="kai-heading min-w-0 flex-1 truncate text-sm font-semibold tracking-[0.05em] sm:text-[15px]">
              {banner.title}
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col overflow-hidden">
        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
          <KaiBubble content={openingLine} />

          {messages.map((m) =>
            m.role === "kai" ? (
              <KaiBubble key={m.id} content={m.content} />
            ) : (
              <UserBubble key={m.id} content={m.content} />
            ),
          )}

          {streaming !== null && (
            <StreamingKaiBubble
              key={streaming}
              fullText={streaming}
              onComplete={onStreamComplete}
            />
          )}

          {isAwaitingApi && <TypingRow />}

          <div ref={bottomRef} className="h-px shrink-0" aria-hidden />
        </div>

        <form
          onSubmit={handleSend}
          className="shrink-0 border-t border-[rgba(201,168,76,0.12)] bg-black/95 p-4 backdrop-blur-md"
        >
          <div className="mx-auto flex max-w-lg gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message KAI…"
              disabled={isAwaitingApi || streaming !== null}
              className={`min-h-11 flex-1 rounded-xl border bg-[#111111] px-4 py-2.5 text-[15px] text-[#F5F0E8] placeholder:text-[#E8DCC8]/35 focus:outline-none disabled:opacity-50 ${INPUT_ACCENT}`}
              autoComplete="off"
            />
            <button
              type="submit"
              disabled={!input.trim() || isAwaitingApi || streaming !== null}
              className="kai-btn-shimmer shrink-0 rounded-xl border border-[rgba(201,168,76,0.4)] bg-gradient-to-br from-[#C9A84C] to-[#F5E6B3] px-4 py-2.5 text-sm font-semibold text-black/90 hover:opacity-95 disabled:opacity-40"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-black text-[#E8DCC8]/50">
          Loading chat…
        </div>
      }
    >
      <ChatInner />
    </Suspense>
  );
}
