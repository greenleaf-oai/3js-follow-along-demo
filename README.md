# Minimal Three.js Lane Runner

Small browser-based runner game built with Three.js.

- **Tech:** HTML + ES modules + `three` (import map)
- **Runtime:** Browser only (no build step)
- **Server required:** Run via HTTP origin (not `file://`) because module imports use a CDN map

## Project structure

- `index.html` — page shell, HUD elements, and import map
- `script.js` — scene setup, runner controls, movement, collisions, camera, and animation loop
- `src/score.mjs` — score state helpers
- `tests/score.test.mjs` — unit tests for scoring helpers

## Getting started

From the repository root:

```bash
python3 -m http.server 8080
```

Then open:

```text
http://localhost:8080
```

Alternative:

```bash
npx http-server .
```

## Gameplay

Lane runner on three lanes (`left`, `center`, `right`) with endless obstacles.

Controls:

- `ArrowLeft` / `A` — move left
- `ArrowRight` / `D` — move right
- `Space` — jump (while grounded)
- `ArrowDown` / `S` — duck

You can collide with red obstacles and trigger game over.

## Score

- Score increases with traveled distance.
- Score module in `src/score.mjs` tracks:
  - `distanceTravelled`
  - current `value`
  - `bestValue` (highest completed run)
  - completion state (`isFinished`)

## Notes

- This project is intentionally minimal and runs entirely in the browser.
- There is no bundler/build pipeline.
- Assets are currently generated primitives (no external model files).
