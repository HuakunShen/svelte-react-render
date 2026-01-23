# PROJECT KNOWLEDGE: PRIMARY HOST (SvelteKit)

**Location:** `packages/demo-sveltekit`
**Context:** Primary Host Application
**Key Insight:** Svelte 5 Runes host. Receiver of the JSON tree from React plugins.

## OVERVIEW
The main SvelteKit application that serves as the visual host for React-based plugins. It acts as the "receiver" in the bridge architecture, transforming serialized JSON component trees into live Svelte 5 UI components using modern Runes.

## STRUCTURE
- `src/lib/plugin/`: **The Bridge Layer**. Core infrastructure for React-to-Svelte translation.
  - `ComponentRenderer.svelte`: Recursive UI engine mapping JSON to Svelte.
  - `WorkerPluginHost.svelte`: Host for sandboxed Blob Workers via `kkrpc`.
  - `WebSocketPluginHost.svelte`: Host for Node.js plugins via WebSocket RPC.
  - `PluginHost.svelte`: Host for zero-latency main-thread execution.
- `static/plugins/`: Serves pre-built plugin bundles (ESM) for Worker mode.
- `src/routes/`: Main demo application featuring the runtime mode switcher.

## WHERE TO LOOK
- **UI Mapping**: `src/lib/plugin/ComponentRenderer.svelte`. The central registry mapping React primitives (e.g., `Button`) to Svelte implementations.
- **State Management**: Uses Svelte 5 Runes (`$state`, `$props`) for high-performance reactivity.
- **Event Handling**: `handler-registry.ts` translates serialized handler IDs back into RPC calls to the plugin runtime.

## TESTING
- **Playwright E2E**: Located in `e2e/`. Run `pnpm test:e2e` to verify bridge functionality across Worker, Node, and Main-thread modes.
- **Unit Tests**: `src/**/*.spec.ts` for logic verification of serialization and transformation helpers.

## UNIQUE PATTERNS
- **Static Plugin Serving**: Plugin bundles are served from `static/plugins/`, allowing the host to fetch and execute them as Blobs for isolation.
- **Triple-Mode Support**: The host dynamically switches between `Worker`, `WebSocket`, and `Main` modes for the same plugin UI, sharing 100% of the rendering logic.
- **Manual Component Mapping**: Uses explicit mapping in the renderer instead of automated conversion for granular control over the UI layer.
