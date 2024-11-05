import react from '@vitejs/plugin-react';
import { UserConfig, ConfigEnv } from 'vite';
import { rmSync } from 'node:fs';
import { join } from 'path';
import electron from 'vite-plugin-electron';
import renderer from 'vite-plugin-electron-renderer';
import pkg from './package.json';

const root = join(__dirname);
const srcRoot = join(__dirname, 'src');

// Clean dist folder
rmSync('dist-electron', { recursive: true, force: true });

// Build configuration for electron
const buildElectron = (isDev: boolean) => ({
  sourcemap: isDev,
  minify: !isDev,
  outDir: join(root, 'dist-electron'),
  rollupOptions: {
    external: Object.keys(pkg.dependencies || {})
  }
});

// Plugin configuration
function getPlugins(isDev: boolean) {
  return [
    react(),
    electron([
      {
        // Main-Process entry file of the Electron App.
        entry: join(root, 'electron/index.ts'),
        onstart(options) {
          options.startup();
        },
        vite: {
          build: buildElectron(isDev)
        }
      },
      {
        entry: join(root, 'electron/preload.ts'),
        onstart(options) {
          options.reload();
        },
        vite: {
          build: buildElectron(isDev)
        }
      }
    ]),
    renderer({
      nodeIntegration: true
    })
  ];
}

// Shared config between dev and prod
const sharedConfig = {
  resolve: {
    alias: {
      '/@': srcRoot,
      // Add node built-in polyfills
      path: 'path-browserify',
      stream: 'stream-browserify',
      crypto: 'crypto-browserify',
      buffer: 'buffer'
    }
  },
  optimizeDeps: {
    exclude: ['path'],
    include: ['buffer', 'process']
  },
  define: {
    'process.env': process.env,
    global: 'globalThis'
  }
};

export default ({ command }: ConfigEnv): UserConfig => {
  const isDev = command === 'serve';

  const config: UserConfig = {
    root: srcRoot,
    base: isDev ? '/' : './',
    plugins: getPlugins(isDev),
    ...sharedConfig,
    build: {
      outDir: join(root, '/dist-vite'),
      emptyOutDir: true,
      commonjsOptions: {
        transformMixedEsModules: true
      },
      // Add these to handle node builtins
      rollupOptions: {
        output: {
          format: 'commonjs'
        }
      }
    },
    server: {
      port: process.env.PORT === undefined ? 3000 : +process.env.PORT
    }
  };

  return config;
};
