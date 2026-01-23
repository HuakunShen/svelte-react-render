import { useEffect, useState, useRef, type ReactElement } from 'react';
import { render, createRenderer, type ExtendedRenderBridge } from '@svelte-react-render/api';
import type { SvelteComponentInstance } from '@svelte-react-render/api';
import { ComponentRenderer } from './ComponentRenderer';

interface PluginHostProps {
  plugin: ReactElement;
}

export function PluginHost({ plugin }: PluginHostProps) {
  const [rootInstance, setRootInstance] = useState<SvelteComponentInstance | null>(null);
  const bridgeRef = useRef<ExtendedRenderBridge | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const newBridge = createRenderer();
    bridgeRef.current = newBridge;

    unsubscribeRef.current = newBridge.subscribe(() => {
      console.log('PluginHost: Bridge update triggered');
      setRootInstance(newBridge.rootInstance);
    });

    console.log('PluginHost: Rendering plugin');
    render(plugin, newBridge);

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  useEffect(() => {
    if (bridgeRef.current) {
      console.log('PluginHost: Plugin changed, re-rendering');
      render(plugin, bridgeRef.current);
    }
  }, [plugin]);

  return (
    <div className="h-full w-full">
      {rootInstance ? (
        <ComponentRenderer instance={rootInstance} />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-sm text-gray-500">
          Loading plugin…
        </div>
      )}
    </div>
  );
}
