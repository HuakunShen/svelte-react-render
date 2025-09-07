/**
 * Plugin API Contract Definitions
 * 
 * These TypeScript interfaces define the contracts between:
 * - Plugin developers and the plugin system
 * - React plugins and Svelte UI components
 * - Plugin registry and host application
 */

// Core Plugin Contract
export interface PluginMetadata {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  apiVersion: string;
}

export interface PluginModule {
  default: React.ComponentType;
  metadata: PluginMetadata;
}

// UI Component Contracts
export interface ButtonProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  onClick: () => void;
}

export interface ListViewItem {
  id: string;
  content: string;
  selected?: boolean;
}

export interface ListViewProps {
  items: ListViewItem[];
  onItemSelect: (id: string) => void;
  onItemRemove?: (id: string) => void;
  multiSelect?: boolean;
}

export interface InputProps {
  value: string;
  placeholder?: string;
  type?: 'text' | 'password' | 'email';
  disabled?: boolean;
  onChange: (value: string) => void;
  onSubmit?: () => void;
}

// Additional UI Component Contracts
export interface ToggleProps {
  checked: boolean;
  label?: string;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}

export interface BadgeProps {
  text: string;
  variant?: 'neutral' | 'success' | 'warning' | 'danger';
}

export interface DividerProps {
  spacing?: 'sm' | 'md' | 'lg';
}

// Plugin Registry Contracts
export interface PluginRegistryAPI {
  loadPlugin(path: string): Promise<PluginModule>;
  registerPlugin(plugin: PluginModule): void;
  unregisterPlugin(pluginId: string): void;
  getPlugin(pluginId: string): PluginModule | null;
  listPlugins(): PluginMetadata[];
}

export interface PluginContainerAPI {
  mount(pluginId: string, domNode: HTMLElement): Promise<void>;
  unmount(pluginId: string): Promise<void>;
  isActive(pluginId: string): boolean;
  getContainer(pluginId: string): PluginContainer | null;
}

// Runtime Contracts
export interface PluginContainer {
  pluginId: string;
  domNode: HTMLElement;
  reconcilerRoot: any; // ReactReconcilerRoot type
  errorBoundary: ErrorBoundaryState;
  isActive: boolean;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: string;
}

// Event Contracts
export interface PluginEvents {
  'plugin:loaded': { pluginId: string; metadata: PluginMetadata };
  'plugin:error': { pluginId: string; error: Error };
  'plugin:mounted': { pluginId: string };
  'plugin:unmounted': { pluginId: string };
}

// Error Types
export type PluginErrorType = 
  | 'PLUGIN_NOT_FOUND'
  | 'INVALID_METADATA' 
  | 'API_VERSION_MISMATCH'
  | 'COMPONENT_LOAD_ERROR'
  | 'RENDER_ERROR'
  | 'PROP_VALIDATION_ERROR'
  | 'RECONCILER_ERROR'
  | 'CONTAINER_MOUNT_ERROR';

export interface PluginError extends Error {
  type: PluginErrorType;
  pluginId?: string;
  details?: unknown;
}
