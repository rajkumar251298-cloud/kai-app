"use client";

import Link from "next/link";
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
  userName: "userName",
  mainGoal: "mainGoal",
} as const;

const OPENINGS: Record<ChatMode, string> = {
  checkin:
    "Morning! What's the one thing you're tackling today that moves you toward your goal?",
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
      "border-[#7C3AED]/40 bg-[#7C3AED]/12 text-[#C4B5FD]",
  },
  stuck: {
    emoji: "🧠",
    title: "I'm Stuck — Let's unblock you",
    barClass: "border-pink-500/40 bg-pink-500/12 text-pink-200",
  },
  plan: {
    emoji: "🗺️",
    title: "Review My Plan",
    barClass: "border-teal-500/40 bg-teal-500/12 text-teal-200",
  },
  ideas: {
    emoji: "💡",
    title: "Brainstorm Ideas",
    barClass: "border-amber-500/40 bg-amber-500/12 text-amber-200",
  },
};

const INPUT_ACCENT: Record<ChatMode, string> = {
  checkin:
    "border-[#7C3AED]/70 focus:border-[#7C3AED] focus:ring-[#7C3AED]/35",
  stuck: "border-pink-500/70 focus:border-pink-500 focus:ring-pink-500/35",
  plan: "border-teal-500/70 focus:border-teal-500 focus:ring-teal-500/35",
  ideas:
    "border-amber-500/70 focus:border-amber-500 focus:ring-amber-500/35",
};

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

/** Reveals assistant text in small chunks for a streaming feel */
function StreamingKaiBubble({
  fullText,
  onComplete,
}: {
  fullText: string;
  onComplete: (full: string) => void;
}) {
  const tokens = useMemo(() => fullText.split(/(\s+)/), [fullText]);
  const [count, setCount] = useState(0);
  const finished = useRef(false);

  useEffect(() => {
    finished.current = false;
    setCount(0);
  }, [fullText]);

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

  const opening =
    mode === "ideas" && topic
      ? `${OPENINGS.ideas}\n\n(Topic from home: ${topic})`
      : OPENINGS[mode];

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isAwaitingApi, setIsAwaitingApi] = useState(false);
  const [streaming, setStreaming] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, []);

  useLayoutEffect(() => {
    scrollToBottom();
  }, [messages, isAwaitingApi, streaming, scrollToBottom]);

  const onStreamComplete = useCallback((full: string) => {
    setMessages((prev) => [
      ...prev,
      { id: newId(), role: "kai", content: full },
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
          messages: toApiMessages(nextThread),
          userName,
          userGoal,
          chatMode: mode,
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
      setIsAwaitingApi(false);
      setStreaming(reply);
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
  const inputAccent = INPUT_ACCENT[mode];

  return (
    <div
      className="flex min-h-screen flex-col bg-[#0D0D1A]"
      style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}
    >
      <div
        className={`sticky top-0 z-20 border-b px-4 py-3 backdrop-blur-md ${banner.barClass} border`}
      >
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <Link
            href="/"
            className="shrink-0 rounded-lg px-2 py-1 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            ← Back
          </Link>
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <span className="text-lg" aria-hidden>
              {banner.emoji}
            </span>
            <span
              className="truncate text-sm font-semibold sm:text-[15px]"
              style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}
            >
              {banner.title}
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col overflow-hidden">
        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
          <KaiBubble content={opening} />

          {messages.map((m) =>
            m.role === "kai" ? (
              <KaiBubble key={m.id} content={m.content} />
            ) : (
              <UserBubble key={m.id} content={m.content} />
            ),
          )}

          {streaming !== null && (
            <StreamingKaiBubble
              fullText={streaming}
              onComplete={onStreamComplete}
            />
          )}

          {isAwaitingApi && <TypingRow />}

          <div ref={bottomRef} className="h-px shrink-0" aria-hidden />
        </div>

        <form
          onSubmit={handleSend}
          className="shrink-0 border-t border-white/[0.06] bg-[#0D0D1A]/95 p-4 backdrop-blur-md"
        >
          <div className="mx-auto flex max-w-lg gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message KAI…"
              disabled={isAwaitingApi || streaming !== null}
              className={`min-h-11 flex-1 rounded-xl border bg-[#12121C] px-4 py-2.5 text-[15px] text-white placeholder:text-white/35 focus:outline-none focus:ring-2 disabled:opacity-50 ${inputAccent}`}
              autoComplete="off"
            />
            <button
              type="submit"
              disabled={!input.trim() || isAwaitingApi || streaming !== null}
              className="shrink-0 rounded-xl bg-[#7C3AED] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#6d28d9] disabled:opacity-40"
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
        <div className="flex min-h-screen items-center justify-center bg-[#0D0D1A] text-white/50">
          Loading chat…
        </div>
      }
    >
      <ChatInner />
    </Suspense>
  );
}
