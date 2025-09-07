# Repository Guidelines

## Project Structure & Module Organization
- `src/lib/plugin-system/`: Plugin registry, container, and public API exports.
- `src/lib/reconciler/`: Custom React reconciler mapping React elements to Svelte 5 components.
- `src/lib/ui-components/`: Svelte 5 components (`Button.svelte`, `ListView.svelte`, `Input.svelte`).
- `src/plugins/`: Example React plugins (e.g., `todo-plugin/`).
- `specs/001-react-plugin-system/`: Contracts (`contracts/*.ts`), plan, and quickstart.
- `tests/`: `unit/` and `integration/` suites (Vitest + jsdom).
- `public/`, `index.html`, `vite.config.ts`, `vitest.config.ts`, `svelte.config.js`.

## Build, Test, and Development Commands
- `npm run dev`: Start Vite dev server.
- `npm run build`: Production build.
- `npm run preview`: Preview production build.
- `npm run check`: Type + Svelte checks (`svelte-check`, `tsc`).
- `npm test`: Run all tests in watch mode (Vitest).
- `npm run test:unit` / `test:integration`: Targeted suites.
- `npm run test:run`: Non-watch CI run.

## Coding Style & Naming Conventions
- Language: TypeScript + Svelte 5. Always use Svelte 5 syntax (e.g., `$props()`), never Svelte 4.
- Indentation: 2 spaces; keep imports sorted logically.
- Files: Svelte components `PascalCase.svelte`; React components `PascalCase.tsx`; libraries `kebab-or-camel.ts` per existing patterns.
- Components: Prefer typed props (contracts in `specs/.../contracts`). Avoid direct DOM; interact via Svelte/React events.

## Testing Guidelines
- Framework: Vitest (`jsdom`) with Testing Library for Svelte/React.
- Locations: `tests/unit/**`, `tests/integration/**`.
- Naming: `*.test.ts` or `*.test.tsx`; use descriptive names (e.g., `test_reconciler_rendering.test.ts`).
- Coverage: Prioritize core contracts (registry, container, reconciler, UI). Add tests with new features.
- Run locally: `npm run test:run` before PRs.

## Commit & Pull Request Guidelines
- Commits: Imperative, concise subject (<= 72 chars), e.g., `add reconciler mapping for plugin-input`.
- PRs: Include summary, linked issues, screenshots/GIFs for UI, test instructions, and scope notes.
- Requirements: Green CI, updated docs/specs when touching contracts or behavior.

## Architecture Notes & Plugin Tips
- Mapping: React elements like `plugin-button` render to Svelte components via `src/lib/reconciler`.
- Contracts: Import types from `specs/001-react-plugin-system/contracts/*`.
- New plugin example: place under `src/plugins/<your-plugin>/`, export `default` React component and `metadata` object.
- Safety: Validate props (helpers in `reconciler/component-mapping.ts`), avoid global side effects, and handle errors without crashing the host app.

