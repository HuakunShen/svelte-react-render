import type { ComponentTypeMapping } from '../../../specs/001-react-plugin-system/contracts/reconciler-api'
import type { ButtonProps, ListViewProps, InputProps, ToggleProps, BadgeProps, DividerProps } from '../../../specs/001-react-plugin-system/contracts/plugin-api'
import { componentRegistry, registerComponent } from './component-registry'
import Button from '../ui-components/Button.svelte'
import ListView from '../ui-components/ListView.svelte'
import Input from '../ui-components/Input.svelte'
import Toggle from '../ui-components/Toggle.svelte'
import Badge from '../ui-components/Badge.svelte'
import Divider from '../ui-components/Divider.svelte'

// Component type mapping implementation
// Maintain a typed map for built-ins (for docs/debug), but runtime uses registry
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
  },
  'plugin-toggle': {
    props: {} as ToggleProps,
    svelteComponent: 'Toggle'
  },
  'plugin-badge': {
    props: {} as BadgeProps,
    svelteComponent: 'Badge'
  },
  'plugin-divider': {
    props: {} as DividerProps,
    svelteComponent: 'Divider'
  }
}

// Utility type guards
export function isValidPluginComponentType(type: string): type is keyof ComponentTypeMapping {
  return componentRegistry.has(type)
}

export function getComponentInfo(type: string) {
  const reg = componentRegistry.get(type)
  if (!reg) return null
  return {
    props: {},
    svelteComponent: reg.displayName || 'Unknown'
  }
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

// (definitions for validateToggleProps, validateBadgeProps, validateDividerProps appear below)

export function validateToggleProps(props: any): props is ToggleProps {
  return (
    typeof props === 'object' &&
    props !== null &&
    typeof props.checked === 'boolean' &&
    typeof props.onChange === 'function' &&
    (props.label === undefined || typeof props.label === 'string') &&
    (props.disabled === undefined || typeof props.disabled === 'boolean')
  )
}

export function validateBadgeProps(props: any): props is BadgeProps {
  return (
    typeof props === 'object' &&
    props !== null &&
    typeof props.text === 'string' &&
    (props.variant === undefined || ['neutral', 'success', 'warning', 'danger'].includes(props.variant))
  )
}

export function validateDividerProps(props: any): props is DividerProps {
  return (
    typeof props === 'object' &&
    props !== null &&
    (props.spacing === undefined || ['sm', 'md', 'lg'].includes(props.spacing))
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
    case 'plugin-toggle':
      return validateToggleProps(props)
    case 'plugin-badge':
      return validateBadgeProps(props)
    case 'plugin-divider':
      return validateDividerProps(props)
    default:
      return componentRegistry.validateProps(type, props)
  }
}

// Built-in props transformation helpers (pure, non-recursive)
function transformButtonProps(reactProps: any): ButtonProps {
  return {
    label: reactProps.label,
    variant: reactProps.variant || 'primary',
    disabled: reactProps.disabled || false,
    onClick: reactProps.onClick
  }
}

function transformListViewProps(reactProps: any): ListViewProps {
  return {
    items: reactProps.items || [],
    onItemSelect: reactProps.onItemSelect,
    multiSelect: reactProps.multiSelect || false,
    onItemRemove: reactProps.onItemRemove
  }
}

function transformInputProps(reactProps: any): InputProps {
  return {
    value: reactProps.value || '',
    placeholder: reactProps.placeholder || '',
    type: reactProps.type || 'text',
    disabled: reactProps.disabled || false,
    onChange: reactProps.onChange,
    onSubmit: reactProps.onSubmit
  }
}

function transformToggleProps(reactProps: any): ToggleProps {
  return {
    checked: !!reactProps.checked,
    label: reactProps.label || '',
    disabled: !!reactProps.disabled,
    onChange: reactProps.onChange
  }
}

function transformBadgeProps(reactProps: any): BadgeProps {
  return {
    text: reactProps.text,
    variant: reactProps.variant || 'neutral'
  }
}

function transformDividerProps(reactProps: any): DividerProps {
  return {
    spacing: reactProps.spacing || 'md'
  }
}

// Public transform helper (uses built-ins, falls back to identity for custom)
export function transformPropsForSvelte(type: string, reactProps: any): any {
  switch (type) {
    case 'plugin-button':
      return transformButtonProps(reactProps)
    case 'plugin-listview':
      return transformListViewProps(reactProps)
    case 'plugin-input':
      return transformInputProps(reactProps)
    case 'plugin-toggle':
      return transformToggleProps(reactProps)
    case 'plugin-badge':
      return transformBadgeProps(reactProps)
    case 'plugin-divider':
      return transformDividerProps(reactProps)
    default:
      return componentRegistry.transformProps(type, reactProps)
  }
}

// Error messages for invalid props
export function getPropsValidationError(type: string, props: any): string | null {
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
        return null

      case 'plugin-listview':
        if (!Array.isArray(props.items)) {
          return 'ListView component requires an array "items" prop'
        }
        if (!props.onItemSelect || typeof props.onItemSelect !== 'function') {
          return 'ListView component requires a function "onItemSelect" prop'
        }
        for (let i = 0; i < props.items.length; i++) {
          const item = props.items[i]
          if (!item.id || typeof item.id !== 'string') {
            return `ListView item at index ${i} requires a string "id" property`
          }
          if (!item.content || typeof item.content !== 'string') {
            return `ListView item at index ${i} requires a string "content" property`
          }
        }
        return null

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
        return null

      case 'plugin-toggle':
        if (typeof props.checked !== 'boolean') {
          return 'Toggle component requires boolean "checked" prop'
        }
        if (!props.onChange || typeof props.onChange !== 'function') {
          return 'Toggle component requires a function "onChange" prop'
        }
        if (props.label && typeof props.label !== 'string') {
          return 'Toggle "label" must be a string'
        }
        if (props.disabled !== undefined && typeof props.disabled !== 'boolean') {
          return 'Toggle "disabled" must be a boolean'
        }
        return null

      case 'plugin-badge':
        if (!props.text || typeof props.text !== 'string') {
          return 'Badge component requires a string "text" prop'
        }
        if (props.variant && !['neutral', 'success', 'warning', 'danger'].includes(props.variant)) {
          return 'Badge "variant" must be one of: neutral, success, warning, danger'
        }
        return null

      case 'plugin-divider':
        if (props.spacing && !['sm', 'md', 'lg'].includes(props.spacing)) {
          return 'Divider "spacing" must be one of: sm, md, lg'
        }
        return null

      default:
        return componentRegistry.getPropsError(type, props)
    }
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

// Register built-in components into runtime registry
registerComponent({
  type: 'plugin-button',
  svelteComponent: Button,
  validateProps: validateButtonProps,
  getPropsError: (p) => {
    if (!validateButtonProps(p)) return getPropsValidationError('plugin-button', p)
    return null
  },
  transformProps: transformButtonProps,
  displayName: 'Button'
})

registerComponent({
  type: 'plugin-listview',
  svelteComponent: ListView,
  validateProps: validateListViewProps,
  getPropsError: (p) => {
    if (!validateListViewProps(p)) return getPropsValidationError('plugin-listview', p)
    return null
  },
  transformProps: transformListViewProps,
  displayName: 'ListView'
})

registerComponent({
  type: 'plugin-input',
  svelteComponent: Input,
  validateProps: validateInputProps,
  getPropsError: (p) => {
    if (!validateInputProps(p)) return getPropsValidationError('plugin-input', p)
    return null
  },
  transformProps: transformInputProps,
  displayName: 'Input'
})

registerComponent({
  type: 'plugin-toggle',
  svelteComponent: Toggle,
  validateProps: validateToggleProps,
  getPropsError: (p) => {
    if (!validateToggleProps(p)) return getPropsValidationError('plugin-toggle', p)
    return null
  },
  transformProps: transformToggleProps,
  displayName: 'Toggle'
})

registerComponent({
  type: 'plugin-badge',
  svelteComponent: Badge,
  validateProps: validateBadgeProps,
  getPropsError: (p) => {
    if (!validateBadgeProps(p)) return getPropsValidationError('plugin-badge', p)
    return null
  },
  transformProps: transformBadgeProps,
  displayName: 'Badge'
})

registerComponent({
  type: 'plugin-divider',
  svelteComponent: Divider,
  validateProps: validateDividerProps,
  getPropsError: (p) => {
    if (!validateDividerProps(p)) return getPropsValidationError('plugin-divider', p)
    return null
  },
  transformProps: transformDividerProps,
  displayName: 'Divider'
})
