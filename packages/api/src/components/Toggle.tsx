import { createElement } from 'react';
import type { ReactElement, ReactNode } from 'react';

export interface ToggleProps {
  pressed?: boolean;
  defaultPressed?: boolean;
  disabled?: boolean;
  variant?: 'default' | 'outline';
  size?: 'default' | 'sm' | 'lg';
  onClick?: () => void;
  children?: ReactNode;
  className?: string;
}

export function Toggle({
  pressed,
  defaultPressed,
  disabled,
  variant = 'default',
  size = 'default',
  onClick,
  children,
  className,
}: ToggleProps): ReactElement {
  return createElement(
    'Toggle' as any,
    {
      pressed,
      defaultPressed,
      disabled,
      variant,
      size,
      onClick,
      className,
    },
    children,
  );
}