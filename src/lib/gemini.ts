import type { Exercise } from "../types";
import { analyzeAttempt, evaluateCode } from "./evaluator";
import type { TutorAction } from "./tutor";

const actionInstruction: Record<TutorAction, string> = {
  hint:
    "Da una pista progresiva basada en el intento. No des codigo completo. Si no hay intento real, pedi plan de entrada/proceso/salida.",
  correct:
    "Corrige el intento como tutor exigente. Marca errores, senales presentes, faltantes y una microaccion. No apruebes intentos vacios.",
  trace:
    "Propone una traza breve con un caso chico y una tabla de variables. No resuelvas todo el ejercicio.",
  exam:
    "Evalua como parcial con rubrica, puntaje estimado, errores graves, temas a repasar y pregunta de defensa.",
  solution:
    "El usuario pidio explicitamente la solucion. Podes mostrar una solucion referencial y explicarla breve.",
};

const systemInstruction = `Sos un tutor avanzado de Programacion 1 UNLP en Pascal.
Respondes en espanol rioplatense, con tono de profesor particular paciente, claro y exigente.
Tu objetivo es que el alumno aprenda a aprobar parciales, no que copie.

Reglas obligatorias:
- No des solucion completa salvo accion "solution" o pedido explicito de solucion.
- No apruebes codigo vacio, comentarios, esqueletos, placeholders o texto que no sea Pascal real.
- Primero diagnostica: que intenta hacer, que senales aparecen y que falta.
- Si hay errores de Pascal, nombra el error y mostra solo el fragmento minimo necesario.
- Da pistas progresivas: plan, variable clave, condicion de corte, avance, caso borde.
- Para listas, revisa siempre nil, ^, new/dispose cuando corresponda, anterior/actual y avance a sig.
- Para arreglos/matrices, revisa indices validos, dimension logica/fisica, acumuladores y doble recorrido.
- Para suma de digitos, revisa mod 10, div 10 y condicion de corte.
- Para parcial, usa una rubrica estricta y pregunta de defensa oral.

Formato preferido:
Lectura del intento
Lo que ya aparece
Lo que falta
Proximo paso
Pregunta del tutor`;

function buildLocalContext(exercise: Exercise, code: string) {
  const analysis = analyzeAttempt(exercise, code);
  const evaluation = evaluateCode(exercise, code);

  return `Analisis local previo:
- estado: ${analysis.readiness}
- puntaje estimado por reglas locales: ${evaluation.score}/10
- errores locales: ${evaluation.errors.map((error) => error.text).join(" | ") || "sin errores detectados"}
- senales detectadas: ${analysis.detectedConcepts.join(", ") || "ninguna"}
- faltantes: ${analysis.missingSignals.join(", ") || "sin faltantes grandes"}
- bloqueo probable: ${analysis.likelyBlocker}
- pregunta sugerida: ${analysis.nextQuestion}`;
}

export async function askGeminiTutor(
  apiKey: string,
  action: TutorAction,
  exercise: Exercise,
  code: string,
) {
  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [
            {
              text: systemInstruction,
            },
          ],
        },
        contents: [
          {
            parts: [
              {
                text: `Accion solicitada: ${actionInstruction[action]}

Tema: ${exercise.topic}
Ejercicio: ${exercise.title}
Enunciado: ${exercise.statement}
Rubrica:
${exercise.rubric.map((item) => `- ${item}`).join("\n")}

${buildLocalContext(exercise, code)}

Codigo del alumno:
${code}`,
              },
            ],
          },
        ],
      }),
    },
  );

  if (!response.ok) {
    throw new Error("Gemini no pudo responder. Revisa la API key o el cupo gratis.");
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error("Gemini respondio sin texto util.");
  }

  return text as string;
}

export async function askGeminiFreeQuestion(
  apiKey: string,
  exercise: Exercise,
  code: string,
  question: string,
) {
  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [
            {
              text: systemInstruction,
            },
          ],
        },
        contents: [
          {
            parts: [
              {
                text: `Pregunta del alumno: ${question}

Ejercicio actual: ${exercise.title}
Enunciado: ${exercise.statement}
${buildLocalContext(exercise, code)}

Codigo del alumno:
${code}`,
              },
            ],
          },
        ],
      }),
    },
  );

  if (!response.ok) {
    throw new Error("No pude conectar con Gemini. Revisa la key o el cupo gratis.");
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error("Gemini respondio sin texto util.");
  }

  return text as string;
}

export async function testGeminiKey(apiKey: string) {
  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "Responde solo: conexion ok" }] }],
      }),
    },
  );

  if (!response.ok) {
    throw new Error("Key invalida, sin cupo o Gemini no disponible.");
  }
}
