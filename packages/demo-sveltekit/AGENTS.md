# PROJECT KNOWLEDGE: HOST APPLICATION (SvelteKit)

**Location:** `packages/demo-sveltekit`
**Context:** The Host Application & UI Bridge layer.

## OVERVIEW
The main SvelteKit application that hosts React plugins. It acts as the "receiver" in the bridge architecture, transforming serialized React component trees into Svelte 5 UI components using Runes.

## STRUCTURE
- `src/lib/plugin/`: Core bridge infrastructure.
  - `ComponentRenderer.svelte`: Maps JSON elements to Svelte components.
  - `PluginHost.svelte`: Main-thread execution host.
  - `WorkerPluginHost.svelte`: Sandboxed worker execution host.
  - `WebSocketPluginHost.svelte`: Node.js server execution host.
- `static/plugins/`: Serves pre-built worker bundles (e.g., `advanced-demo.js`).
- `src/routes/`: Demo UI and plugin selection logic.

## WHERE TO LOOK
- **JSON -> Svelte Mapping**: `src/lib/plugin/ComponentRenderer.svelte`. This is where React components like `<Button>` are mapped to `Button.svelte`.
- **Worker Management**: `src/lib/plugin/WorkerPluginHost.svelte`. Handles fetching bundles from `static/plugins` and initializing the RPC channel.
- **Event Handling**: `src/lib/plugin/handler-registry.ts` and `ComponentRenderer.svelte` (via `createHandlerFromId`).

## TESTING
- **E2E (Playwright)**: `pnpm test:e2e`. Verifies the bridge works across all three modes in a real browser.
- **Unit (Vitest)**: `pnpm test:unit`. Logic verification for serialization and helpers.

## UNIQUE PATTERNS
- **Static Serving**: Uses SvelteKit's `static/` directory to host `.js` plugin bundles for the `WorkerPluginHost`.
- **Event Proxies**: Instead of passing functions (unsupported by Workers), it passes IDs and creates Svelte-side proxies that trigger RPC calls back to the plugin runtime.
