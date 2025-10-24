import type { SvelteComponentInstance } from '@svelte-react-render/api';
import type { SerializedComponentTree } from './worker-rpc-types';

// Event handler properties that need to be converted to handler IDs
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
	handlerRegistry: Map<string, Function>;
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
	// Handle null/undefined
	if (instance == null) {
		return null;
	}

	// Handle text nodes
	if (typeof instance === 'string') {
		return instance;
	}

	// Clone props and replace event handlers with handler IDs
	const serializedProps: Record<string, any> = {};

	for (const [key, value] of Object.entries(instance.props)) {
		// Skip children and parent references
		if (key === 'children' || key === 'key' || key === 'ref') {
			continue;
		}

		// Check if this is an event handler
		if (EVENT_HANDLER_PROPS.includes(key as any) && typeof value === 'function') {
			// Generate handler ID
			const handlerId = `handler_${context.handlerIdCounter++}`;
			context.handlerRegistry.set(handlerId, value);
			serializedProps[`_${key}HandlerId`] = handlerId;
		} else if (typeof value === 'function') {
			// Skip other functions (like render props)
			continue;
		} else if (value !== undefined && value !== null) {
			// Try to serialize the value
			try {
				// Test if value is serializable
				JSON.stringify(value);
				serializedProps[key] = value;
			} catch (e) {
				// Skip non-serializable values
				console.warn(`Skipping non-serializable prop: ${key}`);
			}
		}
	}

	// Recursively serialize children
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
): Function | undefined {
	return context.handlerRegistry.get(handlerId);
}

export function clearHandlerRegistry(context: SerializationContext): void {
	context.handlerRegistry.clear();
}
