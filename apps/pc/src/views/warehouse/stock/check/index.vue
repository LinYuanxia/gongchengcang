<template>
  <div class="stock-check">
    <a-card>
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

      <a-form :model="searchForm" layout="inline" class="search-form">
        <a-form-item label="盘点单号">
          <a-input v-model="searchForm.keyword" placeholder="请输入盘点单号" allow-clear />
        </a-form-item>
        <a-form-item label="盘点类型">
          <a-select v-model="searchForm.checkType" placeholder="请选择" allow-clear style="width: 120px">
            <a-option value="full">全盘</a-option>
            <a-option value="partial">抽盘</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="状态">
          <a-select v-model="searchForm.status" placeholder="请选择" allow-clear style="width: 120px">
            <a-option value="pending">待盘点</a-option>
            <a-option value="checking">盘点中</a-option>
            <a-option value="pending_review">待审核</a-option>
            <a-option value="completed">已完成</a-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="handleSearch">查询</a-button>
        </a-form-item>
      </a-form>

      <a-table :data="checkList" :pagination="pagination" class="mt-16">
        <template #columns>
          <a-table-column title="盘点单号" :width="150">
            <template #cell="{ record }">
              <a-link @click="handleView(record)">{{ record.checkNo }}</a-link>
            </template>
          </a-table-column>
          <a-table-column title="盘点类型" :width="100">
            <template #cell="{ record }">
              <a-tag :color="record.checkType === 'full' ? 'blue' : 'purple'">
                {{ record.checkType === 'full' ? '全盘' : '抽盘' }}
              </a-tag>
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
                <a-link @click="handleView(record)">详情</a-link>
                <a-link v-if="record.status === 'pending'" @click="handleStartCheck(record)">开始盘点</a-link>
                <a-link v-if="record.status === 'checking'" @click="handleContinueCheck(record)">继续盘点</a-link>
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'

const router = useRouter()

const searchForm = reactive({
  keyword: '',
  checkType: '',
  status: '',
})

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 50,
})

const allCheckList = ref([
  {
    id: 'c1',
    checkNo: 'PD202403240001',
    checkType: 'full',
    productCount: 156,
    profitQty: 12,
    lossQty: 5,
    status: 'checking',
    creator: '张三',
    createdAt: '2024-03-24 10:00:00',
  },
  {
    id: 'c2',
    checkNo: 'PD202403230001',
    checkType: 'partial',
    productCount: 30,
    profitQty: 0,
    lossQty: 3,
    status: 'completed',
    creator: '李四',
    createdAt: '2024-03-23 14:30:00',
  },
  {
    id: 'c3',
    checkNo: 'PD202403220001',
    checkType: 'full',
    productCount: 156,
    profitQty: 0,
    lossQty: 0,
    status: 'pending',
    creator: '王五',
    createdAt: '2024-03-22 09:00:00',
  },
])

const checkList = ref([...allCheckList.value])

const createModalVisible = ref(false)
const createForm = reactive({
  checkType: 'full',
  remark: '',
})
const selectedProducts = ref<any[]>([])

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
      item.creator.includes(searchForm.keyword)
    )
  }
  
  if (searchForm.checkType) {
    filtered = filtered.filter(item => item.checkType === searchForm.checkType)
  }
  
  if (searchForm.status) {
    filtered = filtered.filter(item => item.status === searchForm.status)
  }
  
  checkList.value = filtered
  pagination.total = filtered.length
  Message.success(`查询完成，共 ${filtered.length} 条记录`)
}

function handleExport() {
  if (checkList.value.length === 0) {
    Message.warning('暂无数据可导出')
    return
  }
  Message.success(`成功导出 ${checkList.value.length} 条盘点记录`)
}

function handleCreate() {
  createForm.checkType = 'full'
  createForm.remark = ''
  selectedProducts.value = []
  createModalVisible.value = true
}

function handleSelectProduct() {
  Message.success('商品选择成功')
}

function handleCreateConfirm() {
  if (createForm.checkType === 'partial' && selectedProducts.value.length === 0) {
    Message.warning('请选择要盘点的商品')
    return
  }
  Message.success('盘点单创建成功')
  createModalVisible.value = false
}

function handleView(record: any) {
  router.push({
    path: '/warehouse/stock/check-detail',
    query: { id: record.id },
  })
}

function handleStartCheck(record: any) {
  router.push({
    path: '/warehouse/stock/check-detail',
    query: { id: record.id, action: 'check' },
  })
}

function handleContinueCheck(record: any) {
  router.push({
    path: '/warehouse/stock/check-detail',
    query: { id: record.id, action: 'check' },
  })
}
</script>

<style lang="less" scoped>
.stock-check {
  padding: 16px;
}

.search-form {
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
