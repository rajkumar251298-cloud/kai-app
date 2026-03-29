/**
 * KAI accountability memory — localStorage (client).
 * Drives openings, home focus gate, and API system context.
 */

export const KAI_MEM_LAST_TASK = "kaiLastTask";
export const KAI_MEM_LAST_COMPLETED = "kaiLastCompleted"; // "1" | "0" | ""
export const KAI_MEM_LAST_EXCUSE = "kaiLastExcuse";
export const KAI_MEM_LAST_WIN = "kaiLastWin";
/** YYYY-MM-DD when user last locked a COMMIT (from KAI reply). */
export const KAI_MEM_COMMITMENT_DATE = "kaiCommitmentDate";

export type KaiMemory = {
  lastTask: string | null;
  lastCompleted: boolean | null;
  lastExcuse: string | null;
  lastWin: string | null;
  commitmentDate: string | null;
};

export function readKaiMemory(): KaiMemory {
  if (typeof window === "undefined") {
    return {
      lastTask: null,
      lastCompleted: null,
      lastExcuse: null,
      lastWin: null,
      commitmentDate: null,
    };
  }
  const task = localStorage.getItem(KAI_MEM_LAST_TASK)?.trim() || null;
  const doneRaw = localStorage.getItem(KAI_MEM_LAST_COMPLETED);
  let lastCompleted: boolean | null = null;
  if (doneRaw === "1") lastCompleted = true;
  else if (doneRaw === "0") lastCompleted = false;
  return {
    lastTask: task,
    lastCompleted,
    lastExcuse: localStorage.getItem(KAI_MEM_LAST_EXCUSE)?.trim() || null,
    lastWin: localStorage.getItem(KAI_MEM_LAST_WIN)?.trim() || null,
    commitmentDate: localStorage.getItem(KAI_MEM_COMMITMENT_DATE)?.trim() || null,
  };
}

export function writeKaiMemory(partial: Partial<KaiMemory>): void {
  if (typeof window === "undefined") return;
  if (partial.lastTask !== undefined) {
    if (partial.lastTask && partial.lastTask.trim())
      localStorage.setItem(KAI_MEM_LAST_TASK, partial.lastTask.trim());
    else localStorage.removeItem(KAI_MEM_LAST_TASK);
  }
  if (partial.lastCompleted !== undefined) {
    if (partial.lastCompleted === true) localStorage.setItem(KAI_MEM_LAST_COMPLETED, "1");
    else if (partial.lastCompleted === false)
      localStorage.setItem(KAI_MEM_LAST_COMPLETED, "0");
    else localStorage.removeItem(KAI_MEM_LAST_COMPLETED);
  }
  if (partial.lastExcuse !== undefined) {
    if (partial.lastExcuse?.trim())
      localStorage.setItem(KAI_MEM_LAST_EXCUSE, partial.lastExcuse.trim());
    else localStorage.removeItem(KAI_MEM_LAST_EXCUSE);
  }
  if (partial.lastWin !== undefined) {
    if (partial.lastWin?.trim())
      localStorage.setItem(KAI_MEM_LAST_WIN, partial.lastWin.trim());
    else localStorage.removeItem(KAI_MEM_LAST_WIN);
  }
  if (partial.commitmentDate !== undefined) {
    if (partial.commitmentDate?.trim())
      localStorage.setItem(KAI_MEM_COMMITMENT_DATE, partial.commitmentDate.trim());
    else localStorage.removeItem(KAI_MEM_COMMITMENT_DATE);
  }
}

/** Serializable snapshot for /api/chat */
export function memoryForApi(): Record<string, string | boolean | null> {
  const m = readKaiMemory();
  return {
    lastTask: m.lastTask,
    lastCompleted: m.lastCompleted,
    lastExcuse: m.lastExcuse,
    lastWin: m.lastWin,
    commitmentDate: m.commitmentDate,
  };
}

export function formatMemoryBlock(m: KaiMemory): string {
  const lines: string[] = [];
  if (m.lastTask) lines.push(`Yesterday's committed task: "${m.lastTask}"`);
  if (m.lastCompleted === true) lines.push("They DID complete that commitment.");
  if (m.lastCompleted === false)
    lines.push("They did NOT complete that commitment.");
  if (m.lastExcuse) lines.push(`Their last excuse: "${m.lastExcuse}"`);
  if (m.lastWin) lines.push(`Their last win: "${m.lastWin}"`);
  if (m.commitmentDate) lines.push(`Commitment locked on: ${m.commitmentDate}`);
  if (lines.length === 0) return "No prior commitment data yet.";
  return lines.join("\n");
}

/** Remove COMMIT/EXCUSE/WIN lines from visible chat text. */
export function stripKaiMachineLines(raw: string): string {
  return raw
    .replace(/^\s*COMMIT:\s*.+$/gim, "")
    .replace(/^\s*EXCUSE:\s*.+$/gim, "")
    .replace(/^\s*WIN:\s*.+$/gim, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Parse assistant reply for machine lines (stripped from visible copy).
 * COMMIT: <task> — today's commitment
 * EXCUSE: <text>
 * WIN: <text>
 */
export function parseAndApplyKaiMemoryFromReply(raw: string): {
  display: string;
  applied: boolean;
} {
  if (typeof window === "undefined") return { display: raw, applied: false };
  let applied = false;

  const commits = [...raw.matchAll(/^\s*COMMIT:\s*(.+)$/gim)];
  const lastCommit = commits.at(-1);
  if (lastCommit?.[1]?.trim()) {
    const task = lastCommit[1].trim();
    const d = new Date();
    const day = d.toISOString().slice(0, 10);
    writeKaiMemory({
      lastTask: task,
      lastCompleted: null,
      commitmentDate: day,
    });
    applied = true;
  }

  const excuses = [...raw.matchAll(/^\s*EXCUSE:\s*(.+)$/gim)];
  const lastExcuse = excuses.at(-1);
  if (lastExcuse?.[1]?.trim()) {
    writeKaiMemory({ lastExcuse: lastExcuse[1].trim() });
    applied = true;
  }

  const wins = [...raw.matchAll(/^\s*WIN:\s*(.+)$/gim)];
  const lastWin = wins.at(-1);
  if (lastWin?.[1]?.trim()) {
    writeKaiMemory({ lastWin: lastWin[1].trim() });
    applied = true;
  }

  const display = stripKaiMachineLines(raw);

  return { display: display || raw.trim(), applied };
}
