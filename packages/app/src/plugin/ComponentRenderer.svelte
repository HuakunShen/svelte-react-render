<script lang="ts">
  import type { SvelteComponentInstance } from '@svelte-react-render/api';
  import type { RPCChannel } from 'kkrpc';
  import type { WorkerAPI, MainThreadAPI, SerializedComponentTree } from './worker-rpc-types';
  import Button from '../components/ui/Button.svelte';
  import Input from '../components/ui/Input.svelte';
  import FormField from '../components/ui/Form.svelte';
  import Switch from '../components/ui/Switch.svelte';
  import Toggle from '../components/ui/Toggle.svelte';
  import Self from './ComponentRenderer.svelte';

  interface Props {
    instance: SvelteComponentInstance | SerializedComponentTree | string;
    rpcContext?: { rpc: RPCChannel<MainThreadAPI, WorkerAPI> | null };
  }

  let { instance, rpcContext }: Props = $props();

  // Create event handler from handler ID
  function createHandlerFromId(handlerId: string | undefined, eventName: string): Function | undefined {
    if (!handlerId || !rpcContext?.rpc) return undefined;
    
    return async (...args: any[]) => {
      try {
        const api = rpcContext.rpc!.getAPI();
        await api.executeHandler(handlerId, ...args);
      } catch (error) {
        console.error(`Error executing ${eventName} handler:`, error);
      }
    };
  }

  // Transform React props to HTML/Svelte props
  function transformProps(props: Record<string, any>): Record<string, any> {
    const transformed: Record<string, any> = {};

    for (const [key, value] of Object.entries(props)) {
      // Skip children and key
      if (key === 'children' || key === 'key') continue;

      // Handle handler IDs (from worker serialization)
      if (key.startsWith('_') && key.endsWith('HandlerId')) {
        const eventName = key.slice(1, -9); // Remove _ prefix and HandlerId suffix
        const handler = createHandlerFromId(value, eventName);
        if (handler) {
          if (eventName === 'onChange') {
            transformed.oninput = handler;
            transformed.onchange = handler;
          } else if (eventName === 'onInput') {
            transformed.oninput = handler;
          } else if (eventName === 'onClick') {
            transformed.onclick = handler;
          } else if (eventName === 'onSubmit') {
            transformed.onsubmit = handler;
          } else {
            // Generic event handler
            transformed[eventName.toLowerCase()] = handler;
          }
        }
        continue;
      }

      // Transform event handlers (for non-worker mode compatibility)
      if (key === 'onChange' && typeof value === 'function') {
        transformed.oninput = value;
        transformed.onchange = value;
      } else if (key === 'onInput' && typeof value === 'function') {
        transformed.oninput = value;
      } else if (key === 'onClick' && typeof value === 'function') {
        transformed.onclick = value;
      } else if (key === 'onSubmit' && typeof value === 'function') {
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
{:else if ['div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'p', 'strong', 'em', 'b', 'i', 'a', 'ul', 'ol', 'li', 'section', 'article', 'header', 'footer', 'main', 'label', 'br', 'hr'].includes(instance.type)}
  {@const htmlProps = transformProps(instance.props)}
  <svelte:element
    this={instance.type}
    {...htmlProps}
  >
    {#each instance.children as child}
      <Self instance={child} {rpcContext} />
    {/each}
  </svelte:element>
{:else if instance.type === 'Button'}
  {@const textChildren = instance.children.filter(child => typeof child === 'string').join('')}
  {@const buttonProps = {
    icon: instance.props.icon,
    title: textChildren || instance.props.title,
    shortcut: instance.props.shortcut,
    variant: instance.props.variant,
    onClick: instance.props.onClick || createHandlerFromId(instance.props._onClickHandlerId, 'onClick'),
    className: instance.props.className
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
    onInput: instance.props.onInput || createHandlerFromId(instance.props._onInputHandlerId, 'onInput'),
    onChange: instance.props.onChange || createHandlerFromId(instance.props._onChangeHandlerId, 'onChange')
  }}
  <Input {...inputProps} />
{:else if instance.type === 'Switch'}
  {@const switchProps = {
    id: instance.props.id,
    checked: instance.props.checked,
    defaultChecked: instance.props.defaultChecked,
    disabled: instance.props.disabled,
    onChange: instance.props.onChange || createHandlerFromId(instance.props._onChangeHandlerId, 'onChange'),
    className: instance.props.className
  }}
  <Switch {...switchProps} />
{:else if instance.type === 'Toggle'}
  {@const textChildren = instance.children.filter(child => typeof child === 'string').join('')}
  {@const toggleProps = {
    pressed: instance.props.pressed,
    defaultPressed: instance.props.defaultPressed,
    disabled: instance.props.disabled,
    variant: instance.props.variant,
    size: instance.props.size,
    onClick: instance.props.onClick || createHandlerFromId(instance.props._onClickHandlerId, 'onClick'),
    className: instance.props.className,
    children: textChildren
  }}
  <Toggle {...toggleProps} />
{:else if instance.type === 'FormField'}
  {@const formFieldProps = {
    name: instance.props.name,
    form: instance.props.form,
    className: instance.props.className
  }}
  <FormField {...formFieldProps}>
    {#each instance.children as child}
      <Self instance={child} {rpcContext} />
    {/each}
  </FormField>
{:else if instance.type === 'FormControl'}
  <!-- FormControl is just a wrapper, render its children -->
  {#each instance.children as child}
    <Self instance={child} {rpcContext} />
  {/each}
{:else if instance.type === 'FormLabel'}
  {@const labelChildren = instance.children.filter(child => typeof child === 'string').join('')}
  <!-- svelte-ignore a11y_label_has_associated_control -->
  <label class={instance.props.className || 'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'}>
    {labelChildren}
  </label>
{:else if instance.type === 'FormDescription'}
  {@const descChildren = instance.children.filter(child => typeof child === 'string').join('')}
  <p class={instance.props.className || 'text-[0.8rem] text-muted-foreground'}>
    {descChildren}
  </p>
{:else if instance.type === 'FormFieldErrors'}
  <!-- FormFieldErrors would show validation errors - for now just render nothing -->
  <div class={instance.props.className}></div>
{:else if instance.type === 'FormButton'}
  {@const buttonChildren = instance.children.filter(child => typeof child === 'string').join('')}
  {@const formButtonProps = {
    title: buttonChildren || instance.props.title,
    variant: 'primary' as const,
    onClick: instance.props.onClick || createHandlerFromId(instance.props._onClickHandlerId, 'onClick'),
    disabled: instance.props.disabled,
    className: instance.props.className
  }}
  <Button {...formButtonProps} />
{:else}
  <div>Unknown component: {instance.type}</div>
{/if}
