import type { Exercise } from "../types";
import { analyzeAttempt, buildExamFeedback, evaluateCode } from "./evaluator";

export type TutorAction = "hint" | "correct" | "trace" | "exam" | "solution";

function listItems(items: string[], empty = "todavia no detecte senales fuertes") {
  if (items.length === 0) return `- ${empty}`;
  return items.map((item) => `- ${item}`).join("\n");
}

function getStageLabel(readiness: ReturnType<typeof analyzeAttempt>["readiness"]) {
  const labels = {
    "sin-intento": "Todavia no hay intento real",
    incompleto: "Hay un esqueleto, falta completar",
    "en-proceso": "Hay intento, pero faltan piezas importantes",
    casi: "Estas cerca, falta ajustar criterios",
    aprobable: "Intento defendible, falta probar con casos",
  };

  return labels[readiness];
}

function getTopicMicroAction(exercise: Exercise) {
  if (exercise.topic.includes("lista") || exercise.topic === "insertar ordenado") {
    return "Dibuja 3 nodos y marca con flechas que valen `ant`, `act` y `act^.sig` antes de tocar enlaces.";
  }

  if (exercise.topic === "matrices/tablas") {
    return "Escribi al lado del codigo que representa fila y que representa columna; despues arma dos `for` bien chicos.";
  }

  if (exercise.topic === "suma de digitos") {
    return "Proba con un numero de 3 cifras y anota en una tablita: numero, digito con `mod 10`, suma, numero con `div 10`.";
  }

  if (exercise.topic === "vectores" || exercise.topic === "maximos y minimos") {
    return "Primero resolvelo con 3 posiciones a mano: inicializacion, comparacion y actualizacion del mejor valor.";
  }

  if (exercise.topic === "recorridos una sola vez") {
    return "Separar carga y procesamiento puede servir, pero lo pedido clave es que el procesamiento principal no repita recorridos innecesarios.";
  }

  return "Antes de escribir mas codigo, defini entrada, proceso y salida en tres renglones concretos.";
}

function buildProgressiveHint(exercise: Exercise, hintsUsed: number, code: string) {
  const analysis = analyzeAttempt(exercise, code);
  const baseHint = exercise.hints[Math.min(hintsUsed, exercise.hints.length - 1)];
  const depth = Math.min(hintsUsed + 1, 3);

  if (analysis.readiness === "sin-intento") {
    return `Pista ${depth}: todavia no veo codigo suficiente para corregir fino. No arranques por Pascal: arranca por el plan.

1. Datos que entran.
2. Recorrido principal.
3. Resultado que sale o estructura que se modifica.

Pista puntual: ${baseHint}

Pregunta del tutor: ${analysis.nextQuestion}`;
  }

  return `Pista ${depth}: no te doy la solucion, te marco el proximo paso mas rentable.

Lectura rapida: ${getStageLabel(analysis.readiness)}.
Bloqueo probable: ${analysis.likelyBlocker}.
Microaccion: ${getTopicMicroAction(exercise)}

Pista puntual: ${baseHint}

Pregunta del tutor: ${analysis.nextQuestion}`;
}

function buildCorrectionReply(exercise: Exercise, code: string) {
  const result = evaluateCode(exercise, code);
  const analysis = analyzeAttempt(exercise, code);
  const pending = result.checks.filter((check) => check.status !== "ok").length;
  const rubric = result.checks
    .map((check) => `${check.status === "ok" ? "OK" : "Revisar"} - ${check.label}`)
    .join("\n");

  return {
    text: `Lectura del intento
${getStageLabel(analysis.readiness)}. Puntaje estimado: ${result.score}/10. Criterios pendientes: ${pending}.

Lo que ya aparece
${listItems(analysis.detectedConcepts)}

Lo que falta o esta flojo
${listItems(analysis.missingSignals, "no veo faltantes grandes, ahora hay que probar casos borde")}

Correccion principal
${result.message}

Rubrica
${rubric}

Siguiente microaccion
${getTopicMicroAction(exercise)}

Pregunta del tutor
${analysis.nextQuestion}`,
    errors: result.errors,
  };
}

function buildTraceReply(exercise: Exercise, code: string) {
  const analysis = analyzeAttempt(exercise, code);

  if (exercise.topic.includes("lista") || exercise.topic === "insertar ordenado") {
    return `Hagamos una traza de lista, bien de parcial.

Caso chico sugerido: 3 nodos. Anota una fila por vuelta:
- vuelta
- dato actual
- anterior
- actual
- accion
- avance

No sigas hasta poder responder esto: ${analysis.nextQuestion}`;
  }

  if (exercise.topic === "suma de digitos") {
    return `Hagamos una traza con un numero chico, por ejemplo 248.

Tabla:
- numero antes
- digito = numero mod 10
- suma acumulada
- numero despues = numero div 10

Si esa tabla no cierra, el codigo tampoco va a cerrar. Pregunta: ${analysis.nextQuestion}`;
  }

  if (exercise.topic === "matrices/tablas") {
    return `Hagamos una traza de matriz/tabla.

Usa una matriz de 2x3 y anota:
- i
- j
- celda usada
- acumulador antes
- acumulador despues
- momento en que reinicias el acumulador

Pregunta clave: ${analysis.nextQuestion}`;
  }

  return `Hagamos una traza chica antes de seguir.

Arma 3 datos y una tabla con:
- vuelta
- dato leido o posicion
- variables importantes antes
- comparacion realizada
- variables despues

Pregunta clave: ${analysis.nextQuestion}`;
}

export function getFreeQuestionReply(exercise: Exercise, code: string, question: string) {
  const result = evaluateCode(exercise, code);
  const analysis = analyzeAttempt(exercise, code);
  const asksForSolution = /solucion|resolverlo completo|codigo completo|dame el codigo/i.test(question);

  if (asksForSolution) {
    return `Puedo mostrarte la solucion solo desde el boton "Solucion", asi queda claro que la pediste explicitamente. Para estudiar mejor, antes te dejo el bloqueo actual: ${analysis.likelyBlocker}.

Pregunta para destrabar: ${analysis.nextQuestion}`;
  }

  return `Te respondo como tutor local avanzado.

Diagnostico corto
${getStageLabel(analysis.readiness)}. Puntaje estimado si entregaras ahora: ${result.score}/10.

Sobre tu pregunta
${question}

Mi lectura: el punto mas importante ahora es "${analysis.likelyBlocker}". Si corregis eso, despues revisamos la rubrica fina.

Senales que veo
${listItems(analysis.detectedConcepts)}

Proximo paso
${getTopicMicroAction(exercise)}

Pregunta para vos
${analysis.nextQuestion}`;
}

export function getTutorReply(
  action: TutorAction,
  exercise: Exercise,
  code: string,
  hintsUsed: number,
) {
  if (action === "hint") {
    return {
      text: buildProgressiveHint(exercise, hintsUsed, code),
      errors: [],
    };
  }

  if (action === "correct") {
    return buildCorrectionReply(exercise, code);
  }

  if (action === "exam") {
    const result = buildExamFeedback(exercise, code);
    const analysis = analyzeAttempt(exercise, code);
    return {
      text: `${result.message}

Lectura de tutor
${getStageLabel(analysis.readiness)}.
Bloqueo principal: ${analysis.likelyBlocker}.
Si esto fuera parcial, antes de entregar revisaria: ${analysis.missingSignals.slice(0, 3).join(", ") || "casos borde y prueba de escritorio"}.

Pregunta final de defensa oral
${analysis.nextQuestion}`,
      errors: result.errors,
    };
  }

  if (action === "trace") {
    return {
      text: buildTraceReply(exercise, code),
      errors: [],
    };
  }

  return {
    text: `Solucion referencial, recien ahora porque la pediste explicitamente:\n\n${exercise.referenceSolution}`,
    errors: [],
  };
}
