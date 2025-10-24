import { createElement } from "react";
import type { ReactElement, ReactNode } from "react";

export interface SwitchProps {
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  id?: string;
  onChange?: (checked: boolean) => void;
  children?: ReactNode;
  className?: string;
}

export function Switch({
  checked,
  defaultChecked,
  disabled,
  id,
  onChange,
  children,
  className,
}: SwitchProps): ReactElement {
  return createElement(
    "Switch",
    {
      checked,
      defaultChecked,
      disabled,
      id,
      onChange,
      className,
    },
    children,
  );
}
