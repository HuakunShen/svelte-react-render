import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { RPCChannel, WebSocketServerIO } from 'kkrpc';
import type { WorkerAPI, MainThreadAPI } from './worker-rpc-types';
import {
  createPluginRuntimeState,
  createPluginAPI
} from './shared-plugin-runtime';
import AdvancedDemo from './advanced-demo';

// Create HTTP server
const server = createServer();

// Create WebSocket server
const wss = new WebSocketServer({ server });

console.log('[Server] Starting Advanced Demo WebSocket server on port 3002');

wss.on('connection', (ws) => {
  console.log('[Server] New Advanced Demo WebSocket connection established');

  // Initialize RPC channel with WebSocket
  const io = new WebSocketServerIO(ws);

  // Create shared plugin runtime state for this connection
  const state = createPluginRuntimeState();

  const rpcChannel = new RPCChannel<WorkerAPI, MainThreadAPI>(io, {
    expose: createPluginAPI(state, AdvancedDemo, io, '[Server]')
  });

  // Store RPC channel in state for shared logic
  state.rpcChannel = rpcChannel;

  console.log('[Server] Advanced Demo RPC channel initialized for connection');

  // Handle connection close
  ws.on('close', () => {
    console.log('[Server] Advanced Demo WebSocket connection closed');

    // Clean up plugin state
    if (state.rpcChannel) {
      try {
        const api = state.rpcChannel.getAPI();
        api.destroy();
      } catch (err) {
        console.warn('[Server] Error destroying Advanced Demo RPC on close:', err);
      }
    }
  });

  // Handle connection error
  ws.on('error', (error) => {
    console.error('[Server] Advanced Demo WebSocket error:', error);
  });

  // Plugin will be initialized when the browser client calls the initialize method
  console.log('[Server] Advanced Demo plugin host ready for client connections');
});

// Start the server
const PORT = 3002;
server.listen(PORT, () => {
  console.log(`[Server] Advanced Demo plugin server running on ws://localhost:${PORT}`);
  console.log('[Server] Ready to serve Advanced Demo React plugin to browser clients');
});

// Handle server errors
server.on('error', (error) => {
  console.error('[Server] Advanced Demo server error:', error);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('[Server] Shutting down Advanced Demo server gracefully...');

  wss.close(() => {
    console.log('[Server] Advanced Demo WebSocket server closed');
    server.close(() => {
      console.log('[Server] Advanced Demo HTTP server closed');
      process.exit(0);
    });
  });
});