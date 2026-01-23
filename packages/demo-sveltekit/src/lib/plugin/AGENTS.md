# PROJECT KNOWLEDGE: THE BRIDGE IMPLEMENTATION

**Location:** `packages/demo-sveltekit/src/lib/plugin/`
**Context:** The Bridge Implementation (Receiver Side)

## OVERVIEW
This directory implements the **"Receiver"** side of the protocol. It transforms serialized React component trees (`SerializedComponentTree`) into Svelte 5 UI components using Runes. It acts as the host environment for plugins running in Workers or over WebSockets.

## KEY FILES
- **ComponentRenderer.svelte**: The recursive UI engine. Maps JSON element types (e.g., `Button`, `div`) to local Svelte components or standard HTML elements.
- **WorkerPluginHost.svelte**: Manages Web Worker lifecycle, RPC initialization via `kkrpc`, and communication with sandboxed plugins via Blob Workers.
- **WebSocketPluginHost.svelte**: Connects to Node.js plugin servers via WebSocket RPC. Handles automatic reconnection and remote plugin initialization.

## LOGIC: EVENT PROXYING VIA IDS
Since functions cannot cross RPC/Worker boundaries, the bridge uses a proxy system:
1. **Handler IDs**: The "Sender" (Plugin) replaces callbacks with unique IDs (e.g., `_onClickHandlerId`).
2. **Proxy Creation**: `ComponentRenderer` uses `createHandlerFromId` to create local Svelte functions.
3. **RPC Execution**: When a user interacts with the UI, the proxy calls `api.executeHandler(id)` via the RPC channel, triggering the original React logic in the plugin environment.

## PROP TRANSFORMATION
`ComponentRenderer.svelte` normalizes React props to Svelte/HTML standards:
- `className` → `class`
- `htmlFor` → `for`
- `onChange` / `onInput` → `oninput`
