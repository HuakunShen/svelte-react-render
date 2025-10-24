# Simplified Svelte-React Render

A minimal plugin system where React plugins are rendered using Svelte 5 components through a custom React reconciler.

## What Was Simplified

- ✅ **Removed Complex Components**: Action, ActionPanel, Form, List, and navigation systems
- ✅ **Kept Core Components**: Only Button and Input components remain
- ✅ **Simplified Reconciler**: Handles only basic component types and HTML elements
- ✅ **Removed Navigation**: No more push/pop navigation or action panels
- ✅ **Clean Architecture**: Straightforward React → Svelte mapping

## Current Architecture

### API Package (`packages/api/`)
**React Components:**
- `Button` - Simple button with title, icon, variants, and onClick
- `Input` - Text input with label, placeholder, and onChange handlers

**Reconciler:**
- Custom React reconciler that creates a tree of component instances
- Maps React components to Svelte component instances
- Simple bridge pattern for updates

### App Package (`packages/app/`)
**Svelte UI Components:**
- `Button.svelte` - Tailwind-styled button component
- `Input.svelte` - Tailwind-styled input component

**Plugin System:**
- `PluginHost.svelte` - Mounts and renders React plugins
- `ComponentRenderer.svelte` - Maps React instances to Svelte components

**Demo Plugin:**
- `simple-demo.tsx` - React plugin showing Button and Input usage with state

## Key Features

1. **State Management**: React `useState` works seamlessly
2. **Event Handling**: Click and input events flow from React to Svelte
3. **Type Safety**: Full TypeScript support
4. **Styling**: Tailwind CSS classes for clean, modern UI
5. **Performance**: Efficient React reconciler with minimal overhead

## Example Usage

### React Plugin Code
```tsx
import { useState } from 'react';
import { Button, Input } from '@svelte-react-render/api';

export default function SimpleDemo() {
  const [name, setName] = useState('');
  const [count, setCount] = useState(0);

  return (
    <div style={{ padding: '20px' }}>
      <Input
        label="Your Name"
        placeholder="Enter your name"
        value={name}
        onChange={(value) => setName(value)}
      />

      <Button
        title={`Count: ${count}`}
        onClick={() => setCount(count + 1)}
      />
    </div>
  );
}
```

### Svelte Host Application
```svelte
<script lang="ts">
  import { createElement } from 'react';
  import PluginHost from './plugin/PluginHost.svelte';
  import SimpleDemo from './plugins/simple-demo';

  const pluginElement = createElement(SimpleDemo);
</script>

<PluginHost {pluginElement} />
```

## Running the Project

```bash
# Install dependencies
pnpm install

# Build the API package
pnpm build:api

# Start development server
pnpm dev

# Type check
pnpm check
```

The app will be available at `http://localhost:5174/`

## Technical Implementation

### React → Svelte Mapping

| React Component | Svelte Component | Props |
|----------------|------------------|-------|
| `Button` | `Button.svelte` | title, icon, variant, onClick |
| `Input` | `Input.svelte` | label, placeholder, value, onChange |

### Event Handling
- React `onClick` → Svelte `onclick`
- React `onChange` → Svelte `oninput` and `onchange`

### Styling
- Uses Tailwind CSS classes for responsive, consistent styling
- Supports light theme by default
- Button variants: primary (blue) and secondary (white)

## Next Steps

This simplified foundation can be extended with:
1. More UI components (Select, Checkbox, etc.)
2. Theming system
3. Form validation
4. Async data loading
5. Plugin isolation/security
6. Hot module replacement

## Benefits of Simplification

- **Easier to Understand**: Fewer moving parts and clearer data flow
- **Better Performance**: No navigation overhead or complex state management
- **Easier to Debug**: Straightforward React→Svelte mapping
- **Faster Development**: Simple API makes it quick to build new plugins
- **Maintainable**: Less code means fewer bugs and easier updates