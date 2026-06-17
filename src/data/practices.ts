export type PracticeGuide = {
  id: string;
  title: string;
  source: string;
  focus: string;
  beforeCoding: string[];
  mustMaster: string[];
  guidedExercises: string[];
  commonMistakes: string[];
  relatedExam: string;
};

export const practices: PracticeGuide[] = [
  {
    id: "p1-maximos-minimos",
    title: "Practica 1: Maximos, minimos y control",
    source: "Practica-1-MaximosyMinimos.pdf",
    focus: "Primeros programas, lectura/escritura, condiciones, maximos y minimos.",
    beforeCoding: [
      "Identificar datos de entrada, proceso y salida.",
      "Escribir primero casos chicos en papel.",
      "No usar modulos todavia si el problema es de entrada al tema.",
    ],
    mustMaster: [
      "Inicializar maximos y minimos con un valor valido.",
      "Distinguir contador, acumulador y maximo.",
      "Usar if/else sin mezclar condiciones.",
    ],
    guidedExercises: [
      "Promedio de dos numeros.",
      "Mayor entre dos numeros.",
      "Paridad y multiplos.",
      "Maximo/minimo de una secuencia.",
    ],
    commonMistakes: [
      "Inicializar un minimo en 0 cuando los datos pueden ser positivos.",
      "Actualizar el valor maximo pero olvidar el codigo asociado.",
      "Leer de mas o procesar el valor de corte.",
    ],
    relatedExam: "Practica tipo parcial - maximos",
  },
  {
    id: "p2-numeros-caracteres",
    title: "Practica 2: Numeros y caracteres",
    source: "Practica-2-ManejoDeNumerosyCaracteres.pdf",
    focus: "Descomposicion de numeros con div/mod y manejo de caracteres.",
    beforeCoding: [
      "Probar a mano como se separan digitos con mod 10 y div 10.",
      "Decidir si el numero de corte se procesa o no.",
      "Separar palabras/caracteres antes de pensar en el codigo completo.",
    ],
    mustMaster: [
      "Suma de digitos.",
      "Contar pares e impares.",
      "Detectar letras, digitos y consonantes.",
    ],
    guidedExercises: [
      "Informar digitos impares.",
      "Contar pares e impares en un entero.",
      "Validar patrones de codigo.",
      "Procesar hasta corte.",
    ],
    commonMistakes: [
      "Olvidar dividir el numero dentro del while.",
      "No procesar completo el ultimo numero cuando la consigna lo pide.",
      "Confundir caracter '3' con numero 3.",
    ],
    relatedExam: "Parcial AFA 2024",
  },
  {
    id: "p3-modulos",
    title: "Practica 3: Funciones y procedimientos",
    source: "Practica-3-FuncionesyProcedimientos.pdf",
    focus: "Modularizacion, parametros por valor/referencia, funciones y procedures.",
    beforeCoding: [
      "Decidir que devuelve el modulo y que modifica.",
      "Usar function cuando hay un resultado principal.",
      "Usar procedure con var cuando hay mas de un resultado.",
    ],
    mustMaster: [
      "Pasaje por valor vs var.",
      "Funciones que asignan su nombre antes de terminar.",
      "Procedimientos de lectura y procesamiento.",
    ],
    guidedExercises: [
      "Modulo que devuelve dos digitos menores.",
      "Max4 usando Max2.",
      "Validar caracteres con funciones.",
      "Separar lectura, proceso e informe.",
    ],
    commonMistakes: [
      "Olvidar asignar el retorno de la funcion.",
      "Usar var de mas y modificar datos sin querer.",
      "Hacer un modulo gigante que resuelve todo.",
    ],
    relatedExam: "Practica modularizacion",
  },
  {
    id: "p4-registros",
    title: "Practica 4: Registros",
    source: "Practica-4-TDDU-Registros---2025.pdf",
    focus: "Modelar objetos con record y modularizar comparaciones.",
    beforeCoding: [
      "Dibujar el record y sus campos.",
      "Pensar que campos se leen y que campos se calculan.",
      "Escribir modulos para comparar fechas, duraciones o distancias.",
    ],
    mustMaster: [
      "Definir records claros.",
      "Leer y pasar records como parametros.",
      "Comparar campos compuestos.",
    ],
    guidedExercises: [
      "Pecera con dimensiones.",
      "Distancia kilometros/metros.",
      "Sesiones con fecha y duracion.",
      "Records dentro de vectores/listas.",
    ],
    commonMistakes: [
      "Comparar records completos en vez de campos.",
      "No modularizar comparaciones repetidas.",
      "Confundir campo calculado con campo leido.",
    ],
    relatedExam: "Practica records",
  },
  {
    id: "p5-corte-control",
    title: "Practica 5: Corte de control",
    source: "Practica-5-Corte-de-Control.pdf",
    focus: "Datos agrupados por clave y procesamiento por grupos.",
    beforeCoding: [
      "Identificar la clave de corte: pais, marca, sucursal, etc.",
      "Anotar el esquema while externo / while interno.",
      "Inicializar acumuladores al entrar a cada grupo.",
    ],
    mustMaster: [
      "Corte de control con datos ordenados.",
      "Acumular por grupo.",
      "Maximo global y estadisticas por grupo al mismo tiempo.",
    ],
    guidedExercises: [
      "Proyectos agrupados por pais.",
      "Consolas agrupadas por marca.",
      "Recaudacion por sucursal.",
      "Canales agrupados por pais.",
    ],
    commonMistakes: [
      "No guardar la clave actual antes del while interno.",
      "Olvidar reiniciar acumuladores por grupo.",
      "Leer de nuevo en el lugar incorrecto.",
    ],
    relatedExam: "Parcial Twitch 2024",
  },
  {
    id: "p6-vectores",
    title: "Practica 6: Arreglos",
    source: "Practica-6-Arreglos-2026.pdf",
    focus: "Vectores, dimension logica/fisica, contadores, insertar y borrar.",
    beforeCoding: [
      "Definir dimF y dimL.",
      "Decidir si se recorre todo el vector o solo dimL.",
      "Para contadores, inicializar todas las posiciones.",
    ],
    mustMaster: [
      "Dimension logica.",
      "Vector contador.",
      "Top 2 en vectores.",
      "Insertar y borrar desplazando.",
    ],
    guidedExercises: [
      "Vector de 150 enteros.",
      "Surtidores con vector acumulador.",
      "Contar caracteres.",
      "Dos minimos con posicion.",
    ],
    commonMistakes: [
      "Recorrer hasta dimF cuando dimL es menor.",
      "No validar posicion antes de insertar/borrar.",
      "Olvidar desplazar de atras hacia adelante al insertar.",
    ],
    relatedExam: "Practica vectores",
  },
  {
    id: "p7-matrices",
    title: "Practica 7: Matrices",
    source: "Practica-7-Matrices---2025.pdf",
    focus: "Matrices, recorridos por filas/columnas y tablas de consulta.",
    beforeCoding: [
      "Ubicar que representa cada indice.",
      "Distinguir matriz de datos y tabla de precios/costos.",
      "Probar recorridos con matriz chica 2x3.",
    ],
    mustMaster: [
      "Doble for.",
      "Fila, columna y diagonal.",
      "Tabla de costos por dos claves.",
      "Matriz de booleanos.",
    ],
    guidedExercises: [
      "Imprimir filas impares y columnas pares.",
      "Diagonal principal.",
      "Reservas de hotel por dia/tipo.",
      "Album de figuritas 48x20.",
    ],
    commonMistakes: [
      "Invertir fila y columna.",
      "Usar indices fuera de rango.",
      "No reiniciar suma por fila.",
    ],
    relatedExam: "Parcial figuritas 2026",
  },
  {
    id: "p8-punteros",
    title: "Practica 8: Punteros",
    source: "Practica-8-AlocacionDinamica-Punteros.docx.pdf",
    focus: "New, dispose, aliasing y memoria dinamica.",
    beforeCoding: [
      "Dibujar cajas y flechas.",
      "Marcar cuando dos punteros apuntan al mismo lugar.",
      "Pensar que pasa despues de dispose.",
    ],
    mustMaster: [
      "new y dispose.",
      "nil.",
      "Acceso con ^.",
      "No usar punteros liberados.",
    ],
    guidedExercises: [
      "Reservar un entero dinamico.",
      "Analizar c1/c2 apuntando al mismo record.",
      "Calcular memoria usada.",
      "Liberar estructuras correctamente.",
    ],
    commonMistakes: [
      "Usar un puntero sin new.",
      "Hacer dispose y seguir accediendo.",
      "Perder la unica referencia a memoria reservada.",
    ],
    relatedExam: "Practica listas dobles",
  },
  {
    id: "p9-listas",
    title: "Practica 9: Listas simples y dobles",
    source: "Practica-9-Listas-Simples-y-Dobles (1).pdf",
    focus: "Agregar, insertar, borrar, recorrer y liberar listas.",
    beforeCoding: [
      "Dibujar el nodo y sus enlaces.",
      "Separar casos: lista vacia, primero, medio, ultimo.",
      "Usar actual/anterior para borrar o insertar.",
    ],
    mustMaster: [
      "Agregar adelante y al final.",
      "Insertar ordenado.",
      "Eliminar nodos.",
      "Lista doble con ant/sig.",
      "Liberar memoria.",
    ],
    guidedExercises: [
      "Lista de enteros terminada en 999.",
      "Buscar primer ocurrencia.",
      "Recorrer una sola vez.",
      "Agregar al inicio/final en lista doble.",
    ],
    commonMistakes: [
      "No avanzar el puntero dentro del while.",
      "Perder la cabeza de la lista.",
      "No actualizar ant en listas dobles.",
      "No liberar nodos.",
    ],
    relatedExam: "Practica tipo parcial - listas",
  },
  {
    id: "p10-repaso",
    title: "Practica 10: Repaso general",
    source: "Practica-10-RepasoGeneral-2025.pdf",
    focus: "Integracion para parcial: registros, vectores, matrices, listas y corte.",
    beforeCoding: [
      "Leer toda la consigna y marcar estructuras disponibles.",
      "Identificar si pide recorrer una sola vez.",
      "Anotar modulos antes de escribir codigo.",
    ],
    mustMaster: [
      "Elegir estructura correcta.",
      "Modularizar sin resolver todo en main.",
      "Combinar top 2, suma de digitos y listas.",
      "Liberar memoria.",
    ],
    guidedExercises: [
      "Resolver un parcial viejo por partes.",
      "Reescribir modulos tipicos de lista.",
      "Hacer traza de recorrido.",
      "Corregir con rubrica antes de ver solucion.",
    ],
    commonMistakes: [
      "Empezar a codear sin estructura de datos.",
      "Dar soluciones largas no modularizadas.",
      "No respetar recorrido unico.",
    ],
    relatedExam: "Simulacro integral",
  },
];
