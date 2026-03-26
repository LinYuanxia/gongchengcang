<template>
  <div class="page-container">
    <a-card :bordered="false">
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
          <a-button v-if="checkInfo.status === 'pending_review'" type="primary" status="success" @click="handleApprove">
            审核通过
          </a-button>
          <a-button v-if="checkInfo.status === 'pending_review'" type="outline" status="danger" @click="handleReject">
            驳回
          </a-button>
        </a-space>
      </template>

      <a-descriptions :column="4" bordered size="small" class="mb-16">
        <a-descriptions-item label="盘点单号">{{ checkInfo.checkNo }}</a-descriptions-item>
        <a-descriptions-item label="盘点仓库">{{ checkInfo.warehouseName }}</a-descriptions-item>
        <a-descriptions-item label="盘点类型">
          <a-tag :color="checkInfo.checkType === 'full' ? 'blue' : 'purple'">
            {{ checkInfo.checkType === 'full' ? '全盘' : '抽盘' }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="状态">
          <a-tag :color="getStatusColor(checkInfo.status)">{{ getStatusText(checkInfo.status) }}</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="创建人">{{ checkInfo.creator }}</a-descriptions-item>
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

      <a-tabs v-model:active-key="activeTab">
        <a-tab-pane key="products" title="盘点商品">
          <div class="table-actions">
            <a-space>
              <a-input-search
                v-model="searchKeyword"
                placeholder="搜索商品名称/编码"
                style="width: 200px"
                @search="handleSearchProduct"
              />
              <a-select v-model="diffFilter" placeholder="差异筛选" style="width: 120px" allow-clear>
                <a-option value="profit">盘盈</a-option>
                <a-option value="loss">盘亏</a-option>
                <a-option value="none">无差异</a-option>
              </a-select>
            </a-space>
            <a-space>
              <span class="check-progress">
                盘点进度：{{ checkedCount }}/{{ productList.length }}
              </span>
              <a-progress
                :percent="checkedCount / productList.length * 100"
                :stroke-width="6"
                style="width: 120px"
              />
            </a-space>
          </div>

          <a-table
            :data="filteredProducts"
            :pagination="pagination"
            :scroll="{ x: 1200 }"
          >
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
        </a-tab-pane>

        <a-tab-pane key="summary" title="差异汇总">
          <a-row :gutter="16" class="mb-16">
            <a-col :span="6">
              <a-card>
                <a-statistic title="盘点商品数" :value="productList.length" />
              </a-card>
            </a-col>
            <a-col :span="6">
              <a-card>
                <a-statistic title="盘盈商品数" :value="profitProducts.length" :value-style="{ color: '#00b42a' }" />
              </a-card>
            </a-col>
            <a-col :span="6">
              <a-card>
                <a-statistic title="盘亏商品数" :value="lossProducts.length" :value-style="{ color: '#f53f3f' }" />
              </a-card>
            </a-col>
            <a-col :span="6">
              <a-card>
                <a-statistic
                  title="差异金额"
                  :value="totalDiffAmount"
                  :precision="2"
                  :value-style="{ color: totalDiffAmount >= 0 ? '#00b42a' : '#f53f3f' }"
                >
                  <template #prefix>¥</template>
                </a-statistic>
              </a-card>
            </a-col>
          </a-row>

          <a-divider orientation="left">盘盈商品</a-divider>
          <a-table :data="profitProducts" :pagination="false" size="small">
            <template #columns>
              <a-table-column title="商品名称" data-index="productName" :width="180" />
              <a-table-column title="账面数量" data-index="bookQty" :width="100" align="right" />
              <a-table-column title="实盘数量" data-index="actualQty" :width="100" align="right" />
              <a-table-column title="盘盈数量" :width="100" align="right">
                <template #cell="{ record }">
                  <span class="text-success">+{{ record.diff }}</span>
                </template>
              </a-table-column>
              <a-table-column title="单价" :width="100" align="right">
                <template #cell="{ record }">
                  ¥{{ record.price }}
                </template>
              </a-table-column>
              <a-table-column title="盘盈金额" :width="120" align="right">
                <template #cell="{ record }">
                  <span class="text-success">+¥{{ (record.diff * record.price).toLocaleString() }}</span>
                </template>
              </a-table-column>
              <a-table-column title="原因" data-index="reason" :width="150" />
            </template>
          </a-table>

          <a-divider orientation="left">盘亏商品</a-divider>
          <a-table :data="lossProducts" :pagination="false" size="small">
            <template #columns>
              <a-table-column title="商品名称" data-index="productName" :width="180" />
              <a-table-column title="账面数量" data-index="bookQty" :width="100" align="right" />
              <a-table-column title="实盘数量" data-index="actualQty" :width="100" align="right" />
              <a-table-column title="盘亏数量" :width="100" align="right">
                <template #cell="{ record }">
                  <span class="text-danger">{{ record.diff }}</span>
                </template>
              </a-table-column>
              <a-table-column title="单价" :width="100" align="right">
                <template #cell="{ record }">
                  ¥{{ record.price }}
                </template>
              </a-table-column>
              <a-table-column title="盘亏金额" :width="120" align="right">
                <template #cell="{ record }">
                  <span class="text-danger">-¥{{ Math.abs(record.diff * record.price).toLocaleString() }}</span>
                </template>
              </a-table-column>
              <a-table-column title="原因" data-index="reason" :width="150" />
            </template>
          </a-table>
        </a-tab-pane>

        <a-tab-pane key="logs" title="操作记录">
          <a-timeline>
            <a-timeline-item v-for="log in checkLogs" :key="log.id">
              <div class="log-item">
                <div class="log-header">
                  <span class="log-action">{{ log.action }}</span>
                  <span class="log-time">{{ log.time }}</span>
                </div>
                <div class="log-user">操作人：{{ log.operator }}</div>
                <div v-if="log.remark" class="log-remark">备注：{{ log.remark }}</div>
              </div>
            </a-timeline-item>
          </a-timeline>
        </a-tab-pane>
      </a-tabs>
    </a-card>

    <a-modal
      v-model:visible="rejectModalVisible"
      title="驳回原因"
      @ok="handleRejectConfirm"
    >
      <a-form layout="vertical">
        <a-form-item label="驳回原因" required>
          <a-textarea v-model="rejectReason" placeholder="请输入驳回原因" :max-length="200" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'

const route = useRoute()
const router = useRouter()

const activeTab = ref('products')
const searchKeyword = ref('')
const diffFilter = ref('')

const checkInfo = ref({
  id: 'c1',
  checkNo: 'PD202403240001',
  warehouseId: 'w1',
  warehouseName: '深圳湾科技园主仓',
  checkType: 'full',
  status: 'checking',
  creator: '张三',
  createdAt: '2024-03-24 10:00:00',
  profitQty: 12,
  lossQty: 5,
})

const productList = ref([
  { id: 'p1', productCode: 'SKU-SN-001', productName: '水泥 P.O 42.5', spec: '50kg/袋', unit: '吨', bookQty: 100, actualQty: 105, diff: 5, price: 380, reason: '入库漏登', checked: true },
  { id: 'p2', productCode: 'SKU-LW-001', productName: '螺纹钢 HRB400 16mm', spec: '12m/根', unit: '吨', bookQty: 50, actualQty: 48, diff: -2, price: 4100, reason: '锈蚀损耗', checked: true },
  { id: 'p3', productCode: 'SKU-FS-001', productName: '防水涂料', spec: '20kg/桶', unit: '桶', bookQty: 80, actualQty: 82, diff: 2, price: 280, reason: '计量误差', checked: true },
  { id: 'p4', productCode: 'SKU-CZ-001', productName: '瓷砖 800x800', spec: '800x800mm', unit: '片', bookQty: 200, actualQty: 195, diff: -5, price: 45, reason: '运输破损', checked: true },
  { id: 'p5', productCode: 'SKU-GL-001', productName: 'PVC管材 DN110', spec: '4m/根', unit: '根', bookQty: 150, actualQty: 150, diff: 0, price: 35, reason: '', checked: true },
  { id: 'p6', productCode: 'SKU-GL-002', productName: 'PPR管材 DN25', spec: '4m/根', unit: '根', bookQty: 200, actualQty: 200, diff: 0, price: 18, reason: '', checked: true },
  { id: 'p7', productCode: 'SKU-DL-001', productName: '电线 BV 2.5', spec: '100m/卷', unit: '卷', bookQty: 50, actualQty: 48, diff: -2, price: 120, reason: '', checked: false },
  { id: 'p8', productCode: 'SKU-DL-002', productName: '电线 BV 4', spec: '100m/卷', unit: '卷', bookQty: 30, actualQty: 30, diff: 0, price: 180, reason: '', checked: false },
  { id: 'p9', productCode: 'SKU-PS-001', productName: '配电箱', spec: '400x300mm', unit: '个', bookQty: 20, actualQty: 20, diff: 0, price: 350, reason: '', checked: false },
  { id: 'p10', productCode: 'SKU-KG-001', productName: '开关面板', spec: '86型', unit: '个', bookQty: 100, actualQty: 100, diff: 0, price: 25, reason: '', checked: false },
])

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 10,
})

const checkLogs = ref([
  { id: 'l1', action: '创建盘点单', time: '2024-03-24 10:00:00', operator: '张三', remark: '全盘' },
  { id: 'l2', action: '开始盘点', time: '2024-03-24 10:30:00', operator: '张三', remark: '' },
  { id: 'l3', action: '盘点商品：水泥 P.O 42.5', time: '2024-03-24 10:35:00', operator: '张三', remark: '盘盈5吨' },
  { id: 'l4', action: '盘点商品：螺纹钢 HRB400 16mm', time: '2024-03-24 10:40:00', operator: '张三', remark: '盘亏2吨' },
])

const rejectModalVisible = ref(false)
const rejectReason = ref('')

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

const profitProducts = computed(() => productList.value.filter(p => p.diff > 0))

const lossProducts = computed(() => productList.value.filter(p => p.diff < 0))

const totalDiffAmount = computed(() => {
  return productList.value.reduce((sum, p) => sum + p.diff * p.price, 0)
})

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

function handleSearchProduct() {
  pagination.current = 1
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

function handleApprove() {
  checkInfo.value.status = 'completed'
  Message.success('审核通过，库存已调整')
  router.back()
}

function handleReject() {
  rejectReason.value = ''
  rejectModalVisible.value = true
}

function handleRejectConfirm() {
  if (!rejectReason.value.trim()) {
    Message.warning('请输入驳回原因')
    return
  }
  checkInfo.value.status = 'checking'
  Message.success('已驳回，请重新盘点')
  rejectModalVisible.value = false
}

function handleBack() {
  router.back()
}
</script>

<style lang="less" scoped>
.page-container {
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

.log-item {
  .log-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 4px;
    
    .log-action {
      font-weight: 500;
    }
    
    .log-time {
      font-size: 12px;
      color: var(--color-text-3);
    }
  }
  
  .log-user {
    font-size: 13px;
    color: var(--color-text-2);
  }
  
  .log-remark {
    font-size: 13px;
    color: var(--color-text-3);
    margin-top: 4px;
  }
}
</style>
