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

## Modo IA gratis con Gemini

La pagina puede funcionar sin IA usando reglas locales. Si queres IA, cada usuario puede pegar su propia API key de Gemini en la configuracion del tutor.

La API key queda guardada solo en el navegador del usuario con `localStorage`.
