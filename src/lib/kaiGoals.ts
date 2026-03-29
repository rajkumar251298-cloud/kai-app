/** User goals — localStorage (client-only). */

export type KaiGoal = { id: string; text: string };

const KAI_GOALS_KEY = "kaiGoals";
const LEGACY_MAIN_GOAL = "mainGoal";

function newId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function loadGoals(): KaiGoal[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KAI_GOALS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) {
        return parsed
          .filter(
            (g): g is KaiGoal =>
              g &&
              typeof g === "object" &&
              typeof (g as KaiGoal).id === "string" &&
              typeof (g as KaiGoal).text === "string",
          )
          .map((g) => ({ id: g.id, text: g.text.trim() }))
          .filter((g) => g.text.length > 0);
      }
    }
    const legacy = localStorage.getItem(LEGACY_MAIN_GOAL)?.trim();
    if (legacy) {
      const migrated: KaiGoal[] = [{ id: "legacy-main-goal", text: legacy }];
      localStorage.setItem(KAI_GOALS_KEY, JSON.stringify(migrated));
      return migrated;
    }
  } catch {
    /* ignore */
  }
  return [];
}

export function saveGoals(goals: KaiGoal[]): void {
  localStorage.setItem(KAI_GOALS_KEY, JSON.stringify(goals));
}

export function addGoal(text: string): KaiGoal {
  const g: KaiGoal = { id: newId(), text: text.trim() };
  const list = loadGoals();
  list.push(g);
  saveGoals(list);
  return g;
}

export function updateGoal(id: string, text: string): void {
  const list = loadGoals().map((g) =>
    g.id === id ? { ...g, text: text.trim() } : g,
  );
  saveGoals(list);
}

export function removeGoal(id: string): void {
  saveGoals(loadGoals().filter((g) => g.id !== id));
}
