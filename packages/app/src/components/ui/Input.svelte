<script lang="ts">
  interface InputProps {
    id?: string;
    value?: string;
    defaultValue?: string;
    placeholder?: string;
    label?: string;
    type?: string;
    onChange?: (value: string, event?: Event) => void;
    onInput?: (value: string, event?: Event) => void;
  }

  let {
    id,
    value,
    defaultValue,
    placeholder,
    label,
    type = 'text',
    onChange,
    onInput
  }: InputProps = $props();

  let internalValue = $state(value ?? defaultValue ?? '');

  function handleChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const newValue = target.value;
    console.log('Input handleChange called, value:', newValue, 'onChange:', onChange);
    internalValue = newValue;
    onChange?.(newValue, event);
    onInput?.(newValue, event);
    console.log('Input onChange/onInput called');
  }

  $effect(() => {
    if (value !== undefined) {
      internalValue = value;
    }
  });
</script>

<div class="flex flex-col gap-1">
  {#if label}
    <label for={id} class="text-xs font-medium text-gray-600">{label}</label>
  {/if}
  <input
    {id}
    {type}
    {placeholder}
    bind:value={internalValue}
    oninput={handleChange}
    onchange={handleChange}
    class="px-3 py-2 border border-gray-300 rounded text-sm transition-colors focus:outline-none focus:border-blue-500"
  />
</div>