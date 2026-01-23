# PROJECT KNOWLEDGE BASE: plugin-example

**Type:** Plugin Reference Implementation

## OVERVIEW
Reference implementation of the plugin system. Contains example React plugins that demonstrate the custom reconciler and support for triple runtime modes (Worker, Node.js, Main Thread).

## STRUCTURE
```
.
├── src/
│   ├── simple-demo.tsx      # Basic React plugin example
│   ├── advanced-demo.tsx    # Complex React plugin (Forms/State)
│   ├── *.worker.ts          # Web Worker entry points (RPC)
│   ├── *.server.ts          # Node.js WebSocket entry points
│   └── shared-plugin-runtime.ts # Core initialization logic
├── build.ts                 # Custom Bun build script
└── dist/                    # Bundled output (ESM)
```

## WHERE TO LOOK
| Component | Location | Purpose |
|-----------|----------|---------|
| **Plugin Logic** | `src/*.tsx` | Pure React components using `@svelte-react-render/api` |
| **Worker Bridge** | `src/*.worker.ts` | Sets up kkRPC and renders into the reconciler |
| **Node.js Bridge** | `src/*.server.ts` | WebSocket server that runs the React plugin |
| **Shared Runtime** | `src/shared-plugin-runtime.ts` | Maps generic RPC/WS to React render calls |

## BUILD NOTES (Bun)
- **Tooling**: Uses `Bun.build()` instead of Vite for maximum control over bundling.
- **Self-Contained**: Bundles `react`, `kkrpc`, and `@svelte-react-render/api` into a single file.
- **Dev Server**: `pnpm dev` starts a static server on port 3000 for worker loading.
- **Node Server**: `pnpm server` starts WebSocket listeners on ports 3001-3002.

## ANTI-PATTERNS
- **Frontend Dependencies**: NEVER import packages that rely on `window` or `document` in `*.worker.ts` or `*.server.ts`.
- **Direct DOM**: Plugins must use components from the provided API for UI.
- **Vite Bundling**: Do not attempt to build this package with Vite; it relies on the custom Bun build logic.
