<template>
  <div class="stock-check-detail">
    <a-card>
      <template #title>
        <a-space>
          <a-button type="text" @click="handleBack">
            <template #icon><icon-left /></template>
          </a-button>
          <span>盘点详情</span>
        </a-space>
      </template>
      <template #extra>
        <a-space>
          <a-button v-if="checkInfo.status === 'checking'" type="primary" @click="handleSubmitCheck">
            提交审核
          </a-button>
        </a-space>
      </template>

      <a-descriptions :column="4" bordered size="small" class="mb-16">
        <a-descriptions-item label="盘点单号">{{ checkInfo.checkNo }}</a-descriptions-item>
        <a-descriptions-item label="盘点类型">
          <a-tag :color="checkInfo.checkType === 'full' ? 'blue' : 'purple'">
            {{ checkInfo.checkType === 'full' ? '全盘' : '抽盘' }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="状态">
          <a-tag :color="getStatusColor(checkInfo.status)">{{ getStatusText(checkInfo.status) }}</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="创建时间">{{ checkInfo.createdAt }}</a-descriptions-item>
        <a-descriptions-item label="盘盈数量">
          <span v-if="checkInfo.profitQty > 0" class="text-success">+{{ checkInfo.profitQty }}</span>
          <span v-else>-</span>
        </a-descriptions-item>
        <a-descriptions-item label="盘亏数量">
          <span v-if="checkInfo.lossQty > 0" class="text-danger">-{{ checkInfo.lossQty }}</span>
          <span v-else>-</span>
        </a-descriptions-item>
      </a-descriptions>

      <div class="table-actions">
        <a-space>
          <a-input-search
            v-model="searchKeyword"
            placeholder="搜索商品名称/编码"
            style="width: 200px"
          />
          <a-select v-model="diffFilter" placeholder="差异筛选" style="width: 120px" allow-clear>
            <a-option value="profit">盘盈</a-option>
            <a-option value="loss">盘亏</a-option>
            <a-option value="none">无差异</a-option>
          </a-select>
        </a-space>
        <a-space>
          <span class="check-progress">盘点进度：{{ checkedCount }}/{{ productList.length }}</span>
          <a-progress :percent="checkedCount / productList.length * 100" :stroke-width="6" style="width: 120px" />
        </a-space>
      </div>

      <a-table :data="filteredProducts" :pagination="pagination" :scroll="{ x: 1100 }">
        <template #columns>
          <a-table-column title="商品编码" data-index="productCode" :width="120" />
          <a-table-column title="商品名称" data-index="productName" :width="180" />
          <a-table-column title="规格" data-index="spec" :width="120" />
          <a-table-column title="单位" data-index="unit" :width="60" align="center" />
          <a-table-column title="账面数量" data-index="bookQty" :width="100" align="right" />
          <a-table-column title="实盘数量" :width="120" align="right">
            <template #cell="{ record }">
              <a-input-number
                v-if="checkInfo.status === 'checking'"
                v-model="record.actualQty"
                :min="0"
                size="small"
                @change="handleActualQtyChange(record)"
              />
              <span v-else>{{ record.actualQty }}</span>
            </template>
          </a-table-column>
          <a-table-column title="差异" :width="80" align="right">
            <template #cell="{ record }">
              <span :class="getDiffClass(record.diff)">
                {{ record.diff > 0 ? '+' : '' }}{{ record.diff }}
              </span>
            </template>
          </a-table-column>
          <a-table-column title="差异原因" :width="150">
            <template #cell="{ record }">
              <a-select
                v-if="checkInfo.status === 'checking' && record.diff !== 0"
                v-model="record.reason"
                placeholder="选择原因"
                size="small"
                allow-create
              >
                <a-option value="入库漏登">入库漏登</a-option>
                <a-option value="出库漏登">出库漏登</a-option>
                <a-option value="计量误差">计量误差</a-option>
                <a-option value="自然损耗">自然损耗</a-option>
                <a-option value="运输破损">运输破损</a-option>
                <a-option value="其他">其他</a-option>
              </a-select>
              <span v-else>{{ record.reason || '-' }}</span>
            </template>
          </a-table-column>
          <a-table-column title="盘点状态" :width="100">
            <template #cell="{ record }">
              <a-tag :color="record.checked ? 'green' : 'gray'" size="small">
                {{ record.checked ? '已盘点' : '待盘点' }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="操作" :width="100" fixed="right">
            <template #cell="{ record }">
              <a-button
                v-if="checkInfo.status === 'checking' && !record.checked"
                type="text"
                size="small"
                @click="handleConfirmCheck(record)"
              >
                确认
              </a-button>
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
import { Message } from '@arco-design/web-vue'

const router = useRouter()

const searchKeyword = ref('')
const diffFilter = ref('')

const checkInfo = ref({
  id: 'c1',
  checkNo: 'PD202403240001',
  checkType: 'full',
  status: 'checking',
  createdAt: '2024-03-24 10:00:00',
  profitQty: 12,
  lossQty: 5,
})

const productList = ref([
  { id: 'p1', productCode: 'SKU-SN-001', productName: '水泥 P.O 42.5', spec: '50kg/袋', unit: '吨', bookQty: 100, actualQty: 105, diff: 5, reason: '入库漏登', checked: true },
  { id: 'p2', productCode: 'SKU-LW-001', productName: '螺纹钢 HRB400 16mm', spec: '12m/根', unit: '吨', bookQty: 50, actualQty: 48, diff: -2, reason: '锈蚀损耗', checked: true },
  { id: 'p3', productCode: 'SKU-FS-001', productName: '防水涂料', spec: '20kg/桶', unit: '桶', bookQty: 80, actualQty: 82, diff: 2, reason: '计量误差', checked: true },
  { id: 'p4', productCode: 'SKU-CZ-001', productName: '瓷砖 800x800', spec: '800x800mm', unit: '片', bookQty: 200, actualQty: 195, diff: -5, reason: '运输破损', checked: true },
  { id: 'p5', productCode: 'SKU-GL-001', productName: 'PVC管材 DN110', spec: '4m/根', unit: '根', bookQty: 150, actualQty: 150, diff: 0, reason: '', checked: true },
  { id: 'p6', productCode: 'SKU-GL-002', productName: 'PPR管材 DN25', spec: '4m/根', unit: '根', bookQty: 200, actualQty: 200, diff: 0, price: 18, reason: '', checked: true },
  { id: 'p7', productCode: 'SKU-DL-001', productName: '电线 BV 2.5', spec: '100m/卷', unit: '卷', bookQty: 50, actualQty: 48, diff: -2, reason: '', checked: false },
  { id: 'p8', productCode: 'SKU-DL-002', productName: '电线 BV 4', spec: '100m/卷', unit: '卷', bookQty: 30, actualQty: 30, diff: 0, reason: '', checked: false },
  { id: 'p9', productCode: 'SKU-PS-001', productName: '配电箱', spec: '400x300mm', unit: '个', bookQty: 20, actualQty: 20, diff: 0, reason: '', checked: false },
  { id: 'p10', productCode: 'SKU-KG-001', productName: '开关面板', spec: '86型', unit: '个', bookQty: 100, actualQty: 100, diff: 0, reason: '', checked: false },
])

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 10,
})

const filteredProducts = computed(() => {
  let result = productList.value
  if (searchKeyword.value) {
    result = result.filter(p =>
      p.productName.includes(searchKeyword.value) ||
      p.productCode.includes(searchKeyword.value)
    )
  }
  if (diffFilter.value) {
    if (diffFilter.value === 'profit') {
      result = result.filter(p => p.diff > 0)
    } else if (diffFilter.value === 'loss') {
      result = result.filter(p => p.diff < 0)
    } else if (diffFilter.value === 'none') {
      result = result.filter(p => p.diff === 0)
    }
  }
  return result
})

const checkedCount = computed(() => productList.value.filter(p => p.checked).length)

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

function getDiffClass(diff: number) {
  if (diff > 0) return 'text-success'
  if (diff < 0) return 'text-danger'
  return ''
}

function handleActualQtyChange(record: any) {
  record.diff = record.actualQty - record.bookQty
}

function handleConfirmCheck(record: any) {
  if (record.diff !== 0 && !record.reason) {
    Message.warning('请选择差异原因')
    return
  }
  record.checked = true
  Message.success('盘点确认成功')
}

function handleSubmitCheck() {
  const unchecked = productList.value.filter(p => !p.checked)
  if (unchecked.length > 0) {
    Message.warning(`还有 ${unchecked.length} 个商品未盘点`)
    return
  }
  const withDiffNoReason = productList.value.filter(p => p.diff !== 0 && !p.reason)
  if (withDiffNoReason.length > 0) {
    Message.warning('有差异的商品必须填写原因')
    return
  }
  checkInfo.value.status = 'pending_review'
  Message.success('已提交审核')
}

function handleBack() {
  router.back()
}
</script>

<style lang="less" scoped>
.stock-check-detail {
  padding: 16px;
}

.mb-16 {
  margin-bottom: 16px;
}

.table-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.check-progress {
  font-size: 13px;
  color: var(--color-text-2);
}

.text-success {
  color: var(--color-success);
}

.text-danger {
  color: var(--color-danger);
}
</style>
