export interface WorkerAPI {
  renderPlugin(pluginCode: string, props?: unknown): Promise<void>;
  updateProps(props: unknown): Promise<void>;
  executeHandler(handlerId: string, ...args: unknown[]): Promise<void>;
  destroy(): Promise<void>;
  initialize(props?: unknown): Promise<void>;
}

export interface MainThreadAPI {
  updateComponentTree(tree: SerializedComponentTree | null): void;
  logMessage(level: 'log' | 'warn' | 'error' | 'info', ...args: unknown[]): void;
}

export interface SerializedComponentTree {
  type: string;
  props: Record<string, unknown>;
  children: (SerializedComponentTree | string)[];
  id: string;
  parent: string | null;
}
