// Global bridge that connects React reconciler to Svelte
export interface SimpleRenderBridge {
  rootInstance: import('./types').SvelteComponentInstance | null;
  subscribers: Set<() => void>;
  subscribe: (callback: () => void) => () => void;
  update: () => void;
}

export function createRenderBridge(): SimpleRenderBridge {
  const bridge: SimpleRenderBridge = {
    rootInstance: null,
    subscribers: new Set(),

    subscribe(callback: () => void) {
      bridge.subscribers.add(callback);
      return () => {
        bridge.subscribers.delete(callback);
      };
    },

    update() {
      bridge.subscribers.forEach(callback => callback());
    },
  };

  return bridge;
}

