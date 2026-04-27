import { defineConfig, Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import fs from 'fs'
import { execSync } from 'child_process'

function prdEditorPlugin(): Plugin {
  return {
    name: 'prd-editor-plugin',
    configureServer(server) {
      server.middlewares.use('/api/save-prd-doc', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end(JSON.stringify({ success: false, message: 'Method not allowed' }))
          return
        }

        let body = ''
        req.on('data', chunk => { body += chunk })
        req.on('end', () => {
          try {
            const { filename, content } = JSON.parse(body)
            const filePath = resolve(__dirname, `public/prd-docs/${filename}`)

            if (!fs.existsSync(filePath)) {
              res.statusCode = 404
              res.end(JSON.stringify({ success: false, message: 'File not found' }))
              return
            }

            fs.writeFileSync(filePath, content, 'utf-8')

            try {
              execSync(`git add "${filePath}" && git commit -m "docs: 更新PRD文档：${filename}" && git push origin main`, {
                cwd: resolve(__dirname, '../..'),
                timeout: 30000,
              })
            } catch (e) {
              console.log('Git commit warning:', e)
            }

            res.end(JSON.stringify({ success: true, message: '保存成功！' }))
          } catch (e) {
            res.statusCode = 500
            res.end(JSON.stringify({ success: false, message: String(e) }))
          }
        })
      })
    },
  }
}

export default defineConfig({
  base: process.env.VITE_BASE_URL || '/gongchengcang/',
  plugins: [vue(), prdEditorPlugin()],
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
    port: 8000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        bypass(req) {
          if (req.url?.startsWith('/api/save-prd-doc') || req.url?.startsWith('/api/yuque')) {
            return req.url
          }
        },
      },
      '/api/yuque': {
        target: 'https://www.yuque.com/api/v2',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api\/yuque/, ''),
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
