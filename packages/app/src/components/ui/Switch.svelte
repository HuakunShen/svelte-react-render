<script lang="ts">
  import Switch from '$lib/components/ui/switch/switch.svelte';

  interface SwitchProps {
    checked?: boolean;
    defaultChecked?: boolean;
    disabled?: boolean;
    id?: string;
    onChange?: (checked: boolean) => void;
    className?: string;
  }

  let {
    checked = false,
    defaultChecked,
    disabled,
    id,
    onChange,
    className
  }: SwitchProps = $props();

  let internalChecked = $state(checked ?? defaultChecked ?? false);

  // Update internal state when prop changes
  $effect(() => {
    if (checked !== undefined) {
      internalChecked = checked;
    }
  });

  function handleChange() {
    onChange?.(internalChecked);
  }
</script>

<Switch
  bind:checked={internalChecked}
  {disabled}
  {id}
  class={className}
  onchange={handleChange}
/>