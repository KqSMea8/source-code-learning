import babel from 'rollup-plugin-babel';
import replace from 'rollup-plugin-replace';
import json from 'rollup-plugin-json';
import cleanup from 'rollup-plugin-cleanup';
import filesize from 'rollup-plugin-filesize';
import progress from 'rollup-plugin-progress';
// import uglify from 'rollup-plugin-uglify';
import uglify from 'rollup-plugin-uglify-es';
import strip from 'rollup-plugin-strip';
import typescript from 'rollup-plugin-typescript2';

import { version, versions } from './package.json';

const exec = require('child_process').exec;
exec('rm -rf ./output', function(err, stdout, stderr) {
  if (err) {
    console.log(err.message);
  }
  console.log(stdout);
  console.log(stderr);
});

const JS_RANDOM_VERSION = version;

const indexBundle = [
  {
    input: 'src/app/web-entry.js',
    output: [
      {
        file: `output/resource/tech/collect/collect-v.${JS_RANDOM_VERSION}.js`,
        format: 'iife',
        name: '__tea_iife_export__',
      },
    ],
    plugins: [
      babel({
        exclude: 'node_modules/**',
        plugins: ['external-helpers'],
      }),
      replace({
        SDK_VERSION: JSON.stringify(version),
      }),
      strip({
        debugger: true,
        functions: ['assert.*', 'debug', 'alert'],
        sourceMap: false,
      }),
      json(),
      cleanup(),
      filesize(),
      progress(),
      uglify(),
    ],
  },
  {
    input: 'src/app/web-entry.js',
    output: [
      {
        file: 'lib/index.min.js',
        format: 'cjs',
      },
    ],
    plugins: [
      replace({
        SDK_VERSION: JSON.stringify(version),
      }),
      babel({
        exclude: 'node_modules/**',
      }),
      strip({
        debugger: true,
        functions: ['console.log', 'assert.*', 'debug', 'alert'],
        sourceMap: false,
      }),
      json(),
      cleanup(),
      progress(),
      uglify(),
    ],
  },
  {
    input: 'src/app/web-entry.js',
    output: [
      {
        file: 'es/index.min.js',
        format: 'es',
      },
    ],
    plugins: [
      replace({
        SDK_VERSION: JSON.stringify(version),
      }),
      babel({
        exclude: 'node_modules/**',
      }),
      strip({
        debugger: true,
        functions: ['console.log', 'assert.*', 'debug', 'alert'],
        sourceMap: false,
      }),
      json(),
      cleanup(),
      progress(),
      uglify(),
    ],
  },
];

const collectorBundle = [
  {
    input: 'src/core/CollectorAsync.js',
    output: [
      {
        file: 'lib/CollectorClient.min.js',
        format: 'cjs',
      },
    ],
    plugins: [
      replace({
        SDK_VERSION: JSON.stringify(version),
      }),
      babel({
        exclude: 'node_modules/**',
      }),
      strip({
        debugger: true,
        functions: ['console.log', 'assert.*', 'debug', 'alert'],
        sourceMap: false,
      }),
      json(),
      cleanup(),
      progress(),
      uglify(),
    ],
  },
  {
    input: 'src/core/CollectorAsync.js',
    output: [
      {
        file: 'es/CollectorClient.min.js',
        format: 'es',
      },
    ],
    plugins: [
      replace({
        SDK_VERSION: JSON.stringify(version),
      }),
      babel({
        exclude: 'node_modules/**',
      }),
      strip({
        debugger: true,
        functions: ['console.log', 'assert.*', 'debug', 'alert'],
        sourceMap: false,
      }),
      json(),
      cleanup(),
      progress(),
      uglify(),
    ],
  },
];

const miniprogramBundle = [
  {
    input: 'src/plugins/miniProduct/index.ts',
    output: [
      {
        file: `plugins/tea-sdk-miniProduct.${versions.miniprogram}.min.js`,
        format: 'cjs',
      },
      {
        file: 'demo/miniprogram/utils/tea-sdk-miniProduct.min.js',
        format: 'cjs',
      },
    ],
    plugins: [
      typescript(),
      replace({
        SDK_VERSION: JSON.stringify(version),
      }),
      babel({
        exclude: 'node_modules/**',
      }),
      strip({
        debugger: true,
        functions: ['console.log', 'assert.*', 'debug', 'alert'],
        sourceMap: false,
      }),
      json(),
      cleanup(),
      progress(),
      uglify(),
    ],
  },
  {
    input: 'src/plugins/quickApp/index.ts',
    output: [
      {
        file: `plugins/tea-sdk-quickApp.${versions.quickApp}.min.js`,
        format: 'cjs',
      },
      {
        file: 'demo/quickApp/src/utils/tea-sdk-quickApp.min.js',
        format: 'cjs',
      },
    ],
    plugins: [
      typescript(),
      replace({
        SDK_VERSION: JSON.stringify(version),
      }),
      babel({
        exclude: 'node_modules/**',
      }),
      strip({
        debugger: true,
        functions: ['console.log', 'assert.*', 'debug', 'alert'],
        sourceMap: false,
      }),
      json(),
      cleanup(),
      progress(),
      uglify(),
    ],
  },
  {
    input: 'src/plugins/qqGame/index.ts',
    output: [
      {
        file: `plugins/tea-sdk-qqgame.${versions.qqGame}.min.js`,
        format: 'umd',
        name: '$$TEA',
      },
      {
        file: 'demo/qqGame/tea-sdk-qqgame.min.js',
        format: 'umd',
        name: '$$TEA',
      },
    ],
    plugins: [
      typescript(),
      replace({
        SDK_VERSION: JSON.stringify(version),
      }),
      babel({
        exclude: 'node_modules/**',
      }),
      strip({
        debugger: true,
        sourceMap: false,
      }),
      json(),
      cleanup(),
      progress(),
      uglify(),
    ],
  },
];
export default [].concat(indexBundle, collectorBundle, miniprogramBundle);