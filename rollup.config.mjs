import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';

const isDev = process.env.ROLLUP_WATCH === 'true';

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/bundle.js',
    format: 'iife',
    name: 'FunctionalityGenerator',
    sourcemap: true,
  },
  plugins: [
    resolve(),
    isDev && serve({
      open: true,
      contentBase: ['.', 'html_tests', 'dist'],
      openPage: 'html_tests/product-variant-selector.html',
      port: 3000,
    }),
    isDev && livereload({
      watch: ['dist', 'html_tests'],
    }),
    !isDev && terser(),
  ],
}