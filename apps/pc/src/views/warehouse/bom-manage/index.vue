<template>
  <div class="warehouse-bom-manage">
    <a-card>
      <template #title>
        <span>BOM包管理</span>
      </template>
      <template #extra>
        <a-space>
          <a-button @click="handleAddPlatformBom">
            <template #icon><icon-plus /></template>
            添加平台BOM包
          </a-button>
          <a-button type="primary" @click="handleCreateBom">
            <template #icon><icon-plus /></template>
            创建BOM包
          </a-button>
        </a-space>
      </template>

      <a-tabs v-model:active-key="activeTab">
        <a-tab-pane key="all" title="全部" />
        <a-tab-pane key="platform" title="平台BOM包" />
        <a-tab-pane key="custom" title="自建BOM包" />
        <a-tab-pane key="online" title="已上架市场" />
      </a-tabs>

      <a-table :data="filteredBomList" :pagination="pagination" class="mt-16">
        <template #columns>
          <a-table-column title="BOM包信息" :width="280">
            <template #cell="{ record }">
              <div class="bom-info">
                <img :src="record.image" class="bom-image" />
                <div class="bom-detail">
                  <div class="bom-name">
                    {{ record.name }}
                    <a-tag v-if="record.source === 'platform'" color="blue" size="small">平台</a-tag>
                    <a-tag v-else color="green" size="small">自建</a-tag>
                  </div>
                  <div class="bom-category">{{ record.categoryName }}</div>
                </div>
              </div>
            </template>
          </a-table-column>
          <a-table-column title="SKU数量" :width="100" align="center">
            <template #cell="{ record }">
              <span class="sku-count">{{ record.skuCount }} 种</span>
            </template>
          </a-table-column>
          <a-table-column title="采购价" :width="120" align="right">
            <template #cell="{ record }">
              <span class="price">¥{{ record.purchasePrice }}</span>
            </template>
          </a-table-column>
          <a-table-column title="销售价" :width="120" align="right">
            <template #cell="{ record }">
              <span class="sale-price">¥{{ record.salePrice || '-' }}</span>
            </template>
          </a-table-column>
          <a-table-column title="库存" :width="100" align="center">
            <template #cell="{ record }">
              <span :class="record.stock < 10 ? 'low-stock' : ''">{{ record.stock }}</span>
            </template>
          </a-table-column>
          <a-table-column title="施工方市场" :width="120">
            <template #cell="{ record }">
              <a-switch 
                v-model="record.isOnlineToConstruction" 
                @change="handleOnlineChange(record)"
              />
            </template>
          </a-table-column>
          <a-table-column title="状态" :width="100">
            <template #cell="{ record }">
              <a-tag :color="record.status === 'active' ? 'green' : 'gray'">
                {{ record.status === 'active' ? '启用' : '停用' }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="操作" :width="200" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-link @click="handleView(record)">查看</a-link>
                <a-link @click="handleEdit(record)">编辑</a-link>
                <a-link v-if="record.source === 'platform'" @click="handleSync(record)">同步</a-link>
                <a-link @click="handleConfigPrice(record)">定价</a-link>
                <a-popconfirm content="确定删除该BOM包吗？" @ok="handleDelete(record)">
                  <a-link status="danger">删除</a-link>
                </a-popconfirm>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <a-modal 
      v-model:visible="platformBomModalVisible" 
      title="添加平台BOM包" 
      :width="900"
      @ok="handleAddConfirm"
    >
      <a-form :model="searchForm" layout="inline" class="search-form">
        <a-form-item label="BOM名称">
          <a-input v-model="searchForm.keyword" placeholder="搜索BOM名称" allow-clear style="width: 200px" />
        </a-form-item>
        <a-form-item label="分类">
          <a-select v-model="searchForm.category" placeholder="全部" allow-clear style="width: 150px">
            <a-option value="hydropower">水电工程</a-option>
            <a-option value="waterproof">防水工程</a-option>
            <a-option value="carpentry">木工工程</a-option>
            <a-option value="paint">油漆工程</a-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="handleSearchPlatform">搜索</a-button>
        </a-form-item>
      </a-form>

      <a-table 
        :data="platformBomList" 
        :pagination="platformPagination"
        :row-selection="platformRowSelection"
        v-model:selectedKeys="selectedPlatformBomIds"
        class="mt-16"
      >
        <template #columns>
          <a-table-column title="BOM包信息" :width="280">
            <template #cell="{ record }">
              <div class="bom-info">
                <img :src="record.image" class="bom-image" />
                <div class="bom-detail">
                  <div class="bom-name">{{ record.name }}</div>
                  <div class="bom-category">{{ record.categoryName }}</div>
                </div>
              </div>
            </template>
          </a-table-column>
          <a-table-column title="SKU数量" :width="100" align="center">
            <template #cell="{ record }">
              {{ record.skuCount }} 种
            </template>
          </a-table-column>
          <a-table-column title="平台售价" :width="120" align="right">
            <template #cell="{ record }">
              <span class="price">¥{{ record.price }}</span>
            </template>
          </a-table-column>
          <a-table-column title="供应商策略" :width="120">
            <template #cell="{ record }">
              <a-tag :color="getStrategyColor(record.strategy)">{{ getStrategyText(record.strategy) }}</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="状态" :width="100">
            <template #cell="{ record }">
              <a-tag v-if="record.isAdded" color="gray">已添加</a-tag>
              <a-tag v-else color="green">可添加</a-tag>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-modal>

    <a-modal 
      v-model:visible="priceModalVisible" 
      title="BOM包定价" 
      :width="600"
      @ok="handlePriceConfirm"
    >
      <div class="price-header">
        <div class="bom-summary">
          <img :src="currentBom?.image" class="bom-image" />
          <div class="bom-info">
            <div class="bom-name">{{ currentBom?.name }}</div>
            <div class="bom-meta">
              <span>{{ currentBom?.skuCount }}种SKU</span>
              <span>采购价：¥{{ currentBom?.purchasePrice }}</span>
            </div>
          </div>
        </div>
      </div>

      <a-divider />

      <a-form :model="priceForm" layout="vertical">
        <a-form-item label="销售价" required>
          <a-input-number v-model="priceForm.salePrice" :min="0" :precision="2" style="width: 200px">
            <template #prefix>¥</template>
          </a-input-number>
          <span class="price-hint">建议售价：¥{{ suggestedPrice }}</span>
        </a-form-item>
        <a-form-item label="利润率">
          <span class="profit-rate">{{ profitRate }}%</span>
        </a-form-item>
        <a-form-item label="上架到施工方市场">
          <a-switch v-model="priceForm.isOnlineToConstruction" />
          <span class="config-hint">上架后，施工方可在市场购买该BOM包</span>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Message } from '@arco-design/web-vue'

const activeTab = ref('all')

const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 50,
})

const searchForm = ref({
  keyword: '',
  category: '',
})

const bomList = ref([
  {
    id: '1',
    name: '水电材料标准包',
    image: 'https://picsum.photos/100/100?random=1',
    categoryName: '水电工程',
    source: 'platform',
    skuCount: 12,
    purchasePrice: 3280,
    salePrice: 3580,
    stock: 25,
    isOnlineToConstruction: true,
    status: 'active',
    strategy: 'smart',
  },
  {
    id: '2',
    name: '防水涂料套餐',
    image: 'https://picsum.photos/100/100?random=2',
    categoryName: '防水工程',
    source: 'platform',
    skuCount: 5,
    purchasePrice: 1850,
    salePrice: 2100,
    stock: 18,
    isOnlineToConstruction: true,
    status: 'active',
    strategy: 'single',
  },
  {
    id: '3',
    name: '木工基础包',
    image: 'https://picsum.photos/100/100?random=3',
    categoryName: '木工工程',
    source: 'custom',
    skuCount: 8,
    purchasePrice: 4500,
    salePrice: 5200,
    stock: 8,
    isOnlineToConstruction: false,
    status: 'active',
    strategy: 'sku',
  },
  {
    id: '4',
    name: '油漆涂装套餐',
    image: 'https://picsum.photos/100/100?random=4',
    categoryName: '油漆工程',
    source: 'custom',
    skuCount: 6,
    purchasePrice: 2200,
    salePrice: null,
    stock: 15,
    isOnlineToConstruction: false,
    status: 'inactive',
    strategy: 'smart',
  },
])

const filteredBomList = computed(() => {
  let list = bomList.value
  if (activeTab.value === 'platform') {
    list = list.filter(item => item.source === 'platform')
  } else if (activeTab.value === 'custom') {
    list = list.filter(item => item.source === 'custom')
  } else if (activeTab.value === 'online') {
    list = list.filter(item => item.isOnlineToConstruction)
  }
  return list
})

const platformBomModalVisible = ref(false)
const selectedPlatformBomIds = ref<string[]>([])
const platformPagination = ref({
  current: 1,
  pageSize: 5,
  total: 20,
})

const platformRowSelection = computed(() => ({
  type: 'checkbox' as const,
  showCheckedAll: true,
}))

const platformBomList = ref([
  {
    id: 'p1',
    name: '水电材料标准包',
    image: 'https://picsum.photos/100/100?random=11',
    categoryName: '水电工程',
    skuCount: 12,
    price: 3280,
    strategy: 'smart',
    isAdded: true,
  },
  {
    id: 'p2',
    name: '防水涂料套餐',
    image: 'https://picsum.photos/100/100?random=12',
    categoryName: '防水工程',
    skuCount: 5,
    price: 1850,
    strategy: 'single',
    isAdded: true,
  },
  {
    id: 'p3',
    name: '瓷砖铺贴包',
    image: 'https://picsum.photos/100/100?random=13',
    categoryName: '泥瓦工程',
    skuCount: 10,
    price: 5800,
    strategy: 'single',
    isAdded: false,
  },
  {
    id: 'p4',
    name: '电气安装包',
    image: 'https://picsum.photos/100/100?random=14',
    categoryName: '电气工程',
    skuCount: 15,
    price: 4200,
    strategy: 'smart',
    isAdded: false,
  },
])

const priceModalVisible = ref(false)
const currentBom = ref<any>(null)
const priceForm = ref({
  salePrice: 0,
  isOnlineToConstruction: false,
})

const suggestedPrice = computed(() => {
  if (!currentBom.value) return 0
  return (currentBom.value.purchasePrice * 1.15).toFixed(2)
})

const profitRate = computed(() => {
  if (!currentBom.value || !priceForm.value.salePrice) return 0
  return (((priceForm.value.salePrice - currentBom.value.purchasePrice) / currentBom.value.purchasePrice) * 100).toFixed(1)
})

function getStrategyColor(strategy: string) {
  const colors: Record<string, string> = {
    smart: 'blue',
    single: 'green',
    sku: 'purple',
  }
  return colors[strategy] || 'gray'
}

function getStrategyText(strategy: string) {
  const texts: Record<string, string> = {
    smart: '智能分配',
    single: '单一供应商',
    sku: 'SKU级指定',
  }
  return texts[strategy] || strategy
}

function handleAddPlatformBom() {
  selectedPlatformBomIds.value = []
  platformBomModalVisible.value = true
}

function handleSearchPlatform() {
  Message.info('搜索平台BOM包')
}

function handleAddConfirm() {
  if (selectedPlatformBomIds.value.length === 0) {
    Message.warning('请选择要添加的BOM包')
    return
  }
  
  const newBoms = platformBomList.value
    .filter(b => selectedPlatformBomIds.value.includes(b.id) && !b.isAdded)
    .map(b => ({
      id: `new_${b.id}`,
      name: b.name,
      image: b.image,
      categoryName: b.categoryName,
      source: 'platform',
      skuCount: b.skuCount,
      purchasePrice: b.price,
      salePrice: null,
      stock: 0,
      isOnlineToConstruction: false,
      status: 'active',
      strategy: b.strategy,
    }))
  
  if (newBoms.length > 0) {
    bomList.value.push(...newBoms)
    Message.success(`成功添加 ${newBoms.length} 个BOM包`)
  } else {
    Message.warning('所选BOM包已添加')
  }
  
  platformBomModalVisible.value = false
}

function handleCreateBom() {
  Message.info('跳转到创建BOM包页面')
}

function handleView(record: any) {
  Message.info(`查看BOM包：${record.name}`)
}

function handleEdit(record: any) {
  Message.info(`编辑BOM包：${record.name}`)
}

function handleSync(record: any) {
  Message.success(`已同步平台最新数据`)
}

function handleConfigPrice(record: any) {
  currentBom.value = record
  priceForm.value = {
    salePrice: record.salePrice || 0,
    isOnlineToConstruction: record.isOnlineToConstruction,
  }
  priceModalVisible.value = true
}

function handlePriceConfirm() {
  if (!priceForm.value.salePrice) {
    Message.warning('请输入销售价')
    return
  }
  
  currentBom.value.salePrice = priceForm.value.salePrice
  currentBom.value.isOnlineToConstruction = priceForm.value.isOnlineToConstruction
  
  Message.success('定价设置成功')
  priceModalVisible.value = false
}

function handleDelete(record: any) {
  const index = bomList.value.findIndex(item => item.id === record.id)
  if (index > -1) {
    bomList.value.splice(index, 1)
    Message.success('删除成功')
  }
}

function handleOnlineChange(record: any) {
  if (record.isOnlineToConstruction) {
    if (!record.salePrice) {
      Message.warning('请先设置销售价')
      record.isOnlineToConstruction = false
      return
    }
    Message.success('已上架到施工方市场')
  } else {
    Message.success('已从施工方市场下架')
  }
}
</script>

<style scoped lang="less">
.warehouse-bom-manage {
  padding: 16px;
}

.mt-16 {
  margin-top: 16px;
}

.bom-info {
  display: flex;
  align-items: center;
}

.bom-image {
  width: 50px;
  height: 50px;
  border-radius: 6px;
  object-fit: cover;
  flex-shrink: 0;
}

.bom-detail {
  margin-left: 10px;
}

.bom-name {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.bom-category {
  font-size: 12px;
  color: var(--color-text-3);
}

.sku-count {
  color: #165dff;
  font-weight: 500;
}

.price {
  color: #f53f3f;
  font-weight: 500;
}

.sale-price {
  color: #165dff;
  font-weight: 600;
}

.low-stock {
  color: #f53f3f;
  font-weight: 500;
}

.search-form {
  margin-bottom: 0;
}

.price-header {
  .bom-summary {
    display: flex;
    align-items: center;
    
    .bom-image {
      width: 60px;
      height: 60px;
      border-radius: 8px;
    }
    
    .bom-info {
      margin-left: 12px;
      
      .bom-name {
        font-size: 16px;
        font-weight: 500;
      }
      
      .bom-meta {
        font-size: 12px;
        color: var(--color-text-3);
        margin-top: 4px;
        
        span {
          margin-right: 12px;
        }
      }
    }
  }
}

.price-hint {
  font-size: 12px;
  color: var(--color-text-3);
  margin-left: 12px;
}

.profit-rate {
  font-size: 16px;
  font-weight: 600;
  color: #165dff;
}

.config-hint {
  font-size: 12px;
  color: var(--color-text-3);
  margin-left: 8px;
}
</style>
