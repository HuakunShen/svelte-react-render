import { mount } from 'svelte'
import type { HostConfig } from '../../../specs/001-react-plugin-system/contracts/reconciler-api'
import { UIComponent } from '../ui-components/ui-component'
import { componentRegistry } from './component-registry'
// Ensure built-in components are registered
import './component-mapping'

// Host context for passing theme/styling info
export interface SvelteHostContext {
  theme: 'light' | 'dark'
  namespace?: string
}

export const hostConfig: HostConfig = {
  supportsMutation: true,
  supportsPersistence: false,
  supportsHydration: false,

  // Timeout functions
  now: Date.now,
  scheduleTimeout: setTimeout,
  cancelTimeout: clearTimeout,
  noTimeout: -1,

  // Context management
  getRootHostContext(rootContainer: HTMLElement): SvelteHostContext {
    const theme = rootContainer.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'
    const namespace = rootContainer.getAttribute('data-plugin-namespace') || undefined
    
    return { theme, namespace }
  },

  getChildHostContext(parentHostContext: SvelteHostContext, type: string): SvelteHostContext {
    // For now, child context inherits from parent
    return parentHostContext
  },

  // Instance creation
  createInstance(
    type: string,
    props: any,
    rootContainer: HTMLElement,
    hostContext: SvelteHostContext,
    internalHandle: any
  ): UIComponent {
    const reg = componentRegistry.get(type)
    if (!reg) throw new Error(`Unsupported React element type: ${type}`)

    // Extract component type from React element type
    const componentType = type // carry through the exact type string

    // Create UI component wrapper
    const transformed = componentRegistry.transformProps(type, props)
    const uiComponent = new UIComponent(componentType, transformed)

    // Create DOM container for this component
    const container = document.createElement('div')
    container.className = `plugin-component plugin-component--${componentType}`
    
    // Apply theme class
    container.setAttribute('data-theme', hostContext.theme)
    if (hostContext.namespace) {
      container.setAttribute('data-namespace', hostContext.namespace)
    }

    // Create and mount Svelte component
    const SvelteComponentClass = reg.svelteComponent
    
    try {
      mount(SvelteComponentClass, {
        target: container,
        props: transformed
      })

      uiComponent.setDomNode(container)
      
      return uiComponent
    } catch (error) {
      console.error(`Failed to create Svelte component for ${type}:`, error)
      throw new Error(`Failed to create component ${type}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  },

  createTextInstance(
    text: string,
    rootContainer: HTMLElement,
    hostContext: SvelteHostContext,
    internalHandle: any
  ): Text {
    return document.createTextNode(text)
  },

  // DOM manipulation
  appendInitialChild(parent: UIComponent, child: UIComponent | Text): void {
    if (child instanceof UIComponent) {
      parent.appendChild(child)
      if (child.domNode && parent.domNode) {
        parent.domNode.appendChild(child.domNode)
      }
    } else {
      // Text node
      parent.appendChild(child)
      if (parent.domNode) {
        parent.domNode.appendChild(child)
      }
    }
  },

  appendChild(parent: UIComponent, child: UIComponent | Text): void {
    this.appendInitialChild(parent, child)
  },

  appendChildToContainer(container: HTMLElement, child: UIComponent | Text): void {
    if (child instanceof UIComponent && child.domNode) {
      container.appendChild(child.domNode)
    } else {
      container.appendChild(child as Text)
    }
  },

  insertBefore(parent: UIComponent, child: UIComponent | Text, beforeChild: UIComponent | Text): void {
    if (child instanceof UIComponent && beforeChild instanceof UIComponent) {
      parent.insertBefore(child, beforeChild)
      
      if (child.domNode && parent.domNode && beforeChild.domNode) {
        parent.domNode.insertBefore(child.domNode, beforeChild.domNode)
      }
    } else {
      // Handle text nodes
      parent.insertBefore(child, beforeChild)
      
      if (parent.domNode) {
        const beforeNode = beforeChild instanceof UIComponent ? beforeChild.domNode : beforeChild
        if (beforeNode) {
          parent.domNode.insertBefore(
            child instanceof UIComponent ? child.domNode! : child,
            beforeNode
          )
        }
      }
    }
  },

  insertInContainerBefore(
    container: HTMLElement,
    child: UIComponent | Text,
    beforeChild: UIComponent | Text
  ): void {
    const childNode = child instanceof UIComponent ? child.domNode! : child
    const beforeNode = beforeChild instanceof UIComponent ? beforeChild.domNode! : beforeChild
    
    container.insertBefore(childNode, beforeNode)
  },

  removeChild(parent: UIComponent, child: UIComponent | Text): void {
    parent.removeChild(child)
    
    if (child instanceof UIComponent) {
      if (child.domNode && parent.domNode) {
        parent.domNode.removeChild(child.domNode)
      }
      child.cleanup()
    } else {
      // Text node
      if (parent.domNode && parent.domNode.contains(child)) {
        parent.domNode.removeChild(child)
      }
    }
  },

  removeChildFromContainer(container: HTMLElement, child: UIComponent | Text): void {
    const childNode = child instanceof UIComponent ? child.domNode! : child
    
    if (container.contains(childNode)) {
      container.removeChild(childNode)
    }

    if (child instanceof UIComponent) {
      child.cleanup()
    }
  },

  // Updates
  shouldSetTextContent(type: string, props: any): boolean {
    // We handle text through children, not direct text content
    return false
  },

  prepareUpdate(
    instance: UIComponent,
    type: string,
    oldProps: any,
    newProps: any,
    rootContainer: HTMLElement,
    hostContext: SvelteHostContext
  ): any {
    // Return the new props if they're different, null if no update needed
    if (oldProps === newProps) {
      return null
    }

    // Compare props to see if update is needed
    const oldKeys = Object.keys(oldProps)
    const newKeys = Object.keys(newProps)

    if (oldKeys.length !== newKeys.length) {
      return newProps
    }

    for (const key of newKeys) {
      if (oldProps[key] !== newProps[key]) {
        return newProps
      }
    }

    return null // No changes
  },

  commitUpdate(
    instance: UIComponent,
    updatePayload: any,
    type: string,
    prevProps: any,
    nextProps: any,
    internalHandle: any
  ): void {
    if (updatePayload) {
      try {
        instance.updateProps(updatePayload)
      } catch (error) {
        console.error(`Error updating ${type} component:`, error)
        throw error
      }
    }
  },

  commitTextUpdate(textInstance: Text, oldText: string, newText: string): void {
    textInstance.textContent = newText
  },

  // Finalization
  finalizeInitialChildren(
    instance: UIComponent,
    type: string,
    props: any,
    rootContainer: HTMLElement,
    hostContext: SvelteHostContext
  ): boolean {
    // Return true if commitMount should be called
    return false
  },

  // Public instance (what React refs point to)
  getPublicInstance(instance: UIComponent | Text): any {
    if (instance instanceof UIComponent) {
      return instance.getPublicInstance()
    }
    return instance
  },

  // Preparation for commit
  prepareForCommit(containerInfo: HTMLElement): Record<string, any> | null {
    return null
  },

  resetAfterCommit(containerInfo: HTMLElement): void {
    // Nothing to reset
  },

  // Portal support (not needed for our use case)
  preparePortalMount(containerInfo: HTMLElement): void {
    // Not implemented
  },

  // Error handling
  clearContainer(container: HTMLElement): void {
    container.innerHTML = ''
  }
}

export default hostConfig
