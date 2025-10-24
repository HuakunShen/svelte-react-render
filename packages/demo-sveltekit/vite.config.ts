import { defineConfig } from 'vitest/config';
import devtoolsJson from 'vite-plugin-devtools-json';
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import path from 'path';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit(), devtoolsJson()],
	// resolve: {
	// 	alias: {
	// 		$lib: path.resolve('./src/lib'),
	// 	},
	// },
	server: {
		fs: {
			allow: ['/']
		}
	},
	// optimizeDeps: {
	// 	exclude: ['@svelte-react-render/api']
	// },
	test: {
		expect: { requireAssertions: true },
		projects: [
			{
				extends: './vite.config.ts',
				test: {
					name: 'client',
					environment: 'browser',
					browser: {
						enabled: true,
						provider: 'playwright',
						instances: [{ browser: 'chromium' }]
					},
					include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
					exclude: ['src/lib/server/**'],
					setupFiles: ['./vitest-setup-client.ts']
				}
			},
			{
				extends: './vite.config.ts',
				test: {
					name: 'server',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}'],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
				}
			}
		]
	},
	// worker: {
	// 	format: 'es',
	// 	rollupOptions: {
	// 		output: {
	// 			entryFileNames: 'assets/workers/[name].js'
	// 		}
	// 	}
	// }
});
