<script lang="ts">
  import { onMount } from 'svelte'
  import type { BadgeProps } from '../../../specs/001-react-plugin-system/contracts/plugin-api'

  let { text, variant = 'neutral' }: BadgeProps = $props()

  let rootEl: HTMLSpanElement

  onMount(() => {
    const parent = rootEl.parentElement
    if (!parent) return
    const onUpdate = (e: any) => {
      const p = e.detail
      text = p.text
      variant = p.variant || 'neutral'
    }
    parent.addEventListener('update-props', onUpdate)
    return () => parent.removeEventListener('update-props', onUpdate)
  })
</script>

<span bind:this={rootEl} class="badge badge--{variant}">{text}</span>

<style>
  .badge {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 9999px;
    font-size: 12px;
    line-height: 18px;
    border: 1px solid transparent;
  }
  .badge--neutral { background: #f1f5f9; color: #334155; border-color: #e2e8f0; }
  .badge--success { background: #e6f9ed; color: #166534; border-color: #b7ebc6; }
  .badge--warning { background: #fff7ed; color: #92400e; border-color: #fed7aa; }
  .badge--danger { background: #fee2e2; color: #7f1d1d; border-color: #fecaca; }
</style>

