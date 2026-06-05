import * as esbuild from 'esbuild';
import { glob } from 'glob';

const watch = process.argv.includes('--watch');
const production = process.env.NODE_ENV === 'production';

// Build client entry point
const entryBuild: esbuild.BuildOptions = {
  entryPoints: ['src/client/entry.ts'],
  bundle: true,
  outfile: 'public/js/entry.js',
  format: 'esm',
  target: 'es2020',
  minify: production,
  sourcemap: !production,
};

// Build island components
const islandEntryPoints = glob.sync(['src/react/islands/**/mount.tsx']);

const islandsBuild: esbuild.BuildOptions = {
  entryPoints: islandEntryPoints,
  bundle: true,
  outdir: 'public/js',
  entryNames: '[dir]/[name]',
  outbase: 'src/react',
  format: 'esm',
  target: 'es2020',
  minify: production,
  sourcemap: !production,
};

(async () => {
  if (watch) {
    const ctxEntry = await esbuild.context(entryBuild);
    const ctxIslands = await esbuild.context(islandsBuild);
    await ctxEntry.watch();
    await ctxIslands.watch();
    console.log('Watching bundles...');
  } else {
    await esbuild.build(entryBuild);
    await esbuild.build(islandsBuild);
    console.log('Bundles built.');
  }
})();
