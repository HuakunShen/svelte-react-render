<script lang="ts">
  import { onMount } from 'svelte'
  import type { ButtonProps } from '../../../specs/001-react-plugin-system/contracts/plugin-api'

  // Props (following ButtonProps interface)
  let { 
    label,
    variant = 'primary',
    disabled = false,
    onClick 
  }: ButtonProps = $props()

  let buttonElement: HTMLButtonElement

  onMount(() => {
    const parent = buttonElement.parentElement
    if (parent) {
      const onUpdate = (e: any) => {
        const newProps = e.detail
        label = newProps.label
        variant = newProps.variant
        disabled = newProps.disabled
        onClick = newProps.onClick
      }

      parent.addEventListener('update-props', onUpdate)

      return () => {
        parent.removeEventListener('update-props', onUpdate)
      }
    }
  })

  // Handle click event
  function handleClick(event: MouseEvent) {
    if (disabled) {
      event.preventDefault()
      event.stopPropagation()
      return
    }
    
    try {
      onClick()
    } catch (error) {
      console.error('Error in button onClick handler:', error)
      // Emit error event for plugin error boundary to catch
      const errorEvent = new CustomEvent('ui-component:error', {
        detail: { error, component: 'Button', props: { label, variant, disabled } },
        bubbles: true
      })
      event.target?.dispatchEvent(errorEvent)
    }
  }
</script>

<button
  bind:this={buttonElement}
  class="plugin-button plugin-button--{variant}"
  class:plugin-button--disabled={disabled}
  {disabled}
  type="button"
  onclick={handleClick}
  aria-label={label}
>
  {label}
</button>

<style>
  .plugin-button {
    padding: 8px 16px;
    border: 1px solid transparent;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 36px;
    background: none;
    font-family: inherit;
  }

  .plugin-button:focus {
    outline: 2px solid var(--focus-color, #0066cc);
    outline-offset: 2px;
  }

  .plugin-button--primary {
    background-color: var(--primary-bg, #0066cc);
    color: var(--primary-text, white);
    border-color: var(--primary-border, #0066cc);
  }

  .plugin-button--primary:hover:not(:disabled) {
    background-color: var(--primary-bg-hover, #0052a3);
    border-color: var(--primary-border-hover, #0052a3);
  }

  .plugin-button--primary:active:not(:disabled) {
    background-color: var(--primary-bg-active, #003d7a);
    transform: translateY(1px);
  }

  .plugin-button--secondary {
    background-color: var(--secondary-bg, transparent);
    color: var(--secondary-text, #333);
    border-color: var(--secondary-border, #ccc);
  }

  .plugin-button--secondary:hover:not(:disabled) {
    background-color: var(--secondary-bg-hover, #f5f5f5);
    border-color: var(--secondary-border-hover, #999);
  }

  .plugin-button--secondary:active:not(:disabled) {
    background-color: var(--secondary-bg-active, #e5e5e5);
    transform: translateY(1px);
  }

  .plugin-button--danger {
    background-color: var(--danger-bg, #dc3545);
    color: var(--danger-text, white);
    border-color: var(--danger-border, #dc3545);
  }

  .plugin-button--danger:hover:not(:disabled) {
    background-color: var(--danger-bg-hover, #c82333);
    border-color: var(--danger-border-hover, #c82333);
  }

  .plugin-button--danger:active:not(:disabled) {
    background-color: var(--danger-bg-active, #bd2130);
    transform: translateY(1px);
  }

  .plugin-button:disabled,
  .plugin-button--disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
  }

  /* Dark mode support */
  @media (prefers-color-scheme: dark) {
    .plugin-button--secondary {
      color: var(--secondary-text-dark, #e0e0e0);
      border-color: var(--secondary-border-dark, #555);
    }

    .plugin-button--secondary:hover:not(:disabled) {
      background-color: var(--secondary-bg-hover-dark, #333);
      border-color: var(--secondary-border-hover-dark, #777);
    }
  }
</style>