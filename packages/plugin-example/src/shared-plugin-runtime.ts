import * as React from 'react';
import * as API from '@svelte-react-render/api';
import type { WorkerAPI, MainThreadAPI, SerializedComponentTree } from './worker-rpc-types';
import {
  serializeComponentTree,
  createSerializationContext,
  type SerializationContext
} from './serialization-utils';
import { RPCChannel } from 'kkrpc';

// Shared plugin runtime state and logic
export interface PluginRuntimeState {
  currentBridge: ReturnType<typeof API.createRenderer> | null;
  currentElement: React.ReactElement | null;
  serializationContext: SerializationContext | null;
  rpcChannel: RPCChannel<WorkerAPI, MainThreadAPI> | null;
}

// Create a new plugin runtime state
export function createPluginRuntimeState(): PluginRuntimeState {
  return {
    currentBridge: null,
    currentElement: null,
    serializationContext: null,
    rpcChannel: null
  };
}

// Shared plugin initialization logic
export async function initializePlugin(
  state: PluginRuntimeState,
  PluginComponent: React.ComponentType<any>,
  props?: any,
  loggerPrefix: string = '[Runtime]'
) {
  console.log(`${loggerPrefix} Initializing plugin`);

  try {
    // Create serialization context for this plugin
    state.serializationContext = createSerializationContext();

    // Create a new renderer bridge
    state.currentBridge = API.createRenderer();

    // Subscribe to bridge updates
    state.currentBridge.subscribe(() => {
      if (!state.currentBridge || !state.serializationContext || !state.rpcChannel) return;

      console.log(`${loggerPrefix} Bridge updated, serializing tree`);

      // Serialize the component tree
      const serializedTree = serializeComponentTree(
        state.currentBridge.rootInstance,
        state.serializationContext
      ) as SerializedComponentTree | null;

      // Send to client
      const api = state.rpcChannel.getAPI();
      api.updateComponentTree(serializedTree);
    });

    // Create and render the React element
    state.currentElement = React.createElement(PluginComponent, props);
    API.render(state.currentElement, state.currentBridge);

    console.log(`${loggerPrefix} Plugin initialized successfully`);
  } catch (error) {
    console.error(`${loggerPrefix} Error initializing plugin:`, error);
    if (state.rpcChannel) {
      const api = state.rpcChannel.getAPI();
      api.logMessage('error', 'Failed to initialize plugin:', error);
    }
    throw error;
  }
}

// Shared props update logic
export async function updatePluginProps(
  state: PluginRuntimeState,
  props: any,
  loggerPrefix: string = '[Runtime]'
) {
  console.log(`${loggerPrefix} Updating props:`, props);

  if (!state.currentBridge || !state.currentElement) {
    console.warn(`${loggerPrefix} No active plugin to update`);
    return;
  }

  try {
    // Re-render with new props
    const newElement = React.createElement(
      (state.currentElement as any).type,
      props
    );
    state.currentElement = newElement;
    API.render(newElement, state.currentBridge);
  } catch (error) {
    console.error(`${loggerPrefix} Error updating props:`, error);
    if (state.rpcChannel) {
      const api = state.rpcChannel.getAPI();
      api.logMessage('error', 'Failed to update props:', error);
    }
    throw error;
  }
}

// Shared handler execution logic
export async function executeHandler(
  state: PluginRuntimeState,
  handlerId: string,
  args: any[],
  loggerPrefix: string = '[Runtime]'
) {
  console.log(`${loggerPrefix} Executing handler:`, handlerId, args);

  if (!state.serializationContext) {
    console.warn(`${loggerPrefix} No serialization context available`);
    return;
  }

  try {
    const handler = state.serializationContext.handlerRegistry.get(handlerId);
    if (!handler) {
      console.warn(`${loggerPrefix} Handler not found:`, handlerId);
      return;
    }

    // Execute the handler
    const result = handler(...args);

    // Handle promises
    if (result instanceof Promise) {
      await result;
    }
  } catch (error) {
    console.error(`${loggerPrefix} Error executing handler:`, error);
    if (state.rpcChannel) {
      const api = state.rpcChannel.getAPI();
      api.logMessage('error', 'Handler execution failed:', error);
    }
    throw error;
  }
}

// Shared cleanup logic
export function destroyPlugin(
  state: PluginRuntimeState,
  io: { destroy(): void },
  loggerPrefix: string = '[Runtime]'
) {
  console.log(`${loggerPrefix} Destroying plugin`);

  // Clean up
  state.currentBridge = null;
  state.currentElement = null;
  if (state.serializationContext) {
    state.serializationContext.handlerRegistry.clear();
    state.serializationContext = null;
  }

  io.destroy();
}

// Create the RPC API implementation using shared logic
export function createPluginAPI(
  state: PluginRuntimeState,
  PluginComponent: React.ComponentType<any>,
  io: { destroy(): void },
  loggerPrefix: string = '[Runtime]'
) {
  return {
    async initialize(props?: any) {
      return initializePlugin(state, PluginComponent, props, loggerPrefix);
    },

    async updateProps(props: any) {
      return updatePluginProps(state, props, loggerPrefix);
    },

    async executeHandler(handlerId: string, ...args: any[]) {
      return executeHandler(state, handlerId, args, loggerPrefix);
    },

    async destroy() {
      return destroyPlugin(state, io, loggerPrefix);
    }
  };
}