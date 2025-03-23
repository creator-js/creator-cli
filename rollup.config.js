import { defineConfig } from 'rollup';
import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import dts from 'rollup-plugin-dts';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig([
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/index.js',
        format: 'es',
        exports: 'named'
      }
    ],
    external: [
      'inquirer',
      'rxjs',
      'path',
      'fs',
      'fs/promises'
    ],
    plugins: [
      nodeResolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: true,
        declarationDir: 'dist',
        exclude: ['**/*.test.ts', '**/*.spec.ts']
      })
    ]
  },
  {
    input: 'src/main.ts',
    output: [
      {
        file: 'dist/main.js',
        format: 'es'
      }
    ],
    external: [
      'inquirer',
      'rxjs',
      'path',
      'fs',
      'fs/promises'
    ],
    plugins: [
      nodeResolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        exclude: ['**/*.test.ts', '**/*.spec.ts']
      })
    ]
  },
  {
    input: 'cli.js',
    output: [
      {
        file: 'dist/cli.js',
        format: 'es',
        banner: '#!/usr/bin/env node',
        inlineDynamicImports: true
      }
    ],
    external: [
      'inquirer',
      'rxjs',
      'path',
      'fs',
      'fs/promises'
    ],
    plugins: [
      nodeResolve(),
      commonjs()
    ]
  },
  {
    input: 'dist/types/index.d.ts',
    output: [{ file: 'dist/index.d.ts', format: 'es' }],
    plugins: [dts()]
  }
]); 