// =====================================================================
// PRD查看器 - Vite配置模板（复制到你的 vite.config.ts）
// 提供：1) 在线编辑保存接口 2) 语雀API跨域代理
// =====================================================================

import { defineConfig, Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import fs from 'fs'
import { execSync } from 'child_process'

/**
 * PRD编辑器后端插件
 * 提供 /api/save-prd-doc 接口，保存Markdown并自动提交Git
 */
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

            // 自动提交Git（本地开发用，生产环境请移除）
            try {
              execSync(`git add "${filePath}" && git commit -m "docs: 更新PRD文档：${filename}" && git push origin main`, {
                cwd: resolve(__dirname, '../..'),
                timeout: 30000,
              })
            } catch (e) {
              console.log('Git commit 提示:', e)
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
  plugins: [
    vue(),
    prdEditorPlugin(), // ✅ 启用PRD编辑功能
  ],
  server: {
    host: '0.0.0.0',
    port: 8000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        // ✅ 绕过本地接口：PRD编辑 + 语雀代理
        bypass(req) {
          if (req.url?.startsWith('/api/save-prd-doc') || req.url?.startsWith('/api/yuque')) {
            return req.url
          }
        },
      },
      // ✅ 语雀API代理（解决跨域问题）
      '/api/yuque': {
        target: 'https://www.yuque.com/api/v2',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api\/yuque/, ''),
      },
    },
  },
})
