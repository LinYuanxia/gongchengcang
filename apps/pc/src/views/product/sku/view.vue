<template>
  <div class="sku-view-page">
    <a-page-header
      title="SKU详情"
      subtitle="查看商品SKU信息"
      @back="handleBack"
    >
      <template #extra>
        <a-space>
          <a-button @click="handleViewSpu">
            <template #icon><icon-apps /></template>
            查看SPU
          </a-button>
          <a-button type="primary" @click="handleEdit">
            <template #icon><icon-edit /></template>
            编辑
          </a-button>
        </a-space>
      </template>
    </a-page-header>

    <div class="page-content">
      <a-spin :loading="loading" style="width: 100%">
        <a-card title="基本信息" class="section-card">
          <a-descriptions :column="3" bordered>
            <a-descriptions-item label="SKU编码">{{ skuData.skuCode }}</a-descriptions-item>
            <a-descriptions-item label="SKU名称">{{ skuData.skuName }}</a-descriptions-item>
            <a-descriptions-item label="所属SPU">
              <a-link @click="handleViewSpu">{{ skuData.spuName }}</a-link>
            </a-descriptions-item>
            <a-descriptions-item label="所属分类">{{ skuData.categoryName }}</a-descriptions-item>
            <a-descriptions-item label="计量单位">{{ skuData.unit }}</a-descriptions-item>
            <a-descriptions-item label="状态">
              <a-tag :color="skuData.status === 1 ? 'green' : 'red'">
                {{ skuData.status === 1 ? '上架' : '下架' }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="条形码">{{ skuData.barcode || '-' }}</a-descriptions-item>
            <a-descriptions-item label="总库存">
              <strong class="text-primary">{{ totalStock }}</strong> {{ skuData.unit || '' }}
            </a-descriptions-item>
            <a-descriptions-item label="供应商数">{{ skuData.supplierCount || 0 }} 个</a-descriptions-item>
          </a-descriptions>

          <a-row :gutter="24" style="margin-top: 24px">
            <a-col :span="8">
              <div class="spec-section">
                <div class="spec-label">规格组合</div>
                <div class="spec-content">
                  <a-tag v-for="(value, key) in skuData.specs" :key="key" color="arcoblue" style="margin: 4px">
                    {{ key }}: {{ value }}
                  </a-tag>
                </div>
              </div>
            </a-col>
            <a-col :span="16">
              <div class="image-section">
                <div class="image-label">SKU主图</div>
                <div v-if="skuData.mainImage" class="image-preview">
                  <a-image :src="skuData.mainImage" :width="150" :height="150" fit="cover" />
                </div>
                <div v-else class="image-empty">
                  <a-empty description="暂无主图" />
                </div>
              </div>
            </a-col>
            </a-row>
        </a-card>

        <a-tabs v-model:active-tab="detailTab" type="card" size="small" style="margin-bottom: 16px;">
          <a-tab-pane key="price" title="价格信息" />
          <a-tab-pane key="stock" title="供应商库存明细" />
          <a-tab-pane key="batch" title="库存批次" />
          <a-tab-pane key="record" title="出入库流水" />
        </a-tabs>

        <a-card v-if="detailTab === 'price'" title="价格信息" class="section-card">
          <a-descriptions :column="2" bordered>
            <a-descriptions-item label="供货价">
              <span v-if="skuData.supplyPrice" class="price-value">¥{{ skuData.supplyPrice.toFixed(2) }}</span>
              <span v-else>-</span>
            </a-descriptions-item>
            <a-descriptions-item label="销售价">
              <span v-if="skuData.salePrice" class="price-value">¥{{ skuData.salePrice.toFixed(2) }}</span>
              <span v-else>-</span>
            </a-descriptions-item>
          </a-descriptions>
        </a-card>

        <a-card v-if="detailTab === 'stock'" title="供应商库存明细" class="section-card">
          <a-table :data="supplierStock" :pagination="false" size="small">
            <template #columns>
              <a-table-column title="供应商名称" data-index="supplierName" :width="200" />
              <a-table-column title="关联批次" data-index="batchNo" :width="140">
                <template #cell="{ record }">
                  <a-tag color="arcoblue" size="small">{{ record.batchNo }}</a-tag>
                </template>
              </a-table-column>
              <a-table-column title="采购单价" :width="100" align="right">
                <template #cell="{ record }">
                  <span class="price-value">¥{{ record.price.toFixed(2) }}</span>
                </template>
              </a-table-column>
              <a-table-column title="入库数量" :width="100" align="right">
                <template #cell="{ record }">{{ record.inQty }}</template>
              </a-table-column>
              <a-table-column title="已使用" :width="100" align="right">
                <template #cell="{ record }">{{ record.usedQty }} ({{ Math.round(record.usedQty / record.inQty * 100) }}%)</template>
              </a-table-column>
              <a-table-column title="当前库存" :width="100" align="right">
                <template #cell="{ record }">
                  <strong class="text-success">{{ record.currentStock }} {{ skuUnit }}</strong>
                </template>
              </a-table-column>
              <a-table-column title="入库时间" data-index="inDate" :width="160" />
              <a-table-column title="所在仓库" data-index="warehouseName" :width="160" />
            </template>
          </a-table>
        </a-card>

        <a-card v-if="detailTab === 'batch'" title="库存批次" class="section-card">
          <a-table :data="batchList" :pagination="false" size="small">
            <template #columns>
              <a-table-column title="批次号" data-index="batchNo" :width="140">
                <template #cell="{ record }">
                  <a-tag color="arcoblue" size="small">{{ record.batchNo }}</a-tag>
                </template>
              </a-table-column>
              <a-table-column title="供应商" data-index="supplierName" :width="180" />
              <a-table-column title="采购单价" :width="100" align="right">
                <template #cell="{ record }">
                  <span class="price-value">¥{{ record.price.toFixed(2) }}</span>
                </template>
              </a-table-column>
              <a-table-column title="入库数量" :width="90" align="right">
                <template #cell="{ record }">{{ record.inQty }}</template>
              </a-table-column>
              <a-table-column title="已使用" :width="100" align="right">
                <template #cell="{ record }">
                  {{ record.usedQty }} ({{ Math.round(record.usedQty / record.inQty * 100) }}%)
                </template>
              </a-table-column>
              <a-table-column title="当前库存" :width="90" align="right">
                <template #cell="{ record }">
                  <strong :class="record.currentStock > 0 ? 'text-success' : 'text-secondary'">
                    {{ record.currentStock }} {{ skuUnit }}
                  </strong>
                </template>
              </a-table-column>
              <a-table-column title="所在仓库" data-index="warehouseName" :width="160" />
              <a-table-column title="操作人" data-index="operator" :width="100" />
              <a-table-column title="入库时间" data-index="inDate" :width="160" />
              <a-table-column title="状态" :width="80">
                <template #cell="{ record }">
                  <a-tag :color="record.currentStock > 0 ? 'green' : 'gray'" size="small">
                    {{ record.currentStock > 0 ? '可用' : '已用完' }}
                  </a-tag>
                </template>
              </a-table-column>
            </template>
          </a-table>
        </a-card>

        <a-card v-if="detailTab === 'record'" title="出入库流水" class="section-card">
          <a-empty description="暂无出入库记录" />
        </a-card>

        <a-card v-if="splitRules.length > 0 && detailTab === 'price'" title="分账配置" class="section-card">
          <a-table :data="splitRules" :pagination="false" size="small">
            <template #columns>
              <a-table-column title="规则名称" data-index="ruleName" :width="200" />
              <a-table-column title="规则类型" :width="120">
                <template #cell="{ record }">
                  <a-tag>{{ getRuleCategoryLabel(record.ruleCategory) }}</a-tag>
                </template>
              </a-table-column>
              <a-table-column title="分账比例" :width="100">
                <template #cell="{ record }">
                  <span class="rate-value">{{ (record.rateValue * 100).toFixed(2) }}%</span>
                </template>
              </a-table-column>
              <a-table-column title="平台手续费" :width="100">
                <template #cell="{ record }">
                  <span class="rate-value text-danger">{{ (record.feeRate * 100).toFixed(2) }}%</span>
                </template>
              </a-table-column>
              <a-table-column title="生效时间" :width="200">
                <template #cell="{ record }">
                  <span v-if="record.isPermanent">永久有效</span>
                  <span v-else>{{ record.effectiveStart }} ~ {{ record.effectiveEnd }}</span>
                </template>
              </a-table-column>
              <a-table-column title="状态" :width="100">
                <template #cell="{ record }">
                  <a-tag :color="record.status === 'active' ? 'green' : 'red'">
                    {{ record.status === 'active' ? '生效中' : '已失效' }}
                  </a-tag>
                </template>
              </a-table-column>
              <a-table-column title="操作" :width="100">
                <template #cell="{ record }">
                  <a-button type="text" size="small" @click="handleViewSplitRule(record)">查看</a-button>
                </template>
              </a-table-column>
            </template>
          </a-table>
        </a-card>

        <a-card title="操作记录" class="section-card">
          <a-empty description="暂无操作记录" />
        </a-card>
      </a-spin>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import type { Sku, SplitRule } from '@gongchengcang/types'
import { SPLIT_RULE_CATEGORY_OPTIONS } from '@gongchengcang/types'
import { getSkuDetail, getSplitRulesBySkuId } from '@gongchengcang/api'

const route = useRoute()
const router = useRouter()

const skuId = computed(() => route.params.id as string)

const loading = ref(false)
const detailTab = ref('price')
const skuData = ref<Partial<Sku>>({})
const splitRules = ref<SplitRule[]>([])

const totalStock = computed(() => {
  return supplierStock.value.reduce((sum, s) => sum + s.currentStock, 0)
})

const skuUnit = computed(() => skuData.value.unit || '')

const supplierStock = ref([
  {
    supplierName: '华润水泥(深圳)有限公司',
    batchNo: 'B202412250001',
    price: 420,
    inQty: 500,
    usedQty: 180,
    currentStock: 320,
    inDate: '2024-12-25 08:30:00',
    warehouseName: '深圳湾科技园项目仓',
  },
  {
    supplierName: '海螺水泥(广东)',
    batchNo: 'B202412200005',
    price: 415,
    inQty: 300,
    usedQty: 50,
    currentStock: 250,
    inDate: '2024-12-20 14:15:00',
    warehouseName: '福田CBD项目仓',
  },
  {
    supplierName: '南方水泥',
    batchNo: 'B202412150008',
    price: 418,
    inQty: 200,
    usedQty: 200,
    currentStock: 0,
    inDate: '2024-12-15 09:00:00',
    warehouseName: '深圳湾科技园项目仓',
  },
])

const batchList = ref([
  {
    batchNo: 'B202412250001',
    supplierName: '华润水泥(深圳)有限公司',
    price: 420,
    inQty: 500,
    usedQty: 180,
    currentStock: 320,
    warehouseName: '深圳湾科技园项目仓',
    operator: '张三',
    inDate: '2024-12-25 08:30:00',
  },
  {
    batchNo: 'B202412200005',
    supplierName: '海螺水泥(广东)',
    price: 415,
    inQty: 300,
    usedQty: 50,
    currentStock: 250,
    warehouseName: '福田CBD项目仓',
    operator: '李四',
    inDate: '2024-12-20 14:15:00',
  },
  {
    batchNo: 'B202412150008',
    supplierName: '南方水泥',
    price: 418,
    inQty: 200,
    usedQty: 200,
    currentStock: 0,
    warehouseName: '深圳湾科技园项目仓',
    operator: '王五',
    inDate: '2024-12-15 09:00:00',
  },
])

onMounted(async () => {
  await loadSkuDetail()
})

async function loadSkuDetail() {
  loading.value = true
  try {
    const sku = await getSkuDetail(skuId.value)
    skuData.value = sku || {}

    const rules = await getSplitRulesBySkuId(skuId.value)
    splitRules.value = rules.map(r => ({
      ...r,
      feeRate: 0.015,
    }))
  } catch (error: any) {
    Message.error(error.message || '获取SKU详情失败')
  } finally {
    loading.value = false
  }
}

function handleBack() {
  router.push('/product/sku')
}

function handleEdit() {
  router.push(`/product/sku/edit/${skuId.value}`)
}

function handleViewSpu() {
  if (skuData.value.spuId) {
    router.push(`/product/spu/view/${skuData.value.spuId}`)
  }
}

function getRuleCategoryLabel(category: string) {
  const option = SPLIT_RULE_CATEGORY_OPTIONS.find(o => o.value === category)
  return option?.label || category
}

function handleViewSplitRule(rule: SplitRule) {
  router.push(`/system/split-config?ruleId=${rule.ruleId}`)
}
</script>

<script lang="ts">
export default {
  name: 'SkuView',
}
</script>

<style scoped lang="less">
.sku-view-page {
  background: var(--color-bg-2);
  min-height: 100vh;
}

.page-content {
  padding: 16px;
}

.section-card {
  margin-bottom: 16px;
}

.spec-section {
  .spec-label {
    font-weight: 500;
    margin-bottom: 12px;
    color: var(--color-text-1);
  }

  .spec-content {
    display: flex;
    flex-wrap: wrap;
  }
}

.image-section {
  .image-label {
    font-weight: 500;
    margin-bottom: 12px;
    color: var(--color-text-1);
  }

  .image-preview {
    display: inline-block;
  }

  .image-gallery {
    display: flex;
    flex-wrap: wrap;
  }

  .image-empty {
    padding: 20px;
    background: var(--color-fill-1);
    border-radius: 4px;
  }
}

.price-value {
  color: var(--color-primary);
  font-weight: 500;
  font-size: 16px;
}

.rate-value {
  color: var(--color-primary);
  font-weight: 500;
}

.empty-supplier {
  padding: 40px 0;
}
</style>
