import { createElement } from 'react';
import type { ReactElement } from 'react';

export interface InputProps {
  id?: string;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  label?: string;
  type?: string;
  onChange?: (value: string, event?: Event) => void;
  onInput?: (value: string, event?: Event) => void;
}

export function Input({
  id,
  value,
  defaultValue,
  placeholder,
  label,
  type = 'text',
  onChange,
  onInput,
}: InputProps): ReactElement {
  return createElement(
    'Input' as any,
    {
      id,
      value,
      defaultValue,
      placeholder,
      label,
      type,
      onChange,
      onInput,
    },
  );
}
