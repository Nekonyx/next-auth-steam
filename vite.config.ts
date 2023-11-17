import { resolve } from 'node:path'
import { defineConfig, loadEnv } from 'vite'
import dts from 'vite-plugin-dts'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import { visualizer } from 'rollup-plugin-visualizer'

import packageJson from './package.json'

export default defineConfig({
  publicDir: 'public',
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  plugins: [
    nodePolyfills({
      include: ['crypto', 'util', 'querystring', 'stream']
    }),
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
    }),
    visualizer()
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
      input: [resolve(__dirname, './src/index.ts')],
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            const directories = id.split('node_modules/')[1].split('/')
            const name = directories[0]
            return `vendor/${name}`
          }
        }
      }
    }
  }
})
