import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface PluginSwitchProps {
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  id?: string;
  onChange?: (checked: boolean) => void;
  className?: string;
}

export function PluginSwitch({
  checked = false,
  defaultChecked,
  disabled,
  id,
  onChange,
  className
}: PluginSwitchProps) {
  const displayChecked = checked ?? defaultChecked ?? false;

  const handleCheckedChange = (newChecked: boolean) => {
    onChange?.(newChecked);
  };

  return (
    <Switch
      checked={displayChecked}
      onCheckedChange={handleCheckedChange}
      disabled={disabled}
      id={id}
      className={cn(className)}
    />
  );
}
