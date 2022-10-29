import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Unocss from 'unocss/vite'

export default defineConfig({
  base: './',
  plugins: [
    vue(),
    Unocss(),
  ],
  server: {
    port: 7171,
  },
})
