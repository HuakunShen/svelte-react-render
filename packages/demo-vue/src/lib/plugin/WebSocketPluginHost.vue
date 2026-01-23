<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { RPCChannel, WebSocketClientIO } from 'kkrpc';
import type { WorkerAPI, MainThreadAPI, SerializedComponentTree } from './worker-rpc-types';
import ComponentRenderer from './ComponentRenderer.vue';

interface Props {
  serverUrl: string;
  props?: unknown;
}

const props = withDefaults(defineProps<Props>(), {
  props: () => ({})
});

const rootInstance = ref<SerializedComponentTree | null>(null);
const isLoading = ref(true);
const error = ref<string | null>(null);
const reconnectAttempts = ref(0);
const rpcRef = ref<RPCChannel<MainThreadAPI, WorkerAPI> | null>(null);

const maxReconnectAttempts = 5;
const reconnectDelayRef = ref(1000);
const isInitializedRef = ref(false);
const wsRef = ref<WebSocket | null>(null);
const reconnectTimeoutRef = ref<number | null>(null);
const isConnectingRef = ref(false);

const connectToServer = async (url: string) => {
  if (isConnectingRef.value) return;
  isConnectingRef.value = true;

  try {
    console.log('[Client] Connecting to plugin server:', url);
    isLoading.value = true;
    error.value = null;
    isInitializedRef.value = false;

    if (wsRef.value) {
      wsRef.value.close();
      wsRef.value = null;
      rpcRef.value = null;
    }

    const ws = new WebSocket(url);
    wsRef.value = ws;

    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('WebSocket connection timeout')), 10000);

      ws.onopen = () => {
        clearTimeout(timeout);
        console.log('[Client] WebSocket connection established');
        resolve();
      };

      ws.onerror = () => {
        clearTimeout(timeout);
        reject(new Error('WebSocket connection failed'));
      };
    });

    if (wsRef.value !== ws) {
      ws.close();
      return;
    }

    const io = new WebSocketClientIO(ws);
    const rpc = new RPCChannel<MainThreadAPI, WorkerAPI>(io, {
      expose: {
        updateComponentTree(tree: SerializedComponentTree | null) {
          console.log('[Client] Received component tree update');
          rootInstance.value = tree;
          isLoading.value = false;
          reconnectAttempts.value = 0;
          reconnectDelayRef.value = 1000;
        },
        logMessage(level: 'log' | 'warn' | 'error' | 'info', ...args: unknown[]) {
          console[level]('[Plugin]', ...args);
        }
      }
    });

    rpcRef.value = rpc;

    ws.onclose = (event) => {
      console.log('[Client] WebSocket closed:', event.code, event.reason);
      if (event.code !== 1000) {
        error.value = `Connection closed: ${event.reason || 'Unknown error'}`;
        isLoading.value = true;
        scheduleReconnection(url);
      }
    };

    ws.onerror = (event) => console.error('[Client] WebSocket error:', event);

    const api = rpc.getAPI();
    await api.initialize(props.props);
    isInitializedRef.value = true;
    console.log('[Client] Plugin initialized successfully');

  } catch (err) {
    console.error('[Client] Connection error:', err);
    error.value = err instanceof Error ? err.message : String(err);
    isLoading.value = false;
    scheduleReconnection(url);
  } finally {
    isConnectingRef.value = false;
  }
};

const scheduleReconnection = (url: string) => {
  if (reconnectAttempts.value >= maxReconnectAttempts) {
    console.error('[Client] Max reconnection attempts reached');
    return;
  }
  
  reconnectAttempts.value++;
  console.log(`[Client] Reconnection attempt ${reconnectAttempts.value}/${maxReconnectAttempts}`);
  
  reconnectTimeoutRef.value = setTimeout(() => {
    connectToServer(url);
  }, reconnectDelayRef.value);
  
  reconnectDelayRef.value = Math.min(reconnectDelayRef.value * 2, 30000);
};

onMounted(() => {
  connectToServer(props.serverUrl);
});

onUnmounted(() => {
  console.log('[Client] Cleanup WebSocket plugin host');
  
  if (reconnectTimeoutRef.value) {
    clearTimeout(reconnectTimeoutRef.value);
  }
  
  if (wsRef.value) {
    wsRef.value.onclose = null;
    wsRef.value.onerror = null;
    wsRef.value.close();
    wsRef.value = null;
  }
  
  rpcRef.value = null;
  isConnectingRef.value = false;
});

watch(() => props.serverUrl, (newUrl) => {
  reconnectAttempts.value = 0;
  reconnectDelayRef.value = 1000;
  connectToServer(newUrl);
});

watch(() => props.props, (newProps) => {
  if (rpcRef.value && isInitializedRef.value && !isLoading.value) {
    console.log('[Client] Props changed, updating server');
    rpcRef.value.getAPI().updateProps(newProps);
  }
}, { deep: true });

const reload = () => {
  window.location.reload();
};
</script>

<template>
  <div v-if="error" class="flex h-full w-full items-center justify-center">
    <div class="text-sm text-red-500">
      <div class="mb-2 font-semibold">Connection Error</div>
      <div class="text-xs text-red-400">{{ error }}</div>
      <div v-if="reconnectAttempts > 0 && reconnectAttempts < maxReconnectAttempts" class="text-xs text-yellow-500 mt-2">
        Reconnecting... ({reconnectAttempts}/{maxReconnectAttempts})
      </div>
      <button
        v-if="reconnectAttempts >= maxReconnectAttempts"
        class="mt-2 px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
        @click="reload"
      >
        Retry Connection
      </button>
    </div>
  </div>

  <div v-else-if="isLoading" class="flex h-full w-full items-center justify-center text-sm text-gray-500">
    {{ reconnectAttempts > 0 ? `Connecting to server... (${reconnectAttempts}/${maxReconnectAttempts})` : 'Connecting to plugin server…' }}
  </div>

  <div v-else-if="rootInstance" class="h-full w-full">
    <ComponentRenderer :instance="rootInstance" :rpc="rpcRef as any" />
  </div>

  <div v-else class="flex h-full w-full items-center justify-center text-sm text-gray-500">
    Waiting for plugin content...
  </div>
</template>
