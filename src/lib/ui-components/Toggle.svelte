<script lang="ts">
  import { onMount } from 'svelte'
  import type { ToggleProps } from '../../../specs/001-react-plugin-system/contracts/plugin-api'

  let {
    checked = false,
    label = '',
    disabled = false,
    onChange
  }: ToggleProps = $props()

  let inputEl: HTMLInputElement

  onMount(() => {
    const parent = inputEl.parentElement
    if (!parent) return

    const onUpdate = (e: any) => {
      const p = e.detail
      checked = !!p.checked
      label = p.label ?? ''
      disabled = !!p.disabled
      onChange = p.onChange
    }
    parent.addEventListener('update-props', onUpdate)
    return () => parent.removeEventListener('update-props', onUpdate)
  })

  function handleChange(e: Event) {
    if (disabled) return
    const next = (e.target as HTMLInputElement).checked
    try {
      onChange(next)
    } catch (error) {
      const errEvt = new CustomEvent('ui-component:error', {
        detail: { error, component: 'Toggle', props: { checked, label, disabled } },
        bubbles: true
      })
      inputEl.dispatchEvent(errEvt)
    }
  }
</script>

<label class="toggle" aria-disabled={disabled}>
  <input
    bind:this={inputEl}
    type="checkbox"
    checked={checked}
    disabled={disabled}
    onchange={handleChange}
  />
  <span class="slider" aria-hidden="true"></span>
  {#if label}
    <span class="label">{label}</span>
  {/if}
</label>

<style>
  .toggle {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    user-select: none;
  }
  input { display: none; }
  .slider {
    width: 42px;
    height: 24px;
    background: var(--toggle-bg, #ccc);
    border-radius: 9999px;
    position: relative;
    transition: background 0.2s ease;
  }
  .slider::after {
    content: '';
    position: absolute;
    top: 2px; left: 2px;
    width: 20px; height: 20px;
    background: var(--toggle-knob, #fff);
    border-radius: 50%;
    transition: transform 0.2s ease;
  }
  input:checked + .slider { background: var(--primary-bg, #0066cc); }
  input:checked + .slider::after { transform: translateX(18px); }
  [aria-disabled="true"] { opacity: 0.6; cursor: not-allowed; }
  .label { font-size: 14px; color: var(--text, inherit); }
</style>

