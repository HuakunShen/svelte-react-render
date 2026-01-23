import { cn } from "@/lib/utils";
import { PluginButton } from "./PluginButton";

interface PluginFormFieldProps {
  name?: string;
  form?: unknown;
  className?: string;
  children?: React.ReactNode;
}

export function PluginFormField({ className, children }: PluginFormFieldProps) {
  return <div className={cn("space-y-2", className)}>{children}</div>;
}

interface PluginFormControlProps {
  children?: React.ReactNode;
}

export function PluginFormControl({ children }: PluginFormControlProps) {
  return <>{children}</>;
}

interface PluginFormLabelProps {
  className?: string;
  children?: React.ReactNode;
}

export function PluginFormLabel({ className, children }: PluginFormLabelProps) {
  return (
    <label
      className={cn(
        "text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className
      )}
    >
      {children}
    </label>
  );
}

interface PluginFormDescriptionProps {
  className?: string;
  children?: React.ReactNode;
}

export function PluginFormDescription({ className, children }: PluginFormDescriptionProps) {
  return (
    <p className={cn("text-[0.8rem] text-muted-foreground", className)}>
      {children}
    </p>
  );
}

interface PluginFormFieldErrorsProps {
  className?: string;
}

export function PluginFormFieldErrors({ className }: PluginFormFieldErrorsProps) {
  return <div className={cn(className)} />;
}

interface PluginFormButtonProps {
  title?: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function PluginFormButton({
  title,
  onClick,
  disabled,
  className,
  children
}: PluginFormButtonProps) {
  return (
    <PluginButton
      title={children?.toString() || title}
      variant="primary"
      onClick={onClick}
      disabled={disabled}
      className={className}
    />
  );
}

interface PluginFormProps {
  className?: string;
  children?: React.ReactNode;
}

export function PluginForm({ className, children }: PluginFormProps) {
  return <form className={cn("space-y-4", className)}>{children}</form>;
}
