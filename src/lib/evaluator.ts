import type { ErrorRecord, Exercise, RubricCheck } from "../types";

export type TutorResult = {
  message: string;
  errors: Omit<ErrorRecord, "id" | "createdAt">[];
  score: number;
  checks: RubricCheck[];
};

const has = (code: string, pattern: RegExp) => pattern.test(code.toLowerCase());

function inferChecks(exercise: Exercise, code: string): RubricCheck[] {
  const normalized = code.toLowerCase();

  return exercise.rubric.map((label) => {
    const text = label.toLowerCase();
    let ok = true;

    if (text.includes("contador") || text.includes("acumulador")) {
      ok = /:= *0|:= *1/.test(normalized);
    }

    if (text.includes("nil")) {
      ok = /<> *nil|= *nil/.test(normalized);
    }

    if (text.includes("avanza") || text.includes("recorre")) {
      ok = /\bfor\b|\bwhile\b/.test(normalized);
    }

    if (text.includes("puntero") || text.includes("reenlaza")) {
      ok = /\^\.sig|new\s*\(/.test(normalized);
    }

    if (text.includes("mod")) {
      ok = /\bmod\b/.test(normalized);
    }

    if (text.includes("div")) {
      ok = /\bdiv\b/.test(normalized);
    }

    if (text.includes("primera") || text.includes("posicion valida")) {
      ok = /\[\s*1\s*\]/.test(normalized);
    }

    return {
      label,
      status: ok ? "ok" : "review",
    };
  });
}

export function evaluateCode(exercise: Exercise, code: string): TutorResult {
  const normalized = code.toLowerCase();
  const errors: Omit<ErrorRecord, "id" | "createdAt">[] = [];
  let score = 10;

  const addError = (
    kind: ErrorRecord["kind"],
    text: string,
    penalty: number,
  ) => {
    errors.push({ exerciseId: exercise.id, topic: exercise.topic, kind, text });
    score -= penalty;
  };

  if (!has(normalized, /\bbegin\b/) || !has(normalized, /\bend\b/)) {
    addError(
      "sintaxis",
      "Revisa la estructura general: en Pascal los modulos necesitan begin/end bien cerrados.",
      2,
    );
  }

  if (has(normalized, /\bfunction\b/) && !has(normalized, /[a-z0-9_]+ *:=/)) {
    addError(
      "logica",
      "Si es una funcion, revisa que asignes el valor de retorno al nombre de la funcion.",
      2,
    );
  }

  if (exercise.topic.includes("lista") || exercise.topic === "insertar ordenado") {
    if (!has(normalized, /<> *nil|= *nil/)) {
      addError(
        "punteros/listas",
        "En listas suele aparecer una condicion contra nil para saber cuando terminar o insertar.",
        2,
      );
    }

    if (has(normalized, /while/) && !has(normalized, /\:= .*?\^\.sig|:= *[a-z]+\^.sig/)) {
      addError(
        "punteros/listas",
        "Hay un while sobre lista, pero no veo claro el avance del puntero hacia ^.sig.",
        2,
      );
    }
  }

  if (exercise.topic === "insertar ordenado" || exercise.topic === "eliminar nodos") {
    if (!has(normalized, /\bnew\s*\(/) && exercise.topic === "insertar ordenado") {
      addError(
        "punteros/listas",
        "Para insertar un nodo hace falta reservar memoria con new.",
        2,
      );
    }

    if (!has(normalized, /ant/) || !has(normalized, /act/)) {
      addError(
        "logica",
        "Para modificar enlaces conviene ubicar la posicion con dos punteros: anterior y actual.",
        1,
      );
    }
  }

  if (exercise.topic === "vectores" || exercise.topic === "maximos y minimos") {
    if (!has(normalized, /\bfor\b/)) {
      addError(
        "logica",
        "En vectores de dimension fija normalmente conviene recorrer con for.",
        1,
      );
    }
  }

  if (exercise.topic === "suma de digitos") {
    if (!has(normalized, /\bmod\b/) || !has(normalized, /\bdiv\b/)) {
      addError(
        "logica",
        "Para separar digitos en Pascal necesitas combinar mod 10 y div 10.",
        3,
      );
    }
  }

  if (
    exercise.statement.toLowerCase().includes("dos") ||
    exercise.statement.toLowerCase().includes("2 ")
  ) {
    if (!has(normalized, /max1|max2|min1|min2|codmax1|codmax2/)) {
      addError(
        "logica",
        "La consigna pide dos valores destacados. Conviene llevar dos maximos/minimos y sus datos asociados.",
        2,
      );
    }
  }

  if (
    exercise.statement.toLowerCase().includes("suma de digitos") &&
    (!has(normalized, /\bmod\b/) || !has(normalized, /\bdiv\b/))
  ) {
    addError(
      "logica",
      "Cuando aparece suma de digitos, espera un modulo con mod 10 y div 10.",
      2,
    );
  }

  if (
    exercise.statement.toLowerCase().includes("ordenada") &&
    !has(normalized, /insertar|ordenado|ordenada|ant|act/)
  ) {
    addError(
      "logica",
      "La consigna pide mantener orden. Revisa si necesitas insertar ordenado con anterior y actual.",
      2,
    );
  }

  if (
    (exercise.topic === "matrices/tablas" || exercise.statement.toLowerCase().includes("tabla")) &&
    !has(normalized, /\barray\b|for .*to/)
  ) {
    addError(
      "logica",
      "Hay tabla o matriz: deberia verse una estructura array y recorridos por indices.",
      2,
    );
  }

  if (
    exercise.statement.toLowerCase().includes("liber") &&
    !has(normalized, /\bdispose\s*\(/)
  ) {
    addError(
      "punteros/listas",
      "La consigna pide liberar memoria dinamica. Falta o no se ve claro dispose.",
      1,
    );
  }

  const checks = inferChecks(exercise, code);
  const missingChecks = checks.filter((check) => check.status !== "ok").length;
  score -= Math.min(3, missingChecks);

  if (errors.length === 0) {
    return {
      errors,
      checks,
      score: Math.max(1, score),
      message:
        "Viene muy bien. No detecte errores tipicos con las reglas actuales. Ahora proba hacer una traza corta con un caso chico para confirmar la logica.",
    };
  }

  const first = errors[0];
  return {
    errors,
    checks,
    score: Math.max(1, score),
    message: `Te marco primero esto: ${first.text} Antes de tocar todo el codigo, proba corregir solo esa parte y volve a evaluar.`,
  };
}

export function buildExamFeedback(exercise: Exercise, code: string): TutorResult {
  const result = evaluateCode(exercise, code);
  const rubricText = result.checks
    .map((item, index) => {
      const mark = item.status === "ok" ? "OK" : "Revisar";
      return `${index + 1}. [${mark}] ${item.label}`;
    })
    .join("\n");

  return {
    ...result,
    message: `Evaluacion como parcial: ${result.score}/10.\n\nRubrica usada:\n${rubricText}\n\n${result.message}`,
  };
}
