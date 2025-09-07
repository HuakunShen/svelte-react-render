import { Plugin } from './plugin'
import type { 
  PluginRegistryAPI, 
  PluginModule, 
  PluginMetadata 
} from '../../../specs/001-react-plugin-system/contracts/plugin-api'

export class PluginRegistry implements PluginRegistryAPI {
  private plugins: Map<string, Plugin> = new Map()
  private readonly maxPlugins: number = 10
  private readonly supportedApiVersions: string[] = ['1.0.0']

  constructor(maxPlugins?: number) {
    if (maxPlugins !== undefined && maxPlugins > 0) {
      this.maxPlugins = maxPlugins
    }
  }

  public async loadPlugin(path: string): Promise<PluginModule> {
    if (!path || path.trim() === '') {
      throw new Error('Plugin path is required')
    }

    try {
      // Dynamic import of the plugin module
      const module = await import(/* @vite-ignore */ path)
      
      if (!module.default) {
        throw new Error(`Plugin at ${path} must export a default React component`)
      }

      if (!module.metadata) {
        throw new Error(`Plugin at ${path} must export metadata object`)
      }

      const pluginModule: PluginModule = {
        default: module.default,
        metadata: module.metadata
      }

      // Validate and register the plugin
      const plugin = new Plugin(pluginModule, path)
      this.registerPlugin(pluginModule)

      return pluginModule
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('Failed to resolve module')) {
          throw new Error(`Plugin not found at path: ${path}`)
        }
        throw error
      }
      throw new Error(`Failed to load plugin from ${path}: ${error}`)
    }
  }

  public registerPlugin(pluginModule: PluginModule): void {
    if (!pluginModule) {
      throw new Error('Plugin module is required')
    }

    // Check plugin limit
    if (this.plugins.size >= this.maxPlugins) {
      throw new Error(`Cannot register plugin: maximum limit of ${this.maxPlugins} plugins reached`)
    }

    const plugin = new Plugin(pluginModule)

    // Check for duplicate registration
    if (this.plugins.has(plugin.id)) {
      throw new Error(`Plugin with ID "${plugin.id}" is already registered`)
    }

    // Validate API version compatibility
    if (!this.isApiVersionSupported(plugin.apiVersion)) {
      throw new Error(
        `Plugin API version "${plugin.apiVersion}" is not supported. ` +
        `Supported versions: ${this.supportedApiVersions.join(', ')}`
      )
    }

    this.plugins.set(plugin.id, plugin)

    // Emit registration event
    this.emitEvent('plugin:loaded', {
      pluginId: plugin.id,
      metadata: plugin.toMetadata()
    })
  }

  public unregisterPlugin(pluginId: string): void {
    if (!pluginId || pluginId.trim() === '') {
      throw new Error('Plugin ID is required')
    }

    const plugin = this.plugins.get(pluginId)
    if (!plugin) {
      throw new Error(`Plugin with ID "${pluginId}" is not registered`)
    }

    this.plugins.delete(pluginId)

    // Emit unregistration event
    this.emitEvent('plugin:unregistered', {
      pluginId,
      metadata: plugin.toMetadata()
    })
  }

  public getPlugin(pluginId: string): PluginModule | null {
    if (!pluginId || pluginId.trim() === '') {
      return null
    }

    const plugin = this.plugins.get(pluginId)
    if (!plugin) {
      return null
    }

    return {
      default: plugin.component,
      metadata: plugin.toMetadata()
    }
  }

  public listPlugins(): PluginMetadata[] {
    return Array.from(this.plugins.values()).map(plugin => plugin.toMetadata())
  }

  public hasPlugin(pluginId: string): boolean {
    return this.plugins.has(pluginId)
  }

  public getPluginCount(): number {
    return this.plugins.size
  }

  public getMaxPlugins(): number {
    return this.maxPlugins
  }

  public getSupportedApiVersions(): string[] {
    return [...this.supportedApiVersions]
  }

  public isApiVersionSupported(apiVersion: string): boolean {
    return this.supportedApiVersions.includes(apiVersion)
  }

  public clear(): void {
    const pluginIds = Array.from(this.plugins.keys())
    
    pluginIds.forEach(pluginId => {
      this.unregisterPlugin(pluginId)
    })
  }

  public validatePlugin(pluginModule: PluginModule): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    try {
      // This will throw if validation fails
      new Plugin(pluginModule)
      return { isValid: true, errors: [] }
    } catch (error) {
      errors.push(error instanceof Error ? error.message : 'Unknown validation error')
      return { isValid: false, errors }
    }
  }

  public getPluginsByApiVersion(apiVersion: string): PluginMetadata[] {
    return Array.from(this.plugins.values())
      .filter(plugin => plugin.apiVersion === apiVersion)
      .map(plugin => plugin.toMetadata())
  }

  public getPluginsByAuthor(author: string): PluginMetadata[] {
    return Array.from(this.plugins.values())
      .filter(plugin => plugin.author === author)
      .map(plugin => plugin.toMetadata())
  }

  private emitEvent(eventType: string, detail: any): void {
    const event = new CustomEvent(eventType, { detail })
    
    // If running in browser, dispatch on document
    if (typeof document !== 'undefined') {
      document.dispatchEvent(event)
    }
    
    // Also emit on the registry instance for direct listeners
    if (this.eventListeners.has(eventType)) {
      const listeners = this.eventListeners.get(eventType) || []
      listeners.forEach(listener => {
        try {
          listener(detail)
        } catch (error) {
          console.error(`Error in plugin registry event listener for ${eventType}:`, error)
        }
      })
    }
  }

  // Event system for programmatic listeners
  private eventListeners: Map<string, Array<(detail: any) => void>> = new Map()

  public addEventListener(eventType: string, listener: (detail: any) => void): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, [])
    }
    this.eventListeners.get(eventType)!.push(listener)
  }

  public removeEventListener(eventType: string, listener: (detail: any) => void): void {
    const listeners = this.eventListeners.get(eventType)
    if (listeners) {
      const index = listeners.indexOf(listener)
      if (index !== -1) {
        listeners.splice(index, 1)
      }
    }
  }

  public destroy(): void {
    this.clear()
    this.eventListeners.clear()
  }

  public getRegistryStats() {
    return {
      totalPlugins: this.plugins.size,
      maxPlugins: this.maxPlugins,
      supportedApiVersions: this.supportedApiVersions,
      pluginsByApiVersion: Object.fromEntries(
        this.supportedApiVersions.map(version => [
          version,
          this.getPluginsByApiVersion(version).length
        ])
      ),
      availableSlots: this.maxPlugins - this.plugins.size
    }
  }
}