import { useEffect, useState, useRef, useCallback } from 'react';
import { RPCChannel, WorkerParentIO } from 'kkrpc';
import { ComponentRenderer } from './ComponentRenderer';
import type { WorkerAPI, MainThreadAPI, SerializedComponentTree } from './worker-rpc-types';

interface WorkerPluginHostProps {
  pluginUrl: string;
  props?: unknown;
}

export function WorkerPluginHost({ pluginUrl, props: pluginProps = {} }: WorkerPluginHostProps) {
  const [rootInstance, setRootInstance] = useState<SerializedComponentTree | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rpcContext, setRpcContext] = useState<{ rpc: RPCChannel<MainThreadAPI, WorkerAPI> | null }>({ rpc: null });
  
  const rpcRef = useRef<RPCChannel<MainThreadAPI, WorkerAPI> | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const lastPluginUrlRef = useRef<string | null>(null);

  const loadPlugin = useCallback(async (url: string) => {
    try {
      console.log('[Main] Fetching plugin from:', url);
      setIsLoading(true);
      setError(null);

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch plugin: ${response.status} ${response.statusText}`);
      }

      const scriptText = await response.text();
      console.log('[Main] Plugin script fetched, creating blob worker');

      const blob = new Blob([scriptText], { type: 'application/javascript' });
      const blobURL = URL.createObjectURL(blob);

      if (workerRef.current) {
        console.log('[Main] Terminating old worker');
        workerRef.current.terminate();
        workerRef.current = null;
        rpcRef.current = null;
      }

      workerRef.current = new Worker(blobURL);
      console.log('[Main] Worker created');

      URL.revokeObjectURL(blobURL);

      const io = new WorkerParentIO(workerRef.current);

      rpcRef.current = new RPCChannel<MainThreadAPI, WorkerAPI>(io, {
        expose: {
          updateComponentTree(tree: SerializedComponentTree | null) {
            console.log('[Main] Received component tree update');
            setRootInstance(tree);
            setIsLoading(false);
          },
          logMessage(level: 'log' | 'warn' | 'error' | 'info', ...args: unknown[]) {
            console[level]('[Plugin]', ...args);
          }
        }
      });

      setRpcContext({ rpc: rpcRef.current });
      lastPluginUrlRef.current = url;

      console.log('[Main] Plugin worker initialized');
    } catch (err) {
      console.error('[Main] Error loading plugin:', err);
      setError(err instanceof Error ? err.message : String(err));
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPlugin(pluginUrl);
    
    return () => {
      console.log('[Main] Destroying worker plugin host');
      
      if (rpcRef.current) {
        try {
          const api = rpcRef.current.getAPI();
          api.destroy();
        } catch (err) {
          console.warn('[Main] Error destroying RPC:', err);
        }
      }
      
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, [loadPlugin, pluginUrl]);

  useEffect(() => {
    if (pluginUrl !== lastPluginUrlRef.current && lastPluginUrlRef.current !== null) {
      console.log('[Main] Plugin URL changed, reloading:', pluginUrl);
      setRootInstance(null);
      loadPlugin(pluginUrl);
    }
  }, [pluginUrl, loadPlugin]);

  useEffect(() => {
    if (rpcRef.current && pluginProps && !isLoading) {
      console.log('[Main] Props changed, updating worker');
      const api = rpcRef.current.getAPI();
      api.updateProps(pluginProps);
    }
  }, [pluginProps, isLoading]);

  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="text-sm text-red-500">
          <div className="mb-2 font-semibold">Plugin Error</div>
          <div className="text-xs text-red-400">{error}</div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center text-sm text-gray-500">
        Loading plugin…
      </div>
    );
  }

  if (rootInstance) {
    return (
      <div className="h-full w-full">
        <ComponentRenderer instance={rootInstance} rpcContext={rpcContext} />
      </div>
    );
  }

  return (
    <div className="flex h-full w-full items-center justify-center text-sm text-gray-500">
      No content
    </div>
  );
}
