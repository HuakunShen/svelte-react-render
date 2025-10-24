# Svelte-React Plugin System

A plugin system that allows developers to write React extensions that render using custom Svelte components, inspired by [Raycast's plugin architecture](https://www.raycast.com/blog/how-raycast-api-extensions-work).

## Overview

This project implements a custom React reconciler that renders React components using Svelte 5 components as the UI layer. Plugins can be written in React while the host application is written in Svelte, providing a clean separation between plugin logic and UI rendering.

### Key Features

- ✨ **React Plugins, Svelte UI**: Write plugins in React, render with beautiful Svelte components
- 🔒 **Dual Runtime Modes**: Run plugins in Web Worker (sandboxed) or Main Thread (direct)
- ⚡ **Runtime Switching**: Toggle between modes without restarting
- 🎨 **shadcn-svelte Components**: Pre-built UI components with beautiful styling
- 🔄 **Bidirectional RPC**: Worker mode uses kkRPC for seamless communication
- 🎯 **Type Safety**: Full TypeScript support throughout

## Architecture

### Dual-Mode Execution

```
┌─────────────────────────────────────────────────────┐
│                    Plugin System                     │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ⚡ Web Worker Mode          🧵 Main Thread Mode   │
│  ┌─────────────────┐         ┌──────────────────┐  │
│  │ Main Thread     │<--RPC-->│ Main Thread      │  │
│  │ (Svelte)        │         │ (Svelte + React) │  │
│  └─────────────────┘         └──────────────────┘  │
│           ↕                           ↕              │
│  ┌─────────────────┐         ┌──────────────────┐  │
│  │ Worker Thread   │         │ ComponentRenderer│  │
│  │ (React)         │         │ (Direct)         │  │
│  └─────────────────┘         └──────────────────┘  │
│                                                      │
│  • Sandboxed                 • Fast                 │
│  • Secure                    • Simple               │
│  • Isolated                  • Direct access        │
└─────────────────────────────────────────────────────┘
```

### Component Flow

```
React Plugin (TSX)
      ↓
Custom Reconciler
      ↓
Component Tree (Virtual)
      ↓
[Worker Mode: Serialize + RPC] or [Main Thread: Direct]
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

# Start development server
pnpm dev

# Build for production
pnpm build
```

### Usage

Open http://localhost:5173 and you'll see:
- **Runtime Mode Toggle**: Switch between Web Worker and Main Thread
- **Demo Selector**: Choose Simple Demo or Advanced Demo
- **Live Interaction**: All components work in both modes

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
│   └── app/                      # Svelte host application
│       ├── src/
│       │   ├── plugin/           # Plugin infrastructure
│       │   │   ├── PluginHost.svelte          # Main thread host
│       │   │   ├── WorkerPluginHost.svelte    # Worker host
│       │   │   ├── ComponentRenderer.svelte    # UI renderer
│       │   │   ├── react-plugin.worker.ts     # Worker runtime
│       │   │   ├── worker-rpc-types.ts        # RPC interfaces
│       │   │   ├── serialization.ts           # Tree serialization
│       │   │   └── handler-registry.ts        # Event handlers
│       │   │
│       │   ├── plugins/          # Demo plugins
│       │   │   ├── simple-demo.tsx
│       │   │   └── advanced-demo.tsx
│       │   │
│       │   └── components/ui/    # Svelte UI components
│       │       ├── Button.svelte
│       │       ├── Input.svelte
│       │       ├── Form.svelte
│       │       ├── Switch.svelte
│       │       └── Toggle.svelte
│       │
│       └── App.svelte            # Main application
│
├── .journal/                     # Development journal
│   └── 2025-10-24.md
│
└── Documentation
    ├── WORKER_ARCHITECTURE.md    # Technical architecture
    ├── DUAL_MODE_ARCHITECTURE.md # Dual-mode design
    └── QUICK_START.md            # User guide
```

## Creating Plugins

### Basic Example

```tsx
// my-plugin.tsx
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

### Web Worker Mode (Default)

**Use When:**
- Running untrusted plugin code
- Need isolation from main thread
- Security is critical
- Building a plugin marketplace

**Characteristics:**
- Sandboxed execution
- Async RPC communication
- ~5-10ms event handling latency
- Separate worker bundle

### Main Thread Mode

**Use When:**
- Performance is critical
- Trusted plugin code
- Rapid prototyping
- Debugging plugins

**Characteristics:**
- Direct execution
- <1ms event handling
- Simpler debugging
- No serialization overhead

## How It Works

### Custom React Reconciler

The heart of the system is a custom React reconciler that:

1. **Intercepts React render calls** - Captures React component tree
2. **Generates virtual component tree** - Creates serializable representation
3. **Maps to Svelte components** - Translates React components to Svelte
4. **Handles state updates** - Syncs React state changes to UI

### Event Handler Serialization

In Worker mode, functions can't be serialized. The solution:

```typescript
// Worker: Generate handler IDs
const handlerId = registerHandler(onClick);
props._onClickHandlerId = handlerId;

// Main thread: Create proxy function
onClick: async () => {
  await rpc.getAPI().executeHandler(handlerId);
}
```

### Bidirectional RPC (Worker Mode)

```typescript
// Worker API (exposed to main thread)
interface WorkerAPI {
  renderPlugin(pluginUrl: string, props?: any): Promise<void>;
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
