import type { HostConfig } from "react-reconciler";
import type { SvelteComponentInstance, ComponentType } from "./types";
import type { SimpleRenderBridge } from "./bridge";

type Type = ComponentType;
type Props = Record<string, any>;
type Container = SimpleRenderBridge;
type Instance = SvelteComponentInstance;
type TextInstance = string;
type SuspenseInstance = never;
type HydratableInstance = never;
type PublicInstance = Instance;
type HostContext = Record<string, never>;
type UpdatePayload = Record<string, any>;
type ChildSet = never;
type TimeoutHandle = number;
type NoTimeout = -1;

let instanceCounter = 0;

function generateId(): string {
  return `instance-${instanceCounter++}`;
}

export const hostConfig: HostConfig<
  Type,
  Props,
  Container,
  Instance,
  TextInstance,
  SuspenseInstance,
  HydratableInstance,
  PublicInstance,
  HostContext,
  UpdatePayload,
  ChildSet,
  TimeoutHandle,
  NoTimeout
> = {
  supportsMutation: true,
  supportsPersistence: false,
  supportsHydration: false,

  now: () => performance.now(),

  getRootHostContext(): HostContext {
    return {};
  },

  getChildHostContext(parentHostContext): HostContext {
    return parentHostContext;
  },

  prepareForCommit(): null {
    return null;
  },

  resetAfterCommit(container: Container): void {
    console.log("Reconciler: resetAfterCommit - calling update()");
    // Call update after any commit to notify Svelte of changes, this is necessary to ensure the UI is updated.
    container.update();
  },

  createInstance(
    type: Type,
    props: Props,
    _rootContainer: Container,
    _hostContext: HostContext,
  ): Instance {
    console.log("Reconciler: createInstance", { type, props });

    // Allow both our custom components and standard HTML elements
    const validTypes: ComponentType[] = [
      "Button",
      "Input",
      "FormField",
      "FormControl",
      "FormLabel",
      "FormDescription",
      "FormFieldErrors",
      "FormButton",
      "Switch",
      "Toggle",
    ];

    // For standard HTML elements, just pass through
    if (
      !validTypes.includes(type as ComponentType) &&
      typeof type === "string"
    ) {
      // This is fine - it's an HTML element
      console.log("Reconciler: HTML element", type);
    } else if (!validTypes.includes(type as ComponentType)) {
      console.error("Unknown component type:", type);
    }

    return {
      type: type as ComponentType,
      props: { ...props },
      children: [],
      id: generateId(),
      parent: null,
    };
  },

  createTextInstance(
    text: string,
    _rootContainer: Container,
    _hostContext: HostContext,
  ): TextInstance {
    return text;
  },

  appendInitialChild(parent: Instance, child: Instance | TextInstance): void {
    if (typeof child === "string") {
      parent.children.push(child);
    } else {
      child.parent = parent;
      parent.children.push(child);
    }
  },

  appendChild(parent: Instance, child: Instance | TextInstance): void {
    if (typeof child === "string") {
      parent.children.push(child);
    } else {
      child.parent = parent;
      parent.children.push(child);
    }
  },

  appendChildToContainer(container: Container, child: Instance): void {
    console.log("Reconciler: appendChildToContainer", {
      childId: child.id,
      childType: child.type,
    });
    container.rootInstance = child;
    console.log("Reconciler: rootInstance set, calling update");
    // container.update(); // this line doesn't seem to be necessary, the update is called in resetAfterCommit
    console.log("Reconciler: update called");
  },

  insertBefore(
    parent: Instance,
    child: Instance | TextInstance,
    beforeChild: Instance | TextInstance,
  ): void {
    const index = parent.children.indexOf(beforeChild);
    if (index !== -1) {
      if (typeof child !== "string") {
        child.parent = parent;
      }
      parent.children.splice(index, 0, child);
    }
  },

  removeChild(parent: Instance, child: Instance | TextInstance): void {
    const index = parent.children.indexOf(child);
    if (index !== -1) {
      parent.children.splice(index, 1);
      if (typeof child !== "string") {
        child.parent = null;
      }
    }
  },

  removeChildFromContainer(container: Container, child: Instance): void {
    if (container.rootInstance === child) {
      container.rootInstance = null;
    }
  },

  commitUpdate(
    instance: Instance,
    _updatePayload: UpdatePayload,
    _type: Type,
    _oldProps: Props,
    newProps: Props,
  ): void {
    instance.props = { ...newProps };
  },

  commitTextUpdate(
    _textInstance: TextInstance,
    _oldText: string,
    _newText: string,
  ): void {
    // Text instances are immutable in our case, handled by parent
  },

  finalizeInitialChildren(): boolean {
    return false;
  },

  prepareUpdate(
    _instance: Instance,
    _type: Type,
    oldProps: Props,
    newProps: Props,
  ): UpdatePayload | null {
    // Do a shallow comparison of props to detect changes
    // Avoid JSON.stringify as it fails on circular references (e.g., React Context)
    const oldKeys = Object.keys(oldProps);
    const newKeys = Object.keys(newProps);

    if (oldKeys.length !== newKeys.length) {
      return newProps;
    }

    for (const key of newKeys) {
      if (oldProps[key] !== newProps[key]) {
        return newProps;
      }
    }

    return null;
  },

  shouldSetTextContent(_type: Type, _props: Props): boolean {
    return false;
  },

  clearContainer(container: Container): void {
    container.rootInstance = null;
  },

  getPublicInstance(instance: Instance): PublicInstance {
    return instance;
  },

  preparePortalMount(): void {
    // Not implemented
  },

  scheduleTimeout: setTimeout,
  cancelTimeout: clearTimeout,
  noTimeout: -1 as NoTimeout,
  isPrimaryRenderer: false,

  getCurrentEventPriority: () => 99 as any,
  getInstanceFromNode: () => null,
  beforeActiveInstanceBlur: () => {},
  afterActiveInstanceBlur: () => {},
  prepareScopeUpdate: () => {},
  getInstanceFromScope: () => null,
  detachDeletedInstance: () => {},
};
