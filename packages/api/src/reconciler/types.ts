// Types for the reconciler bridge between React and Svelte

export type ComponentType = 'Button' | 'Input' | string;

export interface SvelteComponentInstance {
  type: ComponentType;
  props: Record<string, any>;
  children: (SvelteComponentInstance | string)[];
  id: string;
  parent: SvelteComponentInstance | null;
}
