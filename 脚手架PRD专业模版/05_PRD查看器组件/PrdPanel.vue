<template>
  <!--
    PRD浮窗查看器组件
    【用途】全局浮窗按钮 → Drawer弹窗 → 展示当前页面对应的PRD需求文档
    【集成】放入 Layout 或 App.vue，自动根据路由匹配显示内容
    【定制】修改 prdDatabase 对象内对应路由的 PRD 内容
  -->
  <div class="prd-panel-container">
    <div class="prd-float-btn" @click="openPanel">
      <img src="/prd.png" alt="PRD" class="prd-icon" />
      <span class="tip">打开PRD</span>
    </div>

    <a-drawer
      v-model:visible="visible"
      width="850"
      :title="`📋 ${currentPageName} - 产品需求文档`"
      :footer="false"
    >
      <div class="prd-content">
        <a-empty
          v-if="!currentPrdItems || currentPrdItems.length === 0"
          description="当前页面暂无PRD需求文档"
        />
        <div v-else>
          <a-alert type="info" style="margin-bottom: 20px">
            <template #content>📌 本文档为该页面的完整产品需求，开发前请仔细阅读每一条</template>
          </a-alert>
          <a-steps direction="vertical" :current="-1">
            <a-step
              v-for="item in currentPrdItems"
              :key="item.reqId"
              :title="`#${item.reqId} - ${item.moduleName}`"
            >
              <template #description>
                <a-card size="small" class="prd-card">
                  <pre class="prd-markdown">{{ item.content }}</pre>
                </a-card>
              </template>
            </a-step>
          </a-steps>
        </div>
      </div>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

interface PrdItem {
  reqId: number
  moduleName: string
  content: string
}

const route = useRoute()
const visible = ref(false)

// ====================================================================
// 【配置区】PRD数据库 — 按路由路径匹配，内容写入此处
// ====================================================================
// 格式：'路由路径' → { name: '页面名称', items: [ { reqId, moduleName, content }, ... ] }
// 内容用模板字符串，以 ==== 分割区域，保持结构清晰
// 例：
//   '/product/sku': {
//     name: 'SKU列表管理',
//     items: [
//       { reqId: 1, moduleName: '一、需求背景与定位', content: `...` },
//       { reqId: 2, moduleName: '二、筛选器设计', content: `...` },
//     ]
//   }
// ====================================================================
const prdDatabase: Record<string, { name: string; items: PrdItem[] }> = {
  // --- 示例：替换为实际页面 ---
  '/example/page': {
    name: '示例页面',
    items: [
      {
        reqId: 1,
        moduleName: '一、需求背景与定位',
        content: `
============================================================================
                         【需求背景】
============================================================================

1. 【业务背景】
   {描述业务场景和痛点}

2. 【功能定位】
   → {功能定位描述}

3. 【使用角色】
   → {角色1}
   → {角色2}
`
      },
      {
        reqId: 2,
        moduleName: '二、交互与字段规范',
        content: `
============================================================================
                         【字段规范】
============================================================================

| 字段 | 控件 | 必填 | 说明 |
|------|------|:----:|------|
| {字段1} | Input | ✅ | {说明} |
| {字段2} | Select | ❌ | {说明} |
`
      },
    ]
  },
  // --- 按此模式追加 ---
  // '/another/page': { ... }
}

/** 根据当前路由匹配PRD */
function matchPrd(path: string) {
  const cleanPath = (path || '').replace('#', '').split('?')[0] || '/'
  for (const key in prdDatabase) {
    if (key === cleanPath || cleanPath.endsWith(key)) {
      return prdDatabase[key]
    }
  }
  return null
}

const currentPageName = computed(() => {
  return matchPrd(route.path || '')?.name || route.path || '当前页面'
})

const currentPrdItems = computed(() => {
  return matchPrd(route.path || '')?.items || []
})

const openPanel = () => { visible.value = true }
</script>

<style scoped lang="less">
.prd-panel-container {
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 9999;
}
.prd-float-btn {
  width: 40px; height: 40px; border-radius: 50%;
  background: white; box-shadow: 0 4px 12px rgba(0,0,0,0.12);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 0.3s; position: relative; overflow: hidden;
  .prd-icon { width: 100%; height: 100%; object-fit: cover; }
  &:hover {
    transform: scale(1.1); box-shadow: 0 6px 18px rgba(0,0,0,0.18);
    .tip { opacity: 1; transform: translateX(0); }
  }
  .tip {
    position: absolute; right: 52px; background: #1D2129; color: white;
    padding: 5px 10px; border-radius: 4px; font-size: 12px; white-space: nowrap;
    opacity: 0; transform: translateX(10px); transition: all 0.25s;
    &::after {
      content: ''; position: absolute; right: -5px; top: 50%;
      transform: translateY(-50%); width: 0; height: 0;
      border-top: 5px solid transparent; border-bottom: 5px solid transparent;
      border-left: 5px solid #1D2129;
    }
  }
}
.prd-content {
  padding: 12px 0;
  :deep(.arco-steps-item-title) {
    font-weight: 600; font-size: 15px; color: #1D2129;
  }
  :deep(.arco-steps-item-content-line) { padding-bottom: 28px; }
  .prd-card { margin-top: 8px; }
  .prd-markdown {
    font-size: 12px; line-height: 1.6; white-space: pre-wrap; word-break: break-all;
    font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
    background: #FAFAFA; padding: 16px; border-radius: 6px; margin: 0;
    max-height: 600px; overflow-y: auto;
  }
}
</style>
