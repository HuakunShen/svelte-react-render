# Triple Mode Architecture

## Overview

The Svelte-React plugin system now supports **three distinct runtime modes**, providing flexibility for different use cases from development to production. Each mode offers different trade-offs between performance, security, and development experience.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Triple Runtime Modes                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ⚡ Web Worker        🖥️ Node.js        🧵 Main Thread        │
│  (Sandboxed)         (WebSocket)       (Direct Import)        │
│                                                             │
│  Browser             Node.js           Browser                │
│  ┌─────────────┐     ┌─────────────┐   ┌──────────────┐      │
│  │ Blob Worker│     │ WebSocket   │   │ Direct     │      │
│  │ + React    │     │ Server      │   │ Import      │      │
│  │ + API      │     │ + React     │   │ + React     │      │
│  └─────────────┘     └─────────────┘   └──────────────┘      │
│         ↕ RPC                ↕ WebSocket               │
│  Shared Runtime Logic (95% code reuse across all modes)      │
└─────────────────────────────────────────────────────────────┘
```

## Runtime Modes

### 1. Web Worker Mode (⚡ Sandbox)

**Use When:**
- Production applications requiring plugin isolation
- Loading untrusted third-party plugins
- Building plugin marketplaces
- Security is critical

**Characteristics:**
- **Security**: High - plugins run in isolated Web Workers
- **Performance**: Medium - ~5-10ms RPC latency
- **Flexibility**: High - Load plugins from any URL
- **Debugging**: Medium - Chrome DevTools worker debugging
- **Isolation**: Complete - No access to main thread or Node.js APIs

**Implementation:**
```
Browser → fetch() → Blob Worker → React Plugin → RPC → Svelte Components
```

### 2. Node.js WebSocket Mode (🖥️ Server Runtime)

**Use When:**
- Building Raycast-like applications
- Need Node.js API access (fs, network, databases)
- Want server-side plugin execution
- Building plugin hot-reloading systems
- Production applications with centralized plugin management

**Characteristics:**
- **Security**: High - plugins run in server environment
- **Performance**: Medium - ~5-10ms WebSocket latency
- **Flexibility**: High - Full Node.js ecosystem access
- **Debugging**: Good - Server logs + browser console
- **Isolation**: Good - Server process isolation
- **Scalability**: Excellent - Multiple clients per server

**Implementation:**
```
Browser → WebSocket → Node.js Server → React Plugin → WebSocket RPC → Svelte Components
```

### 3. Main Thread Mode (🧵 Direct)

**Use When:**
- Development and prototyping
- Trusted plugin code
- Maximum performance required
- Rapid iteration workflows
- Plugin development and debugging

**Characteristics:**
- **Security**: Low - Plugins run in main thread
- **Performance**: High - <1ms event handling
- **Flexibility**: Medium - Limited to browser APIs
- **Debugging**: Excellent - Direct browser DevTools access
- **Isolation**: None - Shared execution context
- **Development Speed**: Fastest - Direct feedback loop

**Implementation:**
```
Browser → import() → React Plugin → Direct Reconciler → Svelte Components
```

## Shared Architecture

### Code Reuse

The system achieves **95% code reuse** across all three modes through:

1. **Shared Plugin Runtime** (`shared-plugin-runtime.ts`)
   - Plugin initialization logic
   - Component serialization
   - Event handling
   - State management

2. **Common API Components** (`@svelte-react-render/api`)
   - Button, Input, Switch, Toggle, Form components
   - Identical component interface across modes
   - Same styling and behavior

3. **Unified RPC Interfaces**
   - Standardized communication protocols
   - Same method signatures across modes
   - Consistent error handling

### Component Flow

All three modes follow the same high-level flow:

```
React Plugin → Custom Reconciler → Component Tree → Serialization → Transport → Svelte Components
     ↑                ↑                ↑                ↑              ↑
  Mode-specific   Mode-specific    Universal     Mode-specific   Universal
   Execution     Reconciler      Serialization  Transport      Rendering
```

## Communication Patterns

### RPC Interfaces

All modes implement the same RPC interface:

```typescript
// Exposed by Plugin Runtime
interface WorkerAPI {
  initialize(props?: any): Promise<void>;
  updateProps(props: any): Promise<void>;
  executeHandler(handlerId: string, ...args: any[]): Promise<void>;
  destroy(): Promise<void>;
}

// Exposed by Host Runtime
interface MainThreadAPI {
  updateComponentTree(tree: SerializedComponentTree | null): void;
  logMessage(level: 'log' | 'warn' | | 'error' | 'info', ...args: any[]): void;
}
```

### Event Handling

**Function Serialization:** All modes serialize event handlers for transport:

```typescript
// React Plugin (all modes)
onClick={() => setCount(count + 1)}

// Becomes
onClick: "handler_12345"

// Handler registered on server/worker and called via RPC
```

## Performance Comparison

| Metric | Web Worker | Node.js WebSocket | Main Thread |
|--------|------------|-------------------|-------------|
| **Initial Load** | 100-200ms | 50-100ms | 10-20ms |
| **Event Latency** | 5-10ms | 5-10ms | <1ms |
| **Bundle Size** | 379KB total | 253KB main | 253KB main |
| **Security** | High | High | Low |
| **Isolation** | Complete | Process | None |
| **Hot Reload** | No | Yes | Yes |

## Migration Guide

### From Web Worker to Node.js

1. **Replace Host Component:**
   ```typescript
   // From
   import WorkerPluginHost from './WorkerPluginHost.svelte';

   // To
   import WebSocketPluginHost from './WebSocketPluginHost.svelte';
   ```

2. **Update Connection URL:**
   ```typescript
   // From
   pluginUrl = 'http://localhost:3000/plugin.js'

   // To
   serverUrl = 'server:ws://localhost:3001'
   ```

3. **Start Node.js Servers:**
   ```bash
   # Instead of Web Worker build server
   pnpm server:simple  # Port 3001
   pnpm server:advanced # Port 3002
   ```

### From Main Thread to Node.js

1. **Replace Host Component:** (same as above)
2. **Remove Direct Imports:**
   ```typescript
   // Remove
   import MyPlugin from '@my-org/my-plugin';

   // Node.js server handles imports
   ```
3. **Update Props Passing:**
   ```typescript
   // From
   <PluginHost plugin={MyPlugin} />

   // To
   <WebSocketPluginHost serverUrl="ws://localhost:3001" />
   ```

## Best Practices

### Mode Selection

- **Development**: Start with Main Thread mode for fastest iteration
- **Testing**: Use Node.js mode to test WebSocket communication
- **Production**: Choose based on security requirements
  - Untrusted plugins → Web Worker
  - Trusted plugins with Node.js needs → Node.js WebSocket
  - Performance-critical trusted plugins → Main Thread

### Plugin Development

1. **Write Framework-Agnostic Code:**
   ```typescript
   // ✅ Good - Works in all modes
   const [value, setValue] = useState('');

   // ❌ Avoid - Browser-specific APIs
   window.location.reload();

   // ✅ Use API components instead
   <Button onClick={() => console.log('clicked')} />
   ```

2. **Test in All Modes:**
   ```bash
   # Test plugin compatibility
   pnpm dev                    # Worker mode
   pnpm server && pnpm dev # Node.js mode
   # Main thread mode (no setup needed)
   ```

3. **Handle Loading States:**
   ```typescript
   // Provide loading UI for all modes
   const [loading, setLoading] = useState(true);

   // All modes support async initialization
   useEffect(() => {
     initializePlugin().then(() => setLoading(false));
   }, []);
   ```

### Error Handling

1. **Network Errors:**
   ```typescript
   // WebSocket and Worker modes
   try {
     await rpc.getAPI().initialize();
   } catch (error) {
     setError('Connection failed');
   }
   ```

2. **Plugin Errors:**
   ```typescript
   // All modes support error logging
   rpc.getAPI().logMessage('error', 'Plugin failed:', error);
   ```

3. **Graceful Degradation:**
   ```typescript
   // Fallback to alternative mode if connection fails
   if (mode === 'nodejs' && !connected) {
     setMode('main-thread');
   }
   ```

## Advanced Usage

### Mode Switching

The system supports seamless mode switching:

```typescript
// User can switch modes without page reload
const [mode, setMode] = useState<'worker' | 'nodejs' | 'main-thread'>('worker');

// Component automatically re-renders with new mode
{mode === 'worker' && <WorkerPluginHost url={workerUrl} />}
{mode === 'nodejs' && <WebSocketPluginHost url={nodeUrl} />}
{mode === 'main-thread' && <PluginHost plugin={plugin} />}
```

### Multi-Plugin Architecture

```typescript
// Each plugin can run in different modes
const plugins = [
  { id: 'chart', component: ChartPlugin, mode: 'nodejs', url: 'ws://localhost:3001' },
  { id: 'form', component: FormPlugin, mode: 'worker', url: 'http://localhost:3000/form.js' },
  { id: 'settings', component: SettingsPlugin, mode: 'main-thread', component: Settings }
];
```

### Hybrid Security Model

```typescript
// Mix security levels based on plugin trust
const trustedPlugins = ['settings', 'user-profile'];  // Main thread
const untrustedPlugins = ['third-party-widget'];   // Web Worker
const nodePlugins = ['data-analytics'];            // Node.js (with validation)
```

## Future Extensions

The triple-mode architecture enables several future enhancements:

1. **Dynamic Mode Selection**: Automatically choose optimal mode based on plugin characteristics
2. **Mode-Specific Optimizations**: Optimize component serialization per mode
3. **Cross-Mode Communication**: Allow plugins in different modes to communicate
4. **Load Balancing**: Distribute plugins across multiple Node.js servers
5. **Plugin Permissions**: Fine-grained control over plugin capabilities per mode

## Conclusion

The triple-mode architecture provides maximum flexibility for different use cases while maintaining high code reuse and consistent developer experience. Whether you need the security of Web Workers, the power of Node.js, or the performance of direct execution, the system has a mode optimized for your needs.