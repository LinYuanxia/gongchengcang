<template>
  <div class="page-container">
    <a-card :bordered="false">
      <template #title>
        <span>盘点管理</span>
      </template>
      <template #extra>
        <a-space>
          <a-button @click="handleExport">
            <template #icon><icon-download /></template>
            导出
          </a-button>
          <a-button type="primary" @click="handleCreate">
            <template #icon><icon-plus /></template>
            创建盘点单
          </a-button>
        </a-space>
      </template>

      <div class="search-bar">
        <a-space>
          <a-input-search
            v-model="searchForm.keyword"
            placeholder="搜索盘点单号"
            style="width: 200px"
            @search="handleSearch"
          />
          <a-select v-model="searchForm.warehouseId" placeholder="选择仓库" style="width: 150px" allow-clear>
            <a-option v-for="w in warehouseList" :key="w.id" :value="w.id">{{ w.name }}</a-option>
          </a-select>
          <a-select v-model="searchForm.status" placeholder="盘点状态" style="width: 120px" allow-clear>
            <a-option value="pending">待盘点</a-option>
            <a-option value="checking">盘点中</a-option>
            <a-option value="pending_review">待审核</a-option>
            <a-option value="completed">已完成</a-option>
          </a-select>
          <a-range-picker v-model="searchForm.dateRange" style="width: 240px" />
          <a-button type="primary" @click="handleSearch">查询</a-button>
          <a-button @click="handleReset">重置</a-button>
        </a-space>
      </div>

      <a-table
        :data="checkList"
        :pagination="pagination"
        :loading="loading"
        class="mt-16"
        @page-change="handlePageChange"
      >
        <template #columns>
          <a-table-column title="盘点单号" :width="150">
            <template #cell="{ record }">
              <a-link @click="handleView(record)">{{ record.checkNo }}</a-link>
            </template>
          </a-table-column>
          <a-table-column title="盘点仓库" data-index="warehouseName" :width="150" />
          <a-table-column title="盘点类型" :width="100">
            <template #cell="{ record }">
              <a-tag :color="getTypeColor(record.checkType)">{{ getTypeText(record.checkType) }}</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="盘点商品数" data-index="productCount" :width="100" align="center" />
          <a-table-column title="盘盈数量" :width="100" align="right">
            <template #cell="{ record }">
              <span v-if="record.profitQty > 0" class="text-success">+{{ record.profitQty }}</span>
              <span v-else>-</span>
            </template>
          </a-table-column>
          <a-table-column title="盘亏数量" :width="100" align="right">
            <template #cell="{ record }">
              <span v-if="record.lossQty > 0" class="text-danger">-{{ record.lossQty }}</span>
              <span v-else>-</span>
            </template>
          </a-table-column>
          <a-table-column title="差异金额" :width="120" align="right">
            <template #cell="{ record }">
              <span :class="record.diffAmount >= 0 ? 'text-success' : 'text-danger'">
                {{ record.diffAmount >= 0 ? '+' : '' }}¥{{ Math.abs(record.diffAmount).toLocaleString() }}
              </span>
            </template>
          </a-table-column>
          <a-table-column title="状态" :width="100">
            <template #cell="{ record }">
              <a-tag :color="getStatusColor(record.status)">{{ getStatusText(record.status) }}</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="创建人" data-index="creator" :width="100" />
          <a-table-column title="创建时间" data-index="createdAt" :width="160" />
          <a-table-column title="操作" :width="180" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-button type="text" size="small" @click="handleView(record)">详情</a-button>
                <a-button v-if="record.status === 'pending'" type="text" size="small" @click="handleStartCheck(record)">开始盘点</a-button>
                <a-button v-if="record.status === 'checking'" type="text" size="small" @click="handleContinueCheck(record)">继续盘点</a-button>
                <a-button v-if="record.status === 'pending_review'" type="text" size="small" status="success" @click="handleApprove(record)">审核</a-button>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <a-modal
      v-model:visible="createModalVisible"
      title="创建盘点单"
      :width="500"
      @ok="handleCreateConfirm"
    >
      <a-form :model="createForm" layout="vertical">
        <a-form-item label="盘点仓库" required>
          <a-select v-model="createForm.warehouseId" placeholder="请选择盘点仓库">
            <a-option v-for="w in warehouseList" :key="w.id" :value="w.id">{{ w.name }}</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="盘点类型" required>
          <a-radio-group v-model="createForm.checkType">
            <a-radio value="full">全盘</a-radio>
            <a-radio value="partial">抽盘</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item v-if="createForm.checkType === 'partial'" label="选择商品">
          <a-button @click="handleSelectProducts">选择商品（已选 {{ selectedProducts.length }} 个）</a-button>
        </a-form-item>
        <a-form-item label="备注">
          <a-textarea v-model="createForm.remark" placeholder="请输入备注" :max-length="200" />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal
      v-model:visible="approveModalVisible"
      title="盘点审核"
      :width="600"
      @ok="handleApproveConfirm"
    >
      <a-descriptions :column="2" bordered size="small" style="margin-bottom: 16px">
        <a-descriptions-item label="盘点单号">{{ currentCheck?.checkNo }}</a-descriptions-item>
        <a-descriptions-item label="盘点仓库">{{ currentCheck?.warehouseName }}</a-descriptions-item>
        <a-descriptions-item label="盘盈数量">
          <span v-if="currentCheck?.profitQty > 0" class="text-success">+{{ currentCheck?.profitQty }}</span>
          <span v-else>-</span>
        </a-descriptions-item>
        <a-descriptions-item label="盘亏数量">
          <span v-if="currentCheck?.lossQty > 0" class="text-danger">-{{ currentCheck?.lossQty }}</span>
          <span v-else>-</span>
        </a-descriptions-item>
      </a-descriptions>
      <a-table :data="checkDetails" :pagination="false" size="small" :max-height="300">
        <template #columns>
          <a-table-column title="商品名称" data-index="productName" :width="150" />
          <a-table-column title="账面数量" data-index="bookQty" :width="80" align="right" />
          <a-table-column title="实盘数量" data-index="actualQty" :width="80" align="right" />
          <a-table-column title="差异" :width="80" align="right">
            <template #cell="{ record }">
              <span :class="record.diff > 0 ? 'text-success' : record.diff < 0 ? 'text-danger' : ''">
                {{ record.diff > 0 ? '+' : '' }}{{ record.diff }}
              </span>
            </template>
          </a-table-column>
          <a-table-column title="差异原因" data-index="reason" :width="120" />
        </template>
      </a-table>
      <a-form :model="approveForm" layout="vertical" style="margin-top: 16px">
        <a-form-item label="审核意见" required>
          <a-radio-group v-model="approveForm.result">
            <a-radio value="pass">通过</a-radio>
            <a-radio value="reject">驳回</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="审核备注">
          <a-textarea v-model="approveForm.remark" placeholder="请输入审核备注" :max-length="200" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'

const router = useRouter()
const loading = ref(false)

const searchForm = reactive({
  keyword: '',
  warehouseId: '',
  status: '',
  dateRange: [],
})

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 50,
})

const warehouseList = ref([
  { id: 'w1', name: '深圳湾科技园主仓' },
  { id: 'w2', name: '福田CBD项目仓' },
  { id: 'w3', name: '宝安新安项目仓' },
  { id: 'w4', name: '龙岗中心城项目仓' },
])

const allCheckList = ref([
  {
    id: 'c1',
    checkNo: 'PD202403240001',
    warehouseId: 'w1',
    warehouseName: '深圳湾科技园主仓',
    checkType: 'full',
    productCount: 156,
    profitQty: 12,
    lossQty: 5,
    diffAmount: 28500,
    status: 'pending_review',
    creator: '张三',
    createdAt: '2024-03-24 10:00:00',
  },
  {
    id: 'c2',
    checkNo: 'PD202403230001',
    warehouseId: 'w2',
    warehouseName: '福田CBD项目仓',
    checkType: 'partial',
    productCount: 30,
    profitQty: 0,
    lossQty: 3,
    diffAmount: -4500,
    status: 'completed',
    creator: '李四',
    createdAt: '2024-03-23 14:30:00',
  },
  {
    id: 'c3',
    checkNo: 'PD202403220001',
    warehouseId: 'w1',
    warehouseName: '深圳湾科技园主仓',
    checkType: 'full',
    productCount: 156,
    profitQty: 8,
    lossQty: 0,
    diffAmount: 12000,
    status: 'checking',
    creator: '王五',
    createdAt: '2024-03-22 09:00:00',
  },
  {
    id: 'c4',
    checkNo: 'PD202403210001',
    warehouseId: 'w3',
    warehouseName: '宝安新安项目仓',
    checkType: 'partial',
    productCount: 20,
    profitQty: 0,
    lossQty: 0,
    diffAmount: 0,
    status: 'pending',
    creator: '赵六',
    createdAt: '2024-03-21 16:00:00',
  },
])

const checkList = ref([...allCheckList.value])

const createModalVisible = ref(false)
const createForm = reactive({
  warehouseId: '',
  checkType: 'full',
  remark: '',
})
const selectedProducts = ref<any[]>([])

const approveModalVisible = ref(false)
const currentCheck = ref<any>(null)
const checkDetails = ref<any[]>([])
const approveForm = reactive({
  result: 'pass',
  remark: '',
})

function getTypeColor(type: string) {
  return type === 'full' ? 'blue' : 'purple'
}

function getTypeText(type: string) {
  return type === 'full' ? '全盘' : '抽盘'
}

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    pending: 'gray',
    checking: 'blue',
    pending_review: 'orange',
    completed: 'green',
  }
  return colors[status] || 'gray'
}

function getStatusText(status: string) {
  const texts: Record<string, string> = {
    pending: '待盘点',
    checking: '盘点中',
    pending_review: '待审核',
    completed: '已完成',
  }
  return texts[status] || status
}

function handleSearch() {
  let filtered = [...allCheckList.value]
  
  if (searchForm.keyword) {
    filtered = filtered.filter(item => 
      item.checkNo.includes(searchForm.keyword) ||
      item.warehouseName.includes(searchForm.keyword)
    )
  }
  
  if (searchForm.warehouseId) {
    filtered = filtered.filter(item => item.warehouseId === searchForm.warehouseId)
  }
  
  if (searchForm.status) {
    filtered = filtered.filter(item => item.status === searchForm.status)
  }
  
  if (searchForm.dateRange && searchForm.dateRange.length === 2) {
    const [startDate, endDate] = searchForm.dateRange
    filtered = filtered.filter(item => {
      const itemDate = new Date(item.createdAt.split(' ')[0])
      return itemDate >= new Date(startDate) && itemDate <= new Date(endDate)
    })
  }
  
  checkList.value = filtered
  pagination.total = filtered.length
  Message.success(`查询完成，共 ${filtered.length} 条记录`)
}

function handleReset() {
  searchForm.keyword = ''
  searchForm.warehouseId = ''
  searchForm.status = ''
  searchForm.dateRange = []
}

function handlePageChange(page: number) {
  pagination.current = page
}

function handleExport() {
  if (checkList.value.length === 0) {
    Message.warning('暂无数据可导出')
    return
  }
  Message.success(`成功导出 ${checkList.value.length} 条盘点记录`)
}

function handleCreate() {
  createForm.warehouseId = ''
  createForm.checkType = 'full'
  createForm.remark = ''
  selectedProducts.value = []
  createModalVisible.value = true
}

function handleSelectProduct() {
  Message.success('商品选择成功')
}

function handleCreateConfirm() {
  if (!createForm.warehouseId) {
    Message.warning('请选择盘点仓库')
    return
  }
  if (createForm.checkType === 'partial' && selectedProducts.value.length === 0) {
    Message.warning('请选择要盘点的商品')
    return
  }
  Message.success('盘点单创建成功')
  createModalVisible.value = false
}

function handleView(record: any) {
  router.push({
    path: '/stock/check-detail',
    query: { id: record.id },
  })
}

function handleStartCheck(record: any) {
  router.push({
    path: '/stock/check-detail',
    query: { id: record.id, action: 'check' },
  })
}

function handleContinueCheck(record: any) {
  router.push({
    path: '/stock/check-detail',
    query: { id: record.id, action: 'check' },
  })
}

function handleApprove(record: any) {
  currentCheck.value = record
  checkDetails.value = [
    { id: 'd1', productName: '水泥 P.O 42.5', bookQty: 100, actualQty: 105, diff: 5, reason: '入库漏登' },
    { id: 'd2', productName: '螺纹钢 HRB400 16mm', bookQty: 50, actualQty: 48, diff: -2, reason: '锈蚀损耗' },
    { id: 'd3', productName: '防水涂料', bookQty: 80, actualQty: 82, diff: 2, reason: '计量误差' },
    { id: 'd4', productName: '瓷砖 800x800', bookQty: 200, actualQty: 195, diff: -5, reason: '运输破损' },
    { id: 'd5', productName: 'PVC管材 DN110', bookQty: 150, actualQty: 150, diff: 0, reason: '-' },
  ]
  approveForm.result = 'pass'
  approveForm.remark = ''
  approveModalVisible.value = true
}

function handleApproveConfirm() {
  if (approveForm.result === 'pass') {
    Message.success('审核通过，库存已调整')
  } else {
    Message.success('已驳回，请重新盘点')
  }
  approveModalVisible.value = false
}
</script>

<style lang="less" scoped>
.page-container {
  padding: 16px;
}

.search-bar {
  margin-bottom: 16px;
}

.mt-16 {
  margin-top: 16px;
}

.text-success {
  color: var(--color-success);
}

.text-danger {
  color: var(--color-danger);
}
</style>
