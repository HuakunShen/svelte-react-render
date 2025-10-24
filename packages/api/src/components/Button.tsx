import { createElement } from 'react';
import type { ReactElement, ReactNode } from 'react';

export interface ButtonProps {
  children?: ReactNode;
  title?: string;
  icon?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'destructive' | 'ghost' | 'link';
  shortcut?: string;
  onClick?: () => void;
  className?: string;
}

export function Button({
  children,
  title,
  icon,
  variant = 'secondary',
  shortcut,
  onClick,
  className,
}: ButtonProps): ReactElement {
  return createElement(
    'Button' as any,
    {
      title,
      icon,
      variant,
      shortcut,
      onClick,
      className,
    },
    children,
  );
}

