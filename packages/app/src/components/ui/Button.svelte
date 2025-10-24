<script lang="ts">
  interface ButtonProps {
    title?: string;
    icon?: string;
    variant?: 'primary' | 'secondary';
    shortcut?: string;
    onClick?: () => void;
  }

  let {
    title,
    icon,
    variant = 'secondary',
    shortcut,
    onClick
  }: ButtonProps = $props();

  function handleClick() {
    console.log('Button clicked, onClick handler:', onClick);
    onClick?.();
    console.log('Button onClick called');
  }

  const buttonClasses = $derived([
    'flex',
    'items-center',
    'gap-2',
    'px-4',
    'py-2',
    'border',
    'rounded',
    'cursor-pointer',
    'text-sm',
    'transition-all',
    variant === 'primary'
      ? 'bg-blue-500 text-white border-blue-500 hover:bg-blue-600'
      : 'bg-white border-gray-300 hover:bg-gray-50'
  ].join(' '));
</script>

<button class={buttonClasses} onclick={handleClick}>
  {#if icon}
    <span class="text-base">{icon}</span>
  {/if}
  {#if title}
    <span class="flex-1">{title}</span>
  {/if}
  {#if shortcut}
    <span class="text-xs opacity-60 bg-gray-100 px-1.5 py-0.5 rounded">{shortcut}</span>
  {/if}
</button>