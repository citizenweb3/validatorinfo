import vue from '@vitejs/plugin-vue'
import path from 'path'
import { defineConfig } from 'vite'
const { visualizer } = require('rollup-plugin-visualizer')
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { fileURLToPath } from 'url'

const resolvePath = (dir: string) => {
  return fileURLToPath(new URL(`./src/${dir}`, import.meta.url))
}

export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver({ importStyle: 'sass' })],
    }),
  ],
  resolve: {
    alias: {
      assets: resolvePath('assets'),
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      external: ['src/assets/images/404.png'],
      plugins: [visualizer()],
      output: {
        manualChunks(id) {
          if (id.includes('element-plus')) {
            return 'elm'
          }
          if (id.includes('lodash')) {
            return 'lodash'
          }
          if (id.includes('element-plus')) {
            return 'elm'
          }
          if (id.includes('@sentry')) {
            return 'sentry'
          }
          if (id.includes('node_modules')) {
            return 'vendor'
          }
        },
      },
    },
    sourcemap: true,
  },
  optimizeDeps: {},
})
