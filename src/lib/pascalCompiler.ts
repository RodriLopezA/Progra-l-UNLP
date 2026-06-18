export type PascalCompileResult = {
  ok: boolean;
  status: "compiled" | "compile-error" | "server-error";
  output: string;
  errors: string[];
  warnings: string[];
  hints: string[];
  elapsedMs?: number;
};

export const defaultCompilerEndpoint = "http://localhost:8787/compile";

export async function compilePascal(endpoint: string, code: string): Promise<PascalCompileResult> {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok || !data) {
    throw new Error("No pude conectar con el compilador Pascal.");
  }

  return data as PascalCompileResult;
}

export function buildCompilerTutorNote(result: PascalCompileResult) {
  if (result.ok) {
    return `Compilo correctamente con Free Pascal.

Esto no significa que la logica este perfecta, pero ya pasaste una barrera importante: sintaxis y tipos basicos.

Siguiente paso de tutor:
1. Hace una prueba de escritorio con 2 o 3 datos.
2. Verifica los casos borde.
3. Revisa si la salida coincide exactamente con la consigna.`;
  }

  const firstError = result.errors[0] ?? result.output.split("\n").find(Boolean) ?? "error no identificado";
  const warnings = result.warnings.length > 0 ? result.warnings.slice(0, 3).join("\n") : "sin warnings principales";

  return `Free Pascal encontro errores, asi que todavia no conviene evaluar la logica.

Primer error importante:
${firstError}

Warnings:
${warnings}

Como lo trabajaria:
1. Arregla el primer error, no todos juntos.
2. Volve a compilar.
3. Cuando compile, recien ahi pedime "Evaluar parcial" para mirar la logica.`;
}
