import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

console.log('📦 Building plugin...');

// Build the plugin using Bun.build() API for full control
const result = await Bun.build({
  entrypoints: ['./src/index.tsx'],
  outdir: './dist',
  target: 'browser',
  format: 'esm',
  splitting: false,
  minify: false,
  sourcemap: 'none',
  define: {
    'process.env.NODE_ENV': '"production"',
  },
  external: [
    'react',
    'react/jsx-runtime', 
    'react/jsx-dev-runtime',
    '@svelte-react-render/api'
  ],
  // Keep React and API as externals - the worker will provide them
});

if (!result.success) {
  console.error('❌ Build failed:');
  for (const log of result.logs) {
    console.error(log);
  }
  process.exit(1);
}

console.log('✅ Plugin built successfully');

// Copy to host app's lib folder (so Vite can process it)
const hostPluginsDir = join(import.meta.dir, '../demo-sveltekit/src/lib/plugins-dist');
const sourceFile = join(import.meta.dir, 'dist/index.js');
const destFile = join(hostPluginsDir, 'advanced-demo.js');

// Ensure the target directory exists
if (!existsSync(hostPluginsDir)) {
  mkdirSync(hostPluginsDir, { recursive: true });
  console.log('📁 Created plugins-dist directory');
}

// Copy the file
await Bun.write(destFile, Bun.file(sourceFile));

console.log('✅ Plugin copied to:', destFile);
console.log('🎉 Build complete! Plugin is ready to be loaded from: /src/lib/plugins-dist/advanced-demo.js');

