import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';

// https://vitejs.dev/guide/build.html#library-mode

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: './lib/main.ts',
      name: 'vkCharts', // UMD
      fileName: 'vk-charts',
    },
  },
  plugins: [
    react({
      tsDecorators: true,
    }),
  ],
});
