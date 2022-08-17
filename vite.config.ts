import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  define: { 'process.env': {} },
  resolve: {
    alias:
      [
        {
          find: '@',
          replacement: resolve(__dirname, './src'),
        },
        {
          find: /^~(.*)$/,
          replacement: '$1',
        },
      ],
  }
})