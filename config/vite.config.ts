import { cloudflare } from '@cloudflare/vite-plugin'
import { defineConfig } from 'vite'
import ssrPlugin from 'vite-ssr-components/plugin'
import path from 'path'

export default defineConfig({
  plugins: [cloudflare(), ssrPlugin()],
  css: {
    postcss: path.resolve(__dirname, './postcss.config.js'),
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
