# AGENTS.MD - API CORE

**Context:** Core React Reconciler & Component Library
**Key Insight:** This is the 'bridge' creator. It renders React -> JSON Tree.

## OVERVIEW
The `@svelte-react-render/api` package is the engine that allows React components to be rendered by Svelte. It implements a custom React Reconciler that transforms React's internal fiber tree into a serializable JSON tree structure, which is then passed over RPC to the Svelte host.

## STRUCTURE
```
src/
├── components/   # React primitives (Button, Input, Form, etc.)
├── reconciler/   # Core rendering engine
│   ├── bridge.ts      # State management for the virtual tree
│   ├── host-config.ts # React Reconciler configuration
│   └── renderer.ts    # Main render() entry point
└── index.ts      # Public API exports
```

## WHERE TO LOOK
- **`src/reconciler/host-config.ts`**: Defines how React handles creation, updates, and deletion of virtual nodes.
- **`src/reconciler/renderer.ts`**: The main `render()` function used by plugins to bootstrap their React application.
- **`src/components/`**: Reference these when adding new UI primitives to the system.
- **`src/bridge.ts`**: The central state store that holds the `rootInstance` and triggers updates.

## BUILD NOTES (tsdown)
- This package uses **tsdown** for fast bundling and type definition generation.
- **Command**: `pnpm build` runs `tsdown`.
- **Config**: `tsdown.config.ts` handles the ESM output and externalizes `react` and `react-reconciler`.

## ANTI-PATTERNS
- **NO DOM APIs**: Never use `window`, `document`, or `HTMLElement`. This code must remain environment-agnostic to support Web Workers and Node.js runtimes.
- **Direct Event Passing**: Events must be handled via IDs and the bridge, as functions cannot be serialized across RPC boundaries.
