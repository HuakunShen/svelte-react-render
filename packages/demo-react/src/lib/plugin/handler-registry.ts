export class HandlerRegistry {
  private handlers: Map<string, (...args: unknown[]) => unknown> = new Map();
  private idCounter = 0;

  register(handler: (...args: unknown[]) => unknown): string {
    const id = `handler_${this.idCounter++}`;
    this.handlers.set(id, handler);
    return id;
  }

  async execute(handlerId: string, ...args: unknown[]): Promise<unknown> {
    const handler = this.handlers.get(handlerId);
    if (!handler) {
      console.warn(`Handler not found: ${handlerId}`);
      return;
    }

    try {
      const result = handler(...args);
      if (result instanceof Promise) {
        return await result;
      }
      return result;
    } catch (error) {
      console.error(`Error executing handler ${handlerId}:`, error);
      throw error;
    }
  }

  has(handlerId: string): boolean {
    return this.handlers.has(handlerId);
  }

  remove(handlerId: string): void {
    this.handlers.delete(handlerId);
  }

  clear(): void {
    this.handlers.clear();
    this.idCounter = 0;
  }

  get size(): number {
    return this.handlers.size;
  }
}

export const globalHandlerRegistry = new HandlerRegistry();
