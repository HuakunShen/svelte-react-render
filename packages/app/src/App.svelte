<script lang="ts">
  import './app.css';
  import { createElement } from 'react';
  import PluginHost from './plugin/PluginHost.svelte';
  import SimpleDemo from './plugins/simple-demo';

  let pluginElement = $derived(createElement(SimpleDemo));
</script>

<main class="bg-gray-900 min-h-screen">
  <div class="flex flex-col max-w-2xl mx-auto w-full p-5 h-screen">
    <div class="mb-5 text-white">
      <h1 class="text-2xl font-semibold m-0">Simple Button & Input Demo</h1>
      <p class="mt-1 mb-3 text-sm text-gray-400">React plugin rendered with Svelte components</p>
    </div>
    <div class="flex-1 rounded-lg overflow-hidden shadow-lg min-h-[500px] bg-white">
      <PluginHost plugin={pluginElement} />
    </div>
  </div>
</main>
