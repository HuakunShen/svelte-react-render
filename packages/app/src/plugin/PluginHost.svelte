<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import type { ReactElement } from 'react';
  import { render, createRenderer, type ExtendedRenderBridge } from '@svelte-react-render/api';
  import type { SvelteComponentInstance } from '@svelte-react-render/api';
  import ComponentRenderer from './ComponentRenderer.svelte';

  interface Props {
    plugin: ReactElement;
  }

  let { plugin }: Props = $props();

  let bridge: ExtendedRenderBridge | null = $state(null);
  let rootInstance = $state<SvelteComponentInstance | null>(null);
  let unsubscribe: (() => void) | null = null;

  onMount(() => {
    // Create a render bridge
    const newBridge = createRenderer();
    bridge = newBridge;

    // Subscribe to bridge updates
    unsubscribe = newBridge.subscribe(() => {
      console.log('PluginHost: Bridge update triggered', {
        rootInstance: newBridge.rootInstance,
        rootInstanceId: newBridge.rootInstance?.id,
        rootInstanceType: newBridge.rootInstance?.type
      });
      // Direct assignment triggers Svelte reactivity
      rootInstance = newBridge.rootInstance;
      console.log('PluginHost: rootInstance updated');
    });

    // Render the plugin immediately after setting up the subscription
    console.log('PluginHost: Rendering plugin');
    render(plugin, newBridge);
  });

  onDestroy(() => {
    if (unsubscribe) {
      unsubscribe();
    }
  });
</script>

<div class="w-full h-full">
  {#if rootInstance}
    <ComponentRenderer instance={rootInstance} />
  {:else}
    <div class="w-full h-full flex items-center justify-center text-gray-500 text-sm">
      Loading plugin…
    </div>
  {/if}
</div>