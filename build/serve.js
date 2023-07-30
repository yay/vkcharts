import esbuild from 'esbuild';
import { readFile, writeFile, existsSync } from 'fs';
import { defaultOptions } from './defaults.js';

const args = process.argv.slice(2);
const entryPath = args[0];

const html = `
<script src="index.js"></script>
<link rel="stylesheet" type="text/css" href="index.css">
`;

readFile(`${entryPath}/index.html`, (err, data) => {
  const template = err ? html : String(data);
  writeFile('dist/index.html', template, (err) => {
    if (err) throw err;
  });
});

const tsEntry = `${entryPath}/index.ts`;
const jsEntry = `${entryPath}/index.js`;
const entryPoint = existsSync(jsEntry) ? jsEntry : tsEntry;

const inOutOptions = entryPath
  ? {
      entryPoints: [entryPoint],
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
    js: `new EventSource('/esbuild').addEventListener('change', () => location.reload());`,
  },
});

await ctx.watch(); // build and watch for changes

const { host, port } = await ctx.serve({
  port: 8000,
  servedir: 'dist',
});

console.log(`Serving app at http://${host}:${port}.`);
