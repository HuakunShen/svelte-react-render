import type { ButtonProps, ListViewProps, InputProps, ToggleProps, BadgeProps, DividerProps } from '../../../specs/001-react-plugin-system/contracts/plugin-api'
import { componentRegistry } from '../reconciler/component-registry'

export type UIComponentType = string
export type UIComponentProps = ButtonProps | ListViewProps | InputProps | ToggleProps | BadgeProps | DividerProps | Record<string, any>

export interface UIComponentInstance {
  type: UIComponentType
  props: Record<string, any>
  children: Array<UIComponentInstance | Text>
  domNode?: HTMLElement
}

export class UIComponent implements UIComponentInstance {
  public readonly type: UIComponentType
  public props: Record<string, any> = {}
  public children: Array<UIComponentInstance | Text> = []
  public domNode?: HTMLElement

  constructor(type: UIComponentType, props: Record<string, any> = {}) {
    this.type = type
    this.validateType(type)
    this.setProps(props)
  }

  private validateType(type: UIComponentType): void {
    // Dynamic: component types are validated via registry presence
    if (!componentRegistry.has(type)) {
      // Allow creation first; host-config ensures registration for built-ins.
      // Throwing here could break dynamic registration order.
    }
  }

  public setProps(props: Record<string, any>): void {
    this.validateProps(this.type, props)
    this.props = { ...props }
  }

  public updateProps(newProps: Record<string, any>): void {
    this.validateProps(this.type, newProps)
    this.props = { ...this.props, ...newProps }
    
    if (this.domNode) {
      this.domNode.dispatchEvent(new CustomEvent('update-props', { detail: this.props }))
    }
  }

  private validateProps(type: UIComponentType, props: Record<string, any>): void {
    const isValid = componentRegistry.validateProps(type, props)
    if (!isValid) {
      const err = componentRegistry.getPropsError(type, props)
      if (err) throw new Error(err)
    }
  }

  private validateButtonProps(props: ButtonProps): void {
    if (!props.label || typeof props.label !== 'string') {
      throw new Error('Button component requires a string "label" prop')
    }

    if (!props.onClick || typeof props.onClick !== 'function') {
      throw new Error('Button component requires a function "onClick" prop')
    }

    if (props.variant && !['primary', 'secondary', 'danger'].includes(props.variant)) {
      throw new Error('Button "variant" must be one of: primary, secondary, danger')
    }

    if (props.disabled !== undefined && typeof props.disabled !== 'boolean') {
      throw new Error('Button "disabled" prop must be a boolean')
    }
  }

  private validateToggleProps(props: ToggleProps): void {
    if (typeof props.checked !== 'boolean') {
      throw new Error('Toggle requires boolean "checked" prop')
    }
    if (typeof props.onChange !== 'function') {
      throw new Error('Toggle requires function "onChange" prop')
    }
    if (props.label !== undefined && typeof props.label !== 'string') {
      throw new Error('Toggle "label" must be a string')
    }
    if (props.disabled !== undefined && typeof props.disabled !== 'boolean') {
      throw new Error('Toggle "disabled" must be a boolean')
    }
  }

  private validateBadgeProps(props: BadgeProps): void {
    if (!props.text || typeof props.text !== 'string') {
      throw new Error('Badge requires string "text" prop')
    }
    if (props.variant && !['neutral', 'success', 'warning', 'danger'].includes(props.variant)) {
      throw new Error('Badge "variant" must be one of: neutral, success, warning, danger')
    }
  }

  private validateDividerProps(props: DividerProps): void {
    if (props.spacing && !['sm', 'md', 'lg'].includes(props.spacing)) {
      throw new Error('Divider "spacing" must be one of: sm, md, lg')
    }
  }

  private validateListViewProps(props: ListViewProps): void {
    if (!props.items || !Array.isArray(props.items)) {
      throw new Error('ListView component requires an array "items" prop')
    }

    if (!props.onItemSelect || typeof props.onItemSelect !== 'function') {
      throw new Error('ListView component requires a function "onItemSelect" prop')
    }

    // Validate each item
    props.items.forEach((item, index) => {
      if (!item.id || typeof item.id !== 'string') {
        throw new Error(`ListView item at index ${index} requires a string "id" property`)
      }
      if (!item.content || typeof item.content !== 'string') {
        throw new Error(`ListView item at index ${index} requires a string "content" property`)
      }
      if (item.selected !== undefined && typeof item.selected !== 'boolean') {
        throw new Error(`ListView item at index ${index} "selected" property must be a boolean`)
      }
    })

    if (props.multiSelect !== undefined && typeof props.multiSelect !== 'boolean') {
      throw new Error('ListView "multiSelect" prop must be a boolean')
    }
  }

  private validateInputProps(props: InputProps): void {
    if (props.value === undefined || typeof props.value !== 'string') {
      throw new Error('Input component requires a string "value" prop')
    }

    if (!props.onChange || typeof props.onChange !== 'function') {
      throw new Error('Input component requires a function "onChange" prop')
    }

    if (props.placeholder !== undefined && typeof props.placeholder !== 'string') {
      throw new Error('Input "placeholder" prop must be a string')
    }

    if (props.type && !['text', 'password', 'email'].includes(props.type)) {
      throw new Error('Input "type" must be one of: text, password, email')
    }

    if (props.disabled !== undefined && typeof props.disabled !== 'boolean') {
      throw new Error('Input "disabled" prop must be a boolean')
    }

    if (props.onSubmit !== undefined && typeof props.onSubmit !== 'function') {
      throw new Error('Input "onSubmit" prop must be a function')
    }
  }

  public appendChild(child: UIComponentInstance | Text): void {
    this.children.push(child)
  }

  public insertBefore(child: UIComponentInstance | Text, beforeChild: UIComponentInstance | Text): void {
    const index = this.children.indexOf(beforeChild)
    if (index === -1) {
      this.appendChild(child)
    } else {
      this.children.splice(index, 0, child)
    }
  }

  public removeChild(child: UIComponentInstance | Text): void {
    const index = this.children.indexOf(child)
    if (index !== -1) {
      this.children.splice(index, 1)
    }
  }

  public setDomNode(domNode: HTMLElement): void {
    this.domNode = domNode
  }

  public cleanup(): void {
    this.domNode = undefined
    this.children = []
  }

  public getPublicInstance(): any {
    // Return the DOM node as the public instance (React ref target)
    return this.domNode || null
  }

  public toDebugString(): string {
    return `UIComponent(${this.type}, props: ${Object.keys(this.props).join(', ')}, children: ${this.children.length})`
  }
}

// Utility functions for creating typed UI components
export function createButtonComponent(props: ButtonProps): UIComponent {
  return new UIComponent('button', props)
}

export function createListViewComponent(props: ListViewProps): UIComponent {
  return new UIComponent('listview', props)
}

export function createInputComponent(props: InputProps): UIComponent {
  return new UIComponent('input', props)
}
