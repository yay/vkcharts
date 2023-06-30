import * as esbuild from 'esbuild';
import { defaultOptions } from './defaults.js';

await esbuild.build({
  ...defaultOptions,
  minify: true,
});
