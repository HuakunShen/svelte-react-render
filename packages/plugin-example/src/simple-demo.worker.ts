import { RPCChannel, WorkerChildIO } from 'kkrpc';
import * as React from 'react';
import * as API from '@svelte-react-render/api';
import type { WorkerAPI, MainThreadAPI, SerializedComponentTree } from './worker-rpc-types';
import { 
  serializeComponentTree, 
  createSerializationContext,
  type SerializationContext 
} from './serialization-utils';
import SimpleDemo from './simple-demo';

// Global state for the worker
let currentBridge: ReturnType<typeof API.createRenderer> | null = null;
let currentElement: React.ReactElement | null = null;
let serializationContext: SerializationContext | null = null;
let rpcChannel: RPCChannel<WorkerAPI, MainThreadAPI> | null = null;

// Initialize RPC channel
const io = new WorkerChildIO();

// Shared initialization logic
async function initializePlugin(props?: any) {
  console.log('[Worker] Initializing SimpleDemo plugin');
  
  try {
    // Create serialization context for this plugin
    serializationContext = createSerializationContext();

    // Create a new renderer bridge
    currentBridge = API.createRenderer();
    
    // Subscribe to bridge updates
    currentBridge.subscribe(() => {
      if (!currentBridge || !serializationContext || !rpcChannel) return;
      
      console.log('[Worker] Bridge updated, serializing tree');
      
      // Serialize the component tree
      const serializedTree = serializeComponentTree(
        currentBridge.rootInstance,
        serializationContext
      ) as SerializedComponentTree | null;

      // Send to main thread
      const api = rpcChannel.getAPI();
      api.updateComponentTree(serializedTree);
    });

    // Create and render the React element
    currentElement = React.createElement(SimpleDemo, props);
    API.render(currentElement, currentBridge);

    console.log('[Worker] SimpleDemo plugin initialized successfully');
  } catch (error) {
    console.error('[Worker] Error initializing plugin:', error);
    if (rpcChannel) {
      const api = rpcChannel.getAPI();
      api.logMessage('error', 'Failed to initialize plugin:', error);
    }
    throw error;
  }
}

function setupRPC() {
  rpcChannel = new RPCChannel<WorkerAPI, MainThreadAPI>(io, {
    expose: {
      async initialize(props?: any) {
        return initializePlugin(props);
      },

      async updateProps(props: any) {
        console.log('[Worker] Updating props:', props);
        
        if (!currentBridge || !currentElement) {
          console.warn('[Worker] No active plugin to update');
          return;
        }

        try {
          // Re-render with new props
          const newElement = React.createElement(
            (currentElement as any).type,
            props
          );
          currentElement = newElement;
          API.render(newElement, currentBridge);
        } catch (error) {
          console.error('[Worker] Error updating props:', error);
          if (rpcChannel) {
            const api = rpcChannel.getAPI();
            api.logMessage('error', 'Failed to update props:', error);
          }
          throw error;
        }
      },

      async executeHandler(handlerId: string, ...args: any[]) {
        console.log('[Worker] Executing handler:', handlerId, args);
        
        if (!serializationContext) {
          console.warn('[Worker] No serialization context available');
          return;
        }

        try {
          const handler = serializationContext.handlerRegistry.get(handlerId);
          if (!handler) {
            console.warn('[Worker] Handler not found:', handlerId);
            return;
          }

          // Execute the handler
          const result = handler(...args);
          
          // Handle promises
          if (result instanceof Promise) {
            await result;
          }
        } catch (error) {
          console.error('[Worker] Error executing handler:', error);
          if (rpcChannel) {
            const api = rpcChannel.getAPI();
            api.logMessage('error', 'Handler execution failed:', error);
          }
          throw error;
        }
      },

      async destroy() {
        console.log('[Worker] Destroying plugin');
        
        // Clean up
        currentBridge = null;
        currentElement = null;
        if (serializationContext) {
          serializationContext.handlerRegistry.clear();
          serializationContext = null;
        }
        
        io.destroy();
      }
    }
  });

  console.log('[Worker] RPC channel initialized');
}

// Initialize on worker start
setupRPC();

// Auto-initialize the plugin
initializePlugin();

