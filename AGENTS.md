# PROJECT KNOWLEDGE BASE

**Generated:** 2026-01-23
**Type:** Monorepo (pnpm + Turborepo)

## OVERVIEW
A framework-agnostic plugin system that renders React components using a Svelte 5 UI layer. Features a custom React reconciler and supports three runtime modes: Web Worker (sandboxed), Node.js (WebSocket), and Main Thread.

## STRUCTURE
```
.
├── packages/
│   ├── api/               # Core library: React components + Reconciler (tsdown)
│   ├── demo-sveltekit/    # Host App: SvelteKit + Bridge Logic + Tests (Vite)
│   └── plugin-example/    # Reference Plugins: Worker/Server bundles (Bun)
├── docs/                  # Architecture documentation
└── .journal/              # Development log
```

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| **Core Logic** | `packages/api/src/reconciler/` | The Custom React Renderer |
| **Bridge UI** | `packages/demo-sveltekit/src/lib/plugin/` | Maps React nodes to Svelte |
| **Plugin Build** | `packages/plugin-example/build.ts` | Custom Bun build script |
| **E2E Tests** | `packages/demo-sveltekit/e2e/` | Playwright tests |

## CONVENTIONS
- **Svelte 5 Only**: strict usage of Runes (`$state`, `$props`). No Svelte 4.
- **Triple Mode**: Code must support Worker (RPC), Node (WS), and Main Thread.
- **Bundling**: 
  - `api` → `tsdown`
  - `plugin-example` → `bun`
  - `demo-sveltekit` → `vite`

## ANTI-PATTERNS (THIS PROJECT)
- **Direct DOM**: Plugins must NEVER access DOM/Window directly (breaks Worker/Node modes).
- **Function Props**: NEVER pass functions directly over RPC; use `handler-registry`.
- **Exposed Methods**: NEVER call your own exposed RPC methods directly.
- **Vestigial Files**: Ignore root `index.html` and `svelte.config.js`.

## COMMANDS
```bash
pnpm build   # Build all packages (Turbo)
pnpm dev     # Start all dev servers
pnpm check   # Type check (Svelte + TS)
pnpm format  # Prettier
```
