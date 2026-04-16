<template>
  <div class="page-container">
    <PrdPanel :items="prdItems" />
    <a-card :bordered="false">
      <div class="category-layout">
        <div class="category-tree">
          <div class="tree-header">
            <span class="title">商品分类</span>
            <a-button type="primary" size="small" @click="handleAddRoot">
              <template #icon><icon-plus /></template>
              新增一级分类
            </a-button>
          </div>
          <a-input-search
            v-model="searchKeyword"
            placeholder="搜索分类名称"
            style="margin-bottom: 12px"
            allow-clear
          />
          <a-tree
            :data="filteredTreeData"
            :selected-keys="selectedKeys"
            :expanded-keys="expandedKeys"
            :field-names="{ key: 'categoryId', title: 'categoryName', children: 'children' }"
            draggable
            block-node
            @select="handleSelect"
            @drop="handleDrop"
          >
            <template #extra="nodeData">
              <span class="tree-node-actions">
                <a-button type="text" size="mini" @click.stop="handleAddChild(nodeData)">
                  <icon-plus />
                </a-button>
                <a-button type="text" size="mini" @click.stop="handleEdit(nodeData)">
                  <icon-edit />
                </a-button>
                <a-button type="text" size="mini" status="danger" @click.stop="handleDelete(nodeData)">
                  <icon-delete />
                </a-button>
              </span>
            </template>
          </a-tree>
        </div>
        <div class="category-content">
          <div v-if="selectedCategory" class="content-header">
            <span class="category-name">{{ selectedCategory.categoryName }}</span>
            <a-tag :color="selectedCategory.status === ProductCategoryStatus.ENABLED ? 'green' : 'red'">
              {{ selectedCategory.status === ProductCategoryStatus.ENABLED ? '启用' : '禁用' }}
            </a-tag>
          </div>
          <a-descriptions v-if="selectedCategory" :column="2" bordered>
            <a-descriptions-item label="分类ID">{{ selectedCategory.categoryId }}</a-descriptions-item>
            <a-descriptions-item label="分类名称">{{ selectedCategory.categoryName }}</a-descriptions-item>
            <a-descriptions-item label="上级分类">{{ selectedCategory.parentId ? getParentName(selectedCategory.parentId) : '无' }}</a-descriptions-item>
            <a-descriptions-item label="层级">第{{ selectedCategory.level }}级</a-descriptions-item>
            <a-descriptions-item label="排序号">{{ selectedCategory.sortOrder }}</a-descriptions-item>
            <a-descriptions-item label="状态">
              <a-tag :color="selectedCategory.status === ProductCategoryStatus.ENABLED ? 'green' : 'red'">
                {{ selectedCategory.status === ProductCategoryStatus.ENABLED ? '启用' : '禁用' }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="SPU数量">
              <a-button type="text" size="small" @click="goToSpuList(selectedCategory)">
                <span class="link-count">{{ selectedCategory.spuCount || 0 }}</span>
                <icon-right style="margin-left: 4px" />
              </a-button>
            </a-descriptions-item>
            <a-descriptions-item label="SKU数量">
              <a-button type="text" size="small" @click="goToSkuList(selectedCategory)">
                <span class="link-count">{{ selectedCategory.skuCount || 0 }}</span>
                <icon-right style="margin-left: 4px" />
              </a-button>
            </a-descriptions-item>
            <a-descriptions-item label="创建时间">{{ selectedCategory.createdAt }}</a-descriptions-item>
            <a-descriptions-item label="更新时间">{{ selectedCategory.updatedAt }}</a-descriptions-item>
          </a-descriptions>
          <a-empty v-else description="请选择左侧分类查看详情" />
        </div>
      </div>
    </a-card>

    <CategoryFormDrawer
      v-model:visible="formVisible"
      :category="editingCategory"
      :parent-id="parentId"
      :category-list="categoryList"
      @success="handleFormSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Message, Modal } from '@arco-design/web-vue'
import { ProductCategoryStatus } from '@gongchengcang/types'
import type { ProductCategory } from '@gongchengcang/types'
import { getCategoryTree, deleteCategory, updateCategory } from '@gongchengcang/api'
import CategoryFormDrawer from './components/CategoryFormDrawer.vue'
import PrdPanel from '@/components/PrdPanel/index.vue'

const prdItems = [
  {
    title: '1. 功能设计说明',
    content: `
采用 **左树右详情** 布局

- 左侧：分类树（最多支持 3 级），支持拖拽调整层级
- 右侧：当前选中分类的属性列表详情

分类等级限制：最多 3 级，超过则不允许新增子分类
    `
  },
  {
    title: '2. 树节点交互',
    content: `
| 操作 | 触发方式 | 说明 |
|------|---------|------|
| 新增一级分类 | 顶部按钮 | 创建根节点 |
| 新增子分类 | 节点 + 按钮 | 最多到 3 级 |
| 编辑分类 | 节点 编辑 按钮 | 修改名称/排序/状态 |
| 删除分类 | 节点 删除 按钮 | 有子分类则级联删除 |
| 拖拽排序 | 节点拖拽 | 可调整同级排序或移动层级 |

删除前置校验：该分类下无商品才能删除
    `
  },
  {
    title: '3. 分类字段定义',
    content: `
| 字段名 | 组件 | 必填 | 长度限制 | 验证规则 |
|--------|------|------|----------|----------|
| 分类名称 | Input | ✅ 是 | 最多 50 字符 | 非空 |
| 分类编码 | Input | ✅ 是 | 最多 32 字符 | 字母/数字/下划线 |
| 排序值 | InputNumber | ❌ 否 | 0-99999 | 数字越大越靠前 |
| 状态 | Switch | - | - | 启用/禁用 |
    `
  },
  {
    title: '4. 属性关联功能',
    content: `
每个分类可以绑定一组规格属性：
- 绑定后，该分类下所有商品自动继承这些属性
- 绑定的属性用于自动生成 SKU 规格组合
- 解绑属性需要二次确认（影响已有商品）
    `
  },
  {
    title: '5. 权限矩阵',
    content: `
| 功能点 | 超管 | 商品运营 | 供应商 | 只读 |
|--------|------|---------|--------|------|
| 查看分类树 | ✅ | ✅ | ✅ | ✅ |
| 新增分类 | ✅ | ✅ | ❌ | ❌ |
| 编辑分类 | ✅ | ✅ | ❌ | ❌ |
| 删除分类 | ✅ | ❌ | ❌ | ❌ |
| 拖拽调整 | ✅ | ✅ | ❌ | ❌ |
| 绑定属性 | ✅ | ✅ | ❌ | ❌ |
    `
  }
]

const router = useRouter()
const treeData = ref<ProductCategory[]>([])
const categoryList = ref<ProductCategory[]>([])
const selectedKeys = ref<string[]>([])
const expandedKeys = ref<string[]>([])
const selectedCategory = ref<ProductCategory | null>(null)
const searchKeyword = ref('')
const formVisible = ref(false)
const editingCategory = ref<ProductCategory | null>(null)
const parentId = ref<string | undefined>(undefined)

const filteredTreeData = computed(() => {
  if (!searchKeyword.value) {
    return treeData.value
  }
  return filterTree(treeData.value, searchKeyword.value.toLowerCase())
})

function filterTree(data: ProductCategory[], keyword: string): ProductCategory[] {
  const result: ProductCategory[] = []
  data.forEach(item => {
    if (item.categoryName.toLowerCase().includes(keyword)) {
      result.push(item)
    } else if (item.children && item.children.length > 0) {
      const filteredChildren = filterTree(item.children, keyword)
      if (filteredChildren.length > 0) {
        result.push({ ...item, children: filteredChildren })
      }
    }
  })
  return result
}

onMounted(() => {
  loadTreeData()
})

async function loadTreeData() {
  try {
    const data = await getCategoryTree()
    treeData.value = data
    categoryList.value = flattenTree(data)
    if (data.length > 0) {
      expandedKeys.value = [data[0].categoryId]
    }
  } catch (error) {
    console.error('加载分类树失败:', error)
  }
}

function flattenTree(data: ProductCategory[]): ProductCategory[] {
  const result: ProductCategory[] = []
  function flatten(items: ProductCategory[]) {
    items.forEach(item => {
      result.push(item)
      if (item.children) {
        flatten(item.children)
      }
    })
  }
  flatten(data)
  return result
}

function handleSelect(keys: string[]) {
  selectedKeys.value = keys
  if (keys.length > 0) {
    const category = categoryList.value.find(c => c.categoryId === keys[0])
    selectedCategory.value = category || null
  } else {
    selectedCategory.value = null
  }
}

function getParentName(parentId: string): string {
  const parent = categoryList.value.find(c => c.categoryId === parentId)
  return parent?.categoryName || '未知'
}

function handleAddRoot() {
  editingCategory.value = null
  parentId.value = undefined
  formVisible.value = true
}

function handleAddChild(nodeData: ProductCategory) {
  editingCategory.value = null
  parentId.value = nodeData.categoryId
  formVisible.value = true
}

function handleEdit(nodeData: ProductCategory) {
  editingCategory.value = nodeData
  parentId.value = nodeData.parentId
  formVisible.value = true
}

function handleDelete(nodeData: ProductCategory) {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除分类「${nodeData.categoryName}」吗？`,
    onOk: async () => {
      try {
        await deleteCategory(nodeData.categoryId)
        Message.success('删除成功')
        if (selectedCategory.value?.categoryId === nodeData.categoryId) {
          selectedCategory.value = null
          selectedKeys.value = []
        }
        loadTreeData()
      } catch (error: any) {
        Message.error(error.message || '删除失败')
      }
    },
  })
}

async function handleDrop({ dragNode, dropNode, dropPosition }: { dragNode: ProductCategory; dropNode: ProductCategory; dropPosition: number }) {
  if (dragNode.categoryId === dropNode.categoryId) {
    return
  }

  const dragId = dragNode.categoryId
  const dropId = dropNode.categoryId

  const dragItem = categoryList.value.find(c => c.categoryId === dragId)
  const dropItem = categoryList.value.find(c => c.categoryId === dropId)

  if (!dragItem || !dropItem) return

  let newParentId: string | undefined
  let newLevel: number
  let newSortOrder: number

  if (dropPosition === 0) {
    newParentId = dropId
    newLevel = dropItem.level + 1
    newSortOrder = 0
  } else {
    newParentId = dropItem.parentId
    newLevel = dropItem.level
    const siblings = categoryList.value.filter(c => c.parentId === newParentId)
    const dropIndex = siblings.findIndex(s => s.categoryId === dropId)
    newSortOrder = dropPosition < 0 ? dropIndex : dropIndex + 1
  }

  if (newLevel > 3) {
    Message.warning('分类层级不能超过3级')
    return
  }

  try {
    await updateCategory(dragId, {
      parentId: newParentId,
      level: newLevel,
      sortOrder: newSortOrder,
    })
    Message.success('移动成功')
    loadTreeData()
  } catch (error: any) {
    Message.error(error.message || '移动失败')
  }
}

function goToSpuList(category: ProductCategory) {
  router.push({
    path: '/product/spu',
    query: { categoryId: category.categoryId },
  })
}

function goToSkuList(category: ProductCategory) {
  router.push({
    path: '/product/sku',
    query: { categoryId: category.categoryId },
  })
}

function handleFormSuccess() {
  loadTreeData()
}
</script>

<style scoped>
.category-layout {
  display: flex;
  gap: 16px;
  min-height: 600px;
}

.category-tree {
  width: 320px;
  flex-shrink: 0;
  border-right: 1px solid var(--color-border);
  padding-right: 16px;
}

.tree-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.tree-header .title {
  font-size: 16px;
  font-weight: 500;
}

.tree-node-actions {
  display: none;
}

:deep(.arco-tree-node:hover) .tree-node-actions {
  display: inline-flex;
  gap: 4px;
}

.category-content {
  flex: 1;
  padding-left: 16px;
}

.content-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.category-name {
  font-size: 18px;
  font-weight: 500;
}

.link-count {
  color: rgb(var(--primary-6));
  font-weight: 500;
}

.link-count:hover {
  text-decoration: underline;
}
</style>
