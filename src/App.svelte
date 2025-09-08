<script lang="ts">
  import { onMount } from 'svelte'
  import svelteLogo from './assets/svelte.svg'
  import viteLogo from '/vite.svg'
  import Counter from './lib/Counter.svelte'
  import PluginContainer from './lib/PluginContainer.svelte'
  import { PluginRegistry } from './lib/plugin-system'
  import { todoPluginModule } from './plugins/todo-plugin'
  import { settingsPluginModule } from './plugins/settings-plugin'
  import { chipPluginModule } from './plugins/chip-plugin'

  let pluginRegistry: PluginRegistry
  let loadedPlugins: string[] = []
  let loadingError = ''

  onMount(async () => {
    try {
      // Initialize plugin system
      pluginRegistry = new PluginRegistry()
      
      // Register plugins
      pluginRegistry.registerPlugin(todoPluginModule)
      pluginRegistry.registerPlugin(settingsPluginModule)
      pluginRegistry.registerPlugin(chipPluginModule)
      
      // Get list of loaded plugins
      loadedPlugins = pluginRegistry.listPlugins().map(p => p.id)
      
      console.log('Plugin system initialized with plugins:', loadedPlugins)
    } catch (error) {
      console.error('Failed to initialize plugin system:', error)
      loadingError = error instanceof Error ? error.message : 'Unknown error'
    }
  })
</script>

<main>
  <div class="logos">
    <a href="https://vite.dev" target="_blank" rel="noreferrer">
      <img src={viteLogo} class="logo" alt="Vite Logo" />
    </a>
    <a href="https://svelte.dev" target="_blank" rel="noreferrer">
      <img src={svelteLogo} class="logo svelte" alt="Svelte Logo" />
    </a>
  </div>
  
  <h1>React Plugin System Demo</h1>
  <p class="subtitle">React plugins rendered in Svelte with custom reconciler</p>

  <div class="demo-section">
    <h2>Original Svelte Components</h2>
    <div class="card">
      <Counter />
    </div>
  </div>

  <div class="demo-section">
    <h2>React Plugins</h2>
    {#if loadingError}
      <div class="error">
        <h3>Plugin System Error</h3>
        <p>{loadingError}</p>
      </div>
    {:else if loadedPlugins.length === 0}
      <div class="loading">
        <p>Loading plugin system...</p>
      </div>
    {:else}
      <div class="plugins-container">
        {#each loadedPlugins as pluginId (pluginId)}
          <div class="plugin-wrapper">
            <PluginContainer {pluginId} {pluginRegistry} />
          </div>
        {/each}
      </div>
      
      <div class="plugin-info">
        <h3>Plugin System Status</h3>
        <ul>
          <li><strong>Loaded plugins:</strong> {loadedPlugins.length}</li>
          <li><strong>Registry capacity:</strong> {pluginRegistry?.getRegistryStats().availableSlots || 0} slots available</li>
          <li><strong>API version:</strong> 1.0.0</li>
        </ul>
      </div>
    {/if}
  </div>

  <div class="info-section">
    <p>
      This demo shows React components (plugins) rendered inside a Svelte application
      using a custom React reconciler. The TODO list uses plugin-button, plugin-listview,
      and plugin-input; the Settings panel uses plugin-toggle, plugin-badge, and plugin-divider —
      all mapped to native Svelte 5 components. The Chip demo shows a user-registered
      custom component rendered via <plugin-chip>.
    </p>
    
    <p>
      Check out <a href="https://github.com/sveltejs/kit#readme" target="_blank" rel="noreferrer">SvelteKit</a>, 
      the official Svelte app framework powered by Vite!
    </p>
  </div>
</main>

<style>
  main {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
    text-align: center;
  }

  .logos {
    display: flex;
    justify-content: center;
    gap: 2rem;
    margin-bottom: 2rem;
  }

  .logo {
    height: 6em;
    padding: 1.5em;
    will-change: filter;
    transition: filter 300ms;
  }

  .logo:hover {
    filter: drop-shadow(0 0 2em #646cffaa);
  }

  .logo.svelte:hover {
    filter: drop-shadow(0 0 2em #ff3e00aa);
  }

  h1 {
    font-size: 3.2em;
    line-height: 1.1;
    margin-bottom: 0.5rem;
  }

  .subtitle {
    font-size: 1.2em;
    color: #666;
    margin-bottom: 2rem;
  }

  .demo-section {
    margin: 3rem 0;
    padding: 2rem;
    border: 1px solid #e0e0e0;
    border-radius: 12px;
    background: #f9f9f9;
  }

  .demo-section h2 {
    margin-top: 0;
    margin-bottom: 1.5rem;
    color: #333;
  }

  .card {
    padding: 2em;
    margin: 1rem 0;
  }

  .plugins-container {
    display: grid;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .plugin-wrapper {
    background: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .plugin-info {
    background: white;
    border: 1px solid #d0d0d0;
    border-radius: 8px;
    padding: 1rem;
    text-align: left;
  }

  .plugin-info h3 {
    margin-top: 0;
    color: #333;
  }

  .plugin-info ul {
    margin: 0;
    padding-left: 1.5rem;
  }

  .plugin-info li {
    margin: 0.5rem 0;
  }

  .loading, .error {
    padding: 2rem;
    margin: 1rem 0;
    border-radius: 8px;
  }

  .loading {
    background: #e3f2fd;
    color: #1976d2;
  }

  .error {
    background: #ffebee;
    color: #c62828;
  }

  .error h3 {
    margin-top: 0;
    color: #c62828;
  }

  .info-section {
    margin-top: 3rem;
    padding: 2rem;
    background: #f0f0f0;
    border-radius: 8px;
    text-align: left;
    line-height: 1.6;
  }

  .info-section p {
    margin: 1rem 0;
  }

  a {
    font-weight: 500;
    color: #646cff;
    text-decoration: inherit;
  }

  a:hover {
    color: #535bf2;
  }

  /* Dark mode */
  @media (prefers-color-scheme: dark) {
    .subtitle {
      color: #999;
    }

    .demo-section {
      background: #2d2d2d;
      border-color: #555;
    }

    .demo-section h2 {
      color: #e0e0e0;
    }

    .plugin-wrapper {
      background: #3a3a3a;
    }

    .plugin-info {
      background: #3a3a3a;
      border-color: #555;
    }

    .plugin-info h3 {
      color: #e0e0e0;
    }

    .info-section {
      background: #2d2d2d;
    }

    .loading {
      background: #1a365d;
      color: #63b3ed;
    }

    .error {
      background: #5c2626;
      color: #f56565;
    }

    .error h3 {
      color: #f56565;
    }
  }

  /* Responsive */
  @media (max-width: 768px) {
    main {
      padding: 1rem;
    }

    h1 {
      font-size: 2.5em;
    }

    .logos {
      gap: 1rem;
    }

    .demo-section {
      padding: 1rem;
      margin: 2rem 0;
    }
  }
</style>
