<script lang="ts">
  import { onMount } from 'svelte'

  let { label, variant = 'info' }: { label: string; variant?: 'info' | 'success' | 'warning' | 'danger' } = $props()

  let rootEl: HTMLSpanElement
  onMount(() => {
    const parent = rootEl.parentElement
    if (!parent) return
    const onUpdate = (e: any) => {
      const p = e.detail
      label = p.label
      variant = p.variant || 'info'
    }
    parent.addEventListener('update-props', onUpdate)
    return () => parent.removeEventListener('update-props', onUpdate)
  })
</script>

<span bind:this={rootEl} class="chip chip--{variant}">{label}</span>

<style>
  .chip {
    display: inline-block;
    padding: 4px 10px;
    border-radius: 9999px;
    font-size: 12px;
    line-height: 18px;
    border: 1px solid transparent;
  }
  .chip--info { background: #e0f2fe; color: #075985; border-color: #bae6fd; }
  .chip--success { background: #dcfce7; color: #065f46; border-color: #bbf7d0; }
  .chip--warning { background: #fef9c3; color: #854d0e; border-color: #fde68a; }
  .chip--danger { background: #fee2e2; color: #7f1d1d; border-color: #fecaca; }
</style>

