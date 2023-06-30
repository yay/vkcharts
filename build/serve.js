import esbuild from 'esbuild';
import { writeFile } from 'fs';
import { defaultOptions } from './defaults.js';

await writeFile('dist/index.html', '<script src="index.js"></script>', (err) => {
  if (err) {
    console.error(err);
  }
});

const args = process.argv.slice(2);
const entryPath = args[0];
const inOutOptions = entryPath
  ? {
      entryPoints: [`${entryPath}/index.ts`],
      outfile: `dist/index.js`,
    }
  : {};

const ctx = await esbuild.context({
  ...defaultOptions,
  ...inOutOptions,
  sourcemap: true,
  banner: {
    // Inject the following JS at the beginning of the bundle
    // to connect to the esbuild server via server-sent events.
    js: `new EventSource('/esbuild').addEventListener('change', () => location.reload())`,
  },
});

await ctx.watch(); // build and watch for changes

console.log(process.env);

const { host, port } = await ctx.serve({
  port: 8000,
  servedir: 'dist',
});

console.log(`Serving app at http://${host}:${port}.`);

console.log('process.argv', process.argv.slice(2));
