import React from 'react';
import type { SvelteComponentInstance } from '@svelte-react-render/api';
import type { RPCChannel } from 'kkrpc';
import type { WorkerAPI, MainThreadAPI, SerializedComponentTree } from './worker-rpc-types';
import {
  PluginButton,
  PluginInput,
  PluginSwitch,
  PluginToggle,
  PluginFormField,
  PluginFormControl,
  PluginFormLabel,
  PluginFormDescription,
  PluginFormFieldErrors,
  PluginFormButton
} from './components';

interface ComponentRendererProps {
  instance: SvelteComponentInstance | SerializedComponentTree | string;
  rpcContext?: { rpc: RPCChannel<MainThreadAPI, WorkerAPI> | null };
}

const HTML_ELEMENTS = [
  'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'p', 'strong', 'em', 'b', 'i', 'a',
  'ul', 'ol', 'li', 'section', 'article', 'header', 'footer', 'main', 'label', 'br', 'hr'
];

const VOID_ELEMENTS = ['br', 'hr', 'img', 'input', 'meta', 'link'];

function createHandlerFromId(
  handlerId: string | undefined,
  rpcContext: ComponentRendererProps['rpcContext']
): ((...args: unknown[]) => Promise<void>) | undefined {
  if (!handlerId || !rpcContext?.rpc) return undefined;

  return async (...args: unknown[]) => {
    try {
      const api = rpcContext.rpc!.getAPI();
      await api.executeHandler(handlerId, ...args);
    } catch (error) {
      console.error(`Error executing handler:`, error);
    }
  };
}

function transformProps(
  props: Record<string, unknown>,
  rpcContext: ComponentRendererProps['rpcContext']
): Record<string, unknown> {
  const transformed: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(props)) {
    if (key === 'children' || key === 'key') continue;

    if (key.startsWith('_') && key.endsWith('HandlerId')) {
      const eventName = key.slice(1, -9);
      const handler = createHandlerFromId(value as string, rpcContext);
      if (handler) {
        if (eventName === 'onChange') {
          transformed.onInput = handler;
          transformed.onChange = handler;
        } else if (eventName === 'onInput') {
          transformed.onInput = handler;
        } else if (eventName === 'onClick') {
          transformed.onClick = handler;
        } else if (eventName === 'onSubmit') {
          transformed.onSubmit = handler;
        } else {
          transformed[eventName.toLowerCase()] = handler;
        }
      }
      continue;
    }

    if (key === 'onChange' && typeof value === 'function') {
      transformed.onInput = value;
      transformed.onChange = value;
    } else if (key === 'onInput' && typeof value === 'function') {
      transformed.onInput = value;
    } else if (key === 'onClick' && typeof value === 'function') {
      transformed.onClick = value;
    } else if (key === 'onSubmit' && typeof value === 'function') {
      transformed.onSubmit = value;
    } else if (key === 'className') {
      transformed.className = value;
    } else if (key === 'htmlFor') {
      transformed.htmlFor = value;
    } else {
      transformed[key] = value;
    }
  }

  return transformed;
}

export function ComponentRenderer({ instance, rpcContext }: ComponentRendererProps) {
  if (typeof instance === 'string') {
    return <>{instance}</>;
  }

  const { type, props, children } = instance;

  if (HTML_ELEMENTS.includes(type)) {
    const htmlProps = transformProps(props, rpcContext);
    const Tag = type as keyof JSX.IntrinsicElements;
    const isVoidElement = VOID_ELEMENTS.includes(type);

    if (isVoidElement) {
      return React.createElement(Tag, htmlProps);
    }

    return (
      <Tag {...htmlProps}>
        {children.map((child, index) => (
          <ComponentRenderer key={index} instance={child} rpcContext={rpcContext} />
        ))}
      </Tag>
    );
  }

  if (type === 'Button') {
    const textChildren = children.filter((child): child is string => typeof child === 'string').join('');
    const onClick = (props.onClick as (() => void) | undefined) ||
      createHandlerFromId(props._onClickHandlerId as string, rpcContext);
    return (
      <PluginButton
        icon={props.icon as string}
        title={textChildren || (props.title as string)}
        shortcut={props.shortcut as string}
        variant={props.variant as 'primary' | 'secondary' | 'outline' | 'destructive' | 'ghost' | 'link'}
        onClick={onClick}
        className={props.className as string}
      />
    );
  }

  if (type === 'Input') {
    const onInput = (props.onInput as ((value: string) => void) | undefined) ||
      createHandlerFromId(props._onInputHandlerId as string, rpcContext);
    const onChange = (props.onChange as ((value: string) => void) | undefined) ||
      createHandlerFromId(props._onChangeHandlerId as string, rpcContext);
    return (
      <PluginInput
        id={props.id as string}
        label={props.label as string}
        placeholder={props.placeholder as string}
        type={props.type as string}
        value={props.value as string}
        defaultValue={props.defaultValue as string}
        onInput={onInput}
        onChange={onChange}
      />
    );
  }

  if (type === 'Switch') {
    const onChange = (props.onChange as ((checked: boolean) => void) | undefined) ||
      createHandlerFromId(props._onChangeHandlerId as string, rpcContext);
    return (
      <PluginSwitch
        id={props.id as string}
        checked={props.checked as boolean}
        defaultChecked={props.defaultChecked as boolean}
        disabled={props.disabled as boolean}
        onChange={onChange}
        className={props.className as string}
      />
    );
  }

  if (type === 'Toggle') {
    const textChildren = children.filter((child): child is string => typeof child === 'string').join('');
    const onClick = (props.onClick as (() => void) | undefined) ||
      createHandlerFromId(props._onClickHandlerId as string, rpcContext);
    return (
      <PluginToggle
        pressed={props.pressed as boolean}
        defaultPressed={props.defaultPressed as boolean}
        disabled={props.disabled as boolean}
        variant={props.variant as 'default' | 'outline'}
        size={props.size as 'default' | 'sm' | 'lg'}
        onClick={onClick}
        className={props.className as string}
      >
        {textChildren}
      </PluginToggle>
    );
  }

  if (type === 'FormField') {
    return (
      <PluginFormField name={props.name as string} className={props.className as string}>
        {children.map((child, index) => (
          <ComponentRenderer key={index} instance={child} rpcContext={rpcContext} />
        ))}
      </PluginFormField>
    );
  }

  if (type === 'FormControl') {
    return (
      <PluginFormControl>
        {children.map((child, index) => (
          <ComponentRenderer key={index} instance={child} rpcContext={rpcContext} />
        ))}
      </PluginFormControl>
    );
  }

  if (type === 'FormLabel') {
    const labelChildren = children.filter((child): child is string => typeof child === 'string').join('');
    return (
      <PluginFormLabel className={props.className as string}>
        {labelChildren}
      </PluginFormLabel>
    );
  }

  if (type === 'FormDescription') {
    const descChildren = children.filter((child): child is string => typeof child === 'string').join('');
    return (
      <PluginFormDescription className={props.className as string}>
        {descChildren}
      </PluginFormDescription>
    );
  }

  if (type === 'FormFieldErrors') {
    return <PluginFormFieldErrors className={props.className as string} />;
  }

  if (type === 'FormButton') {
    const buttonChildren = children.filter((child): child is string => typeof child === 'string').join('');
    const onClick = (props.onClick as (() => void) | undefined) ||
      createHandlerFromId(props._onClickHandlerId as string, rpcContext);
    return (
      <PluginFormButton
        title={buttonChildren || (props.title as string)}
        onClick={onClick}
        disabled={props.disabled as boolean}
        className={props.className as string}
      >
        {buttonChildren}
      </PluginFormButton>
    );
  }

  return <div>Unknown component: {type}</div>;
}
