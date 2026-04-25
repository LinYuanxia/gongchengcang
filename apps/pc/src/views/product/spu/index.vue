<template>
  <div class="page-container">
    <a-card :bordered="false">
      <div class="table-actions">
        <a-space>
          <a-input-search
            v-model="searchForm.keyword"
            placeholder="搜索SPU名称/编码"
            style="width: 240px"
            @search="handleSearch"
          />
          <a-cascader
            v-model="searchForm.categoryId"
            :options="categoryTree"
            placeholder="商品分类"
            style="width: 200px"
            allow-clear
            :field-names="{ value: 'categoryId', label: 'categoryName', children: 'children' }"
          />
        </a-space>
        <a-button type="primary" @click="handleAdd">
          <template #icon><icon-plus /></template>
          新增SPU
        </a-button>
      </div>
      <a-table
        :data="tableData"
        :loading="loading"
        :pagination="pagination"
        @page-change="handlePageChange"
      >
        <template #columns>
          <a-table-column title="主图" :width="80">
            <template #cell="{ record }">
              <a-image :src="record.mainImage" :width="48" :height="48" fit="cover" />
            </template>
          </a-table-column>
          <a-table-column title="SPU编码" data-index="spuCode" :width="120" />
          <a-table-column title="SPU名称" data-index="spuName" :width="200" />
          <a-table-column title="所属分类" data-index="categoryName" :width="120" />
          <a-table-column title="计量单位" data-index="unit" :width="80" />
          <a-table-column title="关联属性" :width="200">
            <template #cell="{ record }">
              <a-tag v-for="(name, index) in record.attrNames" :key="index" style="margin: 2px">
                {{ name }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="SKU数量" data-index="skuCount" :width="100" />
          <a-table-column title="创建时间" data-index="createdAt" :width="180" />
          <a-table-column title="操作" :width="200" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-button type="text" size="small" @click="handleView(record)">详情</a-button>
                <a-button type="text" size="small" @click="handleEdit(record)">编辑</a-button>
                <a-button type="text" size="small" @click="handleManageSku(record)">管理SKU</a-button>
                <a-button type="text" size="small" status="danger" @click="handleDelete(record)">删除</a-button>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Message, Modal } from '@arco-design/web-vue'
import type { Spu, ProductCategory } from '@gongchengcang/types'
import { getSpuList, deleteSpu, getCategoryTree } from '@gongchengcang/api'

const prdItems = [
  {
    reqId: 1,
    moduleName: '搜索筛选模块',
    content: `
【1】搜索筛选模块 - 完整产品标准

---

### 一、筛选器布局

筛选栏采用 [[横向流式]](primary) 布局，从左到右排列：

| 控件 | 宽度 | 类型 | 说明 |
|------|------|------|------|
| 关键词搜索框 | 240px | InputSearch | SPU名称 / SPU编码 模糊搜索 |
| 商品分类 | 200px | Cascader | 三级级联选择，支持清空 |

---

### 二、关键词搜索规则

#### 搜索范围（二者命中其一即可）：
- SPU名称（模糊匹配）
- SPU编码（模糊匹配）

#### 交互细节：
- 点击搜索图标触发查询
- 按下回车键触发查询
- 页码自动重置为第1页

---

### 三、分类级联规则

#### 数据结构：
- 支持最多 3 级分类层级
- fieldNames 映射：
  - value: categoryId
  - label: categoryName
  - children: children

#### 联动逻辑：
>>>flow
选择任意级分类 -> 取最后一级的 categoryId
-> 触发查询
-> 页码重置为 1
<<<

---

### 四、入口联动规则

>> 支持从分类树直接跳转到本页并自动带入分类参数：

IF 路由 query.categoryId 存在 THEN
   自动组装为 [categoryId] 数组
   触发查询
END IF

!! 该入口主要用于分类树点击穿透场景
`
  },
  {
    reqId: 2,
    moduleName: '表格展示规范',
    content: `
【2】表格展示规范 - 完整产品标准

---

### 一、列定义（从左到右）

| 列名 | 宽度 | 对齐 | 特殊渲染 |
|------|------|------|----------|
| 主图 | 80px | 居中 | 48×48 圆角缩略图 |
| SPU编码 | 120px | 左 | 纯文本 |
| SPU名称 | 200px | 左 | 纯文本 |
| 所属分类 | 120px | 左 | 纯文本 |
| 计量单位 | 80px | 左 | 纯文本 |
| 关联属性 | 200px | 左 | Tag 列表，间距 2px |
| SKU数量 | 100px | 左 | 纯文本数字 |
| 创建时间 | 180px | 左 | 标准日期格式 |
| **操作列** | 200px | 左 | **固定在右侧！** |

---

### 二、主图渲染规范

| 属性 | 值 |
|------|-----|
| 尺寸 | 48px × 48px |
| 填充模式 | cover 裁剪 |
| 圆角 | 4px |
| 加载失败 | 默认占位图 |
| 点击 | 全屏预览 |

---

### 三、属性 Tag 渲染规范

- 横向排列，自动换行
- 每个 Tag 间距 2px
- 无属性时显示 - 横杠
- 最多显示 3 行，超出省略

---

### 四、空数据规范

| 场景 | 处理方式 |
|------|----------|
| 无主图 | 显示灰色默认图 |
| 无属性 | 显示 - 横杠 |
| SKU数量为0 | 显示 0 + 灰色文字提示 |
`
  },
  {
    reqId: 3,
    moduleName: '行操作集合',
    content: `
【3】行操作集合 - 完整产品标准

---

### 一、操作按钮清单（从左到右）

| 按钮 | 类型 | 权限 | 前置条件 | 交互说明 |
|------|------|------|----------|----------|
| 🔗 详情 | text链接 | 所有用户 | 无 | 跳转到 SPU 详情页（查看模式） |
| ✏️ 编辑 | text链接 | 运营/管理员 | 无 | 跳转到 SPU 编辑页 |
| 📦 管理SKU | text链接 | 所有用户 | 无 | 跳转到 SKU 列表页，带入 spuId 参数 |
| 🗑️ 删除 | text+红色 | 仅管理员 | 无 | 弹出二次确认框 |

---

### 二、删除二次确认规范

>> 必须弹出 Modal 确认框：

| 属性 | 值 |
|------|-----|
| 标题 | 确认删除 |
| 内容 | 确定要删除SPU「{spuName}」吗？ |
| 按钮 | 取消 / 确定（红色） |
| 成功提示 | Message.success("删除成功") |
| 失败提示 | Message.error("删除失败") |

!! 删除成功后自动刷新当前页数据

---

### 三、路由跳转参数

| 操作 | 目标路由 | 参数 |
|------|---------|------|
| 新增 | /product/spu/add | 无 |
| 编辑 | /product/spu/edit/{spuId} | spuId 路径参数 |
| 详情 | /product/spu/view/{spuId} | spuId 路径参数 |
| 管理SKU | /product/sku | spuId + spuName Query 参数 |

>> 跳转后保留原列表的分页和筛选状态
`
  },
  {
    reqId: 4,
    moduleName: '新增SPU表单（字段级规范）',
    content: `
【4】新增SPU表单 - 完整字段级产品标准

---

### 一、整体表单结构

表单采用 [[分步向导]](warning) 模式，共3个步骤：
- 步骤1：基础信息（必填）
- 步骤2：规格配置（必填）
- 步骤3：SKU价格（必填）

---

### 二、Step 1：基础信息（必填项）

| 字段名 | 组件 | 必填 | 长度限制 | 验证规则 | 占位提示 |
|--------|------|------|----------|----------|----------|
| **SPU名称** | Input输入 | ✅ 是 | 最多 100 字符 | 非空 | 请输入SPU名称 |
| **SPU编码** | Input输入 | ❌ 否 | 最多 50 字符 | 无 | 请输入SPU编码，不填系统自动生成 |
| **所属分类** | Cascader级联 | ✅ 是 | - | 必须选择最后一级 | 请选择所属分类 |
| **计量单位** | Select下拉 | ✅ 是 | 最多 10 字符 | 非空，支持自定义创建 | 请选择或输入计量单位 |
| **商品主图** | Input输入 | ❌ 否 | 最多 500 字符 | URL格式 | 请输入主图URL |
| **商品相册** | 动态添加 | ❌ 否 | 最多 9 张 | URL格式 | 输入图片URL后回车添加 |
| **商品描述** | Textarea | ❌ 否 | 最多 500 字符 | 无 | 请输入商品描述 |
| **商品备注** | Textarea | ❌ 否 | 最多 500 字符 | 无 | 请输入商品备注 |

---

### 三、计量单位下拉选项（内置）

- [[吨]](success)、[[米]](primary)、[[个]](warning)
- [[件]](success)、[[套]](primary)、[[千克]](warning)
- [[立方米]](success)、[[平方米]](primary)

!! 支持用户输入自定义计量单位，不限于以上选项

---

### 四、Step 2：规格配置（必填项）

>> 核心功能：动态管理商品规格属性

| 操作 | 说明 |
|------|------|
| 添加规格 | 从系统属性库选择，或自定义 |
| 删除规格 | 移除不需要的规格 |
| 编辑规格值 | 每个规格可设置多个可选值 |

>>>flow
选择规格属性 -> 自动带出属性值
-> 点击删除 -> 移除该规格
-> 点击添加 -> 追加一行规格
-> 保存 -> 生成笛卡尔积 SKU
<<<

!! 规格数量决定 SKU 数量，比如 颜色(3个) × 尺寸(2个) = 6 个 SKU

---

### 五、Step 3：SKU价格配置

>> 批量录入所有 SKU 的价格和库存

| 字段名 | 组件 | 必填 | 说明 |
|--------|------|------|------|
| SKU编码 | Input输入 | ❌ 否 | 不填自动生成 |
| 采购价 | 数字输入 | ✅ 是 | 单位：元，保留2位小数 |
| 销售价 | 数字输入 | ✅ 是 | 单位：元，保留2位小数 |
| 初始库存 | 数字输入 | ✅ 是 | 单位：件，≥ 0 |

!! 表格模式批量录入，支持从上往下快速填充
`
  },
  {
    reqId: 5,
    moduleName: '权限控制矩阵',
    content: `
【5】权限控制矩阵 - 完整产品标准

---

### 一、角色定义

| 角色 | 说明 |
|------|------|
| 👑 超级管理员 | 平台最高权限 |
| 👔 平台管理员 | 商品全功能管理 |
| 🧑‍💼 运营人员 | 日常维护 |
| 👁️ 只读用户 | 仅查看权限 |

---

### 二、操作权限对照表

| 功能点 | 超管 | 管理员 | 运营 | 只读 |
|--------|------|--------|------|------|
| 查看SPU列表 | ✅ | ✅ | ✅ | ✅ |
| 搜索筛选 | ✅ | ✅ | ✅ | ✅ |
| 新增SPU | ✅ | ✅ | ✅ | ❌ |
| 编辑SPU | ✅ | ✅ | ✅ | ❌ |
| 查看SPU详情 | ✅ | ✅ | ✅ | ✅ |
| 管理SKU | ✅ | ✅ | ✅ | ❌ |
| 删除SPU | ✅ | ✅ | ❌ | ❌ |
| 批量导入 | ✅ | ✅ | ❌ | ❌ |
| 批量导出 | ✅ | ✅ | ✅ | ❌ |

---

### 三、无权限处理原则

>> 核心原则：**看不见 = 不存在**

| 原则 | 处理方式 | 反模式（禁止） |
|------|----------|----------------|
| 按钮级 | ✅ 直接不渲染 | ❌ 按钮灰掉禁用 |
| 路由级 | ✅ 404 跳转 | ❌ 提示"你没有权限" |

---

### 四、前端权限判断代码规范

>> 有判断权限，才渲染按钮，无权限用户永远看不见
`
  }
]

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const tableData = ref<Spu[]>([])
const categoryTree = ref<ProductCategory[]>([])
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
})
const searchForm = reactive({
  keyword: '',
  categoryId: undefined as string[] | undefined,
})

watch(
  () => route.query.categoryId,
  (categoryId) => {
    if (categoryId) {
      searchForm.categoryId = [categoryId as string]
      loadData()
    }
  },
  { immediate: true }
)

onMounted(() => {
  loadCategoryTree()
  if (!route.query.categoryId) {
    loadData()
  }
})

async function loadCategoryTree() {
  try {
    categoryTree.value = await getCategoryTree()
  } catch (error) {
    console.error('加载分类树失败:', error)
  }
}

async function loadData() {
  loading.value = true
  try {
    const categoryId = searchForm.categoryId?.[searchForm.categoryId.length - 1]
    const result = await getSpuList({
      page: pagination.current,
      pageSize: pagination.pageSize,
      keyword: searchForm.keyword,
      categoryId,
    })
    tableData.value = result.list
    pagination.total = result.total
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  pagination.current = 1
  loadData()
}

function handlePageChange(page: number) {
  pagination.current = page
  loadData()
}

function handleAdd() {
  router.push('/product/spu/add')
}

function handleEdit(record: Spu) {
  router.push(`/product/spu/edit/${record.spuId}`)
}

function handleView(record: Spu) {
  router.push(`/product/spu/view/${record.spuId}`)
}

function handleManageSku(record: Spu) {
  router.push({
    path: '/product/sku',
    query: { spuId: record.spuId, spuName: record.spuName }
  })
}

function handleDelete(record: Spu) {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除SPU「${record.spuName}」吗？`,
    onOk: async () => {
      try {
        await deleteSpu(record.spuId)
        Message.success('删除成功')
        loadData()
      } catch (error: any) {
        Message.error(error.message || '删除失败')
      }
    },
  })
}
</script>
