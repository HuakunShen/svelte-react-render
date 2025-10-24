# Plugin Architecture

This document describes the realistic plugin architecture where plugins are separate packages that get bundled and loaded into the host application.

## Overview

The architecture consists of three main parts:

1. **Plugin Package** (`packages/plugin-example/`) - Standalone package containing React plugin code
2. **Host Application** (`packages/demo-sveltekit/`) - SvelteKit app that loads and renders plugins
3. **Web Worker Bridge** - Isolates plugin execution in a Web Worker for security

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Plugin Package                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  src/index.tsx (React Component)                    │   │
│  └──────────────────┬──────────────────────────────────┘   │
│                     │                                        │
│                     │ bun build (bundle)                    │
│                     ↓                                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  dist/index.js (Bundled ES Module)                  │   │
│  └──────────────────┬──────────────────────────────────┘   │
│                     │                                        │
│                     │ copy to static/                       │
└─────────────────────┼────────────────────────────────────────┘
                      │
                      ↓
┌─────────────────────────────────────────────────────────────┐
│                   Host Application                          │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  static/plugins/advanced-demo.js (Plugin Bundle)   │    │
│  └────────────────┬───────────────────────────────────┘    │
│                   │                                          │
│                   │ loaded via URL                          │
│                   ↓                                          │
│  ┌────────────────────────────────────────────────────┐    │
│  │           Web Worker                               │    │
│  │  ┌──────────────────────────────────────────────┐ │    │
│  │  │  React Renderer + Plugin Component           │ │    │
│  │  └────────────┬─────────────────────────────────┘ │    │
│  │               │ RPC (Serialized Component Tree)    │    │
│  └───────────────┼─────────────────────────────────────┘   │
│                  │                                          │
│                  ↓                                          │
│  ┌────────────────────────────────────────────────────┐    │
│  │           Main Thread                              │    │
│  │  ┌──────────────────────────────────────────────┐ │    │
│  │  │  Svelte ComponentRenderer                    │ │    │
│  │  │  (Renders UI with shadcn-svelte)             │ │    │
│  │  └──────────────────────────────────────────────┘ │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## Plugin Development Workflow

### 1. Create Plugin Package

```bash
cd packages/
mkdir my-plugin
cd my-plugin
bun init -y
```

### 2. Install Dependencies

```json
{
  "dependencies": {
    "react": "^18.3.1",
    "@svelte-react-render/api": "workspace:*"
  }
}
```

### 3. Write Plugin Component

```tsx
// src/index.tsx
import { useState } from 'react';
import { Button, Input } from '@svelte-react-render/api';

export default function MyPlugin() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <h2>Count: {count}</h2>
      <Button onClick={() => setCount(count + 1)}>
        Increment
      </Button>
    </div>
  );
}
```

### 4. Configure Build Script

```typescript
// build.ts
import { $ } from 'bun';
import { join } from 'path';

// Build the plugin
await $`bun build src/index.tsx --outdir=dist --format=esm --target=browser --external react --external @svelte-react-render/api`;

// Copy to host app's static folder
const destFile = join(import.meta.dir, '../demo-sveltekit/static/plugins/my-plugin.js');
await $`cp dist/index.js ${destFile}`;
```

### 5. Build and Deploy

```bash
pnpm build
```

### 6. Load in Host App

```svelte
<script>
  import WorkerPluginHost from '$lib/plugin/WorkerPluginHost.svelte';
</script>

<WorkerPluginHost pluginUrl="/plugins/my-plugin.js" />
```

## How It Works

### Build Phase

1. **Bundle**: Bun bundles the TypeScript/React code into a single ES module
2. **Externals**: React and API imports are marked as external (not bundled)
3. **Output**: Clean ES module with bare imports: `import { useState } from "react"`
4. **Deploy**: Copy bundled file to host app's static folder

### Runtime Phase

1. **Worker Creation**: Host app creates a Web Worker
2. **RPC Setup**: Bidirectional RPC channel established using kkRPC
3. **Plugin Load**: Worker dynamically imports plugin URL: `import('/plugins/my-plugin.js')`
4. **React Render**: Plugin component rendered with React in worker
5. **Serialization**: React tree serialized to JSON (functions → handler IDs)
6. **Transfer**: Serialized tree sent to main thread via RPC
7. **Svelte Render**: Main thread renders with Svelte components
8. **Events**: User interactions call back to worker via RPC

### Key Features

- **Isolation**: Plugins run in separate Web Worker (sandboxed)
- **Security**: Plugin code can't directly access DOM or main thread
- **Performance**: React reconciliation happens in worker (off main thread)
- **Bundling**: Each plugin is a standalone ES module
- **Type Safety**: Full TypeScript support in plugin development
- **Hot Reload**: Vite HMR works for plugin development

## File Structure

```
svelte-react-render/
├── packages/
│   ├── plugin-example/              # Example plugin package
│   │   ├── src/
│   │   │   └── index.tsx           # Plugin component
│   │   ├── dist/
│   │   │   └── index.js            # Bundled output
│   │   ├── build.ts                 # Build script
│   │   └── package.json
│   │
│   ├── demo-sveltekit/              # Host application
│   │   ├── static/
│   │   │   └── plugins/
│   │   │       └── advanced-demo.js # Deployed plugin
│   │   ├── src/
│   │   │   ├── lib/
│   │   │   │   ├── plugin/
│   │   │   │   │   ├── react-plugin.worker.ts  # Worker code
│   │   │   │   │   ├── WorkerPluginHost.svelte # Main thread host
│   │   │   │   │   ├── ComponentRenderer.svelte
│   │   │   │   │   ├── serialization.ts
│   │   │   │   │   └── worker-rpc-types.ts
│   │   │   │   └── components/      # Svelte UI components
│   │   │   └── routes/
│   │   │       └── +page.svelte     # App entry point
│   │   └── package.json
│   │
│   └── api/                          # Shared API package
│       ├── src/
│       │   ├── components/          # React wrapper components
│       │   ├── reconciler/          # React reconciler
│       │   └── index.ts
│       └── package.json
```

## Benefits of This Architecture

### For Plugin Developers

- **Familiar Tools**: Use React, TypeScript, and any bundler you prefer
- **Type Safety**: Full IntelliSense and type checking
- **Hot Reload**: Fast development iteration
- **NPM Publishing**: Can publish plugins as npm packages

### For Host App

- **Security**: Plugins run in isolated workers
- **Performance**: React work happens off main thread
- **Flexibility**: Load plugins from any URL
- **Version Control**: Plugins and host app versioned independently

### For End Users

- **Better UX**: Main thread stays responsive
- **Safety**: Malicious plugins can't access sensitive data
- **Reliability**: Plugin crashes don't affect main app

## Advanced Topics

### Loading Remote Plugins

```svelte
<WorkerPluginHost pluginUrl="https://cdn.example.com/plugins/my-plugin-v1.2.3.js" />
```

### Plugin Props

```svelte
<WorkerPluginHost 
  pluginUrl="/plugins/my-plugin.js" 
  props={{ userId: 123, theme: 'dark' }}
/>
```

### Multiple Plugins

```svelte
{#each pluginUrls as pluginUrl (pluginUrl)}
  <WorkerPluginHost {pluginUrl} />
{/each}
```

### Error Handling

The worker catches errors and logs them to the main thread via RPC:

```typescript
api.logMessage('error', 'Plugin failed to load:', error);
```

## Comparison: Before vs After

### Before (All in One Package)

```
packages/demo-sveltekit/
└── src/lib/plugins/
    ├── simple-demo.tsx      ← Plugin source
    └── advanced-demo.tsx    ← Plugin source
```

**Issues:**
- ❌ Plugins tightly coupled to host app
- ❌ Can't distribute plugins independently
- ❌ Hard to version plugins separately
- ❌ Doesn't simulate real-world plugin system

### After (Separate Packages)

```
packages/
├── plugin-example/          ← Separate plugin package
│   ├── src/index.tsx
│   └── dist/index.js        ← Built artifact
└── demo-sveltekit/
    └── static/plugins/
        └── advanced-demo.js ← Deployed plugin
```

**Benefits:**
- ✅ Plugins are independent packages
- ✅ Can be published to npm
- ✅ Version plugins independently
- ✅ Realistic plugin distribution model
- ✅ Simulates production architecture

## Next Steps

1. Create more example plugins
2. Add plugin marketplace/registry
3. Implement plugin permissions system
4. Add plugin lifecycle hooks (onMount, onDestroy)
5. Support plugin configuration/settings
6. Add plugin API versioning

