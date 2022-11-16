import { defineConfig } from 'vite';

// https://vitejs.dev/guide/build.html#library-mode

// *.d.ts https://github.com/vitejs/vite/issues/2049

export default defineConfig({
  build: {
    lib: {
      entry: './lib/main.ts',
      name: 'vkCharts', // UMD
      fileName: 'vk-charts'
    }
  }
});