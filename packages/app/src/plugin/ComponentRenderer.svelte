<script lang="ts">
  import type { SvelteComponentInstance } from '@svelte-react-render/api';
  import Button from '../components/ui/Button.svelte';
  import Input from '../components/ui/Input.svelte';
  import Self from './ComponentRenderer.svelte';

  interface Props {
    instance: SvelteComponentInstance | string;
  }

  let { instance }: Props = $props();
  
  // Debug: log when ComponentRenderer is created/recreated
  console.log('ComponentRenderer created/updated with instance:', instance);

  // Transform React props to HTML/Svelte props
  function transformProps(props: Record<string, any>): Record<string, any> {
    const transformed: Record<string, any> = {};

    for (const [key, value] of Object.entries(props)) {
      // Skip children and key
      if (key === 'children' || key === 'key') continue;

      // Transform event handlers
      if (key === 'onChange') {
        transformed.oninput = value;
        transformed.onchange = value;
      } else if (key === 'onInput') {
        transformed.oninput = value;
      } else if (key === 'onClick') {
        transformed.onclick = value;
      } else if (key === 'onSubmit') {
        transformed.onsubmit = value;
      } else if (key === 'className') {
        transformed.class = value;
      } else if (key === 'htmlFor') {
        transformed.for = value;
      } else {
        // Pass through everything else
        transformed[key] = value;
      }
    }

    return transformed;
  }
</script>

{#if typeof instance === 'string'}
  {instance}
{:else if ['div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'p', 'strong', 'em', 'b', 'i', 'a', 'ul', 'ol', 'li', 'section', 'article', 'header', 'footer', 'main'].includes(instance.type)}
  {@const htmlProps = transformProps(instance.props)}
  <svelte:element
    this={instance.type}
    {...htmlProps}
  >
    {#each instance.children as child}
      <Self instance={child} />
    {/each}
  </svelte:element>
{:else if instance.type === 'Button'}
  {@const textChildren = instance.children.filter(child => typeof child === 'string').join('')}
  {@const buttonProps = {
    icon: instance.props.icon,
    title: textChildren || instance.props.title,
    shortcut: instance.props.shortcut,
    variant: instance.props.variant,
    onClick: instance.props.onClick
  }}
  <Button {...buttonProps} />
{:else if instance.type === 'Input'}
  {@const inputProps = {
    id: instance.props.id,
    label: instance.props.label,
    placeholder: instance.props.placeholder,
    type: instance.props.type,
    value: instance.props.value,
    defaultValue: instance.props.defaultValue,
    onInput: instance.props.onInput,
    onChange: instance.props.onChange
  }}
  <Input {...inputProps} />
{:else}
  <div>Unknown component: {instance.type}</div>
{/if}
