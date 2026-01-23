# PROJECT KNOWLEDGE: BRIDGE LOGIC

**Location:** `packages/demo-sveltekit/src/lib/plugin/`
**Context:** Core React-to-Svelte Bridge (Complex)

## OVERVIEW
The bridge layer that translates serialized React component trees into Svelte 5 UI. It acts as the "Host" in the custom React reconciler architecture, providing three execution environments for plugins.

## COMPONENTS
- **PluginHost.svelte**: Main Thread host. Direct execution, zero latency.
- **WorkerPluginHost.svelte**: Web Worker host. Sandboxed execution via Blob Workers + `kkrpc`.
- **WebSocketPluginHost.svelte**: Node.js host. Connects to external servers via WebSocket RPC.
- **ComponentRenderer.svelte**: The recursive UI engine that renders the component tree.

## MAPPING LOGIC
The bridge utilizes a manual mapping strategy in `ComponentRenderer.svelte`:
- **Direct Translation**: Maps React types (e.g., `Button`) to Svelte components (e.g., `Button.svelte`).
- **HTML Elements**: Uses `<svelte:element>` for standard tags (`div`, `span`, etc.).
- **Event Proxies**: Converts RPC-passed `handlerId` strings back into executable functions that call `api.executeHandler` over the RPC channel.
- **Prop Transformation**: Normalizes React-style props (e.g., `className`) to Svelte-style (e.g., `class`).

## HOST DIFFERENCES
- **WorkerPluginHost**: Requires `pluginUrl`. Fetches script text to create a `Blob` Worker. Best for frontend-only sandboxing.
- **WebSocketPluginHost**: Requires `serverUrl`. Uses `WebSocketClientIO`. Supports automatic reconnection and is ideal for Node.js-based plugins with OS access.
