<script setup lang="ts">
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label'; // We need Label component, assume it exists or I'll check
import { ref, watch, onMounted } from 'vue';

interface Props {
  id?: string;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  label?: string;
  type?: string;
  class?: string;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text'
});

const emit = defineEmits<{
  (e: 'change', value: string): void;
  (e: 'input', value: string): void;
}>();

const internalValue = ref(props.value ?? props.defaultValue ?? '');

watch(() => props.value, (newValue) => {
  if (newValue !== undefined) {
    internalValue.value = newValue;
  }
});

const handleChange = (payload: string | number) => {
  const newValue = String(payload);
  internalValue.value = newValue;
  emit('change', newValue);
  emit('input', newValue);
};
</script>

<template>
  <div class="grid w-full max-w-sm items-center gap-1.5">
    <Label v-if="label" :for="id">{{ label }}</Label>
    <Input
      :id="id"
      :type="type"
      :placeholder="placeholder"
      :model-value="internalValue"
      @update:model-value="handleChange"
      :class="props.class"
    />
  </div>
</template>
