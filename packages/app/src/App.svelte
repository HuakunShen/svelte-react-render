<script lang="ts">
  import { ModeWatcher } from "mode-watcher";
  import "./app.css";
  import { createElement } from "react";
  import PluginHost from "./plugin/PluginHost.svelte";
  import SimpleDemo from "./plugins/simple-demo";

  let pluginElement = $derived(createElement(SimpleDemo));
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
          <div class="space-y-4">
            <div class="flex items-center gap-2 pb-4 border-b">
              <div class="h-3 w-3 rounded-full bg-red-500"></div>
              <div class="h-3 w-3 rounded-full bg-yellow-500"></div>
              <div class="h-3 w-3 rounded-full bg-green-500"></div>
              <span class="ml-4 text-sm text-muted-foreground font-mono"
                >simple-demo.tsx</span
              >
            </div>

            <PluginHost plugin={pluginElement} />
          </div>
        </div>
      </div>

      <div class="mt-8 text-center text-sm text-muted-foreground">
        <p>Built with Svelte 5, React, and shadcn-svelte</p>
      </div>
    </div>
  </div>
</div>
