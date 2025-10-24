<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { RPCChannel, WorkerParentIO } from 'kkrpc';
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

  async function loadPlugin(url: string) {
    try {
      console.log('[Main] Fetching plugin from:', url);
      isLoading = true;
      error = null;
      
      // Fetch the plugin script
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch plugin: ${response.status} ${response.statusText}`);
      }
      
      const scriptText = await response.text();
      console.log('[Main] Plugin script fetched, creating blob worker');
      
      // Create a blob worker from the script
      const blob = new Blob([scriptText], { type: 'application/javascript' });
      const blobURL = URL.createObjectURL(blob);
      
      // Terminate old worker if exists
      if (worker) {
        console.log('[Main] Terminating old worker');
        worker.terminate();
        worker = null;
        rpc = null;
      }
      
      // Create worker from blob
      worker = new Worker(blobURL);
      console.log('[Main] Worker created');
      
      // Clean up blob URL after worker is created
      URL.revokeObjectURL(blobURL);
      
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
      lastPluginUrl = url;
      
      console.log('[Main] Plugin worker initialized');
    } catch (err) {
      console.error('[Main] Error loading plugin:', err);
      error = err instanceof Error ? err.message : String(err);
      isLoading = false;
    }
  }

  onMount(() => {
    loadPlugin(pluginUrl);
  });

  // Watch for plugin URL changes and reload
  $effect(() => {
    // Only trigger if URL actually changed
    if (pluginUrl !== lastPluginUrl && lastPluginUrl !== null) {
      console.log('[Main] Plugin URL changed, reloading:', pluginUrl);
      rootInstance = null;
      loadPlugin(pluginUrl);
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
