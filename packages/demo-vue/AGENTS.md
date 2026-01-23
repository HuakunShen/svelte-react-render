# PROJECT KNOWLEDGE BASE: demo-vue

**Generated:** 2026-01-24
**Type:** Experimental Vue Host

## OVERVIEW
An experimental host implementation using Vue 3. It replicates the core bridge logic found in the SvelteKit host, enabling React plugins to render via the Vue 3 Composition API.

## STRUCTURE
```
.
├── src/
│   ├── lib/plugin/        # Core Bridge Logic
│   │   ├── ComponentRenderer.vue  # Recursive Virtual Tree Renderer
│   │   ├── PluginHost.vue         # Main Thread Bridge
│   │   ├── WorkerPluginHost.vue   # Web Worker Bridge
│   │   └── WebSocketPluginHost.vue # Node.js WebSocket Bridge
│   └── components/ui/     # Vue-based Primitive Implementations
├── vite.config.ts         # Rolldown-Vite configuration
└── package.json           # Uses rolldown-vite for builds
```

## WHERE TO LOOK
- **ComponentRenderer.vue**: The heart of the host. Maps serialized React nodes to Vue components.
- **PluginHost.vue**: Orchestrates the communication between the React runtime and Vue UI.
- **src/lib/plugin/components/**: Contains the actual Vue components that replace React primitives (e.g., `PluginButton.vue`).

## KEY DIFFERENCES
- **Bundler**: Uses `rolldown-vite` instead of standard Vite for performance experimentation.
- **Event System**: Translates React-style handler IDs (`_onClickHandlerId`) into Vue event emitters (`@click`) or specific event handlers.
- **Reactivity**: Replaces Svelte 5 Runes with Vue 3 `ref`, `computed`, and `v-bind`/`v-on` for tree synchronization.
- **Composition API**: Uses `defineProps` and `defineEmits` to handle the bridge lifecycle.

## ANTI-PATTERNS
- **Prop Overload**: Avoid passing raw RPC handlers directly to standard HTML elements; use the `eventListeners` computed map.
- **Direct Store Access**: Maintain the flow of `instance` props through the component tree rather than global state for node rendering.
