import { defineConfig } from '@rsbuild/core';
import { pluginTypeCheck } from '@rsbuild/plugin-type-check';
import path from 'path';

export default defineConfig({
  plugins: [pluginTypeCheck()],
  source: {
    entry: {
      index: './ui/src/index.ts',
    },
  },
  html: {
    template: './ui/src/index.html',
  },
  output: {
    distPath: {
      root: '../../api-docs-dist',
    },
    assetPrefix: './',
  },
  server: {
    publicDir: [
      {
        name: './ui/public',
      },
    ],
  },
});
