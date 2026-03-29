"use client";

import {
  addPoints,
  habitQuizPointsAlreadyAwarded,
  KAI_HABIT_PROFILE_KEY,
  markHabitQuizPointsAwarded,
} from "@/lib/kaiPoints";
import { useCallback, useMemo, useState } from "react";

type Q = { id: string; text: string; options: string[] };

const QUESTIONS: Q[] = [
  {
    id: "q1",
    text: "What time do you naturally wake up without an alarm?",
    options: ["Before 6am", "6–7am", "7–8am", "After 8am"],
  },
  {
    id: "q2",
    text: "What does your first 30 minutes look like most mornings?",
    options: ["Phone scroll", "Exercise", "Work immediately", "Slow breakfast"],
  },
  {
    id: "q3",
    text: "When are you most productive?",
    options: ["Early morning", "Mid morning", "Afternoon", "Night owl"],
  },
  {
    id: "q4",
    text: "How do you usually set goals?",
    options: [
      "Write them down",
      "Keep in my head",
      "Tell someone",
      "Make a vision board",
    ],
  },
  {
    id: "q5",
    text: "When you miss a goal deadline, what do you do?",
    options: [
      "Reset and keep going",
      "Feel bad for days",
      "Pretend it didn't happen",
      "Analyse what went wrong",
    ],
  },
  {
    id: "q6",
    text: "What motivates you most?",
    options: [
      "Fear of failure",
      "Desire for success",
      "Proving others wrong",
      "Personal satisfaction",
    ],
  },
  {
    id: "q7",
    text: "When you're overwhelmed, you usually:",
    options: ["Push harder", "Shut down", "Ask for help", "Take a break"],
  },
  {
    id: "q8",
    text: "Your biggest productivity killer is:",
    options: [
      "Social media",
      "Overthinking",
      "Lack of energy",
      "Too many meetings",
    ],
  },
  {
    id: "q9",
    text: "When someone challenges your goal, you feel:",
    options: [
      "More motivated",
      "Defensive",
      "Doubtful",
      "Grateful for feedback",
    ],
  },
];

type Archetype = {
  key: string;
  title: string;
  body: string;
};

function detectArchetype(answers: number[]): Archetype {
  const q1 = answers[0];
  const q3 = answers[2];
  const q4 = answers[3];
  const q6 = answers[5];
  const q7 = answers[6];
  const q8 = answers[7];

  const nightOwl = q1 === 3 || q3 === 3;
  const headGoals = q4 === 1;
  const shutdown = q7 === 1;
  if (nightOwl && headGoals && shutdown) {
    return {
      key: "silent_striver",
      title: "The Silent Striver",
      body: "You work best alone and under pressure. KAI will push you at night, not only in the morning.",
    };
  }

  const early = q1 !== undefined && q1 <= 1;
  const writesDown = q4 === 0;
  const pushes = q7 === 0;
  if (early && writesDown && pushes) {
    return {
      key: "disciplined_driver",
      title: "The Disciplined Driver",
      body: "You have the habits. KAI will make sure you stay consistent.",
    };
  }

  const afternoon = q3 === 2;
  const fearFail = q6 === 0;
  const overthink = q8 === 1;
  if (afternoon && fearFail && overthink) {
    return {
      key: "careful_climber",
      title: "The Careful Climber",
      body: "You think before you act. KAI will help you stop overthinking and start moving.",
    };
  }

  return {
    key: "adaptable_achiever",
    title: "The Adaptable Achiever",
    body: "You're flexible and that's a strength. KAI will keep you anchored to what matters.",
  };
}

function buildInsights(answers: number[], arch: Archetype): string[] {
  const i: string[] = [];
  const q3 = answers[2];
  if (q3 === 3)
    i.push("Peak energy looks late — schedule deep work when you actually feel sharp.");
  else if (q3 === 0)
    i.push("Early wins matter to you — protect the first 90 minutes of the day.");
  const q4 = answers[3];
  if (q4 === 1)
    i.push("Writing goals down for 60 seconds can double follow-through — try it this week.");
  const q7 = answers[6];
  if (q7 === 1)
    i.push("When overwhelm hits, a 10-minute walk beats grinding — KAI will remind you.");
  if (i.length < 3) {
    i.push(
      arch.key === "disciplined_driver"
        ? "Consistency is your edge — small daily reps beat sporadic sprints."
        : "Honest answers like these let KAI tune nudges to your real patterns.",
    );
  }
  if (i.length < 3) {
    i.push("Revisit this quiz after 30 days — patterns shift as you grow.");
  }
  return i.slice(0, 3);
}

type Props = { onPoints?: () => void };

export function HabitQuizTab({ onPoints }: Props) {
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const [saved, setSaved] = useState(false);
  const [quizPointsDone] = useState(() => habitQuizPointsAlreadyAwarded());

  const q = QUESTIONS[idx];
  const arch = useMemo(
    () => (done ? detectArchetype(answers) : null),
    [done, answers],
  );
  const insights = useMemo(
    () => (done && arch ? buildInsights(answers, arch) : []),
    [done, answers, arch],
  );

  const pick = (optionIndex: number) => {
    setSelected(optionIndex);
  };

  const next = () => {
    if (selected === null) return;
    const nextAnswers = [...answers, selected];
    setAnswers(nextAnswers);
    setSelected(null);
    if (idx >= QUESTIONS.length - 1) {
      setDone(true);
    } else {
      setIdx((i) => i + 1);
    }
  };

  const back = () => {
    if (idx === 0) return;
    const newIdx = idx - 1;
    setAnswers((a) => a.slice(0, newIdx));
    setIdx(newIdx);
    setSelected(answers[newIdx] ?? null);
  };

  const saveProfile = useCallback(() => {
    if (!arch) return;
    const payload = {
      type: arch.key,
      title: arch.title,
      savedAt: new Date().toISOString(),
      answers,
      insights,
    };
    localStorage.setItem(KAI_HABIT_PROFILE_KEY, JSON.stringify(payload));
    if (!habitQuizPointsAlreadyAwarded()) {
      markHabitQuizPointsAwarded();
      addPoints(50);
      onPoints?.();
    }
    setSaved(true);
  }, [arch, answers, insights, onPoints]);

  if (done && arch) {
    return (
      <div className="space-y-6">
        <div className="kai-card p-5">
          <h2 className="kai-heading text-lg font-semibold tracking-[0.05em]">
            {arch.title}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[#E8DCC8]">
            {arch.body}
          </p>
          <ul className="mt-4 space-y-2 text-sm text-[#E8DCC8]/85">
            {insights.map((line, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-[#C9A84C]">•</span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={saveProfile}
            disabled={saved}
            className="kai-btn-shimmer mt-6 w-full rounded-xl border border-[rgba(201,168,76,0.45)] bg-gradient-to-br from-[#C9A84C] to-[#F5E6B3] py-3 text-sm font-semibold text-black/90 disabled:opacity-50"
          >
            {saved ? "Saved" : "Save my profile"}
          </button>
          {saved && (
            <p className="mt-3 text-center text-xs text-[#C9A84C]/90">
              +50 streak points · KAI will reference this on your home screen.
            </p>
          )}
          {!saved && quizPointsDone && (
            <p className="mt-3 text-center text-xs text-[#E8DCC8]/55">
              Quiz bonus was already claimed earlier.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="kai-card p-5">
        <h2 className="kai-heading text-lg font-semibold tracking-[0.05em]">
          Know Your Patterns
        </h2>
        <p className="mt-1 text-sm text-[#E8DCC8]/75">
          KAI learns how to coach you better when you answer honestly.
        </p>
        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.08]">
          <div
            className="kai-progress-inner h-full rounded-full bg-gradient-to-r from-[#5c4a22] via-[#C9A84C] to-[#F5E6B3]"
            style={{ width: `${((idx + 1) / QUESTIONS.length) * 100}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-[#E8DCC8]/50">
          {idx + 1} / {QUESTIONS.length}
        </p>
      </div>

      <div className="kai-card p-5">
        <p className="text-[15px] leading-snug text-[#F5F0E8]">{q.text}</p>
        <div className="mt-4 space-y-2">
          {q.options.map((opt, i) => (
            <button
              key={opt}
              type="button"
              onClick={() => pick(i)}
              className={`kai-btn-shimmer w-full rounded-xl border px-4 py-3 text-left text-sm transition ${
                selected === i
                  ? "border-[rgba(201,168,76,0.55)] bg-[rgba(201,168,76,0.1)] text-[#F5E6B3]"
                  : "border-[rgba(201,168,76,0.25)] bg-black text-[#E8DCC8]"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={back}
            disabled={idx === 0}
            className="rounded-xl border border-[rgba(201,168,76,0.25)] bg-black px-4 py-2.5 text-sm text-[#E8DCC8] disabled:opacity-30"
          >
            Back
          </button>
          <button
            type="button"
            onClick={next}
            disabled={selected === null}
            className="kai-btn-shimmer ml-auto rounded-xl border border-[rgba(201,168,76,0.45)] bg-black px-6 py-2.5 text-sm font-medium text-[#C9A84C] disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
