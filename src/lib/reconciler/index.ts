// Export main reconciler factory
export { ReconcilerFactory } from './reconciler-factory'
export { default as ReconcilerFactoryDefault } from './reconciler-factory'

// Export host configuration
export { default as hostConfig } from './host-config'
export type { SvelteHostContext } from './host-config'

// Export runtime component registry API
export { componentRegistry, registerComponent } from './component-registry'

// Export component mapping utilities
export {
  componentTypeMapping,
  isValidPluginComponentType,
  getComponentInfo,
  validateComponentProps,
  validateButtonProps,
  validateListViewProps,
  validateInputProps,
  transformPropsForSvelte,
  getPropsValidationError,
  getComponentDebugInfo
} from './component-mapping'

// Re-export types from contracts
export type {
  ReconcilerFactory as IReconcilerFactory,
  ReactReconcilerRoot,
  HostConfig,
  HostContext,
  ReconcilerComponentType,
  ComponentTypeMapping,
  SvelteComponentInstance
} from '../../../specs/001-react-plugin-system/contracts/reconciler-api'
