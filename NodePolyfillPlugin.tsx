import { Plugin } from 'vite';
import NodePolyfillPlugin from 'node-polyfill-webpack-plugin';

const nodePolyfills = (): Plugin => {
  return {
    name: 'vite:node-polyfills',
    config: () => ({
      optimizeDeps: {
        include: [
          'events' // Include other polyfills as needed
        ]
      },
      build: {
        rollupOptions: {
          plugins: [new NodePolyfillPlugin()]
        }
      }
    })
  };
};

export default nodePolyfills;
