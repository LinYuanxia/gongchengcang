<template>
  <div class="bom-detail">
    <a-card>
      <template #extra>
        <a-space>
          <a-button @click="router.back()">返回</a-button>
          <a-button v-if="bom.status === 'draft' || bom.status === 'rejected'" @click="handleEdit">编辑</a-button>
          <a-button v-if="bom.status === 'approved'" @click="handleConfigPermission">权限配置</a-button>
          <a-button v-if="bom.status === 'approved' && !bom.isOnline" type="primary" @click="handleOnline">上架</a-button>
          <a-button v-if="bom.isOnline" status="warning" @click="handleOffline">下架</a-button>
        </a-space>
      </template>

      <a-descriptions :column="4" title="基本信息">
        <a-descriptions-item label="BOM名称">{{ bom.name }}</a-descriptions-item>
        <a-descriptions-item label="状态">
          <a-tag :color="getStatusColor(bom.status)">{{ getStatusText(bom.status) }}</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="创建时间">{{ bom.createTime }}</a-descriptions-item>
        <a-descriptions-item label="BOM标签">
          <a-tag v-for="tag in bom.tags" :key="tag" color="arcoblue" size="small">{{ tag }}</a-tag>
          <span v-if="!bom.tags?.length">-</span>
        </a-descriptions-item>
        <a-descriptions-item label="可见工程仓">
          {{ bom.visibleWarehouses?.length || 0 }} 个
        </a-descriptions-item>
        <a-descriptions-item label="更新时间">{{ bom.updateTime }}</a-descriptions-item>
      </a-descriptions>

      <a-divider />

      <a-descriptions :column="1">
        <a-descriptions-item label="BOM说明">{{ bom.description || '-' }}</a-descriptions-item>
      </a-descriptions>

      <a-divider />

      <h3>SKU明细</h3>
      <div class="sku-summary-bar">
        <span>共 <strong>{{ bom.skuList.length }}</strong> 种SKU</span>
        <span>SKU单价总计：<strong class="price">¥{{ totalSkuPrice }}</strong></span>
      </div>
      <a-table :data="bom.skuList" :pagination="false">
        <template #columns>
          <a-table-column title="SKU编码" data-index="skuCode" :width="120" />
          <a-table-column title="商品名称" :width="180">
            <template #cell="{ record }">
              <div class="product-info">
                <img :src="record.image" class="product-image" />
                <span>{{ record.name }}</span>
              </div>
            </template>
          </a-table-column>
          <a-table-column title="规格" data-index="spec" :width="100" />
          <a-table-column title="单价" :width="100" align="right">
            <template #cell="{ record }">
              <span class="price">¥{{ record.price }}</span>
            </template>
          </a-table-column>
          <a-table-column title="单位" data-index="unit" :width="60" align="center" />
          <a-table-column title="必选" :width="70" align="center">
            <template #cell="{ record }">
              <a-tag :color="record.required ? 'green' : 'gray'" size="small">
                {{ record.required ? '必选' : '可选' }}
              </a-tag>
            </template>
          </a-table-column>
        </template>
      </a-table>

      <a-divider />

      <h3>审核记录</h3>
      <a-timeline>
        <a-timeline-item v-for="record in bom.auditRecords" :key="record.id">
          <div class="audit-record">
            <div class="audit-header">
              <span class="audit-action">{{ record.action }}</span>
              <span class="audit-time">{{ record.time }}</span>
            </div>
            <div class="audit-user">操作人：{{ record.operator }}</div>
            <div v-if="record.remark" class="audit-remark">备注：{{ record.remark }}</div>
          </div>
        </a-timeline-item>
      </a-timeline>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'

const router = useRouter()

const bom = ref({
  id: '1',
  name: '水电材料标准包',
  image: 'https://picsum.photos/100/100?random=1',
  description: '包含水电工程所需的基础材料，适用于住宅装修场景',
  tags: ['热门', '推荐'],
  status: 'approved',
  isOnline: true,
  strategy: 'smart',
  visibleWarehouses: [
    { id: 'w1', name: '华东工程仓' },
    { id: 'w2', name: '南京工程仓' },
  ],
  createTime: '2024-01-15 10:30',
  updateTime: '2024-01-16 14:20',
  skuList: [
    { skuId: '1', skuCode: 'SKU-SN-001', name: '水泥 P.O 42.5', image: 'https://picsum.photos/60/60?random=1', spec: '50kg/袋', supplierName: '华新水泥', price: 420, quantity: 10, unit: '吨', required: true, fixedSupplierName: '', backupSupplierNames: [] },
    { skuId: '2', skuCode: 'SKU-FS-001', name: '防水涂料', image: 'https://picsum.photos/60/60?random=2', spec: '20kg/桶', supplierName: '东方雨虹', price: 280, quantity: 5, unit: '桶', required: true, fixedSupplierName: '', backupSupplierNames: [] },
    { skuId: '3', skuCode: 'SKU-GD-001', name: 'PVC排水管', image: 'https://picsum.photos/60/60?random=3', spec: 'DN110', supplierName: '伟星管业', price: 35, quantity: 20, unit: '根', required: false, fixedSupplierName: '', backupSupplierNames: ['金德管业'] },
  ],
  auditRecords: [
    { id: '1', action: '提交审核', operator: '张三', time: '2024-01-15 10:30', remark: '首次提交' },
    { id: '2', action: '审核通过', operator: '李四', time: '2024-01-15 14:00', remark: '符合上架标准' },
  ],
})

const totalSkuPrice = computed(() => {
  const total = bom.value.skuList.reduce((sum, item) => sum + item.price, 0)
  return total.toLocaleString('zh-CN', { minimumFractionDigits: 2 })
})

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    draft: 'gray',
    pending: 'orange',
    approved: 'green',
    rejected: 'red',
  }
  return colors[status] || 'gray'
}

function getStatusText(status: string) {
  const texts: Record<string, string> = {
    draft: '草稿',
    pending: '待审核',
    approved: '已通过',
    rejected: '已驳回',
  }
  return texts[status] || status
}

function getStrategyColor(strategy: string) {
  const colors: Record<string, string> = {
    smart: 'blue',
    single: 'green',
    sku: 'purple',
  }
  return colors[strategy] || 'gray'
}

function getStrategyText(strategy: string) {
  const texts: Record<string, string> = {
    smart: '智能分配',
    single: '单一供应商',
    sku: 'SKU级指定',
  }
  return texts[strategy] || strategy
}

function handleEdit() {
  router.push(`/market/bom/edit/${bom.value.id}`)
}

function handleConfigPermission() {
  Message.info('打开权限配置弹窗')
}

function handleOnline() {
  bom.value.isOnline = true
  Message.success('上架成功')
}

function handleOffline() {
  bom.value.isOnline = false
  Message.success('下架成功')
}
</script>

<style scoped lang="less">
.bom-detail {
  padding: 16px;
}

h3 {
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 500;
}

.mt-16 {
  margin-top: 16px;
}

.product-info {
  display: flex;
  align-items: center;
}

.product-image {
  width: 32px;
  height: 32px;
  border-radius: 4px;
  object-fit: cover;
  margin-right: 8px;
}

.price {
  color: #f53f3f;
  font-weight: 500;
}

.subtotal {
  color: #f53f3f;
  font-weight: 600;
}

.backup-supplier {
  font-size: 12px;
  color: var(--color-text-3);
}

.sku-summary-bar {
  display: flex;
  gap: 24px;
  margin-bottom: 12px;
  
  strong {
    color: #165dff;
  }
}

.audit-record {
  .audit-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 4px;
    
    .audit-action {
      font-weight: 500;
    }
    
    .audit-time {
      font-size: 12px;
      color: var(--color-text-3);
    }
  }
  
  .audit-user {
    font-size: 13px;
    color: var(--color-text-2);
  }
  
  .audit-remark {
    font-size: 12px;
    color: var(--color-text-3);
    margin-top: 4px;
  }
}
</style>
