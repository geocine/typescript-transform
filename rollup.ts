
import * as path from 'path';
import tsTransformer from './transform';
//import { terser } from 'rollup-plugin-terser';

const typescript = require('rollup-plugin-typescript2');
const resolve = require('rollup-plugin-node-resolve');
const rollup = require('rollup');

const bundleOptions = {
  treeshake: true,
  input: './src/index.ts',
  plugins: [
    typescript({
      transformers: [service => ({
        before: [ tsTransformer(service.getProgram()) ],
        after: []
      })],
      useTsconfigDeclarationDir: true,
      check: false,
      cacheRoot: path.join(path.resolve(), 'node_modules/.tmp/.rts2_cache')
    }),
    resolve(),
    // terser({
    //   mangle: { keep_fnames: true }
    // })
  ],
  onwarn (warning) {
    if (warning.code === 'THIS_IS_UNDEFINED') { return; }
    console.log("Rollup warning: ", warning.message);
  },
};

const writeOptions = {
  sourcemap: true,
  exports: 'named',
  name: 'typescript-transform',
  file: 'dist/bundle.umd.js',
  format: 'umd'
};

rollup.rollup(bundleOptions).then((bundle: any) => bundle.write(writeOptions))