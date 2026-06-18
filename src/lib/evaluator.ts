import type { ErrorRecord, Exercise, RubricCheck } from "../types";

export type TutorResult = {
  message: string;
  errors: Omit<ErrorRecord, "id" | "createdAt">[];
  score: number;
  checks: RubricCheck[];
};

export type AttemptAnalysis = {
  hasEnoughCode: boolean;
  hasPlaceholders: boolean;
  statements: number;
  assignments: number;
  detectedConcepts: string[];
  missingSignals: string[];
  likelyBlocker: string;
  nextQuestion: string;
  readiness: "sin-intento" | "incompleto" | "en-proceso" | "casi" | "aprobable";
};

const has = (code: string, pattern: RegExp) => pattern.test(code.toLowerCase());

function stripComments(code: string) {
  return code
    .replace(/\{[\s\S]*?\}/g, " ")
    .replace(/\(\*[\s\S]*?\*\)/g, " ")
    .replace(/\/\/.*$/gm, " ");
}

function realCodeStats(code: string) {
  const withoutComments = stripComments(code);
  const normalized = withoutComments.toLowerCase();
  const statements = (withoutComments.match(/;/g) ?? []).length;
  const assignments = (withoutComments.match(/:=/g) ?? []).length;
  const placeholders = /completar|respuesta\s*[a-z]?\s*:|esqueleto|plan guiado/i.test(code);

  return {
    withoutComments,
    normalized,
    statements,
    assignments,
    placeholders,
    hasRealBody: statements >= 3 || assignments >= 2,
  };
}

function asksForTwoHighlightedValues(statement: string) {
  return (
    /(los|las)\s+(2|dos)\s+/.test(statement) ||
    /dos\s+(maximos|minimos|mayores|menores|posiciones|equipos|tipos|valores)/.test(statement) ||
    /(maximos|minimos|mayores|menores)\s+(2|dos)/.test(statement)
  );
}

export function analyzeAttempt(exercise: Exercise, code: string): AttemptAnalysis {
  const stats = realCodeStats(code);
  const normalized = stats.normalized;
  const statement = exercise.statement.toLowerCase();
  const detectedConcepts: string[] = [];
  const missingSignals: string[] = [];

  const addConcept = (condition: boolean, label: string) => {
    if (condition) detectedConcepts.push(label);
  };
  const addMissing = (condition: boolean, label: string) => {
    if (condition) missingSignals.push(label);
  };

  addConcept(/\bprogram\b/.test(normalized), "programa Pascal");
  addConcept(/\bprocedure\b/.test(normalized), "procedure");
  addConcept(/\bfunction\b/.test(normalized), "function");
  addConcept(/\brecord\b/.test(normalized), "records");
  addConcept(/\barray\b/.test(normalized), "arrays/vectores");
  addConcept(/\bfor\b/.test(normalized), "recorrido con for");
  addConcept(/\bwhile\b|\brepeat\b/.test(normalized), "recorrido condicional");
  addConcept(/\bmod\b/.test(normalized), "mod");
  addConcept(/\bdiv\b/.test(normalized), "div");
  addConcept(/\bnew\s*\(/.test(normalized), "new");
  addConcept(/\bdispose\s*\(/.test(normalized), "dispose");
  addConcept(/\^/.test(normalized), "punteros");
  addConcept(/<> *nil|= *nil/.test(normalized), "control con nil");
  addConcept(/:=/.test(normalized), "asignaciones");

  addMissing(!stats.hasRealBody, "falta codigo real suficiente");
  addMissing(stats.placeholders, "quedan marcadores sin completar");
  addMissing(!/\bbegin\b/.test(normalized) || !/\bend\b/.test(normalized), "estructura begin/end");

  if (exercise.topic.includes("lista") || exercise.topic === "insertar ordenado") {
    const advancesToNext = /:=\s*[^;]*\^\.sig/.test(normalized);
    addMissing(!/\^/.test(normalized), "uso de punteros con ^");
    addMissing(!/<> *nil|= *nil/.test(normalized), "condicion contra nil");
    addMissing(/\bwhile\b/.test(normalized) && !advancesToNext, "avance hacia sig");
    addMissing(statement.includes("liber") && !/\bdispose\s*\(/.test(normalized), "liberacion con dispose");
  }

  if (exercise.topic === "suma de digitos") {
    addMissing(!/\bmod\b/.test(normalized), "mod 10");
    addMissing(!/\bdiv\b/.test(normalized), "div 10");
  }

  if (exercise.topic === "vectores") {
    addMissing(!/\bfor\b/.test(normalized), "recorrido con for");
    addMissing(!/\[[^\]]+\]/.test(normalized), "acceso por indice");
  }

  if (exercise.topic === "matrices/tablas") {
    addMissing(!/\barray\b/.test(normalized), "estructura array");
    addMissing(!/\bfor\b[\s\S]*\bfor\b/.test(normalized), "doble recorrido");
  }

  if (statement.includes("ordenada") || exercise.topic === "insertar ordenado") {
    addMissing(!/\bant\b|\banterior\b/.test(normalized), "puntero anterior");
    addMissing(!/\bact\b|\bactual\b/.test(normalized), "puntero actual");
  }

  if (statement.includes("una sola vez")) {
    addMissing(!/\bwhile\b|\bfor\b/.test(normalized), "recorrido principal unico");
  }

  if (asksForTwoHighlightedValues(statement)) {
    addMissing(!/max1|max2|min1|min2|codmax1|codmax2|posmax1|posmax2/.test(normalized), "dos maximos/minimos");
  }

  const likelyBlocker =
    missingSignals[0] ??
    (detectedConcepts.length === 0
      ? "todavia no aparece una estrategia de solucion"
      : "la estrategia general aparece, falta validar casos borde");

  const nextQuestion = (() => {
    if (!stats.hasRealBody) return "Que datos entran, que recorrido necesitas y que resultado tiene que salir?";
    if (stats.placeholders) return "Que parte marcada como completar podes resolver primero en 5 lineas?";
    if (exercise.topic.includes("lista") || exercise.topic === "insertar ordenado") {
      return "En cada vuelta del while, a que nodo apunta el puntero, cual es el anterior y donde avanza?";
    }
    if (exercise.topic === "matrices/tablas") return "Que representa cada indice de la matriz y donde se reinicia el acumulador?";
    if (exercise.topic === "suma de digitos") return "Como cambia el numero despues de aplicar div 10?";
    return "Con un caso de 2 o 3 datos, que valores toman tus variables principales?";
  })();

  const readiness: AttemptAnalysis["readiness"] =
    !stats.hasRealBody
      ? "sin-intento"
      : stats.placeholders
        ? "incompleto"
        : missingSignals.length >= 3
          ? "en-proceso"
          : missingSignals.length > 0
            ? "casi"
            : "aprobable";

  return {
    hasEnoughCode: stats.hasRealBody,
    hasPlaceholders: stats.placeholders,
    statements: stats.statements,
    assignments: stats.assignments,
    detectedConcepts,
    missingSignals,
    likelyBlocker,
    nextQuestion,
    readiness,
  };
}

function inferChecks(exercise: Exercise, code: string): RubricCheck[] {
  const stats = realCodeStats(code);
  const normalized = stats.normalized;

  return exercise.rubric.map((label) => {
    const text = label.toLowerCase();
    let ok = stats.hasRealBody && !stats.placeholders;

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
  const stats = realCodeStats(code);
  const normalized = stats.normalized;
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

  if (stats.withoutComments.trim().length < 40 || !stats.hasRealBody) {
    addError(
      "logica",
      "Todavia no hay un intento suficiente para corregir. Veo muy poco codigo real fuera de comentarios.",
      6,
    );
  }

  if (stats.placeholders) {
    addError(
      "logica",
      "Quedaron partes sin completar o respuestas en blanco. Antes de evaluar, reemplaza los marcadores por tu intento.",
      3,
    );
  }

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
    if (!has(normalized, /\^/)) {
      addError(
        "punteros/listas",
        "El tema es listas/punteros, pero no veo uso real de ^ para acceder a nodos.",
        2,
      );
    }

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
    if (!has(normalized, /\bwhile\b|\brepeat\b/)) {
      addError(
        "logica",
        "Para suma de digitos normalmente hace falta repetir mientras el numero se va achicando.",
        2,
      );
    }

    if (!has(normalized, /\bmod\b/) || !has(normalized, /\bdiv\b/)) {
      addError(
        "logica",
        "Para separar digitos en Pascal necesitas combinar mod 10 y div 10.",
        3,
      );
    }
  }

  if (
    asksForTwoHighlightedValues(exercise.statement.toLowerCase())
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
  score = Math.max(1, Math.min(10, score));

  if (errors.length === 0 && missingChecks === 0 && stats.hasRealBody && !stats.placeholders) {
    return {
      errors,
      checks,
      score,
      message:
        "Viene muy bien: hay un intento completo, sin marcadores pendientes y no detecte errores tipicos. Ahora proba un caso chico para confirmar la logica.",
    };
  }

  const first = errors[0];
  return {
    errors,
    checks,
    score,
    message: first
      ? `Te marco primero esto: ${first.text}\n\nDiagnostico: puntaje estimado ${score}/10. No te lo doy por aprobado todavia; corregi esa parte y volve a evaluar.`
      : `Todavia hay criterios de rubrica para revisar. Puntaje estimado ${score}/10. Mira los items marcados antes de avanzar.`,
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
