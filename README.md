# Svelte-React Plugin System

A plugin system that allows developers to write React extensions that render using custom Svelte components, inspired by [Raycast's plugin architecture](https://www.raycast.com/blog/how-raycast-api-extensions-work).

## Overview

This project implements a custom React reconciler that renders React components using Svelte 5 components as the UI layer. Plugins can be written in React while the host application is written in Svelte, providing a clean separation between plugin logic and UI rendering.

### Key Features

- ✨ **React Plugins, Svelte UI**: Write plugins in React, render with beautiful Svelte components
- 📦 **Self-Contained Workers**: Each plugin is a standalone ES module bundling React, kkRPC, and API
- 🌐 **External Plugin Loading**: Load plugins from any URL via fetch + blob workers
- 🔒 **Dual Runtime Modes**: Run plugins in Web Worker (sandboxed) or Main Thread (direct)
- ⚡ **Runtime Switching**: Toggle between modes without restarting
- 🎨 **shadcn-svelte Components**: Pre-built UI components with beautiful styling
- 🔄 **Bidirectional RPC**: Worker mode uses kkRPC for seamless communication
- 🎯 **Type Safety**: Full TypeScript support throughout

## Architecture

### Self-Contained Plugin Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Plugin System                           │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ⚡ Web Worker Mode               🧵 Main Thread Mode       │
│  (External Plugin Loading)        (Direct Import)            │
│                                                               │
│  Main Thread                      Main Thread                │
│  ┌──────────────────┐            ┌──────────────────┐       │
│  │ fetch(pluginUrl) │            │ import { Plugin }│       │
│  │      ↓           │            │   from 'pkg'     │       │
│  │ Blob Worker      │            │      ↓           │       │
│  │      ↓           │            │ ComponentRenderer│       │
│  │ RPC Connection   │            └──────────────────┘       │
│  └──────────────────┘                                        │
│         ↕ RPC                                                │
│  Self-Contained Plugin Worker                                │
│  ┌────────────────────────────┐                             │
│  │ • kkRPC (bundled)          │                             │
│  │ • React (bundled)          │                             │
│  │ • API Components (bundled) │                             │
│  │ • Plugin Code              │                             │
│  │ • RPC Setup & Init         │                             │
│  └────────────────────────────┘                             │
│                                                               │
│  • Sandboxed & Isolated        • Fast & Simple              │
│  • Load from any URL           • Shared code reuse          │
│  • Production-ready            • Development-friendly        │
└─────────────────────────────────────────────────────────────┘
```

### Plugin Flow

**Worker Mode (External Loading):**
```
HTTP Server (localhost:3000)
      ↓
fetch(pluginUrl) - Main Thread
      ↓
Blob Worker Creation
      ↓
Self-Contained Plugin Worker:
  ├─ React Plugin (TSX)
  ├─ Custom Reconciler
  ├─ Component Tree (Virtual)
  └─ Serialize + RPC
      ↓
Main Thread - ComponentRenderer
      ↓
Svelte Components (UI Layer)
      ↓
shadcn-svelte (Beautiful UI)
```

**Main Thread Mode (Direct Import):**
```
import { Plugin } from 'package'
      ↓
React Plugin (TSX)
      ↓
Custom Reconciler
      ↓
Component Tree (Virtual)
      ↓
ComponentRenderer (Direct)
      ↓
Svelte Components (UI Layer)
      ↓
shadcn-svelte (Beautiful UI)
```

## Quick Start

### Installation

```bash
# Install dependencies
pnpm install

# Build plugins (in one terminal)
cd packages/plugin-example
pnpm dev  # Builds plugins and serves on http://localhost:3000

# Start demo app (in another terminal)
cd packages/demo-sveltekit
pnpm dev  # Starts on http://localhost:5173
```

### Usage

Open http://localhost:5173 and you'll see:
- **Runtime Mode Toggle**: Switch between ⚡ Web Worker and 🧵 Main Thread
- **Demo Selector**: Choose Simple Demo or Advanced Demo
- **Live Interaction**: All components work seamlessly in both modes

**Worker Mode** loads plugins from `http://localhost:3000/` as external bundles.  
**Main Thread Mode** imports plugins directly from the package for faster development.

## Project Structure

```
svelte-react-render/
├── packages/
│   ├── api/                      # React API package (@svelte-react-render/api)
│   │   ├── src/
│   │   │   ├── components/       # React wrapper components
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Form.tsx
│   │   │   │   ├── Switch.tsx
│   │   │   │   └── Toggle.tsx
│   │   │   └── reconciler/       # Custom React reconciler
│   │   │       ├── bridge.ts     # Main thread ↔ React bridge
│   │   │       ├── host-config.ts # React reconciler configuration
│   │   │       ├── renderer.ts   # Reconciler instance
│   │   │       └── types.ts
│   │   └── dist/                 # Built package
│   │
│   ├── plugin-example/           # Example plugins (@svelte-react-render/plugin-example)
│   │   ├── src/
│   │   │   ├── simple-demo.tsx           # Simple demo component
│   │   │   ├── simple-demo.worker.ts     # Self-contained worker
│   │   │   ├── advanced-demo.tsx         # Advanced demo component
│   │   │   ├── advanced-demo.worker.ts   # Self-contained worker
│   │   │   ├── serialization-utils.ts    # Tree serialization
│   │   │   ├── handler-registry.ts       # Event handlers
│   │   │   ├── worker-rpc-types.ts       # RPC interfaces
│   │   │   └── index.ts                  # Exports for main-thread
│   │   ├── dist/                 # Built worker bundles
│   │   │   ├── simple-demo.js    # Served at localhost:3000
│   │   │   └── advanced-demo.js  # Served at localhost:3000
│   │   └── build.ts              # Build system with dev server
│   │
│   └── demo-sveltekit/           # Svelte host application
│       ├── src/
│       │   ├── lib/
│       │   │   ├── plugin/       # Plugin infrastructure
│       │   │   │   ├── PluginHost.svelte          # Main thread host
│       │   │   │   ├── WorkerPluginHost.svelte    # Blob worker host
│       │   │   │   ├── ComponentRenderer.svelte   # UI renderer
│       │   │   │   ├── worker-rpc-types.ts        # RPC interfaces
│       │   │   │   └── serialization.ts           # Tree serialization
│       │   │   │
│       │   │   └── components/ui/ # shadcn-svelte components
│       │   │       ├── button/
│       │   │       ├── input/
│       │   │       ├── form/
│       │   │       ├── switch/
│       │   │       └── toggle/
│       │   │
│       │   └── routes/
│       │       └── +page.svelte   # Main demo page
│       │
│       └── static/
│
├── .journal/                     # Development journal
│   ├── 2025-10-24.md
│   └── 2025-10-25.md
│
└── Documentation
    ├── WORKER_ARCHITECTURE.md    # Technical architecture
    ├── DUAL_MODE_ARCHITECTURE.md # Dual-mode design
    └── QUICK_START.md            # User guide
```

## Creating Plugins

Plugins can be created as standalone packages. Each plugin consists of:
1. **React Component** - Your plugin logic
2. **Worker Script** - Self-contained worker bundle

### Plugin Component Example

```tsx
// src/my-plugin.tsx
import { useState } from 'react';
import { Button, Input } from '@svelte-react-render/api';

export default function MyPlugin() {
  const [name, setName] = useState('');
  const [count, setCount] = useState(0);

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold">My Plugin</h2>
      
      <Input
        label="Your Name"
        placeholder="Enter your name"
        value={name}
        onChange={(value) => setName(value)}
      />
      
      <Button
        title={`Clicked ${count} times`}
        onClick={() => setCount(count + 1)}
      />
      
      {name && (
        <p>Hello, {name}!</p>
      )}
    </div>
  );
}
```

### Worker Script Template

```tsx
// src/my-plugin.worker.ts
import { RPCChannel, WorkerChildIO } from 'kkrpc';
import * as React from 'react';
import * as API from '@svelte-react-render/api';
import { serializeComponentTree, createSerializationContext } from './serialization-utils';
import type { WorkerAPI, MainThreadAPI } from './worker-rpc-types';
import MyPlugin from './my-plugin';

// ... standard worker setup (see plugin-example for full template)
```

### Build Configuration

```typescript
// build.ts
await Bun.build({
  entrypoints: ['./src/my-plugin.worker.ts'],
  outdir: './dist',
  target: 'browser',
  format: 'esm',
  external: [], // Bundle everything!
});
```

See `packages/plugin-example/` for a complete working example.

### Available Components

Import from `@svelte-react-render/api`:

- **Button** - Clickable button with variants
- **Input** - Text input with label
- **Switch** - Toggle switch
- **Toggle** - Toggle button with pressed state
- **Form Components** - FormField, FormControl, FormLabel, FormDescription, FormFieldErrors, FormButton

All components automatically work in both Worker and Main Thread modes!

### Advanced Example

```tsx
import { useState } from 'react';
import {
  Button,
  Input,
  Switch,
  Toggle,
  FormField,
  FormControl,
  FormLabel,
  FormDescription,
} from '@svelte-react-render/api';

export default function AdvancedPlugin() {
  const [formData, setFormData] = useState({
    username: '',
    notifications: false,
    theme: 'light'
  });

  const handleSubmit = () => {
    console.log('Form submitted:', formData);
  };

  return (
    <div className="p-6 max-w-lg mx-auto space-y-6">
      <h2 className="text-2xl font-semibold">Settings</h2>

      <FormField name="username">
        <FormControl>
          <FormLabel>Username</FormLabel>
          <Input
            value={formData.username}
            onChange={(v) => setFormData({...formData, username: v})}
          />
        </FormControl>
        <FormDescription>Your public display name</FormDescription>
      </FormField>

      <div className="flex items-center justify-between">
        <span>Enable notifications</span>
        <Switch
          checked={formData.notifications}
          onChange={(checked) => setFormData({...formData, notifications: checked})}
        />
      </div>

      <div className="flex gap-2">
        <Toggle
          pressed={formData.theme === 'light'}
          onClick={() => setFormData({...formData, theme: 'light'})}
        >
          ☀️ Light
        </Toggle>
        <Toggle
          pressed={formData.theme === 'dark'}
          onClick={() => setFormData({...formData, theme: 'dark'})}
        >
          🌙 Dark
        </Toggle>
      </div>

      <Button
        title="Save Settings"
        onClick={handleSubmit}
        variant="primary"
      />
    </div>
  );
}
```

## Runtime Modes

### Web Worker Mode (External Loading)

**Use When:**
- Running untrusted plugin code
- Need isolation from main thread
- Security is critical
- Building a plugin marketplace
- Loading plugins from URLs

**Characteristics:**
- Sandboxed execution
- Self-contained worker bundles
- Load from any URL (localhost, CDN, etc.)
- Async RPC communication (~5-10ms latency)
- Production-ready architecture
- No dependency coordination needed

**How It Works:**
1. Fetch plugin script from URL
2. Create blob worker from script
3. Worker auto-initializes with bundled dependencies
4. RPC channel for communication

### Main Thread Mode (Direct Import)

**Use When:**
- Performance is critical
- Trusted plugin code
- Rapid prototyping
- Debugging plugins
- Development workflow

**Characteristics:**
- Direct execution
- Import from workspace packages
- <1ms event handling
- Simpler debugging
- No serialization overhead
- Shared React instances

**How It Works:**
1. Import plugin component directly
2. Render with custom reconciler
3. Direct function calls (no RPC)

## How It Works

### Self-Contained Plugin Architecture

Each plugin is a **complete, standalone ES module**:

```typescript
// Plugin bundle includes:
- kkRPC library         → RPC communication
- React runtime         → Hook & component support
- API components        → UI primitives
- Plugin code           → Your logic
- Worker setup          → Auto-initialization
```

**Benefits:**
- ✅ No dependency coordination
- ✅ No version conflicts
- ✅ Load from any URL
- ✅ Simple deployment
- ✅ Production-ready

### Custom React Reconciler

The heart of the system is a custom React reconciler that:

1. **Intercepts React render calls** - Captures React component tree
2. **Generates virtual component tree** - Creates serializable representation
3. **Maps to Svelte components** - Translates React components to Svelte
4. **Handles state updates** - Syncs React state changes to UI

### Event Handler Serialization (Worker Mode)

Functions can't cross worker boundaries. The solution:

```typescript
// Worker: Register handler and generate ID
const handlerId = registerHandler(onClick);
props._onClickHandlerId = handlerId;

// Main thread: Create proxy that calls back to worker
onClick: async () => {
  await rpc.getAPI().executeHandler(handlerId);
}
```

### Bidirectional RPC (Worker Mode)

```typescript
// Worker API (exposed to main thread)
interface WorkerAPI {
  initialize(props?: any): Promise<void>;
  updateProps(props: any): Promise<void>;
  executeHandler(handlerId: string, ...args: any[]): Promise<void>;
  destroy(): Promise<void>;
}

// Main Thread API (exposed to worker)
interface MainThreadAPI {
  updateComponentTree(tree: SerializedComponentTree): void;
  logMessage(level: string, ...args: any[]): void;
}
```

### Blob Worker Loading

```typescript
// Fetch plugin from URL
const response = await fetch('http://localhost:3000/plugin.js');
const scriptText = await response.text();

// Create worker from blob
const blob = new Blob([scriptText], { type: 'application/javascript' });
const worker = new Worker(URL.createObjectURL(blob));

// Worker auto-initializes and connects via RPC
```

## Performance

### Benchmarks

**Web Worker Mode:**
- Initial load: ~100-200ms
- Plugin switch: ~50-100ms
- Event handling: ~5-10ms
- Bundle: 253KB main + 126KB worker

**Main Thread Mode:**
- Initial load: ~10-20ms
- Plugin switch: ~10-20ms
- Event handling: <1ms
- Bundle: 253KB main only

## Inspiration

This project is inspired by [Raycast's plugin system](https://www.raycast.com/blog/how-raycast-api-extensions-work), which uses a custom React reconciler to render plugins using macOS AppKit. Instead of AppKit, we render to Svelte components with shadcn-svelte styling.

### Key Differences from Raycast

- **UI Layer**: Svelte components vs AppKit
- **Runtime Options**: Dual-mode (Worker + Main Thread) vs Main Thread only
- **Styling**: shadcn-svelte vs native macOS
- **Target**: Web applications vs Desktop (Electron)

## Development

### Building

```bash
# Build API package
pnpm --filter api build

# Build app
pnpm --filter app build

# Build everything
pnpm build
```

### Testing

```bash
# Run dev server
pnpm dev

# Open http://localhost:5173
# Toggle between Web Worker and Main Thread modes
# Test Simple Demo and Advanced Demo
# Interact with all components
```

### Debugging

**Worker Mode:**
1. Open Chrome DevTools
2. Go to Sources tab
3. Find `react-plugin.worker.ts`
4. Set breakpoints
5. Interact with plugin

**Main Thread Mode:**
1. Open Chrome DevTools
2. Set breakpoints in plugin code
3. Standard debugging workflow

## Documentation

- **[WORKER_ARCHITECTURE.md](./WORKER_ARCHITECTURE.md)** - Technical architecture details
- **[DUAL_MODE_ARCHITECTURE.md](./DUAL_MODE_ARCHITECTURE.md)** - Dual-mode design rationale
- **[QUICK_START.md](./QUICK_START.md)** - User guide with testing scenarios
- **[.journal/2025-10-24.md](./.journal/2025-10-24.md)** - Development decisions and learnings

## Tech Stack

- **Svelte 5** - UI framework with modern reactivity
- **React 18** - Plugin runtime
- **React Reconciler** - Custom renderer implementation
- **kkRPC** - Bidirectional RPC for Worker communication
- **shadcn-svelte** - Beautiful UI components
- **Vite** - Build tool with Worker support
- **TypeScript** - Type safety throughout
- **Tailwind CSS** - Utility-first styling

## Future Enhancements

- [ ] Lazy load worker bundle
- [ ] Implement diff algorithm for tree updates
- [ ] Worker pool for multiple plugins
- [ ] Plugin hot reload
- [ ] Performance profiling tools
- [ ] Plugin marketplace demo
- [ ] More UI components (List, Table, etc.)
- [ ] Plugin API documentation generator
- [ ] CLI for plugin scaffolding

## License

MIT

## Contributing

Contributions welcome! This is an experimental project exploring React reconcilers and Web Worker architectures.

## Credits

- Inspired by [Raycast](https://raycast.com) and their [technical blog post](https://www.raycast.com/blog/how-raycast-api-extensions-work)
- Built with [Svelte 5](https://svelte.dev)
- UI components from [shadcn-svelte](https://www.shadcn-svelte.com/)
- RPC powered by [kkRPC](https://github.com/kunkunsh/kkrpc)
