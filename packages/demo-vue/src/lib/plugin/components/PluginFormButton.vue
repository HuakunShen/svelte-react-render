<script setup lang="ts">
import PluginButton from './PluginButton.vue';

interface Props {
  title?: string;
  disabled?: boolean;
  class?: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'click'): void
}>();

const handleClick = () => {
  emit('click');
};
</script>

<template>
  <PluginButton
    :title="title"
    variant="primary"
    :disabled="disabled"
    :class="props.class"
    @click="handleClick"
  >
    <slot />
  </PluginButton>
</template>
