import esbuildPluginTsc from 'esbuild-plugin-tsc';

export const defaultOptions = {
  entryPoints: ['lib/main.ts'],
  outfile: './dist/vk-charts.js',
  bundle: true,
};
