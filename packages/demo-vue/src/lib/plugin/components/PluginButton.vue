<script setup lang="ts">
import { Button } from '@/components/ui/button';
import type { ButtonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { computed } from 'vue';

interface Props {
  title?: string;
  icon?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'destructive' | 'ghost' | 'link';
  shortcut?: string;
  class?: string;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'secondary',
  disabled: false
});

const emit = defineEmits<{
  (e: 'click'): void
}>();

const variantMap: Record<string, ButtonVariants['variant']> = {
  primary: 'default',
  secondary: 'secondary',
  outline: 'outline',
  destructive: 'destructive',
  ghost: 'ghost',
  link: 'link'
};

const mappedVariant = computed(() => variantMap[props.variant] || 'secondary');

const handleClick = (e: MouseEvent) => {
  // Prevent passing the DOM event to the parent handler
  emit('click');
};
</script>

<template>
  <Button
    :variant="mappedVariant"
    :disabled="disabled"
    :class="props.class"
    @click="handleClick"
  >
    <span v-if="icon" class="text-base">{{ icon }}</span>
    <span v-if="title" class="flex-1">{{ title }}</span>
    <span v-if="shortcut" class="ml-2 rounded bg-secondary px-1.5 py-0.5 text-xs opacity-60">
      {{ shortcut }}
    </span>
  </Button>
</template>
