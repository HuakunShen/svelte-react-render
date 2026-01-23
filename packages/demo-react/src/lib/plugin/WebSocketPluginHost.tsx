import { useEffect, useState, useRef } from 'react';
import { RPCChannel, WebSocketClientIO } from 'kkrpc';
import { ComponentRenderer } from './ComponentRenderer';
import type { WorkerAPI, MainThreadAPI, SerializedComponentTree } from './worker-rpc-types';

interface WebSocketPluginHostProps {
  serverUrl: string;
  props?: unknown;
}

export function WebSocketPluginHost({ serverUrl, props: pluginProps = {} }: WebSocketPluginHostProps) {
  const [rootInstance, setRootInstance] = useState<SerializedComponentTree | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [rpcContext, setRpcContext] = useState<{ rpc: RPCChannel<MainThreadAPI, WorkerAPI> | null }>({ rpc: null });
  
  const maxReconnectAttempts = 5;
  const reconnectDelayRef = useRef(1000);
  const isInitializedRef = useRef(false);
  const previousPropsRef = useRef(pluginProps);
  
  const rpcRef = useRef<RPCChannel<MainThreadAPI, WorkerAPI> | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const isConnectingRef = useRef(false);

  useEffect(() => {
    let isMounted = true;
    
    const connectToServer = async (url: string) => {
      if (isConnectingRef.current) return;
      isConnectingRef.current = true;

      try {
        console.log('[Client] Connecting to plugin server:', url);
        setIsLoading(true);
        setError(null);
        isInitializedRef.current = false;

        if (wsRef.current) {
          wsRef.current.close();
          wsRef.current = null;
          rpcRef.current = null;
        }

        const ws = new WebSocket(url);
        wsRef.current = ws;

        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error('WebSocket connection timeout')), 10000);

          ws.onopen = () => {
            clearTimeout(timeout);
            console.log('[Client] WebSocket connection established');
            resolve();
          };

          ws.onerror = () => {
            clearTimeout(timeout);
            reject(new Error('WebSocket connection failed'));
          };
        });

        if (!isMounted || wsRef.current !== ws) {
          ws.close();
          return;
        }

        const io = new WebSocketClientIO(ws);
        const rpc = new RPCChannel<MainThreadAPI, WorkerAPI>(io, {
          expose: {
            updateComponentTree(tree: SerializedComponentTree | null) {
              if (!isMounted) return;
              console.log('[Client] Received component tree update');
              setRootInstance(tree);
              setIsLoading(false);
              setReconnectAttempts(0);
              reconnectDelayRef.current = 1000;
            },
            logMessage(level: 'log' | 'warn' | 'error' | 'info', ...args: unknown[]) {
              console[level]('[Plugin]', ...args);
            }
          }
        });

        rpcRef.current = rpc;
        setRpcContext({ rpc });

        ws.onclose = (event) => {
          if (!isMounted) return;
          console.log('[Client] WebSocket closed:', event.code, event.reason);
          if (event.code !== 1000) {
            setError(`Connection closed: ${event.reason || 'Unknown error'}`);
            setIsLoading(true);
            scheduleReconnection(url);
          }
        };

        ws.onerror = (event) => console.error('[Client] WebSocket error:', event);

        const api = rpc.getAPI();
        await api.initialize(pluginProps);
        isInitializedRef.current = true;
        console.log('[Client] Plugin initialized successfully');

      } catch (err) {
        if (!isMounted) return;
        console.error('[Client] Connection error:', err);
        setError(err instanceof Error ? err.message : String(err));
        setIsLoading(false);
        scheduleReconnection(url);
      } finally {
        isConnectingRef.current = false;
      }
    };

    const scheduleReconnection = (url: string) => {
      setReconnectAttempts(prev => {
        if (prev >= maxReconnectAttempts) {
          console.error('[Client] Max reconnection attempts reached');
          return prev;
        }
        const nextAttempt = prev + 1;
        console.log(`[Client] Reconnection attempt ${nextAttempt}/${maxReconnectAttempts}`);
        
        reconnectTimeoutRef.current = setTimeout(() => {
          connectToServer(url);
        }, reconnectDelayRef.current);
        
        reconnectDelayRef.current = Math.min(reconnectDelayRef.current * 2, 30000);
        return nextAttempt;
      });
    };

    setReconnectAttempts(0);
    reconnectDelayRef.current = 1000;
    connectToServer(serverUrl);

    return () => {
      isMounted = false;
      console.log('[Client] Cleanup WebSocket plugin host');
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.onerror = null;
        wsRef.current.close();
        wsRef.current = null;
      }
      
      rpcRef.current = null;
      isConnectingRef.current = false;
    };
  }, [serverUrl]);

  useEffect(() => {
    if (rpcRef.current && isInitializedRef.current && !isLoading) {
      const propsChanged = JSON.stringify(pluginProps) !== JSON.stringify(previousPropsRef.current);
      if (propsChanged) {
        console.log('[Client] Props changed, updating server');
        previousPropsRef.current = pluginProps;
        rpcRef.current.getAPI().updateProps(pluginProps);
      }
    }
  }, [pluginProps, isLoading]);

  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="text-sm text-red-500">
          <div className="mb-2 font-semibold">Connection Error</div>
          <div className="text-xs text-red-400">{error}</div>
          {reconnectAttempts > 0 && reconnectAttempts < maxReconnectAttempts && (
            <div className="text-xs text-yellow-500 mt-2">
              Reconnecting... ({reconnectAttempts}/{maxReconnectAttempts})
            </div>
          )}
          {reconnectAttempts >= maxReconnectAttempts && (
            <button
              className="mt-2 px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
              onClick={() => window.location.reload()}
            >
              Retry Connection
            </button>
          )}
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center text-sm text-gray-500">
        {reconnectAttempts > 0
          ? `Connecting to server... (${reconnectAttempts}/${maxReconnectAttempts})`
          : 'Connecting to plugin server…'
        }
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
      Waiting for plugin content...
    </div>
  );
}
