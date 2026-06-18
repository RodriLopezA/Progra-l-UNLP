import type { Exercise } from "../types";
import { buildExamFeedback, evaluateCode } from "./evaluator";

export type TutorAction = "hint" | "correct" | "trace" | "exam" | "solution";

export function getTutorReply(
  action: TutorAction,
  exercise: Exercise,
  code: string,
  hintsUsed: number,
) {
  if (action === "hint") {
    const hint = exercise.hints[Math.min(hintsUsed, exercise.hints.length - 1)];
    return {
      text: `Te doy una pista, sin resolverlo completo: ${hint}`,
      errors: [],
    };
  }

  if (action === "correct") {
    const result = evaluateCode(exercise, code);
    const pending = result.checks.filter((check) => check.status !== "ok").length;
    return {
      text: `Analice tu intento como tutor.\n\nPuntaje estimado: ${result.score}/10\nCriterios pendientes: ${pending}\n\n${result.message}`,
      errors: result.errors,
    };
  }

  if (action === "exam") {
    const result = buildExamFeedback(exercise, code);
    return { text: result.message, errors: result.errors };
  }

  if (action === "trace") {
    return {
      text:
        "Hagamos una traza chica. Elegi un caso de 3 datos y anota como cambian las variables importantes en cada vuelta. Si es lista, mira dato actual y avance del puntero. Si es vector, mira indice, minimo/acumulador y resultado parcial.",
      errors: [],
    };
  }

  return {
    text: `Solucion referencial, recien ahora porque la pediste explicitamente:\n\n${exercise.referenceSolution}`,
    errors: [],
  };
}
