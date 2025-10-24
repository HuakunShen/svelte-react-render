import { createElement } from 'react';
import type { ReactElement, ReactNode } from 'react';

export interface ButtonProps {
  children?: ReactNode;
  title?: string;
  icon?: string;
  variant?: 'primary' | 'secondary';
  shortcut?: string;
  onClick?: () => void;
}

export function Button({
  children,
  title,
  icon,
  variant = 'secondary',
  shortcut,
  onClick,
}: ButtonProps): ReactElement {
  return createElement(
    'Button' as any,
    {
      title,
      icon,
      variant,
      shortcut,
      onClick,
    },
    children,
  );
}

