# PROJECT KNOWLEDGE BASE: plugin-example

**Type:** Plugin Reference Implementation & Runtime Logic

## OVERVIEW
Reference implementation for the plugin system. Contains React plugins that demonstrate the custom reconciler and support for **Triple Mode** runtime: Web Worker (sandboxed), Node.js (WebSocket), and Main Thread.

## STRUCTURE
```
.
├── src/
│   ├── *.tsx                # Pure React plugin logic
│   ├── *.worker.ts          # Web Worker entry points (RPC)
│   ├── *.server.ts          # Node.js WebSocket entry points
│   ├── shared-plugin-runtime.ts # Core initialization (95% REUSE)
│   └── handler-registry.ts  # RPC-safe event management
├── build.ts                 # Custom Bun build system
└── dist/                    # Bundled ESM output
```

## WHERE TO LOOK
| Component | Location | Purpose |
|-----------|----------|---------|
| **Shared Logic** | `shared-plugin-runtime.ts` | **95% reuse** between Worker and Server modes. |
| **Plugin UI** | `src/*.tsx` | React components using `@svelte-react-render/api`. |
| **RPC Bridge** | `src/*.worker.ts` | Maps kkRPC to React reconciler via shared runtime. |
| **Node.js Host** | `src/*.server.ts` | WebSocket server executing React in Node runtime. |

## BUILD NOTES (Bun)
- **Custom System**: Uses `Bun.build()` (not Vite) for self-contained bundles.
- **Config**: `minify: false` is hardcoded for easier debugging and inspection.
- **Output**: Bundles `react`, `kkrpc`, and `api` into a single standalone file.
- **Dev Server**: `pnpm dev` serves static bundles (3000) and watches for changes.

## ANTI-PATTERNS
- **Browser-Only Imports**: NEVER import packages using `window` or `document` (breaks Worker/Server modes).
- **Direct DOM**: Do not use `document.createElement`; use the Plugin API components.
- **Vite Bundling**: Package must be built via `build.ts` to ensure correct bundling of RPC logic.
