const http = require("node:http");
const { execFile } = require("node:child_process");
const { mkdtemp, rm, writeFile } = require("node:fs/promises");
const { tmpdir } = require("node:os");
const path = require("node:path");

const port = Number(process.env.PORT ?? 8787);
const fpcPath = process.env.FPC_PATH || "fpc";
const maxCodeSize = 120_000;

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  response.end(JSON.stringify(payload));
}

function parseCompilerOutput(output) {
  const lines = output.split(/\r?\n/).filter(Boolean);
  return {
    errors: lines.filter((line) => /\berror\b|fatal:/i.test(line)),
    warnings: lines.filter((line) => /\bwarning\b|note:/i.test(line)),
  };
}

function compileWithFpc(filePath, workdir) {
  const startedAt = Date.now();

  return new Promise((resolve) => {
    execFile(
      fpcPath,
      ["-S2", "-vw", "-Fu.", "-FE.", filePath],
      {
        cwd: workdir,
        timeout: 8000,
        windowsHide: true,
        maxBuffer: 1024 * 1024,
      },
      (error, stdout, stderr) => {
        const output = `${stdout}${stderr}`.trim();
        const parsed = parseCompilerOutput(output);
        const ok = !error && parsed.errors.length === 0;

        resolve({
          ok,
          status: ok ? "compiled" : "compile-error",
          output,
          errors: parsed.errors,
          warnings: parsed.warnings,
          hints: [],
          elapsedMs: Date.now() - startedAt,
        });
      },
    );
  });
}

function readRequestBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";

    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > maxCodeSize) {
        reject(new Error("El codigo es demasiado grande para este compilador."));
        request.destroy();
      }
    });

    request.on("end", () => resolve(body));
    request.on("error", reject);
  });
}

const server = http.createServer(async (request, response) => {
  if (request.method === "OPTIONS") {
    sendJson(response, 204, {});
    return;
  }

  if (request.method !== "POST" || request.url !== "/compile") {
    sendJson(response, 404, { ok: false, status: "server-error", output: "Ruta no encontrada." });
    return;
  }

  let workdir;

  try {
    const rawBody = await readRequestBody(request);
    const body = JSON.parse(rawBody || "{}");
    const code = typeof body.code === "string" ? body.code : "";

    if (code.trim().length < 10) {
      sendJson(response, 400, {
        ok: false,
        status: "compile-error",
        output: "No hay codigo Pascal suficiente para compilar.",
        errors: ["No hay codigo Pascal suficiente para compilar."],
        warnings: [],
        hints: ["Escribi un programa o modulo antes de compilar."],
      });
      return;
    }

    workdir = await mkdtemp(path.join(tmpdir(), "p1-pascal-"));
    const filePath = path.join(workdir, "main.pas");
    await writeFile(filePath, code, "utf8");

    const result = await compileWithFpc(filePath, workdir);
    sendJson(response, 200, result);
  } catch (error) {
    sendJson(response, 500, {
      ok: false,
      status: "server-error",
      output:
        error instanceof Error
          ? error.message
          : "No pude ejecutar Free Pascal. Revisa que fpc este instalado.",
      errors: [
        error instanceof Error
          ? error.message
          : "No pude ejecutar Free Pascal. Revisa que fpc este instalado.",
      ],
      warnings: [],
      hints: ["Instala Free Pascal o configura FPC_PATH si fpc no esta en PATH."],
    });
  } finally {
    if (workdir) {
      await rm(workdir, { recursive: true, force: true }).catch(() => {});
    }
  }
});

server.listen(port, () => {
  console.log(`Compilador Pascal escuchando en http://localhost:${port}/compile`);
  console.log("Usa Ctrl+C para detenerlo.");
});
