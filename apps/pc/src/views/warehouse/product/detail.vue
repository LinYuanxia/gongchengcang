<template>
  <div class="product-detail">
    <a-page-header title="商品详情" @back="router.back()">
      <template #extra>
        <a-space>
          <a-button @click="router.back()">返回</a-button>
          <a-button type="primary" @click="handleAdjustPrice">
            <template #icon><icon-edit /></template>
            申请调价
          </a-button>
        </a-space>
      </template>
    </a-page-header>

    <div class="detail-content">
      <a-row :gutter="16">
        <a-col :span="16">
          <a-card title="基本信息">
            <a-descriptions :column="2" bordered>
              <a-descriptions-item label="商品编码">{{ product.productCode }}</a-descriptions-item>
              <a-descriptions-item label="商品名称">{{ product.productName }}</a-descriptions-item>
              <a-descriptions-item label="商品分类">{{ product.categoryName }}</a-descriptions-item>
              <a-descriptions-item label="规格型号">{{ product.spec }}</a-descriptions-item>
              <a-descriptions-item label="计量单位">{{ product.unit }}</a-descriptions-item>
              <a-descriptions-item label="商品状态">
                <a-tag :color="product.status === 'online' ? 'green' : 'orange'">
                  {{ product.status === 'online' ? '已上架' : '已下架' }}
                </a-tag>
              </a-descriptions-item>
              <a-descriptions-item label="来源供应商">{{ product.supplierName }}</a-descriptions-item>
              <a-descriptions-item label="采购订单号">
                <a-link>{{ product.purchaseOrderNo }}</a-link>
              </a-descriptions-item>
              <a-descriptions-item label="商品描述" :span="2">{{ product.description }}</a-descriptions-item>
            </a-descriptions>
          </a-card>

          <a-card title="价格信息" class="mt-16">
            <a-descriptions :column="3" bordered>
              <a-descriptions-item label="成本价（采购价）">
                <span class="cost-price">¥{{ product.costPrice }}</span>
              </a-descriptions-item>
              <a-descriptions-item label="销售价">
                <span class="sale-price">¥{{ product.salePrice }}</span>
              </a-descriptions-item>
              <a-descriptions-item label="毛利率">
                <span :class="profitMargin >= 0 ? 'profit' : 'loss'">
                  {{ profitMargin }}%
                </span>
              </a-descriptions-item>
              <a-descriptions-item label="调价状态">
                <a-tag :color="getPriceStatusColor(product.priceStatus)">
                  {{ getPriceStatusText(product.priceStatus) }}
                </a-tag>
              </a-descriptions-item>
              <a-descriptions-item label="上次调价">{{ product.lastPriceAdjust || '-' }}</a-descriptions-item>
              <a-descriptions-item label="调价审核备注">{{ product.priceAuditRemark || '-' }}</a-descriptions-item>
            </a-descriptions>

            <div class="price-history mt-16">
              <div class="section-title">
                <span>价格调整记录</span>
              </div>
              <a-table :data="priceHistory" :pagination="false" size="small">
                <template #columns>
                  <a-table-column title="调整时间" data-index="adjustTime" :width="180" />
                  <a-table-column title="调整前价格" :width="120" align="right">
                    <template #cell="{ record }">
                      <span class="old-price">¥{{ record.oldPrice }}</span>
                    </template>
                  </a-table-column>
                  <a-table-column title="调整后价格" :width="120" align="right">
                    <template #cell="{ record }">
                      <span class="new-price">¥{{ record.newPrice }}</span>
                    </template>
                  </a-table-column>
                  <a-table-column title="调整原因" data-index="reason" :width="200" />
                  <a-table-column title="审核状态" :width="100">
                    <template #cell="{ record }">
                      <a-tag :color="getPriceStatusColor(record.status)">
                        {{ getPriceStatusText(record.status) }}
                      </a-tag>
                    </template>
                  </a-table-column>
                  <a-table-column title="审核时间" data-index="auditTime" :width="180" />
                </template>
              </a-table>
            </div>
          </a-card>

          <a-card title="库存信息" class="mt-16">
            <a-descriptions :column="4" bordered>
              <a-descriptions-item label="当前库存">
                <span class="stock">{{ product.currentStock }} {{ product.unit }}</span>
              </a-descriptions-item>
              <a-descriptions-item label="可用库存">
                <span class="stock">{{ product.availableStock }} {{ product.unit }}</span>
              </a-descriptions-item>
              <a-descriptions-item label="预占库存">
                <span class="warning">{{ product.lockedStock }} {{ product.unit }}</span>
              </a-descriptions-item>
              <a-descriptions-item label="安全库存">
                <span>{{ product.safetyStock }} {{ product.unit }}</span>
              </a-descriptions-item>
            </a-descriptions>

            <div class="stock-warehouse mt-16">
              <div class="section-title">
                <span>仓库分布</span>
              </div>
              <a-table :data="warehouseStock" :pagination="false" size="small">
                <template #columns>
                  <a-table-column title="仓库名称" data-index="warehouseName" :width="180" />
                  <a-table-column title="库存数量" data-index="stock" :width="100" align="right" />
                  <a-table-column title="可用库存" data-index="availableStock" :width="100" align="right" />
                  <a-table-column title="预占库存" data-index="lockedStock" :width="100" align="right" />
                  <a-table-column title="状态" :width="100">
                    <template #cell="{ record }">
                      <a-tag :color="record.status === 'normal' ? 'green' : 'orange'">
                        {{ record.status === 'normal' ? '正常' : '预警' }}
                      </a-tag>
                    </template>
                  </a-table-column>
                </template>
              </a-table>
            </div>
          </a-card>
        </a-col>

        <a-col :span="8">
          <a-card title="商品图片">
            <a-image-preview-group>
              <a-space wrap>
                <a-image
                  v-for="(img, index) in product.images"
                  :key="index"
                  :src="img"
                  width="100"
                  height="100"
                  fit="cover"
                />
              </a-space>
            </a-image-preview-group>
          </a-card>

          <a-card title="采购来源" class="mt-16">
            <a-descriptions :column="1" bordered size="small">
              <a-descriptions-item label="供应商">{{ product.supplierName }}</a-descriptions-item>
              <a-descriptions-item label="采购订单">
                <a-link>{{ product.purchaseOrderNo }}</a-link>
              </a-descriptions-item>
              <a-descriptions-item label="采购日期">{{ product.purchaseDate }}</a-descriptions-item>
              <a-descriptions-item label="采购数量">{{ product.purchaseQuantity }} {{ product.unit }}</a-descriptions-item>
              <a-descriptions-item label="采购单价">¥{{ product.costPrice }}</a-descriptions-item>
            </a-descriptions>
          </a-card>

          <a-card title="销售统计" class="mt-16">
            <a-descriptions :column="1" bordered size="small">
              <a-descriptions-item label="累计销量">{{ product.totalSales }} {{ product.unit }}</a-descriptions-item>
              <a-descriptions-item label="本月销量">{{ product.monthSales }} {{ product.unit }}</a-descriptions-item>
              <a-descriptions-item label="累计销售额">¥{{ product.totalAmount }}</a-descriptions-item>
              <a-descriptions-item label="本月销售额">¥{{ product.monthAmount }}</a-descriptions-item>
            </a-descriptions>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <a-modal v-model:visible="priceModalVisible" title="申请调价" @ok="handlePriceSubmit">
      <a-form :model="priceForm" layout="vertical">
        <a-form-item label="当前销售价">
          <span class="sale-price">¥{{ product.salePrice }}</span>
        </a-form-item>
        <a-form-item label="新销售价" required>
          <a-input-number v-model="priceForm.newPrice" :min="0" :precision="2" style="width: 100%">
            <template #prefix>¥</template>
          </a-input-number>
        </a-form-item>
        <a-form-item label="调价原因" required>
          <a-textarea v-model="priceForm.reason" placeholder="请输入调价原因" :max-length="200" />
        </a-form-item>
        <a-alert type="info">
          调价申请提交后，需等待平台审核通过后生效
        </a-alert>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Message } from '@arco-design/web-vue'

const router = useRouter()
const route = useRoute()
const priceModalVisible = ref(false)

const priceForm = ref({
  newPrice: 0,
  reason: '',
})

const product = ref({
  id: '1',
  productCode: 'SKU-SN-001',
  productName: '水泥 P.O 42.5',
  categoryName: '建筑材料 > 水泥',
  spec: '50kg/袋',
  unit: '袋',
  status: 'online',
  supplierName: '广东建材有限公司',
  purchaseOrderNo: 'PO202401150001',
  description: '优质硅酸盐水泥，强度等级42.5，适用于一般建筑工程',
  costPrice: 420,
  salePrice: 450,
  priceStatus: 'approved',
  lastPriceAdjust: '2024-01-15',
  priceAuditRemark: '',
  currentStock: 500,
  availableStock: 450,
  lockedStock: 50,
  safetyStock: 100,
  images: [
    'https://via.placeholder.com/200',
    'https://via.placeholder.com/200',
    'https://via.placeholder.com/200',
  ],
  purchaseDate: '2024-01-15',
  purchaseQuantity: 600,
  totalSales: 1200,
  monthSales: 150,
  totalAmount: '540,000.00',
  monthAmount: '67,500.00',
})

const profitMargin = computed(() => {
  if (product.value.costPrice === 0) return 0
  return (((product.value.salePrice - product.value.costPrice) / product.value.costPrice) * 100).toFixed(2)
})

const priceHistory = ref([
  { adjustTime: '2024-01-15 10:30', oldPrice: 430, newPrice: 450, reason: '原材料成本上涨', status: 'approved', auditTime: '2024-01-15 14:00' },
  { adjustTime: '2024-01-01 09:00', oldPrice: 420, newPrice: 430, reason: '市场行情调整', status: 'approved', auditTime: '2024-01-01 11:00' },
])

const warehouseStock = ref([
  { warehouseName: '深圳湾科技园主仓', stock: 300, availableStock: 280, lockedStock: 20, status: 'normal' },
  { warehouseName: '福田CBD分仓', stock: 200, availableStock: 170, lockedStock: 30, status: 'normal' },
])

function getPriceStatusColor(status: string) {
  const colors: Record<string, string> = {
    pending: 'orange',
    approved: 'green',
    rejected: 'red',
  }
  return colors[status] || 'gray'
}

function getPriceStatusText(status: string) {
  const texts: Record<string, string> = {
    pending: '待审核',
    approved: '已通过',
    rejected: '已拒绝',
  }
  return texts[status] || status
}

function handleAdjustPrice() {
  priceForm.value = {
    newPrice: product.value.salePrice,
    reason: '',
  }
  priceModalVisible.value = true
}

function handlePriceSubmit() {
  if (!priceForm.value.newPrice || !priceForm.value.reason) {
    Message.warning('请完善调价信息')
    return
  }
  Message.success('调价申请已提交，等待平台审核')
  priceModalVisible.value = false
}
</script>

<style scoped lang="less">
.product-detail {
  padding: 16px;
}

.detail-content {
  margin-top: 16px;
}

.mt-16 {
  margin-top: 16px;
}

.section-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-1);
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--color-border);
}

.cost-price {
  color: #f53f3f;
  font-weight: 600;
  font-size: 18px;
}

.sale-price {
  color: #165dff;
  font-weight: 600;
  font-size: 18px;
}

.profit {
  color: #00b42a;
  font-weight: 600;
}

.loss {
  color: #f53f3f;
  font-weight: 600;
}

.stock {
  color: #00b42a;
  font-weight: 600;
}

.warning {
  color: #ff7d00;
  font-weight: 500;
}

.old-price {
  color: var(--color-text-3);
  text-decoration: line-through;
}

.new-price {
  color: #165dff;
  font-weight: 500;
}
</style>
