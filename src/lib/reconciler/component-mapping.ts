import type { ComponentTypeMapping } from '../../../specs/001-react-plugin-system/contracts/reconciler-api'
import type { ButtonProps, ListViewProps, InputProps } from '../../../specs/001-react-plugin-system/contracts/plugin-api'

// Component type mapping implementation
export const componentTypeMapping: ComponentTypeMapping = {
  'plugin-button': {
    props: {} as ButtonProps,
    svelteComponent: 'Button'
  },
  'plugin-listview': {
    props: {} as ListViewProps, 
    svelteComponent: 'ListView'
  },
  'plugin-input': {
    props: {} as InputProps,
    svelteComponent: 'Input'
  }
}

// Utility type guards
export function isValidPluginComponentType(type: string): type is keyof ComponentTypeMapping {
  return type in componentTypeMapping
}

export function getComponentInfo(type: string) {
  if (!isValidPluginComponentType(type)) {
    return null
  }
  
  return componentTypeMapping[type]
}

// Props validation helpers
export function validateButtonProps(props: any): props is ButtonProps {
  return (
    typeof props === 'object' &&
    props !== null &&
    typeof props.label === 'string' &&
    typeof props.onClick === 'function' &&
    (props.variant === undefined || ['primary', 'secondary', 'danger'].includes(props.variant)) &&
    (props.disabled === undefined || typeof props.disabled === 'boolean')
  )
}

export function validateListViewProps(props: any): props is ListViewProps {
  return (
    typeof props === 'object' &&
    props !== null &&
    Array.isArray(props.items) &&
    props.items.every((item: any) =>
      typeof item === 'object' &&
      item !== null &&
      typeof item.id === 'string' &&
      typeof item.content === 'string' &&
      (item.selected === undefined || typeof item.selected === 'boolean')
    ) &&
    typeof props.onItemSelect === 'function' &&
    (props.multiSelect === undefined || typeof props.multiSelect === 'boolean')
  )
}

export function validateInputProps(props: any): props is InputProps {
  return (
    typeof props === 'object' &&
    props !== null &&
    typeof props.value === 'string' &&
    typeof props.onChange === 'function' &&
    (props.placeholder === undefined || typeof props.placeholder === 'string') &&
    (props.type === undefined || ['text', 'password', 'email'].includes(props.type)) &&
    (props.disabled === undefined || typeof props.disabled === 'boolean') &&
    (props.onSubmit === undefined || typeof props.onSubmit === 'function')
  )
}

// Main validation function
export function validateComponentProps(type: string, props: any): boolean {
  switch (type) {
    case 'plugin-button':
      return validateButtonProps(props)
    case 'plugin-listview':
      return validateListViewProps(props)
    case 'plugin-input':
      return validateInputProps(props)
    default:
      return false
  }
}

// Props transformation helpers (if needed for different prop names between React and Svelte)
export function transformPropsForSvelte(type: string, reactProps: any): any {
  // For now, props are 1:1 mapped, but this allows future customization
  switch (type) {
    case 'plugin-button':
      return {
        label: reactProps.label,
        variant: reactProps.variant || 'primary',
        disabled: reactProps.disabled || false,
        onClick: reactProps.onClick
      }
    
    case 'plugin-listview':
      return {
        items: reactProps.items || [],
        onItemSelect: reactProps.onItemSelect,
        multiSelect: reactProps.multiSelect || false
      }
    
    case 'plugin-input':
      return {
        value: reactProps.value || '',
        placeholder: reactProps.placeholder || '',
        type: reactProps.type || 'text',
        disabled: reactProps.disabled || false,
        onChange: reactProps.onChange,
        onSubmit: reactProps.onSubmit
      }
    
    default:
      return reactProps
  }
}

// Error messages for invalid props
export function getPropsValidationError(type: string, props: any): string | null {
  if (!isValidPluginComponentType(type)) {
    return `Unknown component type: ${type}`
  }

  try {
    switch (type) {
      case 'plugin-button':
        if (!props.label || typeof props.label !== 'string') {
          return 'Button component requires a string "label" prop'
        }
        if (!props.onClick || typeof props.onClick !== 'function') {
          return 'Button component requires a function "onClick" prop'
        }
        if (props.variant && !['primary', 'secondary', 'danger'].includes(props.variant)) {
          return 'Button "variant" must be one of: primary, secondary, danger'
        }
        break

      case 'plugin-listview':
        if (!Array.isArray(props.items)) {
          return 'ListView component requires an array "items" prop'
        }
        if (!props.onItemSelect || typeof props.onItemSelect !== 'function') {
          return 'ListView component requires a function "onItemSelect" prop'
        }
        
        // Validate each item
        for (let i = 0; i < props.items.length; i++) {
          const item = props.items[i]
          if (!item.id || typeof item.id !== 'string') {
            return `ListView item at index ${i} requires a string "id" property`
          }
          if (!item.content || typeof item.content !== 'string') {
            return `ListView item at index ${i} requires a string "content" property`
          }
        }
        break

      case 'plugin-input':
        if (typeof props.value !== 'string') {
          return 'Input component requires a string "value" prop'
        }
        if (!props.onChange || typeof props.onChange !== 'function') {
          return 'Input component requires a function "onChange" prop'
        }
        if (props.type && !['text', 'password', 'email'].includes(props.type)) {
          return 'Input "type" must be one of: text, password, email'
        }
        break
    }

    return null // Valid props
  } catch (error) {
    return `Props validation error: ${error instanceof Error ? error.message : 'Unknown error'}`
  }
}

// Development helpers
export function getComponentDebugInfo(type: string, props: any) {
  return {
    type,
    isValidType: isValidPluginComponentType(type),
    propsValid: validateComponentProps(type, props),
    propsError: getPropsValidationError(type, props),
    transformedProps: transformPropsForSvelte(type, props),
    svelteComponentName: getComponentInfo(type)?.svelteComponent
  }
}

export default componentTypeMapping