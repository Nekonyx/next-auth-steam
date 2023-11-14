import { resolve } from 'node:path'
import { defineConfig, loadEnv } from 'vite'
import dts from 'vite-plugin-dts'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import EnvironmentPlugin from 'vite-plugin-environment'

import packageJson from './package.json'

export default defineConfig({
  publicDir: 'public',
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  plugins: [
    nodePolyfills(),
    EnvironmentPlugin('all', { defineOn: 'import.meta.env' }),
    dts({
      include: ['src/']
    }),
    viteStaticCopy({
      targets: [
        {
          src: 'src/logo',
          dest: ''
        }
      ]
    })
  ],
  build: {
    copyPublicDir: true,
    minify: 'esbuild',
    lib: {
      entry: resolve('src', 'index.ts'),
      name: 'HyperplayNextAuthSteam',
      formats: ['es'],
      fileName: (format) => `index.${format}.js`
    },
    rollupOptions: {
      external: [...Object.keys(packageJson.peerDependencies)],
      input: [resolve(__dirname, './src/index.ts')]
    }
  }
})
