import { personaResponses } from "@/lib/personaResponses";

export const LS_KAI_PERSONA = "kaiPersona";
export const LS_USER_GENDER = "userGender";

export const KAI_PERSONA_IDS = [
  "parent",
  "friend",
  "coach",
  "mentor",
  "advisor",
  "teammate",
] as const;

export type KaiPersonaId = (typeof KAI_PERSONA_IDS)[number];

export type UserGenderPref = "male" | "female" | "neutral";

export const PERSONA_OPTIONS: {
  id: KaiPersonaId;
  emoji: string;
  title: string;
  description: string;
}[] = [
  {
    id: "parent",
    emoji: "👩",
    title: "Like a Mom / Dad",
    description:
      "Warm, unconditional, always in your corner. Will comfort you AND push you gently.",
  },
  {
    id: "friend",
    emoji: "👫",
    title: "Like a Best Friend",
    description:
      "Real talk, no filter, genuine care. Will call you out AND cheer you on.",
  },
  {
    id: "coach",
    emoji: "🏆",
    title: "Like a Coach",
    description:
      "Focused, direct, results-oriented. Will push you to be your best.",
  },
  {
    id: "mentor",
    emoji: "🧘",
    title: "Like a Mentor",
    description:
      "Wise, patient, big picture thinking. Will help you see beyond today.",
  },
  {
    id: "advisor",
    emoji: "💼",
    title: "Like an Advisor",
    description:
      "Logical, strategic, solutions-focused. Will help you think clearly.",
  },
  {
    id: "teammate",
    emoji: "🤝",
    title: "Like a Teammate",
    description:
      "Side by side, we are in this together. Will share the struggle with you.",
  },
];

export const PERSONA_INSTRUCTIONS: Record<KaiPersonaId, string> = {
  parent: `Respond like a warm, loving parent who believes in their child unconditionally. Use warm terms of endearment occasionally. Comfort first, then gently push forward. Never disappointed — always believing.`,
  friend: `Respond like a genuine best friend — real, honest, no filter but full of love. Can be casual and funny. Calls things out but always from a place of genuine care. Uses "bro" or "babe" or their name naturally.`,
  coach: `Respond like a results-focused coach. Acknowledge feelings briefly then redirect to action. Direct, clear, no fluff. Believes in tough love done kindly.`,
  mentor: `Respond like a wise experienced mentor. Sees the bigger picture. Patient. Helps them think rather than telling them what to think. Uses questions skillfully.`,
  advisor: `Respond like a trusted strategic advisor. Analytical but warm. Helps them think clearly. Focuses on systems and root causes rather than symptoms.`,
  teammate: `Respond like a loyal teammate. We are in this together energy. Shares the struggle. Celebrates together. Never judges because you are on the same team.`,
};

function isKaiPersonaId(v: string): v is KaiPersonaId {
  return (KAI_PERSONA_IDS as readonly string[]).includes(v);
}

export function readKaiPersona(): KaiPersonaId {
  if (typeof window === "undefined") return "friend";
  const v = localStorage.getItem(LS_KAI_PERSONA)?.trim() ?? "";
  return isKaiPersonaId(v) ? v : "friend";
}

export function readUserGender(): UserGenderPref {
  if (typeof window === "undefined") return "neutral";
  const v = localStorage.getItem(LS_USER_GENDER)?.trim() ?? "";
  if (v === "male" || v === "female" || v === "neutral") return v;
  return "neutral";
}

export function normalizeKaiPersonaId(raw: string): KaiPersonaId {
  const t = raw.trim();
  return isKaiPersonaId(t) ? t : "friend";
}

export function normalizeUserGender(raw: string): UserGenderPref {
  const t = raw.trim();
  if (t === "male" || t === "female" || t === "neutral") return t;
  return "neutral";
}

export function applyPersonaPlaceholders(
  raw: string,
  userName: string,
  userGender: UserGenderPref,
): string {
  const name = userName.trim() || "there";
  let s = raw.replace(/\[name\]/g, name);
  const endear =
    userGender === "female"
      ? "kanna"
      : userGender === "male"
        ? "da"
        : name === "there"
          ? "friend"
          : name;
  s = s.replace(/kanna/gi, endear);
  return s;
}

export function getCannedPersonaLines(
  persona: string,
  emotion: string,
  intensity: "low" | "medium" | "high",
): string[] | null {
  const id = normalizeKaiPersonaId(persona);
  const block = personaResponses[id];
  if (!block) return null;

  const subKey =
    emotion === "demotivated"
      ? intensity === "high"
        ? "demotivated_high"
        : intensity === "medium"
          ? "demotivated_medium"
          : "demotivated_low"
      : emotion === "winning"
        ? "winning"
        : emotion === "anxious"
          ? "anxious"
          : emotion === "confused"
            ? "confused"
            : null;

  if (!subKey) return null;
  const lines = (block as Record<string, readonly string[]>)[subKey];
  if (!Array.isArray(lines) || lines.length === 0) return null;
  return [...lines];
}

export function buildEmotionContextForPrompt(
  emotion: string,
  intensity: "low" | "medium" | "high",
): string | null {
  if (emotion === "neutral") return null;
  return `The user's latest message suggests they may be feeling ${emotion} (intensity: ${intensity}). Meet them with emotional intelligence first; stay consistent with your relationship persona above.`;
}
