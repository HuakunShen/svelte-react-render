// Global handler registry for event callbacks in the worker
// Maps handler IDs to actual functions that can be called from the main thread

export class HandlerRegistry {
	private handlers: Map<string, Function> = new Map();
	private idCounter = 0;

	/**
	 * Register a handler function and return its ID
	 */
	register(handler: Function): string {
		const id = `handler_${this.idCounter++}`;
		this.handlers.set(id, handler);
		return id;
	}

	/**
	 * Execute a handler by ID with the given arguments
	 */
	async execute(handlerId: string, ...args: any[]): Promise<any> {
		const handler = this.handlers.get(handlerId);
		if (!handler) {
			console.warn(`Handler not found: ${handlerId}`);
			return;
		}

		try {
			const result = handler(...args);
			// Handle both sync and async handlers
			if (result instanceof Promise) {
				return await result;
			}
			return result;
		} catch (error) {
			console.error(`Error executing handler ${handlerId}:`, error);
			throw error;
		}
	}

	/**
	 * Check if a handler exists
	 */
	has(handlerId: string): boolean {
		return this.handlers.has(handlerId);
	}

	/**
	 * Remove a handler
	 */
	remove(handlerId: string): void {
		this.handlers.delete(handlerId);
	}

	/**
	 * Clear all handlers
	 */
	clear(): void {
		this.handlers.clear();
		this.idCounter = 0;
	}

	/**
	 * Get the number of registered handlers
	 */
	get size(): number {
		return this.handlers.size;
	}
}

// Global singleton instance for the worker
export const globalHandlerRegistry = new HandlerRegistry();
