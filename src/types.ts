export type ExerciseTopic =
  | "records"
  | "listas simples"
  | "listas doblemente enlazadas"
  | "vectores"
  | "matrices/tablas"
  | "recorridos de lista"
  | "insertar ordenado"
  | "eliminar nodos"
  | "maximos y minimos"
  | "suma de digitos"
  | "recorridos una sola vez";

export type Exercise = {
  id: string;
  topic: ExerciseTopic;
  title: string;
  source: string;
  level: "inicial" | "parcial" | "desafio";
  exam?: string;
  minutes?: number;
  statement: string;
  starterCode: string;
  hints: string[];
  rubric: string[];
  referenceSolution: string;
};

export type ChatMessage = {
  id: string;
  role: "student" | "tutor";
  text: string;
};

export type ErrorRecord = {
  id: string;
  exerciseId: string;
  topic: ExerciseTopic;
  kind: "sintaxis" | "logica" | "punteros/listas" | "repaso";
  text: string;
  createdAt: string;
};

export type RubricCheck = {
  label: string;
  status: "ok" | "review" | "missing";
};

export type ExamAttempt = {
  id: string;
  exerciseId: string;
  score: number;
  durationSeconds: number;
  hintsUsed: number;
  createdAt: string;
};
