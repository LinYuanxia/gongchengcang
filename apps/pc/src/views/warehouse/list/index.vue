<template>
  <div class="page-container">
    <a-card :bordered="false">
      <template #title>
        <span>工程仓仓库列表</span>
      </template>
      <template #extra>
        <a-space>
          <a-input-search
            v-model="searchForm.keyword"
            placeholder="搜索仓库名称"
            style="width: 200px"
            @search="handleSearch"
          />
          <a-select v-model="searchForm.warehouseType" placeholder="仓库类型" style="width: 120px" allow-clear>
            <a-option value="main">主仓</a-option>
            <a-option value="sub">分仓</a-option>
          </a-select>
          <a-select v-model="searchForm.status" placeholder="状态" style="width: 100px" allow-clear>
            <a-option value="active">启用</a-option>
            <a-option value="inactive">停用</a-option>
          </a-select>
        </a-space>
      </template>

      <a-table :data="filteredWarehouses" :pagination="pagination" @page-change="handlePageChange">
        <template #columns>
          <a-table-column title="所属工程仓" :width="180">
            <template #cell="{ record }">
              <a-link @click="handleViewWarehouse(record)">{{ record.constructionName }}</a-link>
            </template>
          </a-table-column>
          <a-table-column title="仓库名称" data-index="name" :width="180" />
          <a-table-column title="仓库编码" data-index="code" :width="120" />
          <a-table-column title="仓库类型" :width="100">
            <template #cell="{ record }">
              <a-tag :color="record.type === 'main' ? 'blue' : 'green'">
                {{ record.type === 'main' ? '主仓' : '分仓' }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="覆盖范围" :width="200">
            <template #cell="{ record }">
              <template v-if="record.coverageType === 'city'">
                <icon-location /> {{ record.coverageNames?.join('、') || '-' }}
              </template>
              <template v-else-if="record.coverageType === 'brand'">
                <icon-apps /> {{ record.coverageNames?.join('、') || '-' }}
              </template>
              <template v-else-if="record.coverageType === 'store'">
                <icon-shop /> {{ record.coverageNames?.join('、') || '-' }}
              </template>
              <template v-else>-</template>
            </template>
          </a-table-column>
          <a-table-column title="负责人" data-index="managerName" :width="100" />
          <a-table-column title="联系电话" data-index="phone" :width="130" />
          <a-table-column title="地址" data-index="address" :width="250" :ellipsis="true" />
          <a-table-column title="库存容量" :width="120" align="right">
            <template #cell="{ record }">
              <span>{{ record.usedCapacity }} / {{ record.totalCapacity }}</span>
            </template>
          </a-table-column>
          <a-table-column title="状态" :width="80">
            <template #cell="{ record }">
              <a-tag :color="record.status === 'active' ? 'green' : 'red'">
                {{ record.status === 'active' ? '启用' : '停用' }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="操作" :width="150" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-link @click="handleViewStock(record)">查看库存</a-link>
                <a-link @click="handleViewRecord(record)">出入库记录</a-link>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'

interface WarehouseItem {
  id: string
  constructionId: string
  constructionName: string
  name: string
  code: string
  type: 'main' | 'sub'
  coverageType: string
  coverageNames: string[]
  managerId: string
  managerName: string
  phone: string
  address: string
  usedCapacity: number
  totalCapacity: number
  status: 'active' | 'inactive'
}

const router = useRouter()

const searchForm = reactive({
  keyword: '',
  warehouseType: undefined as string | undefined,
  status: undefined as string | undefined,
})

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
})

const warehouses = ref<WarehouseItem[]>([
  {
    id: 'wh001',
    constructionId: 'gc001',
    constructionName: '深圳湾科技园项目仓',
    name: '深圳湾科技园主仓',
    code: 'WH001',
    type: 'main',
    coverageType: 'city',
    coverageNames: ['深圳市'],
    managerId: 'acc1',
    managerName: '张三',
    phone: '13800138001',
    address: '广东省深圳市南山区科技园南区',
    usedCapacity: 1200,
    totalCapacity: 2000,
    status: 'active',
  },
  {
    id: 'wh002',
    constructionId: 'gc001',
    constructionName: '深圳湾科技园项目仓',
    name: '深圳湾分仓',
    code: 'WH002',
    type: 'sub',
    coverageType: 'brand',
    coverageNames: ['赵一鸣', '零食很忙'],
    managerId: 'acc2',
    managerName: '李四',
    phone: '13800138002',
    address: '广东省深圳市福田区CBD中心区',
    usedCapacity: 300,
    totalCapacity: 800,
    status: 'active',
  },
  {
    id: 'wh003',
    constructionId: 'gc002',
    constructionName: '福田CBD项目仓',
    name: '福田CBD主仓',
    code: 'WH003',
    type: 'main',
    coverageType: 'city',
    coverageNames: ['深圳市福田区'],
    managerId: 'acc3',
    managerName: '王五',
    phone: '13800138003',
    address: '广东省深圳市福田区CBD中心区',
    usedCapacity: 500,
    totalCapacity: 1000,
    status: 'active',
  },
  {
    id: 'wh004',
    constructionId: 'gc003',
    constructionName: '宝安新安项目仓',
    name: '宝安新安主仓',
    code: 'WH004',
    type: 'main',
    coverageType: 'store',
    coverageNames: ['宝安新安店'],
    managerId: 'acc4',
    managerName: '赵六',
    phone: '13800138004',
    address: '广东省深圳市宝安区新安街道',
    usedCapacity: 0,
    totalCapacity: 500,
    status: 'inactive',
  },
  {
    id: 'wh005',
    constructionId: 'gc004',
    constructionName: '广州天河项目仓',
    name: '广州天河主仓',
    code: 'WH005',
    type: 'main',
    coverageType: 'city',
    coverageNames: ['广州市天河区'],
    managerId: 'acc5',
    managerName: '钱七',
    phone: '13800138005',
    address: '广东省广州市天河区珠江新城',
    usedCapacity: 800,
    totalCapacity: 1500,
    status: 'active',
  },
  {
    id: 'wh006',
    constructionId: 'gc004',
    constructionName: '广州天河项目仓',
    name: '广州天河分仓',
    code: 'WH006',
    type: 'sub',
    coverageType: 'brand',
    coverageNames: ['赵一鸣'],
    managerId: 'acc6',
    managerName: '孙八',
    phone: '13800138006',
    address: '广东省广州市白云区',
    usedCapacity: 200,
    totalCapacity: 600,
    status: 'active',
  },
])

const filteredWarehouses = computed(() => {
  let result = warehouses.value

  if (searchForm.keyword) {
    result = result.filter(w =>
      w.name.includes(searchForm.keyword) ||
      w.constructionName.includes(searchForm.keyword) ||
      w.code.includes(searchForm.keyword)
    )
  }

  if (searchForm.warehouseType) {
    result = result.filter(w => w.type === searchForm.warehouseType)
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

function handlePageChange(page: number) {
  pagination.current = page
}

function handleViewWarehouse(record: WarehouseItem) {
  router.push({
    path: '/merchant/list',
    query: { id: record.constructionId }
  })
}

function handleViewStock(record: WarehouseItem) {
  router.push({
    path: '/stock/product',
    query: { warehouseId: record.id, warehouseName: record.name }
  })
}

function handleViewRecord(record: WarehouseItem) {
  router.push({
    path: '/stock/record',
    query: { warehouseId: record.id, warehouseName: record.name }
  })
}
</script>

<style scoped lang="less">
.page-container {
  padding: 16px;
}
</style>
