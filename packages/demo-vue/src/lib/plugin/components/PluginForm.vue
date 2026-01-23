<script setup lang="ts">
import { cn } from '@/lib/utils';

interface Props {
  class?: string;
}

const props = defineProps<Props>();
</script>

<template>
  <form :class="cn('space-y-4', props.class)">
    <slot />
  </form>
</template>
