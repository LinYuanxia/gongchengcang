<template>
  <div class="stock-check">
    <a-card>
      <template #extra>
        <a-space>
          <a-button type="primary" @click="handleCreate">
            <template #icon><icon-plus /></template>
            创建盘点单
          </a-button>
          <a-input-search
            v-model="searchForm.keyword"
            placeholder="搜索盘点单号"
            style="width: 200px"
            @search="handleSearch"
          />
          <a-select v-model="searchForm.status" placeholder="状态" style="width: 120px" allow-clear>
            <a-option value="pending">待审核</a-option>
            <a-option value="approved">已通过</a-option>
            <a-option value="rejected">已驳回</a-option>
          </a-select>
        </a-space>
      </template>

      <a-table :data="filteredList" :pagination="pagination" @page-change="handlePageChange">
        <template #columns>
          <a-table-column title="盘点单号" data-index="checkNo" :width="160" />
          <a-table-column title="盘点仓库" data-index="warehouseName" :width="150" />
          <a-table-column title="盘点类型" :width="100">
            <template #cell="{ record }">
              <a-tag :color="record.checkType === 'full' ? 'blue' : 'green'">
                {{ record.checkType === 'full' ? '全盘' : '抽盘' }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="盘点商品数" :width="110" align="center">
            <template #cell="{ record }">
              {{ record.productCount }}
            </template>
          </a-table-column>
          <a-table-column title="盘盈数量" :width="100" align="center">
            <template #cell="{ record }">
              <span class="text-success" v-if="record.profitQty > 0">+{{ record.profitQty }}</span>
              <span v-else>-</span>
            </template>
          </a-table-column>
          <a-table-column title="盘亏数量" :width="100" align="center">
            <template #cell="{ record }">
              <span class="text-danger" v-if="record.lossQty > 0">-{{ record.lossQty }}</span>
              <span v-else>-</span>
            </template>
          </a-table-column>
          <a-table-column title="盘盈金额" :width="110" align="right">
            <template #cell="{ record }">
              <span class="text-success" v-if="record.profitAmount > 0">+¥{{ record.profitAmount.toFixed(2) }}</span>
              <span v-else>-</span>
            </template>
          </a-table-column>
          <a-table-column title="盘亏金额" :width="110" align="right">
            <template #cell="{ record }">
              <span class="text-danger" v-if="record.lossAmount > 0">-¥{{ record.lossAmount.toFixed(2) }}</span>
              <span v-else>-</span>
            </template>
          </a-table-column>
          <a-table-column title="状态" :width="100" align="center">
            <template #cell="{ record }">
              <a-tag :color="getStatusColor(record.status)">
                {{ getStatusText(record.status) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="创建人" data-index="creatorName" :width="100" />
          <a-table-column title="创建时间" data-index="createdAt" :width="160" />
          <a-table-column title="操作" :width="180" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-button type="text" size="small" @click="handleView(record)">查看</a-button>
                <a-button v-if="record.status === 'pending'" type="text" size="small" @click="handleAudit(record)">审核</a-button>
                <a-popconfirm v-if="record.status === 'pending'" content="确定删除该盘点单吗？" @ok="handleDelete(record)">
                  <a-button type="text" size="small" status="danger">删除</a-button>
                </a-popconfirm>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <a-modal v-model:visible="createModalVisible" title="创建盘点单" :width="700" @ok="handleCreateConfirm">
      <a-form :model="createForm" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="盘点仓库" required>
              <a-select v-model="createForm.warehouseId" placeholder="请选择盘点仓库">
                <a-option v-for="w in warehouses" :key="w.id" :value="w.id">
                  {{ w.name }}
                </a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="盘点类型" required>
              <a-radio-group v-model="createForm.checkType">
                <a-radio value="full">全盘</a-radio>
                <a-radio value="partial">抽盘</a-radio>
              </a-radio-group>
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item label="盘点商品">
          <a-alert v-if="createForm.checkType === 'partial'" type="warning">
            抽盘模式请在下方选择需要盘点的商品
          </a-alert>
          <a-table
            :data="checkProducts"
            :pagination="{ pageSize: 5 }"
            :row-selection="rowSelection"
            row-key="id"
            size="small"
          >
            <template #columns>
              <a-table-column title="商品名称" data-index="skuName" :width="180" />
              <a-table-column title="商品编码" data-index="skuCode" :width="120" />
              <a-table-column title="规格" data-index="spec" :width="100" />
              <a-table-column title="系统库存" :width="100" align="center">
                <template #cell="{ record }">
                  {{ record.quantity }} {{ record.unit }}
                </template>
              </a-table-column>
              <a-table-column title="盘点数量" :width="120">
                <template #cell="{ record }">
                  <a-input-number
                    v-model="record.checkQty"
                    :min="0"
                    :placeholder="'实盘数量'"
                    size="small"
                    style="width: 100%"
                  />
                </template>
              </a-table-column>
            </template>
          </a-table>
        </a-form-item>
        <a-form-item label="盘点备注">
          <a-textarea v-model="createForm.remark" placeholder="请输入盘点备注" :max-length="200" />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal v-model:visible="auditModalVisible" title="审核盘点单" :width="500" @ok="handleAuditConfirm">
      <a-descriptions :column="2" bordered size="small" style="margin-bottom: 16px">
        <a-descriptions-item label="盘点单号">{{ currentCheck?.checkNo }}</a-descriptions-item>
        <a-descriptions-item label="盘点仓库">{{ currentCheck?.warehouseName }}</a-descriptions-item>
        <a-descriptions-item label="盘点商品数">{{ currentCheck?.productCount }}</a-descriptions-item>
        <a-descriptions-item label="创建人">{{ currentCheck?.creatorName }}</a-descriptions-item>
      </a-descriptions>
      <a-form :model="auditForm" layout="vertical">
        <a-form-item label="审核结果" required>
          <a-radio-group v-model="auditForm.result">
            <a-radio value="approved">通过</a-radio>
            <a-radio value="rejected">驳回</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="审核意见" required>
          <a-textarea v-model="auditForm.opinion" placeholder="请输入审核意见" :max-length="200" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { Message } from '@arco-design/web-vue'

interface CheckOrder {
  id: string
  checkNo: string
  warehouseId: string
  warehouseName: string
  checkType: 'full' | 'partial'
  productCount: number
  profitQty: number
  lossQty: number
  profitAmount: number
  lossAmount: number
  status: 'pending' | 'approved' | 'rejected'
  creatorName: string
  createdAt: string
}

const searchForm = reactive({
  keyword: '',
  status: undefined as string | undefined,
})

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
})

const createModalVisible = ref(false)
const auditModalVisible = ref(false)
const currentCheck = ref<CheckOrder | null>(null)

const createForm = reactive({
  warehouseId: '',
  checkType: 'full' as 'full' | 'partial',
  remark: '',
})

const auditForm = reactive({
  result: 'approved' as 'approved' | 'rejected',
  opinion: '',
})

const selectedKeys = ref<string[]>([])

const warehouses = ref([
  { id: 'wh001', name: '深圳湾科技园项目仓' },
  { id: 'wh002', name: '福田CBD项目仓' },
  { id: 'wh003', name: '宝安新安项目仓' },
])

const checkProducts = ref([
  {
    id: 'p1',
    skuName: '水泥 P.O 42.5',
    skuCode: 'SKU-SN-001',
    spec: '50kg/袋',
    unit: '吨',
    quantity: 500,
    checkQty: 0,
  },
  {
    id: 'p2',
    skuName: '螺纹钢 HRB400 16mm',
    skuCode: 'SKU-LG-001',
    spec: '16mm',
    unit: '吨',
    quantity: 80,
    checkQty: 0,
  },
  {
    id: 'p3',
    skuName: '黄砂 中砂',
    skuCode: 'SKU-HS-001',
    spec: '中砂',
    unit: '方',
    quantity: 50,
    checkQty: 0,
  },
  {
    id: 'p4',
    skuName: '商品混凝土 C30',
    skuCode: 'SKU-HNT-001',
    spec: 'C30',
    unit: '方',
    quantity: 120,
    checkQty: 0,
  },
])

const checkList = ref<CheckOrder[]>([
  {
    id: 'c1',
    checkNo: 'PD202403240001',
    warehouseId: 'wh001',
    warehouseName: '深圳湾科技园项目仓',
    checkType: 'full',
    productCount: 5,
    profitQty: 2,
    lossQty: 5,
    profitAmount: 760.00,
    lossAmount: 1950.00,
    status: 'pending',
    creatorName: '张三',
    createdAt: '2024-03-24 09:30:00',
  },
  {
    id: 'c2',
    checkNo: 'PD202403230001',
    warehouseId: 'wh002',
    warehouseName: '福田CBD项目仓',
    checkType: 'partial',
    productCount: 3,
    profitQty: 0,
    lossQty: 1,
    profitAmount: 0,
    lossAmount: 380.00,
    status: 'approved',
    creatorName: '李四',
    createdAt: '2024-03-23 14:00:00',
  },
  {
    id: 'c3',
    checkNo: 'PD202403220001',
    warehouseId: 'wh003',
    warehouseName: '宝安新安项目仓',
    checkType: 'full',
    productCount: 8,
    profitQty: 10,
    lossQty: 0,
    profitAmount: 950.00,
    lossAmount: 0,
    status: 'rejected',
    creatorName: '王五',
    createdAt: '2024-03-22 10:00:00',
  },
])

const rowSelection = computed(() => ({
  type: 'checkbox' as const,
  selectedRowKeys: selectedKeys.value,
  onlyCurrent: true,
  onChange: (keys: string[]) => {
    selectedKeys.value = keys
  },
}))

const filteredList = computed(() => {
  let result = checkList.value

  if (searchForm.keyword) {
    result = result.filter(c => c.checkNo.toLowerCase().includes(searchForm.keyword.toLowerCase()))
  }

  if (searchForm.status) {
    result = result.filter(c => c.status === searchForm.status)
  }

  pagination.total = result.length
  return result
})

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    pending: 'orange',
    approved: 'green',
    rejected: 'red',
  }
  return colors[status] || 'gray'
}

function getStatusText(status: string) {
  const texts: Record<string, string> = {
    pending: '待审核',
    approved: '已通过',
    rejected: '已驳回',
  }
  return texts[status] || status
}

function handleSearch() {
  pagination.current = 1
}

function handlePageChange(page: number) {
  pagination.current = page
}

function handleCreate() {
  createForm.warehouseId = ''
  createForm.checkType = 'full'
  createForm.remark = ''
  selectedKeys.value = []
  checkProducts.value.forEach(p => p.checkQty = 0)
  createModalVisible.value = true
}

function handleCreateConfirm() {
  if (!createForm.warehouseId) {
    Message.warning('请选择盘点仓库')
    return
  }

  const newOrder: CheckOrder = {
    id: `c${Date.now()}`,
    checkNo: `PD${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${String(checkList.value.length + 1).padStart(4, '0')}`,
    warehouseId: createForm.warehouseId,
    warehouseName: warehouses.value.find(w => w.id === createForm.warehouseId)?.name || '',
    checkType: createForm.checkType,
    productCount: createForm.checkType === 'full' ? checkProducts.value.length : selectedKeys.value.length,
    profitQty: 2,
    lossQty: 1,
    profitAmount: 760.00,
    lossAmount: 380.00,
    status: 'pending',
    creatorName: '当前用户',
    createdAt: new Date().toLocaleString(),
  }

  checkList.value.unshift(newOrder)
  Message.success('盘点单创建成功，已自动生成出入库调整记录')
  createModalVisible.value = false
}

function handleView(record: CheckOrder) {
  Message.info(`查看盘点单：${record.checkNo}`)
}

function handleAudit(record: CheckOrder) {
  currentCheck.value = record
  auditForm.result = 'approved'
  auditForm.opinion = ''
  auditModalVisible.value = true
}

function handleAuditConfirm() {
  if (!auditForm.opinion.trim()) {
    Message.warning('请输入审核意见')
    return
  }

  const index = checkList.value.findIndex(c => c.id === currentCheck.value?.id)
  if (index > -1) {
    checkList.value[index].status = auditForm.result
  }
  
  if (auditForm.result === 'approved') {
    Message.success('审核通过，已同步调整库存')
  } else {
    Message.success('已驳回')
  }
  auditModalVisible.value = false
}

function handleDelete(record: CheckOrder) {
  const index = checkList.value.findIndex(c => c.id === record.id)
  if (index > -1) {
    checkList.value.splice(index, 1)
  }
  Message.success('删除成功')
}
</script>

<style scoped lang="less">
.stock-check {
  padding: 16px;

  .text-success {
    color: var(--color-success);
    font-weight: 500;
  }

  .text-danger {
    color: var(--color-danger);
    font-weight: 500;
  }
}
</style>