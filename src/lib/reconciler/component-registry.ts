// Runtime registry for mapping React element types to Svelte components
export type PropsValidator = (props: any) => boolean
export type PropsErrorFn = (props: any) => string | null
export type PropsTransformer = (props: any) => any

export interface ComponentRegistration {
  type: string
  svelteComponent: any
  validateProps?: PropsValidator
  getPropsError?: PropsErrorFn
  transformProps?: PropsTransformer
  displayName?: string
}

export class ComponentRegistry {
  private map = new Map<string, ComponentRegistration>()

  register(reg: ComponentRegistration): void {
    if (!reg?.type || !reg.svelteComponent) {
      throw new Error('Component registration requires type and svelteComponent')
    }
    this.map.set(reg.type, reg)
  }

  unregister(type: string): void {
    this.map.delete(type)
  }

  has(type: string): boolean {
    return this.map.has(type)
  }

  get(type: string): ComponentRegistration | undefined {
    return this.map.get(type)
  }

  validateProps(type: string, props: any): boolean {
    const reg = this.get(type)
    return reg?.validateProps ? reg.validateProps(props) : true
  }

  getPropsError(type: string, props: any): string | null {
    const reg = this.get(type)
    if (!reg) return `Unknown component type: ${type}`
    return reg.getPropsError ? reg.getPropsError(props) : null
  }

  transformProps(type: string, props: any): any {
    const reg = this.get(type)
    return reg?.transformProps ? reg.transformProps(props) : props
  }

  list(): string[] {
    return Array.from(this.map.keys())
  }
}

// Default singleton registry used by the reconciler
export const componentRegistry = new ComponentRegistry()

// Convenience API for consumers
export function registerComponent(options: ComponentRegistration): void {
  componentRegistry.register(options)
}

