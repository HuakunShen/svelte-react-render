// RPC type definitions for bidirectional communication between main thread and worker

export interface WorkerAPI {
  // Worker exposes these methods to main thread
  renderPlugin(pluginCode: string, props?: any): Promise<void>;
  updateProps(props: any): Promise<void>;
  executeHandler(handlerId: string, ...args: any[]): Promise<void>;
  destroy(): Promise<void>;
}

export interface MainThreadAPI {
  // Main thread exposes these methods to worker
  updateComponentTree(tree: SerializedComponentTree | null): void;
  logMessage(level: 'log' | 'warn' | 'error' | 'info', ...args: any[]): void;
}

export interface SerializedComponentTree {
  type: string;
  props: Record<string, any>;
  children: (SerializedComponentTree | string)[];
  id: string;
  parent: string | null;
}

