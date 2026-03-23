import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import { resolve } from 'path'

export default defineConfig({
  plugins: [uni()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@gongchengcang/types': resolve(__dirname, '../../packages/types/src'),
      '@gongchengcang/utils': resolve(__dirname, '../../packages/utils/src'),
      '@gongchengcang/api': resolve(__dirname, '../../packages/api/src'),
      '@gongchengcang/constants': resolve(__dirname, '../../packages/constants/src'),
    },
  },
})
