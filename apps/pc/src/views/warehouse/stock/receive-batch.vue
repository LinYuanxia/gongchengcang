<template>
  <div class="receive-batch">
    
    <div class="page-header">
      <h2 class="page-title">🧾 收货批次</h2>
      <p class="page-desc">商品批次全生命周期追溯，确保质量可追溯</p>
    </div>

    <a-card>
      <template #extra>
        <a-space>
          <a-input-search v-model="searchForm.keyword" placeholder="搜索批次号/商品" style="width: 240px" @search="handleSearch" />
          <a-button type="primary" @click="handleAddBatch">
            <template #icon><icon-plus /></template>
            新增批次
          </a-button>
        </a-space>
      </template>

      <a-row :gutter="16" class="stat-row">
        <a-col :span="6">
          <a-card :bordered="false" size="small" class="stat-card">
            <a-statistic title="有效批次" :value="156" suffix="个" />
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card :bordered="false" size="small" class="stat-card">
            <a-statistic title="30天内" :value="42" suffix="个" :value-style="{ color: 'var(--color-success-6)' }" />
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card :bordered="false" size="small" class="stat-card">
            <a-statistic title="超90天" :value="8" suffix="个" :value-style="{ color: 'var(--color-danger-6)' }" />
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card :bordered="false" size="small" class="stat-card">
            <a-statistic title="批次追溯率" :value="100" suffix="%" />
          </a-card>
        </a-col>
      </a-row>

      <a-table :data="batchList" :pagination="pagination" row-key="batchNo" class="mt-16">
        <template #columns>
          <a-table-column title="批次号" :width="180">
            <template #cell="{ record }">
              <a-link>{{ record.batchNo }}</a-link>
            </template>
          </a-table-column>
          <a-table-column title="商品信息" :width="200">
            <template #cell="{ record }">
              <div class="sku-info">
                <div class="sku-name">{{ record.skuName }}</div>
                <div class="spec-tags">
                  <a-tag v-for="(value, key) in record.specs" :key="key" size="small" color="arcoblue">
                    {{ key }}: {{ value }}
                  </a-tag>
                </div>
              </div>
            </template>
          </a-table-column>
          <a-table-column title="供应商" data-index="supplierName" :width="130" />
          <a-table-column title="所在仓库" data-index="warehouseName" :width="150" />
          <a-table-column title="采购单号" data-index="purchaseNo" :width="140">
            <template #cell="{ record }">
              <a-link>{{ record.purchaseNo }}</a-link>
            </template>
          </a-table-column>
          <a-table-column title="收货数量" :width="100" align="right">
            <template #cell="{ record }">
              {{ record.receiveQty }}
            </template>
          </a-table-column>
          <a-table-column title="当前库存" :width="100" align="right">
            <template #cell="{ record }">
              <strong>{{ record.currentStock }}</strong>
            </template>
          </a-table-column>
          <a-table-column title="已使用" :width="100" align="right">
            <template #cell="{ record }">
              {{ record.usedQty }} ({{ ((record.usedQty / record.receiveQty) * 100).toFixed(0) }}%)
            </template>
          </a-table-column>
          <a-table-column title="货损数量" :width="100" align="right">
            <template #cell="{ record }">
              <a-tag size="small">{{ record.damageQty || 0 }}</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="货损状态" :width="120" align="center">
            <template #cell="{ record }">
              <a-tag :color="record.damageStatus === 'confirmed' ? 'green' : record.damageStatus === 'pending' ? 'orange' : 'grey'" size="small">
                {{ record.damageStatus === 'confirmed' ? '供应商已确认' : record.damageStatus === 'pending' ? '待供应商确认' : '-' }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="收货时间" data-index="receiveTime" :width="160" />
          <a-table-column title="状态" :width="100">
            <template #cell="{ record }">
              <a-tag :color="record.currentStock > 0 ? 'green' : 'grey'" size="small">
                {{ record.currentStock > 0 ? '在库' : '耗尽' }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="操作" :width="150" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-link>追溯</a-link>
                <a-link v-if="record.currentStock > 0 && !record.damageStatus" @click="handleDamage(record)">货损退货</a-link>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <a-modal
      v-model:visible="addBatchModalVisible"
      title="手动新增收货批次"
      :width="650"
      @ok="handleAddBatchConfirm"
      @cancel="cancelAddBatch"
    >
      <a-alert type="info" style="margin-bottom: 16px">
        先选择采购订单，系统自动带出该订单商品信息，关联创建收货批次
      </a-alert>

      <a-form layout="vertical" ref="addBatchFormRef">
        <a-row :gutter="16">
          <a-col :span="14">
            <a-form-item label="关联采购订单" required>
              <a-select
                v-model="addBatchForm.purchaseNo"
                placeholder="请先选择采购订单"
                @change="onOrderChange"
              >
                <a-option v-for="order in purchaseOrders" :key="order.value" :value="order.value">
                  {{ order.label }}
                </a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="10">
            <a-form-item label="批次号" required>
              <a-input v-model="addBatchForm.batchNo" placeholder="点击生成">
                <template #prepend>
                  <a-button @click="generateBatchNo" size="small">生成</a-button>
                </template>
              </a-input>
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item label="订单商品" v-if="currentOrder">
          <a-card size="small" style="background: #f7f8fa;">
            <a-descriptions :column="2" size="small">
              <a-descriptions-item label="供应商">
                <a-tag color="blue">{{ currentOrder.supplier }}</a-tag>
              </a-descriptions-item>
              <a-descriptions-item label="收货仓库">
                <a-tag>{{ currentOrder.warehouse }}</a-tag>
              </a-descriptions-item>
            </a-descriptions>

            <a-table
              :data="currentOrder.items"
              :pagination="false"
              size="small"
              row-key="skuId"
              @radio-change="onSkuSelect"
            >
              <template #columns>
                <a-table-column type="radio" :width="45" />
                <a-table-column title="商品名称" data-index="skuName" />
                <a-table-column title="规格" data-index="specs" :width="150">
                  <template #cell="{ record }">
                    <a-tag v-for="(v, k) in record.specs" :key="k" size="mini">{{ v }}</a-tag>
                  </template>
                </a-table-column>
                <a-table-column title="单价" data-index="price" :width="80" align="right">
                  <template #cell="{ record }">¥{{ record.price }}</template>
                </a-table-column>
                <a-table-column title="单位" data-index="unit" :width="60" />
                <a-table-column title="待收数量" :width="90" align="right">
                  <template #cell="{ record }">
                    <strong>{{ record.pendingQty }}</strong>
                  </template>
                </a-table-column>
              </template>
            </a-table>
          </a-card>
        </a-form-item>

        <a-row :gutter="16" v-if="selectedSku">
          <a-col :span="12">
            <a-form-item label="本次收货数量" required>
              <a-input-number
                v-model="addBatchForm.receiveQty"
                :min="1"
                :max="selectedSku.pendingQty"
                :precision="0"
                placeholder="请输入收货数量"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="批次金额">
              <a-input
                :value="'¥' + (selectedSku.price * addBatchForm.receiveQty).toLocaleString()"
                readonly
                style="background: #f7f8fa;"
              />
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item label="批次备注">
          <a-textarea v-model="addBatchForm.remark" :max-length="200" placeholder="请输入批次说明、来源等" />
        </a-form-item>

        <a-form-item>
          <a-checkbox v-model="addBatchForm.autoInbound">
            <strong>创建后自动生成入库单</strong>（免检材料可直接入库）
          </a-checkbox>
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal
      v-model:visible="damageModalVisible"
      title="货损退货（需供应商售后确认）"
      :width="550"
      @ok="handleDamageConfirm"
      @cancel="cancelDamage"
    >
      <a-alert type="warning" style="margin-bottom: 16px">
        货损提交后进入「待供应商确认」状态，供应商售后确认后自动扣减订单应付金额
      </a-alert>

      <a-descriptions :column="1" bordered size="small" style="margin-bottom: 16px">
        <a-descriptions-item label="批次号">{{ currentBatch?.batchNo }}</a-descriptions-item>
        <a-descriptions-item label="商品">{{ currentBatch?.skuName }}</a-descriptions-item>
        <a-descriptions-item label="当前库存">{{ currentBatch?.currentStock }} {{ currentBatch?.unit }}</a-descriptions-item>
        <a-descriptions-item label="供应商">{{ currentBatch?.supplierName }}</a-descriptions-item>
        <a-descriptions-item label="预计扣减金额">
          <span class="text-danger">¥{{ damageAmount.toLocaleString() }}</span>
          （单价 ¥{{ currentBatch?.price || 0 }} × 数量）
        </a-descriptions-item>
      </a-descriptions>

      <a-form layout="vertical">
        <a-form-item label="货损数量" required>
          <a-input-number
            v-model="damageForm.quantity"
            :min="1"
            :max="currentBatch?.currentStock || 0"
            :precision="0"
            style="width: 100%"
            @change="calcDamageAmount"
          />
        </a-form-item>
        <a-form-item label="货损原因" required>
          <a-textarea
            v-model="damageForm.reason"
            placeholder="请输入货损原因，如：质量不合格、包装破损、过期等"
            :max-length="200"
          />
        </a-form-item>
        <a-form-item label="现场照片（可选）">
          <a-upload
            action="/"
            :limit="3"
            list-type="picture-card"
            @before-upload="handleBeforeUpload"
          >
            <span>上传图片</span>
          </a-upload>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconPlus } from '@arco-design/web-vue/es/icon'

const searchForm = reactive({
  keyword: '',
})

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
})

const batchList = ref([
  {
    batchNo: 'B202412250001',
    skuName: '水泥 P.O 42.5 袋装',
    specs: { '强度等级': '42.5', '包装': '袋装' },
    supplierName: '华润水泥',
    warehouseName: '深圳湾科技园仓',
    purchaseNo: 'PO-2024-12-001',
    receiveQty: 500,
    currentStock: 320,
    usedQty: 180,
    price: 420,
    unit: '吨',
    receiveTime: '2024-12-25 10:30:00',
  },
  {
    batchNo: 'B202412240002',
    skuName: '螺纹钢 HRB400 12mm',
    specs: { '直径': '12mm', '等级': 'HRB400' },
    supplierName: '韶钢',
    warehouseName: '深圳湾科技园仓',
    purchaseNo: 'PO-2024-12-003',
    receiveQty: 100,
    currentStock: 65,
    usedQty: 35,
    price: 4800,
    unit: '吨',
    receiveTime: '2024-12-24 09:15:00',
  },
  {
    batchNo: 'B202412200003',
    skuName: '碎石 5-31.5mm',
    specs: { '粒径': '5-31.5mm' },
    supplierName: '本地砂石厂',
    warehouseName: '福田CBD项目仓',
    purchaseNo: 'PO-2024-12-005',
    receiveQty: 1500,
    currentStock: 800,
    usedQty: 700,
    price: 85,
    unit: '方',
    stockAge: 12,
    receiveTime: '2024-12-20 14:45:00',
  },
  {
    batchNo: 'B202411150004',
    skuName: '聚氨酯防水涂料',
    specs: { '类型': '聚氨酯' },
    supplierName: '东方雨虹',
    warehouseName: '宝安新安项目仓',
    purchaseNo: 'PO-2024-11-008',
    receiveQty: 600,
    currentStock: 150,
    usedQty: 450,
    price: 320,
    unit: '桶',
    receiveTime: '2024-11-15 11:30:00',
  },
  {
    batchNo: 'B202409100005',
    skuName: 'PVC排水管',
    specs: { '规格': 'DN110' },
    supplierName: '联塑',
    warehouseName: '宝安新安项目仓',
    purchaseNo: 'PO-2024-09-012',
    receiveQty: 500,
    currentStock: 0,
    usedQty: 500,
    price: 25,
    unit: '根',
    receiveTime: '2024-09-10 10:00:00',
  },
])

const purchaseOrders = ref([
  {
    value: 'PO-2024-12-001',
    label: 'PO-2024-12-001（华润水泥）',
    supplier: '华润水泥',
    warehouse: '深圳湾科技园仓',
    items: [
      {
        skuId: 'S001',
        skuName: '水泥 P.O 42.5 袋装',
        specs: { '强度等级': '42.5', '包装': '袋装' },
        price: 420,
        unit: '吨',
        pendingQty: 500,
        orderQty: 500,
      },
    ],
  },
  {
    value: 'PO-2024-12-003',
    label: 'PO-2024-12-003（韶钢）',
    supplier: '韶钢',
    warehouse: '深圳湾科技园仓',
    items: [
      {
        skuId: 'S002',
        skuName: '螺纹钢 HRB400 12mm',
        specs: { '直径': '12mm', '等级': 'HRB400' },
        price: 4800,
        unit: '吨',
        pendingQty: 100,
        orderQty: 100,
      },
    ],
  },
  {
    value: 'PO-2024-12-005',
    label: 'PO-2024-12-005（本地砂石厂）',
    supplier: '本地砂石厂',
    warehouse: '福田CBD项目仓',
    items: [
      {
        skuId: 'S003',
        skuName: '碎石 5-31.5mm',
        specs: { '粒径': '5-31.5mm' },
        price: 85,
        unit: '方',
        pendingQty: 1500,
        orderQty: 1500,
      },
    ],
  },
  {
    value: 'PO-2024-11-008',
    label: 'PO-2024-11-008（东方雨虹）',
    supplier: '东方雨虹',
    warehouse: '宝安新安项目仓',
    items: [
      {
        skuId: 'S004',
        skuName: '聚氨酯防水涂料',
        specs: { '类型': '聚氨酯' },
        price: 320,
        unit: '桶',
        pendingQty: 600,
        orderQty: 600,
      },
      {
        skuId: 'S005',
        skuName: 'JS聚合物水泥基',
        specs: { '类型': '聚合物' },
        price: 280,
        unit: '桶',
        pendingQty: 300,
        orderQty: 300,
      },
    ],
  },
])

pagination.total = batchList.value.length

const addBatchModalVisible = ref(false)
const addBatchFormRef = ref()
const currentOrder = ref<any>(null)
const selectedSku = ref<any>(null)

const addBatchForm = reactive({
  purchaseNo: '',
  batchNo: '',
  receiveQty: 1,
  remark: '',
  autoInbound: false,
})

function generateBatchNo() {
  const date = new Date()
  const dateStr = date.getFullYear().toString() + 
    (date.getMonth() + 1).toString().padStart(2, '0') +
    date.getDate().toString().padStart(2, '0')
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  addBatchForm.batchNo = `B${dateStr}${random}`
}

function onOrderChange(purchaseNo: string) {
  currentOrder.value = purchaseOrders.value.find(o => o.value === purchaseNo) || null
  selectedSku.value = null
  addBatchForm.receiveQty = 1
}

function onSkuSelect(sku: any) {
  selectedSku.value = sku
  addBatchForm.receiveQty = Math.min(sku.pendingQty, 1)
}

function handleAddBatch() {
  addBatchForm.batchNo = ''
  addBatchForm.purchaseNo = ''
  addBatchForm.receiveQty = 1
  addBatchForm.remark = ''
  addBatchForm.autoInbound = false
  currentOrder.value = null
  selectedSku.value = null
  addBatchModalVisible.value = true
}

function handleAddBatchConfirm() {
  if (!addBatchForm.purchaseNo) {
    Message.warning('请选择采购订单')
    return
  }
  if (!addBatchForm.batchNo) {
    Message.warning('请生成批次号')
    return
  }
  if (!selectedSku.value) {
    Message.warning('请在订单商品中选择一个SKU')
    return
  }
  if (!addBatchForm.receiveQty || addBatchForm.receiveQty <= 0) {
    Message.warning('请填写收货数量')
    return
  }
  if (addBatchForm.receiveQty > selectedSku.value.pendingQty) {
    Message.warning(`收货数量不能超过待收数量 ${selectedSku.value.pendingQty}`)
    return
  }
  
  const newBatch = {
    batchNo: addBatchForm.batchNo,
    skuName: selectedSku.value.skuName,
    specs: selectedSku.value.specs,
    supplierName: currentOrder.value.supplier,
    warehouseName: currentOrder.value.warehouse,
    purchaseNo: addBatchForm.purchaseNo,
    receiveQty: addBatchForm.receiveQty,
    currentStock: addBatchForm.receiveQty,
    usedQty: 0,
    price: selectedSku.value.price,
    unit: selectedSku.value.unit,
    remark: addBatchForm.remark,
    receiveTime: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
  }
  
  batchList.value.unshift(newBatch as any)
  pagination.total = batchList.value.length
  
  if (addBatchForm.autoInbound) {
    const date = new Date()
    const dateStr = date.getFullYear().toString() + 
      (date.getMonth() + 1).toString().padStart(2, '0') +
      date.getDate().toString().padStart(2, '0')
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    const inNo = `IN${dateStr}${random}`

    Message.success(`批次 ${newBatch.batchNo} 创建成功，已自动生成入库单 ${inNo}`)
  } else {
    Message.success(`批次 ${newBatch.batchNo} 创建成功，请前往「入库管理」办理正式入库`)
  }
  
  addBatchModalVisible.value = false
}

function cancelAddBatch() {
  addBatchModalVisible.value = false
}

const damageModalVisible = ref(false)
const currentBatch = ref<any>(null)
const damageForm = ref({
  quantity: 0,
  reason: '',
})
const damageAmount = ref(0)

function calcDamageAmount() {
  damageAmount.value = (currentBatch.value?.price || 0) * damageForm.value.quantity
}

function handleDamage(record: any) {
  currentBatch.value = record
  damageForm.value = {
    quantity: Math.min(1, record.currentStock),
    reason: '',
  }
  damageAmount.value = (record.price || 0) * damageForm.value.quantity
  damageModalVisible.value = true
}

function handleDamageConfirm() {
  if (!damageForm.value.quantity || damageForm.value.quantity <= 0) {
    Message.warning('请填写货损数量')
    return
  }
  if (!damageForm.value.reason.trim()) {
    Message.warning('请填写货损原因')
    return
  }
  
  if (currentBatch.value) {
    const index = batchList.value.findIndex(b => b.batchNo === currentBatch.value.batchNo)
    if (index > -1) {
      batchList.value[index].damageQty = damageForm.value.quantity
      batchList.value[index].damageStatus = 'pending'
      batchList.value[index].damageReason = damageForm.value.reason
      batchList.value[index].damageAmount = damageAmount.value
    }
  }
  
  Message.success(`货损已提交，等待供应商售后确认，预计扣减应付金额：¥${damageAmount.value.toLocaleString()}`)
  damageModalVisible.value = false
}

function cancelDamage() {
  damageModalVisible.value = false
}

function handleBeforeUpload(file: File) {
  const isImage = file.type.startsWith('image/')
  const isLt5M = file.size / 1024 / 1024 < 5
  if (!isImage) {
    Message.warning('只能上传图片文件!')
  }
  if (!isLt5M) {
    Message.warning('图片大小不能超过 5MB!')
  }
  return false
}

function handleSearch() {
  pagination.current = 1
}

const prdModules = [
  {
    moduleName: '项目背景',
    content: '收货批次管理实现商品从采购到使用的全生命周期追溯，是质量管控的核心环节。通过批次管理，可以追溯每一件商品的来源、流转和使用情况。',
  },
  {
    moduleName: '核心功能',
    content: '1. 批次档案：每个收货批次生成唯一批次号\n2. 批次退货：批次层面直接退货，无需审核\n3. 库龄监控：实时计算每个批次的库存年龄\n4. 库存跟踪：记录收货数量、当前库存、已使用、已退货\n5. 追溯链路：采购单 → 收货 → 入库 → 出库 → 使用\n6. 统计看板：有效批次、新鲜批次、超期批次、追溯率',
  },
  {
    moduleName: '业务场景',
    content: '• 质量问题追溯：出现质量问题时快速定位影响范围\n• 先进先出：出库时优先推荐旧批次\n• 过期预警：库龄超期自动提醒\n• 供应商质量评估：按批次统计供应商质量',
  },
  {
    moduleName: '业务规则',
    content: '1. 每一次收货生成唯一批次号\n2. 批次号贯穿库存全生命周期\n3. 库龄从收货时间开始计算\n4. >30天库龄标橙，>90天标红\n5. 出库必须指定批次，实现先进先出',
  },
]
</script>

<style scoped lang="less">
.receive-batch {
  padding: 16px;

  .page-header {
    margin-bottom: 16px;

    .page-title {
      font-size: 20px;
      font-weight: 600;
      margin: 0 0 4px 0;
    }

    .page-desc {
      font-size: 13px;
      color: var(--color-text-3);
      margin: 0;
    }
  }

  .stat-row {
    .stat-card {
      :deep(.arco-statistic-title) {
        font-size: 13px;
        color: var(--color-text-2);
      }
    }
  }

  .sku-info {
    .sku-name {
      font-weight: 500;
      margin-bottom: 4px;
    }

    .spec-tags {
      :deep(.arco-tag) {
        margin: 2px;
      }
    }
  }
}
</style>
