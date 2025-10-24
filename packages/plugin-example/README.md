# Plugin Example

This is an example external plugin package for `@svelte-react-render`. It demonstrates how to build React plugins as separate packages that can be loaded into a Svelte host application.

## Architecture

This plugin is a **standalone package** that:
1. Uses React to build UI components
2. Imports components from `@svelte-react-render/api`
3. Gets bundled into a single JavaScript file
4. Is loaded into the host app's Web Worker at runtime

## Development

### Install dependencies

```bash
pnpm install
```

### Build the plugin

```bash
pnpm build
```

This will:
1. Bundle `src/index.tsx` using Bun
2. Copy the bundled `dist/index.js` to `../demo-sveltekit/static/plugins/advanced-demo.js`
3. The host app can now load it from `/plugins/advanced-demo.js`

### Watch mode

```bash
pnpm dev
```

This watches for changes and rebuilds automatically (but doesn't copy to static folder).

## Plugin Structure

- `src/index.tsx` - Main plugin component (must have a default export)
- `dist/` - Build output
- `build.ts` - Build script that bundles and deploys the plugin

## How it works

1. **Build Phase**: The plugin is bundled with React and API package marked as **external** (not bundled)
2. **Deployment**: The bundled JS is copied to the host app's `src/lib/plugins-dist/` (processed by Vite)
3. **Runtime**: The host app loads the plugin URL into a Web Worker
4. **Module Resolution**: Vite resolves bare imports (`react`, `@svelte-react-render/api`) for the plugin
5. **Execution**: The worker dynamically imports the plugin and renders it with React
6. **Rendering**: The React tree is serialized and sent to the main thread where Svelte renders the UI

### Why Externals?

The plugin **doesn't bundle** React or the API package because:
- ✅ The worker already has React available through Vite
- ✅ Avoids multiple React instances (causes state issues)
- ✅ Smaller bundle size (11KB vs 741KB)
- ✅ Single source of truth for React state

## Key Features

- ✅ Full React state management
- ✅ Event handlers work across worker boundary
- ✅ TypeScript support
- ✅ Hot reload in development
- ✅ Production-ready bundling

## Extending

To create your own plugin:

1. Copy this package structure
2. Modify `src/index.tsx` with your React component
3. Run `pnpm build`
4. Load it in the host app with `<WorkerPluginHost pluginUrl="/plugins/your-plugin.js" />`

