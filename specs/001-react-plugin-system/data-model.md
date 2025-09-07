# Data Model - React Plugin System

## Core Entities

### Plugin
**Purpose**: Represents a third-party extension with React components and metadata
**Fields**:
- `id`: string (unique identifier, e.g., "todo-plugin")
- `name`: string (display name, e.g., "TODO List")
- `version`: string (semantic version, e.g., "1.0.0")  
- `description`: string (user-facing description)
- `author`: string (plugin developer name)
- `entry`: string (main component file path)
- `apiVersion`: string (required plugin API version)

**Relationships**:
- Has one PluginContainer (runtime execution context)
- Contains multiple React components
- May use multiple UI components

**Validation Rules**:
- ID must be unique across all plugins
- Version must follow semantic versioning (x.y.z)
- Entry must point to valid React component
- API version must match supported versions

### PluginContainer  
**Purpose**: Runtime boundary that manages plugin lifecycle and isolation
**Fields**:
- `pluginId`: string (reference to Plugin.id)
- `domNode`: HTMLElement (mount point in Svelte app)
- `reconcilerRoot`: ReactReconcilerRoot (React fiber root)
- `errorBoundary`: ErrorBoundaryState (error handling state)
- `isActive`: boolean (currently visible/rendered)

**State Transitions**:
- LOADING → READY (plugin loaded successfully)
- LOADING → ERROR (plugin failed to load)
- READY → ACTIVE (plugin mounted and visible)  
- ACTIVE → INACTIVE (plugin hidden but not unmounted)
- ANY → ERROR (plugin crashed during execution)

### UIComponent
**Purpose**: Svelte components exposed to React plugins via reconciler
**Fields**:
- `type`: 'button' | 'listview' | 'input' (component type)
- `props`: Record<string, any> (Svelte component props)
- `events`: Record<string, Function> (event handlers)
- `svelteInstance`: SvelteComponent (actual Svelte component)

**Relationships**:  
- Belongs to one PluginContainer
- Maps to one Svelte component
- Receives props from React elements

**Validation Rules**:
- Type must be one of supported UI component types
- Props must match Svelte component prop schema
- Events must follow naming convention (on*)

### PluginRegistry
**Purpose**: Manages plugin discovery, loading, and lifecycle
**Fields**:
- `plugins`: Map<string, Plugin> (loaded plugins by ID)
- `containers`: Map<string, PluginContainer> (active containers)
- `supportedApiVersions`: string[] (compatible API versions)

**Operations**:
- `loadPlugin(path: string): Promise<Plugin>` - Dynamic import and validate
- `createContainer(pluginId: string): PluginContainer` - Setup reconciler
- `mountPlugin(pluginId: string, domNode: HTMLElement): void` - Render plugin
- `unmountPlugin(pluginId: string): void` - Cleanup plugin

## Component Prop Schemas

### Button Component
```typescript
interface ButtonProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  onClick: () => void;
}
```

### ListView Component  
```typescript
interface ListViewProps {
  items: Array<{
    id: string;
    content: string;
    selected?: boolean;
  }>;
  onItemSelect: (id: string) => void;
  multiSelect?: boolean;
}
```

### Input Component
```typescript
interface InputProps {
  value: string;
  placeholder?: string;
  type?: 'text' | 'password' | 'email';
  disabled?: boolean;
  onChange: (value: string) => void;
  onSubmit?: () => void;
}
```

## Plugin API Interface

### Plugin Module Structure
```typescript
interface PluginModule {
  default: React.ComponentType; // Main plugin component
  metadata: {
    id: string;
    name: string;
    version: string;
    description: string;
    author: string;
    apiVersion: string;
  };
}
```

### Available React Components (provided by reconciler)
```typescript
// These components are available in React plugins
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'plugin-button': ButtonProps;
      'plugin-listview': ListViewProps;
      'plugin-input': InputProps;
    }
  }
}
```

## Error States

### Plugin Loading Errors
- `PLUGIN_NOT_FOUND`: Entry file doesn't exist
- `INVALID_METADATA`: Missing or malformed plugin metadata
- `API_VERSION_MISMATCH`: Plugin requires unsupported API version
- `COMPONENT_LOAD_ERROR`: React component failed to load

### Runtime Errors  
- `RENDER_ERROR`: Plugin component threw during render
- `PROP_VALIDATION_ERROR`: Invalid props passed to UI component
- `RECONCILER_ERROR`: Custom reconciler encountered error
- `CONTAINER_MOUNT_ERROR`: Failed to mount plugin in DOM

## State Management

### Plugin Internal State
- Plugins use standard React hooks (useState, useReducer, useEffect)
- No shared state between plugins initially
- State is reset when plugin unmounts

### Host Application State
- Plugin registry state managed by Svelte stores
- Active plugin tracking
- Error boundary state per plugin
- UI theme/styling state (shared with plugins)

## Performance Considerations

### Lazy Loading
- Plugin modules loaded on-demand via dynamic import()
- Reconciler trees created only when plugin becomes active
- Unused plugins can be garbage collected

### Memory Management
- Plugin containers cleaned up on unmount
- React reconciler roots properly disposed
- Event listeners removed during cleanup

### Bundle Optimization
- UI components code-split from main bundle
- Plugin API types exported separately
- React reconciler loaded only when plugins are used