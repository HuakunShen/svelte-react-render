import { Button as ShadcnButton } from "@/components/ui/button";

interface PluginButtonProps {
  title?: string;
  icon?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'destructive' | 'ghost' | 'link';
  shortcut?: string;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

const variantMap = {
  primary: 'default',
  secondary: 'secondary',
  outline: 'outline',
  destructive: 'destructive',
  ghost: 'ghost',
  link: 'link'
} as const;

export function PluginButton({
  title,
  icon,
  variant = 'secondary',
  shortcut,
  onClick,
  className,
  disabled
}: PluginButtonProps) {
  const handleClickWithoutEvent = onClick ? () => onClick() : undefined;

  return (
    <ShadcnButton
      variant={variantMap[variant] || 'secondary'}
      onClick={handleClickWithoutEvent}
      className={className}
      disabled={disabled}
    >
      {icon && <span className="text-base">{icon}</span>}
      {title && <span className="flex-1">{title}</span>}
      {shortcut && (
        <span className="ml-2 rounded bg-secondary px-1.5 py-0.5 text-xs opacity-60">
          {shortcut}
        </span>
      )}
    </ShadcnButton>
  );
}
