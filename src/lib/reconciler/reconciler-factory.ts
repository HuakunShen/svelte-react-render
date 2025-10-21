import React from 'react'
import ReactReconciler from 'react-reconciler'
import type { 
  ReconcilerFactory as IReconcilerFactory, 
  ReactReconcilerRoot,
  HostContext 
} from '../../../specs/001-react-plugin-system/contracts/reconciler-api'
import hostConfig, { type SvelteHostContext } from './host-config'

// Create the reconciler instance
// @ts-ignore
const reconciler = ReactReconciler(hostConfig)

// Set display name for debugging
if (process.env.NODE_ENV === 'development') {
  reconciler.injectIntoDevTools({
    bundleType: 1, // 0 for production, 1 for development
    version: '18.0.0',
    rendererPackageName: 'svelte-react-reconciler',
    findFiberByHostInstance: () => null,
  })
}

class SvelteReactReconcilerRoot implements ReactReconcilerRoot {
  public _internalRoot: any
  private container: HTMLElement
  private hostContext: SvelteHostContext

  constructor(container: HTMLElement, hostContext?: SvelteHostContext) {
    this.container = container
    this.hostContext = hostContext || {
      theme: 'light'
    }

    // Create the fiber root
    this._internalRoot = reconciler.createContainer(
      container,
      0, // tag
      null, // hydrationCallbacks
      false, // isStrictMode
      null, // concurrentUpdatesByDefaultOverride
      '', // identifierPrefix
      () => {}, // onRecoverableError
      null // transitionCallbacks
    )
  }

  public render(element: React.ReactNode): void {
    try {
      reconciler.updateContainer(
        element,
        this._internalRoot,
        null, // parentComponent
        () => {} // callback
      )
    } catch (error) {
      console.error('Error rendering React element:', error)
      
      // Emit error event for error boundaries to catch
      const errorEvent = new CustomEvent('reconciler:error', {
        detail: { error, container: this.container },
        bubbles: true
      })
      this.container.dispatchEvent(errorEvent)
      
      throw error
    }
  }

  public unmount(): void {
    try {
      reconciler.updateContainer(
        null, // Render null to unmount
        this._internalRoot,
        null,
        () => {
          // Cleanup after unmount
          this.cleanup()
        }
      )
    } catch (error) {
      console.error('Error unmounting React tree:', error)
      // Try to cleanup anyway
      this.cleanup()
      throw error
    }
  }

  private cleanup(): void {
    // Clear any remaining DOM content
    if (this.container && this.container.parentElement) {
      this.container.innerHTML = ''
    }
  }

  public getContainer(): HTMLElement {
    return this.container
  }

  public getHostContext(): SvelteHostContext {
    return this.hostContext
  }
}

export class ReconcilerFactory implements IReconcilerFactory {
  public createRoot(container: HTMLElement, hostContext?: HostContext): ReactReconcilerRoot {
    if (!container) {
      throw new Error('Container element is required to create reconciler root')
    }

    if (!(container instanceof HTMLElement)) {
      throw new Error('Container must be an HTMLElement')
    }

    // Convert generic HostContext to SvelteHostContext
    const svelteHostContext: SvelteHostContext = {
      theme: hostContext?.theme || 'light',
      namespace: hostContext?.namespace
    }

    return new SvelteReactReconcilerRoot(container, svelteHostContext)
  }

  public updateContainer(element: React.ReactNode, root: ReactReconcilerRoot): void {
    if (!root) {
      throw new Error('Reconciler root is required')
    }

    if (!(root instanceof SvelteReactReconcilerRoot)) {
      throw new Error('Invalid reconciler root type')
    }

    root.render(element)
  }

  // Utility methods
  public static isValidElement(element: any): element is React.ReactElement {
    return React.isValidElement(element)
  }

  public static createElement(type: string, props?: any, ...children: React.ReactNode[]): React.ReactElement {
    return React.createElement(type, props, ...children)
  }

  // Error boundary helper
  public static createErrorBoundary(
    fallback: React.ComponentType<{ error: Error; resetError: () => void }>,
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  ): React.ComponentType<{ children: React.ReactNode }> {
    return class ErrorBoundary extends React.Component<
      { children: React.ReactNode },
      { hasError: boolean; error?: Error }
    > {
      constructor(props: { children: React.ReactNode }) {
        super(props)
        this.state = { hasError: false }
      }

      static getDerivedStateFromError(error: Error) {
        return { hasError: true, error }
      }

      componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('React Error Boundary caught an error:', error, errorInfo)
        if (onError) {
          onError(error, errorInfo)
        }
      }

      render() {
        if (this.state.hasError && this.state.error) {
          const FallbackComponent = fallback
          return React.createElement(FallbackComponent, {
            error: this.state.error,
            resetError: () => this.setState({ hasError: false, error: undefined })
          })
        }

        return this.props.children
      }
    }
  }

  // Performance helpers
  public static batch(callback: () => void): void {
    // React 18 batches automatically, but we can use flushSync if needed
    callback()
  }

  public static flushSync(callback: () => void): void {
    if ('flushSync' in reconciler) {
      (reconciler as any).flushSync(callback)
    } else {
      callback()
    }
  }
}

export default ReconcilerFactory