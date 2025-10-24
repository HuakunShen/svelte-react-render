# Component Registry System for Svelte

## Goal

Create a **universal component registry** that any Svelte application can install. Host developers register their custom Svelte components (e.g., mapping `"Chart"` to their `<Chart />` component), and then React plugins using these registered component names will automatically render with the host's implementations.

This enables a **plugin marketplace ecosystem** where:
- Plugin developers write React code using a standard API
- Host developers define their own UI implementations
- Plugins work seamlessly across different hosts with different designs

### Vision

```
┌────────────────────────────────────────────────────────┐
│              Plugin Developer (React)                   │
│                                                          │
│  import { Chart, DataGrid } from '@company/plugin-api'  │
│                                                          │
│  export default function AnalyticsPlugin() {            │
│    return (                                             │
│      <div>                                              │
│        <Chart data={sales} type="line" />              │
│        <DataGrid columns={...} data={users} />         │
│      </div>                                             │
│    );                                                   │
│  }                                                       │
└────────────────────────────────────────────────────────┘
                          ↓
                 (via reconciler)
                          ↓
┌────────────────────────────────────────────────────────┐
│           Component Tree (Framework Agnostic)           │
│                                                          │
│  { type: "Chart", props: { data, type }, children }    │
│  { type: "DataGrid", props: { columns, data } }        │
└────────────────────────────────────────────────────────┘
                          ↓
                 (consumed by registry)
                          ↓
┌────────────────────────────────────────────────────────┐
│         Svelte Host App (Registry Consumer)             │
│                                                          │
│  import { registry } from '@react-universal/svelte'     │
│                                                          │
│  // Register custom implementations                     │
│  registry.register('Chart', MyCustomChart)              │
│  registry.register('DataGrid', MyDataGrid)              │
│                                                          │
│  // Now plugins using Chart/DataGrid render with        │
│  // MyCustomChart and MyDataGrid components             │
└────────────────────────────────────────────────────────┘
```

## Use Cases

### 1. Design System Flexibility

Different hosts can provide different UI implementations:

```typescript
// Host A: Material Design
registry.register('Button', MaterialButton);
registry.register('Input', MaterialInput);

// Host B: Fluent Design
registry.register('Button', FluentButton);
registry.register('Input', FluentInput);

// Same plugin works in both, but looks native to each!
```

### 2. Platform-Specific Components

```typescript
// Dashboard App
registry.register('Chart', ApexChartWrapper);
registry.register('Map', MapboxWrapper);

// Data Science App
registry.register('Chart', PlotlyWrapper);
registry.register('Map', LeafletWrapper);
```

### 3. Business Logic Separation

```typescript
// Core components
registry.register('Button', MyButton);
registry.register('Form', MyForm);

// Business-specific components
registry.register('CustomerCard', CustomerCardComponent);
registry.register('OrderTable', OrderTableComponent);

// Plugins can use both!
```

## Architecture

### Package Structure

```
@react-universal/
├── core/                         # Universal reconciler
│   └── [Already exists]
│
├── svelte/                       # Registry for Svelte hosts
│   ├── registry.svelte.ts        # Component registry
│   ├── DynamicRenderer.svelte    # Renders registered components
│   ├── PluginHost.svelte         # Main-thread plugin host
│   └── WorkerPluginHost.svelte   # Worker-based plugin host
│
└── plugin-api/                   # For plugin developers
    ├── components/               # React wrappers for registered components
    ├── types/                    # TypeScript definitions
    └── index.ts                  # Public API
```

## Implementation

### 1. Component Registry

```typescript
// packages/svelte/src/registry.svelte.ts
import type { ComponentType, SvelteComponent } from 'svelte';

export interface ComponentMetadata {
  component: ComponentType;
  propTypes?: Record<string, any>;
  version?: string;
}

class ComponentRegistry {
  private components = new Map<string, ComponentMetadata>();
  
  /**
   * Register a Svelte component for a given type name
   */
  register(
    name: string, 
    component: ComponentType,
    metadata?: Omit<ComponentMetadata, 'component'>
  ): void {
    this.components.set(name, {
      component,
      ...metadata
    });
    console.log(`[Registry] Registered component: ${name}`);
  }
  
  /**
   * Get a registered component
   */
  get(name: string): ComponentType | undefined {
    return this.components.get(name)?.component;
  }
  
  /**
   * Check if a component is registered
   */
  has(name: string): boolean {
    return this.components.has(name);
  }
  
  /**
   * Get metadata for a component
   */
  getMetadata(name: string): ComponentMetadata | undefined {
    return this.components.get(name);
  }
  
  /**
   * Unregister a component
   */
  unregister(name: string): boolean {
    return this.components.delete(name);
  }
  
  /**
   * Get all registered component names
   */
  list(): string[] {
    return Array.from(this.components.keys());
  }
  
  /**
   * Clear all registrations
   */
  clear(): void {
    this.components.clear();
  }
}

// Export singleton instance
export const registry = new ComponentRegistry();

// Also export class for testing/multiple instances
export { ComponentRegistry };
```

### 2. Dynamic Component Renderer

```svelte
<!-- packages/svelte/src/DynamicRenderer.svelte -->
<script lang="ts">
  import { registry } from './registry.svelte';
  import type { ComponentInstance } from '@react-universal/core';
  
  interface Props {
    instance: ComponentInstance;
  }
  
  let { instance }: Props = $props();
  
  // Get registered component
  const Component = registry.get(instance.type);
  
  // Recursively render children
  const children = instance.children;
  
  // Warn if component not registered
  $effect(() => {
    if (!Component && instance.type !== 'div' && instance.type !== 'span') {
      console.warn(`[DynamicRenderer] Component not registered: ${instance.type}`);
    }
  });
</script>

{#if Component}
  <!-- Render registered component -->
  <svelte:component this={Component} {...instance.props}>
    {#each children as child}
      {#if typeof child === 'string'}
        {child}
      {:else}
        <svelte:self instance={child} />
      {/if}
    {/each}
  </svelte:component>
{:else if instance.type === 'div'}
  <!-- Fallback for div -->
  <div {...instance.props}>
    {#each children as child}
      {#if typeof child === 'string'}
        {child}
      {:else}
        <svelte:self instance={child} />
      {/if}
    {/each}
  </div>
{:else}
  <!-- Unknown component fallback -->
  <div class="unknown-component" data-type={instance.type}>
    <div class="unknown-component-warning">
      ⚠️ Unknown component: <code>{instance.type}</code>
    </div>
    {#each children as child}
      {#if typeof child === 'string'}
        {child}
      {:else}
        <svelte:self instance={child} />
      {/if}
    {/each}
  </div>
{/if}

<style>
  .unknown-component {
    border: 2px dashed #ff6b6b;
    padding: 1rem;
    background: #fff5f5;
  }
  
  .unknown-component-warning {
    color: #c92a2a;
    font-size: 0.875rem;
    margin-bottom: 0.5rem;
  }
  
  code {
    background: #ffebee;
    padding: 0.125rem 0.25rem;
    border-radius: 0.25rem;
    font-family: monospace;
  }
</style>
```

### 3. Enhanced Plugin Host

```svelte
<!-- packages/svelte/src/PluginHost.svelte -->
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { createRenderer, render } from '@react-universal/core';
  import DynamicRenderer from './DynamicRenderer.svelte';
  import type { ReactElement } from 'react';
  import type { ComponentInstance } from '@react-universal/core';
  
  interface Props {
    plugin: ReactElement;
  }
  
  let { plugin }: Props = $props();
  
  let rootInstance = $state<ComponentInstance | null>(null);
  let bridge = $state<any>(null);
  let unsubscribe: (() => void) | null = null;
  
  onMount(() => {
    // Create renderer bridge
    bridge = createRenderer();
    
    // Subscribe to updates
    unsubscribe = bridge.subscribe(() => {
      rootInstance = bridge.rootInstance;
    });
    
    // Initial render
    render(plugin, bridge);
  });
  
  // Watch for plugin changes
  $effect(() => {
    if (bridge && plugin) {
      render(plugin, bridge);
    }
  });
  
  onDestroy(() => {
    if (unsubscribe) {
      unsubscribe();
    }
  });
</script>

<div class="plugin-host">
  {#if rootInstance}
    <DynamicRenderer instance={rootInstance} />
  {:else}
    <div class="loading">
      Loading plugin...
    </div>
  {/if}
</div>

<style>
  .plugin-host {
    width: 100%;
    height: 100%;
  }
  
  .loading {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    color: #868e96;
  }
</style>
```

### 4. Plugin API Package

```typescript
// packages/plugin-api/src/index.ts
import { createElement } from 'react';

// Define component prop types
export interface ChartProps {
  data: Array<{ x: number | string; y: number }>;
  type: 'line' | 'bar' | 'pie' | 'scatter';
  title?: string;
  height?: number;
  width?: number;
  onPointClick?: (point: any) => void;
}

export function Chart(props: ChartProps): JSX.Element {
  return createElement('Chart', props);
}

export interface DataGridProps {
  columns: Array<{
    field: string;
    header: string;
    width?: number;
    sortable?: boolean;
  }>;
  data: any[];
  onRowClick?: (row: any) => void;
  onSort?: (field: string, direction: 'asc' | 'desc') => void;
  loading?: boolean;
}

export function DataGrid(props: DataGridProps): JSX.Element {
  return createElement('DataGrid', props);
}

export interface MapProps {
  center: { lat: number; lng: number };
  zoom?: number;
  markers?: Array<{ lat: number; lng: number; label?: string }>;
  onMarkerClick?: (marker: any) => void;
}

export function Map(props: MapProps): JSX.Element {
  return createElement('Map', props);
}

// Export all component types
export type { ChartProps, DataGridProps, MapProps };
```

## Usage Examples

### Host Application Setup

```svelte
<!-- App.svelte -->
<script lang="ts">
  import { registry, PluginHost } from '@react-universal/svelte';
  import { onMount } from 'svelte';
  
  // Import custom components
  import MyChart from './components/MyChart.svelte';
  import MyDataGrid from './components/MyDataGrid.svelte';
  import MyMap from './components/MyMap.svelte';
  import MyButton from './components/MyButton.svelte';
  
  // Plugin URL
  let pluginUrl = 'https://cdn.example.com/plugins/analytics.js';
  
  onMount(() => {
    // Register custom implementations
    registry.register('Chart', MyChart);
    registry.register('DataGrid', MyDataGrid);
    registry.register('Map', MyMap);
    registry.register('Button', MyButton);
    
    console.log('Registered components:', registry.list());
  });
</script>

<div class="app">
  <h1>Analytics Dashboard</h1>
  <PluginHost {pluginUrl} />
</div>
```

### Plugin Development

```tsx
// analytics-plugin.tsx
import { useState, useEffect } from 'react';
import { Chart, DataGrid, Button } from '@company/plugin-api';

export default function AnalyticsPlugin() {
  const [data, setData] = useState([]);
  const [timeRange, setTimeRange] = useState('7d');
  
  useEffect(() => {
    fetchData(timeRange).then(setData);
  }, [timeRange]);
  
  return (
    <div className="analytics-plugin">
      <div className="controls">
        <Button onClick={() => setTimeRange('7d')}>
          Last 7 Days
        </Button>
        <Button onClick={() => setTimeRange('30d')}>
          Last 30 Days
        </Button>
      </div>
      
      <Chart 
        data={data}
        type="line"
        title="Revenue Over Time"
        onPointClick={(point) => console.log(point)}
      />
      
      <DataGrid
        columns={[
          { field: 'date', header: 'Date' },
          { field: 'revenue', header: 'Revenue' },
          { field: 'users', header: 'Users' }
        ]}
        data={data}
        onRowClick={(row) => console.log(row)}
      />
    </div>
  );
}
```

### Custom Component Implementation

```svelte
<!-- MyChart.svelte -->
<script lang="ts">
  import ApexChart from 'svelte-apexcharts';
  import type { ChartProps } from '@company/plugin-api';
  
  let { 
    data, 
    type, 
    title, 
    height = 400, 
    width,
    onPointClick 
  }: ChartProps = $props();
  
  const options = {
    chart: {
      type,
      height,
      width,
      events: {
        dataPointSelection: (event, chartContext, config) => {
          if (onPointClick) {
            onPointClick(data[config.dataPointIndex]);
          }
        }
      }
    },
    title: {
      text: title
    }
  };
</script>

<div class="chart-container">
  <ApexChart {options} series={[{ data }]} />
</div>
```

## Advanced Features

### 1. Type Generation

Generate TypeScript types from registered components:

```typescript
// tools/generate-types.ts
import { registry } from '@react-universal/svelte';

function generateTypes() {
  const components = registry.list();
  
  let types = `declare module '@company/plugin-api' {\n`;
  
  components.forEach(name => {
    const metadata = registry.getMetadata(name);
    types += `  export function ${name}(props: ${name}Props): JSX.Element;\n`;
  });
  
  types += `}\n`;
  
  return types;
}
```

### 2. Component Validation

```typescript
// Validate props at registration time
registry.register('Chart', ChartComponent, {
  propTypes: {
    data: { type: 'array', required: true },
    type: { type: 'enum', values: ['line', 'bar', 'pie'] },
    title: { type: 'string', required: false }
  }
});
```

### 3. Lazy Loading

```typescript
// Register with lazy loading
registry.register('Chart', async () => {
  const module = await import('./components/HeavyChart.svelte');
  return module.default;
});
```

### 4. Scoped Registries

```typescript
// Create isolated registry for specific use cases
const dashboardRegistry = new ComponentRegistry();
dashboardRegistry.register('Chart', DashboardChart);

const reportRegistry = new ComponentRegistry();
reportRegistry.register('Chart', ReportChart);
```

## Technical Feasibility

### ✅ Highly Feasible

**Reasons:**

1. **Foundation exists** - 90% of the code is already written
2. **Simple addition** - Registry is ~100 lines of code
3. **Proven pattern** - Used by React Native, Capacitor, WordPress
4. **No breaking changes** - Additive feature to existing system

### Implementation Effort

| Component | Estimated Time | Complexity |
|-----------|---------------|------------|
| Registry Core | 2-3 hours | Low |
| DynamicRenderer | 3-4 hours | Medium |
| Documentation | 4-6 hours | Low |
| Testing | 6-8 hours | Medium |
| Examples | 4-6 hours | Low |
| **Total** | **~2 days** | **Low-Medium** |

## Benefits

### For Host Developers

✅ **Full control** - Define custom component implementations  
✅ **Brand consistency** - Use your design system  
✅ **Flexibility** - Swap implementations without changing plugins  
✅ **Performance** - Optimize components for your use case  
✅ **Business logic** - Inject domain-specific components  

### For Plugin Developers

✅ **Simple API** - Just use components like normal React  
✅ **No UI concerns** - Host handles all rendering  
✅ **Wide compatibility** - Plugins work across all hosts  
✅ **Type safety** - Full TypeScript support  
✅ **Familiar tools** - Standard React workflow  

### For Platform

✅ **Plugin marketplace** - Enable ecosystem growth  
✅ **Network effects** - More plugins → more value  
✅ **Differentiation** - Unique plugin architecture  
✅ **Developer adoption** - Easy to build plugins  
✅ **Monetization** - Paid plugins, premium features  

## Comparison with Alternatives

### vs. Direct React Rendering

**Registry Approach:**
- ✅ Host controls UI
- ✅ Consistent design system
- ✅ Platform-specific optimizations
- ❌ Additional abstraction layer

**Direct React:**
- ✅ Simpler for plugin devs
- ❌ Host loses control
- ❌ Inconsistent UI across plugins
- ❌ Limited to web

### vs. Web Components

**Registry Approach:**
- ✅ Framework-specific optimizations
- ✅ Full ecosystem integration
- ✅ Type safety
- ❌ Framework-specific

**Web Components:**
- ✅ Framework-agnostic
- ❌ Limited integration
- ❌ Performance overhead
- ❌ Weak TypeScript support

## Migration Path

### Phase 1: Build Registry (Week 1)

1. Create registry package
2. Implement DynamicRenderer
3. Add to existing PluginHost
4. Write tests

### Phase 2: Documentation (Week 2)

1. Host developer guide
2. Plugin developer guide
3. Component API reference
4. Migration guide

### Phase 3: Ecosystem (Month 2)

1. Build example components
2. Create plugin templates
3. Community showcase
4. Plugin marketplace MVP

## Real-World Inspiration

### WordPress Block Editor

```javascript
// Register custom block
registerBlockType('my-plugin/chart', {
  edit: ChartEdit,
  save: ChartSave
});
```

### VS Code Extensions

```typescript
// Register custom views
vscode.window.registerTreeDataProvider('myView', provider);
```

### Capacitor Plugins

```typescript
// Register native plugins
import { Plugins } from '@capacitor/core';
Plugins.MyPlugin.register();
```

## Next Steps

1. **Build prototype** - Implement registry in current codebase
2. **Create examples** - Show different host implementations
3. **Write docs** - Comprehensive guides for both audiences
4. **Community feedback** - Share with early adopters
5. **Publish packages** - Make available on npm

## Conclusion

**This is not just feasible—it's a natural extension of your current architecture.**

The component registry system would:
- Take ~2 days to implement
- Unlock massive ecosystem potential
- Enable platform differentiation
- Provide host flexibility while maintaining plugin simplicity

The technical foundation is solid, the pattern is proven, and the market opportunity is significant. This could be the key differentiator that makes your platform the go-to choice for plugin-based applications.

