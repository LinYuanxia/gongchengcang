<template>
  <div class="page-container">
    <a-card :bordered="false" class="search-card">
      <a-form :model="searchForm" layout="inline">
        <a-form-item label="工程仓名称">
          <a-input v-model="searchForm.name" placeholder="请输入工程仓名称" allow-clear />
        </a-form-item>
        <a-form-item label="状态">
          <a-select v-model="searchForm.status" placeholder="请选择状态" allow-clear style="width: 120px">
            <a-option value="active">启用</a-option>
            <a-option value="inactive">停用</a-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" @click="handleSearch">
              <template #icon><icon-search /></template>
              搜索
            </a-button>
            <a-button @click="handleReset">重置</a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </a-card>
    
    <a-card :bordered="false" class="table-card">
      <template #title>
        <a-space>
          <a-button type="primary" @click="handleAdd">
            <template #icon><icon-plus /></template>
            新增工程仓
          </a-button>
        </a-space>
      </template>
      
      <a-table :data="filteredWarehouses" :pagination="pagination" @page-change="handlePageChange">
        <a-table-column title="工程仓编码" data-index="code" :width="120" />
        <a-table-column title="工程仓名称" data-index="name" :width="180" />
        <a-table-column title="联系人" data-index="contact" :width="100" />
        <a-table-column title="联系电话" data-index="phone" :width="130" />
        <a-table-column title="地址" data-index="address" :ellipsis="true" />
        <a-table-column title="可购商品" :width="100" align="center">
          <template #cell="{ record }">
            <a-link @click="handleViewProducts(record)">{{ record.productCount }} 种</a-link>
          </template>
        </a-table-column>
        <a-table-column title="状态" :width="80" align="center">
          <template #cell="{ record }">
            <a-tag :color="record.status === 'active' ? 'green' : 'red'">
              {{ record.status === 'active' ? '启用' : '停用' }}
            </a-tag>
          </template>
        </a-table-column>
        <a-table-column title="创建时间" data-index="createdAt" :width="160" />
        <a-table-column title="操作" :width="200" fixed="right">
          <template #cell="{ record }">
            <a-space>
              <a-link @click="handleEdit(record)">编辑</a-link>
              <a-link @click="handlePermission(record)">商品权限</a-link>
              <a-link @click="handlePrice(record)">价格策略</a-link>
              <a-popconfirm content="确定要删除该工程仓吗？" @ok="handleDelete(record)">
                <a-link status="danger">删除</a-link>
              </a-popconfirm>
            </a-space>
          </template>
        </a-table-column>
      </a-table>
    </a-card>
    
    <WarehouseFormDrawer 
      v-model:visible="formVisible" 
      :warehouse="currentWarehouse"
      @success="handleFormSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { Message } from '@arco-design/web-vue'
import WarehouseFormDrawer from './components/WarehouseFormDrawer.vue'

interface ConstructionWarehouse {
  id: string
  code: string
  name: string
  contact: string
  phone: string
  province: string
  city: string
  district: string
  address: string
  status: 'active' | 'inactive'
  productCount: number
  createdAt: string
}

const searchForm = reactive({
  name: '',
  status: '',
})

const formVisible = ref(false)
const currentWarehouse = ref<ConstructionWarehouse | null>(null)

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
})

const warehouses = ref<ConstructionWarehouse[]>([
  {
    id: 'w001',
    code: 'GC001',
    name: '深圳湾科技园项目仓',
    contact: '张经理',
    phone: '13800138001',
    province: '广东省',
    city: '深圳市',
    district: '南山区',
    address: '科技园南区A栋',
    status: 'active',
    productCount: 156,
    createdAt: '2024-01-15 10:30:00',
  },
  {
    id: 'w002',
    code: 'GC002',
    name: '福田CBD项目仓',
    contact: '李经理',
    phone: '13800138002',
    province: '广东省',
    city: '深圳市',
    district: '福田区',
    address: '福田中心区CBD',
    status: 'active',
    productCount: 89,
    createdAt: '2024-01-20 14:20:00',
  },
  {
    id: 'w003',
    code: 'GC003',
    name: '宝安新安项目仓',
    contact: '王经理',
    phone: '13800138003',
    province: '广东省',
    city: '深圳市',
    district: '宝安区',
    address: '新安街道创业路',
    status: 'inactive',
    productCount: 45,
    createdAt: '2024-02-01 09:00:00',
  },
])

const filteredWarehouses = computed(() => {
  let result = warehouses.value
  
  if (searchForm.name) {
    result = result.filter(w => w.name.includes(searchForm.name))
  }
  
  if (searchForm.status) {
    result = result.filter(w => w.status === searchForm.status)
  }
  
  pagination.total = result.length
  return result
})

function handleSearch() {
  pagination.current = 1
}

function handleReset() {
  searchForm.name = ''
  searchForm.status = ''
  pagination.current = 1
}

function handlePageChange(page: number) {
  pagination.current = page
}

function handleAdd() {
  currentWarehouse.value = null
  formVisible.value = true
}

function handleEdit(record: ConstructionWarehouse) {
  currentWarehouse.value = { ...record }
  formVisible.value = true
}

function handleDelete(record: ConstructionWarehouse) {
  const index = warehouses.value.findIndex(w => w.id === record.id)
  if (index > -1) {
    warehouses.value.splice(index, 1)
    Message.success('删除成功')
  }
}

function handlePermission(record: ConstructionWarehouse) {
  window.location.href = `/construction/permission?warehouseId=${record.id}&warehouseName=${encodeURIComponent(record.name)}`
}

function handlePrice(record: ConstructionWarehouse) {
  window.location.href = `/construction/price?warehouseId=${record.id}&warehouseName=${encodeURIComponent(record.name)}`
}

function handleViewProducts(record: ConstructionWarehouse) {
  window.location.href = `/construction/permission?warehouseId=${record.id}&warehouseName=${encodeURIComponent(record.name)}`
}

function handleFormSuccess() {
  formVisible.value = false
  Message.success('保存成功')
}
</script>

<style lang="scss" scoped>
.page-container {
  padding: 16px;
}

.search-card {
  margin-bottom: 16px;
}

.table-card {
  :deep(.arco-card-body) {
    padding-top: 0;
  }
}
</style>
