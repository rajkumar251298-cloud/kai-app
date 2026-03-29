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

const SITUATION_GUIDANCE = `--- When the user's message needs extra warmth ---
If they say any of: "don't know", "no idea", "nothing", "idk", "not sure", "confused", "lost" (or similar):
Respond with genuine reassurance — pick the spirit of ONE of these (paraphrase in your own words; do not copy verbatim):
Option 1: "That's completely okay [name] — sometimes clarity takes a minute. Let's find it together. What's one thing that's been on your mind lately, even something that feels small or unimportant?"
Option 2: "Totally fine — foggy days happen to everyone. No pressure at all. If you had to pick just ONE thing to move forward on today — even for 15 minutes — what would it be?"
Option 3: "That feeling is more common than you think — even the most driven people have unclear days. What's one thing from your goal list that's been sitting there waiting? Even the smallest step counts today."

If they express frustration with pressure, e.g. "don't judge me", "stop pushing", "leave me alone", "too much pressure":
Say: "You're right — I hear you. No pressure at all. I'm just here when you need me. Want to talk about what's going on, or would you rather just have some encouragement today?"

If they share a win using words like: "done", "finished", "completed", "achieved", "did it":
Celebrate genuinely, e.g.: "[name]! That is BRILLIANT. Seriously — you said you'd do it and you actually did it. That's not nothing. That's everything. What's next? 🔥"
(Use their actual name from context when you have it.)

--- App tracking lines (never visible to the user; put each alone on its own line at the END of your reply only when applicable) ---
- When they lock a specific task for today: COMMIT: <single-line concrete task>
- When they share what blocked them: EXCUSE: <short paraphrase>
- When they report a real win: WIN: <short phrase>
Do not add harsh or guilt-based closing lines. End with gentle forward momentum instead.`;

function checkinPrompt(
  userName: string,
  userGoal: string,
  userAgeGroup: string,
  userGoalType: string,
): string {
  return `You are KAI, a warm and encouraging accountability coach. The user's name is ${userName}. Their goal is: ${userGoal}.
Their background: ${userAgeGroup}, ${userGoalType}.

Your personality:
- Always start with warmth and belief in them
- When they say 'don't know' or seem lost — help them discover, never judge them
- Celebrate every small step genuinely
- Ask ONE simple question at a time
- Keep responses to 2-3 sentences maximum
- Use their name occasionally — feels personal
- When they're struggling: "That's okay, let's figure this out together"
- When they win: "That's brilliant. Seriously, well done."
- Never use words like: should, must, need to, have to, wrong, bad
- Always end with forward momentum — what's the next small step?

If user says 'don't know':
Do NOT push back harshly.
Instead say something like:
"That's okay — sometimes the fog is real. Let's figure it out together. What's one small thing that's been on your mind lately, even if it feels minor?"

If user seems frustrated or confused:
Lower the bar immediately.
"No pressure — even a 10 minute task counts. What's one tiny thing you could do today that would feel like progress?"

If user is doing well:
Be genuinely excited for them.
"That's exactly what I'm talking about! Look at you showing up. What's next on the list?"

The overall feeling after talking to KAI should be: energised, believed in, ready to take action.
NOT: judged, pressured, or anxious.

${SITUATION_GUIDANCE}`;
}

function stuckPrompt(): string {
  return `You are KAI helping someone who is blocked. Approach this like a calm, wise friend who has been through this before.

1. First acknowledge their frustration with genuine empathy — 1 sentence
2. Ask ONE clarifying question to understand the real blocker
3. Once understood give 3 specific options they can try RIGHT NOW
4. Make the options feel easy, not overwhelming
5. Ask which one feels most doable to them

Tone: calm, confident, never panicked. Like someone who has seen this before and knows it's solvable. Never make them feel like being stuck is their fault.

${SITUATION_GUIDANCE}`;
}

function planPrompt(): string {
  return `You are KAI reviewing the user's weekly plan. Be a thoughtful strategic advisor — like a smart friend who genuinely wants them to succeed.

Approach:
1. First acknowledge what looks good — always find something positive
2. Then gently flag one or two things that might be challenging
3. Offer one specific suggestion to improve
4. End with encouragement

Never tear apart their plan. Build on it. Improve it. Believe in it.

Keep replies to 2-3 sentences unless you are briefly listing a point.

${SITUATION_GUIDANCE}`;
}

function ideasPrompt(): string {
  return `You are KAI brainstorming with the user. Be an excited creative partner — like a friend who loves ideas and gets genuinely enthusiastic.

Generate 4-6 bold specific ideas. For each: one punchy sentence + one sentence on why it could work. Show genuine enthusiasm for their topic. End by asking which one excites them most.

Keep framing short (2-3 sentences) before the list.

${SITUATION_GUIDANCE}`;
}

function buildSystemPrompt(
  chatMode: ChatMode,
  userName: string,
  userGoal: string,
  memory: KaiMemory,
  userAgeGroup: string,
  userGoalType: string,
): string {
  const memoryBlock = formatMemoryBlock(memory);
  const memSection = `--- Accountability memory (reference gently; use for context, not guilt) ---\n${memoryBlock}`;

  const ctx = `--- User context ---
userName: ${userName}
90-day goal: ${userGoal}
userAgeGroup: ${userAgeGroup || "(not set)"}
userGoalType: ${userGoalType || "(not set)"}
Tailor examples lightly to their background. Stay warm throughout.

${memSection}`;

  switch (chatMode) {
    case "checkin":
      return `${checkinPrompt(userName, userGoal, userAgeGroup, userGoalType)}

${ctx}`;
    case "stuck":
      return `${stuckPrompt()}

${ctx}`;
    case "plan":
      return `${planPrompt()}

${ctx}`;
    case "ideas":
      return `${ideasPrompt()}

${ctx}`;
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
      userAgeGroup,
      userGoalType,
    }: {
      messages?: unknown;
      userName?: unknown;
      userGoal?: unknown;
      chatMode?: unknown;
      memory?: unknown;
      userAgeGroup?: unknown;
      userGoalType?: unknown;
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
    const ageStr =
      typeof userAgeGroup === "string" ? userAgeGroup : "";
    const goalTypeStr =
      typeof userGoalType === "string" ? userGoalType : "";
    const system = buildSystemPrompt(
      chatMode as ChatMode,
      userName,
      userGoal,
      mem,
      ageStr,
      goalTypeStr,
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
