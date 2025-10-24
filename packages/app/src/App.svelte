<script lang="ts">
  import { ModeWatcher } from "mode-watcher";
  import "./app.css";
  import { createElement } from "react";
  import PluginHost from "./plugin/PluginHost.svelte";
  import SimpleDemo from "./plugins/simple-demo";
  import AdvancedDemo from "./plugins/advanced-demo";

  type DemoType = 'simple' | 'advanced';

  let currentDemo: DemoType = $state('simple');

  let pluginElement = $derived(
    createElement(currentDemo === 'simple' ? SimpleDemo : AdvancedDemo)
  );
</script>

<ModeWatcher />
<div class="min-h-screen bg-background">
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-4xl mx-auto">
      <div class="space-y-2 mb-8">
        <h1 class="text-3xl font-bold tracking-tight">
          Svelte-React Render Demo
        </h1>
        <p class="text-lg text-muted-foreground">
          React plugin rendered with beautiful shadcn-svelte components
        </p>
      </div>

      <div class="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div class="p-6">
          <div class="space-y-6">
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
                {currentDemo === 'simple' ? 'simple-demo.tsx' : 'advanced-demo.tsx'}
              </span>
            </div>

            <PluginHost plugin={pluginElement} />
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
      </div>
    </div>
  </div>
</div>
