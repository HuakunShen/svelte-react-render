import type { PluginContainer as IPluginContainer, ErrorBoundaryState } from '../../../specs/001-react-plugin-system/contracts/plugin-api'
import type { ReactReconcilerRoot } from '../../../specs/001-react-plugin-system/contracts/reconciler-api'

export class PluginContainer implements IPluginContainer {
  public readonly pluginId: string
  public domNode: HTMLElement
  public reconcilerRoot: ReactReconcilerRoot | null = null
  public errorBoundary: ErrorBoundaryState
  public isActive: boolean = false

  private cleanupCallbacks: Array<() => void> = []

  constructor(pluginId: string) {
    if (!pluginId || pluginId.trim() === '') {
      throw new Error('Plugin ID is required for container')
    }

    this.pluginId = pluginId
    this.errorBoundary = {
      hasError: false
    }
  }

  private setupErrorHandling(): void {
    const errorHandler = (event: ErrorEvent) => {
      if (this.domNode && event.target instanceof Node && this.domNode.contains(event.target)) {
        this.handleError(event.error)
      }
    }

    window.addEventListener('error', errorHandler)
    this.cleanupCallbacks.push(() => window.removeEventListener('error', errorHandler))

    const rejectionHandler = (event: PromiseRejectionEvent) => {
      if (this.isActive) {
        this.handleError(new Error(`Unhandled promise rejection in plugin ${this.pluginId}: ${event.reason}`))
      }
    }

    window.addEventListener('unhandledrejection', rejectionHandler)
    this.cleanupCallbacks.push(() => window.removeEventListener('unhandledrejection', rejectionHandler))
  }

  public mount(domNode: HTMLElement): void {
    if (!domNode) {
      throw new Error('DOM element is required for mounting plugin container')
    }

    if (this.isActive) {
      throw new Error(`Plugin container ${this.pluginId} is already mounted`)
    }

    this.domNode = domNode
    this.domNode.className = `plugin-container plugin-container--${this.pluginId}`
    this.domNode.setAttribute('data-plugin-id', this.pluginId)
    this.domNode.setAttribute('role', 'region')
    this.domNode.setAttribute('aria-label', `Plugin: ${this.pluginId}`)

    this.isActive = true
    this.clearError()
    this.setupErrorHandling()
  }

  public unmount(): void {
    if (!this.isActive) {
      return
    }

    if (this.reconcilerRoot) {
      this.reconcilerRoot.unmount()
      this.reconcilerRoot = null
    }

    if (this.domNode) {
      this.domNode.innerHTML = ''
    }

    this.isActive = false
    this.clearError()
  }

  public setReconcilerRoot(root: ReactReconcilerRoot): void {
    if (this.reconcilerRoot) {
      throw new Error(`Reconciler root already set for plugin ${this.pluginId}`)
    }
    
    this.reconcilerRoot = root
  }

  public handleError(error: Error): void {
    this.errorBoundary = {
      hasError: true,
      error,
      errorInfo: error.stack || error.message
    }

    this.renderErrorFallback()

    const errorEvent = new CustomEvent('plugin:error', {
      detail: {
        pluginId: this.pluginId,
        error,
        container: this
      }
    })
    
    this.domNode.dispatchEvent(errorEvent)
  }

  public clearError(): void {
    this.errorBoundary = {
      hasError: false
    }

    if (this.domNode) {
        const errorElement = this.domNode.querySelector('.plugin-error')
        if (errorElement) {
          errorElement.remove()
        }
    }
  }

  private renderErrorFallback(): void {
    if (!this.domNode) return

    this.domNode.innerHTML = ''

    const errorDiv = document.createElement('div')
    errorDiv.className = 'plugin-error'
    errorDiv.innerHTML = `
      <div class="plugin-error__content">
        <h3 class="plugin-error__title">Plugin Error</h3>
        <p class="plugin-error__message">
          Plugin "${this.pluginId}" encountered an error and cannot be displayed.
        </p>
        <details class="plugin-error__details">
          <summary>Error Details</summary>
          <pre class="plugin-error__stack">${this.errorBoundary.errorInfo || 'No additional information available'}</pre>
        </details>
      </div>
    `

    this.domNode.appendChild(errorDiv)
  }

  public destroy(): void {
    this.unmount()
    
    this.cleanupCallbacks.forEach(cleanup => {
      try {
        cleanup()
      } catch (error) {
        console.warn(`Error during plugin container cleanup for ${this.pluginId}:`, error)
      }
    })
    
    this.cleanupCallbacks = []
  }
}