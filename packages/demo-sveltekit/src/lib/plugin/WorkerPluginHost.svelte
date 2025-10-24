<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { RPCChannel, WorkerParentIO } from 'kkrpc';
  import ReactPluginWorker from './react-plugin.worker.ts?worker';
  import ComponentRenderer from './ComponentRenderer.svelte';
  import type { WorkerAPI, MainThreadAPI, SerializedComponentTree } from './worker-rpc-types';

  interface Props {
    pluginUrl: string;
    props?: any;
  }

  let { pluginUrl, props: pluginProps = {} }: Props = $props();
  
  let rootInstance = $state<SerializedComponentTree | null>(null);
  let rpc: RPCChannel<MainThreadAPI, WorkerAPI> | null = null;
  let worker: Worker | null = null;
  let isLoading = $state(true);
  let error = $state<string | null>(null);

  // Store RPC in a way that ComponentRenderer can access it
  let rpcContext = $state<{ rpc: RPCChannel<MainThreadAPI, WorkerAPI> | null }>({ rpc: null });

  let lastPluginUrl = $state<string | null>(null);

  onMount(async () => {
    try {
      console.log('[Main] Creating worker for plugin:', pluginUrl);
      
      // Create worker
      worker = new ReactPluginWorker();
      const io = new WorkerParentIO(worker);
      
      // Create RPC channel
      rpc = new RPCChannel<MainThreadAPI, WorkerAPI>(io, {
        expose: {
          updateComponentTree(tree: SerializedComponentTree | null) {
            console.log('[Main] Received component tree update');
            rootInstance = tree;
            isLoading = false;
          },
          logMessage(level: 'log' | 'warn' | 'error' | 'info', ...args: any[]) {
            console[level]('[Plugin]', ...args);
          }
        }
      });

      rpcContext.rpc = rpc;

      // Render the plugin in the worker
      const api = rpc.getAPI();
      await api.renderPlugin(pluginUrl, pluginProps);
      lastPluginUrl = pluginUrl;
      
      console.log('[Main] Plugin render initiated');
    } catch (err) {
      console.error('[Main] Error initializing worker:', err);
      error = err instanceof Error ? err.message : String(err);
      isLoading = false;
    }
  });

  // Watch for plugin URL changes and re-render
  $effect(() => {
    // Only trigger if URL actually changed and we have an RPC connection
    if (rpc && pluginUrl !== lastPluginUrl && lastPluginUrl !== null) {
      console.log('[Main] Plugin URL changed, re-rendering:', pluginUrl);
      isLoading = true;
      rootInstance = null;
      lastPluginUrl = pluginUrl;
      
      const api = rpc.getAPI();
      api.renderPlugin(pluginUrl, pluginProps).catch(err => {
        console.error('[Main] Error re-rendering plugin:', err);
        error = err instanceof Error ? err.message : String(err);
        isLoading = false;
      });
    }
  });

  // Watch for prop changes and update
  $effect(() => {
    if (rpc && pluginProps && !isLoading) {
      console.log('[Main] Props changed, updating worker');
      const api = rpc.getAPI();
      api.updateProps(pluginProps);
    }
  });

  onDestroy(() => {
    console.log('[Main] Destroying worker plugin host');
    
    if (rpc) {
      try {
        const api = rpc.getAPI();
        api.destroy();
      } catch (err) {
        console.warn('[Main] Error destroying RPC:', err);
      }
    }
    
    if (worker) {
      worker.terminate();
    }
  });
</script>

<div class="w-full h-full">
  {#if error}
    <div class="w-full h-full flex items-center justify-center">
      <div class="text-red-500 text-sm">
        <div class="font-semibold mb-2">Plugin Error</div>
        <div class="text-xs text-red-400">{error}</div>
      </div>
    </div>
  {:else if isLoading}
    <div class="w-full h-full flex items-center justify-center text-gray-500 text-sm">
      Loading plugin…
    </div>
  {:else if rootInstance}
    <ComponentRenderer instance={rootInstance} {rpcContext} />
  {:else}
    <div class="w-full h-full flex items-center justify-center text-gray-500 text-sm">
      No content
    </div>
  {/if}
</div>

