# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a plugin system that allows developers to write React extensions that render using custom Svelte components, inspired by Raycast's plugin architecture. The system uses a custom React reconciler to render React components using Svelte 5 components as the UI layer.

### Key Architecture Concepts

- **Dual Runtime Modes**: Plugins can run in Web Worker (sandboxed) or Main Thread (direct) modes
- **Self-Contained Workers**: Each plugin is a standalone ES module bundling React, kkRPC, and API
- **External Plugin Loading**: Load plugins from any URL via fetch + blob workers
- **Custom React Reconciler**: Maps React components to Svelte components using a serializable tree structure

## Development Commands

### Root Level Commands (use these first)
```bash
# Install dependencies for all packages
pnpm install

# Build all packages
pnpm build

# Start development servers (builds dependencies first)
pnpm dev

# Format all packages
pnpm format

# Run type checking
pnpm check
```

### Package-Specific Commands

#### API Package (@svelte-react-render/api)
```bash
# Build the API package
pnpm --filter api build

# Development mode with watch
pnpm --filter api dev
```

#### Plugin Example Package (@svelte-react-render/plugin-example)
```bash
# Build plugin bundles (requires Bun)
cd packages/plugin-example
pnpm dev    # Build and serve on http://localhost:3000
pnpm build  # Build production bundles
```

#### Demo Applications
```bash
# SvelteKit demo app
cd packages/demo-sveltekit
pnpm dev     # Start on http://localhost:5173
pnpm build   # Build for production
pnpm check   # Run Svelte type checking

# Vue demo app (experimental)
cd packages/demo-vue
pnpm dev     # Start Vue development server
pnpm build   # Build Vue app
```

## Package Structure

### packages/api/
Core React API package containing:
- **React Components** (`src/components/`): Button, Input, Switch, Toggle, Form components
- **Custom Reconciler** (`src/reconciler/`): Bridge between React and Svelte rendering
- **Type Definitions**: Component interfaces and serialization types

### packages/plugin-example/
Example React plugins demonstrating:
- **Simple Demo** (`simple-demo.tsx`): Basic component with state and events
- **Advanced Demo** (`advanced-demo.tsx`): Complex form with multiple component types
- **Worker Scripts**: Self-contained bundles with React, API, and kkRPC built-in
- **Build System** (`build.ts`): Bun-based build with dev server

### packages/demo-sveltekit/
Main SvelteKit demo application:
- **Plugin Host** (`src/lib/plugin/`): Main thread and worker plugin hosts
- **Component Renderer** (`ComponentRenderer.svelte`): Maps serialized React trees to Svelte
- **UI Components** (`src/lib/components/ui/`): shadcn-svelte components
- **Demo Page** (`src/routes/+page.svelte`): Interactive demo with runtime switching

### packages/demo-vue/
Experimental Vue 3 demo (early development).

## Key Technical Details

### Component Serialization
The system uses a serializable component tree structure (`SvelteComponentInstance`) that:
- Captures React component tree in worker mode
- Serializes to JSON for RPC communication
- Maps component types to Svelte equivalents
- Handles event handlers via string IDs

### Event Handler System
- **Worker Mode**: Functions are registered by ID, serialized as strings, called via RPC
- **Main Thread Mode**: Direct function calls without serialization overhead
- **ComponentRenderer**: Transforms React event props to Svelte event handlers

### Build System
- **Turborepo**: Monorepo orchestration with dependency management
- **tsdown**: API package bundling (TypeScript → ES modules)
- **Bun**: Plugin worker bundling with zero-configuration
- **Vite**: SvelteKit and Vue app development

## Development Workflow

1. **Initial Setup**: Run `pnpm install` at root to install all dependencies
2. **Plugin Development**: Work in `packages/plugin-example/`, run `pnpm dev` to start dev server
3. **Host Development**: Work in `packages/demo-sveltekit/`, run `pnpm dev` for SvelteKit
4. **Testing**: Open http://localhost:5173, toggle between worker/main thread modes

## Runtime Modes

### Web Worker Mode (External Loading)
- **Use for**: Production, untrusted plugins, security isolation
- **Characteristics**: Sandboxed, ~5-10ms event latency, load from any URL
- **Plugin bundles**: Self-contained with React, kkRPC, and API components

### Main Thread Mode (Direct Import)
- **Use for**: Development, trusted plugins, performance-critical scenarios
- **Characteristics**: Direct execution, <1ms event latency, shared React instances
- **Plugin imports**: Direct workspace package imports

## Component Development Guidelines

### Available React Components
Import from `@svelte-react-render/api`:
- `Button`: Clickable button with variants and shortcuts
- `Input`: Text input with label and validation
- `Switch`: Toggle switch for boolean values
- `Toggle`: Press-state toggle button
- `Form*` components: FormField, FormControl, FormLabel, etc.

### Plugin Component Patterns
```tsx
import { useState } from 'react';
import { Button, Input } from '@svelte-react-render/api';

export default function MyPlugin() {
  const [value, setValue] = useState('');

  return (
    <div className="p-4 space-y-4">
      <Input
        label="Enter text"
        value={value}
        onChange={setValue}
      />
      <Button title="Submit" onClick={() => console.log(value)} />
    </div>
  );
}
```

### Worker Script Template
See `packages/plugin-example/src/simple-demo.worker.ts` for complete worker setup including:
- RPC channel initialization
- React reconciler setup
- Component tree serialization
- Handler registration system

## Testing and Debugging

### Web Worker Mode Debugging
1. Open Chrome DevTools
2. Go to Sources tab
3. Find worker script (e.g., `simple-demo.worker.ts`)
4. Set breakpoints and interact with plugin

### Main Thread Mode Debugging
1. Standard Chrome DevTools debugging
2. Direct access to plugin code and React DevTools

### Performance Testing
- Test both runtime modes for comparison
- Monitor event handling latency
- Check bundle sizes in network tab

## Framework-Specific Notes

### Svelte 5 Requirements
- Always use Svelte 5 syntax (runes, `$props()`, etc.)
- Check `.cursor/rules/svelte5.mdc` for Svelte 5 guidance
- Use modern Svelte patterns over Svelte 4 compatibility

### TypeScript Configuration
- Strict TypeScript setup with `@tsconfig/strictest`
- Type safety across React/Svelte boundary
- RPC type definitions for worker communication

### Build Dependencies
- Node.js >=18 required
- Bun required for plugin worker building
- pnpm for package management (workspace protocol)