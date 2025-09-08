// Public entry point for the library API

// Reconciler API
export {
  ReconcilerFactory,
  componentRegistry,
  registerComponent,
} from './lib/reconciler'

// Plugin system API
export {
  PluginRegistry,
  PluginContainer,
  Plugin,
} from './lib/plugin-system'

// Contract types (re-exported for consumers)
export type {
  PluginMetadata,
  PluginModule,
  PluginRegistryAPI,
  PluginContainerAPI,
  PluginContainer as IPluginContainer,
  PluginEvents,
  PluginError,
  PluginErrorType,
} from '../specs/001-react-plugin-system/contracts/plugin-api'

export type {
  ReactReconcilerRoot,
  HostConfig,
  HostContext,
  ReconcilerComponentType,
  ComponentTypeMapping,
  SvelteComponentInstance,
} from '../specs/001-react-plugin-system/contracts/reconciler-api'

