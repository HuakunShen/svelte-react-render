import { useState, createElement } from 'react';
import { WorkerPluginHost } from '@/lib/plugin/WorkerPluginHost';
import { WebSocketPluginHost } from '@/lib/plugin/WebSocketPluginHost';
import { PluginHost } from '@/lib/plugin/PluginHost';
import { SimpleDemo, AdvancedDemo } from '@svelte-react-render/plugin-example';

type DemoType = 'simple' | 'advanced';
type RuntimeMode = 'worker' | 'main-thread' | 'node-server';

function App() {
  const [currentDemo, setCurrentDemo] = useState<DemoType>('simple');
  const [runtimeMode, setRuntimeMode] = useState<RuntimeMode>('worker');

  const pluginUrl = currentDemo === 'simple'
    ? 'http://localhost:3000/simple-demo.js'
    : 'http://localhost:3000/advanced-demo.js';

  const serverUrl = currentDemo === 'simple'
    ? 'ws://localhost:3001'
    : 'ws://localhost:3002';

  const pluginElement = createElement(currentDemo === 'simple' ? SimpleDemo : AdvancedDemo);

  const getModeButtonClass = (mode: RuntimeMode) => {
    const baseClass = "inline-flex h-7 items-center justify-center gap-1 rounded-md px-2 text-xs font-medium whitespace-nowrap transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50";
    return runtimeMode === mode
      ? `${baseClass} bg-background text-foreground`
      : `${baseClass} text-muted-foreground`;
  };

  const getDemoButtonClass = (demo: DemoType) => {
    const baseClass = "inline-flex h-8 flex-1 items-center justify-center gap-2 rounded-md px-3 text-sm font-medium whitespace-nowrap transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50";
    return currentDemo === demo
      ? `${baseClass} bg-background text-foreground`
      : `${baseClass} text-muted-foreground`;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">React Demo - Svelte-React Render</h1>
            <p className="text-lg text-muted-foreground">
              React plugins rendered with React UI components (shadcn/ui)
            </p>
          </div>

          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="p-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-medium text-muted-foreground">Runtime Mode:</div>
                  <div className="flex gap-1 rounded-lg bg-muted p-1">
                    <button
                      className={getModeButtonClass('worker')}
                      onClick={() => setRuntimeMode('worker')}
                    >
                      ⚡ Web Worker
                    </button>
                    <button
                      className={getModeButtonClass('node-server')}
                      onClick={() => setRuntimeMode('node-server')}
                    >
                      🖥️ Node.js
                    </button>
                    <button
                      className={getModeButtonClass('main-thread')}
                      onClick={() => setRuntimeMode('main-thread')}
                    >
                      🧵 Main Thread
                    </button>
                  </div>
                </div>

                <div className="flex gap-1 rounded-lg bg-muted p-1">
                  <button
                    className={getDemoButtonClass('simple')}
                    onClick={() => setCurrentDemo('simple')}
                  >
                    Simple Demo
                  </button>
                  <button
                    className={getDemoButtonClass('advanced')}
                    onClick={() => setCurrentDemo('advanced')}
                  >
                    Advanced Demo
                  </button>
                </div>

                <div className="flex items-center gap-2 border-b pb-4">
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500" />
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                  <span className="ml-4 font-mono text-sm text-muted-foreground">
                    {runtimeMode === 'worker'
                      ? pluginUrl
                      : runtimeMode === 'node-server'
                        ? serverUrl
                        : `${currentDemo}-demo.tsx (local)`
                    }
                  </span>
                </div>

                {runtimeMode === 'worker' && (
                  <WorkerPluginHost key={pluginUrl} pluginUrl={pluginUrl} />
                )}
                {runtimeMode === 'node-server' && (
                  <WebSocketPluginHost key={serverUrl} serverUrl={serverUrl} />
                )}
                {runtimeMode === 'main-thread' && (
                  <PluginHost plugin={pluginElement} />
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-1 text-center text-sm text-muted-foreground">
            <p>Built with React 19, shadcn/ui, and @svelte-react-render/api</p>
            <p className="text-xs">
              {currentDemo === 'simple'
                ? 'Showing: Basic Button and Input components'
                : 'Showing: Form, Switch, and Toggle components'
              }
            </p>
            {runtimeMode === 'worker' && (
              <p className="text-xs text-blue-500 dark:text-blue-400">
                ⚡ React plugin running in Web Worker (loaded from external server)
              </p>
            )}
            {runtimeMode === 'node-server' && (
              <p className="text-xs text-purple-500 dark:text-purple-400">
                🖥️ React plugin running in Node.js (WebSocket communication)
              </p>
            )}
            {runtimeMode === 'main-thread' && (
              <p className="text-xs text-green-500 dark:text-green-400">
                🧵 React plugin running in Main Thread (direct)
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
