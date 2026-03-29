export type DailyReflectionQ = {
  prompt: string;
  options: string[];
  /** KAI line for each option index */
  kaiByOption: string[];
};

/** Rotates with dayOfYear % length (30). */
export const DAILY_REFLECTION_QUESTIONS: DailyReflectionQ[] = [
  {
    prompt:
      "What is the ONE thing you must do today that would make everything else easier?",
    options: ["Work task", "Personal goal", "Health habit", "Relationship"],
    kaiByOption: [
      "Ship the work task first — momentum there unlocks the rest of the day.",
      "If the personal goal clears mental noise, touch it before the inbox eats you.",
      "Body first isn't soft — it's fuel. One small health win, then attack the list.",
      "One honest conversation saves weeks of drift. Name it and schedule it.",
    ],
  },
  {
    prompt: "Your energy right now is:",
    options: ["🔥 On fire", "⚡ Good", "😐 Neutral", "😴 Low"],
    kaiByOption: [
      "Lock in right now. Don't waste this. Open your most important task immediately.",
      "Good is enough to start. Pick one concrete win in the next 25 minutes.",
      "Neutral is a choice point — tiny action beats another scroll.",
      "Low energy days happen. Do the minimum viable version of your task. Start small.",
    ],
  },
  {
    prompt: "The biggest thing blocking you today is:",
    options: [
      "Unclear priorities",
      "Low motivation",
      "Too many tasks",
      "Fear of starting",
    ],
    kaiByOption: [
      "Write three priorities on paper. Cross two out. Start with what remains.",
      "Motivation follows motion. Two minutes on the smallest step — timer on.",
      "Batch or delete. If everything is urgent, nothing is. Pick one thread.",
      "Name the fear in one sentence. Then do the first 60 seconds anyway.",
    ],
  },
  {
    prompt: "How did yesterday's main task go?",
    options: [
      "✅ Crushed it",
      "🔄 Partially done",
      "❌ Didn't do it",
      "🔀 Changed plans",
    ],
    kaiByOption: [
      "Good. Don't coast today — stack another win while you're hot.",
      "Finish the remainder in a single block before noon. No drifting.",
      "No drama. What one thing makes today honest instead of another escape?",
      "Plans change — own the new target in one line and execute.",
    ],
  },
  {
    prompt: "Your focus today will be:",
    options: ["Deep work", "Meetings/calls", "Planning", "Recovery"],
    kaiByOption: [
      "Protect a 90-minute cave. Phone in another room. One hard problem only.",
      "Batch calls. Between them, one tangible output or you're just busy.",
      "Planning has a stop time — then ship, don't polish the plan forever.",
      "Recovery is strategic. Rest now so tomorrow isn't another crash.",
    ],
  },
  {
    prompt: "Rate your sleep last night:",
    options: ["😴 Amazing", "🙂 Good", "😐 Average", "😫 Terrible"],
    kaiByOption: [
      "Use the edge — tackle the hardest thing while you're sharp.",
      "Solid baseline. No heroic late nights tonight if you want to keep it.",
      "Average sleep means protect energy — shorter tasks, fewer context switches.",
      "Be kind to yourself today — smaller commitments, earlier wind-down tonight.",
    ],
  },
  {
    prompt: "What habit are you building this week?",
    options: [
      "Exercise",
      "Reading",
      "No phone mornings",
      "Early wake up",
    ],
    kaiByOption: [
      "Schedule the session like a meeting. Non-negotiable block on the calendar.",
      "Ten pages or ten minutes — whichever comes first. Consistency beats volume.",
      "Phone stays out of the bedroom until after breakfast. One rule.",
      "Alarm across the room. Lights on immediately. No negotiation with yourself.",
    ],
  },
  {
    prompt: "What deserves your hardest effort today?",
    options: ["Career push", "Health", "Relationships", "Learning"],
    kaiByOption: [
      "One career move that compounds — send it, ship it, or schedule it.",
      "Health isn't later. One concrete action before the day hijacks you.",
      "Send one message that closes distance. Specific beats vague.",
      "Learning without application is entertainment — tie today's study to one output.",
    ],
  },
  {
    prompt: "Your mindset entering today is:",
    options: ["Hungry", "Steady", "Stressed", "Uncertain"],
    kaiByOption: [
      "Channel hunger into one measurable outcome before lunch.",
      "Steady wins — stack small completions; don't chase drama.",
      "Stress shrinks when you name the next physical action. Write it, do it.",
      "Uncertainty clears with a prototype — smallest version of the real thing.",
    ],
  },
  {
    prompt: "The win you want from today is:",
    options: ["Finish a project", "Start something new", "Fix a mess", "Rest hard"],
    kaiByOption: [
      "Define 'done' in one sentence. Work until that's true.",
      "Starting is the win — open the doc, send the message, book the time.",
      "Clean the mess for 25 minutes only — then reassess. Timer on.",
      "Real rest is permission. Log off with intention, not guilt.",
    ],
  },
  {
    prompt: "What usually derails you mid-day?",
    options: ["Notifications", "Meetings", "Self-doubt", "Low fuel"],
    kaiByOption: [
      "Turn off badges until your one big task is done.",
      "Block a post-lunch focus window. Decline what isn't essential.",
      "Doubt loses to a timer. 15 minutes of ugly progress beats spiralling.",
      "Eat deliberately. A crash isn't a character flaw — it's biology.",
    ],
  },
  {
    prompt: "Your relationship with deadlines today:",
    options: ["Ahead", "On track", "Behind", "No deadlines"],
    kaiByOption: [
      "Stay ahead — help someone else. Leadership compounds.",
      "Protect the critical path. Say no to one nice-to-have.",
      "Behind is data. What's the smallest recovery move in the next hour?",
      "Create one — even a self-set cutoff beats infinite drift.",
    ],
  },
  {
    prompt: "Pick your battle today:",
    options: ["Speed", "Quality", "Learning", "Relationships"],
    kaiByOption: [
      "Ship fast, iterate tomorrow. Perfect is the enemy of done.",
      "One thing done beautifully beats five half jobs.",
      "Pick a skill edge — one lesson, one applied exercise.",
      "One thoughtful touchpoint changes the week.",
    ],
  },
  {
    prompt: "How social do you want today to be?",
    options: ["Very", "Some", "Minimal", "Solo deep work"],
    kaiByOption: [
      "Connect with intent — quality threads, not random pings.",
      "Batch people time so focus time stays sacred.",
      "Guard your calendar. No is a complete sentence.",
      "Silence notifications. Your deep work is the main event.",
    ],
  },
  {
    prompt: "Your environment today:",
    options: ["Office", "Home", "Coffee shop", "On the move"],
    kaiByOption: [
      "Use the energy — short meetings, visible wins.",
      "Separate zones: one corner is work-only until the block ends.",
      "Headphones on. Same seat. Ritual beats novelty.",
      "Voice memo ideas, batch tasks at the next stop — stay light.",
    ],
  },
  {
    prompt: "What are you avoiding?",
    options: ["Hard email", "Boring task", "Big decision", "Rest"],
    kaiByOption: [
      "Send the email in three sentences. Send.",
      "Timer 10 minutes. Boring dies when you start.",
      "Write options and worst cases on paper — clarity beats looping.",
      "If you're avoiding rest, you're burning trust with yourself. Stop.",
    ],
  },
  {
    prompt: "Today's risk tolerance:",
    options: ["High", "Medium", "Low", "Play it safe"],
    kaiByOption: [
      "Take one bold swing — pitch, ask, publish.",
      "One stretch goal, everything else steady.",
      "Reduce variance — execute known plays well.",
      "Stability week — protect sleep and baseline habits.",
    ],
  },
  {
    prompt: "What would make today a 10/10?",
    options: ["Ship work", "Feel healthy", "Connect", "Learn"],
    kaiByOption: [
      "Define the ship line. Cross it before evening.",
      "Move, hydrate, sleep prep — boring wins.",
      "One real conversation beats ten likes.",
      "Teach someone what you learned — that's mastery.",
    ],
  },
  {
    prompt: "Your patience level today:",
    options: ["High", "Normal", "Thin", "Gone"],
    kaiByOption: [
      "Coach someone — patience is leverage today.",
      "Normal mode — standard pace, no drama.",
      "Short tasks only. Protect others from your edge.",
      "Step back before you burn bridges. Walk first.",
    ],
  },
  {
    prompt: "Pick a theme for today:",
    options: ["Discipline", "Creativity", "Kindness", "Courage"],
    kaiByOption: [
      "Do the thing you said you'd do. No renegotiation.",
      "Quantity of ideas first — judge later.",
      "One generous act without keeping score.",
      "Do the scary thing early — fear shrinks after start.",
    ],
  },
  {
    prompt: "What support do you need?",
    options: ["Accountability", "Focus", "Skills", "Rest"],
    kaiByOption: [
      "Tell one person your one outcome for today.",
      "One app closed, one tab, one task.",
      "One tutorial applied in the same session — no hoarding tabs.",
      "Schedule rest like work — it's not optional.",
    ],
  },
  {
    prompt: "Your confidence today:",
    options: ["Sky high", "Solid", "Shaky", "Low"],
    kaiByOption: [
      "Take a calculated risk — confidence is earned by reps.",
      "Keep promises to yourself today — that's real confidence.",
      "Shrink the step until it feels doable. Then do it.",
      "Low days need smaller wins. Stack three tiny completions.",
    ],
  },
  {
    prompt: "What will you say no to today?",
    options: ["Extra meetings", "Phone scroll", "Perfectionism", "People pleasing"],
    kaiByOption: [
      "Decline one meeting with a clear reason. Offer async.",
      "Phone in drawer until your first win.",
      "Ship at 80%. Polish is procrastination in disguise.",
      "One boundary voiced kindly beats resentment tonight.",
    ],
  },
  {
    prompt: "How will you measure today?",
    options: ["Tasks done", "Time focused", "Mood", "Impact"],
    kaiByOption: [
      "List three. Check them. Stop adding mid-day.",
      "Track one deep-work block honestly — timer doesn't lie.",
      "Note mood at lunch — adjust afternoon accordingly.",
      "One outcome that moved a needle — name it tonight.",
    ],
  },
  {
    prompt: "Your biggest distraction today will be:",
    options: ["News", "Social", "Chores", "Overthinking"],
    kaiByOption: [
      "One headline glance, then closed tab for 3 hours.",
      "Delete the app for the day or use strict limits.",
      "Chores after work block — write the rule now.",
      "Thought → one action on paper. No loops.",
    ],
  },
  {
    prompt: "Pick your fuel:",
    options: ["Coffee", "Water", "Movement", "Music"],
    kaiByOption: [
      "One cup for focus — don't chase the buzz all day.",
      "Bottle visible. Sip between tasks.",
      "Five minutes of movement before the hard thing.",
      "Same playlist for focus — ritual beats random.",
    ],
  },
  {
    prompt: "What would KAI push you on today?",
    options: ["Speed", "Honesty", "Consistency", "Rest"],
    kaiByOption: [
      "Stop polishing. Publish or send before 5.",
      "Admit what you skipped. Then fix one thing.",
      "Same time tomorrow — show up even if output is small.",
      "If you're fried, recovery is the disciplined move.",
    ],
  },
  {
    prompt: "Your evening plan matters because:",
    options: ["Sleep", "Family", "Side project", "Shutdown"],
    kaiByOption: [
      "Screens down 60 minutes before bed. Non-negotiable.",
      "Be present — phone in another room at dinner.",
      "One hour capped on the side project — timer on.",
      "Close the laptop with a written line for tomorrow.",
    ],
  },
  {
    prompt: "Tomorrow-you will thank today-you if:",
    options: ["You ship", "You rest", "You learn", "You connect"],
    kaiByOption: [
      "Ship something small today — tomorrow starts lighter.",
      "Rest stores energy for the week — not lazy, strategic.",
      "One lesson applied beats ten saved bookmarks.",
      "Repair or deepen one bond — compounding trust.",
    ],
  },
  {
    prompt: "One word for how you want to feel tonight:",
    options: ["Proud", "Calm", "Light", "Ready"],
    kaiByOption: [
      "Back it with one visible win you can name.",
      "Cut one stressor — say no or finish one nagging task.",
      "Delete guilt — do one kind thing for future you.",
      "Prep one thing for tomorrow so morning-you smiles.",
    ],
  },
];
