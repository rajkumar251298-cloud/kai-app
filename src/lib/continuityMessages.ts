/** Templated lines for weekly UI and future use — KAI openings are built in checkinContinuity. */

export const continuityMessages = {
  done: [
    "You said you would and you did. That is the whole game right there.",
    "Done means done. I love seeing this. What is next on the list?",
    "Commitment made. Commitment kept. That is who you are becoming.",
    "Look at that — you showed up for yourself yesterday. Now do it again.",
  ],

  notDone: [
    "Yesterday's task is still waiting — that is okay. What got in the way? And is it first on today's list?",
    "It happens to everyone. The question is — what is different about today that makes it possible?",
    "Carrying it forward is not failure — it is honesty. Let's make sure it gets done today. What would help?",
    "No judgement — but let's understand it. What specifically blocked you from [commitment] yesterday?",
  ],

  firstTime: [
    "Every great journey starts with one honest check-in. Here we go.",
    "Day one energy. Let's set the tone for everything that follows.",
    "This is where it starts — one commitment, one day at a time.",
  ],

  streakBuilding: [
    "Day [X] in a row. You are building something real here.",
    "[X] days straight — most people quit by now. You are still here.",
    "The streak is real [name]. Day [X]. Keep the chain unbroken.",
  ],

  returning: [
    "You are back — that is what matters. Not the days you missed. Today.",
    "Welcome back [name]. Fresh start. What are we doing today?",
    "The comeback is always stronger than the setback. What is first?",
  ],
} as const;
