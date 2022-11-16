import { resolve } from 'path';
import { defineConfig } from 'vite';

// https://vitejs.dev/guide/build.html#library-mode

// *.d.ts https://github.com/vitejs/vite/issues/2049

export default defineConfig({
  build: {
    lib: {
      // Could also be a dictionary or array of multiple entry points.
      entry: resolve(__dirname, 'lib/main.ts'),
      name: 'vkCharts', // UMD
      fileName: 'vk-charts'
    }
  }
});