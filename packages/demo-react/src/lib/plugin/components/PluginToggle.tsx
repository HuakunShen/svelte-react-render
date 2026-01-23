import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";

interface PluginToggleProps {
  pressed?: boolean;
  defaultPressed?: boolean;
  disabled?: boolean;
  variant?: 'default' | 'outline';
  size?: 'default' | 'sm' | 'lg';
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export function PluginToggle({
  pressed = false,
  defaultPressed,
  disabled,
  variant = 'default',
  size = 'default',
  onClick,
  className,
  children
}: PluginToggleProps) {
  const displayPressed = pressed ?? defaultPressed ?? false;

  const handlePressedChange = () => {
    onClick?.();
  };

  return (
    <Toggle
      pressed={displayPressed}
      onPressedChange={handlePressedChange}
      disabled={disabled}
      variant={variant}
      size={size}
      className={cn(className)}
    >
      {children}
    </Toggle>
  );
}
