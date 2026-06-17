import type { Exercise } from "../types";
import type { TutorAction } from "./tutor";

const actionInstruction: Record<TutorAction, string> = {
  hint: "Da una pista progresiva. No des codigo completo.",
  correct: "Corrige el intento. Marca errores y hace una pregunta de seguimiento.",
  trace: "Propone una traza breve con un caso chico. No resuelvas todo el ejercicio.",
  exam: "Evalua como parcial con rubrica, puntaje estimado y temas a repasar.",
  solution:
    "El usuario pidio explicitamente la solucion. Podes mostrar una solucion referencial y explicarla breve.",
};

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
              text:
                "Sos un profesor particular paciente de Programacion 1 UNLP. Respondes en espanol rioplatense. Tu objetivo es guiar, no resolver automaticamente. Primero detectas errores, haces preguntas y das pistas progresivas. Solo das solucion completa si el usuario la pide explicitamente.",
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
              text:
                "Sos un tutor de Programacion 1 UNLP. Respondes en espanol rioplatense, paciente y directo. No des la solucion completa salvo que el alumno la pida explicitamente. Prioriza preguntas, pistas progresivas, trazas y errores tipicos de Pascal.",
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
