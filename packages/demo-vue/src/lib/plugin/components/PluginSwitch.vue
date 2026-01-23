<script setup lang="ts">
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { computed } from 'vue';

interface Props {
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  id?: string;
  class?: string;
}

const props = withDefaults(defineProps<Props>(), {
  checked: undefined,
  defaultChecked: undefined,
  disabled: false
});

const emit = defineEmits<{
  (e: 'change', checked: boolean): void
}>();

const displayChecked = computed(() => props.checked ?? props.defaultChecked ?? false);

const handleCheckedChange = (newChecked: boolean) => {
  console.log('PluginSwitch handleCheckedChange', newChecked);
  emit('change', newChecked);
};

const handleClick = (e: MouseEvent) => {
  // Fallback: emit change with toggled value
  console.log('PluginSwitch handleClick', !displayChecked.value);
  emit('change', !displayChecked.value);
};
</script>

<template>
  <Switch
    :checked="displayChecked"
    @update:checked="handleCheckedChange"
    @click="handleClick"
    :disabled="disabled"
    :id="id"
    :class="cn(props.class)"
  />
</template>
