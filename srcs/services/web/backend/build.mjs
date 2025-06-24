// build.mjs
import esbuild from 'esbuild';

await esbuild.build({
  entryPoints: ['./src/public/main-new.ts'],
  outfile: 'dist/public/bundle.js',
  bundle: true,
	minify: true,
  format: 'esm',
  sourcemap: true,
  target: ['es2020'],
});

// esbuild src/public/main-new.ts --bundle --outfile=dist/public/bundle.js --watch
