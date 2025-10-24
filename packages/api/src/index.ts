// Components
export { Button } from './components/Button';
export type { ButtonProps } from './components/Button';

export { Input } from './components/Input';
export type { InputProps } from './components/Input';

// Reconciler (for internal use by host app)
export { createRenderer, render } from './reconciler/renderer';
export type { SvelteComponentInstance } from './reconciler/types';

// Extended bridge type with container property
export type ExtendedRenderBridge = ReturnType<typeof import('./reconciler/renderer').createRenderer>;
