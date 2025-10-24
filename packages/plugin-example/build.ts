import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { watch } from 'fs';

// Check if --dev flag is present
const isDev = process.argv.includes('--dev');

// Plugin configurations
const plugins = [
  {
    name: 'simple-demo',
    entry: './src/simple-demo.worker.ts',
    output: 'simple-demo.js'
  },
  {
    name: 'advanced-demo',
    entry: './src/advanced-demo.worker.ts',
    output: 'advanced-demo.js'
  }
];

// Extract build logic into a reusable function
async function buildPlugin(pluginConfig: typeof plugins[0]) {
  console.log(`📦 Building ${pluginConfig.name}...`);
  
  // Set NODE_ENV based on dev mode
  const nodeEnv = isDev ? '"development"' : '"production"';
  
  // Build the plugin using Bun.build() API for full control
  const result = await Bun.build({
    entrypoints: [pluginConfig.entry],
    outdir: './dist',
    target: 'browser',
    format: 'esm',
    splitting: false,
    minify: false, // Never minify for easier debugging
    sourcemap: isDev ? 'external' : 'none', // Enable sourcemaps in dev mode
    define: {
      'process.env.NODE_ENV': nodeEnv,
    },
    external: [],
    // Bundle everything: kkrpc, React, and @svelte-react-render/api
    naming: {
      entry: pluginConfig.output
    }
  });

  if (!result.success) {
    console.error(`❌ Build failed for ${pluginConfig.name}:`);
    for (const log of result.logs) {
      console.error(log);
    }
    if (!isDev) {
      process.exit(1);
    }
    return false;
  }

  console.log(`✅ ${pluginConfig.name} built successfully → dist/${pluginConfig.output}`);
  return true;
}

// Build all plugins
async function buildAll() {
  console.log('🚀 Building all plugins...\n');
  let allSuccessful = true;
  
  for (const plugin of plugins) {
    const success = await buildPlugin(plugin);
    if (!success) {
      allSuccessful = false;
    }
  }
  
  if (allSuccessful) {
    console.log('\n🎉 All plugins built successfully!');
  }
  
  return allSuccessful;
}

// Initial build
await buildAll();

// If in dev mode, set up file watching and HTTP server
if (isDev) {
  console.log('\n👀 Watching for changes in src directory...');
  
  const srcDir = join(import.meta.dir, 'src');
  const distDir = join(import.meta.dir, 'dist');
  
  // Start single HTTP server for all plugins
  const serveProcess = Bun.spawn(
    ['bun', 'serve', '-l', '3000', '--cors', distDir], 
    {
      cwd: import.meta.dir,
      onExit(proc, exitCode, signalCode, error) {
        if (exitCode !== 0) {
          console.error(`❌ Server exited with code ${exitCode}`);
        }
      },
    }
  );
  
  console.log(`🌐 Plugin server: http://localhost:3000/`);
  plugins.forEach(plugin => {
    console.log(`   - ${plugin.name}: http://localhost:3000/${plugin.output}`);
  });
  
  // Watch for changes in the src directory
  const watcher = watch(srcDir, { recursive: true }, (eventType, filename) => {
    if (filename) {
      console.log(`\n📝 File changed: ${filename}`);
      buildAll().then(success => {
        if (success) {
          console.log('🔄 Rebuild complete\n');
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
  
  console.log('\n🚀 Dev mode active. Press Ctrl+C to stop watching and server.\n');
}
