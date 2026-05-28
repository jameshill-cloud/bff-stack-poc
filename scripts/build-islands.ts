import * as esbuild from 'esbuild';
import { glob } from 'glob';

const watch = process.argv.includes('--watch');
const production = process.env.NODE_ENV === 'production';

const entryPoints = glob.sync([
  'client/entry.ts',
  'client/islands/**/mount.tsx',
]);

const buildOptions: esbuild.BuildOptions = {
  entryPoints,
  bundle: true,
  outdir: 'public/js',
  entryNames: '[dir]/[name]',
  outbase: 'client',
  format: 'esm',
  target: 'es2020',
  minify: production,
  sourcemap: !production,
};

(async () => {
  if (watch) {
    const ctx = await esbuild.context(buildOptions);
    await ctx.watch();
    console.log('Watching bundles...');
  } else {
    await esbuild.build(buildOptions);
    console.log('Bundles built.');
  }
})();
