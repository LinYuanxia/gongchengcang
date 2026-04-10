#!/bin/bash

echo "开始构建并部署到 GitHub Pages..."

cd "$(dirname "$0")"

cd apps/pc

echo "安装依赖..."
npm install

echo "构建项目..."
npm run build

echo "创建 404.html (SPA 路由支持)..."
cp dist/index.html dist/404.html

echo "创建 .nojekyll 文件..."
touch dist/.nojekyll

echo "部署到 gh-pages 分支..."
cd ../..
npx gh-pages -d apps/pc/dist -m "Deploy to GitHub Pages"

echo "✅ 部署完成！"
echo "🌐 访问地址: https://linyuanxia.github.io/gongchengcang/"
