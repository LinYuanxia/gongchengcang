<template>
  <div class="page-container">
    <a-card :bordered="false">
      <template #title>
        <span>采购计划</span>
      </template>
      <template #extra>
        <a-space>
          <a-button type="primary" @click="handleCreatePlan">
            <template #icon><icon-plus /></template>
            新建采购计划
          </a-button>
          <a-radio-group v-model="viewMode" type="button">
            <a-radio value="all">全部</a-radio>
            <a-radio value="pending">待处理</a-radio>
            <a-radio value="confirmed">已确认</a-radio>
          </a-radio-group>
        </a-space>
      </template>

      <a-table
        :data="filteredPlans"
        :loading="loading"
        :pagination="pagination"
        row-key="id"
        @page-change="handlePageChange"
      >
        <template #columns>
          <a-table-column title="计划编号" data-index="planNo" :width="150" />
          <a-table-column title="计划名称" data-index="planName" :width="200" />
          <a-table-column title="SKU数量" :width="100" align="center">
            <template #cell="{ record }">
              {{ record.skuCount }} 个
            </template>
          </a-table-column>
          <a-table-column title="预计金额" :width="120" align="right">
            <template #cell="{ record }">
              ¥{{ record.estimatedAmount?.toLocaleString() || '0' }}
            </template>
          </a-table-column>
          <a-table-column title="推送时间" :width="160">
            <template #cell="{ record }">
              {{ record.pushTime }}
            </template>
          </a-table-column>
          <a-table-column title="截止时间" :width="160">
            <template #cell="{ record }">
              <span :class="{ 'text-danger': isExpired(record.deadline) }">
                {{ record.deadline || '-' }}
              </span>
            </template>
          </a-table-column>
          <a-table-column title="状态" :width="100">
            <template #cell="{ record }">
              <a-tag :color="getStatusColor(record.status)">
                {{ getStatusText(record.status) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="操作" :width="200" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-button type="text" size="small" @click="handleView(record)">查看</a-button>
                <a-button 
                  v-if="record.status === 'pending'" 
                  type="text" 
                  size="small" 
                  status="success"
                  @click="handleConfirm(record)"
                >
                  确认下单
                </a-button>
                <a-button 
                  v-if="record.status === 'confirmed' || record.status === 'ordered'" 
                  type="text" 
                  size="small"
                  @click="handleViewOrder(record)"
                >
                  查看订单
                </a-button>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <a-modal 
      v-model:visible="detailVisible" 
      title="采购计划详情" 
      :width="1000"
      :footer="false"
    >
      <a-descriptions :column="3" bordered>
        <a-descriptions-item label="计划编号">{{ currentPlan.planNo }}</a-descriptions-item>
        <a-descriptions-item label="计划名称">{{ currentPlan.planName }}</a-descriptions-item>
        <a-descriptions-item label="预计金额">¥{{ currentPlan.estimatedAmount?.toLocaleString() }}</a-descriptions-item>
        <a-descriptions-item label="推送时间">{{ currentPlan.pushTime }}</a-descriptions-item>
        <a-descriptions-item label="截止时间">{{ currentPlan.deadline || '-' }}</a-descriptions-item>
        <a-descriptions-item label="状态">
          <a-tag :color="getStatusColor(currentPlan.status)">
            {{ getStatusText(currentPlan.status) }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="计划说明" :span="3">{{ currentPlan.description || '-' }}</a-descriptions-item>
      </a-descriptions>

      <a-divider>采购商品清单</a-divider>

      <a-table :data="currentPlan.skuList || []" :pagination="false">
        <template #columns>
          <a-table-column title="SKU编码" data-index="skuCode" :width="120" />
          <a-table-column title="商品名称" :width="200">
            <template #cell="{ record }">
              <div>{{ record.productName }}</div>
              <div class="sub-text">{{ record.specValues }}</div>
            </template>
          </a-table-column>
          <a-table-column title="单位" data-index="unit" :width="60" align="center" />
          <a-table-column title="建议采购量" data-index="quantity" :width="100" align="center" />
          <a-table-column title="供货价" :width="100" align="right">
            <template #cell="{ record }">
              ¥{{ record.referencePrice }}
            </template>
          </a-table-column>
          <a-table-column title="预计金额" :width="100" align="right">
            <template #cell="{ record }">
              ¥{{ (record.quantity * record.referencePrice).toFixed(2) }}
            </template>
          </a-table-column>
          <a-table-column title="备注" data-index="remark" :width="150" />
        </template>
      </a-table>

      <div v-if="currentPlan.status === 'pending'" style="margin-top: 24px; text-align: right">
        <a-button type="primary" @click="handleConfirmFromDetail">
          确认下单
        </a-button>
      </div>
    </a-modal>

    <a-modal 
      v-model:visible="confirmVisible" 
      title="确认采购计划" 
      :width="1100"
      :footer="false"
      unmount-on-close
    >
      <a-alert type="info" style="margin-bottom: 16px">
        请确认采购商品清单，可调整实际采购数量。确认后将生成采购订单发送给供应商。
      </a-alert>

      <a-descriptions :column="3" bordered size="small">
        <a-descriptions-item label="计划编号">{{ currentPlan.planNo }}</a-descriptions-item>
        <a-descriptions-item label="计划名称">{{ currentPlan.planName }}</a-descriptions-item>
        <a-descriptions-item label="预计金额">¥{{ currentPlan.estimatedAmount?.toLocaleString() }}</a-descriptions-item>
      </a-descriptions>

      <a-divider>采购商品清单</a-divider>

      <a-table :data="confirmSkuList" :pagination="false">
        <template #columns>
          <a-table-column title="SKU编码" data-index="skuCode" :width="120" />
          <a-table-column title="商品名称" :width="180">
            <template #cell="{ record }">
              <div>{{ record.productName }}</div>
              <div class="sub-text">{{ record.specValues }}</div>
            </template>
          </a-table-column>
          <a-table-column title="单位" data-index="unit" :width="60" align="center" />
          <a-table-column title="建议采购量" :width="100" align="center">
            <template #cell="{ record }">
              {{ record.suggestQuantity }}
            </template>
          </a-table-column>
          <a-table-column title="实际采购量" :width="120">
            <template #cell="{ record }">
              <a-input-number 
                v-model="record.quantity" 
                :min="0" 
                :max="99999"
                style="width: 100%"
              />
            </template>
          </a-table-column>
          <a-table-column title="供货价" :width="100" align="right">
            <template #cell="{ record }">
              ¥{{ record.referencePrice }}
            </template>
          </a-table-column>
          <a-table-column title="预计金额" :width="100" align="right">
            <template #cell="{ record }">
              ¥{{ (record.quantity * record.referencePrice).toFixed(2) }}
            </template>
          </a-table-column>
          <a-table-column title="绑定供应商" :width="200">
            <template #cell="{ record }">
              <div class="supplier-info">
                <div class="supplier-name">
                  <icon-check-circle-fill class="success-icon" />
                  {{ record.boundSupplier.name }}
                </div>
                <div class="supplier-price">供货价：¥{{ record.boundSupplier.price }}</div>
              </div>
            </template>
          </a-table-column>
          <a-table-column title="操作" :width="80" fixed="right">
            <template #cell="{ rowIndex }">
              <a-button 
                type="text" 
                size="small" 
                status="danger"
                @click="handleRemoveConfirmSku(rowIndex)"
              >
                移除
              </a-button>
            </template>
          </a-table-column>
        </template>
      </a-table>

      <div class="confirm-footer">
        <div class="summary">
          <span>共 <strong>{{ confirmSkuList.length }}</strong> 个SKU</span>
          <span style="margin-left: 24px">
            实际采购金额：<strong class="highlight">¥{{ totalConfirmAmount }}</strong>
          </span>
        </div>
        <a-space>
          <a-button @click="confirmVisible = false">取消</a-button>
          <a-button type="primary" @click="handleSubmitOrder">
            确认下单
          </a-button>
        </a-space>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'

const router = useRouter()
const loading = ref(false)
const viewMode = ref('all')

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 50
})

const planList = ref([
  {
    id: '1',
    planId: 'PLAN001',
    planNo: 'PO202401001',
    planName: '2024年1月建材采购计划',
    skuCount: 15,
    estimatedAmount: 125800,
    status: 'pending',
    pushTime: '2024-01-15 14:00:00',
    deadline: '2024-01-20 18:00:00',
    description: '本月常规建材补货计划'
  },
  {
    id: '2',
    planId: 'PLAN002',
    planNo: 'PO202401002',
    planName: '春节前备货计划',
    skuCount: 28,
    estimatedAmount: 356000,
    status: 'confirmed',
    pushTime: '2024-01-18 11:00:00',
    deadline: '2024-01-25 18:00:00',
    confirmTime: '2024-01-19 15:30:00',
    orderNo: 'SO202401001'
  },
  {
    id: '3',
    planId: 'PLAN003',
    planNo: 'PO202401003',
    planName: '新项目启动采购',
    skuCount: 42,
    estimatedAmount: 528000,
    status: 'ordered',
    pushTime: '2024-01-20 16:00:00',
    confirmTime: '2024-01-21 10:00:00',
    orderNo: 'SO202401002'
  },
  {
    id: '4',
    planId: 'PLAN004',
    planNo: 'PO202401004',
    planName: '瓷砖补货计划',
    skuCount: 8,
    estimatedAmount: 45000,
    status: 'pending',
    pushTime: '2024-01-22 10:00:00',
    deadline: '2024-01-27 18:00:00'
  }
])

const filteredPlans = computed(() => {
  if (viewMode.value === 'all') return planList.value
  if (viewMode.value === 'pending') return planList.value.filter(p => p.status === 'pending')
  if (viewMode.value === 'confirmed') return planList.value.filter(p => ['confirmed', 'ordered'].includes(p.status))
  return planList.value
})

const detailVisible = ref(false)
const currentPlan = ref<any>({})

const confirmVisible = ref(false)
const confirmSkuList = ref<any[]>([])

const totalConfirmAmount = computed(() => {
  return confirmSkuList.value.reduce((sum, item) => sum + item.quantity * item.referencePrice, 0).toFixed(2)
})

function isExpired(deadline: string) {
  if (!deadline) return false
  return new Date(deadline) < new Date()
}

function handlePageChange(page: number) {
  pagination.current = page
}

function handleView(record: any) {
  currentPlan.value = {
    ...record,
    skuList: [
      { skuCode: 'SKU001', productName: '普通硅酸盐水泥P.O42.5', specValues: '50kg/袋', unit: '袋', referencePrice: 28, quantity: 100, remark: '' },
      { skuCode: 'SKU003', productName: '抛光砖', specValues: '800×800mm', unit: '片', referencePrice: 45, quantity: 500, remark: '优先选择广东品牌' },
      { skuCode: 'SKU004', productName: '内墙乳胶漆', specValues: '20L/桶', unit: '桶', referencePrice: 380, quantity: 20, remark: '' }
    ]
  }
  detailVisible.value = true
}

function handleConfirm(record: any) {
  currentPlan.value = record
  confirmSkuList.value = [
    { 
      skuCode: 'SKU001', 
      productName: '普通硅酸盐水泥P.O42.5', 
      specValues: '50kg/袋', 
      unit: '袋', 
      referencePrice: 26, 
      suggestQuantity: 100, 
      quantity: 100,
      boundSupplier: { id: 'SUP001', name: '广东建材供应商', price: 26 }
    },
    { 
      skuCode: 'SKU003', 
      productName: '抛光砖', 
      specValues: '800×800mm', 
      unit: '片', 
      referencePrice: 42, 
      suggestQuantity: 500, 
      quantity: 500,
      boundSupplier: { id: 'SUP003', name: '佛山陶瓷供应商', price: 42 }
    },
    { 
      skuCode: 'SKU004', 
      productName: '内墙乳胶漆', 
      specValues: '20L/桶', 
      unit: '桶', 
      referencePrice: 360, 
      suggestQuantity: 20, 
      quantity: 20,
      boundSupplier: { id: 'SUP005', name: '广州涂料供应商', price: 360 }
    }
  ]
  detailVisible.value = false
  confirmVisible.value = true
}

function handleConfirmFromDetail() {
  detailVisible.value = false
  handleConfirm(currentPlan.value)
}

function handleRemoveConfirmSku(index: number) {
  confirmSkuList.value.splice(index, 1)
}

function handleSubmitOrder() {
  const validItems = confirmSkuList.value.filter(item => item.quantity > 0)
  if (validItems.length === 0) {
    Message.warning('请至少保留一个采购商品')
    return
  }

  Message.success('采购订单已提交给绑定供应商，等待确认')
  currentPlan.value.status = 'confirmed'
  currentPlan.value.confirmTime = new Date().toLocaleString()
  confirmVisible.value = false
}

function handleViewOrder(record: any) {
  Message.info(`查看订单详情：${record.orderNo}`)
}

function handleCreatePlan() {
  router.push('/warehouse/plan/create')
}

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    pending: 'orange',
    confirmed: 'cyan',
    ordered: 'blue',
    completed: 'green',
    cancelled: 'red'
  }
  return colors[status] || 'gray'
}

function getStatusText(status: string) {
  const texts: Record<string, string> = {
    pending: '待确认',
    confirmed: '已确认',
    ordered: '已下单',
    completed: '已完成',
    cancelled: '已取消'
  }
  return texts[status] || status
}
</script>

<style lang="less" scoped>
.page-container {
  padding: 16px;
}

.text-danger {
  color: rgb(var(--danger-6));
}

.sub-text {
  font-size: 12px;
  color: var(--color-text-3);
}

.confirm-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid var(--color-border);

  .summary {
    color: var(--color-text-2);
    
    strong {
      color: var(--color-text-1);
      
      &.highlight {
        color: rgb(var(--primary-6));
        font-size: 18px;
      }
    }
  }
}

.supplier-info {
  .supplier-name {
    display: flex;
    align-items: center;
    gap: 4px;
    font-weight: 500;
    
    .success-icon {
      color: rgb(var(--success-6));
    }
  }
  
  .supplier-price {
    font-size: 12px;
    color: var(--color-text-3);
    margin-top: 2px;
  }
}
</style>
