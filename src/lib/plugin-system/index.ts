export { Plugin } from './plugin'
export { PluginContainer } from './plugin-container'
export { PluginRegistry } from './plugin-registry'

// Re-export types from contracts
export type {
  PluginMetadata,
  PluginModule,
  PluginRegistryAPI,
  PluginContainerAPI,
  PluginContainer as IPluginContainer,
  PluginEvents,
  PluginError,
  PluginErrorType
} from '../../../specs/001-react-plugin-system/contracts/plugin-api'