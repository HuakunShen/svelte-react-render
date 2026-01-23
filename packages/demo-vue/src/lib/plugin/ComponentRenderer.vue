<script setup lang="ts">
import { computed } from 'vue';
import type { SvelteComponentInstance } from '@svelte-react-render/api';
import type { SerializedComponentTree } from './worker-rpc-types';
import type { RPCChannel } from 'kkrpc';
import type { WorkerAPI, MainThreadAPI } from './worker-rpc-types';

import PluginButton from './components/PluginButton.vue';
import PluginInput from './components/PluginInput.vue';
import PluginSwitch from './components/PluginSwitch.vue';
import PluginToggle from './components/PluginToggle.vue';
import PluginForm from './components/PluginForm.vue';
import PluginFormField from './components/PluginFormField.vue';
import PluginFormControl from './components/PluginFormControl.vue';
import PluginFormLabel from './components/PluginFormLabel.vue';
import PluginFormDescription from './components/PluginFormDescription.vue';
import PluginFormFieldErrors from './components/PluginFormFieldErrors.vue';
import PluginFormButton from './components/PluginFormButton.vue';

interface Props {
  instance: SerializedComponentTree | SvelteComponentInstance | string | null;
  rpc?: RPCChannel<MainThreadAPI, WorkerAPI> | null;
}

const props = defineProps<Props>();

const HTML_ELEMENTS = [
  'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'p', 'strong', 'em', 'b', 'i', 'a',
  'ul', 'ol', 'li', 'section', 'article', 'header', 'footer', 'main', 'label', 'br', 'hr', 'form'
];

const VOID_ELEMENTS = ['br', 'hr', 'img', 'input', 'meta', 'link'];

const componentMap: Record<string, any> = {
  Button: PluginButton,
  Input: PluginInput,
  Switch: PluginSwitch,
  Toggle: PluginToggle,
  Form: PluginForm,
  FormField: PluginFormField,
  FormControl: PluginFormControl,
  FormLabel: PluginFormLabel,
  FormDescription: PluginFormDescription,
  FormFieldErrors: PluginFormFieldErrors,
  FormButton: PluginFormButton
};

const isString = computed(() => typeof props.instance === 'string');
const node = computed(() => props.instance as SerializedComponentTree);
const isHtmlElement = computed(() => !isString.value && HTML_ELEMENTS.includes(node.value.type));
const isVoidElement = computed(() => isHtmlElement.value && VOID_ELEMENTS.includes(node.value.type));
const componentType = computed(() => !isString.value && !isHtmlElement.value ? componentMap[node.value.type] : null);

function createHandlerFromId(handlerId: string | undefined) {
  if (!handlerId) return undefined;
  
  if (!props.rpc) {
    return undefined;
  }

  return async (...args: unknown[]) => {
    try {
      const api = props.rpc!.getAPI();
      await api.executeHandler(handlerId, ...args);
    } catch (error) {
      console.error(`Error executing handler:`, error);
    }
  };
}

const resolvedProps = computed(() => {
  if (isString.value || !node.value) return {};

  const rawProps = node.value.props || {};
  const transformed: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(rawProps)) {
    if (key === 'children' || key === 'key') continue;

    if (key.startsWith('_') && key.endsWith('HandlerId')) {
      const eventName = key.slice(1, -9);
      const handler = createHandlerFromId(value as string);
      
      if (handler) {
        // Map event names to Vue event names or props
        if (eventName === 'onChange') {
          // For inputs, we might need both input and change
          transformed.onChange = handler; // mapped to @change in components
          // Some components use update:modelValue or specific events
        } else if (eventName === 'onInput') {
          transformed.onInput = handler;
        } else if (eventName === 'onClick') {
          transformed.onClick = handler;
        } else if (eventName === 'onSubmit') {
          transformed.onSubmit = handler; // mapped to @submit
        } else {
           // For HTML elements, we use onEventName (e.g. onClick)
           // Vue treats onClick prop as @click listener if passed to standard element?
           // No, in Vue <div v-bind="{ onClick: fn }"> binds the prop, not event listener.
           // We need to handle events differently for HTML elements.
        }
      }
      continue;
    }

    if (key === 'className') {
      transformed.class = value;
    } else if (key === 'htmlFor') {
      transformed.for = value;
    } else {
      transformed[key] = value;
    }
  }
  return transformed;
});

const eventListeners = computed(() => {
  if (isString.value || !node.value) return {};
  
  const listeners: Record<string, (...args: unknown[]) => void> = {};
  const rawProps = node.value.props || {};

  for (const [key, value] of Object.entries(rawProps)) {
    if (key.startsWith('_') && key.endsWith('HandlerId')) {
       const eventName = key.slice(1, -9);
       const handler = createHandlerFromId(value as string);
       if (handler) {
         // Convert camelCase event name to kebab-case for Vue v-on
         // e.g. onClick -> click, onChange -> change/input
         const vueEventName = eventName.substring(2).toLowerCase();
         listeners[vueEventName] = handler;
       }
    }
  }
  return listeners;
});

// Special handling for mapped components that expect specific props for events
const componentProps = computed(() => {
  if (componentType.value) {
    const propsObj = { ...resolvedProps.value };
    // Mapped components expect props like 'onClick', 'onChange' passed as function props
    // because we defined them that way in wrapper components (except some emit events)
    // Wait, in wrapper components I used emit('click') etc.
    // But I also defined defineProps without onEvent.
    // So I should listen to events.
    
    // However, for compatibility with React props structure coming from RPC, 
    // it's easier if I bind handlers to @event.
    return propsObj;
  }
  return resolvedProps.value;
});

// For component events:
// PluginButton emits 'click'
// PluginInput emits 'change', 'input', 'update:modelValue'
// PluginSwitch emits 'change', 'update:checked'
// PluginToggle emits 'click', 'update:pressed'

// React props come as _onClickHandlerId.
// resolvedProps has keys like 'onClick' (if I mapped them, but I didn't map them to keys in resolvedProps for handlers).
// Wait, createHandlerFromId returns a function.
// I should map these functions to the listeners expected by Vue components.

const componentEvents = computed(() => {
  if (!componentType.value) return eventListeners.value;

  const events: Record<string, (...args: unknown[]) => void> = {};
  const rawProps = node.value?.props || {};

  // PluginButton
  if (node.value.type === 'Button' || node.value.type === 'FormButton') {
    const handlerId = rawProps._onClickHandlerId as string;
    if (handlerId) {
      const handler = createHandlerFromId(handlerId);
      if (handler) events.click = handler;
    }
  }
  
  // PluginInput
  if (node.value.type === 'Input') {
    if (rawProps._onChangeHandlerId) {
      const handler = createHandlerFromId(rawProps._onChangeHandlerId as string);
      if (handler) events.change = handler; // @change
    }
    if (rawProps._onInputHandlerId) {
      const handler = createHandlerFromId(rawProps._onInputHandlerId as string);
      if (handler) events.input = handler; // @input
    }
  }

  // PluginSwitch
  if (node.value.type === 'Switch') {
     if (rawProps._onChangeHandlerId) {
       const handler = createHandlerFromId(rawProps._onChangeHandlerId as string);
       if (handler) {
         events.change = handler;
         // Also map 'update:checked' just in case the wrapper is bypassed or emits it
         // But PluginSwitch emits 'change'.
       }
     }
  }

  // PluginToggle
  if (node.value.type === 'Toggle') {
    if (rawProps._onClickHandlerId) {
      const handler = createHandlerFromId(rawProps._onClickHandlerId as string);
      if (handler) events.click = handler;
    }
  }

  return events;
});

const textChildren = computed(() => {
  if (!node.value || !node.value.children) return '';
  return node.value.children.filter(c => typeof c === 'string').join('');
});

// Helper for Button/Toggle/FormLabel etc to get text content if needed as prop
// But our wrappers accept slots mostly.
// Exception: PluginButton uses 'title' prop but can also have children?
// React demo uses 'title={textChildren || props.title}'
// PluginButton.vue uses <span v-if="title">{{ title }}</span>
// I should pass title prop if children exist.

const refinedProps = computed(() => {
  const p = { ...componentProps.value };
  
    if (['Button', 'FormButton'].includes(node.value?.type)) {
      if (!p.title && textChildren.value) {
        p.title = textChildren.value;
      }
    }
    return p;
  });
  
  </script>
  
  <template>
    <template v-if="isString">
      {{ instance }}
    </template>
  
    <template v-else-if="componentType">
      <component 
        :is="componentType" 
        v-bind="refinedProps"
        v-on="componentEvents"
      >
        <template v-if="node.children && node.children.length > 0">
          <!-- Render children recursively -->
          <!-- Filter out string children if the component treats them as title/label prop -->
          <!-- But for FormField/Form etc we need children -->
          <template v-for="(child, index) in node.children" :key="index">
            <ComponentRenderer 
              v-if="typeof child !== 'string' || !['Button', 'FormButton'].includes(node.type)"
              :instance="child" 
              :rpc="rpc" 
            />
          </template>
        </template>
      </component>
    </template>

  <template v-else-if="isHtmlElement">
    <component 
      :is="node.type" 
      v-bind="resolvedProps"
      v-on="eventListeners"
    >
      <template v-if="!isVoidElement && node.children">
        <ComponentRenderer 
          v-for="(child, index) in node.children" 
          :key="index" 
          :instance="child" 
          :rpc="rpc" 
        />
      </template>
    </component>
  </template>

  <div v-else-if="node">
    Unknown component: {{ node.type }}
  </div>
</template>
