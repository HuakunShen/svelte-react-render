/**
 * React Reconciler API Contract
 * 
 * Defines the contract between React and Svelte through the custom reconciler.
 * Based on react-reconciler package types.
 */

// Reconciler Host Config Contract
export interface HostConfig {
  // Instance management
  createInstance(type: string, props: any): SvelteComponentInstance;
  createTextInstance(text: string): Text;
  appendChildToContainer(container: HTMLElement, child: any): void;
  appendChild(parent: any, child: any): void;
  insertBefore(parent: any, child: any, beforeChild: any): void;
  
  // Updates
  commitUpdate(instance: any, updatePayload: any, type: string, oldProps: any, newProps: any): void;
  commitTextUpdate(textInstance: Text, oldText: string, newText: string): void;
  
  // Removal
  removeChild(parent: any, child: any): void;
  removeChildFromContainer(container: HTMLElement, child: any): void;
  
  // Properties
  getPublicInstance(instance: any): any;
  getRootHostContext(rootContainer: HTMLElement): HostContext;
  getChildHostContext(parentHostContext: HostContext, type: string): HostContext;
  
  // Preparation and finalization
  prepareUpdate(instance: any, type: string, oldProps: any, newProps: any): any;
  finalizeInitialChildren(instance: any, type: string, props: any): boolean;
  
  // Scheduling
  shouldSetTextContent(type: string, props: any): boolean;
  scheduleTimeout: typeof setTimeout;
  cancelTimeout: typeof clearTimeout;
  noTimeout: -1;
  now: () => number;
  
  // Feature flags
  supportsMutation: true;
  supportsPersistence: false;
  supportsHydration: false;
}

// Host Context (styling, theming info passed down the tree)
export interface HostContext {
  theme: 'light' | 'dark';
  namespace?: string;
}

// Svelte Component Instance (created by reconciler)
export interface SvelteComponentInstance {
  type: 'button' | 'listview' | 'input' | 'toggle' | 'badge' | 'divider';
  svelteComponent: any; // SvelteComponent instance
  props: Record<string, any>;
  children: Array<SvelteComponentInstance | Text>;
  domNode?: HTMLElement;
}

// Reconciler Root Contract
export interface ReactReconcilerRoot {
  render(element: React.ReactNode): void;
  unmount(): void;
  _internalRoot: any; // Internal reconciler root
}

// Reconciler Factory Contract
export interface ReconcilerFactory {
  createRoot(container: HTMLElement, hostContext?: HostContext): ReactReconcilerRoot;
  updateContainer(element: React.ReactNode, root: ReactReconcilerRoot): void;
}

// Component Type Mapping
export type ReconcilerComponentType =
  | 'plugin-button'
  | 'plugin-listview'
  | 'plugin-input'
  | 'plugin-toggle'
  | 'plugin-badge'
  | 'plugin-divider';

export interface ComponentTypeMapping {
  'plugin-button': {
    props: import('./plugin-api').ButtonProps;
    svelteComponent: 'Button';
  };
  'plugin-listview': {
    props: import('./plugin-api').ListViewProps;
    svelteComponent: 'ListView';
  };
  'plugin-input': {
    props: import('./plugin-api').InputProps;
    svelteComponent: 'Input';
  };
  'plugin-toggle': {
    props: import('./plugin-api').ToggleProps;
    svelteComponent: 'Toggle';
  };
  'plugin-badge': {
    props: import('./plugin-api').BadgeProps;
    svelteComponent: 'Badge';
  };
  'plugin-divider': {
    props: import('./plugin-api').DividerProps;
    svelteComponent: 'Divider';
  };
}
