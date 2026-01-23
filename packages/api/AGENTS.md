# PROJECT KNOWLEDGE BASE: @svelte-react-render/api

**Context:** Core React Reconciler & Component Library
**Key Insight:** This is the 'bridge' creator. It renders React -> JSON Tree.

## OVERVIEW
Environment-agnostic custom React reconciler. It transforms React fiber nodes into a serializable JSON tree. This allows React logic to run in sandboxed environments (Web Workers, Node.js) while rendering UI in a separate host (Svelte/Vue).

## STRUCTURE
```
src/
├── components/      # UI Primitives (Button, Input, Form)
├── reconciler/      # The Custom Renderer Engine
│   ├── bridge.ts    # Tree state & update management
│   ├── host-config.ts # Reconciler implementation
│   ├── renderer.ts  # Public render() entry point
│   └── types.ts     # Shared VNode/Tree types
└── index.ts         # Main exports
```

## WHERE TO LOOK
- **`src/reconciler/host-config.ts`**: **The Key File.** Defines the `HostConfig` for `react-reconciler`. Implements how virtual nodes are created, appended, and updated.
- **`src/reconciler/bridge.ts`**: Manages the root instance and triggers the `onUpdate` callback when the tree changes.
- **`src/components/`**: Check these when adding new primitive components. They must map to host-side Svelte/Vue components.

## BUILD NOTES (tsdown)
- **Tool**: Uses `tsdown` (built on Rolldown) for extremely fast builds.
- **Output**: Generates ESM (`dist/index.js`) and type definitions (`dist/index.d.ts`).
- **Externals**: `react` and `react-reconciler` are marked as external; they must be provided by the plugin bundle or host.

## ANTI-PATTERNS
- **No DOM APIs**: Strictly avoid `window`, `document`, or any browser-specific globals. Code must be pure JS/TS.
- **No Direct Functions in Props**: props passed to components must be serializable. Event handlers are registered via IDs in the bridge.
- **Direct Reconciler Access**: Always use the `render()` entry point instead of touching the reconciler instance directly.
