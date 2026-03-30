export function detectEmotion(message: string): {
  emotion: string;
  intensity: "low" | "medium" | "high";
} {
  const lower = message.toLowerCase();

  const demotivatedHigh = [
    "i give up",
    "its pointless",
    "nothing works",
    "i cant do this",
    "i am a failure",
    "i failed",
    "whats the point",
    "it's hopeless",
    "i quit",
    "forget it",
    "i am done",
    "i cant anymore",
    "i hate myself",
    "i am useless",
    "i am worthless",
    "i am stupid",
  ];

  const demotivatedMedium = [
    "i didn't do it",
    "haven't done",
    "havent done",
    "haven't finished",
    "i failed again",
    "same as yesterday",
    "nothing changed",
    "i am so behind",
    "i am stuck again",
    "what's wrong with me",
    "i am lazy",
    "i don't know why i bother",
    "i am demotivated",
    "lost motivation",
    "can't seem to",
    "keep failing",
    "disappointed in myself",
    "let myself down",
    "feel bad",
  ];

  const demotivatedLow = [
    "didn't finish",
    "not finished",
    "not done",
    "couldn't do it",
    "got distracted",
    "ran out of time",
    "forgot",
    "was busy",
    "didn't get to it",
    "postponed",
    "will try tomorrow",
    "hard day",
    "tough day",
    "not feeling it",
    "tired",
    "exhausted",
    "overwhelmed",
  ];

  const winning = [
    "done",
    "finished",
    "completed",
    "crushed it",
    "nailed it",
    "did it",
    "achieved",
    "accomplished",
    "won",
    "proud",
    "great day",
    "amazing",
    "killed it",
    "smashed it",
  ];

  const anxious = [
    "worried",
    "scared",
    "anxious",
    "nervous",
    "stressed",
    "panic",
    "overwhelmed",
    "too much",
    "don't know where to start",
    "so much to do",
    "no time",
  ];

  const confused = [
    "don't know",
    "no idea",
    "lost",
    "confused",
    "not sure",
    "unclear",
    "what should i",
    "help me",
    "don't understand",
    "stuck",
  ];

  for (const word of demotivatedHigh) {
    if (lower.includes(word)) {
      return { emotion: "demotivated", intensity: "high" };
    }
  }

  for (const word of demotivatedMedium) {
    if (lower.includes(word)) {
      return { emotion: "demotivated", intensity: "medium" };
    }
  }

  for (const word of demotivatedLow) {
    if (lower.includes(word)) {
      return { emotion: "demotivated", intensity: "low" };
    }
  }

  for (const word of winning) {
    if (lower.includes(word)) {
      return { emotion: "winning", intensity: "high" };
    }
  }

  for (const word of anxious) {
    if (lower.includes(word)) {
      return { emotion: "anxious", intensity: "medium" };
    }
  }

  for (const word of confused) {
    if (lower.includes(word)) {
      return { emotion: "confused", intensity: "medium" };
    }
  }

  return { emotion: "neutral", intensity: "low" };
}
