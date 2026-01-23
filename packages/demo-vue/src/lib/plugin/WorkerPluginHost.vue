<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { RPCChannel, WorkerParentIO } from 'kkrpc';
import type { WorkerAPI, MainThreadAPI, SerializedComponentTree } from './worker-rpc-types';
import ComponentRenderer from './ComponentRenderer.vue';

interface Props {
  pluginUrl: string;
  props?: unknown;
}

const props = withDefaults(defineProps<Props>(), {
  props: () => ({})
});

const rootInstance = ref<SerializedComponentTree | null>(null);
const isLoading = ref(true);
const error = ref<string | null>(null);
const rpcRef = ref<RPCChannel<MainThreadAPI, WorkerAPI> | null>(null);
const workerRef = ref<Worker | null>(null);
const lastPluginUrlRef = ref<string | null>(null);

const loadPlugin = async (url: string) => {
  try {
    console.log('[Main] Fetching plugin from:', url);
    isLoading.value = true;
    error.value = null;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch plugin: ${response.status} ${response.statusText}`);
    }

    const scriptText = await response.text();
    console.log('[Main] Plugin script fetched, creating blob worker');

    const blob = new Blob([scriptText], { type: 'application/javascript' });
    const blobURL = URL.createObjectURL(blob);

    if (workerRef.value) {
      console.log('[Main] Terminating old worker');
      workerRef.value.terminate();
      workerRef.value = null;
      rpcRef.value = null;
    }

    const worker = new Worker(blobURL);
    workerRef.value = worker;
    console.log('[Main] Worker created');

    URL.revokeObjectURL(blobURL);

    const io = new WorkerParentIO(worker);

    const rpc = new RPCChannel<MainThreadAPI, WorkerAPI>(io, {
      expose: {
        updateComponentTree(tree: SerializedComponentTree | null) {
          console.log('[Main] Received component tree update');
          rootInstance.value = tree;
          isLoading.value = false;
        },
        logMessage(level: 'log' | 'warn' | 'error' | 'info', ...args: unknown[]) {
          console[level]('[Plugin]', ...args);
        }
      }
    });

    rpcRef.value = rpc;
    lastPluginUrlRef.value = url;

    console.log('[Main] Plugin worker initialized');
  } catch (err) {
    console.error('[Main] Error loading plugin:', err);
    error.value = err instanceof Error ? err.message : String(err);
    isLoading.value = false;
  }
};

onMounted(() => {
  loadPlugin(props.pluginUrl);
});

onUnmounted(() => {
  console.log('[Main] Destroying worker plugin host');
  
  if (rpcRef.value) {
    try {
      const api = rpcRef.value.getAPI();
      api.destroy();
    } catch (err) {
      console.warn('[Main] Error destroying RPC:', err);
    }
  }
  
  if (workerRef.value) {
    workerRef.value.terminate();
  }
});

watch(() => props.pluginUrl, (newUrl) => {
  if (newUrl !== lastPluginUrlRef.value && lastPluginUrlRef.value !== null) {
    console.log('[Main] Plugin URL changed, reloading:', newUrl);
    rootInstance.value = null;
    loadPlugin(newUrl);
  }
});

watch(() => props.props, (newProps) => {
  if (rpcRef.value && !isLoading.value) {
    console.log('[Main] Props changed, updating worker');
    const api = rpcRef.value.getAPI();
    api.updateProps(newProps);
  }
}, { deep: true });

</script>

<template>
  <div v-if="error" class="flex h-full w-full items-center justify-center">
    <div class="text-sm text-red-500">
      <div class="mb-2 font-semibold">Plugin Error</div>
      <div class="text-xs text-red-400">{{ error }}</div>
    </div>
  </div>

  <div v-else-if="isLoading" class="flex h-full w-full items-center justify-center text-sm text-gray-500">
    Loading plugin…
  </div>

  <div v-else-if="rootInstance" class="h-full w-full">
    <ComponentRenderer :instance="rootInstance" :rpc="rpcRef as any" />
  </div>

  <div v-else class="flex h-full w-full items-center justify-center text-sm text-gray-500">
    No content
  </div>
</template>
