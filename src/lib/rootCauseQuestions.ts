/** ASK-step inspiration — root cause and next-step questions by context. */

export const rootCauseQuestions = {
  taskNotDone: [
    "When you think about yesterday — at what exact moment did things go off track?",
    "Was it that you did not have time, did not have energy, or did not know exactly what to do?",
    "If someone had checked in with you at 3pm yesterday, what would you have said was getting in the way?",
    "Is this the first time this specific task has not gotten done — or has it been sitting there for a while?",
    "On a scale of 1 to 10, how clear were you on exactly what needed to happen — was the task specific enough?",
  ],

  demotivated: [
    "When did you last feel genuinely excited about this goal — what was different about that moment?",
    "What originally made you want to pursue this — take me back to that moment.",
    "Is the goal itself still right for you, or has something changed about what you actually want?",
    "What would need to happen today — even something tiny — to make you feel like you are moving again?",
    "When you picture achieving your goal — does it still excite you or does something feel different now?",
  ],

  overwhelmed: [
    "If you could only do ONE thing this entire week — what would have the biggest impact?",
    "What on your list can only YOU do — versus what could be delayed, delegated, or dropped?",
    "What would make tomorrow feel 10 percent easier than today?",
    "Which one of the things on your mind is actually urgent today — versus which ones feel urgent but are not really?",
  ],

  confused: [
    "What do you know for certain about what you want, even if everything else is unclear?",
    "If you could ask one person for advice on this right now — what would you ask them?",
    "What is the smallest possible version of moving forward that you could take in the next hour?",
    "What would you tell a friend who came to you with exactly this situation?",
  ],

  winning: [
    "What made today different from the days you did not get this done — what can we replicate?",
    "On a scale of 1 to 10 how much does completing this move you toward your big goal — and what would a 10 look like?",
    "What is the ONE thing that would make tomorrow an even bigger win than today?",
    "Who deserves to know about this — is there someone you should tell about this win?",
  ],
} as const;
