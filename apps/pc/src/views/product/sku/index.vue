<template>
  <div class="page-container">
    <a-card :bordered="false">
      <template #title>
        <span v-if="spuFilter">SKU列表 - {{ spuFilter.spuName }}</span>
        <span v-else>SKU列表</span>
      </template>
      <template #extra>
        <a-space>
          <a-button v-if="spuFilter" type="text" @click="clearSpuFilter">
            <template #icon><icon-close /></template>
            清除筛选
          </a-button>
          <a-button type="primary" @click="openAddSkuModal">
            <template #icon><icon-plus /></template>
            新增SKU
          </a-button>
        </a-space>
      </template>
      <div class="table-actions">
        <a-space>
          <a-input-search
            v-model="searchForm.keyword"
            placeholder="搜索SKU名称/编码"
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
          <a-select
            v-model="searchForm.spuId"
            :options="spuSelectOptions"
            placeholder="所属SPU"
            style="width: 200px"
            allow-search
            allow-clear
          />
        </a-space>
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
          <a-table-column title="SKU编码" data-index="skuCode" :width="150" />
          <a-table-column title="SKU名称" data-index="skuName" :width="200" />
          <a-table-column title="所属SPU" data-index="spuName" :width="150" />
          <a-table-column title="所属分类" data-index="categoryName" :width="100" />
          <a-table-column title="规格" :width="200">
            <template #cell="{ record }">
              <span v-for="(value, key) in record.specs" :key="key" style="margin-right: 8px">
                <a-tag size="small">{{ key }}: {{ value }}</a-tag>
              </span>
            </template>
          </a-table-column>
          <a-table-column title="单位" data-index="unit" :width="60" />
          <a-table-column title="供货价" :width="100">
            <template #cell="{ record }">
              <span v-if="record.supplyPrice">¥{{ record.supplyPrice.toFixed(2) }}</span>
              <span v-else>-</span>
            </template>
          </a-table-column>
          <a-table-column title="销售价" :width="100">
            <template #cell="{ record }">
              <span v-if="record.salePrice">¥{{ record.salePrice.toFixed(2) }}</span>
              <span v-else>-</span>
            </template>
          </a-table-column>
          <a-table-column title="状态" :width="80">
            <template #cell="{ record }">
              <a-switch
                :model-value="record.status === 'on_shelf'"
                :checked-value="true"
                :unchecked-value="false"
                size="small"
                @change="handleStatusChange(record)"
              />
            </template>
          </a-table-column>
          <a-table-column title="创建时间" data-index="createdAt" :width="180" />
          <a-table-column title="操作" :width="200" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-button type="text" size="small" @click="handleView(record)">详情</a-button>
                <a-button type="text" size="small" @click="handleEdit(record)">编辑</a-button>
                <a-button type="text" size="small" @click="handleDelete(record)">
                  <icon-delete />
                </a-button>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <!-- SKU编辑弹窗（新增/编辑共用） -->
    <a-modal v-model:visible="addSkuModalVisible" :title="addSkuIsEdit ? '编辑SKU' : '新增SKU'" :width="700" @ok="handleAddSkuConfirm" @cancel="addSkuModalVisible = false">
      <a-form :model="addSkuForm" layout="vertical">
        <a-form-item label="所属SPU" :rules="[{ required: true, message: '请选择所属SPU' }]">
          <a-select
            v-if="!addSkuIsEdit"
            v-model="addSkuForm.spuId"
            :options="spuSelectOptions"
            placeholder="请选择所属SPU"
            allow-search
            allow-clear
            style="width: 100%"
          />
          <a-input v-else :model-value="addSkuForm.spuName" disabled style="width: 100%" />
        </a-form-item>
        <a-form-item label="主图">
          <a-upload
            list-type="picture-card"
            :file-list="addSkuMainImageList"
            :limit="1"
            accept="image/*"
            :auto-upload="false"
            @change="handleAddSkuMainImageChange"
          >
            <template #upload-button>
              <div class="upload-btn">
                <icon-plus />
                <div class="upload-text">上传主图</div>
              </div>
            </template>
          </a-upload>
        </a-form-item>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="SKU编码">
              <a-input v-model="addSkuForm.skuCode" placeholder="系统自动生成或手动输入" :maxlength="50" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="SKU名称" :rules="[{ required: true, message: '请输入SKU名称' }]">
              <a-input v-model="addSkuForm.skuName" placeholder="SKU名称" :maxlength="200" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item label="SKU规格属性">
          <template #extra>
            <a-space>
              <a-button type="text" size="small" @click="handleAddSkuCustomSpec">
                <icon-plus /> 新增规格属性
              </a-button>
            </a-space>
          </template>
          
          <div v-if="addSkuSpecList.length === 0" class="empty-spec-tip">
            <a-empty description="请先选择SPU或点击上方按钮新增规格属性" :image-size="80" />
          </div>
          <div v-else class="spec-form">
            <div v-for="spec in addSkuSpecList" :key="spec.key" class="spec-item">
              <a-form-item :label="spec.name || '自定义规格'">
                <template #label>
                  <span class="spec-label">{{ spec.name || '自定义规格' }}</span>
                  <a-button
                    type="text"
                    size="small"
                    class="delete-btn"
                    @click="handleRemoveSkuSpec(spec)"
                  >
                    <icon-close />
                  </a-button>
                </template>
                <a-input-group>
                  <a-select
                    v-if="spec.isCustom"
                    v-model="spec.name"
                    placeholder="选择规格属性"
                    style="width: 140px"
                    allow-clear
                    allow-search
                  >
                    <a-option
                      v-for="attr in getAvailableAttrsForSku(spec)"
                      :key="attr.attrId"
                      :value="attr.attrName"
                    >
                      {{ attr.attrName }}
                    </a-option>
                  </a-select>
                  <a-select
                    v-if="spec.optionValues && spec.optionValues.length > 0"
                    v-model="spec.selectedValue"
                    placeholder="请选择规格值"
                    style="width: 100%"
                    allow-clear
                  >
                    <a-option
                      v-for="value in spec.optionValues"
                      :key="value"
                      :value="value"
                    >
                      {{ value }}
                    </a-option>
                  </a-select>
                  <a-input
                    v-else
                    v-model="spec.selectedValue"
                    placeholder="请输入规格值"
                    style="width: 100%"
                    allow-clear
                  />
                </a-input-group>
              </a-form-item>
            </div>
          </div>
        </a-form-item>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="供货价" :rules="[{ required: true, message: '请输入供货价' }]">
              <a-input-number
                v-model="addSkuForm.supplyPrice"
                placeholder="供货价"
                :min="0"
                :precision="2"
                style="width: 100%"
              >
                <template #prefix>¥</template>
              </a-input-number>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="销售价" :rules="[{ required: true, message: '请输入销售价' }]">
              <a-input-number
                v-model="addSkuForm.salePrice"
                placeholder="销售价"
                :min="0"
                :precision="2"
                style="width: 100%"
              >
                <template #prefix>¥</template>
              </a-input-number>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch, computed, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Message, Modal } from '@arco-design/web-vue'
import type { Sku, ProductCategory, Spu, ProductAttr } from '@gongchengcang/types'
import { getSkuList, getCategoryTree, getSpuList, updateSku, deleteSku, getAttrList, getSkuListBySpu, createSku } from '@gongchengcang/api'
const prdItems = [
  {
    reqId: 1,
    moduleName: '入口与筛选联动',
    content: `
【1】入口与筛选联动 - 完整产品标准

---

### 一、双入口设计

| 入口 | 场景 | 自动筛选逻辑 |
|------|------|-------------|
| 直接进入 /product/sku | 全局SKU管理 | 无额外筛选条件，显示全部 |
| 从SPU列表点击"管理SKU"进入 | SPU下SKU管理 | **自动带入spuId筛选，显示该SPU下所有SKU** |

---

### 二、带筛选状态的Header显示

>> 当从SPU进入时，标题显示联动效果：

| 状态 | 标题显示 | 右上角按钮 |
|------|---------|-----------|
| 无筛选 | SKU列表 | - |
| 有筛选 | SKU列表 - {spuName} | 显示"清除筛选"按钮 |

---

### 三、筛选器布局

| 控件 | 宽度 | 类型 | 说明 |
|------|------|------|------|
| 关键词搜索框 | 240px | InputSearch | SKU名称 / SKU编码 模糊搜索 |
| 商品分类 | 200px | Cascader | 三级级联选择 |
| 所属SPU | 200px | Select | 可搜索下拉，支持清空 |

>>>flow
SPU列表点击"管理SKU" -> 自动填入所属SPU筛选
-> 自动触发查询
-> 标题变更
-> 显示"清除筛选"按钮
-> 点击"清除筛选" -> 清空筛选器 -> 显示全部SKU
<<<
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
| SKU编码 | 150px | 左 | 纯文本 |
| SKU名称 | 200px | 左 | 纯文本 |
| 所属SPU | 150px | 左 | 纯文本 |
| 所属分类 | 100px | 左 | 纯文本 |
| 规格 | 200px | 左 | key:value 小型Tag组合 |
| 单位 | 60px | 左 | 纯文本 |
| 供货价 | 100px | 右 | ¥ + 2位小数 格式化 |
| 销售价 | 100px | 右 | ¥ + 2位小数 格式化 |
| 状态 | 80px | 居中 | Switch 开关 |
| 创建时间 | 180px | 左 | 标准日期格式 |
| **操作列** | 200px | 左 | **固定在右侧！** |

---

### 二、价格渲染规范

| 场景 | 处理方式 |
|------|----------|
| 有价格 | ¥199.00 形式，保留2位小数 |
| 无价格（null/undefined） | 显示 - 横杠 |
| 0 元 | 显示 ¥0.00，不变灰 |

---

### 三、规格标签渲染规范

- 格式：[[属性名: 属性值]](primary)
- 尺寸：small 小号
- 间距：水平 8px
- 无规格：显示 - 横杠
`
  },
  {
    reqId: 3,
    moduleName: '上下架状态机',
    content: `
【3】上下架状态机 - 完整产品标准

---

### 一、状态可视化

采用 [[Switch开关]](success) 组件直接操作：

| 状态 | Switch位置 | 说明 |
|------|-----------|------|
| 已上架 | 开启（蓝色） | 商品对下游可见可采购 |
| 已下架 | 关闭（灰色） | 商品对下游不可见 |

---

### 二、全链路交互流程

>> **乐观更新 + 失败回滚** 交互模式

>>>flow
用户点击Switch -> 前端立即变更UI状态
-> 按钮Loading状态，不可重复点击
-> 向后端发送请求
  -> 成功：关闭Loading + Message提示"状态更新成功"
  -> 失败：UI状态回滚 + Message错误提示
<<<

---

### 三、交互细节规范

| 细节 | 标准值 |
|------|-------|
| Switch尺寸 | small 小号 |
| 操作防抖 | 开关操作后 300ms 内不可重复操作 |
| 成功提示 | Message.success，停留 3s |
| 失败提示 | Message.error，停留 5s |
| 失败回滚 | 必须精确恢复到操作前状态 |

!! 禁止：开关状态不回滚，用户看到状态和实际数据库不一致
`
  },
  {
    reqId: 4,
    moduleName: '新增SKU表单（字段级规范）',
    content: `
【4】新增SKU表单 - 完整字段级产品标准

---

### 一、弹窗基础规范

| 属性 | 值 |
|------|-----|
| 弹窗宽度 | 700px |
| 标题 | 新增SKU |
| 按钮 | 取消 / 确定 |
| 提交方式 | 点击确定统一校验 + 提交 |

---

### 二、字段级定义表

| 字段名 | 组件类型 | 必填 | 长度限制 | 验证规则 | 占位提示 |
|--------|---------|------|----------|----------|----------|
| **所属SPU** | Select下拉 | ✅ 是 | - | 必选 | 请选择所属SPU |
| **主图** | Upload上传 | ❌ 否 | 最多1张 | 图片格式 | 上传主图（48×48） |
| **SKU编码** | Input输入 | ❌ 否 | 最多 50 字符 | 无 | 系统自动生成或手动输入 |
| **SKU名称** | Input输入 | ✅ 是 | 最多 200 字符 | 非空 | SKU名称 |
| **SKU规格属性** | 动态键值对 | ❌ 否 | 最多 10 组 | 无 | 点击添加规格项 |
| **供货价** | InputNumber | ❌ 否 | ≥ 0 | 数字 | 请输入供货价（元） |
| **销售价** | InputNumber | ❌ 否 | ≥ 0 | 数字 | 请输入销售价（元） |

---

### 三、规格键值对交互

>>>flow
点击"+ 添加规格项" -> 增加一行
-> 输入属性名 + 属性值
-> 点击"删除" -> 移除该行
-> 可无限添加（建议最多10组）
<<<

>> 规格数据结构：键值对对象 { "颜色": "红色", "尺寸": "XL" }
`
  },
  {
    reqId: 5,
    moduleName: '行操作与权限矩阵',
    content: `
【5】行操作与权限矩阵 - 完整产品标准

---

### 一、行操作按钮

| 按钮 | 类型 | 前置条件 | 交互说明 |
|------|------|----------|----------|
| 详情 | text链接 | 无 | 跳转到 SKU 详情页 |
| 编辑 | text链接 | 无 | 打开编辑抽屉 |
| 删除 | icon+红色 | 无 | 二次确认后删除 |

---

### 二、删除二次确认

>> 必须弹出 Modal 确认框：

| 属性 | 值 |
|------|-----|
| 标题 | 确认删除 |
| 内容 | 确定要删除该SKU吗？ |
| 确认按钮 | 红色文字 |
| 成功后 | 刷新列表 + Toast提示 |

---

### 三、权限对照表

| 功能点 | 超管 | 管理员 | 运营 | 只读 |
|--------|------|--------|------|------|
| 查看SKU列表 | ✅ | ✅ | ✅ | ✅ |
| 切换上下架 | ✅ | ✅ | ✅ | ❌ |
| 新增SKU | ✅ | ✅ | ✅ | ❌ |
| 编辑SKU | ✅ | ✅ | ✅ | ❌ |
| 删除SKU | ✅ | ✅ | ❌ | ❌ |
`
  }
]

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const tableData = ref<Sku[]>([])
const categoryTree = ref<ProductCategory[]>([])
const spuList = ref<Spu[]>([])
const attrList = ref<ProductAttr[]>([])
const spuFilter = ref<{ spuId: string; spuName: string } | null>(null)

const spuSelectOptions = computed(() => {
  return spuList.value.map(spu => ({
    value: spu.spuId,
    label: spu.spuName
  }))
})
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
})
const searchForm = reactive({
  keyword: '',
  categoryId: undefined as string[] | undefined,
  spuId: undefined as string | undefined,
})
watch(
  () => route.query,
  (query) => {
    if (query.spuId && query.spuName) {
      spuFilter.value = {
        spuId: query.spuId as string,
        spuName: query.spuName as string,
      }
      searchForm.spuId = query.spuId as string
    }
    if (query.categoryId) {
      searchForm.categoryId = [query.categoryId as string]
    }
    loadData()
  },
  { immediate: true }
)

watch(
  () => searchForm.spuId,
  () => {
    handleSearch()
  }
)

onMounted(() => {
  loadCategoryTree()
  loadSpuList()
  loadAttrList()
  if (!route.query.spuId && !route.query.categoryId) {
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

async function loadSpuList() {
  try {
    const result = await getSpuList({ page: 1, pageSize: 100 })
    spuList.value = result.list
  } catch (error) {
    console.error('加载SPU列表失败:', error)
  }
}

async function loadAttrList() {
  try {
    const result = await getAttrList({ page: 1, pageSize: 100, status: 1 })
    attrList.value = result.list
  } catch (error) {
    console.error('加载属性列表失败:', error)
  }
}

async function loadData() {
  loading.value = true
  try {
    const categoryId = searchForm.categoryId?.[searchForm.categoryId.length - 1]
    const result = await getSkuList({
      page: pagination.current,
      pageSize: pagination.pageSize,
      keyword: searchForm.keyword,
      categoryId,
      spuId: searchForm.spuId,
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

function handleView(record: Sku) {
  router.push(`/product/sku/view/${record.skuId}`)
}

function handleEdit(record: Sku) {
  addSkuIsEdit.value = true
  editSkuId.value = record.skuId
  
  addSkuForm.value = {
    skuId: record.skuId,
    spuId: record.spuId,
    spuName: record.spuName || '',
    categoryId: record.categoryId || '',
    categoryName: record.categoryName || '',
    unit: record.unit || '个',
    skuCode: record.skuCode || '',
    skuName: record.skuName || '',
    specInfo: '',
    mainImage: record.mainImage || '',
    supplyPrice: record.supplyPrice,
    salePrice: record.salePrice,
  }
  
  // 从已有规格填充到编辑列表
  const existingSpecs = record.specs || {}
  addSkuSpecList.value = Object.entries(existingSpecs).map(([name, value], index) => ({
    key: `spec_${index}`,
    name,
    selectedValue: value,
    optionValues: [],
    isCustom: false,
  }))
  existingSkuSpecKeys.value = Object.keys(existingSpecs)
  addSkuSpecCounter.value = addSkuSpecList.value.length
  
  // 主图回显
  if (record.mainImage) {
    addSkuMainImageList.value = [{ url: record.mainImage, status: 'done' }]
  } else {
    addSkuMainImageList.value = []
  }
  
  addSkuModalVisible.value = true
}

function handleStatusChange(record: Sku) {
  const newStatus = (record.status as unknown as string) === 'on_shelf' ? 'off_shelf' : 'on_shelf'
  const action = newStatus === 'on_shelf' ? '上架' : '下架'
  Modal.confirm({
    title: `确认${action}`,
    content: `确定要${action}该SKU吗？`,
    onOk: async () => {
      try {
        await updateSku(record.skuId, { status: newStatus as any })
        Message.success(`${action}成功`)
        loadData()
      } catch (error: any) {
        Message.error(error.message || `${action}失败`)
      }
    },
  })
}

const addSkuIsEdit = ref(false)
const editSkuId = ref('')

const addSkuModalVisible = ref(false)
const addSkuMainImageList = ref<any[]>([])
const addSkuSpecList = ref<any[]>([])
const addSkuSpecCounter = ref(0)
const addSkuForm = ref({
  skuId: '',
  spuId: '',
  spuName: '',
  categoryId: '',
  categoryName: '',
  unit: '个',
  skuCode: '',
  skuName: '',
  specInfo: '',
  mainImage: '',
  supplyPrice: undefined as number | undefined,
  salePrice: undefined as number | undefined,
})
const existingSkuSpecKeys = ref<string[]>([])

watchEffect(() => {
  addSkuSpecList.value.forEach(spec => {
    if (spec.isCustom && spec.name) {
      const attr = attrList.value.find(a => a.attrName === spec.name)
      if (attr) {
        spec.optionValues = attr.optionValues || []
      }
    }
  })
})

// 当选择的SPU变化时，自动加载已有SKU的规格维度
watch(
  () => addSkuForm.value.spuId,
  async (spuId) => {
    if (!spuId) {
      addSkuSpecList.value = []
      existingSkuSpecKeys.value = []
      return
    }
    
    const spu = spuList.value.find(s => s.spuId === spuId)
    if (!spu) return
    
    addSkuForm.value.spuName = spu.spuName
    addSkuForm.value.categoryId = spu.categoryId
    addSkuForm.value.categoryName = spu.categoryName || ''
    addSkuForm.value.unit = spu.unit || '个'
    
    // 编辑模式下不自动覆盖已填充的规格
    if (addSkuIsEdit.value) return
    
    // 自动继承已有SKU的规格维度
    try {
      const existingSkus = await getSkuListBySpu(spuId)
      if (existingSkus.length > 0) {
        const specKeys = new Set<string>()
        existingSkus.forEach((sku: Sku) => {
          if (sku.specs) {
            Object.keys(sku.specs).forEach(key => specKeys.add(key))
          }
        })
        existingSkuSpecKeys.value = Array.from(specKeys)
        addSkuSpecList.value = Array.from(specKeys).map((name, index) => ({
          key: `spec_${index}`,
          name,
          optionValues: [],
          selectedValue: '',
          isCustom: false,
        }))
      } else {
        existingSkuSpecKeys.value = []
        addSkuSpecList.value = []
      }
    } catch (error) {
      console.error('查询已有SKU失败:', error)
      existingSkuSpecKeys.value = []
      addSkuSpecList.value = []
    }
    
    addSkuSpecCounter.value = addSkuSpecList.value.length
  }
)

function openAddSkuModal() {
  addSkuIsEdit.value = false
  editSkuId.value = ''
  
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  const spuId = spuFilter?.value?.spuId || ''
  
  addSkuForm.value = {
    skuId: '',
    spuId,
    spuName: '',
    categoryId: '',
    categoryName: '',
    unit: '个',
    skuCode: `SKU-MANUAL-${timestamp}${random}`,
    skuName: '',
    specInfo: '',
    mainImage: '',
    supplyPrice: undefined,
    salePrice: undefined,
  }
  addSkuMainImageList.value = []
  addSkuSpecList.value = []
  existingSkuSpecKeys.value = []
  addSkuSpecCounter.value = 0
  
  addSkuModalVisible.value = true
}

function getAvailableAttrsForSku(spec: any) {
  const usedNames = addSkuSpecList.value
    .filter((s: any) => s.key !== spec.key && s.name)
    .map((s: any) => s.name)
  return attrList.value.filter((attr: any) => !usedNames.includes(attr.attrName))
}

function handleAddSkuCustomSpec() {
  addSkuSpecCounter.value++
  const key = `custom_${addSkuSpecCounter.value}`
  addSkuSpecList.value.push({
    key,
    name: '',
    optionValues: [],
    selectedValue: '',
    isCustom: true,
  })
}

function handleRemoveSkuSpec(spec: any) {
  const index = addSkuSpecList.value.findIndex(item => item.key === spec.key)
  if (index > -1) {
    addSkuSpecList.value.splice(index, 1)
  }
}

function handleAddSkuMainImageChange(fileList: any[]) {
  addSkuMainImageList.value = fileList
}

function parseSpecInfo(specInfo: string): Record<string, string> {
  if (!specInfo.trim()) {
    return { 规格: '标准款' }
  }
  
  const specs: Record<string, string> = {}
  const items = specInfo.split(/[、，,\s\n]+/).filter(s => s.trim())
  
  items.forEach((item, index) => {
    if (item.includes(':')) {
      const [key, value] = item.split(':')
      specs[key.trim()] = value.trim()
    } else if (item.includes('：')) {
      const [key, value] = item.split('：')
      specs[key.trim()] = value.trim()
    } else {
      specs[`规格${index + 1}`] = item.trim()
    }
  })
  
  return specs
}

async function handleAddSkuConfirm() {
  if (!addSkuForm.value.skuName) {
    Message.warning('请输入SKU名称')
    return
  }
  if (!addSkuForm.value.supplyPrice) {
    Message.warning('请输入供货价')
    return
  }
  if (!addSkuForm.value.salePrice) {
    Message.warning('请输入销售价')
    return
  }
  
  const specs: Record<string, string> = {}
  addSkuSpecList.value.forEach(spec => {
    const specKey = spec.name || spec.key
    if (specKey && spec.selectedValue) {
      specs[specKey] = spec.selectedValue
    }
  })
  
  if (Object.keys(specs).length === 0) {
    specs['规格'] = '标准款'
  }
  
  const mainImage = addSkuMainImageList.value[0]?.url || addSkuMainImageList.value[0]?.response || ''

  const submitData: any = {
    skuCode: addSkuForm.value.skuCode || ('SKU' + Date.now()),
    skuName: addSkuForm.value.skuName,
    spuId: addSkuForm.value.spuId,
    spuName: addSkuForm.value.spuName,
    categoryId: addSkuForm.value.categoryId || undefined,
    categoryName: addSkuForm.value.categoryName || undefined,
    specs,
    unit: addSkuForm.value.unit || '个',
    mainImage,
    supplyPrice: addSkuForm.value.supplyPrice,
    salePrice: addSkuForm.value.salePrice,
  }

  try {
    if (addSkuIsEdit.value && editSkuId.value) {
      await updateSku(editSkuId.value, submitData)
      addSkuModalVisible.value = false
      Message.success('SKU编辑成功')
    } else {
      await createSku(submitData)
      addSkuModalVisible.value = false
      Message.success('SKU新增成功')
    }
    loadData()
  } catch (error: any) {
    Message.error(error.message || (addSkuIsEdit.value ? '编辑SKU失败' : '新增SKU失败'))
  }
}

function handleDelete(record: Sku) {
  Modal.confirm({
    title: '确认删除',
    content: '确定要删除该SKU吗？删除后将无法恢复。',
    onOk: async () => {
      try {
        await deleteSku(record.skuId)
        Message.success('删除成功')
        loadData()
      } catch (error: any) {
        Message.error(error.message || '删除失败')
      }
    },
  })
}

function clearSpuFilter() {
  spuFilter.value = null
  searchForm.spuId = undefined
  pagination.current = 1
  loadData()
}
</script>

<style scoped lang="less">
.upload-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  color: #86909c;
}

.upload-text {
  font-size: 12px;
  margin-top: 4px;
}

.empty-spec-tip {
  padding: 20px 0;
}

.spec-form {
  .spec-item {
    position: relative;

    :deep(.arco-form-item-label) {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
    }
  }
}

.spec-label {
  font-size: 14px;
  font-weight: 500;
}

.delete-btn {
  margin-left: 8px;
  padding: 0 4px;
  color: var(--color-text-3);
  
  &:hover {
    color: #f53f3f;
  }
}
</style>
