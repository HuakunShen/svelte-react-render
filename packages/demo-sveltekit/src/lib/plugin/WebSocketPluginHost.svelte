<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { RPCChannel, WebSocketClientIO } from 'kkrpc';
	import ComponentRenderer from './ComponentRenderer.svelte';
	import type { WorkerAPI, MainThreadAPI, SerializedComponentTree } from './worker-rpc-types';

	interface Props {
		serverUrl: string;
		props?: any;
	}

	let { serverUrl, props: pluginProps = {} }: Props = $props();

	let rootInstance = $state<SerializedComponentTree | null>(null);
	let rpc: RPCChannel<MainThreadAPI, WorkerAPI> | null = null;
	let ws: WebSocket | null = null;
	let isLoading = $state(true);
	let error = $state<string | null>(null);
	let reconnectAttempts = $state(0);
	let maxReconnectAttempts = 5;
	let reconnectDelay = 1000;

	// Store RPC in a way that ComponentRenderer can access it
	let rpcContext = $state<{ rpc: RPCChannel<MainThreadAPI, WorkerAPI> | null }>({ rpc: null });

	let lastServerUrl = $state<string | null>(null);

	async function connectToServer(url: string) {
		try {
			console.log('[Client] Connecting to plugin server:', url);
			isLoading = true;
			error = null;

			// Close existing connection if any
			if (ws) {
				console.log('[Client] Closing existing WebSocket connection');
				ws.close();
				ws = null;
				rpc = null;
			}

			// Create WebSocket connection
			ws = new WebSocket(url);
			console.log('[Client] WebSocket connection initiated');

			// Wait for connection to open
			await new Promise<void>((resolve, reject) => {
				const timeout = setTimeout(() => {
					reject(new Error('WebSocket connection timeout'));
				}, 10000);

				ws!.onopen = () => {
					clearTimeout(timeout);
					console.log('[Client] WebSocket connection established');
					resolve();
				};

				ws!.onerror = (err) => {
					clearTimeout(timeout);
					reject(new Error(`WebSocket connection failed: ${err}`));
				};
			});

			// Initialize RPC channel
			const io = new WebSocketClientIO(ws);

			rpc = new RPCChannel<MainThreadAPI, WorkerAPI>(io, {
				expose: {
					updateComponentTree(tree: SerializedComponentTree | null) {
						console.log('[Client] Received component tree update');
						rootInstance = tree;
						isLoading = false;
						reconnectAttempts = 0; // Reset reconnect attempts on successful connection
					},
					logMessage(level: 'log' | 'warn' | 'error' | 'info', ...args: any[]) {
						console[level]('[Plugin]', ...args);
					}
				}
			});

			rpcContext.rpc = rpc;
			lastServerUrl = url;

			console.log('[Client] RPC channel initialized');

			// Call the server's initialize method to start the plugin
			try {
				const api = rpc.getAPI();
				await api.initialize(pluginProps);
				console.log('[Client] Plugin initialized successfully');
			} catch (initError) {
				console.error('[Client] Failed to initialize plugin:', initError);
				error = initError instanceof Error ? initError.message : String(initError);
				isLoading = false;
			}
		} catch (err) {
			console.error('[Client] Error connecting to plugin server:', err);
			error = err instanceof Error ? err.message : String(err);
			isLoading = false;

			// Attempt reconnection if not at max attempts
			if (reconnectAttempts < maxReconnectAttempts) {
				reconnectAttempts++;
				console.log(`[Client] Reconnection attempt ${reconnectAttempts}/${maxReconnectAttempts} in ${reconnectDelay}ms`);

				setTimeout(() => {
					connectToServer(url);
				}, reconnectDelay);

				// Exponential backoff
				reconnectDelay = Math.min(reconnectDelay * 2, 30000);
			} else {
				console.error('[Client] Max reconnection attempts reached');
			}
		}
	}

	onMount(() => {
		connectToServer(serverUrl);
	});

	// Watch for server URL changes and reconnect
	$effect(() => {
		// Only trigger if URL actually changed
		if (serverUrl !== lastServerUrl && lastServerUrl !== null) {
			console.log('[Client] Server URL changed, reconnecting:', serverUrl);
			rootInstance = null;
			reconnectAttempts = 0; // Reset for new URL
			reconnectDelay = 1000; // Reset delay
			connectToServer(serverUrl);
		}
	});

	// Watch for prop changes and update
	$effect(() => {
		if (rpc && pluginProps && !isLoading) {
			console.log('[Client] Props changed, updating server');
			const api = rpc.getAPI();
			api.updateProps(pluginProps);
		}
	});

	onDestroy(() => {
		console.log('[Client] Destroying WebSocket plugin host');

		if (rpc) {
			try {
				const api = rpc.getAPI();
				api.destroy();
			} catch (err) {
				console.warn('[Client] Error destroying RPC:', err);
			}
		}

		if (ws) {
			ws.close();
		}
	});

	// Handle WebSocket events
	$effect(() => {
		if (ws) {
			ws.onclose = (event) => {
				console.log('[Client] WebSocket connection closed:', event.code, event.reason);
				if (event.code !== 1000) { // Not a normal closure
					error = `Connection closed: ${event.reason || 'Unknown error'}`;
					isLoading = true;

					// Attempt reconnection for non-normal closures
					if (reconnectAttempts < maxReconnectAttempts) {
						reconnectAttempts++;
						console.log(`[Client] Reconnection attempt ${reconnectAttempts}/${maxReconnectAttempts} in ${reconnectDelay}ms`);

						setTimeout(() => {
							connectToServer(serverUrl);
						}, reconnectDelay);

						reconnectDelay = Math.min(reconnectDelay * 2, 30000);
					}
				}
			};

			ws.onerror = (event) => {
				console.error('[Client] WebSocket error:', event);
			};
		}
	});
</script>

<div class="h-full w-full">
	{#if error}
		<div class="flex h-full w-full items-center justify-center">
			<div class="text-sm text-red-500">
				<div class="mb-2 font-semibold">Connection Error</div>
				<div class="text-xs text-red-400">{error}</div>
				{#if reconnectAttempts > 0 && reconnectAttempts < maxReconnectAttempts}
					<div class="text-xs text-yellow-500 mt-2">
						Reconnecting... ({reconnectAttempts}/{maxReconnectAttempts})
					</div>
				{/if}
				{#if reconnectAttempts >= maxReconnectAttempts}
					<button
						class="mt-2 px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
						onclick={() => {
							reconnectAttempts = 0;
							reconnectDelay = 1000;
							connectToServer(serverUrl);
						}}
					>
						Retry Connection
					</button>
				{/if}
			</div>
		</div>
	{:else if isLoading}
		<div class="flex h-full w-full items-center justify-center text-sm text-gray-500">
			{#if reconnectAttempts > 0}
				Connecting to server... ({reconnectAttempts}/{maxReconnectAttempts})
			{:else}
				Connecting to plugin server…
			{/if}
		</div>
	{:else if rootInstance}
		<ComponentRenderer instance={rootInstance} {rpcContext} />
	{:else}
		<div class="flex h-full w-full items-center justify-center text-sm text-gray-500">
			Waiting for plugin content...
		</div>
	{/if}
</div>