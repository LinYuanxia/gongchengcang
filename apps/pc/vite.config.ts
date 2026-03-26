import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  base: process.env.VITE_BASE_URL || '/gongchengcang/',
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@gongchengcang/types': resolve(__dirname, '../../packages/types/src'),
      '@gongchengcang/utils': resolve(__dirname, '../../packages/utils/src'),
      '@gongchengcang/api': resolve(__dirname, '../../packages/api/src'),
      '@gongchengcang/constants': resolve(__dirname, '../../packages/constants/src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
