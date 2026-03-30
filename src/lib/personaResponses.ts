/**
 * Canned emotional replies — each follows: ACKNOWLEDGE → MOTIVATE → REDIRECT → ASK (one sentence each).
 */

export const personaResponses = {
  parent: {
    demotivated_high: [
      `That feeling is completely valid kanna — and I am proud of you for being honest about it instead of hiding it. Every person who has ever built something worthwhile has sat exactly where you are sitting right now — this is not the end of the story. So let us not waste today on yesterday — today is a fresh page. Tell me honestly — what is the one thing that if you got it done today would make you feel proud of yourself tonight?`,
      `Oh kanna, I hear how heavy this feels — and it matters that you told me instead of carrying it alone. You are not your worst day; you are someone brave enough to keep showing up, and that already separates you from people who quit quietly. Let us put the guilt down for a moment and look at what is possible before bedtime. What happened in the last day or two that made this feel impossible — walk me through the real version?`,
      `Listen — that pain you are feeling means this goal still matters to you, and that is not nothing. I have seen you push through before, and nothing about today erases who you are underneath the spiral. We are not fixing your whole life in one chat — we are choosing one gentle step forward. What is the smallest thing you could do in the next hour that would make tonight feel a little lighter?`,
    ],
    demotivated_medium: [
      `It did not get done — okay — and I am glad you said it out loud instead of pretending. Not giving up looks like exactly this: you are still here, still talking, still in the fight. Today does not need to be perfect — it needs to be honest and one notch better than yesterday. What specifically got in the way kanna — was it time, energy, clarity, or something else entirely?`,
      `I am not going to sugar-coat it if it did not happen — I love you enough to keep it real. You tried something hard, and something in the day got in your way, and we figure that out together, always. Let us not replay the whole movie — let us change one scene for today. When you look back at yesterday honestly, where did the plan first start to slip?`,
    ],
    demotivated_low: [
      `Yesterday was rough — that is allowed, and it does not erase who you are. One quiet day does not cancel your track record of trying, and I still believe in the person underneath the slip. Let us make today about one clear win, not about making up for everything. What is the smallest version of your commitment you could still nail before the day ends?`,
    ],
    winning: [
      `You did exactly what you said you would — that is not small, that is everything, and I mean that. Most people break promises to themselves first — you just proved you are not most people, and that kind of integrity compounds. Now let us build on that momentum before the feeling fades. What is the ONE thing today that would feel like an even bigger win than yesterday?`,
      `See — I knew you had this in you, even when you doubt yourself. That win is proof you can show up for you, not just for other people’s expectations. So let us ride this wave instead of letting it disappear into the next busy day. What made today different from the days you did not get it done — what can we repeat tomorrow?`,
    ],
    anxious: [
      `Hey — I can hear how full your head feels right now, and that is exhausting even if you look fine on the outside. You do not have to carry every worry at once — courage sometimes looks like admitting it is too much. We are going to shrink the mountain to one step, not climb it in your mind. If you could only protect ONE outcome today — what would actually matter most tonight when you look back?`,
    ],
    confused: [
      `It is okay not to have the map yet — confusion usually means you are asking better questions, not that you are behind. You do not need total clarity to take one honest step; you need enough light for the next foot forward. Let us anchor on what you already know is true, even if it feels small. What do you know for certain right now about what you want — even one sentence?`,
    ],
  },

  friend: {
    demotivated_high: [
      `Okay I hear you — that genuinely sucks and I am not going to pretend it does not. But you texted me instead of disappearing, which means part of you still wants this — and that part is worth listening to. So let us get you unstuck right now, not tomorrow when you feel “ready.” Tell me exactly what happened — not the nice version, the real version — where did it go wrong?`,
      `Real talk — you are being brutal to yourself in a way you would never let me be to you. You are not a label; you are a human having a brutal stretch, and that is a different thing. I am not leaving you in this loop — we are moving, even if it is messy. What is the story you are telling yourself about why you failed — and what if that story is not the full truth?`,
    ],
    demotivated_medium: [
      `Okay so it did not happen — that sucks, and I am not going to fake-cheer you past the sting. You are still here though, which means you have not quit — you just had a miss, and misses are data. Let us trade shame for a plan that fits the real day you had. What actually blocked you — time, energy, fear, or something you have not named yet?`,
      `Thank you for telling me the truth — I would rather have the messy version than the polite one. Something got in the way, and we are not doing a guilt trip — we are doing a post-game review like adults. So let us look forward, not backward, for the next play. When you replay yesterday, what is the one moment you would change if you could — and what would you do differently?`,
    ],
    demotivated_low: [
      `Yesterday happened — we move on; that is the deal between us. One off day does not get to rewrite your whole story unless you let it. Let us pick one comeback move — not a hero montage, just one solid play. What is the ONE thing that would make today feel like you got your power back?`,
    ],
    winning: [
      `YESSS — you actually did the thing, and I am genuinely hyped for you, not performative hyped. That is what showing up for yourself looks like, and it counts even if nobody clapped. Now let us turn a good day into a streak instead of a one-hit wonder. What is the next domino — what win would make tomorrow feel even better than today?`,
      `Okay pause — we are celebrating this for a second because you earned it. You kept your word to yourself, and that is rarer than people admit. Let us bottle that energy instead of rushing past it. What part of today’s win do you want to build on first — skill, focus, or consistency?`,
    ],
    anxious: [
      `Breathe — I have got you; you do not have to solve the whole week in your head before lunch. Overwhelm is loud, but it is not the same thing as truth — it is just everything hitting at once. Let us steal one win back from the noise before it steals your whole day. What is the one thing on your mind that is truly non-negotiable today — and what could wait without the world ending?`,
    ],
    confused: [
      `Totally fine to be lost — half of life is wandering with better questions. You do not need the perfect plan; you need a direction that fits who you are right now. Let us start stupidly small instead of brilliantly stuck. What feels even slightly true about what you want next — even if you cannot explain the whole path yet?`,
    ],
  },

  coach: {
    demotivated_high: [
      `Heard — you are in a slump, and I am not going to pretend that is not real. High performers sit here too — the ones who break through are the ones who move before the motivation shows up. We are not negotiating with the feeling today; we are executing one small rep. What is the smallest version of your goal you could complete in the next 30 minutes — right now, no excuses?`,
      `I see the frustration — and we are not ignoring it, but we are also not camping in it. Champions feel this; difference is they shorten the gap between feeling stuck and taking one action. Today is not about being inspired — it is about being in motion. What is one concrete move — five minutes or less — that would make today a win on paper?`,
    ],
    demotivated_medium: [
      `Not done — okay; that is information, not a verdict on your character. Something in the system broke — schedule, clarity, energy — and we fix systems, not shame people. Let us name the leak so we can patch it and run again. What specifically failed yesterday — the plan, the follow-through, or the conditions you were working in?`,
      `Straight talk: missed reps happen — what matters is what you do in the next twenty-four hours. I am not interested in guilt; I am interested in the adjustment that makes the next attempt land. Let us treat this like film review, not a funeral. Where did execution break down first — the start, the middle, or the finish?`,
    ],
    demotivated_low: [
      `Yesterday is data — not a label — and we use data to adjust, not to spiral. One quiet day does not erase your standards unless you let it become two. Let us reset the scoreboard and pick one non-negotiable action for today. What needs to be different in the next attempt — time block, environment, or task size?`,
    ],
    winning: [
      `That is execution — talkers talk, and you just delivered; own that. You proved you can hold the standard when it counts — now we protect the standard instead of coasting. Momentum is a habit, not a mood — so we stack the next win on purpose. What is today’s commitment that would make this week undeniable?`,
    ],
    anxious: [
      `Overwhelm means you are trying to win ten games at once — pick one scoreboard. Pressure is real, but scattered effort is how good people burn out slow. We narrow the field, we execute, then we expand — not the other way around. What is the single highest-leverage task if you could only nail one thing today?`,
    ],
    confused: [
      `Unclear means we zoom out before we sprint in the wrong direction. Forget the task list for a second — what does winning look like by Friday if we are honest? Once the target is sharp, the steps get obvious. What is the outcome you are actually chasing this week — say it in one plain sentence?`,
    ],
  },

  mentor: {
    demotivated_high: [
      `What you are feeling is information — it is not the final chapter, even if it reads like one tonight. Everyone who builds something meaningful has seasons where the work feels heavier than the dream. Let us treat this as data about pace, not proof about worth. When you look at what happened with compassion, what do you think it is really telling you needs to change?`,
      `This sounds like more than a bad mood — it sounds like something in you is asking for a different approach. Wisdom is not never falling; it is learning to read the fall without turning it into identity. Let us separate the signal from the shame for a moment. What part of this struggle feels new — and what part is an old pattern showing up again?`,
    ],
    demotivated_medium: [
      `In my experience, the gap between intention and action is rarely about talent — it is usually clarity, energy, or environment, and each needs a different fix. You are not broken; you are human, and humans misalign with their systems sometimes. Let us get curious instead of punitive about yesterday. Was the blocker that you did not know what to do — or that you knew and still could not start?`,
      `A miss is a moment — patterns are what define a path, and you are early enough to steer. The question is whether yesterday was a one-off collision or a sign the plan needs a gentler shape. Let us choose curiosity over catastrophizing. What would “sustainable progress” look like this week if you were allowed to be imperfect but consistent?`,
    ],
    demotivated_low: [
      `One day does not define a journey — it can refine it if you let it. What matters is whether you learn something true about your limits and your levers. Let us turn yesterday into a lesson without dragging it into tomorrow’s identity. What would need to be true today for this to feel like a step forward — even a small one?`,
    ],
    winning: [
      `This is what consistent action looks like in the wild — proof stacking on proof until belief catches up. You are building evidence that you keep promises to yourself, and that compounds faster than motivation ever could. Now we protect the trajectory instead of getting casual. What is the next layer of the goal that this win unlocks — skill, habit, or confidence?`,
    ],
    anxious: [
      `When the mind is crowded, the first move is not more effort — it is making space to see what actually matters. Overwhelm often means you are carrying decisions that are not all yours to make today. Let us simplify until the path is visible again. If you could only protect one outcome this week, what would still matter a year from now?`,
    ],
    confused: [
      `Confusion is not the opposite of wisdom — it is often the hallway before clarity, if you do not panic in the hallway. You do not need every answer; you need the next true step. Let us anchor on something solid and build outward. What do you know for certain right now — even one fact — about what you want or what you refuse to keep living?`,
    ],
  },

  advisor: {
    demotivated_high: [
      `Understood — you are not where you wanted to be, and naming that clearly is already a rational move. A setback only becomes a failure if you draw the wrong conclusion from it — and “I cannot do this” is usually the wrong conclusion. The more useful read is that something in the approach or conditions needs adjustment. Walk me through what happened in order — what was the first domino that made the rest fall?`,
      `I hear the weight in this — and I also know that feelings are data, not the whole dataset. Let us separate the emotional hit from the operational facts so we can fix what is fixable. We are looking for root cause, not a character verdict. What changed in your environment, energy, or priorities right before this slid off track?`,
    ],
    demotivated_medium: [
      `Fact: the output did not happen — now we diagnose without drama. Missed execution usually maps to one of a few buckets: priority, time, energy, or clarity — and the fix depends on which bucket it is. Let us be precise so we do not waste effort on the wrong lever. Which of those four felt like the primary constraint yesterday — and what evidence supports that?`,
      `Let us treat this like an audit, not a trial — audits find leaks; trials assign blame. If we can name the constraint accurately, we can change one variable and measure the result. I want the simplest explanation that fits the facts. Was the issue the task definition, the schedule, your focus, or something external you did not control?`,
    ],
    demotivated_low: [
      `One missed task is a data point about the system — timing, scope, or environment — not a referendum on you. The goal now is a clean adjustment, not a spiral. Let us pick the smallest change with the highest probability of success. What is one variable you are willing to change today — start time, task size, or accountability check-in?`,
    ],
    winning: [
      `Good — commitment met; that is the baseline standard we are building from, not a lucky exception. Outputs like this are how you turn goals into track records instead of intentions. Now we allocate the next unit of effort where leverage is highest. What is the highest-value move still open this week — the one that shifts the goal measurably?`,
    ],
    anxious: [
      `Let us bring structure to the overload — list noise is real, but it is solvable with prioritization rules. Not everything that feels urgent is important — and treating it that way is how smart people burn time. We want the smallest set of decisions that clears the board. If you ranked what is on your mind by impact, what sits in the top slot — and what is secretly just noise wearing a siren?`,
    ],
    confused: [
      `Lack of clarity is a solvable problem — it starts by anchoring the goal and working backward with constraints. If the destination is fuzzy, every step feels like debate — so we sharpen the destination first. Let us make one thing explicit before we argue about tactics. Where do you want to be in thirty days — and what has to be true by the end of this week to make that plausible?`,
    ],
  },

  teammate: {
    demotivated_high: [
      `Yeah that was a tough one — I felt it too, and we are in this together, not you alone on an island. The fact that you are back today means we are not done — not even close — and I still believe in this team. So let us regroup and run another play instead of replaying the loss. What do you need from me today so the next step feels lighter — describe it in your own words?`,
      `I am right here — your rough day is not invisible to me, and we do not do fake positivity on this team. What hurts is real — and what you do next still matters more than the stumble. Let us turn “I fell” into “here is how we stand up” without shame theater. What would help you most in the next hour — a smaller target, a time block together, or talking through the fear out loud?`,
    ],
    demotivated_medium: [
      `It did not happen — I get it, and I am not going to act like that is nothing. We do not leave each other face-down though — that is the teammate deal — we get up and adjust the plan. Let us make today about honesty and one clean rep forward. What got in the way yesterday — and what would make today feel doable even if you are not at 100 percent?`,
      `Thanks for saying it straight — I would rather know the real story than get the highlight reel. Misses happen; quitting quietly is what we do not do together. Let us fix the next attempt so it fits the real life you are living, not the fantasy calendar. Where did it actually fall apart — morning energy, distraction, or something you have not said out loud yet?`,
    ],
    demotivated_low: [
      `Okay — yesterday was a miss; today we make up ground together, simple as that. I am not keeping score like an enemy; I am keeping pace like a partner. One honest step forward beats a perfect plan you never touch. What is the plan for the next few hours — what is the one thing we lock in?`,
    ],
    winning: [
      `LETS GO — that is what I am talking about; we are doing this. You got it done, and I am buzzing because your win is our momentum, not a solo trophy. Now we keep the chain moving before the world distracts you. What is the next thing we tackle together so this does not stop at one good day?`,
    ],
    anxious: [
      `Okay — too much at once; I know that feeling, and we are going to split the load, not carry it all in your head. You do not have to be heroic today — you have to be clear about the next step. I am in your corner, not judging from the sidelines. Which single task would take the most pressure off if it were handled — and what would “handled” look like in plain terms?`,
    ],
    confused: [
      `Not sure where to start — fine; we pick something and move, because motion beats standing still in your head. Done beats perfect, and we can adjust course once we have real feedback. I am with you on the try — not on the overthinking loop. What feels even slightly right to start with — and what would make starting feel less heavy?`,
    ],
  },
} as const;
