import Editor from "@monaco-editor/react";
import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { exercises } from "./data/exercises";
import { examCatalog, getExamInfo, sortExamNames, type ExamKind } from "./data/examCatalog";
import { learningPath, type LearningStage } from "./data/learningPath";
import { practices, type PracticeGuide } from "./data/practices";
import { buildExamFeedback, evaluateCode } from "./lib/evaluator";
import { askGeminiFreeQuestion, askGeminiTutor, testGeminiKey } from "./lib/gemini";
import {
  exportTextFile,
  clearGeminiKey,
  clearStudyData,
  loadAttempts,
  loadCode,
  loadHistory,
  loadTrace,
  resetCode,
  saveAttempt,
  saveCode,
  saveErrors,
  saveTrace,
} from "./lib/storage";
import { getTutorReply, type TutorAction } from "./lib/tutor";
import type { ChatMessage, ErrorRecord, ExamAttempt, Exercise, RubricCheck } from "./types";

type TutorMode = "rules" | "gemini";
type ViewMode = "camino" | "estudio" | "practicas" | "simulacro" | "progreso";
type ToolPanelKey = "tutor" | "rubric" | "trace" | "compiler" | "data";

const initialMessage: ChatMessage = {
  id: "welcome",
  role: "tutor",
  text: "Arranquemos tranqui. Elegi un ejercicio, escribi un intento y pedime una pista o correccion. Te voy a guiar como profe particular, sin regalarte la solucion de entrada.",
};

const viewLabels: Record<ViewMode, string> = {
  camino: "camino",
  estudio: "biblioteca",
  practicas: "TPs",
  simulacro: "simulacro",
  progreso: "progreso",
};

const toolPanelLabels: Record<ToolPanelKey, string> = {
  tutor: "Modo tutor",
  rubric: "Rubrica",
  trace: "Traza manual",
  compiler: "Compilador",
  data: "Datos",
};

function PanelShell({
  title,
  meta,
  defaultOpen = false,
  children,
}: {
  title: string;
  meta?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  return (
    <details className="fold-panel" open={defaultOpen}>
      <summary>
        <span>{title}</span>
        {meta && <small>{meta}</small>}
      </summary>
      <div className="fold-content">{children}</div>
    </details>
  );
}

function formatTimer(seconds: number) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const rest = (seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${rest}`;
}

function buildPlanBlock(exercise: Exercise) {
  return `{ PLAN GUIADO - ${exercise.title}
Entrada:
- Que datos recibo o leo?

Proceso:
- Que recorrido necesito?
- Que variable cambia en cada vuelta?

Salida:
- Que tengo que informar, devolver o modificar?

Modulos:
- Que procedure/function chico puedo separar?

Caso de prueba mini:
- Probar con 2 o 3 datos antes de seguir.
}

`;
}

function buildScaffold(exercise: Exercise) {
  if (exercise.topic.includes("lista")) {
    return `{ ESQUELETO DE LISTA
- Inicializar acumuladores si hacen falta.
- Recorrer mientras el puntero sea distinto de nil.
- Mirar el dato actual con puntero^.dato.
- Actualizar el resultado.
- Avanzar siempre con puntero := puntero^.sig.
- Devolver, informar o modificar lo pedido.
}`;
  }

  if (exercise.topic === "vectores") {
    return `{ ESQUELETO DE VECTOR
- Identificar dimF y dimL.
- Inicializar acumulador, maximo o minimo.
- Recorrer solo las posiciones validas.
- Procesar v[i].
- Devolver o informar el resultado.
}`;
  }

  if (exercise.topic === "matrices/tablas") {
    return `{ ESQUELETO DE MATRIZ/TABLA
- Definir que representa cada indice.
- Recorrer filas y columnas.
- Reiniciar acumuladores por fila/grupo cuando corresponda.
- Consultar tabla[codigo1, codigo2] si la consigna lo pide.
- No invertir fila y columna.
}`;
  }

  if (exercise.topic === "suma de digitos") {
    return `{ ESQUELETO DE SUMA DE DIGITOS
- Inicializar suma en 0.
- Repetir mientras el numero no sea 0.
- Obtener ultimo digito con mod 10.
- Achicar el numero con div 10.
- Devolver la suma.
}`;
  }

  return `{ esqueleto general }
{ 1. Inicializar variables }
{ 2. Leer o recorrer datos }
{ 3. Actualizar contadores/acumuladores/maximos }
{ 4. Informar o devolver el resultado }`;
}

function buildTraceRows(exercise: Exercise) {
  if (exercise.topic.includes("lista")) {
    return [
      { dato: "primer nodo", acum: "inicial", puntero: "l -> primero" },
      { dato: "segundo nodo", acum: "actualizar", puntero: "l := l^.sig" },
      { dato: "nil", acum: "resultado", puntero: "fin" },
      { dato: "", acum: "", puntero: "" },
      { dato: "", acum: "", puntero: "" },
    ];
  }

  if (exercise.topic === "matrices/tablas") {
    return [
      { dato: "i=1 j=1", acum: "fila 1", puntero: "m[1,1]" },
      { dato: "i=1 j=2", acum: "actualizar", puntero: "m[1,2]" },
      { dato: "i=2 j=1", acum: "reiniciar?", puntero: "m[2,1]" },
      { dato: "", acum: "", puntero: "" },
      { dato: "", acum: "", puntero: "" },
    ];
  }

  return [
    { dato: "dato 1", acum: "inicial", puntero: "vuelta 1" },
    { dato: "dato 2", acum: "actualizar", puntero: "vuelta 2" },
    { dato: "corte", acum: "resultado", puntero: "fin" },
    { dato: "", acum: "", puntero: "" },
    { dato: "", acum: "", puntero: "" },
  ];
}

function App() {
  const [selectedId, setSelectedId] = useState(exercises[0].id);
  const selectedExercise = useMemo(
    () => exercises.find((exercise) => exercise.id === selectedId) ?? exercises[0],
    [selectedId],
  );
  const [viewMode, setViewMode] = useState<ViewMode>("camino");
  const [returnView, setReturnView] = useState<ViewMode | null>(null);
  const [selectedStageId, setSelectedStageId] = useState(learningPath[0].id);
  const [selectedPracticeId, setSelectedPracticeId] = useState(practices[0].id);
  const [visiblePanels, setVisiblePanels] = useState<Record<ToolPanelKey, boolean>>({
    tutor: false,
    rubric: false,
    trace: false,
    compiler: false,
    data: false,
  });
  const [traceVersion, setTraceVersion] = useState(0);
  const [search, setSearch] = useState("");
  const [topicFilter, setTopicFilter] = useState("todos");
  const [examFilter, setExamFilter] = useState("todos");
  const [examKindFilter, setExamKindFilter] = useState<ExamKind | "todos">("todos");
  const [code, setCode] = useState(() =>
    loadCode(selectedExercise.id, selectedExercise.starterCode),
  );
  const [messages, setMessages] = useState<ChatMessage[]>([initialMessage]);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [history, setHistory] = useState<ErrorRecord[]>(() => loadHistory());
  const [attempts, setAttempts] = useState<ExamAttempt[]>(() => loadAttempts());
  const [tutorMode, setTutorMode] = useState<TutorMode>("rules");
  const [geminiKey, setGeminiKey] = useState(
    () => localStorage.getItem("p1unlp:gemini-key") ?? "",
  );
  const [isThinking, setIsThinking] = useState(false);
  const [simRunning, setSimRunning] = useState(false);
  const [hintsLocked, setHintsLocked] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState((selectedExercise.minutes ?? 20) * 60);
  const [geminiStatus, setGeminiStatus] = useState<"idle" | "ok" | "error">("idle");
  const [showOnboarding, setShowOnboarding] = useState(
    () => localStorage.getItem("p1unlp:onboarded") !== "yes",
  );

  const evaluation = useMemo(() => evaluateCode(selectedExercise, code), [selectedExercise, code]);
  const exams = sortExamNames([...new Set(exercises.map((exercise) => exercise.exam ?? "Practica"))]);
  const topics = [...new Set(exercises.map((exercise) => exercise.topic))];
  const filteredExercises = exercises.filter((exercise) => {
    const examInfo = getExamInfo(exercise.exam);
    const matchesSearch =
      exercise.title.toLowerCase().includes(search.toLowerCase()) ||
      exercise.statement.toLowerCase().includes(search.toLowerCase());
    const matchesTopic = topicFilter === "todos" || exercise.topic === topicFilter;
    const matchesExam = examFilter === "todos" || exercise.exam === examFilter;
    const matchesKind = examKindFilter === "todos" || examInfo.kind === examKindFilter;
    return matchesSearch && matchesTopic && matchesExam && matchesKind;
  });
  const topicCounts = history.reduce<Record<string, number>>((acc, item) => {
    acc[item.topic] = (acc[item.topic] ?? 0) + 1;
    return acc;
  }, {});
  const completedCount = exercises.filter((exercise) =>
    localStorage.getItem(`p1unlp:code:${exercise.id}`),
  ).length;
  const averageScore =
    attempts.length === 0
      ? 0
      : Math.round(attempts.reduce((sum, attempt) => sum + attempt.score, 0) / attempts.length);
  const actualExamCount = examCatalog.filter((exam) => exam.kind === "actual").length;
  const currentExamExercises = exercises.filter(
    (exercise) => exercise.exam === selectedExercise.exam,
  );
  const selectedPractice =
    practices.find((practice) => practice.id === selectedPracticeId) ?? practices[0];
  const selectedStage =
    learningPath.find((stage) => stage.id === selectedStageId) ?? learningPath[0];
  const stageExercises = selectedStage.exercises
    .map((id) => exercises.find((exercise) => exercise.id === id))
    .filter((exercise): exercise is Exercise => Boolean(exercise));
  const bridgeExercises = selectedStage.bridgeExercises
    .map((id) => exercises.find((exercise) => exercise.id === id))
    .filter((exercise): exercise is Exercise => Boolean(exercise));
  const stageExamExercises = selectedStage.examExercises
    .map((id) => exercises.find((exercise) => exercise.id === id))
    .filter((exercise): exercise is Exercise => Boolean(exercise));

  useEffect(() => {
    setCode(loadCode(selectedExercise.id, selectedExercise.starterCode));
    setHintsUsed(0);
    setSecondsLeft((selectedExercise.minutes ?? 20) * 60);
    setSimRunning(false);
    setMessages([
      initialMessage,
      {
        id: crypto.randomUUID(),
        role: "tutor",
        text: `Nuevo ejercicio: ${selectedExercise.title}. Primero intenta ubicar datos de entrada, recorrido y resultado esperado.`,
      },
    ]);
  }, [selectedExercise]);

  useEffect(() => {
    saveCode(selectedExercise.id, code);
  }, [code, selectedExercise.id]);

  useEffect(() => {
    localStorage.setItem("p1unlp:gemini-key", geminiKey);
  }, [geminiKey]);

  useEffect(() => {
    if (!simRunning) return;
    const timer = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          setSimRunning(false);
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [simRunning]);

  const appendTutorMessage = (studentText: string, tutorText: string) => {
    setMessages((current) => [
      ...current,
      { id: crypto.randomUUID(), role: "student", text: studentText },
      { id: crypto.randomUUID(), role: "tutor", text: tutorText },
    ]);
  };

  const answerFreeQuestion = async (question: string) => {
    const clean = question.trim();
    if (!clean) return;

    if (tutorMode === "gemini" && geminiKey.trim()) {
      setIsThinking(true);
      setMessages((current) => [
        ...current,
        { id: crypto.randomUUID(), role: "student", text: clean },
      ]);

      try {
        const text = await askGeminiFreeQuestion(geminiKey.trim(), selectedExercise, code, clean);
        setMessages((current) => [
          ...current,
          { id: crypto.randomUUID(), role: "tutor", text },
        ]);
      } catch (error) {
        setMessages((current) => [
          ...current,
          {
            id: crypto.randomUUID(),
            role: "tutor",
            text: `${error instanceof Error ? error.message : "Gemini no respondio."}\n\nMientras tanto, mi lectura local: ${evaluation.message}`,
          },
        ]);
      } finally {
        setIsThinking(false);
      }
      return;
    }

    appendTutorMessage(
      clean,
      `Te contesto con el tutor local: ${evaluation.message}\n\nPregunta para pensar: que variable cambia en cada vuelta y donde deberia actualizarse?`,
    );
  };

  const checkGeminiConnection = async () => {
    if (!geminiKey.trim()) {
      setGeminiStatus("error");
      appendTutorMessage("Probar Gemini", "Primero pega tu API key de Gemini.");
      return;
    }

    setGeminiStatus("idle");
    try {
      await testGeminiKey(geminiKey.trim());
      setGeminiStatus("ok");
      appendTutorMessage("Probar Gemini", "Conexion OK. Ya podes usar el modo Gemini con tu propia key.");
    } catch (error) {
      setGeminiStatus("error");
      appendTutorMessage(
        "Probar Gemini",
        error instanceof Error ? error.message : "No pude probar Gemini.",
      );
    }
  };

  const runTutorAction = async (action: TutorAction) => {
    const labels: Record<TutorAction, string> = {
      hint: "Dame una pista",
      correct: "Corregi mi intento",
      trace: "Haceme una traza",
      exam: "Evaluar como parcial",
      solution: "Mostrar solucion",
    };

    if (action === "hint" && hintsLocked) {
      appendTutorMessage(labels[action], "En este simulacro las pistas estan bloqueadas.");
      return;
    }

    if (tutorMode === "gemini" && !geminiKey.trim()) {
      appendTutorMessage(
        labels[action],
        "El modo Gemini esta seleccionado, pero falta cargar tu API key. Mientras tanto puedo corregir con reglas locales gratis.",
      );
      return;
    }

    if (tutorMode === "gemini") {
      setIsThinking(true);
      setMessages((current) => [
        ...current,
        { id: crypto.randomUUID(), role: "student", text: labels[action] },
      ]);

      try {
        const geminiText = await askGeminiTutor(
          geminiKey.trim(),
          action,
          selectedExercise,
          code,
        );

        if (action === "hint") setHintsUsed((current) => current + 1);

        setMessages((current) => [
          ...current,
          { id: crypto.randomUUID(), role: "tutor", text: geminiText },
        ]);
      } catch (error) {
        const fallback = getTutorReply(action, selectedExercise, code, hintsUsed);
        const savedHistory = saveErrors(fallback.errors);
        if (savedHistory.length > 0) setHistory(savedHistory);

        setMessages((current) => [
          ...current,
          {
            id: crypto.randomUUID(),
            role: "tutor",
            text: `${error instanceof Error ? error.message : "Gemini no respondio."}\n\nUso el tutor local como respaldo:\n${fallback.text}`,
          },
        ]);
      } finally {
        setIsThinking(false);
      }
      return;
    }

    const reply = getTutorReply(action, selectedExercise, code, hintsUsed);
    if (action === "hint") setHintsUsed((current) => current + 1);

    const savedHistory = saveErrors(reply.errors);
    if (savedHistory.length > 0) setHistory(savedHistory);
    appendTutorMessage(labels[action], reply.text);
  };

  const startSimulacro = () => {
    setViewMode("simulacro");
    setHintsLocked(true);
    setSimRunning(true);
    setSecondsLeft((selectedExercise.minutes ?? 20) * 60);
    appendTutorMessage(
      "Iniciar simulacro",
      `Simulacro iniciado: ${selectedExercise.exam}. Tiempo sugerido: ${selectedExercise.minutes ?? 20} minutos.`,
    );
  };

  const openPracticeExam = (exam: string) => {
    setExamFilter(exam);
    setExamKindFilter("todos");
    const firstExercise = exercises.find((exercise) => exercise.exam === exam);
    if (firstExercise) setSelectedId(firstExercise.id);
    if (viewMode !== "estudio") setReturnView(viewMode);
    setViewMode("estudio");
  };

  const openExerciseFromPath = (exerciseId: string, reason: string) => {
    const exercise = exercises.find((item) => item.id === exerciseId);
    if (!exercise) return;
    setSelectedId(exercise.id);
    setTopicFilter("todos");
    setExamFilter("todos");
    setExamKindFilter("todos");
    if (viewMode !== "estudio") setReturnView(viewMode);
    setViewMode("estudio");
    appendTutorMessage(
      "Camino Tutor",
      `${reason}\n\nTe dejo este ejercicio: ${exercise.title}. Antes de codear, escribi en comentarios: datos de entrada, recorrido y salida esperada.`,
    );
  };

  const togglePanel = (panel: ToolPanelKey) => {
    setVisiblePanels((current) => ({
      ...current,
      [panel]: !current[panel],
    }));
  };

  const goBackToReturnView = () => {
    setViewMode(returnView ?? "camino");
    setReturnView(null);
  };

  const insertPlanInCode = () => {
    if (code.includes("PLAN GUIADO")) {
      appendTutorMessage("Armar plan", "Ya tenes un plan guiado en el codigo. Completa esos puntos antes de agregar mas.");
      return;
    }

    setCode(`${buildPlanBlock(selectedExercise)}${code}`);
    appendTutorMessage(
      "Armar plan",
      "Te agregue un plan arriba del codigo. Completa entrada, proceso, salida y un caso mini antes de programar.",
    );
  };

  const insertSmartScaffold = () => {
    const scaffold = buildScaffold(selectedExercise);
    const nextCode = code.includes("{ completar }")
      ? code.replace("{ completar }", scaffold)
      : `${code}\n\n${scaffold}`;

    setCode(nextCode);
    appendTutorMessage(
      "Insertar esqueleto",
      "Te deje un esqueleto en comentarios segun el tema. No es la solucion: es una guia para que completes el modulo.",
    );
  };

  const prepareAutomaticTrace = () => {
    const rows = buildTraceRows(selectedExercise);
    saveTrace(selectedExercise.id, rows);
    setTraceVersion((current) => current + 1);
    setVisiblePanels((current) => ({ ...current, trace: true }));
    appendTutorMessage(
      "Preparar traza",
      "Te arme una traza inicial. Cambia los valores por un caso chico real y revisa vuelta por vuelta.",
    );
  };

  const openNextRecommended = () => {
    const currentIndex = stageExercises.findIndex((exercise) => exercise.id === selectedExercise.id);
    const nextExercise =
      currentIndex >= 0 ? stageExercises[currentIndex + 1] ?? stageExamExercises[0] : stageExercises[0];
    const fallback = stageExamExercises[0] ?? bridgeExercises[0];
    const target = nextExercise ?? fallback;

    if (!target) {
      appendTutorMessage("Siguiente recomendado", "No encontre otra mision en este nivel. Proba cambiar de nivel en Camino.");
      return;
    }

    openExerciseFromPath(
      target.id,
      "Te llevo al siguiente recomendado automaticamente para mantener el ritmo de estudio.",
    );
  };

  const runAutoPilot = async () => {
    if (viewMode !== "estudio") {
      const target = stageExercises[0] ?? bridgeExercises[0] ?? stageExamExercises[0];
      if (target) {
        openExerciseFromPath(
          target.id,
          "Arranco el modo automatico desde el primer ejercicio razonable de este nivel.",
        );
      }
      return;
    }

    setVisiblePanels((current) => ({ ...current, rubric: true }));

    if (evaluation.score < 5) {
      const scaffold = buildScaffold(selectedExercise);
      const baseCode = code.includes("PLAN GUIADO")
        ? code
        : `${buildPlanBlock(selectedExercise)}${code}`;
      const nextCode = baseCode.includes("{ completar }")
        ? baseCode.replace("{ completar }", scaffold)
        : `${baseCode}\n\n${scaffold}`;

      setCode(nextCode);
      prepareAutomaticTrace();
      await runTutorAction("hint");
      return;
    }

    if (!code.includes("PLAN GUIADO")) {
      setCode(`${buildPlanBlock(selectedExercise)}${code}`);
    }

    if (evaluation.score < 8) {
      await runTutorAction("correct");
      return;
    }

    openNextRecommended();
  };

  const finishSimulacro = () => {
    const result = buildExamFeedback(selectedExercise, code);
    const totalSeconds = (selectedExercise.minutes ?? 20) * 60;
    const nextAttempts = saveAttempt({
      exerciseId: selectedExercise.id,
      score: result.score,
      durationSeconds: totalSeconds - secondsLeft,
      hintsUsed,
    });
    const savedHistory = saveErrors(result.errors);

    setAttempts(nextAttempts);
    if (savedHistory.length > 0) setHistory(savedHistory);
    setSimRunning(false);
    appendTutorMessage("Entregar simulacro", result.message);
  };

  const exportAttempt = () => {
    exportTextFile(
      `${selectedExercise.id}.pas`,
      `${code}\n\n{ Reporte Tutor Pascal UNLP\nEjercicio: ${selectedExercise.title}\nPuntaje estimado: ${evaluation.score}/10\nPistas usadas: ${hintsUsed}\n}`,
    );
  };

  const resetCurrentExercise = () => {
    resetCode(selectedExercise.id);
    setCode(selectedExercise.starterCode);
    appendTutorMessage("Resetear ejercicio", "Volvi el codigo al esqueleto inicial.");
  };

  const clearAllProgress = () => {
    clearStudyData();
    setHistory([]);
    setAttempts([]);
    setCode(selectedExercise.starterCode);
    appendTutorMessage("Borrar progreso", "Borre intentos, errores, trazas y codigo guardado.");
  };

  const removeGeminiKey = () => {
    clearGeminiKey();
    setGeminiKey("");
    setGeminiStatus("idle");
    appendTutorMessage("Borrar API key", "Listo. Borre la API key de Gemini de este navegador.");
  };

  const finishFullExam = () => {
    const scores = currentExamExercises.map((exercise) => {
      const savedCode = loadCode(exercise.id, exercise.starterCode);
      return buildExamFeedback(exercise, savedCode).score;
    });
    const average = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);

    appendTutorMessage(
      "Entregar parcial completo",
      `Parcial completo: ${selectedExercise.exam}\nEjercicios incluidos: ${currentExamExercises.length}\nNota estimada promedio: ${average}/10\n\nRevisa el detalle ejercicio por ejercicio con Evaluar parcial.`,
    );
  };

  return (
    <main className="app-shell">
      {showOnboarding && (
        <section className="onboarding">
          <div className="onboarding-card">
            <span className="brand-mark">P1</span>
            <h2>Tutor Pascal UNLP</h2>
            <p>
              Estudia con ejercicios, editor Pascal, tutor por reglas gratis y Gemini opcional
              con tu propia API key.
            </p>
            <div className="onboarding-actions">
              <button
                onClick={() => {
                  localStorage.setItem("p1unlp:onboarded", "yes");
                  setShowOnboarding(false);
                }}
              >
                Empezar
              </button>
              <button
                className="quiet"
                onClick={() => {
                  setTutorMode("gemini");
                  localStorage.setItem("p1unlp:onboarded", "yes");
                  setShowOnboarding(false);
                }}
              >
                Usar Gemini despues
              </button>
            </div>
          </div>
        </section>
      )}
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">P1</span>
          <div>
            <h1>Tutor Pascal UNLP</h1>
            <p>Preparacion profesional de parciales</p>
          </div>
        </div>

        <nav className="view-tabs">
          {(["camino", "estudio", "practicas", "simulacro", "progreso"] as ViewMode[]).map((mode) => (
            <button
              className={viewMode === mode ? "active" : ""}
              key={mode}
              onClick={() => {
                setViewMode(mode);
                setReturnView(null);
              }}
            >
              {viewLabels[mode]}
            </button>
          ))}
        </nav>

        <section className="metric-grid">
          <div className="metric">
            <span>Niveles</span>
            <strong>{learningPath.length}</strong>
          </div>
          <div className="metric">
            <span>Actuales</span>
            <strong>{actualExamCount}</strong>
          </div>
          <div className="metric">
            <span>Promedio</span>
            <strong>{averageScore || "--"}</strong>
          </div>
        </section>

        <section className="panel path-summary">
          <div className="panel-heading">
            <h2>Camino actual</h2>
            <span>Nivel {selectedStage.level}</span>
          </div>
          <strong>{selectedStage.title}</strong>
          <p>{selectedStage.subtitle}</p>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <h2>Biblioteca</h2>
            <span>{completedCount} intentos</span>
          </div>
          <div className="bank-tools">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar ejercicio"
            />
            <select value={topicFilter} onChange={(event) => setTopicFilter(event.target.value)}>
              <option value="todos">Todos los temas</option>
              {topics.map((topic) => (
                <option key={topic} value={topic}>
                  {topic}
                </option>
              ))}
            </select>
            <select
              value={examKindFilter}
              onChange={(event) => setExamKindFilter(event.target.value as ExamKind | "todos")}
            >
              <option value="todos">Todos los formatos</option>
              <option value="actual">Parciales actuales - 2 ejercicios</option>
              <option value="viejo">Parciales viejos - 1 ejercicio</option>
              <option value="practica">Practicas y tipo parcial</option>
            </select>
            <select value={examFilter} onChange={(event) => setExamFilter(event.target.value)}>
              <option value="todos">Todas las fuentes</option>
              {exams.map((exam) => (
                <option key={exam} value={exam}>
                  {exam}
                </option>
              ))}
            </select>
          </div>
          <div className="exercise-list">
            {filteredExercises.map((exercise) => (
              <button
                className={exercise.id === selectedId ? "exercise active" : "exercise"}
                key={exercise.id}
                onClick={() => setSelectedId(exercise.id)}
              >
                <span>{exercise.title}</span>
                <small>
                  {exercise.level} - {exercise.topic}
                </small>
                <em>{getExamInfo(exercise.exam).label}</em>
              </button>
            ))}
            {filteredExercises.length === 0 && (
              <p className="empty-state">No hay ejercicios con esos filtros.</p>
            )}
          </div>
        </section>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <span className="source">
              {viewMode === "camino"
                ? "Camino Tutor adaptativo"
                : viewMode === "practicas"
                  ? "Trabajos practicos de catedra"
                  : selectedExercise.source}
            </span>
            <h2>
              {viewMode === "camino"
                ? selectedStage.title
                : viewMode === "practicas"
                  ? selectedPractice.title
                  : selectedExercise.title}
            </h2>
          </div>
          <div className="topbar-actions">
            {viewMode === "estudio" && returnView && (
              <button className="back-button" onClick={goBackToReturnView}>
                Volver a {viewLabels[returnView]}
              </button>
            )}
            <span className="timer">{formatTimer(secondsLeft)}</span>
            <div className="status-pill">
              <span className={tutorMode === "rules" ? "dot online" : "dot warn"} />
              {isThinking ? "Pensando" : tutorMode === "rules" ? "Tutor local" : "Gemini"}
            </div>
          </div>
        </header>

        <section className="brief">
          <p>
            {viewMode === "camino"
              ? selectedStage.goal
              : viewMode === "practicas"
              ? "Ruta guiada para aprender desde cero: primero concepto, despues mini-practica, despues errores tipicos y finalmente un parcial relacionado."
              : selectedExercise.statement}
          </p>
          <div className="brief-tags">
            {viewMode === "camino" ? (
              <>
                <span>Nivel {selectedStage.level}/5</span>
                <span>{stageExercises.length} misiones</span>
                <span>{stageExamExercises.length} parciales meta</span>
              </>
            ) : viewMode === "practicas" ? (
              <>
                <span>{practices.length} practicas</span>
                <span>{selectedPractice.focus}</span>
                <span>sin soluciones automaticas</span>
              </>
            ) : (
              <>
                <span>{selectedExercise.exam}</span>
                <span>{getExamInfo(selectedExercise.exam).label}</span>
                <span>{selectedExercise.topic}</span>
                <span>{selectedExercise.minutes} min</span>
              </>
            )}
          </div>
        </section>

        {viewMode === "camino" ? (
          <PathPanel
            stages={learningPath}
            selectedStage={selectedStage}
            selectedStageId={selectedStageId}
            onSelectStage={setSelectedStageId}
            stageExercises={stageExercises}
            bridgeExercises={bridgeExercises}
            examExercises={stageExamExercises}
            currentExercise={selectedExercise}
            score={evaluation.score}
            history={history}
            attempts={attempts}
            onOpenExercise={openExerciseFromPath}
          />
        ) : viewMode === "progreso" ? (
          <section className="progress-board">
            <ProgressPanel
              attempts={attempts}
              history={history}
              topicCounts={topicCounts}
              exams={exams}
            />
          </section>
        ) : viewMode === "practicas" ? (
          <PracticePanel
            practices={practices}
            selectedPractice={selectedPractice}
            selectedPracticeId={selectedPracticeId}
            onSelectPractice={setSelectedPracticeId}
            onOpenExam={openPracticeExam}
          />
        ) : (
          <>
            <ToolPanelToggles visiblePanels={visiblePanels} onToggle={togglePanel} />
            <AutomationBar
              onAutoPilot={runAutoPilot}
              onPlan={insertPlanInCode}
              onScaffold={insertSmartScaffold}
              onTrace={prepareAutomaticTrace}
              onNext={openNextRecommended}
            />

            <div className="action-bar">
              <button disabled={isThinking} onClick={() => runTutorAction("hint")}>
                Pista
              </button>
              <button disabled={isThinking} onClick={() => runTutorAction("correct")}>
                Corregir
              </button>
              <button disabled={isThinking} onClick={() => runTutorAction("trace")}>
                Traza
              </button>
              <button disabled={isThinking} className="exam" onClick={() => runTutorAction("exam")}>
                Evaluar parcial
              </button>
              <button disabled={isThinking} className="quiet" onClick={() => runTutorAction("solution")}>
                Solucion
              </button>
              <button className="quiet" onClick={exportAttempt}>
                Exportar .pas
              </button>
              <button className="quiet" onClick={resetCurrentExercise}>
                Resetear
              </button>
            </div>

            {viewMode === "simulacro" && (
              <section className="sim-panel">
                <div>
                  <strong>Modo simulacro</strong>
                  <span>
                    {getExamInfo(selectedExercise.exam).label} - pistas{" "}
                    {hintsLocked ? "bloqueadas" : "permitidas"}
                  </span>
                </div>
                <div className="sim-actions">
                  <select
                    value={selectedId}
                    onChange={(event) => setSelectedId(event.target.value)}
                  >
                    {exercises.map((exercise) => (
                      <option key={exercise.id} value={exercise.id}>
                        {getExamInfo(exercise.exam).label}: {exercise.exam} - {exercise.title}
                      </option>
                    ))}
                  </select>
                  <label>
                    <input
                      type="checkbox"
                      checked={hintsLocked}
                      onChange={(event) => setHintsLocked(event.target.checked)}
                    />
                    Bloquear pistas
                  </label>
                  <button onClick={startSimulacro}>Iniciar</button>
                  <button className="exam" onClick={finishSimulacro}>
                    Entregar
                  </button>
                  <button className="quiet" onClick={finishFullExam}>
                    Entregar parcial completo
                  </button>
                </div>
              </section>
            )}

            <div className="study-grid">
              <section className="editor-panel">
                <div className="panel-toolbar">
                  <span>main.pas</span>
                  <span>Pascal</span>
                </div>
                <Editor
                  height="calc(100% - 38px)"
                  defaultLanguage="pascal"
                  theme="vs-dark"
                  value={code}
                  onChange={(value) => setCode(value ?? "")}
                  options={{
                    fontSize: 15,
                    minimap: { enabled: false },
                    wordWrap: "on",
                    tabSize: 2,
                    lineNumbersMinChars: 3,
                    padding: { top: 14, bottom: 14 },
                  }}
                />
              </section>

              <aside className="right-rail">
                <ChatPanel
                  messages={messages}
                  isThinking={isThinking}
                  onAsk={answerFreeQuestion}
                />
                {visiblePanels.tutor && (
                  <TutorConfig
                    tutorMode={tutorMode}
                    setTutorMode={setTutorMode}
                    geminiKey={geminiKey}
                    setGeminiKey={setGeminiKey}
                    geminiStatus={geminiStatus}
                    onTestGemini={checkGeminiConnection}
                    onClearGemini={removeGeminiKey}
                  />
                )}
                {visiblePanels.rubric && (
                  <RubricPanel checks={evaluation.checks} score={evaluation.score} />
                )}
                {visiblePanels.trace && (
                  <TracePanel exerciseTitle={selectedExercise.title} traceVersion={traceVersion} />
                )}
                {visiblePanels.compiler && <CompilerPanel />}
                {visiblePanels.data && <MaintenancePanel onClearAll={clearAllProgress} />}
              </aside>
            </div>
          </>
        )}
      </section>
    </main>
  );
}

function TutorConfig({
  tutorMode,
  setTutorMode,
  geminiKey,
  setGeminiKey,
  geminiStatus,
  onTestGemini,
  onClearGemini,
}: {
  tutorMode: TutorMode;
  setTutorMode: (mode: TutorMode) => void;
  geminiKey: string;
  setGeminiKey: (value: string) => void;
  geminiStatus: "idle" | "ok" | "error";
  onTestGemini: () => void;
  onClearGemini: () => void;
}) {
  return (
    <PanelShell title="Modo tutor" meta="gratis">
      <div className="mode-switch">
        <button className={tutorMode === "rules" ? "active" : ""} onClick={() => setTutorMode("rules")}>
          Reglas
        </button>
        <button className={tutorMode === "gemini" ? "active" : ""} onClick={() => setTutorMode("gemini")}>
          Gemini
        </button>
      </div>
      <label className="key-field">
        <span>API key propia de Gemini</span>
        <input
          type="password"
          value={geminiKey}
          onChange={(event) => setGeminiKey(event.target.value)}
          placeholder="Pegar key opcional"
        />
      </label>
      <div className="gemini-help">
        <span className={`connection ${geminiStatus}`}>
          {geminiStatus === "ok"
            ? "Gemini conectado"
            : geminiStatus === "error"
              ? "Revisar conexion"
              : "Sin probar"}
        </span>
        <button onClick={onTestGemini}>Probar conexion</button>
      </div>
      <button className="danger-button" onClick={onClearGemini}>
        Borrar API key
      </button>
      <ol className="setup-steps">
        <li>Entra a Google AI Studio.</li>
        <li>Crea una API key gratis.</li>
        <li>Pegala aca y elegi Gemini.</li>
      </ol>
    </PanelShell>
  );
}

function RubricPanel({ checks, score }: { checks: RubricCheck[]; score: number }) {
  return (
    <PanelShell title="Rubrica" meta={`${score}/10`}>
      {checks.map((check) => (
        <div className={`check-row ${check.status}`} key={check.label}>
          <span>{check.status === "ok" ? "OK" : "REV"}</span>
          <p>{check.label}</p>
        </div>
      ))}
    </PanelShell>
  );
}

function TracePanel({
  exerciseTitle,
  traceVersion,
}: {
  exerciseTitle: string;
  traceVersion: number;
}) {
  const exercise = exercises.find((item) => item.title === exerciseTitle);
  const exerciseId = exercise?.id ?? exerciseTitle;
  const [rows, setRows] = useState(() =>
    loadTrace(exerciseId) ?? Array.from({ length: 5 }, () => ({ dato: "", acum: "", puntero: "" })),
  );

  useEffect(() => {
    setRows(
      loadTrace(exerciseId) ??
        Array.from({ length: 5 }, () => ({ dato: "", acum: "", puntero: "" })),
    );
  }, [exerciseId, traceVersion]);

  useEffect(() => {
    saveTrace(exerciseId, rows);
  }, [exerciseId, rows]);

  const updateRow = (index: number, field: "dato" | "acum" | "puntero", value: string) => {
    setRows((current) =>
      current.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [field]: value } : row,
      ),
    );
  };

  return (
    <PanelShell title="Traza manual" meta={exerciseTitle.slice(0, 18)}>
      <table>
        <thead>
          <tr>
            <th>vuelta</th>
            <th>dato/i</th>
            <th>acum</th>
            <th>puntero</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>
                <input
                  value={row.dato}
                  onChange={(event) => updateRow(index, "dato", event.target.value)}
                />
              </td>
              <td>
                <input
                  value={row.acum}
                  onChange={(event) => updateRow(index, "acum", event.target.value)}
                />
              </td>
              <td>
                <input
                  value={row.puntero}
                  onChange={(event) => updateRow(index, "puntero", event.target.value)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </PanelShell>
  );
}

function MaintenancePanel({ onClearAll }: { onClearAll: () => void }) {
  return (
    <PanelShell title="Mantenimiento" meta="datos">
      <div className="compiler-card">
        <strong>Limpiar progreso local</strong>
        <p>Borra codigo guardado, trazas, errores e intentos de este navegador.</p>
        <button className="danger-button" onClick={onClearAll}>
          Borrar progreso
        </button>
      </div>
    </PanelShell>
  );
}

function CompilerPanel() {
  return (
    <PanelShell title="Compilador" meta="futuro">
      <div className="compiler-card">
        <strong>Free Pascal todavia no esta conectado.</strong>
        <p>
          La pagina ya esta preparada para estudiar y corregir por reglas. La ejecucion real
          necesita un backend para correr fpc de forma segura.
        </p>
      </div>
    </PanelShell>
  );
}

function ChatPanel({
  messages,
  isThinking,
  onAsk,
}: {
  messages: ChatMessage[];
  isThinking: boolean;
  onAsk: (question: string) => void;
}) {
  const [question, setQuestion] = useState("");
  const messagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const box = messagesRef.current;
    if (!box) return;
    box.scrollTop = box.scrollHeight;
  }, [messages]);

  const submit = () => {
    onAsk(question);
    setQuestion("");
  };

  return (
    <section className="chat-panel-main">
      <div className="chat-main-header">
        <span>Tutor</span>
        <small>{messages.length} mensajes</small>
      </div>
      <div className="messages" ref={messagesRef}>
        {messages.map((message) => (
          <article className={`message ${message.role}`} key={message.id}>
            <span>{message.role === "tutor" ? "Tutor" : "Vos"}</span>
            <p>{message.text}</p>
          </article>
        ))}
      </div>
      <div className="chat-input">
        <textarea
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Preguntale al tutor sin pedir la solucion completa..."
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              submit();
            }
          }}
        />
        <button disabled={isThinking || !question.trim()} onClick={submit}>
          Enviar
        </button>
      </div>
    </section>
  );
}

function ToolPanelToggles({
  visiblePanels,
  onToggle,
}: {
  visiblePanels: Record<ToolPanelKey, boolean>;
  onToggle: (panel: ToolPanelKey) => void;
}) {
  const panels = Object.keys(toolPanelLabels) as ToolPanelKey[];

  return (
    <section className="tool-toggle-bar" aria-label="Herramientas del tutor">
      <div>
        <span>Herramientas</span>
        <small>Activalas solo cuando las necesites</small>
      </div>
      <div className="tool-toggle-list">
        {panels.map((panel) => (
          <label className={visiblePanels[panel] ? "tool-toggle active" : "tool-toggle"} key={panel}>
            <input
              type="checkbox"
              checked={visiblePanels[panel]}
              onChange={() => onToggle(panel)}
            />
            {toolPanelLabels[panel]}
          </label>
        ))}
      </div>
    </section>
  );
}

function AutomationBar({
  onAutoPilot,
  onPlan,
  onScaffold,
  onTrace,
  onNext,
}: {
  onAutoPilot: () => void;
  onPlan: () => void;
  onScaffold: () => void;
  onTrace: () => void;
  onNext: () => void;
}) {
  return (
    <section className="automation-bar" aria-label="Automatizaciones de estudio">
      <button className="auto-primary" onClick={onAutoPilot}>
        Piloto automatico
      </button>
      <button onClick={onPlan}>Armar plan</button>
      <button onClick={onScaffold}>Insertar esqueleto</button>
      <button onClick={onTrace}>Preparar traza</button>
      <button onClick={onNext}>Siguiente recomendado</button>
    </section>
  );
}

function PathPanel({
  stages,
  selectedStage,
  selectedStageId,
  onSelectStage,
  stageExercises,
  bridgeExercises,
  examExercises,
  currentExercise,
  score,
  history,
  attempts,
  onOpenExercise,
}: {
  stages: LearningStage[];
  selectedStage: LearningStage;
  selectedStageId: string;
  onSelectStage: (id: string) => void;
  stageExercises: Exercise[];
  bridgeExercises: Exercise[];
  examExercises: Exercise[];
  currentExercise: Exercise;
  score: number;
  history: ErrorRecord[];
  attempts: ExamAttempt[];
  onOpenExercise: (exerciseId: string, reason: string) => void;
}) {
  const currentIndex = stageExercises.findIndex((exercise) => exercise.id === currentExercise.id);
  const nextInStage = currentIndex >= 0 ? stageExercises[currentIndex + 1] : stageExercises[0];
  const bridge = bridgeExercises[0] ?? stageExercises[0];
  const examGoal = examExercises[0] ?? stageExercises[stageExercises.length - 1];
  const weakTopics = history
    .filter((item) => selectedStage.topics.includes(item.topic))
    .slice(0, 3);

  const mission =
    score >= 8 && examGoal
      ? {
          title: "Estas cerca: subi a formato parcial",
          text: "Tu intento actual viene fuerte. Ahora conviene practicar una consigna integradora y corregir con rubrica.",
          exercise: nextInStage ?? examGoal,
          action: "Subir dificultad",
        }
      : score < 5 && bridge
        ? {
            title: "Todavia falta base: hagamos puente",
            text: "No es retroceder: es construir el ladrillo que falta para que el parcial no sea una pared.",
            exercise: bridge,
            action: "Hacer ejercicio puente",
          }
        : {
            title: "Mision recomendada",
            text: "Este ejercicio esta en una dificultad razonable para avanzar sin quemarte ni copiar soluciones.",
            exercise: nextInStage ?? stageExercises[0],
            action: "Practicar ahora",
          };

  return (
    <section className="path-board">
      <aside className="level-map">
        <div className="level-map-head">
          <span>Ruta completa</span>
          <strong>Nivel maximo: parcial</strong>
        </div>
        {stages.map((stage) => (
          <button
            className={stage.id === selectedStageId ? "level-step active" : "level-step"}
            key={stage.id}
            onClick={() => onSelectStage(stage.id)}
          >
            <small>Nivel {stage.level}</small>
            <span>{stage.title}</span>
          </button>
        ))}
      </aside>

      <div className="path-main">
        <section className="mission-card">
          <div>
            <span className="eyebrow">Tutor inteligente</span>
            <h3>{mission.title}</h3>
            <p>{mission.text}</p>
          </div>
          {mission.exercise && (
            <button
              onClick={() =>
                onOpenExercise(
                  mission.exercise.id,
                  `${mission.title}. Lo elegi porque tu nivel actual estimado es ${score}/10.`,
                )
              }
            >
              {mission.action}
            </button>
          )}
        </section>

        <section className="coach-grid">
          <article className="coach-tile focus">
            <span>Objetivo del nivel</span>
            <p>{selectedStage.goal}</p>
          </article>
          <article className="coach-tile">
            <span>Como te voy a ayudar</span>
            <p>{selectedStage.tutorPromise}</p>
          </article>
          <article className="coach-tile">
            <span>Estado actual</span>
            <p>
              Puntaje estimado: <strong>{score}/10</strong>. Simulacros entregados:{" "}
              <strong>{attempts.length}</strong>.
            </p>
          </article>
        </section>

        <section className="path-section">
          <div className="section-title">
            <span>Misiones de este nivel</span>
            <small>De menor a mayor dificultad</small>
          </div>
          <div className="mission-list">
            {stageExercises.map((exercise, index) => (
              <button
                className={exercise.id === currentExercise.id ? "mission-row active" : "mission-row"}
                key={exercise.id}
                onClick={() =>
                  onOpenExercise(
                    exercise.id,
                    `Te asigno esta mision del nivel ${selectedStage.level}. Intentala sin mirar solucion; si te trabas, pedi pista.`,
                  )
                }
              >
                <small>{index + 1}</small>
                <span>{exercise.title}</span>
                <em>{exercise.level}</em>
              </button>
            ))}
          </div>
        </section>

        <section className="path-lower-grid">
          <article className="path-section">
            <div className="section-title">
              <span>Si te trabas</span>
              <small>Puentes antes de abandonar</small>
            </div>
            <div className="bridge-list">
              {bridgeExercises.map((exercise) => (
                <button
                  key={exercise.id}
                  onClick={() =>
                    onOpenExercise(
                      exercise.id,
                      "Volvemos a un ejercicio puente para aislar el problema sin mezclar todo.",
                    )
                  }
                >
                  {exercise.title}
                </button>
              ))}
            </div>
          </article>

          <article className="path-section">
            <div className="section-title">
              <span>Checkpoints</span>
              <small>Antes de subir</small>
            </div>
            <ul className="checkpoint-list">
              {selectedStage.checkpoints.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <article className="path-section exam-goal">
            <div className="section-title">
              <span>Nivel final</span>
              <small>Parcial real</small>
            </div>
            <p>Cuando estos puntos salgan sin mirar solucion, recien ahi conviene ir a parcial.</p>
            {examGoal && (
              <button
                onClick={() =>
                  onOpenExercise(
                    examGoal.id,
                    "Vamos a formato parcial. Ahora importa estrategia, modularizacion y rubrica.",
                  )
                }
              >
                Probar parcial
              </button>
            )}
          </article>

          <article className="path-section">
            <div className="section-title">
              <span>Alertas del tutor</span>
              <small>Segun tu historial</small>
            </div>
            {weakTopics.length === 0 ? (
              <p className="soft-text">Todavia no hay alertas de este nivel. Hace una correccion para generar diagnostico.</p>
            ) : (
              weakTopics.map((item) => (
                <p className="alert-line" key={item.id}>
                  <strong>{item.kind}</strong> {item.text}
                </p>
              ))
            )}
          </article>
        </section>
      </div>
    </section>
  );
}

function PracticePanel({
  practices,
  selectedPractice,
  selectedPracticeId,
  onSelectPractice,
  onOpenExam,
}: {
  practices: PracticeGuide[];
  selectedPractice: PracticeGuide;
  selectedPracticeId: string;
  onSelectPractice: (id: string) => void;
  onOpenExam: (exam: string) => void;
}) {
  return (
    <section className="practice-board">
      <aside className="practice-list">
        <div className="practice-list-header">
          <span>Ruta de aprendizaje</span>
          <strong>{practices.length} TPs</strong>
        </div>
        {practices.map((practice, index) => (
          <button
            className={practice.id === selectedPracticeId ? "practice-card active" : "practice-card"}
            key={practice.id}
            onClick={() => onSelectPractice(practice.id)}
          >
            <small>TP {index + 1}</small>
            <span>{practice.title}</span>
            <em>{practice.focus}</em>
          </button>
        ))}
      </aside>

      <article className="practice-detail">
        <div className="practice-hero">
          <div>
            <span>{selectedPractice.source}</span>
            <h3>{selectedPractice.title}</h3>
            <p>{selectedPractice.focus}</p>
          </div>
          <button onClick={() => onOpenExam(selectedPractice.relatedExam)}>
            Ir al parcial relacionado
          </button>
        </div>

        <div className="practice-method">
          <strong>Como usar esta practica</strong>
          <p>
            No busques copiar una solucion completa. Primero escribi los tipos y el modulo chico,
            despues proba una traza manual con 2 o 3 datos, y recien ahi pedi correccion o pista.
          </p>
        </div>

        <div className="practice-sections">
          <PracticeSection title="Antes de codear" items={selectedPractice.beforeCoding} />
          <PracticeSection title="Tenes que dominar" items={selectedPractice.mustMaster} />
          <PracticeSection title="Ejercicios guiados" items={selectedPractice.guidedExercises} />
          <PracticeSection title="Errores tipicos" items={selectedPractice.commonMistakes} tone="warn" />
        </div>
      </article>
    </section>
  );
}

function PracticeSection({
  title,
  items,
  tone = "normal",
}: {
  title: string;
  items: string[];
  tone?: "normal" | "warn";
}) {
  return (
    <section className={tone === "warn" ? "practice-section warn" : "practice-section"}>
      <h4>{title}</h4>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

function ProgressPanel({
  attempts,
  history,
  topicCounts,
  exams,
}: {
  attempts: ExamAttempt[];
  history: ErrorRecord[];
  topicCounts: Record<string, number>;
  exams: string[];
}) {
  const weakestTopic =
    Object.entries(topicCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "listas simples";
  const lastScore = attempts[0]?.score;
  const recommendations = [
    `Repasar ${weakestTopic} con un ejercicio corto antes de otro simulacro.`,
    lastScore && lastScore < 6
      ? "Hacer una traza manual antes de entregar: ahi suelen aparecer los errores de logica."
      : "Subir dificultad: elegir un ejercicio nivel parcial o desafio.",
    "Practicar explicar el recorrido en voz alta: entrada, condicion de corte, avance y resultado.",
  ];

  return (
    <>
      <div className="progress-card wide coach-card">
        <h2>Plan recomendado</h2>
        {recommendations.map((item) => (
          <p key={item}>{item}</p>
        ))}
      </div>
      <div className="progress-card">
        <h2>Parciales actuales</h2>
        <ExamGroupList exams={exams} kind="actual" />
      </div>
      <div className="progress-card">
        <h2>Parciales viejos</h2>
        <ExamGroupList exams={exams} kind="viejo" />
      </div>
      <div className="progress-card">
        <h2>Practicas tipo parcial</h2>
        <ExamGroupList exams={exams} kind="practica" />
      </div>
      <div className="progress-card">
        <h2>Temas a repasar</h2>
        {Object.keys(topicCounts).length === 0 ? (
          <p>Todavia no hay marcas. Hace una correccion para generar historial.</p>
        ) : (
          Object.entries(topicCounts).map(([topic, count]) => (
            <div className="history-row" key={topic}>
              <span>{topic}</span>
              <strong>{count}</strong>
            </div>
          ))
        )}
      </div>
      <div className="progress-card wide">
        <h2>Ultimos simulacros</h2>
        {attempts.length === 0 ? (
          <p>No entregaste simulacros todavia.</p>
        ) : (
          attempts.slice(0, 8).map((attempt) => (
            <div className="attempt-row" key={attempt.id}>
              <span>{attempt.exerciseId}</span>
              <strong>{attempt.score}/10</strong>
              <small>{formatTimer(attempt.durationSeconds)}</small>
            </div>
          ))
        )}
      </div>
      <div className="progress-card wide">
        <h2>Errores recientes</h2>
        {history.length === 0 ? (
          <p>No hay errores recientes.</p>
        ) : (
          history.slice(0, 8).map((item) => (
            <p className="error-line" key={item.id}>
              <strong>{item.kind}</strong> {item.text}
            </p>
          ))
        )}
      </div>
    </>
  );
}

function ExamGroupList({ exams, kind }: { exams: string[]; kind: ExamKind }) {
  const filtered = exams.filter((exam) => getExamInfo(exam).kind === kind);

  if (filtered.length === 0) {
    return <p>No hay elementos en este grupo todavia.</p>;
  }

  return (
    <div className="exam-list">
      {filtered.map((exam) => {
        const info = getExamInfo(exam);
        return (
          <span key={exam}>
            {exam}
            <small>{info.label}</small>
          </span>
        );
      })}
    </div>
  );
}

export default App;
