import esbuildPluginTsc from 'esbuild-plugin-tsc';

export const defaultOptions = {
  entryPoints: ['lib/main.ts'],
  outfile: './dist/vk-charts.js',
  bundle: true,
  plugins: [
    // esbuild natively supports TypeScript files, but esbuild doesn't support Stage 3 decorators yet.
    // This plugin with the `force` option makes esbuild use TypeScript compiler for all files.
    esbuildPluginTsc({
      force: true,
    }),
  ],
};
