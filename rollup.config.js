import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript'
import { terser } from 'rollup-plugin-terser'
import pkg from './package.json'

export default [
  {
    input: 'src/index.ts',
    output: {
      file: pkg.module,
      format: 'esm',
      sourcemap: true,
      export: 'named',
    },
    plugins: [
      typescript({ tsconfig: './tsconfig.json' }),
      resolve(),
      commonjs()
    ],
    external: ['vue']
  },

  {
    input: 'src/index.ts',
    output: {
      file: pkg.main,
      format: 'cjs',
      sourcemap: true,
      export: 'named',
    },
    plugins: [
      typescript({ tsconfig: './tsconfig.json' }),
      resolve(),
      commonjs()
    ],
    external: ['vue']
  },

  {
    input: 'src/index.ts',
    output: {
      name: 'VueRBAC',
      file: pkg.browser,
      format: 'umd',
      export: 'named',
      globals: {
        vue: 'Vue'
      },
      sourcemap: true
    },
    plugins: [
      typescript({ tsconfig: './tsconfig.json' }),
      resolve(),
      commonjs(),
      terser()
    ],
    external: ['vue']
  }
]