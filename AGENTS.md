# PROJECT KNOWLEDGE BASE

**Generated:** 2026-01-24
**Type:** Monorepo (pnpm + Turborepo)

## OVERVIEW
A framework-agnostic plugin system that renders React components using a Svelte 5 UI layer (or Vue/React hosts). Features a custom React reconciler and supports three runtime modes: **Web Worker** (sandboxed), **Node.js** (WebSocket), and **Main Thread**.

## STRUCTURE
```
.
├── packages/
│   ├── api/               # Core: React Reconciler + Primitives (tsdown)
│   ├── plugin-example/    # Plugins: Worker/Server/Main bundles (Bun)
│   ├── demo-sveltekit/    # Host: SvelteKit + Bridge Logic (Vite)
│   ├── demo-vue/          # Host: Vue 3 + Bridge Logic (Rolldown-Vite)
│   └── demo-react/        # Host: React + Bridge Logic (Vite)
├── docs/                  # Architecture documentation
└── .journal/              # Development log
```

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| **Core Logic** | `packages/api/src/reconciler/` | The Custom React Renderer |
| **Bridge UI** | `packages/demo-sveltekit/src/lib/plugin/` | Maps React nodes to Host UI (Svelte) |
| **Plugin Build** | `packages/plugin-example/build.ts` | Custom Bun build script |
| **E2E Tests** | `packages/demo-sveltekit/e2e/` | Playwright tests |

## CONVENTIONS
- **Triple Mode**: Code must support Worker (RPC), Node (WS), and Main Thread.
- **Bundling Strategy**: 
  - `api` → `tsdown` (Library)
  - `plugin-example` → `bun` (Self-contained)
  - `demo-*` → `vite` (App)
- **Svelte 5**: Strict usage of Runes (`$state`, `$props`).
- **Framework Agnostic**: The core API (`@svelte-react-render/api`) must remain independent of the host framework.

## ANTI-PATTERNS (THIS PROJECT)
- **Direct DOM**: Plugins must **NEVER** access `window` or `document` directly (breaks Worker/Node modes).
- **Direct Function Props**: **NEVER** pass functions directly over RPC; use `handler-registry` with IDs.
- **RPC Self-Calls**: **NEVER** call your own exposed RPC methods directly.
- **Vestigial Files**: Ignore `packages/plugin-example/index.ts` (legacy).

## COMMANDS
```bash
pnpm build   # Build all packages (Turbo)
pnpm dev     # Start all dev servers (Plugin:3000, Node:3001, Svelte:5173, Vue:5176)
pnpm check   # Type check
pnpm format  # Prettier
pnpm test:e2e # Playwright bridge verification
```
