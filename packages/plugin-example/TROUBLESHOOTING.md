# Troubleshooting Plugin Issues

## Common Errors and Solutions

### Error: "Failed to resolve module specifier 'react'"

**Symptom:**
```
Plugin Error
Failed to resolve module specifier "react". Relative references must start with either "/", "./", or "../".
```

**Cause:**
The plugin was bundling React inside it, creating bare imports like `import { useState } from "react"` that can't be resolved in the browser/worker context when loaded from static files.

**Solution:**
Keep React and the API package as **externals** in the build config:

```typescript
// build.ts
await Bun.build({
  external: [
    'react',
    'react/jsx-runtime', 
    'react/jsx-dev-runtime',
    '@svelte-react-render/api'
  ],
  // ...
});
```

This ensures the worker provides these dependencies through Vite's module resolution.

---

### Error: "Cannot read properties of null (reading 'useState')"

**Symptom:**
```
Plugin Error
Cannot read properties of null (reading 'useState')
```

**Cause:**
There were **two different React instances**:
1. React imported by the worker (from Vite)
2. React bundled inside the plugin

When the plugin tried to use `useState`, it used the bundled React instance, which didn't have the proper initialization context from the worker's React instance.

**Solution:**
1. Mark React as external (see above)
2. Deploy plugin to a location that Vite processes (not `static/`):

```typescript
// build.ts
const hostPluginsDir = join(import.meta.dir, '../demo-sveltekit/src/lib/plugins-dist');
```

This ensures:
- Vite can resolve bare imports like `import { useState } from "react"`
- The worker and plugin share the same React instance
- Hot module replacement works

---

## Architecture Notes

### Why Not Bundle Everything?

You might think bundling everything (including React) would make the plugin more portable, but it causes issues:

1. **Multiple React Instances**: The worker needs React too, leading to duplicate instances
2. **Size**: Bundling React adds 700KB+ to each plugin
3. **Module Resolution**: Browsers can't resolve bare imports without an import map

### The Correct Approach

**Externals Pattern:**
- Mark shared dependencies as external
- Let the host environment (worker) provide them
- Bundle only plugin-specific code

**Benefits:**
- ✅ Single React instance
- ✅ Smaller bundle size (11KB vs 741KB)
- ✅ Faster loading
- ✅ Proper state management
- ✅ Vite HMR works

### File Structure

```
plugin-example/
├── src/index.tsx           # Plugin source
├── dist/index.js           # Bundled (externals)
└── build.ts                # Build script

demo-sveltekit/
├── src/lib/
│   └── plugins-dist/       # ✅ Deployed here (Vite processes)
│       └── advanced-demo.js
└── static/
    └── plugins/            # ❌ Don't deploy here (no Vite)
```

**Why `src/lib/plugins-dist/` instead of `static/`?**

Files in `static/` are served as-is without Vite processing:
- ❌ Bare imports don't work
- ❌ No module resolution
- ❌ No HMR

Files in `src/lib/` go through Vite:
- ✅ Bare imports resolved
- ✅ Module resolution works
- ✅ HMR enabled

---

## Build Configuration

### Correct Bun.build() Setup

```typescript
await Bun.build({
  entrypoints: ['./src/index.tsx'],
  outdir: './dist',
  target: 'browser',
  format: 'esm',
  
  // Mark shared deps as external
  external: [
    'react',
    'react/jsx-runtime',
    'react/jsx-dev-runtime',
    '@svelte-react-render/api'
  ],
  
  // Production build
  define: {
    'process.env.NODE_ENV': '"production"',
  },
});
```

### What Gets Bundled vs External

**Bundled:**
- Plugin-specific code
- Plugin dependencies (npm packages)
- Local utilities and helpers

**External (provided by worker):**
- `react` - Core React library
- `react/jsx-runtime` - JSX transform runtime
- `@svelte-react-render/api` - Bridge components

---

## Testing Checklist

When making changes to the plugin:

1. **Build the plugin:**
   ```bash
   cd packages/plugin-example
   pnpm build
   ```

2. **Check bundle size:**
   ```bash
   ls -lh ../demo-sveltekit/src/lib/plugins-dist/advanced-demo.js
   # Should be ~11KB, not 700KB+
   ```

3. **Verify bare imports:**
   ```bash
   head -20 ../demo-sveltekit/src/lib/plugins-dist/advanced-demo.js
   # Should see: import { useState } from "react";
   ```

4. **Test in browser:**
   - Open dev server
   - Switch to "Advanced Demo"
   - Check console for errors
   - Test interactions (switches, toggles, form submission)

---

## Development Tips

### Watch Mode

For active development, use watch mode:

```bash
pnpm dev
```

This rebuilds automatically but doesn't copy to the host app. You'll need to manually rebuild (`pnpm build`) to test in the host.

### Quick Iteration

For faster iteration during development:

1. Edit `src/index.tsx`
2. Run `pnpm build`
3. Vite HMR will update the page automatically

### Debugging

Enable verbose logging in the worker:

```typescript
// In the plugin
console.log('[Plugin]', 'Debug message');
```

Check both:
- Browser console (main thread)
- Worker logs (filtered by "[Worker]" prefix)

