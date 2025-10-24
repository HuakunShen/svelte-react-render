# Dual-Mode Plugin Architecture

## Overview

The plugin system supports **two runtime modes** that can be switched dynamically:

1. **Web Worker Mode** - Self-contained plugins loaded from URLs (production-ready)
2. **Main Thread Mode** - Direct plugin imports from packages (development-friendly)

### What Changed (Oct 2025)

The architecture was redesigned to use **self-contained plugin workers**. Each plugin is now a complete, standalone ES module that bundles everything (React, kkRPC, API) and handles its own initialization.

## Features

### Runtime Mode Toggle

Users can switch between modes in real-time using the UI toggle:

- **⚡ Web Worker** - Plugins run in sandboxed environment
- **🧵 Main Thread** - Plugins run directly (faster, no serialization overhead)

### Plugin Switching

Both modes support dynamic plugin switching:

- Switch between Simple Demo and Advanced Demo
- Hot reload on plugin URL changes (Worker mode)
- Instant re-render on plugin changes (Main Thread mode)

## Architecture Comparison

### Web Worker Mode (External Loading)

```
Main Thread                           Self-Contained Plugin Worker
-----------                           ----------------------------
fetch(http://localhost:3000/plugin.js)
      ↓
Blob Worker Creation                  [Complete Bundle]
      ↓                               - kkRPC
WorkerPluginHost.svelte    <-RPC->   - React
ComponentRenderer.svelte   <------   - API Components
                                      - Plugin Code
                                      - Serialization Utils
                                      - Auto-initialization
```

**Pros:**

- ✅ Sandboxed execution (security)
- ✅ Isolated from main thread
- ✅ Load from any URL (localhost, CDN, remote)
- ✅ No dependency coordination
- ✅ Production-ready
- ✅ Can be terminated independently
- ✅ Truly external plugins

**Cons:**

- Serialization overhead
- Async RPC latency (~5-10ms)
- Larger individual bundle sizes (but acceptable)

### Main Thread Mode (Direct Import)

```
Main Thread
-----------
import { Plugin } from '@svelte-react-render/plugin-example'
      ↓
PluginHost.svelte
      ↓
ComponentRenderer.svelte
      ↓
React (direct)
```

**Pros:**

- ✅ No serialization overhead
- ✅ Direct function calls (<1ms)
- ✅ Simpler debugging
- ✅ Fast development workflow
- ✅ Shared React instances
- ✅ Code reuse via workspace packages

**Cons:**

- No sandboxing
- Plugin errors can crash main thread
- Shares memory space with host app
- Only for trusted plugins

## Implementation Details

### Self-Contained Plugin Workers

Each plugin is built as a complete worker script:

**Plugin Structure:**

```
plugin-example/
├── src/
│   ├── simple-demo.tsx           # React component
│   ├── simple-demo.worker.ts     # Complete worker bundle
│   ├── serialization-utils.ts    # Tree serialization
│   └── worker-rpc-types.ts       # RPC interfaces
└── dist/
    └── simple-demo.js            # ~500KB bundled ES module
```

**Worker Loading:**

```typescript
// Fetch plugin from URL
const response = await fetch(pluginUrl);
const scriptText = await response.text();

// Create blob worker
const blob = new Blob([scriptText], { type: "application/javascript" });
const blobURL = URL.createObjectURL(blob);
const worker = new Worker(blobURL);

// Worker auto-initializes and establishes RPC connection
URL.revokeObjectURL(blobURL); // Clean up
```

**Auto-Initialization Pattern:**

```typescript
// Worker script (simplified)
async function initializePlugin(props?: any) {
  // Create renderer, bridge, subscribe to updates
  // Render React component
}

function setupRPC() {
  rpcChannel = new RPCChannel(io, {
    expose: {
      async initialize(props) {
        return initializePlugin(props);
      },
      // ... other methods
    },
  });
}

// Setup then auto-initialize
setupRPC();
initializePlugin();
```

### Mode Switching

The main page maintains both execution paths:

```typescript
// State
let runtimeMode: RuntimeMode = $state('worker');

// Worker mode: Load from external URL
let pluginUrl = $derived(
  currentDemo === 'simple'
    ? 'http://localhost:3000/simple-demo.js'
    : 'http://localhost:3000/advanced-demo.js'
);

// Main thread mode: Import from package
import { SimpleDemo, AdvancedDemo } from '@svelte-react-render/plugin-example';
let pluginElement = $derived(
  createElement(currentDemo === 'simple' ? SimpleDemo : AdvancedDemo)
);

// Conditional rendering
{#if runtimeMode === 'worker'}
  {#key pluginUrl}
    <WorkerPluginHost {pluginUrl} />  <!-- Fetch + Blob Worker -->
  {/key}
{:else}
  <PluginHost plugin={pluginElement} />  <!-- Direct Render -->
{/if}
```

The `{#key}` block ensures WorkerPluginHost is recreated when pluginUrl changes.

## Usage

### Switching Runtime Modes

1. Open the application
2. Look for "Runtime Mode:" toggle at the top
3. Click "⚡ Web Worker" or "🧵 Main Thread"
4. The plugin will be reloaded in the selected mode

### Switching Plugins

1. Use "Simple Demo" or "Advanced Demo" tabs
2. Plugin will reload automatically
3. All state is reset on switch

### Testing Both Modes

```bash
# Open in browser
http://localhost:5173

# Test sequence:
1. Start in Worker mode (default)
2. Click through Simple/Advanced demos
3. Interact with all components
4. Switch to Main Thread mode
5. Repeat tests
6. Switch back to Worker mode
7. Verify everything still works
```

## Performance Comparison

### Worker Mode

- Initial load: ~100-200ms (worker creation + RPC setup)
- Plugin switch: ~50-100ms (serialization + RPC)
- Event handling: ~5-10ms (async RPC call)

### Main Thread Mode

- Initial load: ~10-20ms (direct render)
- Plugin switch: ~10-20ms (direct re-render)
- Event handling: <1ms (direct function call)

## When to Use Each Mode

### Use Worker Mode When:

- Running untrusted plugin code
- Need isolation from main thread
- Security is critical
- Plugin errors shouldn't affect host app
- Building a plugin marketplace

### Use Main Thread Mode When:

- Performance is critical
- Trusted plugin code
- Rapid prototyping
- Debugging plugins
- Legacy compatibility

## Key Files

**Plugin Package:**

- `packages/plugin-example/src/*.worker.ts` - Self-contained worker scripts
- `packages/plugin-example/build.ts` - Builds and serves plugins
- `packages/plugin-example/dist/*.js` - Bundled plugins (~500KB each)

**Host Application:**

- `packages/demo-sveltekit/src/routes/+page.svelte` - Dual-mode UI
- `packages/demo-sveltekit/src/lib/plugin/WorkerPluginHost.svelte` - Blob worker host
- `packages/demo-sveltekit/src/lib/plugin/PluginHost.svelte` - Main-thread host

## Bundle Size

**Per Plugin Worker Bundle:**

- Simple Demo: ~450KB (React + kkRPC + API + Plugin)
- Advanced Demo: ~500KB (includes form components)

**Host Application:**

- Main bundle: ~250KB (without plugins)
- Worker mode: Loads external plugins dynamically
- Main-thread mode: Shares React with host (~0KB overhead)

**Trade-offs:**

- Larger plugin bundles BUT simpler architecture
- No dependency coordination
- Load only what you need
- Production-ready distribution

## Future Optimizations

1. **Lazy Load Worker Code** - Only load worker bundle when needed
2. **Code Splitting** - Split plugin code from host code
3. **Worker Pool** - Reuse workers across plugin instances
4. **Hybrid Mode** - Run expensive computations in worker, UI in main thread
5. **Dynamic Mode Selection** - Auto-select mode based on plugin metadata
