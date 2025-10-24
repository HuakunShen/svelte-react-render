<script lang="ts">
  import { createElement } from 'react';
  import WorkerPluginHost from "$lib/plugin/WorkerPluginHost.svelte";
  import PluginHost from "$lib/plugin/PluginHost.svelte";
  import { SimpleDemo, AdvancedDemo } from '@svelte-react-render/plugin-example';

  type DemoType = 'simple' | 'advanced';
  type RuntimeMode = 'worker' | 'main-thread';

  let currentDemo: DemoType = $state('simple');
  let runtimeMode: RuntimeMode = $state('worker');

  // For worker mode: plugin URLs from external server
  let pluginUrl = $derived(
    currentDemo === 'simple'
      ? 'http://localhost:3000/simple-demo.js'
      : 'http://localhost:3000/advanced-demo.js'
  );

  // For main-thread mode: create React element
  let pluginElement = $derived(
    createElement(currentDemo === 'simple' ? SimpleDemo : AdvancedDemo)
  );
</script>

<div class="min-h-screen bg-background">
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-4xl mx-auto">
      <div class="space-y-2 mb-8">
        <h1 class="text-3xl font-bold tracking-tight">
          Svelte-React Render Demo
        </h1>
        <p class="text-lg text-muted-foreground">
          React plugins loaded from external servers, rendered with beautiful shadcn-svelte components
        </p>
      </div>

      <div class="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div class="p-6">
          <div class="space-y-6">
            <!-- Runtime Mode Toggle -->
            <div class="flex gap-2 items-center justify-between">
              <div class="text-sm font-medium text-muted-foreground">Runtime Mode:</div>
              <div class="flex gap-1 p-1 bg-muted rounded-lg">
                <button
                  class="inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-md text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-7 px-2 {runtimeMode === 'worker' ? 'bg-background text-foreground' : 'text-muted-foreground'}"
                  onclick={() => runtimeMode = 'worker'}
                >
                  ⚡ Web Worker
                </button>
                <button
                  class="inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-md text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-7 px-2 {runtimeMode === 'main-thread' ? 'bg-background text-foreground' : 'text-muted-foreground'}"
                  onclick={() => runtimeMode = 'main-thread'}
                >
                  🧵 Main Thread
                </button>
              </div>
            </div>

            <!-- Demo Tabs -->
            <div class="flex gap-1 p-1 bg-muted rounded-lg">
              <button
                class="flex-1 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-8 px-3 {currentDemo === 'simple' ? 'bg-background text-foreground' : 'text-muted-foreground'}"
                onclick={() => currentDemo = 'simple'}
              >
                Simple Demo
              </button>
              <button
                class="flex-1 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-8 px-3 {currentDemo === 'advanced' ? 'bg-background text-foreground' : 'text-muted-foreground'}"
                onclick={() => currentDemo = 'advanced'}
              >
                Advanced Demo
              </button>
            </div>

            <!-- Window Chrome -->
            <div class="flex items-center gap-2 pb-4 border-b">
              <div class="h-3 w-3 rounded-full bg-red-500"></div>
              <div class="h-3 w-3 rounded-full bg-yellow-500"></div>
              <div class="h-3 w-3 rounded-full bg-green-500"></div>
              <span class="ml-4 text-sm text-muted-foreground font-mono">
                {runtimeMode === 'worker' ? pluginUrl : `${currentDemo}-demo.tsx (local)`}
              </span>
            </div>

            {#if runtimeMode === 'worker'}
              {#key pluginUrl}
                <WorkerPluginHost {pluginUrl} />
              {/key}
            {:else}
              <PluginHost plugin={pluginElement} />
            {/if}
          </div>
        </div>
      </div>

      <div class="mt-8 text-center text-sm text-muted-foreground space-y-1">
        <p>Built with Svelte 5, React, and shadcn-svelte</p>
        <p class="text-xs">
          {currentDemo === 'simple'
            ? 'Showing: Basic Button and Input components'
            : 'Showing: Form, Switch, and Toggle components'
          }
        </p>
        {#if runtimeMode === 'worker'}
          <p class="text-xs text-blue-500 dark:text-blue-400">
            ⚡ React plugin running in Web Worker (loaded from external server)
          </p>
        {:else}
          <p class="text-xs text-green-500 dark:text-green-400">
            🧵 React plugin running in Main Thread (direct)
          </p>
        {/if}
      </div>
    </div>
  </div>
</div>
