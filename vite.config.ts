import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import { viteStaticCopy } from 'vite-plugin-static-copy'

import packageJson from './package.json'

export default defineConfig({
  publicDir: 'public',
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  plugins: [
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
