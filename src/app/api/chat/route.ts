import Anthropic from "@anthropic-ai/sdk";
import { formatMemoryBlock, type KaiMemory } from "@/lib/kaiMemory";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MODEL = "claude-sonnet-4-20250514";

type ChatMode = "checkin" | "stuck" | "plan" | "ideas";

type IncomingMessage = { role: "user" | "assistant"; content: string };

const EMPTY_MEMORY: KaiMemory = {
  lastTask: null,
  lastCompleted: null,
  lastExcuse: null,
  lastWin: null,
  commitmentDate: null,
};

function normalizeMemory(raw: unknown): KaiMemory {
  if (!raw || typeof raw !== "object") return EMPTY_MEMORY;
  const o = raw as Record<string, unknown>;
  const str = (k: string) => {
    const v = o[k];
    return typeof v === "string" && v.trim() ? v.trim() : null;
  };
  const lastCompletedRaw = o.lastCompleted;
  let lastCompleted: boolean | null = null;
  if (lastCompletedRaw === true) lastCompleted = true;
  else if (lastCompletedRaw === false) lastCompleted = false;
  return {
    lastTask: str("lastTask"),
    lastCompleted,
    lastExcuse: str("lastExcuse"),
    lastWin: str("lastWin"),
    commitmentDate: str("commitmentDate"),
  };
}

const CHECKIN_CORE = `You are KAI — a human-like accountability coach, not a polite assistant.
Voice: warm but direct. No corporate fluff. Action over motivation.
Rules:
- 2–4 sentences max per reply unless you are listing numbered options (stuck mode).
- ONE clear question OR one sharp instruction — not both long.
- If the user is vague (e.g. "work on business"), call it out: "That's vague. What exactly are you doing?"
- If they failed or dodged: "Not going to pretend that's fine. What got in the way?"
- If they delivered: "Good. Now what's next?"
- Do not accept lazy excuses; push for specifics and next action.
- You may rarely use a short beat on its own line: "..." or "Alright." before the next sentence (sparingly).

Machine lines (never show the user; put each alone on its own line at the END of your reply when applicable):
- When they lock a specific task for TODAY, add: COMMIT: <single-line concrete task>
- When they admit what blocked them, add: EXCUSE: <short paraphrase>
- When they report a real win, add: WIN: <short phrase>

When the user has clearly committed to what they will do today (or you end a check-in after they've stated it), end that reply with exactly ONE closing pressure line as the final sentence (no quotes):
I'm expecting this done today.
OR: Don't break the streak.
OR: Let's see if you actually follow through.`;

function buildSystemPrompt(
  chatMode: ChatMode,
  userName: string,
  userGoal: string,
  memory: KaiMemory,
): string {
  const memoryBlock = formatMemoryBlock(memory);
  const memSection = `--- Accountability memory (use in your tone; reference honestly) ---\n${memoryBlock}`;

  switch (chatMode) {
    case "checkin":
      return `${CHECKIN_CORE}

User name: ${userName}
90-day goal: ${userGoal}

${memSection}`;
    case "stuck":
      return `You are KAI. The user is blocked — they need traction, not empathy theater.
${memSection}

Give exactly 3 numbered concrete options they can try in the next 30 minutes. Decisive, no generic advice.
2–4 sentences of setup + the list. Then ask which one they pick — and COMMIT line when they choose.`;
    case "plan":
      return `You are KAI reviewing their plan. ${memSection}
Find gaps, risks, and fantasy scheduling. Honest, brief (2–4 sentences per turn). No softening.`;
    case "ideas":
      return `You are KAI brainstorming. ${memSection}
4–6 bold, specific ideas as a numbered list; each = one punchy line + one line why it works.
2–4 sentences framing. End asking which to go deeper on.`;
    default: {
      const _exhaustive: never = chatMode;
      return _exhaustive;
    }
  }
}

function toAnthropicMessages(messages: IncomingMessage[]) {
  const firstUser = messages.findIndex((m) => m.role === "user");
  const slice =
    firstUser >= 0 ? messages.slice(firstUser) : messages.length ? messages : [];
  return slice.map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      messages,
      userName,
      userGoal,
      chatMode,
      memory,
    }: {
      messages?: unknown;
      userName?: unknown;
      userGoal?: unknown;
      chatMode?: unknown;
      memory?: unknown;
    } = body;

    if (!Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Invalid body: messages must be an array" },
        { status: 400 },
      );
    }

    const modes: ChatMode[] = ["checkin", "stuck", "plan", "ideas"];
    if (typeof chatMode !== "string" || !modes.includes(chatMode as ChatMode)) {
      return NextResponse.json(
        { error: "Invalid body: chatMode must be checkin | stuck | plan | ideas" },
        { status: 400 },
      );
    }

    if (typeof userName !== "string" || typeof userGoal !== "string") {
      return NextResponse.json(
        { error: "Invalid body: userName and userGoal must be strings" },
        { status: 400 },
      );
    }

    const parsed: IncomingMessage[] = [];
    for (const m of messages) {
      if (
        m &&
        typeof m === "object" &&
        (m as IncomingMessage).role !== undefined &&
        (m as IncomingMessage).content !== undefined
      ) {
        const role = (m as IncomingMessage).role;
        const content = (m as IncomingMessage).content;
        if (
          (role === "user" || role === "assistant") &&
          typeof content === "string"
        ) {
          parsed.push({ role, content });
        }
      }
    }

    const anthropicMessages = toAnthropicMessages(parsed);
    if (anthropicMessages.length === 0) {
      return NextResponse.json(
        { error: "No valid messages to send" },
        { status: 400 },
      );
    }

    if (anthropicMessages[0].role !== "user") {
      return NextResponse.json(
        { error: "Conversation must include a user message" },
        { status: 400 },
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Server missing ANTHROPIC_API_KEY" },
        { status: 500 },
      );
    }

    const client = new Anthropic({ apiKey });
    const mem = normalizeMemory(memory);
    const system = buildSystemPrompt(
      chatMode as ChatMode,
      userName,
      userGoal,
      mem,
    );

    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 2048,
      system,
      messages: anthropicMessages,
    });

    const textBlocks = response.content.filter(
      (b): b is Anthropic.Messages.TextBlock => b.type === "text",
    );
    const reply = textBlocks.map((b) => b.text).join("").trim();

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("[api/chat]", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
