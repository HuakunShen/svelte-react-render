import type { PluginMetadata, PluginModule } from '../../../specs/001-react-plugin-system/contracts/plugin-api'

export class Plugin {
  public readonly id: string
  public readonly name: string
  public readonly version: string
  public readonly description: string
  public readonly author: string
  public readonly entry: string
  public readonly apiVersion: string
  public readonly component: React.ComponentType

  constructor(module: PluginModule, entryPath?: string) {
    this.validateMetadata(module.metadata)
    
    this.id = module.metadata.id
    this.name = module.metadata.name
    this.version = module.metadata.version
    this.description = module.metadata.description
    this.author = module.metadata.author
    this.apiVersion = module.metadata.apiVersion
    this.entry = entryPath || 'unknown'
    this.component = module.default

    this.validateComponent()
  }

  private validateMetadata(metadata: PluginMetadata): void {
    if (!metadata) {
      throw new Error('Plugin metadata is required')
    }

    if (!metadata.id || metadata.id.trim() === '') {
      throw new Error('Plugin ID is required and cannot be empty')
    }

    if (!metadata.name || metadata.name.trim() === '') {
      throw new Error('Plugin name is required and cannot be empty')
    }

    if (!metadata.version) {
      throw new Error('Plugin version is required')
    }

    // Validate semantic versioning format (x.y.z)
    const semverRegex = /^\d+\.\d+\.\d+$/
    if (!semverRegex.test(metadata.version)) {
      throw new Error(`Plugin version "${metadata.version}" must follow semantic versioning (x.y.z)`)
    }

    if (!metadata.author || metadata.author.trim() === '') {
      throw new Error('Plugin author is required and cannot be empty')
    }

    if (!metadata.apiVersion) {
      throw new Error('Plugin API version is required')
    }

    // Validate API version compatibility
    const supportedApiVersions = ['1.0.0']
    if (!supportedApiVersions.includes(metadata.apiVersion)) {
      throw new Error(`Plugin API version "${metadata.apiVersion}" is not supported. Supported versions: ${supportedApiVersions.join(', ')}`)
    }
  }

  private validateComponent(): void {
    if (!this.component) {
      throw new Error('Plugin default export (React component) is required')
    }

    if (typeof this.component !== 'function') {
      throw new Error('Plugin default export must be a React component (function)')
    }
  }

  public toMetadata(): PluginMetadata {
    return {
      id: this.id,
      name: this.name,
      version: this.version,
      description: this.description,
      author: this.author,
      apiVersion: this.apiVersion
    }
  }

  public isCompatibleWith(apiVersion: string): boolean {
    return this.apiVersion === apiVersion
  }

  public toString(): string {
    return `Plugin(${this.id}@${this.version})`
  }
}