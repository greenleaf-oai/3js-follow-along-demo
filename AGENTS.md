# Repository Guidelines

## Project Structure & Module Organization
This repository is a minimal browser game built with Three.js.
- `index.html`: page shell, base styles, import map, and the `#game-over` overlay.
- `script.js`: all runtime logic (scene setup, input handling, physics, obstacles, collisions, camera, and animation loop).

Keep the root small. If logic grows, split new modules by concern (for example `src/player.js`, `src/obstacles.js`) and keep asset files in an `assets/` directory.

## Build, Test, and Development Commands
There is no build pipeline; run the project with a local static server.
- `python3 -m http.server 8080` - serves the repo at `http://localhost:8080`.
- `npx http-server .` - alternative static server if Node tooling is preferred.

Then open the served URL in a browser. Do not run directly from `file://` because module imports require an HTTP origin.

## Coding Style & Naming Conventions
- Use modern ES module JavaScript.
- Match existing formatting: 2-space indentation, semicolons, and double quotes.
- Use `camelCase` for variables/functions and clear, descriptive names (`updateRunner`, `checkCollisions`).
- Keep constants near the top of a module and group related state in structured objects.

No linter or formatter is configured yet; keep edits consistent with the current style.

## Testing Guidelines
No automated test framework is configured currently.
- Perform manual checks before opening a PR: lane switching, jump, duck timing, obstacle spawning, collision detection, and game-over overlay behavior.
- For future automated coverage, place tests under `tests/` and use `*.test.js` naming.

## Commit & Pull Request Guidelines
This repo currently has no commit history, so conventions are not yet established. Use this baseline:
- Commit messages in imperative mood, under 72 characters (example: `Add obstacle cleanup for off-screen meshes`).
- Keep commits focused and logically grouped.
- PRs should include: purpose, manual test steps, and a short screen capture for gameplay-visible changes.
- Link the related issue/task when available.

## Security & Configuration Tips
- Keep third-party imports pinned (for example, `three@0.161.0` in `index.html`) to avoid unreviewed version drift.
- Do not commit secrets or environment-specific machine paths.
