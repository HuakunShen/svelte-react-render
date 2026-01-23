<script setup lang="ts">
import { Toggle } from '@/components/ui/toggle';
import { cn } from '@/lib/utils';
import { computed } from 'vue';

interface Props {
  pressed?: boolean;
  defaultPressed?: boolean;
  disabled?: boolean;
  variant?: 'default' | 'outline';
  size?: 'default' | 'sm' | 'lg';
  class?: string;
}

const props = withDefaults(defineProps<Props>(), {
  pressed: undefined,
  defaultPressed: undefined,
  variant: 'default',
  size: 'default',
  disabled: false
});

const emit = defineEmits<{
  (e: 'click'): void
}>();

const displayPressed = computed(() => props.pressed ?? props.defaultPressed ?? false);

const handlePressedChange = (val: boolean) => {
  // The API expects 'onClick' to be called when toggled
  console.log('PluginToggle handlePressedChange', val);
  emit('click');
};

const handleClick = (e: MouseEvent) => {
  // Fallback: sometimes update:pressed might not fire or we want to capture the click directly
  console.log('PluginToggle handleClick');
  emit('click');
};
</script>

<template>
  <Toggle
    :pressed="displayPressed"
    @update:pressed="handlePressedChange"
    @click="handleClick"
    :disabled="disabled"
    :variant="variant"
    :size="size"
    :class="cn(props.class)"
  >
    <slot />
  </Toggle>
</template>
