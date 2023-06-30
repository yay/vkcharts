import * as esbuild from 'esbuild';
import fs from 'node:fs';
import { defaultOptions } from './defaults.js';

const result = await esbuild.build({
  ...defaultOptions,
  minify: true,
  metafile: true,
});

const mode = process.env.npm_config_mode;

if (mode === 'write') {
  fs.writeFileSync('build-meta.json', JSON.stringify(result.metafile));
} else {
  console.log(
    await esbuild.analyzeMetafile(result.metafile, {
      verbose: false,
    })
  );
}
