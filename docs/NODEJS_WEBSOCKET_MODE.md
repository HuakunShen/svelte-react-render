# Node.js WebSocket Mode

## Overview

The Node.js WebSocket mode provides a Raycast-like architecture where React plugins run in a Node.js server environment and communicate with the browser via WebSocket. This mode combines the security benefits of server-side execution with the flexibility of web-based UI rendering.

## Architecture

```
Browser (Svelte) ↔ WebSocket ↔ Node.js Server ↔ React Plugin ↔ Svelte UI
```

### Key Components

1. **Node.js WebSocket Servers** (`simple-demo.server.ts`, `advanced-demo.server.ts`)
   - Run on ports 3001 (Simple) and 3002 (Advanced)
   - Execute React plugins in Node.js environment
   - Handle WebSocket connections from browser clients
   - Use kkrpc for bidirectional RPC communication

2. **Browser WebSocket Client** (`WebSocketPluginHost.svelte`)
   - Connects to Node.js servers via WebSocket
   - Handles reconnection and error recovery
   - Renders received component trees with Svelte

3. **Shared Plugin Runtime** (`shared-plugin-runtime.ts`)
   - 95% code reuse between Web Worker and Node.js modes
   - Common plugin initialization, execution, and serialization logic
   - Event handling and state management

## Communication Flow

1. **Connection Establishment**
   ```
   Browser → WebSocket.connect() → Node.js Server
   Browser → RPC.initialize() → Server → React Plugin
   ```

2. **Component Rendering**
   ```
   React Plugin → Component Tree → Serialization → WebSocket → Browser → Svelte Components
   ```

3. **Event Handling**
   ```
   User Interaction → Svelte Event → WebSocket RPC → Server → React Event Handler
   ```

## Getting Started

### 1. Start Node.js Servers

```bash
cd packages/plugin-example
pnpm server
# Starts both simple-demo (3001) and advanced-demo (3002) servers
```

Or start individually:
```bash
pnpm server:simple  # Port 3001
pnpm server:advanced # Port 3002
```

### 2. Start Browser Application

```bash
cd packages/demo-sveltekit
pnpm dev  # http://localhost:5173
```

### 3. Use Node.js Mode

1. Open http://localhost:5173
2. Click the **"🖥️ Node.js"** runtime mode button
3. Select Simple Demo or Advanced Demo
4. Interact with the React components

## API Reference

### Server Side (Node.js)

#### RPC Methods Exposed by Server

```typescript
interface WorkerAPI {
  initialize(props?: any): Promise<void>;
  updateProps(props: any): Promise<void>;
  executeHandler(handlerId: string, ...args: any[]): Promise<void>;
  destroy(): Promise<void>;
}
```

#### Server Implementation

```typescript
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { RPCChannel, WebSocketServerIO } from 'kkrpc';
import { createPluginRuntimeState, createPluginAPI } from './shared-plugin-runtime';
import YourPlugin from './your-plugin';

const server = createServer();
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  const io = new WebSocketServerIO(ws);
  const state = createPluginRuntimeState();

  const rpc = new RPCChannel<WorkerAPI, MainThreadAPI>(io, {
    expose: createPluginAPI(state, YourPlugin, io, '[Server]')
  });

  state.rpcChannel = rpc;
});

server.listen(3001);
```

### Client Side (Browser)

#### RPC Methods Exposed by Browser

```typescript
interface MainThreadAPI {
  updateComponentTree(tree: SerializedComponentTree | null): void;
  logMessage(level: 'log' | 'warn' | 'error' | 'info', ...args: any[]): void;
}
```

#### Client Implementation

```typescript
import { RPCChannel, WebSocketClientIO } from 'kkrpc';

const ws = new WebSocket('ws://localhost:3001');
const io = new WebSocketClientIO(ws);

const rpc = new RPCChannel<MainThreadAPI, WorkerAPI>(io, {
  expose: {
    updateComponentTree(tree) {
      // Render component tree with Svelte
    },
    logMessage(level, ...args) {
      console[level]('[Plugin]', ...args);
    }
  }
});

// Initialize plugin
await rpc.getAPI().initialize();
```

## Shared Plugin Runtime

### Creating Plugins

```typescript
// plugin-component.tsx
import { useState } from 'react';
import { Button, Input } from '@svelte-react-render/api';

export default function MyPlugin() {
  const [count, setCount] = useState(0);
  const [text, setText] = useState('');

  return (
    <div className="p-4 space-y-4">
      <Input
        label="Enter text"
        value={text}
        onChange={setText}
      />
      <Button
        title={`Clicked ${count} times`}
        onClick={() => setCount(count + 1)}
      />
    </div>
  );
}
```

### Server Implementation

```typescript
// plugin.server.ts
import { createPluginRuntimeState, createPluginAPI } from './shared-plugin-runtime';
import MyPlugin from './plugin-component';

const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  const io = new WebSocketServerIO(ws);
  const state = createPluginRuntimeState();

  const rpc = new RPCChannel<WorkerAPI, MainThreadAPI>(io, {
    expose: createPluginAPI(state, MyPlugin, io, '[Server]')
  });

  state.rpcChannel = rpc;
});
```

## Configuration

### Environment Variables

```bash
# Server ports (can be overridden)
SIMPLE_PLUGIN_PORT=3001
ADVANCED_PLUGIN_PORT=3002

# WebSocket settings
WEBSOCKET_PING_INTERVAL=30000
WEBSOCKET_MAX_RECONNECT_ATTEMPTS=5
```

### Server Options

```typescript
const server = createServer();
const wss = new WebSocketServer({
  server,
  path: '/plugins', // Optional WebSocket path
  perMessageDeflate: false // Disable compression for lower latency
});
```

## Security Considerations

### Input Validation

- Validate all incoming props and event arguments
- Sanitize user input before processing in React components
- Implement rate limiting for WebSocket connections

### Plugin Sandboxing

- Run plugins in isolated Node.js processes if needed
- Limit access to Node.js APIs (fs, network, etc.)
- Implement resource limits (memory, CPU)

### WebSocket Security

```typescript
// Validate WebSocket origins
wss.on('connection', (ws, req) => {
  const origin = req.headers.origin;
  if (!ALLOWED_ORIGINS.includes(origin)) {
    ws.close(1008, 'Unauthorized origin');
    return;
  }
  // ... rest of connection logic
});
```

## Performance

### Benchmarks

| Operation | Latency | Notes |
|-----------|---------|-------|
| Initial connection | 50-100ms | WebSocket handshake |
| Component render | 5-10ms | Serialization + WebSocket |
| Event handling | 5-10ms | Round-trip WebSocket RPC |
| Reconnection | 1000-30000ms | Exponential backoff |

### Optimization Tips

1. **Batch Updates**: Group multiple state changes to reduce WebSocket traffic
2. **Lazy Loading**: Load plugins on-demand instead of all at startup
3. **Connection Pooling**: Reuse WebSocket connections for multiple plugins
4. **Compression**: Enable per-message deflate for large component trees

## Troubleshooting

### Common Issues

#### Connection Refused
```bash
# Check if servers are running
pnpm server:simple
pnpm server:advanced

# Verify ports are not in use
lsof -i :3001
lsof -i :3002
```

#### Plugin Not Loading
```javascript
// Check browser console for WebSocket errors
// Check server logs for RPC initialization
// Verify plugin component exports correctly
```

#### Performance Issues
```javascript
// Monitor WebSocket message size
// Check for excessive re-renders
// Verify no memory leaks in plugin components
```

### Debug Mode

Enable detailed logging:

```typescript
// Server side
const state = createPluginRuntimeState();
console.log('[Server] Plugin runtime state:', state);

// Client side
rpc.getAPI().initialize().then(() => {
  console.log('[Client] Plugin initialized successfully');
});
```

## Advanced Features

### Hot Reloading

The Node.js servers support hot reloading without browser refresh:

```bash
# Servers will automatically reload when plugin files change
# Browser will reconnect and receive updated component trees
```

### Multi-Client Support

Single Node.js server can handle multiple browser clients:

```typescript
let connectionCount = 0;
wss.on('connection', (ws) => {
  connectionCount++;
  console.log(`[Server] Client ${connectionCount} connected`);

  ws.on('close', () => {
    connectionCount--;
    console.log(`[Server] Client disconnected, ${connectionCount} remaining`);
  });
});
```

### Plugin Distribution

```typescript
// Load plugins from npm packages
import Plugin from '@my-org/my-plugin';

// Load plugins from local files
import Plugin from './plugins/local-plugin';

// Dynamic plugin loading
const pluginModule = await import(`./plugins/${pluginName}`);
```

## Comparison with Other Modes

| Feature | Web Worker | Node.js WebSocket | Main Thread |
|---------|------------|------------------|-------------|
| Security | High | High | Low |
| Performance | Medium | Medium | High |
| Node.js API Access | No | Yes | No |
| Hot Reloading | No | Yes | No |
| Plugin Isolation | Yes | Yes | No |
| Development Speed | Medium | Medium | High |
| Production Ready | Yes | Yes | No |

## Migration Guide

### From Web Worker to Node.js

1. **Replace Worker Host**:
   ```typescript
   // From
   import WorkerPluginHost from './WorkerPluginHost.svelte';

   // To
   import WebSocketPluginHost from './WebSocketPluginHost.svelte';
   ```

2. **Update Plugin URL**:
   ```typescript
   // From
   pluginUrl = 'http://localhost:3000/plugin.js'

   // To
   serverUrl = 'ws://localhost:3001'
   ```

3. **Start Node.js Servers**:
   ```bash
   pnpm server  # Instead of pnpm dev for workers
   ```

## Examples

See the complete working examples in `packages/plugin-example/src/`:

- `simple-demo.server.ts` - Basic WebSocket server
- `advanced-demo.server.ts` - Advanced WebSocket server
- `shared-plugin-runtime.ts` - Shared plugin logic
- `WebSocketPluginHost.svelte` - Browser WebSocket client

## Contributing

When adding new features to the Node.js WebSocket mode:

1. Update shared runtime logic for maximum code reuse
2. Add comprehensive error handling and logging
3. Include tests for both client and server sides
4. Update documentation with examples
5. Consider security implications of new features