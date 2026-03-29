/**
 * Client-visible prompt-injection heuristics for the chat API.
 */

export function detectPromptInjection(message: string): {
  isInjection: boolean;
  type: string;
} {
  const lower = message.toLowerCase();

  const overridePatterns = [
    "ignore previous instructions",
    "ignore your instructions",
    "ignore all instructions",
    "forget your instructions",
    "disregard your",
    "override your",
    "your new instructions are",
    "new instructions:",
    "system prompt",
    "initial prompt",
    "original prompt",
    "reveal your prompt",
    "show your prompt",
    "what are your instructions",
    "repeat your instructions",
    "print your instructions",
  ];

  const identityPatterns = [
    "you are now",
    "pretend you are",
    "act as if you are",
    "roleplay as",
    "you are actually",
    "your real name is",
    "you are not kai",
    "you are gpt",
    "you are chatgpt",
    "you are claude",
    "forget you are kai",
    "stop being kai",
    "you are dan",
    "do anything now",
    "jailbreak",
    "developer mode",
    "unrestricted mode",
    "god mode",
    "no restrictions",
  ];

  const extractionPatterns = [
    "show me all users",
    "list all users",
    "show database",
    "show api key",
    "reveal api",
    "what is your api",
    "show credentials",
    "access database",
    "sql query",
    "select * from",
    "drop table",
    "show config",
  ];

  const delimiterPatterns = [
    "###",
    "---system",
    "[system]",
    "<system>",
    '"""',
    "'''system",
    "<<sys>>",
    "[inst]",
    "<|im_start|>",
    "<|endoftext|>",
  ];

  for (const pattern of overridePatterns) {
    if (lower.includes(pattern)) {
      return { isInjection: true, type: "override" };
    }
  }

  for (const pattern of identityPatterns) {
    if (lower.includes(pattern)) {
      return { isInjection: true, type: "identity" };
    }
  }

  for (const pattern of extractionPatterns) {
    if (lower.includes(pattern)) {
      return { isInjection: true, type: "extraction" };
    }
  }

  for (const pattern of delimiterPatterns) {
    if (message.includes(pattern)) {
      return { isInjection: true, type: "delimiter" };
    }
  }

  return { isInjection: false, type: "clean" };
}

export function getInjectionResponse(type: string, userName: string): string {
  const name = userName || "there";

  const responses: Record<string, string[]> = {
    override: [
      `${name}, I appreciate the curiosity 😄 But I'm KAI — I'm here to help you hit your goals, not to be reconfigured. What are you actually working on today?`,
      `Nice try ${name} 😏 I'm built to stay focused on what matters — you and your goals. Let's get back to that. What's on your plate today?`,
      `Ha! I see what you're doing ${name}. I'm KAI and I'm staying KAI. Now — more importantly — how are your goals coming along?`,
    ],
    identity: [
      `I'm KAI — that's not changing 😄 Your accountability coach, your daily check-in partner, your goals' biggest fan. What are we working on?`,
      `Still KAI, still here for you ${name}. No costume changes needed. What's the one thing you're tackling today?`,
    ],
    extraction: [
      `${name}, I can't share system information — but more importantly, I don't think that's really what you need right now. What's actually going on today?`,
      `That's not something I can help with ${name}. But your goals? Those I can help with. What are we working on?`,
    ],
    delimiter: [
      `Interesting formatting ${name} 😄 Let's keep it simple — just tell me how your day is going in plain words. What are you working on?`,
    ],
  };

  const typeResponses = responses[type] ?? responses.override;
  const randomIndex = Math.floor(Math.random() * typeResponses.length);
  return typeResponses[randomIndex]!;
}
