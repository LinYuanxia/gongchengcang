<template>
  <div class="page-container">
    <PrdPanel :items="prdItems" />
    <a-card :bordered="false">
      <div class="table-actions">
        <a-space>
          <a-input-search
            v-model="searchForm.keyword"
            placeholder="搜索商品名称/SKU"
            style="width: 240px"
            @search="handleSearch"
          />
          <a-cascader
            v-model="searchForm.categoryId"
            :options="categoryTree"
            placeholder="商品分类"
            style="width: 200px"
            allow-clear
          />
          <a-select v-model="searchForm.status" placeholder="状态" style="width: 120px" allow-clear>
            <a-option v-for="item in PRODUCT_STATUS_OPTIONS" :key="item.value" :value="item.value">
              {{ item.label }}
            </a-option>
          </a-select>
        </a-space>
        <a-space>
          <a-button type="primary" @click="handleAdd">
            <template #icon><icon-plus /></template>
            新增商品
          </a-button>
        </a-space>
      </div>
      <a-table
        :data="tableData"
        :loading="loading"
        :pagination="pagination"
        @page-change="handlePageChange"
      >
        <template #columns>
          <a-table-column title="商品图片" :width="80">
            <template #cell="{ record }">
              <a-image :src="record.images?.[0]" :width="48" :height="48" fit="cover" />
            </template>
          </a-table-column>
          <a-table-column title="SKU" data-index="sku" :width="120" />
          <a-table-column title="商品名称" data-index="name" :width="200" />
          <a-table-column title="分类" data-index="categoryName" :width="100" />
          <a-table-column title="规格" data-index="spec" :width="120" />
          <a-table-column title="单位" data-index="unit" :width="80" />
          <a-table-column title="状态" :width="100">
            <template #cell="{ record }">
              <a-tag :color="PRODUCT_STATUS_MAP[record.status]?.color">
                {{ PRODUCT_STATUS_MAP[record.status]?.label }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="创建时间" data-index="createdAt" :width="180" />
          <a-table-column title="操作" :width="250" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-button type="text" size="small" @click="handleView(record)">查看</a-button>
                <a-button type="text" size="small" @click="handleEdit(record)">编辑</a-button>
                <a-button type="text" size="small" @click="handlePrice(record)">定价</a-button>
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
import { ref, reactive, onMounted } from 'vue'
import { Message, Modal } from '@arco-design/web-vue'
import { PRODUCT_STATUS_OPTIONS, PRODUCT_STATUS_MAP } from '@gongchengcang/constants'
import type { Product } from '@gongchengcang/types'
import PrdPanel from '@/components/PrdPanel/index.vue'

const prdItems = [
  {
    reqId: 1,
    moduleName: '搜索筛选模块',
    content: `
【1】搜索筛选模块 - 完整产品标准

---

### 一、筛选器布局

| 控件 | 宽度 | 类型 | 说明 |
|------|------|------|------|
| 关键词搜索框 | 240px | InputSearch | 商品名称 / SKU 模糊搜索 |
| 商品分类 | 200px | Cascader | 二级级联选择，支持清空 |
| 状态 | 120px | Select | 下拉单选，支持清空 |

---

### 二、状态下拉选项定义

| 状态值 | 标签 | Tag颜色 |
|--------|------|---------|
| 1 | [[待审核]](warning) | 橙色 |
| 2 | [[已上架]](success) | 绿色 |
| 3 | [[已下架]](primary) | 灰色 |
| 4 | [[审核驳回]](danger) | 红色 |

---

### 三、筛选联动逻辑

>>>flow
选择任意筛选条件 -> 自动触发查询
-> 页码重置为 1
-> 更新列表数据
<<<

>> 多条件组合：AND 逻辑，同时满足所有筛选条件
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
| 商品图片 | 80px | 居中 | 48×48 圆角缩略图 |
| SKU | 120px | 左 | 纯文本 |
| 商品名称 | 200px | 左 | 纯文本 |
| 分类 | 100px | 左 | 纯文本 |
| 规格 | 120px | 左 | 纯文本 |
| 单位 | 80px | 左 | 纯文本 |
| 状态 | 100px | 左 | Tag 组件，色彩区分 |
| 创建时间 | 180px | 左 | 标准日期格式 |
| **操作列** | 250px | 左 | **固定在右侧！** |

---

### 二、主图渲染规范

- 取 images 数组第一张
- 数组为空显示默认占位图
- 点击图片可放大预览
- 尺寸 48×48，cover 裁剪

---

### 三、状态Tag渲染

| 状态 | Tag样式 |
|------|---------|
| 待审核 | 橙色实心 |
| 已上架 | 绿色实心 |
| 已下架 | 灰色实心 |
| 审核驳回 | 红色实心 |
`
  },
  {
    reqId: 3,
    moduleName: '状态机流转',
    content: `
【3】状态机流转 - 完整产品标准

---

### 一、状态定义与流转图

| 状态 | 说明 | 可流转到 |
|------|------|---------|
| 待审核 | 供应商提交，等待平台审核 | 已上架 / 审核驳回 |
| 已上架 | 审核通过，对下游可见 | 已下架 |
| 已下架 | 平台或供应商下架 | 已上架 |
| 审核驳回 | 审核不通过 | 待审核（重新提交） |

>>>flow
供应商提交 -> 待审核
-> 平台审核通过 -> 已上架 -> 商品市场可见
-> 平台审核驳回 -> 驳回原因 -> 供应商编辑重提
-> 已上架 -> 点击下架 -> 已下架 -> 市场不可见
-> 已下架 -> 点击上架 -> 已上架
<<<

---

### 二、状态权限控制

| 操作 | 角色 |
|------|------|
| 提交审核 | 供应商 |
| 审核通过/驳回 | 平台运营 |
| 上架/下架 | 平台运营 + 供应商 |
`
  },
  {
    reqId: 4,
    moduleName: '行操作集合',
    content: `
【4】行操作集合 - 完整产品标准

---

### 一、操作按钮清单（从左到右）

| 按钮 | 类型 | 前置条件 | 交互说明 |
|------|------|----------|----------|
| 查看 | text链接 | 所有状态 | 打开商品详情抽屉 |
| 编辑 | text链接 | 待审核/驳回 | 打开编辑表单 |
| 定价 | text链接 | 所有状态 | 打开定价配置抽屉 |
| 删除 | text+红色 | 所有状态 | 弹出二次确认框 |

---

### 二、定价功能说明

>> 支持同一商品针对不同客户设置不同价格

| 定价类型 | 说明 |
|---------|------|
| 基准价 | 所有客户的默认价格 |
| 协议价 | 指定客户的专属价格，优先级 > 基准价 |

>>>flow
点击"定价" -> 打开定价抽屉
-> 配置基准采购价 / 基准销售价
-> 配置指定客户的专属协议价
-> 保存 -> 立即生效
<<<

---

### 三、删除二次确认规范

| 属性 | 值 |
|------|-----|
| 标题 | 确认删除 |
| 内容 | 确定要删除商品「{name}」吗？ |
| 按钮 | 取消 / 确定 |
| 成功提示 | 删除成功 |
`
  },
  {
    reqId: 5,
    moduleName: '权限控制矩阵',
    content: `
【5】权限控制矩阵 - 完整产品标准

---

### 一、角色权限对照表

| 功能点 | 平台超管 | 平台运营 | 供应商 | 只读用户 |
|--------|----------|----------|--------|---------|
| 查看商品市场 | ✅ | ✅ | ✅ | ✅ |
| 搜索筛选 | ✅ | ✅ | ✅ | ✅ |
| 新增商品 | ✅ | ✅ | ✅ | ❌ |
| 编辑商品 | ✅ | ✅ | ✅（自己的） | ❌ |
| 查看商品详情 | ✅ | ✅ | ✅ | ✅ |
| 商品定价 | ✅ | ✅ | ✅（自己的） | ❌ |
| 删除商品 | ✅ | ✅ | ✅（自己的） | ❌ |
| 审核商品 | ✅ | ✅ | ❌ | ❌ |
| 上架/下架 | ✅ | ✅ | ✅（自己的） | ❌ |

---

### 二、数据权限隔离

>> 供应商只能看见和操作自己的商品！

| 角色 | 数据范围 |
|------|---------|
| 平台 | 所有供应商的全部商品 |
| 供应商 | 只能看到自己提交的商品 |
`
  }
]

const loading = ref(false)
const tableData = ref<Product[]>([])
const categoryTree = ref<any[]>([])
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
})

const searchForm = reactive({
  keyword: '',
  categoryId: undefined as string[] | undefined,
  status: undefined as number | undefined,
})

onMounted(() => {
  loadCategoryTree()
  loadData()
})

async function loadCategoryTree() {
  categoryTree.value = [
    {
      label: '建筑材料',
      value: '1',
      children: [
        { label: '水泥', value: '1-1' },
        { label: '砂石', value: '1-2' },
        { label: '钢材', value: '1-3' },
      ],
    },
    {
      label: '装饰材料',
      value: '2',
      children: [
        { label: '瓷砖', value: '2-1' },
        { label: '涂料', value: '2-2' },
      ],
    },
  ]
}

async function loadData() {
  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 500))
    tableData.value = [
      {
        id: '1',
        sku: 'SKU001',
        name: 'P.O 42.5 普通硅酸盐水泥',
        categoryId: '1-1',
        categoryName: '水泥',
        spec: '50kg/袋',
        unit: '吨',
        images: ['https://via.placeholder.com/48'],
        status: 2,
        merchantId: '1',
        createdAt: '2024-01-15 10:30:00',
        updatedAt: '2024-01-15 10:30:00',
      },
      {
        id: '2',
        sku: 'SKU002',
        name: 'HRB400E 螺纹钢',
        categoryId: '1-3',
        categoryName: '钢材',
        spec: 'Φ16',
        unit: '吨',
        images: ['https://via.placeholder.com/48'],
        status: 2,
        merchantId: '1',
        createdAt: '2024-01-16 14:20:00',
        updatedAt: '2024-01-16 14:20:00',
      },
    ]
    pagination.total = 2
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
  Message.info('新增商品')
}

function handleView(record: Product) {
  Message.info(`查看商品: ${record.name}`)
}

function handleEdit(record: Product) {
  Message.info(`编辑商品: ${record.name}`)
}

function handlePrice(record: Product) {
  Message.info(`商品定价: ${record.name}`)
}

function handleDelete(record: Product) {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除商品「${record.name}」吗？`,
    onOk: () => {
      Message.success('删除成功')
      loadData()
    },
  })
}
</script>
