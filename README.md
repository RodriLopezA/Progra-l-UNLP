# Camino Tutor P1 UNLP

Pagina web para estudiar Programacion 1 de la UNLP con Pascal.

## Que incluye

- Editor estilo VS Code con Monaco.
- Camino Tutor por niveles para llegar al parcial.
- Biblioteca de ejercicios por tema y formato.
- Parciales actuales de 2 ejercicios separados de parciales viejos de 1 ejercicio.
- Practicas y ejercicios tipo parcial marcados como entrenamiento, no como parcial real.
- Tutor gratuito por reglas locales.
- Modo opcional Gemini con API key propia del usuario.
- Botones de pista, correccion, traza, evaluacion tipo parcial y solucion.
- Historial de errores en `localStorage`.

## Criterio de organizacion

- `Actual - 2 ejercicios`: formato que se esta tomando ahora. Incluye ejercicio integrador y ejercicio de listas dobles/analisis de codigo.
- `Viejo - 1 ejercicio`: parciales anteriores con un solo ejercicio integrador.
- `Practica`: TPs, ejercicios puente y consignas tipo parcial para entrenar antes del simulacro.

## Como correrla

Primero instala Node.js LTS desde:

https://nodejs.org

Despues, en PowerShell:

```powershell
cd "C:\Users\rodri\Documents\progra 1 unlp"
npm install
npm run dev
```

Abrir la URL que aparezca, normalmente:

```text
http://localhost:5173
```

## Compilador Pascal gratis

La pagina puede conectarse a Free Pascal si lo tenes instalado en tu PC. Esto mejora mucho al tutor porque permite separar errores reales de compilacion de errores de logica.

1. Instala Free Pascal desde:

```text
https://www.freepascal.org/download.html
```

2. Verifica en PowerShell:

```powershell
fpc -h
```

3. En una terminal, levanta la pagina:

```powershell
npm run dev
```

4. En otra terminal, levanta el compilador local:

```powershell
npm run compiler
```

5. En la pagina, activa el panel `Compilador` y usa `Compilar Pascal`.

Por defecto el frontend llama a:

```text
http://localhost:8787/compile
```

Nota importante: Vercel no puede ejecutar `fpc` dentro de una pagina estatica. Para tener compilacion real online, hay que subir este compilador como backend aparte en Render, Railway, Fly.io o un VPS. La pagina queda preparada para cambiar el endpoint.

## Modo IA gratis con Gemini

La pagina puede funcionar sin IA usando reglas locales. Si queres IA, cada usuario puede pegar su propia API key de Gemini en la configuracion del tutor.

La API key queda guardada solo en el navegador del usuario con `localStorage`.
