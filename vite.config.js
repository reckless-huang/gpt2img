import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: './',
  build: {
    outDir: './build/dist'
  },
  server: {
    port: 5173,
    host: true
  }
}) 