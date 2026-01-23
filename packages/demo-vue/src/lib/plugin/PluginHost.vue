<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import React from 'react';
import { render, createRenderer, type ExtendedRenderBridge, type SvelteComponentInstance } from '@svelte-react-render/api';
import ComponentRenderer from './ComponentRenderer.vue';

interface Props {
  plugin: any; // React Component
}

const props = defineProps<Props>();

const rootInstance = ref<SvelteComponentInstance | null>(null);
const bridgeRef = ref<ExtendedRenderBridge | null>(null);
const unsubscribeRef = ref<(() => void) | null>(null);

onMounted(() => {
  const newBridge = createRenderer();
  bridgeRef.value = newBridge;

  unsubscribeRef.value = newBridge.subscribe(() => {
    console.log('PluginHost: Bridge update triggered');
    rootInstance.value = newBridge.rootInstance;
  });

  console.log('PluginHost: Rendering plugin');
  render(React.createElement(props.plugin) as any, newBridge);
});

onUnmounted(() => {
  if (unsubscribeRef.value) {
    unsubscribeRef.value();
  }
});

watch(() => props.plugin, (newPlugin) => {
  if (bridgeRef.value && newPlugin) {
    console.log('PluginHost: Plugin changed, re-rendering');
    render(React.createElement(newPlugin) as any, bridgeRef.value);
  }
});
</script>

<template>
  <div class="h-full w-full">
    <ComponentRenderer v-if="rootInstance" :instance="rootInstance" />
    <div v-else class="flex h-full w-full items-center justify-center text-sm text-gray-500">
      Loading plugin…
    </div>
  </div>
</template>
