import type { ErrorRecord, ExamAttempt } from "../types";

export type StudyStats = {
  xp: number;
  dailyXp: number;
  streak: number;
  hearts: number;
  gems: number;
  completedLessons: string[];
  lastStudyDate: string | null;
};

const codeKey = (exerciseId: string) => `p1unlp:code:${exerciseId}`;
const traceKey = (exerciseId: string) => `p1unlp:trace:${exerciseId}`;
const historyKey = "p1unlp:error-history";
const attemptsKey = "p1unlp:exam-attempts";
const statsKey = "p1unlp:study-stats";

const defaultStats: StudyStats = {
  xp: 0,
  dailyXp: 0,
  streak: 0,
  hearts: 5,
  gems: 0,
  completedLessons: [],
  lastStudyDate: null,
};

export function loadCode(exerciseId: string, fallback: string) {
  return localStorage.getItem(codeKey(exerciseId)) ?? fallback;
}

export function saveCode(exerciseId: string, code: string) {
  localStorage.setItem(codeKey(exerciseId), code);
}

export function resetCode(exerciseId: string) {
  localStorage.removeItem(codeKey(exerciseId));
}

export function loadTrace(exerciseId: string) {
  const raw = localStorage.getItem(traceKey(exerciseId));
  if (!raw) return null;

  try {
    return JSON.parse(raw) as { dato: string; acum: string; puntero: string }[];
  } catch {
    return null;
  }
}

export function saveTrace(
  exerciseId: string,
  rows: { dato: string; acum: string; puntero: string }[],
) {
  localStorage.setItem(traceKey(exerciseId), JSON.stringify(rows));
}

export function loadHistory(): ErrorRecord[] {
  const raw = localStorage.getItem(historyKey);
  if (!raw) return [];

  try {
    return JSON.parse(raw) as ErrorRecord[];
  } catch {
    return [];
  }
}

export function saveErrors(errors: Omit<ErrorRecord, "id" | "createdAt">[]) {
  if (errors.length === 0) return [];

  const previous = loadHistory();
  const created = errors.map((error) => ({
    ...error,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  }));
  const next = [...created, ...previous].slice(0, 80);

  localStorage.setItem(historyKey, JSON.stringify(next));
  return next;
}

export function loadAttempts(): ExamAttempt[] {
  const raw = localStorage.getItem(attemptsKey);
  if (!raw) return [];

  try {
    return JSON.parse(raw) as ExamAttempt[];
  } catch {
    return [];
  }
}

export function saveAttempt(attempt: Omit<ExamAttempt, "id" | "createdAt">) {
  const previous = loadAttempts();
  const next = [
    {
      ...attempt,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    },
    ...previous,
  ].slice(0, 60);

  localStorage.setItem(attemptsKey, JSON.stringify(next));
  return next;
}

export function loadStudyStats(): StudyStats {
  const raw = localStorage.getItem(statsKey);
  if (!raw) return defaultStats;

  try {
    return { ...defaultStats, ...(JSON.parse(raw) as Partial<StudyStats>) };
  } catch {
    return defaultStats;
  }
}

export function saveStudyStats(stats: StudyStats) {
  localStorage.setItem(statsKey, JSON.stringify(stats));
  return stats;
}

export function clearStudyData() {
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith("p1unlp:code:") || key.startsWith("p1unlp:trace:")) {
      localStorage.removeItem(key);
    }
  });
  localStorage.removeItem(historyKey);
  localStorage.removeItem(attemptsKey);
  localStorage.removeItem(statsKey);
}

export function clearGeminiKey() {
  localStorage.removeItem("p1unlp:gemini-key");
}

export function exportTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
