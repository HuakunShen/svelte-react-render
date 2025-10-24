import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { watch } from 'fs';

// Check if --dev flag is present
const isDev = process.argv.includes('--dev');

// Extract build logic into a reusable function
async function buildPlugin() {
  console.log('📦 Building plugin...');
  
  // Set NODE_ENV based on dev mode
  const nodeEnv = isDev ? '"development"' : '"production"';
  
  // Build the plugin using Bun.build() API for full control
  const result = await Bun.build({
    entrypoints: ['./src/index.tsx'],
    outdir: './dist',
    target: 'browser',
    format: 'esm',
    splitting: false,
    minify: !isDev, // Don't minify in dev mode
    sourcemap: isDev ? 'external' : 'none', // Enable sourcemaps in dev mode
    define: {
      'process.env.NODE_ENV': nodeEnv,
    },
    external: [
      '@svelte-react-render/api'
    ],
    // Only keep API as external - React will be bundled
  });

  if (!result.success) {
    console.error('❌ Build failed:');
    for (const log of result.logs) {
      console.error(log);
    }
    if (!isDev) {
      process.exit(1);
    }
    return false;
  }

  console.log('✅ Plugin built successfully');
  console.log('🎉 Build complete! Plugin is ready to be served from the dist folder.');
  return true;
}

// Initial build
await buildPlugin();

// If in dev mode, set up file watching and HTTP server
if (isDev) {
  console.log('👀 Watching for changes in src directory...');
  
  const srcDir = join(import.meta.dir, 'src');
  const distDir = join(import.meta.dir, 'dist');
  
  // Start HTTP server using bunx serve to serve the dist folder
  const serveProcess = Bun.spawn(['bun', 'serve', distDir], {
    cwd: import.meta.dir,
    onExit(proc, exitCode, signalCode, error) {
      if (exitCode !== 0) {
        console.error(`❌ Server exited with code ${exitCode}`);
      }
    },
  });
  
  console.log(`🌐 HTTP server started at http://localhost:3001 serving ${distDir}`);
  
  // Watch for changes in the src directory
  const watcher = watch(srcDir, { recursive: true }, (eventType, filename) => {
    if (filename) {
      console.log(`📝 File changed: ${filename}`);
      buildPlugin().then(success => {
        if (success) {
          console.log('🔄 Rebuild complete');
        }
      });
    }
  });
  
  // Handle process termination
  process.on('SIGINT', () => {
    console.log('\n🛑 Stopping file watcher and HTTP server...');
    watcher.close();
    serveProcess.kill();
    process.exit(0);
  });
  
  console.log('🚀 Dev mode active. Press Ctrl+C to stop watching and server.');
}

