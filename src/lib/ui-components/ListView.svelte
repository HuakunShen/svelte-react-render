<script lang="ts">
  import { onMount } from 'svelte'
  import type { ListViewProps, ListViewItem } from '../../../specs/001-react-plugin-system/contracts/plugin-api'

  // Props (following ListViewProps interface)
  let {
    items,
    onItemSelect,
    onItemRemove = undefined,
    multiSelect = false
  }: ListViewProps = $props()

  let listElement: HTMLDivElement

  onMount(() => {
    const parent = listElement.parentElement
    if (parent) {
      const onUpdate = (e: any) => {
        const newProps = e.detail
        items = newProps.items
        onItemSelect = newProps.onItemSelect
        onItemRemove = newProps.onItemRemove
        multiSelect = newProps.multiSelect
      }

      parent.addEventListener('update-props', onUpdate)

      return () => {
        parent.removeEventListener('update-props', onUpdate)
      }
    }
  })

  // Handle item selection
  function handleItemSelect(item: ListViewItem, event: MouseEvent | KeyboardEvent) {
    try {
      onItemSelect(item.id)
    } catch (error) {
      console.error('Error in listview onItemSelect handler:', error)
      // Emit error event for plugin error boundary to catch
      const errorEvent = new CustomEvent('ui-component:error', {
        detail: { 
          error, 
          component: 'ListView', 
          props: { itemsCount: items.length, multiSelect },
          itemId: item.id 
        },
        bubbles: true
      })
      event.target?.dispatchEvent(errorEvent)
    }
  }

  // Handle item removal
  function handleItemRemove(id: string, event: MouseEvent) {
    event.stopPropagation() // Prevent item selection when remove button is clicked
    if (onItemRemove) {
      try {
        onItemRemove(id)
      } catch (error) {
        console.error('Error in listview onItemRemove handler:', error)
        const errorEvent = new CustomEvent('ui-component:error', {
          detail: { error, component: 'ListView', action: 'removeItem', itemId: id },
          bubbles: true
        })
        event.target?.dispatchEvent(errorEvent)
      }
    }
  }

  // Handle keyboard navigation
  function handleKeyDown(item: ListViewItem, event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleItemSelect(item, event)
    }
  }

  // Get ARIA attributes for item
  function getItemAriaAttributes(item: ListViewItem) {
    return {
      'aria-selected': item.selected?.toString() || 'false',
      'role': 'listitem',
      'tabindex': 0
    }
  }
</script>

<div 
  bind:this={listElement}
  class="plugin-listview" 
  class:plugin-listview--multi={multiSelect}
  role="list"
  aria-label="Plugin list view"
>
  {#if items.length === 0}
    <div class="plugin-listview__empty" role="status" aria-live="polite">
      No items to display
    </div>
  {:else}
    {#each items as item (item.id)}
      <div
        class="plugin-listview__item"
        class:plugin-listview__item--selected={item.selected}
        {...getItemAriaAttributes(item)}
        onclick={(e) => handleItemSelect(item, e)}
        onkeydown={(e) => handleKeyDown(item, e)}
        data-item-id={item.id}
      >
        <div class="plugin-listview__content">
          {#if multiSelect}
            <div class="plugin-listview__checkbox" aria-hidden="true">
              <span class="plugin-listview__checkbox-indicator" class:checked={item.selected}>
                {#if item.selected}✓{/if}
              </span>
            </div>
          {/if}
          <div class="plugin-listview__text">
            {@html item.content}
          </div>
          {#if onItemRemove}
            <button class="plugin-listview__remove-button" onclick={(e) => handleItemRemove(item.id, e)} aria-label="Remove item">
              ✕
            </button>
          {/if}
        </div>
      </div>
    {/each}
  {/if}
</div>

<style>
  .plugin-listview {
    border: 1px solid var(--list-border, #e0e0e0);
    border-radius: 4px;
    background-color: var(--list-bg, white);
    overflow-y: auto;
    max-height: 300px;
  }

  .plugin-listview__empty {
    padding: 16px;
    text-align: center;
    color: var(--text-muted, #666);
    font-style: italic;
  }

  .plugin-listview__item {
    padding: 0;
    border-bottom: 1px solid var(--item-border, #f0f0f0);
    cursor: pointer;
    transition: background-color 0.15s ease;
    outline: none;
  }

  .plugin-listview__item:last-child {
    border-bottom: none;
  }

  .plugin-listview__item:hover {
    background-color: var(--item-bg-hover, #f8f9fa);
  }

  .plugin-listview__item:focus {
    background-color: var(--item-bg-focus, #e3f2fd);
    outline: 2px solid var(--focus-color, #0066cc);
    outline-offset: -2px;
  }

  .plugin-listview__item--selected {
    background-color: var(--item-bg-selected, #e8f4f8);
    color: var(--item-text-selected, #333);
  }

  .plugin-listview__item--selected:hover {
    background-color: var(--item-bg-selected-hover, #d1ecf1);
  }

  .plugin-listview__content {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    gap: 12px;
  }

  .plugin-listview__checkbox {
    flex-shrink: 0;
  }

  .plugin-listview__checkbox-indicator {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    border: 1px solid var(--checkbox-border, #ccc);
    border-radius: 2px;
    background-color: var(--checkbox-bg, white);
    font-size: 12px;
    line-height: 1;
    transition: all 0.15s ease;
  }

  .plugin-listview__checkbox-indicator.checked {
    background-color: var(--checkbox-bg-checked, #0066cc);
    border-color: var(--checkbox-border-checked, #0066cc);
    color: var(--checkbox-text-checked, white);
  }

  .plugin-listview__text {
    flex: 1;
    min-width: 0; /* Allow text truncation */
    line-height: 1.4;
  }

  .plugin-listview__remove-button {
    background: none;
    border: none;
    color: var(--remove-button-color, #999);
    font-size: 18px;
    cursor: pointer;
    padding: 4px;
    margin-left: 8px;
    transition: color 0.15s ease;
  }

  .plugin-listview__remove-button:hover {
    color: var(--remove-button-color-hover, #dc3545);
  }

  /* Multi-select styling */
  .plugin-listview--multi .plugin-listview__item {
    user-select: none;
  }

  /* Dark mode support */
  @media (prefers-color-scheme: dark) {
    .plugin-listview {
      background-color: var(--list-bg-dark, #2d2d2d);
      border-color: var(--list-border-dark, #555);
    }

    .plugin-listview__item {
      border-color: var(--item-border-dark, #444);
    }

    .plugin-listview__item:hover {
      background-color: var(--item-bg-hover-dark, #3a3a3a);
    }

    .plugin-listview__item:focus {
      background-color: var(--item-bg-focus-dark, #1a365d);
    }

    .plugin-listview__item--selected {
      background-color: var(--item-bg-selected-dark, #2c5282);
      color: var(--item-text-selected-dark, #e0e0e0);
    }

    .plugin-listview__empty {
      color: var(--text-muted-dark, #999);
    }

    .plugin-listview__checkbox-indicator {
      background-color: var(--checkbox-bg-dark, #2d2d2d);
      border-color: var(--checkbox-border-dark, #555);
    }

    .plugin-listview__remove-button {
      color: var(--remove-button-color-dark, #bbb);
    }

    .plugin-listview__remove-button:hover {
      color: var(--remove-button-color-hover-dark, #ff6b6b);
    }
  }

  /* Accessibility improvements */
  @media (prefers-reduced-motion: reduce) {
    .plugin-listview__item,
    .plugin-listview__checkbox-indicator {
      transition: none;
    }
  }

  /* High contrast mode */
  @media (prefers-contrast: high) {
    .plugin-listview {
      border-width: 2px;
    }

    .plugin-listview__item:focus {
      outline-width: 3px;
    }

    .plugin-listview__checkbox-indicator {
      border-width: 2px;
    }
  }
</style>