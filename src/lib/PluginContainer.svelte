<script lang="ts">
  import { onDestroy, onMount } from 'svelte'
  import React from 'react'
  import { PluginRegistry, PluginContainer as Container } from './plugin-system'
  import { ReconcilerFactory } from './reconciler'

  export let pluginId: string
  export let pluginRegistry: PluginRegistry
  
  let containerElement: HTMLDivElement
  let pluginContainer: Container | null = null
  let reconcilerFactory: ReconcilerFactory
  let isLoaded = false
  let hasError = false
  let errorMessage = ''

  onMount(() => {
    initializePlugin();
  });

  async function initializePlugin() {
    if (!containerElement) return;

    try {
      reconcilerFactory = new ReconcilerFactory()
      pluginContainer = new Container(pluginId)
      
      const pluginModule = pluginRegistry.getPlugin(pluginId)
      if (!pluginModule) {
        throw new Error(`Plugin "${pluginId}" not found in registry`)
      }

      pluginContainer.mount(containerElement)
      
      const reconcilerRoot = reconcilerFactory.createRoot(pluginContainer.domNode)
      pluginContainer.setReconcilerRoot(reconcilerRoot)
      
      const pluginElement = React.createElement(pluginModule.default)
      reconcilerRoot.render(pluginElement)
      
      isLoaded = true

      const errorHandler = (event: CustomEvent) => {
        hasError = true
        errorMessage = event.detail.error?.message || 'Unknown plugin error'
      }
      
      pluginContainer.domNode.addEventListener('plugin:error', errorHandler as EventListener)
      
    } catch (error) {
      hasError = true
      errorMessage = error instanceof Error ? error.message : 'Failed to load plugin'
    }
  }

  onDestroy(() => {
    if (pluginContainer) {
      pluginContainer.destroy()
    }
  })

  function retryPlugin() {
    hasError = false
    errorMessage = ''
    isLoaded = false
    
    if (pluginContainer) {
      pluginContainer.destroy()
      pluginContainer = null
    }
    
    initializePlugin()
  }
</script>

<div class="plugin-container-wrapper" data-plugin-id={pluginId}>
  {#if hasError}
    <div class="plugin-error">
      <h3>Plugin Error</h3>
      <p>Plugin "{pluginId}" encountered an error:</p>
      <p class="error-message">{errorMessage}</p>
      <button onclick={retryPlugin} class="retry-button">
        Retry Plugin
      </button>
    </div>
  {:else if !isLoaded}
    <div class="plugin-loading">
      <div class="loading-spinner"></div>
      <p>Loading plugin "{pluginId}"...</p>
    </div>
  {/if}
  <div bind:this={containerElement} class="plugin-mount-point" style="display: {isLoaded ? 'block' : 'none'};"></div>
</div>

<style>
  .plugin-container-wrapper {
    border: 1px solid var(--border-color, #e0e0e0);
    border-radius: 8px;
    padding: 16px;
    margin: 8px 0;
    background: var(--bg-color, white);
    min-height: 100px;
    position: relative;
  }

  .plugin-mount-point {
    width: 100%;
  }

  .plugin-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100px;
    color: var(--text-muted, #666);
  }

  .loading-spinner {
    width: 24px;
    height: 24px;
    border: 2px solid var(--border-color, #e0e0e0);
    border-top: 2px solid var(--primary-color, #0066cc);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 12px;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .plugin-error {
    text-align: center;
    padding: 20px;
    color: var(--error-color, #dc3545);
  }

  .plugin-error h3 {
    margin: 0 0 12px 0;
    color: var(--error-color, #dc3545);
  }

  .plugin-error p {
    margin: 8px 0;
  }

  .error-message {
    font-family: monospace;
    background: var(--error-bg, #f8d7da);
    padding: 8px;
    border-radius: 4px;
    font-size: 0.9em;
  }

  .retry-button {
    margin-top: 16px;
    padding: 8px 16px;
    background: var(--primary-color, #0066cc);
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
  }

  .retry-button:hover {
    background: var(--primary-color-hover, #0052a3);
  }

  /* Dark mode */
  @media (prefers-color-scheme: dark) {
    .plugin-container-wrapper {
      background: var(--bg-color-dark, #2d2d2d);
      border-color: var(--border-color-dark, #555);
    }

    .plugin-loading {
      color: var(--text-muted-dark, #999);
    }

    .error-message {
      background: var(--error-bg-dark, #5c2626);
      color: var(--error-color-dark, #f5c6cb);
    }
  }
</style>