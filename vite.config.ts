import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import vitePluginRequire from "vite-plugin-require";


export default defineConfig({
  plugins: [
    vue(),

    vitePluginRequire({
      // @fileRegex RegExp
      // optional：default file processing rules are as follows
      // fileRegex:/(.jsx?|.tsx?|.vue)$/

      // Conversion mode. The default mode is import
      // importMetaUrl | import
      // importMetaUrl see https://vitejs.cn/guide/assets.html#new-url-url-import-meta-url 
      // translateType: "importMetaUrl" | "import";
    }),
  ],
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
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
})