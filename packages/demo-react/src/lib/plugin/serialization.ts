import type { SvelteComponentInstance } from '@svelte-react-render/api';
import type { SerializedComponentTree } from './worker-rpc-types';

const EVENT_HANDLER_PROPS = [
  'onClick',
  'onChange',
  'onInput',
  'onSubmit',
  'onFocus',
  'onBlur',
  'onKeyDown',
  'onKeyUp',
  'onKeyPress',
  'onMouseDown',
  'onMouseUp',
  'onMouseEnter',
  'onMouseLeave'
] as const;

export interface SerializationContext {
  handlerRegistry: Map<string, (...args: unknown[]) => unknown>;
  handlerIdCounter: number;
}

export function createSerializationContext(): SerializationContext {
  return {
    handlerRegistry: new Map(),
    handlerIdCounter: 0
  };
}

export function serializeComponentTree(
  instance: SvelteComponentInstance | string | null,
  context: SerializationContext
): SerializedComponentTree | string | null {
  if (instance == null) {
    return null;
  }

  if (typeof instance === 'string') {
    return instance;
  }

  const serializedProps: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(instance.props)) {
    if (key === 'children' || key === 'key' || key === 'ref') {
      continue;
    }

    if (EVENT_HANDLER_PROPS.includes(key as typeof EVENT_HANDLER_PROPS[number]) && typeof value === 'function') {
      const handlerId = `handler_${context.handlerIdCounter++}`;
      context.handlerRegistry.set(handlerId, value as (...args: unknown[]) => unknown);
      serializedProps[`_${key}HandlerId`] = handlerId;
    } else if (typeof value === 'function') {
      continue;
    } else if (value !== undefined && value !== null) {
      try {
        JSON.stringify(value);
        serializedProps[key] = value;
      } catch {
        console.warn(`Skipping non-serializable prop: ${key}`);
      }
    }
  }

  const serializedChildren: (SerializedComponentTree | string)[] = [];
  for (const child of instance.children) {
    const serializedChild = serializeComponentTree(child, context);
    if (serializedChild !== null) {
      serializedChildren.push(serializedChild as SerializedComponentTree | string);
    }
  }

  return {
    type: instance.type,
    props: serializedProps,
    children: serializedChildren,
    id: instance.id,
    parent: instance.parent?.id || null
  };
}

export function getHandlerFromRegistry(
  handlerId: string,
  context: SerializationContext
): ((...args: unknown[]) => unknown) | undefined {
  return context.handlerRegistry.get(handlerId);
}

export function clearHandlerRegistry(context: SerializationContext): void {
  context.handlerRegistry.clear();
}
