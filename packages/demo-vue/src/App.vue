<script setup lang="ts">
import { ref, computed } from 'vue';
import { SimpleDemo, AdvancedDemo } from '@svelte-react-render/plugin-example';
import PluginHost from './lib/plugin/PluginHost.vue';
import WorkerPluginHost from './lib/plugin/WorkerPluginHost.vue';
import WebSocketPluginHost from './lib/plugin/WebSocketPluginHost.vue';
// import './assets/main.css';
import "./styles.css"

type DemoType = 'simple' | 'advanced';
type RuntimeMode = 'worker' | 'main-thread' | 'node-server';

const currentDemo = ref<DemoType>('simple');
const runtimeMode = ref<RuntimeMode>('worker');

const pluginUrl = computed(() => 
  currentDemo.value === 'simple'
    ? 'http://localhost:3000/simple-demo.js'
    : 'http://localhost:3000/advanced-demo.js'
);

const serverUrl = computed(() => 
  currentDemo.value === 'simple'
    ? 'ws://localhost:3001'
    : 'ws://localhost:3002'
);

const pluginComponent = computed(() => 
  currentDemo.value === 'simple' ? SimpleDemo : AdvancedDemo
);

const getModeButtonClass = (mode: RuntimeMode) => {
  const baseClass = "inline-flex h-7 items-center justify-center gap-1 rounded-md px-2 text-xs font-medium whitespace-nowrap transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 cursor-pointer";
  return runtimeMode.value === mode
    ? `${baseClass} bg-background text-foreground shadow-sm`
    : `${baseClass} text-muted-foreground hover:bg-muted-foreground/10`;
};

const getDemoButtonClass = (demo: DemoType) => {
  const baseClass = "inline-flex h-8 flex-1 items-center justify-center gap-2 rounded-md px-3 text-sm font-medium whitespace-nowrap transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 cursor-pointer";
  return currentDemo.value === demo
    ? `${baseClass} bg-background text-foreground shadow-sm`
    : `${baseClass} text-muted-foreground hover:bg-muted-foreground/10`;
};
</script>

<template>
  <div class="min-h-screen bg-background text-foreground">
    <div class="container mx-auto px-4 py-8">
      <div class="mx-auto max-w-4xl">
        <div class="mb-8 space-y-2">
          <h1 class="text-3xl font-bold tracking-tight">Vue Demo - Svelte-React Render</h1>
          <p class="text-lg text-muted-foreground">
            React plugins rendered with Vue UI components (shadcn-vue)
          </p>
        </div>

        <div class="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div class="p-6">
            <div class="space-y-6">
              <div class="flex items-center justify-between gap-2 flex-wrap">
                <div class="text-sm font-medium text-muted-foreground">Runtime Mode:</div>
                <div class="flex gap-1 rounded-lg bg-muted p-1">
                  <button
                    :class="getModeButtonClass('worker')"
                    @click="runtimeMode = 'worker'"
                  >
                    ⚡ Web Worker
                  </button>
                  <button
                    :class="getModeButtonClass('node-server')"
                    @click="runtimeMode = 'node-server'"
                  >
                    🖥️ Node.js
                  </button>
                  <button
                    :class="getModeButtonClass('main-thread')"
                    @click="runtimeMode = 'main-thread'"
                  >
                    🧵 Main Thread
                  </button>
                </div>
              </div>

              <div class="flex gap-1 rounded-lg bg-muted p-1">
                <button
                  :class="getDemoButtonClass('simple')"
                  @click="currentDemo = 'simple'"
                >
                  Simple Demo
                </button>
                <button
                  :class="getDemoButtonClass('advanced')"
                  @click="currentDemo = 'advanced'"
                >
                  Advanced Demo
                </button>
              </div>

              <div class="flex items-center gap-2 border-b pb-4">
                <div class="h-3 w-3 rounded-full bg-red-500" />
                <div class="h-3 w-3 rounded-full bg-yellow-500" />
                <div class="h-3 w-3 rounded-full bg-green-500" />
                <span class="ml-4 font-mono text-sm text-muted-foreground overflow-hidden text-ellipsis whitespace-nowrap">
                  {{ runtimeMode === 'worker' ? pluginUrl : runtimeMode === 'node-server' ? serverUrl : `${currentDemo}-demo.tsx (local)` }}
                </span>
              </div>

              <div class="plugin-container">
                <WorkerPluginHost 
                  v-if="runtimeMode === 'worker'" 
                  :key="pluginUrl" 
                  :plugin-url="pluginUrl" 
                />
                
                <WebSocketPluginHost 
                  v-if="runtimeMode === 'node-server'" 
                  :key="serverUrl" 
                  :server-url="serverUrl" 
                />
                
                <PluginHost 
                  v-if="runtimeMode === 'main-thread'" 
                  :plugin="pluginComponent" 
                />
              </div>
            </div>
          </div>
        </div>

        <div class="mt-8 space-y-1 text-center text-sm text-muted-foreground">
          <p>Built with Vue 3, shadcn-vue, and @svelte-react-render/api</p>
          <p class="text-xs">
            {{ currentDemo === 'simple' ? 'Showing: Basic Button and Input components' : 'Showing: Form, Switch, and Toggle components' }}
          </p>
          <p v-if="runtimeMode === 'worker'" class="text-xs text-blue-500 dark:text-blue-400">
            ⚡ React plugin running in Web Worker (loaded from external server)
          </p>
          <p v-if="runtimeMode === 'node-server'" class="text-xs text-purple-500 dark:text-purple-400">
            🖥️ React plugin running in Node.js (WebSocket communication)
          </p>
          <p v-if="runtimeMode === 'main-thread'" class="text-xs text-green-500 dark:text-green-400">
            🧵 React plugin running in Main Thread (direct)
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
