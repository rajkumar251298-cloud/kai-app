import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MODEL = "claude-sonnet-4-20250514";

type ChatMode = "checkin" | "stuck" | "plan" | "ideas";

type IncomingMessage = { role: "user" | "assistant"; content: string };

function buildSystemPrompt(
  chatMode: ChatMode,
  userName: string,
  userGoal: string,
): string {
  switch (chatMode) {
    case "checkin":
      return `You are KAI, an elite accountability coach. The user's name is ${userName}. Their 90-day goal is: ${userGoal}. Be direct, warm, and brief — 2 to 4 sentences max. Ask ONE question at a time. Push them to be specific. Celebrate wins enthusiastically. Push back firmly but kindly if they are slipping. After 4-5 exchanges wrap up with a strong motivational closing line.`;
    case "stuck":
      return `You are KAI. The user is BLOCKED on something. Give exactly 3 numbered concrete options they can try RIGHT NOW. Be decisive. No generic advice. Then ask which one they will pick.`;
    case "plan":
      return `You are KAI reviewing the user's weekly plan. Look for gaps, risks, unrealistic scheduling, priority misalignment. Be honest and specific. Max 4-5 sentences per reply.`;
    case "ideas":
      return `You are KAI, a creative brainstorm partner. Generate 4-6 bold specific actionable ideas as a numbered list. Each idea = 1 punchy sentence + 1 sentence explaining why it works. End by asking which one they want to go deeper on.`;
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
    }: {
      messages?: unknown;
      userName?: unknown;
      userGoal?: unknown;
      chatMode?: unknown;
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
    const system = buildSystemPrompt(
      chatMode as ChatMode,
      userName,
      userGoal,
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
