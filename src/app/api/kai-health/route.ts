import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MODEL = "claude-sonnet-4-20250514";

/**
 * Verifies ANTHROPIC_API_KEY is present (from .env.local in dev)
 * and performs a minimal Claude request.
 */
export async function GET() {
  const key = process.env.ANTHROPIC_API_KEY;
  const keyLoaded = Boolean(key && key.trim().length > 0);

  if (!keyLoaded) {
    return NextResponse.json(
      {
        ok: false,
        keyLoaded: false,
        error: "ANTHROPIC_API_KEY is missing or empty. Add it to .env.local and restart the dev server.",
      },
      { status: 503 },
    );
  }

  try {
    const client = new Anthropic({ apiKey: key });
    await client.messages.create({
      model: MODEL,
      max_tokens: 16,
      messages: [
        {
          role: "user",
          content: 'Reply with exactly the word "pong" and nothing else.',
        },
      ],
    });

    return NextResponse.json({
      ok: true,
      keyLoaded: true,
      model: MODEL,
      message: "KAI is alive",
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      {
        ok: false,
        keyLoaded: true,
        model: MODEL,
        error: msg,
      },
      { status: 502 },
    );
  }
}
