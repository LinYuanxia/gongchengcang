<template>
  <div class="bom-list">
    <a-card>
      <template #extra>
        <a-space>
          <a-button type="primary" @click="handleCreate">
            <template #icon><icon-plus /></template>
            创建BOM包
          </a-button>
        </a-space>
      </template>

      <a-form :model="searchForm" layout="inline" class="search-form">
        <a-form-item label="BOM名称">
          <a-input v-model="searchForm.name" placeholder="请输入BOM名称" allow-clear style="width: 200px" />
        </a-form-item>
        <a-form-item label="状态">
          <a-select v-model="searchForm.status" placeholder="全部" allow-clear style="width: 120px">
            <a-option value="draft">草稿</a-option>
            <a-option value="pending">待审核</a-option>
            <a-option value="approved">已通过</a-option>
            <a-option value="rejected">已驳回</a-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="handleSearch">查询</a-button>
        </a-form-item>
      </a-form>

      <a-tabs v-model:active-key="activeTab" style="margin-top: 16px">
        <a-tab-pane key="all" title="全部" />
        <a-tab-pane key="draft" title="草稿" />
        <a-tab-pane key="pending" title="待审核" />
        <a-tab-pane key="approved" title="已通过" />
        <a-tab-pane key="online" title="已上架" />
      </a-tabs>

      <a-table :data="filteredBomList" :pagination="pagination" class="mt-16">
        <template #columns>
          <a-table-column title="BOM包信息" :width="280">
            <template #cell="{ record }">
              <div class="bom-info">
                <img :src="record.image" class="bom-image" />
                <div class="bom-detail">
                  <div class="bom-name">{{ record.name }}</div>
                </div>
              </div>
            </template>
          </a-table-column>
          <a-table-column title="SKU数量" :width="100" align="center">
            <template #cell="{ record }">
              <span class="sku-count">{{ record.skuCount }} 种</span>
            </template>
          </a-table-column>
          <a-table-column title="SKU单价总计" :width="120" align="right">
            <template #cell="{ record }">
              <span class="price">¥{{ record.skuTotalPrice }}</span>
            </template>
          </a-table-column>
          <a-table-column title="标签" :width="150">
            <template #cell="{ record }">
              <div class="tags-cell">
                <a-tag v-for="tag in record.tags?.slice(0, 2)" :key="tag" color="arcoblue" size="small">
                  {{ tag }}
                </a-tag>
                <span v-if="!record.tags?.length" class="no-data">-</span>
              </div>
            </template>
          </a-table-column>
          <a-table-column title="可见工程仓" :width="120">
            <template #cell="{ record }">
              <div class="warehouse-tags">
                <a-tag v-for="w in record.visibleWarehouses?.slice(0, 2)" :key="w.id" color="blue" size="small">
                  {{ w.name }}
                </a-tag>
                <a-tag v-if="record.visibleWarehouses?.length > 2" color="gray" size="small">
                  +{{ record.visibleWarehouses.length - 2 }}
                </a-tag>
                <span v-if="!record.visibleWarehouses?.length" class="no-data">未配置</span>
              </div>
            </template>
          </a-table-column>
          <a-table-column title="市场状态" :width="100">
            <template #cell="{ record }">
              <a-switch 
                v-model="record.isOnline" 
                :disabled="record.status !== 'approved'"
                @change="handleOnlineChange(record)"
              />
            </template>
          </a-table-column>
          <a-table-column title="状态" :width="100">
            <template #cell="{ record }">
              <a-tag :color="getStatusColor(record.status)">{{ getStatusText(record.status) }}</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="创建时间" data-index="createTime" :width="150" />
          <a-table-column title="操作" :width="220" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-link @click="handleView(record)">查看</a-link>
                <a-link v-if="record.status === 'draft' || record.status === 'rejected'" @click="handleEdit(record)">编辑</a-link>
                <a-link v-if="record.status === 'approved'" @click="handleConfigPermission(record)">权限配置</a-link>
                <a-link v-if="record.status === 'draft'" @click="handleSubmit(record)">提交审核</a-link>
                <a-link v-if="record.status === 'pending'" @click="handleAudit(record)">审核</a-link>
                <a-link v-if="record.status === 'approved'" @click="handleCopy(record)">复制</a-link>
                <a-popconfirm content="确定删除该BOM包吗？" @ok="handleDelete(record)">
                  <a-link status="danger">删除</a-link>
                </a-popconfirm>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <a-modal v-model:visible="auditModalVisible" title="BOM包审核" :width="600" @ok="handleAuditConfirm">
      <a-descriptions :column="2" bordered size="small">
        <a-descriptions-item label="BOM名称">{{ currentBom?.name }}</a-descriptions-item>
        <a-descriptions-item label="SKU数量">{{ currentBom?.skuCount }} 种</a-descriptions-item>
        <a-descriptions-item label="SKU单价总计">¥{{ currentBom?.skuTotalPrice }}</a-descriptions-item>
      </a-descriptions>
      <a-divider />
      <a-form :model="auditForm" layout="vertical">
        <a-form-item label="审核结果" required>
          <a-radio-group v-model="auditForm.result">
            <a-radio value="approved">通过</a-radio>
            <a-radio value="rejected">驳回</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="审核意见" required>
          <a-textarea v-model="auditForm.remark" placeholder="请输入审核意见" :max-length="200" />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal v-model:visible="permissionModalVisible" title="BOM包权限配置" :width="700" @ok="handlePermissionConfirm">
      <div class="permission-header">
        <div class="bom-summary">
          <img :src="currentBom?.image" class="bom-image" />
          <div class="bom-info">
            <div class="bom-name">{{ currentBom?.name }}</div>
            <div class="bom-meta">
              <span>{{ currentBom?.skuCount }}种SKU</span>
              <span>SKU总价：¥{{ currentBom?.skuTotalPrice }}</span>
            </div>
          </div>
        </div>
      </div>

      <a-divider />

      <div class="permission-config">
        <div class="config-header">
          <span class="config-title">选择可见工程仓</span>
          <a-space>
            <a-button type="text" size="small" @click="handleSelectAllWarehouses">全选</a-button>
            <a-button type="text" size="small" @click="handleClearWarehouses">清空</a-button>
          </a-space>
        </div>

        <a-transfer
          v-model="selectedWarehouseIds"
          :data="warehouseList"
          :title-items="['可选工程仓', '已选工程仓']"
          show-search
        />
      </div>

      <a-divider />

      <div class="market-config">
        <div class="config-title">商品市场设置</div>
        <a-form layout="vertical">
          <a-form-item label="上架到商品市场">
            <a-switch v-model="marketConfig.isOnline" />
            <span class="config-hint">上架后，已授权的工程仓可在商品市场采购该BOM包</span>
          </a-form-item>
        </a-form>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'

const router = useRouter()
const activeTab = ref('all')

const searchForm = ref({
  name: '',
  status: '',
})

const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 50,
})

const bomList = ref([
  {
    id: '1',
    name: '水电材料标准包',
    image: 'https://picsum.photos/100/100?random=1',
    skuCount: 12,
    strategy: 'smart',
    skuTotalPrice: '3,280.00',
    tags: ['热门', '推荐'],
    status: 'approved',
    isOnline: true,
    visibleWarehouses: [
      { id: 'w1', name: '华东工程仓' },
      { id: 'w2', name: '南京工程仓' },
    ],
    createTime: '2024-01-15 10:30',
  },
  {
    id: '2',
    name: '防水涂料套餐',
    image: 'https://picsum.photos/100/100?random=2',
    skuCount: 5,
    strategy: 'single',
    skuTotalPrice: '1,850.00',
    tags: ['新品'],
    status: 'approved',
    isOnline: true,
    visibleWarehouses: [
      { id: 'w1', name: '华东工程仓' },
      { id: 'w3', name: '苏州工程仓' },
      { id: 'w4', name: '杭州工程仓' },
    ],
    createTime: '2024-01-14 14:20',
  },
  {
    id: '3',
    name: '木工基础包',
    image: 'https://picsum.photos/100/100?random=3',
    skuCount: 8,
    strategy: 'sku',
    skuTotalPrice: '4,500.00',
    tags: [],
    status: 'pending',
    isOnline: false,
    visibleWarehouses: [],
    createTime: '2024-01-16 09:00',
  },
  {
    id: '4',
    name: '油漆涂装套餐',
    image: 'https://picsum.photos/100/100?random=4',
    skuCount: 6,
    strategy: 'smart',
    skuTotalPrice: '2,200.00',
    tags: ['促销'],
    status: 'draft',
    isOnline: false,
    visibleWarehouses: [],
    createTime: '2024-01-16 11:30',
  },
  {
    id: '5',
    name: '瓷砖铺贴包',
    image: 'https://picsum.photos/100/100?random=5',
    skuCount: 10,
    strategy: 'single',
    skuTotalPrice: '5,800.00',
    tags: [],
    status: 'rejected',
    isOnline: false,
    visibleWarehouses: [],
    createTime: '2024-01-13 16:45',
  },
])

const filteredBomList = computed(() => {
  let list = bomList.value
  if (activeTab.value !== 'all') {
    if (activeTab.value === 'online') {
      list = list.filter(item => item.isOnline)
    } else {
      list = list.filter(item => item.status === activeTab.value)
    }
  }
  return list
})

const auditModalVisible = ref(false)
const permissionModalVisible = ref(false)
const currentBom = ref<any>(null)
const auditForm = ref({
  result: 'approved',
  remark: '',
})

const selectedWarehouseIds = ref<string[]>([])
const marketConfig = ref({
  isOnline: true,
})

const warehouseList = ref([
  { value: 'w1', label: '华东工程仓' },
  { value: 'w2', label: '南京工程仓' },
  { value: 'w3', label: '苏州工程仓' },
  { value: 'w4', label: '杭州工程仓' },
  { value: 'w5', label: '上海工程仓' },
  { value: 'w6', label: '无锡工程仓' },
])

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

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    draft: 'gray',
    pending: 'orange',
    approved: 'green',
    rejected: 'red',
  }
  return colors[status] || 'gray'
}

function getStatusText(status: string) {
  const texts: Record<string, string> = {
    draft: '草稿',
    pending: '待审核',
    approved: '已通过',
    rejected: '已驳回',
  }
  return texts[status] || status
}

function handleSearch() {
  Message.info('查询功能开发中')
}

function handleCreate() {
  router.push('/market/bom/create')
}

function handleView(record: any) {
  router.push(`/market/bom/detail/${record.id}`)
}

function handleEdit(record: any) {
  router.push(`/market/bom/edit/${record.id}`)
}

function handleSubmit(record: any) {
  Message.success('已提交审核')
  record.status = 'pending'
}

function handleAudit(record: any) {
  currentBom.value = record
  auditForm.value = { result: 'approved', remark: '' }
  auditModalVisible.value = true
}

function handleAuditConfirm() {
  if (!auditForm.value.remark) {
    Message.warning('请输入审核意见')
    return
  }
  if (auditForm.value.result === 'approved') {
    currentBom.value.status = 'approved'
    Message.success('审核通过')
  } else {
    currentBom.value.status = 'rejected'
    Message.success('已驳回')
  }
  auditModalVisible.value = false
}

function handleConfigPermission(record: any) {
  currentBom.value = record
  selectedWarehouseIds.value = record.visibleWarehouses?.map((w: any) => w.id) || []
  marketConfig.value = {
    isOnline: record.isOnline,
  }
  permissionModalVisible.value = true
}

function handleSelectAllWarehouses() {
  selectedWarehouseIds.value = warehouseList.value.map(w => w.value)
}

function handleClearWarehouses() {
  selectedWarehouseIds.value = []
}

function handlePermissionConfirm() {
  const warehouses = warehouseList.value
    .filter(w => selectedWarehouseIds.value.includes(w.value))
    .map(w => ({ id: w.value, name: w.label }))
  
  currentBom.value.visibleWarehouses = warehouses
  currentBom.value.isOnline = marketConfig.value.isOnline
  
  Message.success('权限配置成功')
  permissionModalVisible.value = false
}

function handleCopy(record: any) {
  Message.success('已复制到草稿')
}

function handleDelete(record: any) {
  const index = bomList.value.findIndex(item => item.id === record.id)
  if (index > -1) {
    bomList.value.splice(index, 1)
    Message.success('删除成功')
  }
}

function handleOnlineChange(record: any) {
  if (record.isOnline) {
    Message.success('已上架')
  } else {
    Message.success('已下架')
  }
}
</script>

<style scoped lang="less">
.bom-list {
  padding: 16px;
}

.search-form {
  margin-bottom: 0;
}

.mt-16 {
  margin-top: 16px;
}

.bom-info {
  display: flex;
  align-items: center;
}

.bom-image {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
}

.bom-detail {
  margin-left: 12px;
}

.bom-name {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
}

.sku-count {
  color: #165dff;
  font-weight: 500;
}

.price {
  color: #f53f3f;
  font-weight: 600;
}

.tags-cell {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.warehouse-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.no-data {
  color: var(--color-text-3);
  font-size: 12px;
}

.permission-header {
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

.permission-config {
  .config-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    
    .config-title {
      font-weight: 500;
    }
  }
}

.market-config {
  .config-title {
    font-weight: 500;
    margin-bottom: 12px;
  }
  
  .config-hint {
    font-size: 12px;
    color: var(--color-text-3);
    margin-left: 8px;
  }
}
</style>
