# Web Worker Plugin Architecture

## Overview

The plugin system has been refactored to run React plugins in Web Workers for sandboxing and security. The architecture uses kkRPC for bidirectional communication between the main thread and worker threads.

## Architecture

### Components

1. **Main Thread**
   - `WorkerPluginHost.svelte` - Manages worker lifecycle and RPC communication
   - `ComponentRenderer.svelte` - Renders Svelte components based on serialized component tree
   - `App.svelte` - Application entry point, switches between plugins

2. **Worker Thread**
   - `react-plugin.worker.ts` - Runs React and the reconciler
   - Executes plugin code in isolated environment
   - Serializes component tree and sends to main thread
   - Handles event callbacks via RPC

3. **Shared**
   - `worker-rpc-types.ts` - TypeScript interfaces for RPC communication
   - `serialization.ts` - Utilities for serializing component trees
   - `handler-registry.ts` - Manages event handler references

## Communication Flow

```
Main Thread                          Worker Thread
-----------                          -------------
1. Create worker
2. Establish RPC channel      <-->  Establish RPC channel
3. Send plugin URL            --->  
4.                                  Load and render plugin
5.                                  Generate component tree
6.                            <---  Serialize and send tree
7. Render Svelte components
8. User clicks button
9. Send RPC call              --->  
10.                                 Execute event handler
11.                                 React updates state
12.                           <---  Send updated tree
13. Re-render components
```

## Event Handler Serialization

Since functions cannot be serialized across threads, we use a handler registry pattern:

1. Worker generates unique handler IDs for each event handler
2. Handler IDs are included in the serialized props (e.g., `_onClickHandlerId`)
3. Main thread creates proxy functions that call back to worker via RPC
4. Worker executes the original handler when called

## Key Features

- **Sandboxing**: React code runs in isolated worker context
- **Security**: No direct access to main thread DOM or globals
- **Performance**: UI rendering stays on main thread
- **Bidirectional RPC**: Both threads can call methods on each other
- **Hot Module Replacement**: Vite automatically handles worker updates

## Plugin URLs

Plugins are now loaded by URL instead of direct imports:

```typescript
// Old way (main thread)
import SimpleDemo from './plugins/simple-demo';
const element = createElement(SimpleDemo);

// New way (worker)
const pluginUrl = '/src/plugins/simple-demo.tsx';
await api.renderPlugin(pluginUrl);
```

## Files Created

- `packages/app/src/plugin/worker-rpc-types.ts` - RPC type definitions
- `packages/app/src/plugin/serialization.ts` - Tree serialization utilities
- `packages/app/src/plugin/handler-registry.ts` - Event handler management
- `packages/app/src/plugin/react-plugin.worker.ts` - Worker implementation
- `packages/app/src/plugin/WorkerPluginHost.svelte` - Worker host component

## Files Modified

- `packages/app/src/App.svelte` - Uses WorkerPluginHost instead of PluginHost
- `packages/app/src/plugin/ComponentRenderer.svelte` - Handles RPC event callbacks

## Testing

The existing demo plugins (`simple-demo.tsx` and `advanced-demo.tsx`) now run in Web Workers automatically. Test by:

1. Opening the dev server: `pnpm dev`
2. Switching between Simple and Advanced demos
3. Interacting with buttons, inputs, switches, and toggles
4. Checking browser console for worker logs (prefixed with `[Worker]` and `[Main]`)

## Browser DevTools

To debug the worker:
1. Open Chrome DevTools
2. Go to Sources tab
3. Look for "react-plugin.worker.ts" in the file tree
4. Set breakpoints and step through worker code

## Performance Considerations

- **Serialization overhead**: Component trees are serialized on every update
- **RPC latency**: Event handlers make async RPC calls to worker
- **Memory**: Each plugin instance creates a new worker

## Future Improvements

1. **Batching**: Batch multiple tree updates together
2. **Diff algorithm**: Only send changed parts of tree
3. **Worker pool**: Reuse workers across plugin instances
4. **Structured clone**: Use structured clone algorithm for better performance
5. **SharedArrayBuffer**: For zero-copy data transfer (requires COOP/COEP headers)

