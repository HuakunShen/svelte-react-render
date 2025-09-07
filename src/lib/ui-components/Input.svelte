<script lang="ts">
  import { onMount } from 'svelte'
  import type { InputProps } from '../../../specs/001-react-plugin-system/contracts/plugin-api'

  let {
    value,
    placeholder = '',
    type = 'text',
    disabled = false,
    onChange,
    onSubmit = undefined
  }: InputProps = $props()

  // Internal reactive state
  let inputElement: HTMLInputElement

  onMount(() => {
    const parent = inputElement.parentElement
    if (parent) {
      const onUpdate = (e: any) => {
        const newProps = e.detail
        value = newProps.value
        placeholder = newProps.placeholder
        type = newProps.type
        disabled = newProps.disabled
        onChange = newProps.onChange
        onSubmit = newProps.onSubmit
      }

      parent.addEventListener('update-props', onUpdate)

      return () => {
        parent.removeEventListener('update-props', onUpdate)
      }
    }
  })

  // Handle input change
  function handleInput(event: Event) {
    const target = event.target as HTMLInputElement
    const newValue = target.value
    
    try {
      onChange(newValue)
    } catch (error) {
      console.error('Error in input onChange handler:', error)
      // Emit error event for plugin error boundary to catch
      const errorEvent = new CustomEvent('ui-component:error', {
        detail: { 
          error, 
          component: 'Input', 
          props: { value, placeholder, type, disabled },
          newValue 
        },
        bubbles: true
      })
      event.target?.dispatchEvent(errorEvent)
    }
  }

  // Handle key events (especially Enter for submit)
  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && onSubmit && !disabled) {
      event.preventDefault()
      
      try {
        onSubmit()
      } catch (error) {
        console.error('Error in input onSubmit handler:', error)
        // Emit error event for plugin error boundary to catch
        const errorEvent = new CustomEvent('ui-component:error', {
          detail: { 
            error, 
            component: 'Input', 
            props: { value, placeholder, type, disabled },
            action: 'submit'
          },
          bubbles: true
        })
        event.target?.dispatchEvent(errorEvent)
      }
    }
  }

  // Handle blur event to ensure value is synced
  function handleBlur(event: FocusEvent) {
    const target = event.target as HTMLInputElement
    if (target.value !== value) {
      // Sync any remaining differences
      try {
        onChange(target.value)
      } catch (error) {
        // Reset to known good value on error
        target.value = value
      }
    }
  }

  // Public API for imperatively focusing the input
  export function focus() {
    inputElement?.focus()
  }

  export function blur() {
    inputElement?.blur()
  }

  export function select() {
    inputElement?.select()
  }
</script>

<div class="plugin-input-wrapper">
  <input
    bind:this={inputElement}
    class="plugin-input"
    class:plugin-input--disabled={disabled}
    {type}
    {placeholder}
    {disabled}
    value={value}
    oninput={handleInput}
    onkeydown={handleKeyDown}
    onblur={handleBlur}
    aria-label={placeholder || 'Text input'}
    role="textbox"
  />
  {#if onSubmit}
    <div class="plugin-input__hint" aria-live="polite">
      Press Enter to submit
    </div>
  {/if}
</div>

<style>
  .plugin-input-wrapper {
    position: relative;
    display: inline-block;
    width: 100%;
  }

  .plugin-input {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid var(--input-border, #ccc);
    border-radius: 4px;
    font-size: 14px;
    line-height: 1.4;
    background-color: var(--input-bg, white);
    color: var(--input-text, #333);
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
    font-family: inherit;
  }

  .plugin-input:focus {
    outline: none;
    border-color: var(--input-border-focus, #0066cc);
    box-shadow: 0 0 0 2px var(--input-focus-shadow, rgba(0, 102, 204, 0.2));
  }

  .plugin-input:hover:not(:disabled):not(:focus) {
    border-color: var(--input-border-hover, #999);
  }

  .plugin-input::placeholder {
    color: var(--input-placeholder, #999);
    opacity: 1; /* Firefox */
  }

  .plugin-input:disabled,
  .plugin-input--disabled {
    background-color: var(--input-bg-disabled, #f5f5f5);
    color: var(--input-text-disabled, #999);
    cursor: not-allowed;
    opacity: 0.6;
  }

  .plugin-input:disabled::placeholder,
  .plugin-input--disabled::placeholder {
    color: var(--input-placeholder-disabled, #ccc);
  }

  .plugin-input__hint {
    font-size: 12px;
    color: var(--input-hint, #666);
    margin-top: 4px;
    opacity: 0;
    transition: opacity 0.15s ease;
  }

  .plugin-input-wrapper:focus-within .plugin-input__hint {
    opacity: 1;
  }

  /* Input type-specific styling */
  .plugin-input[type="password"] {
    letter-spacing: 0.1em;
  }

  .plugin-input[type="email"] {
    /* Email inputs might benefit from specific styling */
  }

  /* Validation states */
  .plugin-input:invalid {
    border-color: var(--input-border-invalid, #dc3545);
    box-shadow: none;
  }

  .plugin-input:invalid:focus {
    box-shadow: 0 0 0 2px var(--input-focus-shadow-invalid, rgba(220, 53, 69, 0.2));
  }

  /* Dark mode support */
  @media (prefers-color-scheme: dark) {
    .plugin-input {
      background-color: var(--input-bg-dark, #2d2d2d);
      border-color: var(--input-border-dark, #555);
      color: var(--input-text-dark, #e0e0e0);
    }

    .plugin-input:focus {
      border-color: var(--input-border-focus-dark, #4da6ff);
      box-shadow: 0 0 0 2px var(--input-focus-shadow-dark, rgba(77, 166, 255, 0.2));
    }

    .plugin-input:hover:not(:disabled):not(:focus) {
      border-color: var(--input-border-hover-dark, #777);
    }

    .plugin-input::placeholder {
      color: var(--input-placeholder-dark, #999);
    }

    .plugin-input:disabled,
    .plugin-input--disabled {
      background-color: var(--input-bg-disabled-dark, #1a1a1a);
      color: var(--input-text-disabled-dark, #666);
    }

    .plugin-input__hint {
      color: var(--input-hint-dark, #999);
    }
  }

  /* High contrast mode */
  @media (prefers-contrast: high) {
    .plugin-input {
      border-width: 2px;
    }

    .plugin-input:focus {
      outline: 2px solid var(--input-border-focus, #0066cc);
      outline-offset: 1px;
    }
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .plugin-input,
    .plugin-input__hint {
      transition: none;
    }
  }

  /* Mobile responsiveness */
  @media (max-width: 768px) {
    .plugin-input {
      font-size: 16px; /* Prevent zoom on iOS */
      padding: 12px;
    }
  }
</style>