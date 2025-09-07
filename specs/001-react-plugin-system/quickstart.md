# Quickstart Guide - React Plugin System

## Overview

This guide demonstrates the React Plugin System by creating and running the TODO list plugin example. You'll learn how React components render within a Svelte 5 application through the custom reconciler.

## Prerequisites

- Node.js 18+ installed
- TypeScript knowledge
- Basic understanding of React and Svelte

## Step 1: Setup Development Environment

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# In another terminal, run tests
npm run test
```

## Step 2: Create Your First Plugin

Create a new plugin file at `src/plugins/todo-plugin/index.tsx`:

```tsx
import React, { useState } from 'react';
import { PluginModule } from '../../../specs/001-react-plugin-system/contracts/plugin-api';

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

const TodoPlugin: React.FC = () => {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [inputText, setInputText] = useState('');

  const addTodo = () => {
    if (inputText.trim()) {
      const newTodo: TodoItem = {
        id: Date.now().toString(),
        text: inputText.trim(),
        completed: false
      };
      setTodos([...todos, newTodo]);
      setInputText('');
    }
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const listItems = todos.map(todo => ({
    id: todo.id,
    content: `${todo.completed ? '✅' : '⏳'} ${todo.text}`,
    selected: todo.completed
  }));

  return (
    <>
      <plugin-input
        value={inputText}
        placeholder="Add a new todo..."
        onChange={setInputText}
        onSubmit={addTodo}
      />
      <plugin-button
        label="Add Todo"
        variant="primary"
        onClick={addTodo}
        disabled={!inputText.trim()}
      />
      <plugin-listview
        items={listItems}
        onItemSelect={toggleTodo}
      />
    </>
  );
};

export default TodoPlugin;

export const metadata = {
  id: 'todo-plugin',
  name: 'TODO List',
  version: '1.0.0',
  description: 'Simple todo list with add and toggle functionality',
  author: 'Example Developer',
  apiVersion: '1.0.0'
};
```

## Step 3: Load the Plugin

In your main Svelte app (`src/App.svelte`), load and render the plugin:

```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import PluginContainer from './lib/PluginContainer.svelte';
  
  let pluginRegistry: any;
  let loadedPlugins: string[] = [];

  onMount(async () => {
    // Initialize plugin system
    const { PluginRegistry } = await import('./lib/plugin-system');
    pluginRegistry = new PluginRegistry();
    
    // Load the TODO plugin
    await pluginRegistry.loadPlugin('./plugins/todo-plugin/index.tsx');
    loadedPlugins = pluginRegistry.listPlugins().map(p => p.id);
  });
</script>

<main>
  <h1>Plugin System Demo</h1>
  
  {#each loadedPlugins as pluginId}
    <div class="plugin-container">
      <PluginContainer {pluginId} {pluginRegistry} />
    </div>
  {/each}
</main>

<style>
  .plugin-container {
    border: 1px solid #ccc;
    border-radius: 8px;
    padding: 16px;
    margin: 16px 0;
  }
</style>
```

## Step 4: Verify Plugin Rendering

1. **Start the dev server**: The TODO plugin should render within your Svelte app
2. **Test interactions**:
   - Type in the input field
   - Click "Add Todo" button  
   - Click on todo items to toggle completion
3. **Check styling**: All UI elements should match your Svelte app's theme

## Expected Results

✅ **Plugin loads successfully** - No console errors during plugin loading  
✅ **React components render** - Input, button, and list appear correctly  
✅ **Interactions work** - Adding and toggling todos functions properly  
✅ **Styling consistent** - UI elements match host app appearance  
✅ **Error isolation** - Plugin errors don't crash the host app  

## Troubleshooting

### Plugin Not Loading
- Check file path in `loadPlugin()` call
- Verify plugin exports `default` component and `metadata`
- Check browser console for import errors

### Styling Issues  
- Ensure Svelte UI components are properly registered
- Check that reconciler maps React elements to Svelte components
- Verify CSS variables are passed to plugin context

### Runtime Errors
- Check React DevTools for component tree
- Verify prop types match contract definitions
- Test with browser error boundaries enabled

## Next Steps

### Create Additional Plugins
- Counter plugin with increment/decrement buttons
- Settings plugin with form inputs
- Calculator plugin with grid layout

### Extend UI Components
- Add more Svelte components (dropdown, modal, tabs)
- Implement theming system
- Add animation and transition support

### Advanced Features
- Plugin hot-reloading in development  
- Plugin marketplace integration
- Inter-plugin communication system

## Testing Your Plugin

Run the test suite to validate your plugin:

```bash
# Unit tests for plugin logic
npm run test -- --grep "todo-plugin"

# Integration tests for reconciler
npm run test -- --grep "plugin-container"

# E2E tests for full workflow
npm run test:e2e
```

## Performance Validation

Monitor plugin performance:
- Check bundle size impact: `npm run build -- --analyze`
- Profile rendering performance in React DevTools
- Monitor memory usage with multiple plugins loaded
- Test plugin loading/unloading cycles