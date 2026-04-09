<template>
  <div class="warehouse-product">
    <a-layout class="product-layout">
      <a-layout-sider :width="220" class="category-sider">
        <a-card title="商品分类" :bordered="false">
          <a-tree
            :data="categoryTree"
            :selected-keys="selectedCategoryKeys"
            @select="handleCategorySelect"
            :field-names="{ key: 'id', title: 'name', children: 'children' }"
          >
            <template #title="node">
              <span class="tree-node-title">
                <span>{{ node.name }}</span>
                <span class="tree-node-count">({{ node.count || 0 }})</span>
              </span>
            </template>
          </a-tree>
        </a-card>
      </a-layout-sider>
      <a-layout-content class="product-content">
        <a-card>
          <template #extra>
            <a-space>
              <a-radio-group v-model="viewMode" type="button" size="small">
                <a-radio value="sku">SKU</a-radio>
                <a-radio value="spu">SPU</a-radio>
              </a-radio-group>
              <a-button @click="handleSync">
                <template #icon><icon-sync /></template>
                同步采购商品
              </a-button>
            </a-space>
          </template>

          <a-tabs v-model:active-key="activeTab">
            <a-tab-pane key="all" title="全部商品" />
            <a-tab-pane key="online" title="已上架" />
            <a-tab-pane key="offline" title="已下架" />
          </a-tabs>

          <a-table :data="filteredProducts" :pagination="pagination">
            <template #columns>
              <a-table-column title="商品编码" data-index="productCode" :width="120" />
              <a-table-column title="商品名称" :width="200">
                <template #cell="{ record }">
                  <a-link @click="handleViewDetail(record)">{{ record.productName }}</a-link>
                </template>
              </a-table-column>
              <a-table-column title="规格" data-index="spec" :width="120" />
              <a-table-column title="分类" data-index="categoryName" :width="120" />
              <a-table-column title="来源供应商" data-index="supplierName" :width="150" />
              <a-table-column title="成本价" :width="100" align="right">
                <template #cell="{ record }">
                  <span class="cost-price">¥{{ record.costPrice }}</span>
                </template>
              </a-table-column>
              <a-table-column title="销售价" :width="100" align="right">
                <template #cell="{ record }">
                  <span class="sale-price">¥{{ record.salePrice }}</span>
                </template>
              </a-table-column>
              <a-table-column title="毛利率" :width="80" align="right">
                <template #cell="{ record }">
                  <span :class="record.profitMargin >= 0 ? 'profit' : 'loss'">
                    {{ record.profitMargin }}%
                  </span>
                </template>
              </a-table-column>
              <a-table-column title="库存" data-index="stock" :width="80" align="center" />
              <a-table-column title="上架状态" :width="100">
                <template #cell="{ record }">
                  <a-switch v-model="record.isOnline" @change="handleStatusChange(record)" />
                </template>
              </a-table-column>
              <a-table-column title="操作" :width="100" fixed="right">
                <template #cell="{ record }">
                  <a-space>
                    <a-link @click="handleViewDetail(record)">详情</a-link>
                  </a-space>
                </template>
              </a-table-column>
            </template>
          </a-table>
        </a-card>
      </a-layout-content>
    </a-layout>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'

const router = useRouter()
const activeTab = ref('all')
const viewMode = ref('sku')
const selectedCategoryKeys = ref<string[]>([])

const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 50,
})

const products = ref([
  { id: '1', productCode: 'SKU-SN-001', productName: '水泥 P.O 42.5', spec: '50kg/袋', categoryId: 'cement-pc', categoryName: '普通硅酸盐水泥', supplierName: '广东建材有限公司', costPrice: 420, salePrice: 450, profitMargin: 7.14, stock: 500, isOnline: true },
  { id: '2', productCode: 'SKU-SN-002', productName: '水泥 P.C 32.5', spec: '50kg/袋', categoryId: 'cement-po', categoryName: '复合硅酸盐水泥', supplierName: '广东建材有限公司', costPrice: 380, salePrice: 400, profitMargin: 5.26, stock: 300, isOnline: true },
  { id: '3', productCode: 'SKU-LG-001', productName: '螺纹钢 HRB400 16mm', spec: '16mm', categoryId: 'steel-rebar', categoryName: '螺纹钢', supplierName: '上海钢材集团', costPrice: 4100, salePrice: 4280, profitMargin: 4.39, stock: 200, isOnline: true },
  { id: '4', productCode: 'SKU-LG-002', productName: '螺纹钢 HRB400 20mm', spec: '20mm', categoryId: 'steel-rebar', categoryName: '螺纹钢', supplierName: '上海钢材集团', costPrice: 4050, salePrice: 4200, profitMargin: 3.70, stock: 150, isOnline: true },
  { id: '5', productCode: 'SKU-XC-001', productName: '线材 Q235 6.5mm', spec: '6.5mm', categoryId: 'steel-wire', categoryName: '线材', supplierName: '上海钢材集团', costPrice: 3900, salePrice: 4050, profitMargin: 3.85, stock: 180, isOnline: true },
  { id: '6', productCode: 'SKU-HS-001', productName: '黄砂 中砂', spec: '中砂', categoryId: 'sand-yellow', categoryName: '黄砂', supplierName: '惠州砂石厂', costPrice: 85, salePrice: 95, profitMargin: 11.76, stock: 1000, isOnline: false },
  { id: '7', productCode: 'SKU-SS-001', productName: '碎石 5-31.5mm', spec: '5-31.5mm', categoryId: 'sand-stone', categoryName: '碎石', supplierName: '惠州砂石厂', costPrice: 65, salePrice: 75, profitMargin: 15.38, stock: 800, isOnline: true },
  { id: '8', productCode: 'SKU-HNT-001', productName: '商品混凝土 C30', spec: 'C30', categoryId: 'concrete-c30', categoryName: 'C30混凝土', supplierName: '深圳混凝土公司', costPrice: 380, salePrice: 420, profitMargin: 10.53, stock: 0, isOnline: false },
  { id: '9', productCode: 'SKU-HNT-002', productName: '商品混凝土 C40', spec: 'C40', categoryId: 'concrete-c40', categoryName: 'C40混凝土', supplierName: '深圳混凝土公司', costPrice: 420, salePrice: 465, profitMargin: 10.71, stock: 0, isOnline: false },
  { id: '10', productCode: 'SKU-HNT-003', productName: '商品混凝土 C50', spec: 'C50', categoryId: 'concrete-c40', categoryName: 'C40混凝土', supplierName: '深圳混凝土公司', costPrice: 480, salePrice: 530, profitMargin: 10.42, stock: 50, isOnline: true },
])

function countProductsByCategory(categoryId: string): number {
  return products.value.filter(p => p.categoryId === categoryId).length
}

function countProductsByParentCategory(categoryIds: string[]): number {
  return products.value.filter(p => categoryIds.includes(p.categoryId)).length
}

const categoryTree = computed(() => {
  const cementChildren = [
    { id: 'cement-pc', name: '普通硅酸盐水泥', count: countProductsByCategory('cement-pc') },
    { id: 'cement-po', name: '复合硅酸盐水泥', count: countProductsByCategory('cement-po') },
  ]
  
  const steelChildren = [
    { id: 'steel-rebar', name: '螺纹钢', count: countProductsByCategory('steel-rebar') },
    { id: 'steel-wire', name: '线材', count: countProductsByCategory('steel-wire') },
  ]
  
  const sandChildren = [
    { id: 'sand-yellow', name: '黄砂', count: countProductsByCategory('sand-yellow') },
    { id: 'sand-stone', name: '碎石', count: countProductsByCategory('sand-stone') },
  ]
  
  const concreteChildren = [
    { id: 'concrete-c30', name: 'C30混凝土', count: countProductsByCategory('concrete-c30') },
    { id: 'concrete-c40', name: 'C40混凝土', count: countProductsByCategory('concrete-c40') },
  ]
  
  return [
    {
      id: 'all',
      name: '全部分类',
      count: products.value.length,
      children: [
        {
          id: 'cement',
          name: '水泥',
          count: cementChildren.reduce((sum, c) => sum + c.count, 0),
          children: cementChildren,
        },
        {
          id: 'steel',
          name: '钢材',
          count: steelChildren.reduce((sum, c) => sum + c.count, 0),
          children: steelChildren,
        },
        {
          id: 'sand',
          name: '砂石',
          count: sandChildren.reduce((sum, c) => sum + c.count, 0),
          children: sandChildren,
        },
        {
          id: 'concrete',
          name: '混凝土',
          count: concreteChildren.reduce((sum, c) => sum + c.count, 0),
          children: concreteChildren,
        },
      ],
    },
  ]
})

const filteredProducts = computed(() => {
  let result = products.value
  
  if (selectedCategoryKeys.value.length > 0 && selectedCategoryKeys.value[0] !== 'all') {
    const categoryId = selectedCategoryKeys.value[0]
    const categoryIds = getAllChildCategoryIds(categoryId)
    result = result.filter(p => categoryIds.includes(p.categoryId))
  }
  
  if (activeTab.value === 'online') {
    result = result.filter(p => p.isOnline)
  } else if (activeTab.value === 'offline') {
    result = result.filter(p => !p.isOnline)
  }
  
  return result
})

function getAllChildCategoryIds(categoryId: string): string[] {
  const findChildren = (items: any[]): string[] => {
    for (const item of items) {
      if (item.id === categoryId) {
        if (item.children && item.children.length > 0) {
          return getChildIds(item.children)
        }
        return [categoryId]
      }
      if (item.children) {
        const result = findChildren(item.children)
        if (result.length > 0) return result
      }
    }
    return [categoryId]
  }
  return findChildren(categoryTree.value)
}

function getChildIds(items: any[]): string[] {
  let ids: string[] = []
  for (const item of items) {
    if (item.children && item.children.length > 0) {
      ids = ids.concat(getChildIds(item.children))
    } else {
      ids.push(item.id)
    }
  }
  return ids
}

function handleCategorySelect(keys: string[]) {
  selectedCategoryKeys.value = keys
}

function handleSync() {
  Message.success('同步采购商品成功')
}

function handleStatusChange(record: any) {
  Message.success(`${record.productName} ${record.isOnline ? '已上架' : '已下架'}`)
}

function handleViewDetail(record: any) {
  router.push(`/warehouse/product/detail/${record.id}`)
}
</script>

<style scoped lang="less">
.warehouse-product {
  padding: 16px;
  height: calc(100vh - 120px);
}

.product-layout {
  height: 100%;
  background: transparent;
}

.category-sider {
  background: var(--color-bg-1);
  margin-right: 16px;
  border-radius: 4px;
  overflow: auto;
}

.product-content {
  background: transparent;
}

.tree-node-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.tree-node-count {
  color: var(--color-text-3);
  font-size: 12px;
  margin-left: 4px;
}

.cost-price {
  color: #f53f3f;
  font-weight: 500;
}

.sale-price {
  color: #165dff;
  font-weight: 500;
}

.profit {
  color: #00b42a;
  font-weight: 500;
}

.loss {
  color: #f53f3f;
  font-weight: 500;
}
</style>
