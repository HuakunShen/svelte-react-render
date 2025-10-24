import { createElement } from "react";
import type { ReactElement, ReactNode } from "react";

// Form component wrappers
export interface FormFieldProps {
  children?: ReactNode;
  name: string;
  form?: any;
  className?: string;
}

export interface FormControlProps {
  children?: ReactNode;
  className?: string;
}

export interface FormLabelProps {
  children?: ReactNode;
  className?: string;
}

export interface FormDescriptionProps {
  children?: ReactNode;
  className?: string;
}

export interface FormFieldErrorsProps {
  className?: string;
}

export interface FormButtonProps {
  children?: ReactNode;
  className?: string;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  disabled?: boolean;
}

export function FormField({
  children,
  name,
  form,
  className,
}: FormFieldProps): ReactElement {
  return createElement(
    "FormField",
    {
      name,
      form,
      className,
    },
    children,
  );
}

export function FormControl({
  children,
  className,
}: FormControlProps): ReactElement {
  return createElement(
    "FormControl",
    {
      className,
    },
    children,
  );
}

export function FormLabel({
  children,
  className,
}: FormLabelProps): ReactElement {
  return createElement(
    "FormLabel",
    {
      className,
    },
    children,
  );
}

export function FormDescription({
  children,
  className,
}: FormDescriptionProps): ReactElement {
  return createElement(
    "FormDescription",
    {
      className,
    },
    children,
  );
}

export function FormFieldErrors({
  className,
}: FormFieldErrorsProps): ReactElement {
  return createElement("FormFieldErrors", {
    className,
  });
}

export function FormButton({
  children,
  className,
  type = "submit",
  onClick,
  disabled,
}: FormButtonProps): ReactElement {
  return createElement(
    "FormButton",
    {
      className,
      type,
      onClick,
      disabled,
    },
    children,
  );
}

// Export namespace for easier imports
export const Form = {
  Field: FormField,
  Control: FormControl,
  Label: FormLabel,
  Description: FormDescription,
  FieldErrors: FormFieldErrors,
  Button: FormButton,
};
