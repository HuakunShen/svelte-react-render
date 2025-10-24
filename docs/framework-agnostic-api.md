# Framework-Agnostic Plugin API

## Goal

Create a universal React plugin API that can be used across **any frontend framework** - Svelte, Vue, Angular, React, and even native platforms like Swift AppKit. Plugin developers write React code once using the API, and host applications built with any framework can render these plugins using their native components.

### Vision

```
┌──────────────────────────────────────────────────────────┐
│           Plugin Developer Experience                     │
│                                                            │
│  Write once in React:                                     │
│  import { Button, Input, Chart } from '@universal/api'    │
│                                                            │
│  export default function MyPlugin() {                     │
│    return <div>                                           │
│      <Chart data={...} />                                 │
│      <Button onClick={...}>Click</Button>                 │
│    </div>                                                 │
│  }                                                         │
└──────────────────────────────────────────────────────────┘
                           ↓
                 (via React Reconciler)
                           ↓
┌──────────────────────────────────────────────────────────┐
│         Universal Component Tree (JSON)                   │
│                                                            │
│  {                                                         │
│    type: "Chart",                                         │
│    props: { data: [...] },                               │
│    children: [...]                                        │
│  }                                                         │
└──────────────────────────────────────────────────────────┘
                           ↓
                  (consumed by any framework)
                           ↓
┌──────────────────────────────────────────────────────────┐
│  Svelte Host    Vue Host    Angular Host    AppKit Host  │
│  <Chart />      <Chart>     <app-chart>     Chart()      │
└──────────────────────────────────────────────────────────┘
```

## Current Architecture Analysis

### What's Already Framework-Agnostic

The current `@svelte-react-render/api` package is **95% framework-agnostic**:

#### 1. Core Reconciler (✅ Universal)

```typescript
// packages/api/src/reconciler/renderer.ts
import ReactReconciler from 'react-reconciler';
import { hostConfig } from './host-config';

const reconciler = ReactReconciler(hostConfig);

export function createRenderer() {
  const bridge = createRenderBridge();
  return { ...bridge, _container: undefined };
}

export function render(element: React.ReactElement, bridge) {
  // React reconciler outputs pure data structure
}
```

**Analysis**: No framework-specific code. Pure React Reconciler.

#### 2. Component Tree Output (✅ Universal)

```typescript
// packages/api/src/reconciler/types.ts
export interface SvelteComponentInstance { // Misleading name!
  type: string;              // Component type (e.g., "Button")
  props: Record<string, any>; // Serializable props
  children: (SvelteComponentInstance | string)[]; // Recursive tree
  id: string;                // Unique identifier
  parent: SvelteComponentInstance | null;
}
```

**Analysis**: Plain JavaScript object - no Svelte dependency. This is just a JSON-serializable tree structure.

#### 3. Bridge Interface (✅ Universal)

```typescript
// packages/api/src/reconciler/bridge.ts
export interface SimpleRenderBridge {
  rootInstance: ComponentInstance | null;
  subscribers: Set<() => void>;
  subscribe: (callback: () => void) => () => void;
  update: () => void;
}
```

**Analysis**: Pure pub/sub pattern. No framework coupling.

### What Needs to Change

Only **naming and packaging** need adjustment:

1. **Rename types** - `SvelteComponentInstance` → `ComponentInstance`
2. **Package name** - Consider more universal naming
3. **Documentation** - Clarify framework agnosticism

## Solution: Universal Architecture

### Package Structure

```
@react-universal/
├── core/                          # Universal reconciler
│   ├── reconciler/                # React reconciler
│   ├── types/                     # ComponentInstance, Bridge types
│   └── bridge/                    # Pub/sub bridge
│
├── adapters/                      # Framework-specific renderers
│   ├── svelte/                    # @react-universal/svelte
│   ├── vue/                       # @react-universal/vue
│   ├── angular/                   # @react-universal/angular
│   └── appkit/                    # @react-universal/appkit
│
└── plugin-api/                    # Plugin developer API
    ├── components/                # React wrapper components
    └── types/                     # TypeScript definitions
```

### Implementation Examples

#### Svelte Adapter

```svelte
<!-- @react-universal/svelte -->
<script lang="ts">
  import type { ComponentInstance } from '@react-universal/core';
  
  let { instance }: { instance: ComponentInstance } = $props();
  
  // Map component types to Svelte components
  const componentMap = {
    'Button': Button,
    'Input': Input,
    'Chart': Chart,
  };
  
  const Component = componentMap[instance.type];
</script>

{#if Component}
  <svelte:component this={Component} {...instance.props}>
    {#each instance.children as child}
      {#if typeof child === 'string'}
        {child}
      {:else}
        <svelte:self instance={child} />
      {/if}
    {/each}
  </svelte:component>
{/if}
```

#### Vue Adapter

```vue
<!-- @react-universal/vue -->
<template>
  <component 
    :is="componentMap[instance.type]" 
    v-bind="instance.props"
  >
    <ComponentRenderer 
      v-for="child in instance.children" 
      :instance="child" 
    />
  </component>
</template>

<script setup lang="ts">
import type { ComponentInstance } from '@react-universal/core';
import Button from './components/Button.vue';
import Input from './components/Input.vue';

const props = defineProps<{
  instance: ComponentInstance;
}>();

const componentMap = {
  'Button': Button,
  'Input': Input,
};
</script>
```

#### Swift/AppKit Adapter

```swift
// @react-universal/appkit
import AppKit

class ComponentRenderer {
  func render(instance: ComponentInstance) -> NSView {
    switch instance.type {
    case "Button":
      let button = NSButton()
      button.title = instance.props["title"] as? String ?? ""
      button.target = self
      button.action = #selector(handleAction)
      return button
      
    case "Input":
      let textField = NSTextField()
      textField.placeholderString = instance.props["placeholder"] as? String
      return textField
      
    case "Chart":
      return ChartView(data: instance.props["data"])
      
    default:
      return NSView() // Unknown component
    }
  }
}
```

### Host Integration Interface

Every adapter must implement:

```typescript
// @react-universal/core/types
export interface HostAdapter {
  // Render a component instance
  render(instance: ComponentInstance): FrameworkComponent;
  
  // Subscribe to updates
  subscribe(callback: () => void): () => void;
  
  // Handle prop updates
  updateProps(instance: ComponentInstance, newProps: any): void;
  
  // Handle event callbacks
  executeHandler(handlerId: string, ...args: any[]): Promise<void>;
}
```

## Real-World Examples

This pattern is proven by successful projects:

### 1. Raycast (React → macOS AppKit)

```
React Plugin Code
      ↓
Custom Reconciler
      ↓
Component Tree
      ↓
AppKit Renderer (Swift)
      ↓
Native macOS UI
```

**Result**: $400M+ valuation, 1000+ plugins

### 2. React Native (React → iOS/Android)

```
React Code
      ↓
React Native Reconciler
      ↓
Native Component Tree
      ↓
iOS: UIKit, Android: Android Views
      ↓
Native Mobile UI
```

**Result**: Most popular cross-platform framework

### 3. Remotion (React → Video)

```
React Code
      ↓
Custom Reconciler
      ↓
Frame Tree
      ↓
Video Renderer
      ↓
MP4 Video
```

**Result**: Production-grade video from React

## Technical Feasibility

### ✅ Completely Feasible

**Reasons:**

1. **React Reconciler is designed for this** - It outputs data, not DOM
2. **No framework coupling** - Current code has zero Svelte dependencies
3. **Proven pattern** - Multiple successful implementations exist
4. **Simple adapter pattern** - Each framework just needs a renderer
5. **Already working** - 95% of the code is ready

### Challenges & Solutions

#### Challenge 1: Type Safety Across Boundaries

**Problem**: How do plugin developers get types for custom components?

**Solution**: TypeScript declaration generation

```typescript
// Generated types from component definitions
declare module '@your-company/plugin-api' {
  export interface ChartProps {
    data: Array<{ x: number; y: number }>;
    type: 'line' | 'bar';
  }
  
  export function Chart(props: ChartProps): JSX.Element;
}
```

#### Challenge 2: Event Handler Serialization

**Problem**: Functions can't be serialized

**Solution**: Already solved! Handler ID registration

```typescript
// Worker: Register handler
const handlerId = registerHandler(onClick);
props._onClickHandlerId = handlerId;

// Host: Create proxy
onClick: async () => {
  await rpc.executeHandler(handlerId);
}
```

#### Challenge 3: Platform-Specific Features

**Problem**: Some platforms have unique capabilities (e.g., AppKit window management)

**Solution**: Platform-specific extensions

```typescript
// Base API (works everywhere)
import { Button, Input } from '@react-universal/api';

// Platform extensions (optional)
import { Window, Menu } from '@react-universal/api/appkit';
```

#### Challenge 4: Component Protocol Versioning

**Problem**: Plugin built with v1, host uses v2

**Solution**: Semantic versioning + compatibility checks

```typescript
// API package exports version
export const PROTOCOL_VERSION = '1.0.0';

// Host checks compatibility
if (!isCompatible(plugin.protocolVersion, HOST_VERSION)) {
  throw new Error('Incompatible plugin version');
}
```

## Migration Path

### Phase 1: Refactor Current Package (Week 1)

1. Rename types (`SvelteComponentInstance` → `ComponentInstance`)
2. Extract core reconciler to separate package
3. Move Svelte-specific code to adapter package
4. Update documentation

### Phase 2: Create Additional Adapters (Week 2-3)

1. Build Vue adapter (prove pattern works)
2. Document adapter interface
3. Create adapter template/boilerplate

### Phase 3: Community & Ecosystem (Month 2-3)

1. Publish packages to npm
2. Create documentation site
3. Build example plugins for each platform
4. Community adapters (Angular, React, etc.)

## Benefits

### For Plugin Developers

✅ **Write once, run anywhere** - Single React codebase  
✅ **Familiar API** - Standard React + hooks  
✅ **Type safety** - Full TypeScript support  
✅ **Large ecosystem** - npm packages work  
✅ **Better tools** - React DevTools, linters  

### For Host Developers

✅ **Plugin ecosystem** - Leverage React plugin community  
✅ **Native performance** - Render with native components  
✅ **Full control** - Define custom component implementations  
✅ **Framework choice** - Use Svelte, Vue, Angular, etc.  
✅ **Security** - Sandboxed plugin execution  

### For Platform

✅ **Market differentiation** - Unique plugin architecture  
✅ **Network effects** - More plugins → more users  
✅ **Developer adoption** - React is widely known  
✅ **Monetization** - Plugin marketplace potential  
✅ **Community growth** - Open ecosystem  

## Recommended Next Steps

1. **Validate with Vue adapter** - Prove it works beyond Svelte
2. **Define stable protocol** - Lock down ComponentInstance interface
3. **Create adapter template** - Make it easy to add new frameworks
4. **Build showcase** - Demo same plugin on multiple frameworks
5. **Publish packages** - Start with `@react-universal` scope

## References

- [React Reconciler Documentation](https://github.com/facebook/react/tree/main/packages/react-reconciler)
- [Raycast Blog: How Extensions Work](https://www.raycast.com/blog/how-raycast-api-extensions-work)
- [React Native Architecture](https://reactnative.dev/architecture/overview)
- [Custom React Renderer Tutorial](https://agent-hunt.medium.com/hello-world-custom-react-renderer-9a95b7cd04bc)

## Conclusion

**This is not just feasible—it's the natural evolution of your architecture.** 

Your current implementation is already 95% framework-agnostic. With minimal refactoring (mostly naming and packaging), you can create a truly universal React plugin API that works across any platform.

The technical foundation is solid, the pattern is proven, and the market opportunity is significant.

