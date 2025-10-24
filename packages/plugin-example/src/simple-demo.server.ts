import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { RPCChannel, WebSocketServerIO } from 'kkrpc';
import type { WorkerAPI, MainThreadAPI } from './worker-rpc-types';
import {
  createPluginRuntimeState,
  createPluginAPI
} from './shared-plugin-runtime';
import SimpleDemo from './simple-demo';

// Create HTTP server
const server = createServer();

// Create WebSocket server
const wss = new WebSocketServer({ server });

console.log('[Server] Starting WebSocket server on port 3001');

wss.on('connection', (ws) => {
  console.log('[Server] New WebSocket connection established');

  // Initialize RPC channel with WebSocket
  const io = new WebSocketServerIO(ws);

  // Create shared plugin runtime state for this connection
  const state = createPluginRuntimeState();

  const rpcChannel = new RPCChannel<WorkerAPI, MainThreadAPI>(io, {
    expose: createPluginAPI(state, SimpleDemo, io, '[Server]')
  });

  // Store RPC channel in state for shared logic
  state.rpcChannel = rpcChannel;

  console.log('[Server] RPC channel initialized for connection');

  // Handle connection close
  ws.on('close', () => {
    console.log('[Server] WebSocket connection closed');

    // Clean up plugin state
    if (state.rpcChannel) {
      try {
        const api = state.rpcChannel.getAPI();
        api.destroy();
      } catch (err) {
        console.warn('[Server] Error destroying RPC on close:', err);
      }
    }
  });

  // Handle connection error
  ws.on('error', (error) => {
    console.error('[Server] WebSocket error:', error);
  });

  // Plugin will be initialized when the browser client calls the initialize method
  console.log('[Server] Plugin host ready for client connections');
});

// Start the server
const PORT = 3001;
server.listen(PORT, () => {
  console.log(`[Server] Plugin server running on ws://localhost:${PORT}`);
  console.log('[Server] Ready to serve React plugins to browser clients');
});

// Handle server errors
server.on('error', (error) => {
  console.error('[Server] Server error:', error);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('[Server] Shutting down gracefully...');

  wss.close(() => {
    console.log('[Server] WebSocket server closed');
    server.close(() => {
      console.log('[Server] HTTP server closed');
      process.exit(0);
    });
  });
});