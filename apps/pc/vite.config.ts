import { defineConfig, Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import fs from 'fs'
import { execSync } from 'child_process'
import https from 'https'

function prdEditorPlugin(): Plugin {
  return {
    name: 'prd-editor-plugin',
    configureServer(server) {
      // ====== 语雀API动态转发中间件（支持任意企业版域名） ======
      server.middlewares.use('/api/yuque/', (req, res) => {
        const yuqueHost = req.headers['x-yuque-host'] as string || 'www.yuque.com'
        const path = req.url?.replace(/^\/api\/yuque/, '') || ''

        const options = {
          hostname: yuqueHost,
          path: `/api/v2${path}`,
          method: req.method,
          headers: {
            'Content-Type': 'application/json',
            'X-Auth-Token': req.headers['x-auth-token'] || '',
          },
        }

        const proxyReq = https.request(options, (proxyRes) => {
          res.writeHead(proxyRes.statusCode!, proxyRes.headers)
          proxyRes.pipe(res)
        })

        req.pipe(proxyReq)
        proxyReq.on('error', () => res.end(JSON.stringify({ message: '代理失败' })))
      })

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

            // 仅本地保存，不自动提交GitHub
            res.end(JSON.stringify({ success: true, message: '本地保存成功！请自行提交到GitHub' }))
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
      // ⚠️ 代理顺序很重要！长路径放前面！
      '/api/yuque': {
        target: 'https://www.yuque.com/api/v2',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api\/yuque/, ''),
      },
      '/api/save-prd-doc': {
        bypass: () => null, // 走中间件
      },
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
