import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PluginInputProps {
  id?: string;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  label?: string;
  type?: string;
  onChange?: (value: string, event?: React.ChangeEvent<HTMLInputElement>) => void;
  onInput?: (value: string, event?: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

export function PluginInput({
  id,
  value,
  defaultValue,
  placeholder,
  label,
  type = 'text',
  onChange,
  onInput,
  className
}: PluginInputProps) {
  const [internalValue, setInternalValue] = useState(value ?? defaultValue ?? '');

  useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setInternalValue(newValue);
    onChange?.(newValue);
    onInput?.(newValue);
  };

  return (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      {label && <Label htmlFor={id}>{label}</Label>}
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        value={internalValue}
        onChange={handleChange}
        className={className}
      />
    </div>
  );
}
