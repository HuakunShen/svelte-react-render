# Quick Start Guide

## Running the Demo

```bash
# Install dependencies (if not already done)
pnpm install

# Start dev server
pnpm dev

# Open browser
http://localhost:5173
```

## UI Controls

### Runtime Mode Selector
Located at the top of the demo:
- **⚡ Web Worker** - Sandboxed execution (default)
- **🧵 Main Thread** - Direct execution

### Plugin Selector
Two demo plugins available:
- **Simple Demo** - Basic Button and Input components
- **Advanced Demo** - Form, Switch, Toggle, and complex interactions

## Testing the Dual-Mode System

### Test Scenario 1: Plugin Switching in Worker Mode
1. Ensure "Web Worker" is selected
2. Click "Simple Demo" - should show counter and input
3. Click "Advanced Demo" - should show form with switches
4. Interact with components
5. Switch back to "Simple Demo" - state should reset

### Test Scenario 2: Plugin Switching in Main Thread Mode
1. Click "Main Thread" mode
2. Repeat steps 2-5 from Scenario 1
3. Notice faster switching (no serialization)

### Test Scenario 3: Runtime Mode Switching
1. Start in "Web Worker" mode
2. Use Simple Demo, interact with it
3. Switch to "Main Thread" mode
4. Plugin reloads in new mode
5. State resets
6. Interact again - should feel snappier
7. Switch back to "Web Worker"

### Test Scenario 4: Event Handlers in Worker Mode
1. Select "Web Worker" mode
2. Go to "Advanced Demo"
3. Click switches - should toggle smoothly
4. Click toggle buttons (Email/SMS/Push) - should update
5. Fill form and submit - should show success message
6. Check browser console - should see RPC messages

### Test Scenario 5: Performance Comparison
1. Open browser DevTools (F12)
2. Go to Performance tab
3. Record in Worker mode:
   - Switch between demos
   - Click buttons rapidly
   - Note timing
4. Switch to Main Thread mode
5. Repeat same actions
6. Compare performance profiles

## Browser Console

### Worker Mode Logs
```
[Worker] Rendering plugin: /src/plugins/simple-demo.tsx
[Worker] Plugin rendered successfully
[Worker] Bridge updated, serializing tree
[Main] Received component tree update
[Main] Plugin URL changed, re-rendering: /src/plugins/advanced-demo.tsx
[Worker] Executing handler: handler_0
```

### Main Thread Mode Logs
```
PluginHost: Rendering plugin
PluginHost: Bridge update triggered
ComponentRenderer created/updated with instance: {...}
```

## Debugging

### Worker Mode Debugging
1. Open Chrome DevTools
2. Go to Sources tab
3. Look for "react-plugin.worker.ts" in file tree
4. Set breakpoints
5. Interact with plugin to trigger breakpoints

### Main Thread Mode Debugging
1. Open Chrome DevTools
2. Go to Sources tab
3. Look for "simple-demo.tsx" or "advanced-demo.tsx"
4. Set breakpoints
5. Interact with plugin

## Common Issues

### Issue: Worker mode shows "Loading plugin…" forever
**Solution:** Check browser console for errors. Likely a module import issue.

### Issue: Switching plugins doesn't work in Worker mode
**Solution:** This should be fixed now. If still happening, check console for RPC errors.

### Issue: Event handlers not working in Worker mode
**Solution:** Check that handler IDs are being generated and RPC calls are succeeding.

### Issue: Performance is slow in Worker mode
**Solution:** This is expected due to serialization. Use Main Thread mode for performance-critical scenarios.

## Building for Production

```bash
# Build both packages
pnpm build

# Output will be in packages/app/dist/
# - index.html
# - assets/index-*.js (main bundle)
# - assets/react-plugin.worker-*.js (worker bundle)
# - assets/index-*.css
```

## Next Steps

### Creating Your Own Plugin

1. Create a new file in `packages/app/src/plugins/`:
```typescript
// my-plugin.tsx
import { useState } from 'react';
import { Button, Input } from '@svelte-react-render/api';

export default function MyPlugin() {
  const [value, setValue] = useState('');
  
  return (
    <div className="p-6">
      <h2 className="text-2xl mb-4">My Plugin</h2>
      <Input
        label="Enter something"
        value={value}
        onChange={(v) => setValue(v)}
      />
      <Button
        title="Click me"
        onClick={() => alert(`You entered: ${value}`)}
      />
    </div>
  );
}
```

2. Import in `App.svelte`:
```typescript
import MyPlugin from "./plugins/my-plugin";

// Add to plugin selector
let pluginElement = $derived(
  currentDemo === 'my-plugin' ? MyPlugin : ...
);

let pluginUrl = $derived(
  currentDemo === 'my-plugin' 
    ? '/src/plugins/my-plugin.tsx'
    : ...
);
```

3. Add tab in UI

### Available Components

See `packages/api/src/components/` for available React components:
- Button
- Input
- Switch
- Toggle
- Form components (FormField, FormControl, FormLabel, etc.)

All components automatically work in both Worker and Main Thread modes!

