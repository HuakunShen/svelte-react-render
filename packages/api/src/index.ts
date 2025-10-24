// Components
export { Button } from './components/Button';
export type { ButtonProps } from './components/Button';

export { Input } from './components/Input';
export type { InputProps } from './components/Input';

// Form components
export {
  FormField,
  FormControl,
  FormLabel,
  FormDescription,
  FormFieldErrors,
  FormButton,
  Form
} from './components/Form';
export type {
  FormFieldProps,
  FormControlProps,
  FormLabelProps,
  FormDescriptionProps,
  FormFieldErrorsProps,
  FormButtonProps
} from './components/Form';

// Switch component
export { Switch } from './components/Switch';
export type { SwitchProps } from './components/Switch';

// Toggle component
export { Toggle } from './components/Toggle';
export type { ToggleProps } from './components/Toggle';

// Reconciler (for internal use by host app)
export { createRenderer, render } from './reconciler/renderer';
export type { SvelteComponentInstance } from './reconciler/types';

// Extended bridge type with container property
export type ExtendedRenderBridge = ReturnType<typeof import('./reconciler/renderer').createRenderer>;
