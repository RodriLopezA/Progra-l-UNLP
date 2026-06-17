export type ExamKind = "actual" | "viejo" | "practica";

export type ExamInfo = {
  name: string;
  kind: ExamKind;
  label: string;
  description: string;
  expectedExercises: number;
  priority: number;
};

export const examCatalog: ExamInfo[] = [
  {
    name: "Parcial AFA 2024",
    kind: "actual",
    label: "Actual - 2 ejercicios",
    description: "Formato nuevo: ejercicio integrador + analisis de lista doble.",
    expectedExercises: 2,
    priority: 1,
  },
  {
    name: "Parcial Twitch 2024",
    kind: "actual",
    label: "Actual - 2 ejercicios",
    description: "Formato nuevo: ejercicio integrador + completar lista doble.",
    expectedExercises: 2,
    priority: 2,
  },
  {
    name: "Parcial figuritas 2026",
    kind: "actual",
    label: "Actual - 2 ejercicios",
    description: "Formato nuevo: album/matriz + analisis de lista doble.",
    expectedExercises: 2,
    priority: 3,
  },
  {
    name: "Parcial cines",
    kind: "viejo",
    label: "Viejo - 1 ejercicio",
    description: "Parcial viejo de un ejercicio integrador.",
    expectedExercises: 1,
    priority: 20,
  },
  {
    name: "Parcial handball",
    kind: "viejo",
    label: "Viejo - 1 ejercicio",
    description: "Parcial viejo de un ejercicio integrador.",
    expectedExercises: 1,
    priority: 21,
  },
  {
    name: "Parcial hoteles",
    kind: "viejo",
    label: "Viejo - 1 ejercicio",
    description: "Parcial viejo de un ejercicio integrador.",
    expectedExercises: 1,
    priority: 22,
  },
];

const fallback: ExamInfo = {
  name: "Practica",
  kind: "practica",
  label: "Practica",
  description: "Ejercicio de entrenamiento, no parcial real.",
  expectedExercises: 1,
  priority: 99,
};

export function getExamInfo(name?: string): ExamInfo {
  if (!name) return fallback;
  return examCatalog.find((exam) => exam.name === name) ?? { ...fallback, name };
}

export function sortExamNames(names: string[]) {
  return [...names].sort((a, b) => {
    const examA = getExamInfo(a);
    const examB = getExamInfo(b);
    return examA.priority - examB.priority || a.localeCompare(b);
  });
}
