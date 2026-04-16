<template>
  <div class="page-container">
    <PrdPanel :items="prdModules" />
    <a-card :bordered="false">
      <template #title>
        <span>采购计划</span>
      </template>
      <template #extra>
        <a-space>
          <a-select v-model="currentWarehouse" placeholder="选择仓库" style="width: 200px" allow-clear>
            <a-option value="WH001-S01">西乡主仓</a-option>
            <a-option value="WH001-S02">福永分仓</a-option>
            <a-option value="WH001-S03">沙井应急仓</a-option>
            <a-option value="WH002-S01">天河智慧城仓</a-option>
            <a-option value="WH002-S02">黄埔分仓</a-option>
            <a-option value="WH003-S01">南城中心仓</a-option>
          </a-select>
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
          <a-table-column title="所属仓库" data-index="warehouseName" :width="140">
            <template #cell="{ record }">
              <a-tag color="arcoblue" size="small">{{ record.warehouseName || '全部仓库' }}</a-tag>
            </template>
          </a-table-column>
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
        <a-descriptions-item label="所属仓库">{{ currentPlan.warehouseName || '全部仓库' }}</a-descriptions-item>
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
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import PrdPanel from '@/components/PrdPanel/index.vue'

const prdModules = [
  {
    moduleName: '业务流程图',
    content: `
## 工程仓向供应商采购业务流程图

\`\`\`mermaid
graph TD
    A[工程仓创建采购计划] --> B[生成采购订单<br/>状态：待确认 to_confirm]
    B --> C[供应商端接收订单]
    C --> D{供应商确认?}
    D -->|拒绝| Z[订单取消]
    D -->|接受| E[订单状态更新：已确认 confirmed<br/>支付状态：待支付 unpaid]
    
    E --> E1[🔄 支付与发货解耦 并行执行]
    
    %% 支付分支 - 支持分批支付
    E1 --> F[支付流程：支持分批支付]
    F --> F1{是否分批支付?}
    F1 -->|全额| F2[上传银行转账凭证<br/>支付状态：已支付 paid]
    F1 -->|分批| F3[第一次付款 50%<br/>支付状态：部分支付 partial]
    F3 --> F4[第二次付款 30%<br/>支付状态：部分支付 partial]
    F4 --> F5[尾款支付 20%<br/>支付状态：已支付 paid]
    
    %% 发货分支 - 支持分批发货
    E1 --> G[发货流程：支持分批发货]
    G --> G1{是否分批发货?}
    G1 -->|一次性发货| G2[供应商创建发货单<br/>订单状态：发货中 shipping]
    G1 -->|分批发货| G3[第一批发货 50%<br/>生成发货单01]
    G3 --> G4[第二批发货 30%<br/>生成发货单02]
    G4 --> G5[尾款发货 20%<br/>生成发货单03]
    
    %% 收货分支 - 支持分批收货/批次管理
    G2 --> H[收货流程：批次管理]
    G5 --> H
    
    H --> H1[工程仓分批验收]
    H1 --> H2[第一批收货<br/>生成收货批次 + 入库单]
    H2 --> H3[第二批收货<br/>生成收货批次 + 入库单]
    H3 --> H4[收货全部完成<br/>订单状态：已收货 received]
    
    %% 最终完成条件
    H4 --> I{最终完成条件校验}
    F5 --> I
    F2 --> I
    I -->|全部支付 + 全部收货| J[订单标记：已完成 completed]
    
    %% 数据关联说明
    style E1 fill:#ff7d00,stroke:#ff7d00,color:white,stroke-width:2px
    style I fill:#00b42a,stroke:#00b42a,color:white,stroke-width:2px
\`\`\`

> **核心设计要点：支付与发货解耦**
> - ✅ 供应商确认订单后即可发货，无需等待支付
> - ✅ 支付状态仅在最终完成时校验，不影响中间流程
> - ✅ 支持任意次数的分批支付/发货/收货
> - ✅ 所有操作均关联原始订单ID
    `
  },
  {
    moduleName: '数据流转关系图',
    content: `
## 核心单据数据流转

\`\`\`mermaid
erDiagram
    采购计划 ||--o{ 采购订单 : "生成"
    采购订单 ||--o{ 付款记录 : "1对多 分批支付"
    采购订单 ||--o{ 发货单 : "1对多 分批发货"
    发货单 ||--o{ 收货批次 : "1对多 分批收货"
    收货批次 ||--|| 入库单 : "1对1 生成入库"
    
    采购订单 {
        string orderNo PK
        string supplierName
        decimal totalAmount
        string status
        string paymentStatus
        string shipStatus
        string receiveStatus
    }
    
    付款记录 {
        string paymentNo PK
        string orderNo FK
        decimal amount
        string voucherUrl "银行转账凭证"
        datetime payTime
        string operator
    }
    
    发货单 {
        string shipmentNo PK
        string orderNo FK
        string logisticsCompany
        string logisticsNo
        datetime shipTime
        int batchNo "第N批发货"
    }
    
    收货批次 {
        string batchNo PK
        string shipmentNo FK
        string orderNo FK
        int receiveQuantity
        string warehouseName
        string inspector
        int stockAge "库龄计算"
    }
    
    入库单 {
        string inboundNo PK
        string batchNo FK
        datetime inboundTime
        string operator
    }
\`\`\`
    `
  },
  {
    moduleName: '状态机矩阵',
    content: `
## 订单状态流转矩阵

| 订单状态 | 支付状态 | 允许操作 | 约束条件 |
|---------|---------|---------|---------|
| **to_confirm 待确认** | unpaid | 供应商确认/拒绝 | - |
| **confirmed 已确认** | unpaid<br/>partial | 供应商发货<br/>工程仓付款 | ✅ **无支付约束即可发货** |
| **shipping 发货中** | unpaid<br/>partial<br/>paid | 收货<br/>继续付款 | 支付不影响收货 |
| **received 已收货** | partial | 支付尾款 | - |
| **received 已收货** | paid | 标记完成 | ✅ 支付全部完成 |
| **completed 已完成** | paid | 查看详情 | 不可逆 |

## 分批支付规则

| 支付批次 | 建议比例 | 触发时机 | 凭证要求 |
|---------|---------|---------|---------|
| 首付款 | 30%-50% | 确认订单后3日内 | 银行回单 |
| 进度款 | 30%-40% | 主要货物签收后 | 银行回单 |
| 质保金 | 5%-10% | 验收合格30天后 | 银行回单 |
    `
  },
  {
    moduleName: '收货批次设计',
    content: `
## 收货批次四层级追溯体系

\`\`\`mermaid
graph LR
    Z[采购订单] --> A[发货单1]
    Z --> B[发货单2]
    A --> C[收货批次001]
    A --> D[收货批次002]
    B --> E[收货批次003]
    C --> F[入库单IB001]
    D --> G[入库单IB002]
    E --> H[入库单IB003]
    
    C --> C1[库存记录<br/>库龄: 收货批次起算]
    C --> C2[库存预警<br/>先进先出判定]
    
    style C fill:#0fc6c2,stroke:#0fc6c2
    style D fill:#0fc6c2,stroke:#0fc6c2
    style E fill:#0fc6c2,stroke:#0fc6c2
\`\`\`

### 批次核心字段定义

| 字段 | 类型 | 业务意义 |
|-----|------|---------|
| batchNo | string | 全局唯一批次号 |
| receiveTime | datetime | 库龄起算时间点 |
| warehouseName | string | 入库位置 |
| inspector | string | 验收责任人 |
| currentStock | int | 批次剩余库存 |
| stockAge | int | 实时计算：当前时间 - receiveTime |

### 库龄预警规则
- 🟢 0-30天：正常周转
- 🟠 31-90天：周转缓慢
- 🔴 91天+：积压风险
    `
  }
]

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
    warehouseId: 'WH001-S01',
    warehouseName: '西乡主仓',
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
    warehouseId: 'WH001-S02',
    warehouseName: '福永分仓',
    skuCount: 28,
    estimatedAmount: 356000,
    status: 'confirmed',
    pushTime: '2024-01-18 11:00:00',
    deadline: '2024-01-25 18:00:00',
    confirmTime: '2024-01-19 15:30:00',
    orderNo: 'SO202401001',
    confirmedItems: [
      { skuCode: 'SKU001', productName: '32.5级普通硅酸盐水泥', specValues: '强度:32.5级', unit: '吨', planQuantity: 100, confirmedQuantity: 95 },
      { skuCode: 'SKU002', productName: '河沙（中粗）', specValues: '颗粒:中粗砂', unit: '方', planQuantity: 200, confirmedQuantity: 200 },
    ],
    totalConfirmedQuantity: 295
  },
  {
    id: '3',
    planId: 'PLAN003',
    planNo: 'PO202401003',
    planName: '新项目启动采购',
    warehouseId: 'WH001-S03',
    warehouseName: '沙井应急仓',
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
    warehouseId: 'WH002-S01',
    warehouseName: '天河智慧城仓',
    planNo: 'PO202401004',
    planName: '瓷砖补货计划',
    skuCount: 8,
    estimatedAmount: 45000,
    status: 'pending',
    pushTime: '2024-01-22 10:00:00',
    deadline: '2024-01-27 18:00:00'
  }
])

const currentWarehouse = ref<string | undefined>(undefined)

const filteredPlans = computed(() => {
  let result = planList.value
  
  if (currentWarehouse.value) {
    result = result.filter(p => !p.warehouseId || p.warehouseId === currentWarehouse.value)
  }
  
  if (viewMode.value === 'pending') return result.filter(p => p.status === 'pending')
  if (viewMode.value === 'confirmed') return result.filter(p => ['confirmed', 'ordered'].includes(p.status))
  return result
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
  router.push('/warehouse/market/plan/create')
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
