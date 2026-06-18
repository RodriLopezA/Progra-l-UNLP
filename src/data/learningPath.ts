import type { ExerciseTopic } from "../types";

export type LearningStage = {
  id: string;
  level: number;
  title: string;
  subtitle: string;
  topics: ExerciseTopic[];
  goal: string;
  tutorPromise: string;
  exercises: string[];
  bridgeExercises: string[];
  examExercises: string[];
  checkpoints: string[];
};

export const learningPath: LearningStage[] = [
  {
    id: "base",
    level: 1,
    title: "Base cero sin marearse",
    subtitle: "Lectura, condiciones, acumuladores, maximos y digitos.",
    topics: ["maximos y minimos", "suma de digitos", "records"],
    goal: "Que puedas leer una consigna chica y transformarla en variables, condiciones y modulos simples.",
    tutorPromise:
      "Si te trabas aca, el tutor no te manda a listas: te baja a preguntas cortas y trazas de numeros.",
    exercises: ["suma-digitos", "maximo-dos-codigos", "records-promedio"],
    bridgeExercises: ["suma-digitos", "vector-minimo-posicion"],
    examExercises: ["maximo-dos-codigos"],
    checkpoints: [
      "Se distinguir contador, acumulador y maximo.",
      "Puedo usar div/mod sin quedarme en loop.",
      "Puedo escribir un procedure o function corto.",
    ],
  },
  {
    id: "estructuras-estaticas",
    level: 2,
    title: "Vectores, matrices y tablas",
    subtitle: "Indices, dimension logica, tablas de consulta y top 2.",
    topics: ["vectores", "matrices/tablas"],
    goal: "Que puedas elegir entre vector contador, matriz booleana o tabla de costos sin probar al azar.",
    tutorPromise:
      "Si aparecen errores de indices, el tutor te pide una matriz mini 2x3 antes de seguir.",
    exercises: ["vector-minimo-posicion", "vector-contar-rango", "matriz-suma-fila"],
    bridgeExercises: ["vector-contar-rango", "matriz-suma-fila"],
    examExercises: ["parcial-figuritas-mundial", "parcial-hoteles-reservas"],
    checkpoints: [
      "Recorro solo hasta dimL cuando corresponde.",
      "No invierto fila y columna.",
      "Puedo sacar maximos por posicion o por acumulador.",
    ],
  },
  {
    id: "listas-simples",
    level: 3,
    title: "Listas simples con cabeza fria",
    subtitle: "Recorrer, agregar, insertar ordenado, eliminar y liberar.",
    topics: ["listas simples", "recorridos de lista", "insertar ordenado", "eliminar nodos"],
    goal: "Que puedas dibujar punteros y resolver casos borde sin perder la lista.",
    tutorPromise:
      "Si el codigo se rompe, volvemos a dibujo de act/ant/nue y a un modulo chico.",
    exercises: [
      "lista-contar-pares",
      "lista-sumar-campo-record",
      "insertar-ordenado-record",
      "eliminar-nodo-legajo",
    ],
    bridgeExercises: ["lista-contar-pares", "lista-sumar-campo-record"],
    examExercises: ["parcial-handball-equipos", "parcial-hoteles-reservas"],
    checkpoints: [
      "Siempre avanzo el puntero dentro del while.",
      "Se separar lista vacia, primer nodo, medio y ultimo.",
      "Despues de eliminar, libero memoria con dispose.",
    ],
  },
  {
    id: "punteros-listas-dobles",
    level: 4,
    title: "Punteros y listas dobles",
    subtitle: "Ant/sig, primero/ultimo, enganches correctos y memoria.",
    topics: ["listas doblemente enlazadas"],
    goal: "Que puedas leer codigo de lista doble y justificar si los enlaces estan bien.",
    tutorPromise:
      "Aca el tutor se pone exigente con dibujos: cada asignacion de puntero tiene que tener sentido.",
    exercises: [
      "lista-doble-recorrer",
      "parcial-afa-lista-doble-inicio",
      "parcial-twitch-lista-doble-completar",
      "parcial-figuritas-lista-doble-final",
    ],
    bridgeExercises: ["lista-contar-pares", "lista-doble-recorrer"],
    examExercises: [
      "parcial-afa-lista-doble-inicio",
      "parcial-twitch-lista-doble-completar",
      "parcial-figuritas-lista-doble-final",
    ],
    checkpoints: [
      "Distingo anterior logico de campo ant.",
      "Actualizo primero y ultimo en lista vacia.",
      "No uso nodos sin new ni despues de dispose.",
    ],
  },
  {
    id: "parcial-real",
    level: 5,
    title: "Nivel parcial real",
    subtitle: "Recorrido una sola vez, integracion y rubrica de entrega.",
    topics: ["recorridos una sola vez", "matrices/tablas", "listas simples"],
    goal: "Que puedas resolver un parcial actual completo de 2 ejercicios con estrategia, no por memoria.",
    tutorPromise:
      "El tutor ya no regala tantas pistas: te evalua con rubrica, estructura, modulos y errores tipicos.",
    exercises: [
      "parcial-cines-latinoamerica",
      "parcial-twitch-streaming",
      "parcial-twitch-lista-doble-completar",
      "parcial-afa-fichajes",
      "parcial-afa-lista-doble-inicio",
      "parcial-figuritas-mundial",
      "parcial-figuritas-lista-doble-final",
    ],
    bridgeExercises: ["una-vez-max-min", "insertar-ordenado-record", "eliminar-nodo-legajo"],
    examExercises: [
      "parcial-cines-latinoamerica",
      "parcial-handball-equipos",
      "parcial-twitch-streaming",
      "parcial-twitch-lista-doble-completar",
      "parcial-afa-fichajes",
      "parcial-afa-lista-doble-inicio",
      "parcial-hoteles-reservas",
      "parcial-figuritas-mundial",
      "parcial-figuritas-lista-doble-final",
    ],
    checkpoints: [
      "Antes de codear, escribo estructuras y modulos.",
      "Respeto recorrido unico cuando la consigna lo pide.",
      "Entrego con liberacion de memoria y casos borde pensados.",
    ],
  },
  {
    id: "extremo",
    level: 6,
    title: "Modo extremo: parcial sin red",
    subtitle: "Solo parciales actuales, tiempo real, sin esqueletos ni solucion.",
    topics: ["recorridos una sola vez", "matrices/tablas", "listas doblemente enlazadas"],
    goal: "Simular el parcial actual de 2 ejercicios como si estuvieras sentado rindiendo.",
    tutorPromise:
      "En este nivel no te doy codigo ni esqueletos. Solo cronometro, consigna, entrega final y rubrica.",
    exercises: [
      "parcial-twitch-streaming",
      "parcial-twitch-lista-doble-completar",
      "parcial-afa-fichajes",
      "parcial-afa-lista-doble-inicio",
      "parcial-figuritas-mundial",
      "parcial-figuritas-lista-doble-final",
    ],
    bridgeExercises: [],
    examExercises: [
      "parcial-twitch-streaming",
      "parcial-twitch-lista-doble-completar",
      "parcial-afa-fichajes",
      "parcial-afa-lista-doble-inicio",
      "parcial-figuritas-mundial",
      "parcial-figuritas-lista-doble-final",
    ],
    checkpoints: [
      "Leo toda la consigna antes de escribir.",
      "Armo tipos y modulos sin mirar ayudas.",
      "Respeto tiempo, recorrido unico y liberacion de memoria.",
    ],
  },
];
