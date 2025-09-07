<script lang="ts">
  import { onMount } from 'svelte'
  import type { DividerProps } from '../../../specs/001-react-plugin-system/contracts/plugin-api'

  let { spacing = 'md' }: DividerProps = $props()
  let rootEl: HTMLHRElement

  onMount(() => {
    const parent = rootEl.parentElement
    if (!parent) return
    const onUpdate = (e: any) => {
      const p = e.detail
      spacing = p.spacing || 'md'
    }
    parent.addEventListener('update-props', onUpdate)
    return () => parent.removeEventListener('update-props', onUpdate)
  })
</script>

<hr bind:this={rootEl} class="divider divider--{spacing}" />

<style>
  .divider { border: none; border-top: 1px solid var(--divider, #e5e7eb); }
  .divider--sm { margin: 8px 0; }
  .divider--md { margin: 16px 0; }
  .divider--lg { margin: 24px 0; }
</style>

