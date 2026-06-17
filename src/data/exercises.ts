import type { Exercise } from "../types";

export const exercises: Exercise[] = [
  {
    id: "lista-contar-pares",
    topic: "recorridos de lista",
    title: "Contar pares en una lista",
    source: "Inspirado en parciales de Programacion 1 UNLP",
    level: "inicial",
    exam: "Practica guiada",
    minutes: 18,
    statement:
      "Dada una lista simple de enteros, implementar un modulo que recorra la lista una sola vez y devuelva la cantidad de numeros pares.",
    starterCode: `program contarPares;

type
  lista = ^nodo;
  nodo = record
    dato: integer;
    sig: lista;
  end;

function cantidadPares(l: lista): integer;
begin
  { completar }
end;

begin
end.`,
    hints: [
      "Pensalo como un recorrido con un acumulador que empieza en 0.",
      "La condicion del while deberia frenar cuando el puntero llega a nil.",
      "Acordate de avanzar el puntero dentro del ciclo para no quedar en loop infinito.",
    ],
    rubric: [
      "Inicializa correctamente el contador.",
      "Recorre hasta nil.",
      "Cuenta solo los datos pares.",
      "Avanza el puntero en cada iteracion.",
      "Devuelve el resultado de la funcion.",
    ],
    referenceSolution: `function cantidadPares(l: lista): integer;
var
  cant: integer;
begin
  cant := 0;
  while (l <> nil) do begin
    if (l^.dato mod 2 = 0) then
      cant := cant + 1;
    l := l^.sig;
  end;
  cantidadPares := cant;
end;`,
  },
  {
    id: "insertar-ordenado-record",
    topic: "insertar ordenado",
    title: "Insertar alumno ordenado por legajo",
    source: "Inspirado en parciales de Programacion 1 UNLP",
    level: "parcial",
    exam: "Practica tipo parcial - listas",
    minutes: 30,
    statement:
      "Dada una lista ordenada por legajo, insertar un nuevo alumno manteniendo el orden ascendente. El alumno tiene legajo y nota.",
    starterCode: `program insertarAlumno;

type
  alumno = record
    legajo: integer;
    nota: real;
  end;

  lista = ^nodo;
  nodo = record
    dato: alumno;
    sig: lista;
  end;

procedure insertarOrdenado(var l: lista; a: alumno);
begin
  { completar }
end;

begin
end.`,
    hints: [
      "Vas a necesitar un nodo nuevo y dos punteros para ubicar la posicion.",
      "Separar el caso de insertar al principio suele simplificar mucho.",
      "La condicion de busqueda compara el legajo actual contra el legajo nuevo.",
    ],
    rubric: [
      "Reserva memoria con new.",
      "Carga el record completo en el nodo.",
      "Maneja lista vacia o insercion al principio.",
      "Usa anterior y actual para buscar posicion.",
      "Reenlaza punteros sin perder la lista.",
    ],
    referenceSolution: `procedure insertarOrdenado(var l: lista; a: alumno);
var
  nue, act, ant: lista;
begin
  new(nue);
  nue^.dato := a;
  act := l;
  ant := l;
  while (act <> nil) and (act^.dato.legajo < a.legajo) do begin
    ant := act;
    act := act^.sig;
  end;
  if (act = l) then
    l := nue
  else
    ant^.sig := nue;
  nue^.sig := act;
end;`,
  },
  {
    id: "vector-minimo-posicion",
    topic: "vectores",
    title: "Minimo y posicion en vector",
    source: "Inspirado en practica y parciales de Programacion 1 UNLP",
    level: "inicial",
    exam: "Practica vectores",
    minutes: 20,
    statement:
      "Dado un vector de 100 enteros, informar el valor minimo y la posicion donde aparece por primera vez.",
    starterCode: `program minimoVector;

const
  dimF = 100;

type
  vector = array[1..dimF] of integer;

procedure minimo(v: vector; var min: integer; var pos: integer);
begin
  { completar }
end;

begin
end.`,
    hints: [
      "Inicializa el minimo con el primer elemento del vector.",
      "El recorrido puede empezar en 2 si ya usaste la posicion 1.",
      "Solo actualiza cuando encontrás un valor estrictamente menor.",
    ],
    rubric: [
      "Inicializa min y pos con una posicion valida.",
      "Recorre el rango completo necesario.",
      "No usa posiciones fuera de 1..dimF.",
      "Conserva la primera aparicion del minimo.",
    ],
    referenceSolution: `procedure minimo(v: vector; var min: integer; var pos: integer);
var
  i: integer;
begin
  min := v[1];
  pos := 1;
  for i := 2 to dimF do
    if (v[i] < min) then begin
      min := v[i];
      pos := i;
    end;
end;`,
  },
  {
    id: "suma-digitos",
    topic: "suma de digitos",
    title: "Sumar digitos de un numero",
    source: "Ejercicio tipico de Programacion 1",
    level: "inicial",
    exam: "Practica modularizacion",
    minutes: 12,
    statement:
      "Implementar una funcion que reciba un entero positivo y devuelva la suma de sus digitos.",
    starterCode: `program sumaDigitos;

function sumarDigitos(n: integer): integer;
begin
  { completar }
end;

begin
end.`,
    hints: [
      "El ultimo digito se obtiene con mod 10.",
      "Para quitar el ultimo digito se usa div 10.",
      "Necesitas un acumulador y un while que avance sobre el numero.",
    ],
    rubric: [
      "Usa mod para obtener digitos.",
      "Usa div para reducir el numero.",
      "Inicializa el acumulador.",
      "Devuelve el acumulador al final.",
    ],
    referenceSolution: `function sumarDigitos(n: integer): integer;
var
  suma: integer;
begin
  suma := 0;
  while (n <> 0) do begin
    suma := suma + (n mod 10);
    n := n div 10;
  end;
  sumarDigitos := suma;
end;`,
  },
  {
    id: "records-promedio",
    topic: "records",
    title: "Promedio de notas con records",
    source: "Inspirado en practica de Programacion 1 UNLP",
    level: "inicial",
    exam: "Practica records",
    minutes: 20,
    statement:
      "Leer alumnos con legajo y nota hasta legajo 0 e informar el promedio de notas. Modularizar la lectura del record.",
    starterCode: `program promedioRecords;

type
  alumno = record
    legajo: integer;
    nota: real;
  end;

procedure leerAlumno(var a: alumno);
begin
  { completar }
end;

function promedioNotas: real;
begin
  { completar }
end;

begin
end.`,
    hints: [
      "Primero separa la lectura del record en un procedure.",
      "Necesitas acumular notas y contar alumnos validos.",
      "El corte es por legajo 0, no por nota.",
    ],
    rubric: [
      "Lee el record completo.",
      "Corta correctamente con legajo 0.",
      "Inicializa suma y contador.",
      "Evita dividir por cero.",
    ],
    referenceSolution: `procedure leerAlumno(var a: alumno);
begin
  readln(a.legajo);
  if (a.legajo <> 0) then
    readln(a.nota);
end;`,
  },
  {
    id: "eliminar-nodo-legajo",
    topic: "eliminar nodos",
    title: "Eliminar alumno por legajo",
    source: "Inspirado en parciales de Programacion 1 UNLP",
    level: "parcial",
    exam: "Practica tipo parcial - listas",
    minutes: 30,
    statement:
      "Dada una lista simple de alumnos, eliminar el nodo cuyo legajo coincide con un valor recibido. Considerar que puede estar al principio o no existir.",
    starterCode: `program eliminarAlumno;

type
  alumno = record
    legajo: integer;
    nota: real;
  end;

  lista = ^nodo;
  nodo = record
    dato: alumno;
    sig: lista;
  end;

procedure eliminar(var l: lista; legajo: integer);
begin
  { completar }
end;

begin
end.`,
    hints: [
      "Usa actual y anterior para no perder la lista.",
      "El caso de borrar el primer nodo cambia el puntero inicial.",
      "Despues de desenlazar, libera el nodo con dispose.",
    ],
    rubric: [
      "Busca hasta nil o hasta encontrar el legajo.",
      "Maneja eliminacion al principio.",
      "Reenlaza anterior con actual^.sig.",
      "Libera memoria con dispose.",
    ],
    referenceSolution: `procedure eliminar(var l: lista; legajo: integer);
var
  act, ant: lista;
begin
  act := l;
  ant := l;
  while (act <> nil) and (act^.dato.legajo <> legajo) do begin
    ant := act;
    act := act^.sig;
  end;
  if (act <> nil) then begin
    if (act = l) then
      l := l^.sig
    else
      ant^.sig := act^.sig;
    dispose(act);
  end;
end;`,
  },
  {
    id: "matriz-suma-fila",
    topic: "matrices/tablas",
    title: "Fila con mayor suma",
    source: "Inspirado en ejercicios de tablas de Programacion 1",
    level: "parcial",
    exam: "Practica tipo parcial - matrices",
    minutes: 25,
    statement:
      "Dada una matriz de 5x10 enteros, informar que fila tiene la mayor suma total.",
    starterCode: `program matrizMayorFila;

const
  filas = 5;
  columnas = 10;

type
  matriz = array[1..filas, 1..columnas] of integer;

procedure filaMayor(m: matriz; var filaMax: integer);
begin
  { completar }
end;

begin
end.`,
    hints: [
      "Necesitas dos ciclos: uno para filas y otro para columnas.",
      "La suma se reinicia para cada fila.",
      "Inicializa el maximo con la suma de una fila valida.",
    ],
    rubric: [
      "Usa recorrido doble.",
      "Reinicia la suma por fila.",
      "Actualiza maximo y posicion.",
      "No sale de los rangos de la matriz.",
    ],
    referenceSolution: `procedure filaMayor(m: matriz; var filaMax: integer);
var
  i, j, suma, max: integer;
begin
  max := -1;
  filaMax := 1;
  for i := 1 to filas do begin
    suma := 0;
    for j := 1 to columnas do
      suma := suma + m[i, j];
    if (suma > max) then begin
      max := suma;
      filaMax := i;
    end;
  end;
end;`,
  },
  {
    id: "una-vez-max-min",
    topic: "recorridos una sola vez",
    title: "Maximo, minimo y cantidad en una pasada",
    source: "Inspirado en consigna tipica de parcial",
    level: "desafio",
    exam: "Simulacro integral",
    minutes: 35,
    statement:
      "Leer numeros hasta 0 e informar maximo, minimo y cantidad de numeros leidos, recorriendo la secuencia una sola vez.",
    starterCode: `program unaPasada;

procedure procesar(var max, min, cant: integer);
begin
  { completar }
end;

begin
end.`,
    hints: [
      "Lee el primer numero antes del ciclo para inicializar maximo y minimo.",
      "Si el primer numero ya es 0, la cantidad debe quedar en 0.",
      "Dentro del ciclo actualiza maximo, minimo y contador en la misma pasada.",
    ],
    rubric: [
      "Recorre la entrada una sola vez.",
      "Inicializa maximo y minimo con un dato valido.",
      "Cuenta correctamente los numeros no cero.",
      "Corta al leer 0.",
    ],
    referenceSolution: `procedure procesar(var max, min, cant: integer);
var
  n: integer;
begin
  cant := 0;
  readln(n);
  if (n <> 0) then begin
    max := n;
    min := n;
    while (n <> 0) do begin
      cant := cant + 1;
      if (n > max) then max := n;
      if (n < min) then min := n;
      readln(n);
    end;
  end;
end;`,
  },
  {
    id: "lista-doble-recorrer",
    topic: "listas doblemente enlazadas",
    title: "Recorrer lista doble hacia atras",
    source: "Ejercicio avanzado de estructuras dinamicas",
    level: "desafio",
    exam: "Practica listas dobles",
    minutes: 30,
    statement:
      "Dada una lista doblemente enlazada, recorrer desde el ultimo nodo hacia el primero e informar los datos.",
    starterCode: `program listaDoble;

type
  lista = ^nodo;
  nodo = record
    dato: integer;
    ant: lista;
    sig: lista;
  end;

procedure imprimirAtras(ult: lista);
begin
  { completar }
end;

begin
end.`,
    hints: [
      "Si recibis el ultimo nodo, el avance hacia atras es por ant.",
      "La condicion de corte vuelve a ser nil.",
      "No modifiques enlaces si solo tenes que imprimir.",
    ],
    rubric: [
      "Recorre hasta nil.",
      "Avanza usando ant.",
      "No modifica la estructura.",
      "Procesa el dato de cada nodo.",
    ],
    referenceSolution: `procedure imprimirAtras(ult: lista);
begin
  while (ult <> nil) do begin
    writeln(ult^.dato);
    ult := ult^.ant;
  end;
end;`,
  },
  {
    id: "maximo-dos-codigos",
    topic: "maximos y minimos",
    title: "Dos maximos con codigo",
    source: "Inspirado en parciales de Programacion 1 UNLP",
    level: "parcial",
    exam: "Practica tipo parcial - maximos",
    minutes: 25,
    statement:
      "Leer productos con codigo y precio hasta codigo -1 e informar los codigos de los dos productos mas caros.",
    starterCode: `program dosMaximos;

procedure calcularMaximos(var codMax1, codMax2: integer);
begin
  { completar }
end;

begin
end.`,
    hints: [
      "Necesitas guardar precio maximo 1 y precio maximo 2.",
      "Cuando aparece un nuevo maximo, el anterior baja al segundo lugar.",
      "El corte de lectura es codigo -1.",
    ],
    rubric: [
      "Inicializa maximos correctamente.",
      "Actualiza primer y segundo maximo.",
      "Conserva los codigos asociados.",
      "Corta con codigo -1.",
    ],
    referenceSolution: `procedure calcularMaximos(var codMax1, codMax2: integer);
var
  cod: integer;
  precio, max1, max2: real;
begin
  max1 := -1;
  max2 := -1;
  readln(cod);
  while (cod <> -1) do begin
    readln(precio);
    if (precio > max1) then begin
      max2 := max1;
      codMax2 := codMax1;
      max1 := precio;
      codMax1 := cod;
    end
    else if (precio > max2) then begin
      max2 := precio;
      codMax2 := cod;
    end;
    readln(cod);
  end;
end;`,
  },
  {
    id: "vector-contar-rango",
    topic: "vectores",
    title: "Contar valores en rango",
    source: "Ejercicio tipico de vectores",
    level: "inicial",
    exam: "Practica vectores",
    minutes: 18,
    statement:
      "Dado un vector de enteros y una dimension logica, contar cuantos valores estan entre 10 y 50 inclusive.",
    starterCode: `program contarRango;

const
  dimF = 100;

type
  vector = array[1..dimF] of integer;

function contar(v: vector; dimL: integer): integer;
begin
  { completar }
end;

begin
end.`,
    hints: [
      "Recorre solo hasta dimL, no hasta dimF si no hace falta.",
      "Usa un contador inicializado en 0.",
      "La condicion del rango tiene dos comparaciones.",
    ],
    rubric: [
      "Respeta la dimension logica.",
      "Inicializa el contador.",
      "Evalua correctamente el rango.",
      "Devuelve el resultado de la funcion.",
    ],
    referenceSolution: `function contar(v: vector; dimL: integer): integer;
var
  i, cant: integer;
begin
  cant := 0;
  for i := 1 to dimL do
    if (v[i] >= 10) and (v[i] <= 50) then
      cant := cant + 1;
  contar := cant;
end;`,
  },
  {
    id: "lista-sumar-campo-record",
    topic: "listas simples",
    title: "Sumar notas de aprobados",
    source: "Inspirado en practica de listas",
    level: "inicial",
    exam: "Practica listas",
    minutes: 22,
    statement:
      "Dada una lista de alumnos con legajo y nota, sumar las notas de los alumnos aprobados con nota mayor o igual a 4.",
    starterCode: `program sumarAprobados;

type
  alumno = record
    legajo: integer;
    nota: real;
  end;

  lista = ^nodo;
  nodo = record
    dato: alumno;
    sig: lista;
  end;

function sumaAprobados(l: lista): real;
begin
  { completar }
end;

begin
end.`,
    hints: [
      "Es un recorrido simple hasta nil.",
      "El acumulador deberia ser real.",
      "Recorda avanzar el puntero en cada vuelta.",
    ],
    rubric: [
      "Recorre hasta nil.",
      "Filtra por nota mayor o igual a 4.",
      "Acumula notas reales.",
      "Avanza el puntero.",
      "Devuelve el resultado.",
    ],
    referenceSolution: `function sumaAprobados(l: lista): real;
var
  suma: real;
begin
  suma := 0;
  while (l <> nil) do begin
    if (l^.dato.nota >= 4) then
      suma := suma + l^.dato.nota;
    l := l^.sig;
  end;
  sumaAprobados := suma;
end;`,
  },
  {
    id: "parcial-cines-latinoamerica",
    topic: "recorridos una sola vez",
    title: "Cines Latinoamerica: funciones y recaudacion",
    source: "Parcial viejo: cadena de cines",
    level: "desafio",
    exam: "Parcial cines",
    minutes: 45,
    statement:
      "Una cadena de cines tiene una lista de funciones de los ultimos 2 anos. Cada funcion tiene codigo, sala, fecha, hora, pais, pelicula y entradas vendidas. Tambien hay un vector con nombres de peliculas y una tabla de precios por pais y pelicula. Recorrer la lista para: generar una lista ordenada por codigo de funcion con las funciones que superen un minimo de entradas, informar codigos cuya suma de digitos sea par, calcular monto recaudado por pelicula, e informar la funcion con mas entradas vendidas.",
    starterCode: `program parcialCines;

const
  cantPaises = 25;
  cantPeliculas = 350;
  cantSalas = 550;

type
  fechaStr = string[10];
  horaStr = string[5];
  funcion = record
    codFuncion: integer;
    codSala: integer;
    fecha: fechaStr;
    hora: horaStr;
    codPais: integer;
    codPelicula: integer;
    entradas: integer;
  end;

  lista = ^nodo;
  nodo = record
    dato: funcion;
    sig: lista;
  end;

  nombres = array[1..cantPeliculas] of string;
  precios = array[1..cantPaises, 1..cantPeliculas] of real;
  recaudacion = array[1..cantPeliculas] of real;

procedure procesar(l: lista; nom: nombres; pre: precios);
begin
  { completar }
end;

begin
end.`,
    hints: [
      "Inicializa el vector de recaudacion de peliculas antes de recorrer la lista.",
      "La nueva lista se arma insertando ordenado por codFuncion solo si entradas supera el minimo.",
      "El maximo de entradas se actualiza durante el mismo recorrido principal.",
      "El monto de cada funcion es entradas * precio[pais, pelicula].",
    ],
    rubric: [
      "Recorre la lista original una sola vez para las estadisticas principales.",
      "Genera lista ordenada por codigo de funcion.",
      "Usa suma de digitos para detectar codigos pares.",
      "Acumula recaudacion por pelicula usando la tabla de precios.",
      "Informa sala, fecha y hora de la funcion con mas entradas.",
      "Libera memoria dinamica cuando corresponde.",
    ],
    referenceSolution: `procedure inicializar(var r: recaudacion);
var i: integer;
begin
  for i := 1 to cantPeliculas do
    r[i] := 0;
end;

function sumaDigitos(n: integer): integer;
var suma: integer;
begin
  suma := 0;
  while n <> 0 do begin
    suma := suma + (n mod 10);
    n := n div 10;
  end;
  sumaDigitos := suma;
end;

{ La solucion completa debe modularizar: insertarOrdenado, procesar maximo,
  acumular recaudacion y liberar la lista auxiliar. }`,
  },
  {
    id: "parcial-handball-equipos",
    topic: "listas simples",
    title: "Handball: equipos, camisetas y DNI",
    source: "Parcial viejo: torneo de handball",
    level: "desafio",
    exam: "Parcial handball",
    minutes: 45,
    statement:
      "Cargar 32 equipos de handball. Cada equipo tiene nombre y una lista de jugadores. De cada jugador se conoce DNI, nombre y camiseta 1..99. La camiseta no debe repetirse en el equipo y la validacion debe hacerse sin recorrer la lista. Luego recorrer todos los equipos una vez para informar las dos camisetas usadas menos populares y los nombres de jugadores cuya suma de digitos del DNI sea impar. Liberar las listas.",
    starterCode: `program parcialHandball;

const
  cantEquipos = 32;
  maxCamiseta = 99;

type
  jugador = record
    dni: integer;
    nombre: string;
    camiseta: integer;
  end;

  lista = ^nodo;
  nodo = record
    dato: jugador;
    sig: lista;
  end;

  equipo = record
    nombre: string;
    jugadores: lista;
  end;

  vectorEquipos = array[1..cantEquipos] of equipo;
  vectorCamisetas = array[1..maxCamiseta] of integer;
  usadasEquipo = array[1..maxCamiseta] of boolean;

procedure cargarEquipos(var v: vectorEquipos);
begin
  { completar }
end;

procedure procesar(v: vectorEquipos);
begin
  { completar }
end;

begin
end.`,
    hints: [
      "Para validar camiseta sin recorrer la lista, usa un vector booleano por equipo.",
      "Al recorrer todos los equipos, actualiza un vector contador de camisetas 1..99.",
      "Los dos menos populares deben tener contador mayor a 0.",
      "La lista de jugadores debe mantenerse en orden de ingreso: agregar al final.",
    ],
    rubric: [
      "Carga exactamente 32 equipos.",
      "Valida camiseta sin recorrer la lista.",
      "Mantiene orden de ingreso de jugadores.",
      "Recorre todas las listas una sola vez para b y c.",
      "Calcula dos camisetas menos usadas considerando solo las usadas.",
      "Libera memoria dinamica.",
    ],
    referenceSolution: `procedure inicializarUsadas(var u: usadasEquipo);
var i: integer;
begin
  for i := 1 to maxCamiseta do
    u[i] := false;
end;

function camisetaValida(num: integer; var u: usadasEquipo): boolean;
begin
  camisetaValida := (num >= 1) and (num <= maxCamiseta) and (not u[num]);
end;

{ Idea clave: usar usadasEquipo durante la carga de cada equipo y vectorCamisetas
  para contar popularidad global durante el procesamiento final. }`,
  },
  {
    id: "parcial-twitch-streaming",
    topic: "recorridos una sola vez",
    title: "Twitch: canales, programas y premios",
    source: "Parcial segunda fecha 27/11/2024",
    level: "desafio",
    exam: "Parcial Twitch 2024",
    minutes: 45,
    statement:
      "Twitch registra canales en una lista ordenada por pais de origen. Cada canal tiene codigo, nombre, categoria, pais y hasta 20 programas. Cada programa tiene nombre, categoria, duracion y visualizaciones. Hay una tabla de premios segun categoria de canal y categoria de programa. Recorrer la lista una sola vez para generar una lista por pais con minutos y visualizaciones totales ordenada por visualizaciones, informar premio y nombre de programas con mas de 50000 visualizaciones, y dividir canales en listas por categoria conservando el orden original.",
    starterCode: `program parcialTwitch;

const
  maxProgramas = 20;
  cantCategoriasCanal = 12;
  cantCategoriasPrograma = 8;

type
  programa = record
    nombre: string;
    categoria: integer;
    duracion: integer;
    visualizaciones: integer;
  end;

  vectorProgramas = array[1..maxProgramas] of programa;

  canal = record
    codigo: integer;
    nombre: string;
    categoria: integer;
    pais: integer;
    dimL: integer;
    programas: vectorProgramas;
  end;

  lista = ^nodo;
  nodo = record
    dato: canal;
    sig: lista;
  end;

  premios = array[1..cantCategoriasCanal, 1..cantCategoriasPrograma] of real;

procedure procesar(l: lista; tabla: premios);
begin
  { completar }
end;

begin
end.`,
    hints: [
      "Aprovecha que la lista viene ordenada por pais para hacer corte de control.",
      "Dentro de cada canal recorre programas 1..dimL.",
      "La lista por pais debe insertarse ordenada por visualizaciones totales.",
      "Para conservar orden original en listas por categoria, agrega al final.",
    ],
    rubric: [
      "Usa corte de control por pais.",
      "Recorre la lista de canales una sola vez.",
      "Acumula minutos y visualizaciones por pais.",
      "Calcula premio con tabla categoriaCanal/categoriaPrograma.",
      "Divide canales por categoria conservando orden.",
      "Libera estructuras dinamicas.",
    ],
    referenceSolution: `{ Patron principal:
while l <> nil do begin
  paisActual := l^.dato.pais;
  minutos := 0;
  vistas := 0;
  while (l <> nil) and (l^.dato.pais = paisActual) do begin
    procesarProgramas(l^.dato, tabla, minutos, vistas);
    agregarCategoria(listaCategorias[l^.dato.categoria], l^.dato);
    l := l^.sig;
  end;
  insertarOrdenadoPorVistas(listaPaises, paisActual, minutos, vistas);
end;`,
  },
  {
    id: "parcial-afa-fichajes",
    topic: "recorridos una sola vez",
    title: "AFA: fichajes validos y posiciones",
    source: "Parcial primera fecha 06/11/2024",
    level: "desafio",
    exam: "Parcial AFA 2024",
    minutes: 45,
    statement:
      "La AFA gestiona 30 equipos. Cada fichaje tiene codigo de 6 caracteres, equipo, jugador, DNI, posicion y edad. El codigo es valido si tiene 3 digitos y 3 consonantes mayusculas en cualquier orden. Se cargan fichajes hasta jugador ZZZ, ordenados por codigo, solo si el codigo es valido, el equipo esta activo y no supera 35 jugadores. Luego recorrer una vez para eliminar fichajes cuyo DNI tiene suma de digitos par y calcular las dos posiciones con mas fichajes.",
    starterCode: `program parcialAFA;

const
  cantEquipos = 30;
  cantPosiciones = 4;

type
  equipo = record
    codigo: integer;
    nombre: string;
    ciudad: string;
    cantJugadores: integer;
    activo: boolean;
  end;

  vectorEquipos = array[1..cantEquipos] of equipo;

  fichaje = record
    codigo: string[6];
    codEquipo: integer;
    jugador: string;
    dni: integer;
    posicion: integer;
    edad: integer;
  end;

  lista = ^nodo;
  nodo = record
    dato: fichaje;
    sig: lista;
  end;

procedure cargarFichajes(var l: lista; var equipos: vectorEquipos);
begin
  { completar }
end;

procedure procesar(var l: lista);
begin
  { completar }
end;

begin
end.`,
    hints: [
      "La validacion del codigo recorre sus 6 caracteres contando digitos y consonantes.",
      "La carga inserta ordenado por codigo de fichaje.",
      "Para eliminar durante recorrido, usa anterior y actual.",
      "Las posiciones son 1..4: arquero, defensa, mediocampo, delantero.",
    ],
    rubric: [
      "Valida patron de codigo correctamente.",
      "Controla equipo activo y cupo de jugadores.",
      "Inserta fichajes ordenados por codigo.",
      "Elimina nodos con suma de DNI par.",
      "Calcula dos posiciones con mas fichajes.",
      "Libera memoria dinamica.",
    ],
    referenceSolution: `function esConsonanteMayuscula(c: char): boolean;
begin
  esConsonanteMayuscula := (c in ['B'..'Z']) and not (c in ['A','E','I','O','U']);
end;

function codigoValido(cod: string): boolean;
var i, dig, cons: integer;
begin
  dig := 0; cons := 0;
  for i := 1 to 6 do
    if cod[i] in ['0'..'9'] then dig := dig + 1
    else if esConsonanteMayuscula(cod[i]) then cons := cons + 1;
  codigoValido := (dig = 3) and (cons = 3);
end;`,
  },
  {
    id: "parcial-hoteles-reservas",
    topic: "listas simples",
    title: "Hoteles: reservas validas y recaudacion",
    source: "Parcial viejo: cadena hotelera",
    level: "desafio",
    exam: "Parcial hoteles",
    minutes: 45,
    statement:
      "Una cadena hotelera procesa reservas diarias del ultimo mes. Cada reserva tiene sucursal, dia, tipo de habitacion, codigo de reserva y codigo de verificacion. Hay una tabla de costo por dia y tipo. Cargar una lista ordenada por sucursal hasta sucursal ZZZ. Luego recorrer una unica vez para descartar reservas invalidas, informar recaudacion por sucursal y los dos tipos de habitacion con mayor recaudacion. Una reserva es valida si la suma de digitos del codigo de reserva coincide con la suma de digitos del codigo de verificacion.",
    starterCode: `program parcialHoteles;

const
  cantDias = 7;
  cantTipos = 8;

type
  reserva = record
    sucursal: string;
    dia: integer;
    tipo: integer;
    codReserva: integer;
    codVerificacion: integer;
  end;

  lista = ^nodo;
  nodo = record
    dato: reserva;
    sig: lista;
  end;

  tablaCostos = array[0..6, 1..cantTipos] of real;
  recTipos = array[1..cantTipos] of real;

procedure cargar(var l: lista);
begin
  { completar }
end;

procedure procesar(var l: lista; costos: tablaCostos);
begin
  { completar }
end;

begin
end.`,
    hints: [
      "La lista se carga ordenada por nombre de sucursal.",
      "Como la lista esta ordenada por sucursal, usa corte de control para recaudacion por sucursal.",
      "Si una reserva es invalida, hay que descartarla de la lista.",
      "Los dos tipos con mayor recaudacion salen de un vector acumulador por tipo.",
    ],
    rubric: [
      "Carga ordenada por sucursal.",
      "Valida con suma de digitos.",
      "Elimina reservas invalidas sin perder la lista.",
      "Usa corte de control por sucursal.",
      "Calcula top 2 de tipos de habitacion.",
      "Libera memoria dinamica.",
    ],
    referenceSolution: `function sumaDigitos(n: integer): integer;
var suma: integer;
begin
  suma := 0;
  while n <> 0 do begin
    suma := suma + (n mod 10);
    n := n div 10;
  end;
  sumaDigitos := suma;
end;

function esValida(r: reserva): boolean;
begin
  esValida := sumaDigitos(r.codReserva) = sumaDigitos(r.codVerificacion);
end;`,
  },
  {
    id: "parcial-figuritas-mundial",
    topic: "matrices/tablas",
    title: "Album Mundial: figuritas repetidas",
    source: "Parcial primera fecha 27/05/2026",
    level: "desafio",
    exam: "Parcial figuritas 2026",
    minutes: 45,
    statement:
      "Una empresa de figuritas implementa un album digital del Mundial 2026: 48 equipos y 20 jugadores por equipo. Cada paquete tiene 7 figuritas. Procesar paquetes usando ComprarPaquete, marcar en el album las conseguidas y agregar repetidas en una lista ordenada por codigo de equipo. Luego recorrer el album una sola vez para listar figuritas faltantes ordenadas por equipo y calcular los dos equipos con mas figuritas marcadas. Finalmente eliminar de repetidas un equipo completo ingresado por teclado.",
    starterCode: `program parcialFiguritas;

const
  cantEquipos = 48;
  cantJugadores = 20;
  cantFigusPaquete = 7;

type
  figurita = record
    codEquipo: integer;
    numJugador: integer;
  end;

  paquete = array[1..cantFigusPaquete] of figurita;
  album = array[1..cantEquipos, 1..cantJugadores] of boolean;

  lista = ^nodo;
  nodo = record
    dato: figurita;
    sig: lista;
  end;

procedure ComprarPaquete(var p: paquete);
begin
  { ya implementado }
end;

procedure procesarPaquete(p: paquete; var a: album; var repetidas: lista);
begin
  { completar }
end;

begin
end.`,
    hints: [
      "El album es una matriz booleana: album[equipo, jugador].",
      "Si la figurita ya estaba marcada, va a repetidas ordenada por codEquipo.",
      "Para faltantes, recorre la matriz con dos for.",
      "Para eliminar repetidas de un equipo completo, recorre la lista con anterior/actual.",
    ],
    rubric: [
      "Usa correctamente matriz album 48x20.",
      "Procesa paquetes de 7 figuritas.",
      "Inserta repetidas ordenadas por equipo.",
      "Lista faltantes ordenadas por codigo de equipo.",
      "Calcula dos equipos con mas marcadas.",
      "Elimina repetidas de un equipo completo y libera memoria.",
    ],
    referenceSolution: `procedure procesarFigurita(f: figurita; var a: album; var rep: lista);
begin
  if a[f.codEquipo, f.numJugador] then
    insertarOrdenado(rep, f)
  else
    a[f.codEquipo, f.numJugador] := true;
end;

procedure procesarPaquete(p: paquete; var a: album; var repetidas: lista);
var i: integer;
begin
  for i := 1 to cantFigusPaquete do
    procesarFigurita(p[i], a, repetidas);
end;`,
  },
  {
    id: "parcial-afa-lista-doble-inicio",
    topic: "listas doblemente enlazadas",
    title: "AFA Ejercicio 2: agregar al inicio en lista doble",
    source: "Parcial primera fecha 06/11/2024 - Ejercicio 2",
    level: "desafio",
    exam: "Parcial AFA 2024",
    minutes: 25,
    statement:
      "Analizar tres secciones de codigo que intentan agregar un nodo al inicio de una lista doblemente enlazada. Indicar VERDADERO si los enganches son correctos. Si es FALSO, justificar y corregir la idea.",
    starterCode: `program analizarAgregarInicio;

type
  ListaDE = ^nodo;
  nodo = record
    dato: integer;
    ant: ListaDE;
    sig: ListaDE;
  end;

  punteros = record
    primero: ListaDE;
    ultimo: ListaDE;
  end;

{ Responder en comentarios:

a)
New(nue);
nue^.dato := num;
nue^.sig := p.primero;
nue^.ant := nil;
if (p.primero <> nil) then
  p.ultimo^.ant := nue
else
  p.primero := nue;
p.ultimo := nue;

Respuesta a):

b)
New(nue);
nue^.dato := num;
nue^.sig := p.ultimo;
nue^.ant := nil;
if (p.ultimo <> nil) then
  p.primero^.sig := nue
else
  p.ultimo := nue;
p.primero := nue;

Respuesta b):

c)
New(nue);
nue^.dato := num;
nue^.sig := p.primero;
nue^.ant := nil;
if (p.primero <> nil) then
  p.primero^.ant := nue
else
  p.ultimo := nue;
p.primero := nue;

Respuesta c):
}

begin
end.`,
    hints: [
      "Para agregar al inicio, el nuevo nodo debe apuntar con sig al viejo primero.",
      "Si la lista no esta vacia, el viejo primero debe apuntar hacia atras al nuevo.",
      "El puntero ultimo solo cambia cuando la lista estaba vacia.",
    ],
    rubric: [
      "Detecta que p.primero y p.ultimo no son intercambiables.",
      "Identifica el caso lista vacia.",
      "Justifica que enlace ant debe actualizarse en el viejo primero.",
      "Reconoce que solo una opcion tiene los enganches correctos.",
    ],
    referenceSolution: `a) FALSO.
Si la lista no esta vacia, debe hacerse p.primero^.ant := nue, no p.ultimo^.ant := nue.
Ademas p.primero debe terminar apuntando a nue. p.ultimo solo cambia si la lista estaba vacia.

b) FALSO.
Confunde inicio con final: nue^.sig debe ser p.primero, no p.ultimo.
Tambien deberia actualizar p.primero^.ant := nue cuando hay nodos.

c) VERDADERO.
El nuevo nodo apunta al viejo primero, el viejo primero apunta hacia atras al nuevo,
si estaba vacia se actualiza ultimo, y finalmente primero pasa a ser nue.`,
  },
  {
    id: "parcial-twitch-lista-doble-completar",
    topic: "listas doblemente enlazadas",
    title: "Twitch Ejercicio 2: completar enganches de lista doble",
    source: "Parcial segunda fecha 27/11/2024 - Ejercicio 2",
    level: "desafio",
    exam: "Parcial Twitch 2024",
    minutes: 30,
    statement:
      "Completar la linea faltante en modulos de lista doblemente enlazada: agregar al inicio, agregar al final e insertar ordenado. Indicar exactamente donde va cada linea.",
    starterCode: `program completarListaDoble;

type
  ListaDE = ^nodo;
  nodo = record
    dato: integer;
    ant: ListaDE;
    sig: ListaDE;
  end;

  Punteros = record
    primero: ListaDE;
    ultimo: ListaDE;
  end;

{ Completar:

a) agregarAlInicio
New(nue);
nue^.dato := num;
nue^.sig := p.primero;
nue^.ant := nil;
if (p.primero <> nil) then
  { linea faltante a }
else
  p.ultimo := nue;
p.primero := nue;

b) agregarAlFinal
New(nue);
nue^.dato := num;
nue^.sig := nil;
nue^.ant := nil;
if (p.primero = nil) then begin
  p.primero := nue;
  p.ultimo := nue;
end
else begin
  nue^.ant := p.ultimo;
  { linea faltante b }
  p.ultimo := nue;
end;

c) insertarOrdenado
Luego de buscar con act y anterior:
if (anterior = nil) then begin
  nue^.sig := p.primero;
  { linea faltante c }
  p.primero := nue;
end
else begin
  nue^.ant := anterior;
  nue^.sig := act;
  anterior^.sig := nue;
  if (act <> nil) then
    act^.ant := nue
  else
    p.ultimo := nue;
end;
}

begin
end.`,
    hints: [
      "En lista doble, cada enganche hacia adelante suele necesitar su enganche hacia atras.",
      "Agregar al final cambia el sig del viejo ultimo.",
      "Insertar al principio de una lista no vacia obliga a actualizar el ant del viejo primero.",
    ],
    rubric: [
      "Completa el enlace ant del viejo primero al agregar al inicio.",
      "Completa el enlace sig del viejo ultimo al agregar al final.",
      "Completa el enlace ant del nodo que queda despues del nuevo al insertar al principio.",
      "Ubica las lineas en el lugar correcto.",
    ],
    referenceSolution: `a) p.primero^.ant := nue;

b) p.ultimo^.sig := nue;

c) p.primero^.ant := nue;
Tambien puede justificarse como act^.ant := nue si act representa al viejo primero en ese punto.`,
  },
  {
    id: "parcial-figuritas-lista-doble-final",
    topic: "listas doblemente enlazadas",
    title: "Figuritas Ejercicio 2: agregar al final en lista doble",
    source: "Parcial primera fecha 27/05/2026 - Ejercicio 2",
    level: "desafio",
    exam: "Parcial figuritas 2026",
    minutes: 20,
    statement:
      "Analizar el codigo de un modulo que agrega al final en una lista doblemente enlazada. Indicar si la seccion hace correctamente los enganches. Si no, justificar que falta.",
    starterCode: `program analizarAgregarFinal;

type
  PNodo = ^TNodo;
  TNodo = record
    dato: integer;
    ant: PNodo;
    sig: PNodo;
  end;

  TListaDoble = record
    primero: PNodo;
    ultimo: PNodo;
  end;

{ Codigo a analizar:

new(nuevo);
nuevo^.dato := dato;
nuevo^.sig := nil;
if lista.primero = nil then begin
  nuevo^.ant := nil;
  lista.ultimo := nuevo;
end
else begin
  lista.ultimo^.sig := nuevo;
  nuevo^.ant := lista.ultimo;
  lista.ultimo := nuevo;
end;

Respuesta:
}

begin
end.`,
    hints: [
      "En una lista vacia, primero y ultimo deben apuntar al nuevo nodo.",
      "En una lista no vacia, el viejo ultimo enlaza con nuevo y nuevo enlaza hacia atras.",
      "Revisa especialmente el caso lista vacia.",
    ],
    rubric: [
      "Analiza por separado lista vacia y lista no vacia.",
      "Detecta que en lista vacia falta actualizar primero.",
      "Reconoce que el caso no vacio esta bien enganchado.",
      "Propone la linea faltante correcta.",
    ],
    referenceSolution: `FALSO.
El caso de lista no vacia esta bien, pero en el caso de lista vacia falta:

lista.primero := nuevo;

Cuando una lista doble esta vacia, primero y ultimo deben quedar apuntando al mismo nodo nuevo.`,
  },
];
