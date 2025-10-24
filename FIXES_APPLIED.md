# Fixes Applied - Plugin Architecture

## Issues Fixed

### Issue 1: "Failed to resolve module specifier 'react'"

**Error:**
```
Plugin Error
Failed to resolve module specifier "react". Relative references must start with either "/", "./", or "../".
```

**Root Cause:**
Initially, we tried to bundle everything including React into the plugin. However, the bundled file was placed in `static/plugins/` which is served as-is by the web server without Vite processing. This meant bare imports like `import { useState } from "react"` couldn't be resolved in the browser/worker context.

**Fix:**
1. Marked React and API package as **externals** in the build
2. Moved deployment location from `static/plugins/` to `src/lib/plugins-dist/`
3. This allows Vite to process the plugin file and resolve bare imports

### Issue 2: "Cannot read properties of null (reading 'useState')"

**Error:**
```
Plugin Error
Cannot read properties of null (reading 'useState')
```

**Root Cause:**
When we first tried bundling React, we created **two separate React instances**:
1. React imported by the worker from Vite's dev server
2. React bundled inside the plugin file

These two instances had separate internal state. When the plugin tried to use `useState`, it used the bundled React instance which didn't have the proper hooks context set up by the worker's React instance.

**Fix:**
Keep React as an external dependency so the worker and plugin share the same React instance.

## Solution Summary

### Before (Incorrect)

```typescript
// build.ts
await Bun.build({
  entrypoints: ['./src/index.tsx'],
  // No externals - bundled everything
});

// Copied to static/plugins/advanced-demo.js (741KB)
// Result: 
// - ❌ Multiple React instances
// - ❌ Bare imports can't resolve
// - ❌ useState errors
```

### After (Correct)

```typescript
// build.ts
await Bun.build({
  entrypoints: ['./src/index.tsx'],
  external: [
    'react',
    'react/jsx-runtime',
    'react/jsx-dev-runtime',
    '@svelte-react-render/api'
  ],
});

// Copied to src/lib/plugins-dist/advanced-demo.js (11KB)
// Result:
// - ✅ Single React instance (from worker)
// - ✅ Vite resolves bare imports
// - ✅ Everything works!
```

## Key Learnings

### 1. Externals Pattern

**For shared dependencies:**
- Don't bundle framework code (React, Vue, etc.)
- Don't bundle host-provided APIs
- Let the host environment provide these

**Bundle only:**
- Plugin-specific code
- Plugin-specific dependencies
- Business logic

### 2. Deployment Location Matters

**`static/` folder:**
- ❌ Served as-is
- ❌ No Vite processing
- ❌ Bare imports don't work
- ✅ Good for assets (images, fonts)

**`src/lib/` folder:**
- ✅ Processed by Vite
- ✅ Module resolution works
- ✅ HMR enabled
- ✅ Good for code

### 3. Bundle Size Comparison

| Approach | Size | React Included | Works? |
|----------|------|----------------|--------|
| Bundle everything → static | 741KB | Yes (bundled) | ❌ No |
| Externals → static | 11KB | No (bare import) | ❌ No |
| Externals → src/lib | 11KB | No (Vite resolves) | ✅ Yes |

## Architecture Diagram

### Incorrect (Multiple React Instances)

```
Worker:
  ├─ React v18.3.1 (from Vite)      ← Instance A
  └─ imports plugin

Plugin Bundle:
  ├─ React v18.3.1 (bundled)        ← Instance B ❌
  └─ Plugin code uses Instance B
      └─ useState() → null error!
```

### Correct (Single React Instance)

```
Worker:
  ├─ React v18.3.1 (from Vite)      ← Single Instance
  └─ imports plugin

Plugin Bundle:
  ├─ import { useState } from "react"  ← Resolves to Worker's React ✅
  └─ Plugin code uses same instance
      └─ useState() → works!
```

## Files Modified

### 1. `packages/plugin-example/build.ts`

**Changes:**
- Added `external` array to mark React/API as externals
- Changed deployment from `static/plugins/` to `src/lib/plugins-dist/`
- Added production build configuration

### 2. `packages/demo-sveltekit/src/routes/+page.svelte`

**Changes:**
- Updated plugin URL from `/plugins/advanced-demo.js` to `/src/lib/plugins-dist/advanced-demo.js`

### 3. `packages/demo-sveltekit/.gitignore`

**Changes:**
- Added `src/lib/plugins-dist` to ignore built plugins

### 4. New Documentation Files

- `packages/plugin-example/TROUBLESHOOTING.md` - Common errors and solutions
- `FIXES_APPLIED.md` - This file

## Testing

To verify the fix works:

1. **Build the plugin:**
   ```bash
   cd packages/plugin-example
   pnpm build
   ```

2. **Check bundle size:**
   ```bash
   ls -lh ../demo-sveltekit/src/lib/plugins-dist/advanced-demo.js
   # Should show: ~11K (not 741K)
   ```

3. **Verify bare imports:**
   ```bash
   head -20 ../demo-sveltekit/src/lib/plugins-dist/advanced-demo.js
   ```
   Should see:
   ```javascript
   import { useState } from "react";
   import { Button, Input, Switch, ... } from "@svelte-react-render/api";
   ```

4. **Test in browser:**
   ```bash
   cd packages/demo-sveltekit
   pnpm dev
   ```
   - Navigate to http://localhost:5173
   - Switch to "Advanced Demo"
   - Should load without errors
   - Test switches, toggles, form submission
   - All features should work

## Benefits of This Approach

### Performance
- **67x smaller bundle** (11KB vs 741KB)
- Faster plugin loading
- Better caching (React cached separately)

### Correctness
- Single React instance = proper state management
- No useState/hooks errors
- Consistent behavior

### Developer Experience
- Hot module replacement works
- Faster rebuilds
- Clear error messages

### Portability
- Standard ES modules
- Works with Vite, Rollup, webpack
- Can publish to npm

## Future Improvements

### For Production
1. **Import Maps**: Use import maps for even better control
2. **CDN**: Could serve React from CDN
3. **Versioning**: Handle React version compatibility
4. **Caching**: Optimize caching strategy

### For Development
1. **Watch Mode**: Auto-rebuild and copy on changes
2. **Dev Server**: Direct integration with Vite dev server
3. **Source Maps**: Better debugging support

## Conclusion

The key insight is that **plugins should use the host's framework instance, not bundle their own**. This is a common pattern in plugin architectures:

- VS Code extensions use VS Code's Electron/Node
- Browser extensions use the browser's APIs
- Figma plugins use Figma's runtime

Our plugins should use the worker's React instance, not bundle their own.

**Final Architecture:**
- ✅ Plugin = business logic only (11KB)
- ✅ Worker = provides React + API
- ✅ Vite = resolves bare imports
- ✅ Single React instance = happy developers! 🎉

