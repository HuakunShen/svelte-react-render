# PROJECT KNOWLEDGE BASE: demo-react

**Type:** Experimental React Host
**Key Insight:** React rendering React via a JSON tree (reconciler output).

## OVERVIEW
An experimental host implementation using React to render the output of the custom React reconciler. While the primary host is Svelte, this package serves as a reference for framework-agnostic rendering and a familiar environment for debugging the reconciler's JSON tree output.

## STRUCTURE
```
.
├── src/
│   ├── lib/plugin/        # Core bridge logic
│   │   ├── ComponentRenderer.tsx  # JSON -> React Component mapping
│   │   ├── PluginHost.tsx         # Main thread orchestration
│   │   └── serialization.ts       # Tree processing utilities
│   └── components/ui/     # Local shadcn/ui implementation
```

## WHERE TO LOOK
- **`src/lib/plugin/ComponentRenderer.tsx`**: The heart of the host. It traverses the `SerializedComponentTree` (JSON) and maps abstract types (e.g., "Button") to local React components.
- **`src/lib/plugin/PluginHost.tsx`**: Manages the plugin lifecycle in the main thread.
- **`src/lib/plugin/WebSocketPluginHost.tsx`**: Handles Node.js/WebSocket mode integration.

## USE CASE
1. **Testing Reconciler Output**: Verify that the custom renderer in `@svelte-react-render/api` produces a valid, renderable JSON tree.
2. **Debugging Bridge Logic**: Easier to debug RPC/Serialization issues in a pure React environment before moving to Svelte.
3. **Reference Implementation**: Demonstrates how to implement a new host framework by mapping JSON nodes to native components.

## CONVENTIONS
- **JSON-Driven**: Everything must pass through the `SerializedComponentTree` format.
- **Recursive Rendering**: `ComponentRenderer` calls itself for children.
- **Handler Registry**: Event handlers are resolved via IDs to support RPC modes.
