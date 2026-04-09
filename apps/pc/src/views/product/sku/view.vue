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

        <a-card title="价格信息" class="section-card">
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

        <a-card v-if="splitRules.length > 0" title="分账配置" class="section-card">
          <a-table :data="splitRules" :pagination="false" size="small">
            <template #columns>
              <a-table-column title="规则名称" data-index="ruleName" :width="200" />
              <a-table-column title="规则类型" :width="120">
                <template #cell="{ record }">
                  <a-tag>{{ getRuleCategoryLabel(record.ruleCategory) }}</a-tag>
                </template>
              </a-table-column>
              <a-table-column title="分账比例" :width="120">
                <template #cell="{ record }">
                  <span class="rate-value">{{ (record.rateValue * 100).toFixed(2) }}%</span>
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

        <a-card title="材料供应商" class="section-card">
          <template #extra>
            <a-button type="text" @click="handleViewSuppliers">
              <template #icon><icon-list /></template>
              查看全部供应商商品
            </a-button>
          </template>
          <div v-if="suppliers.length === 0" class="empty-supplier">
            <a-empty description="暂无材料供应商供货" />
          </div>
          <a-table v-else :data="suppliers" :pagination="false" size="small">
            <template #columns>
              <a-table-column title="供应商名称" data-index="supplierName" :width="200" />
              <a-table-column title="供货价" :width="120">
                <template #cell="{ record }">
                  <span class="price-value">¥{{ record.supplyPrice.toFixed(2) }}</span>
                </template>
              </a-table-column>
              <a-table-column title="预计供货量" :width="120">
                <template #cell="{ record }">
                  {{ record.estimatedStock }} {{ skuData.unit }}
                </template>
              </a-table-column>
              <a-table-column title="最小起订量" :width="120">
                <template #cell="{ record }">
                  {{ record.minOrderQty }} {{ skuData.unit }}
                </template>
              </a-table-column>
              <a-table-column title="供货周期" :width="100">
                <template #cell="{ record }">
                  {{ record.leadTime }} 天
                </template>
              </a-table-column>
              <a-table-column title="状态" :width="100">
                <template #cell="{ record }">
                  <a-tag :color="record.status === 'active' ? 'green' : 'orange'">
                    {{ record.status === 'active' ? '供货中' : '暂停供货' }}
                  </a-tag>
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
import type { Sku, SplitRule, SupplierProduct } from '@gongchengcang/types'
import { SPLIT_RULE_CATEGORY_OPTIONS } from '@gongchengcang/types'
import { getSkuDetail, getSplitRulesBySkuId } from '@gongchengcang/api'

const route = useRoute()
const router = useRouter()

const skuId = computed(() => route.params.id as string)

const loading = ref(false)
const skuData = ref<Partial<Sku> | null>({})
const splitRules = ref<SplitRule[]>([])
const suppliers = ref<SupplierProduct[]>([])

onMounted(async () => {
  await loadSkuDetail()
})

async function loadSkuDetail() {
  loading.value = true
  try {
    const sku = await getSkuDetail(skuId.value)
    skuData.value = sku

    const rules = await getSplitRulesBySkuId(skuId.value)
    splitRules.value = rules

    suppliers.value = getMockSuppliers()
  } catch (error: any) {
    Message.error(error.message || '获取SKU详情失败')
  } finally {
    loading.value = false
  }
}

function getMockSuppliers(): SupplierProduct[] {
  if (skuId.value === 'SKU001' || skuId.value === 'SKU002' || skuId.value === 'SKU003') {
    return [
      {
        id: 'SP001',
        supplierId: 'SUP001',
        supplierName: '宝钢集团有限公司',
        skuId: skuId.value,
        skuCode: skuData.value.skuCode || '',
        skuName: skuData.value.skuName || '',
        supplyPrice: (skuData.value.supplyPrice || 3500) * 0.9,
        estimatedStock: 500,
        actualStock: 480,
        minOrderQty: 10,
        leadTime: 3,
        status: 'active',
        createdAt: '2024-01-01 00:00:00',
        updatedAt: '2024-01-01 00:00:00',
      },
      {
        id: 'SP002',
        supplierId: 'SUP002',
        supplierName: '江苏沙钢集团有限公司',
        skuId: skuId.value,
        skuCode: skuData.value.skuCode || '',
        skuName: skuData.value.skuName || '',
        supplyPrice: (skuData.value.supplyPrice || 3500) * 0.92,
        estimatedStock: 300,
        actualStock: 280,
        minOrderQty: 5,
        leadTime: 5,
        status: 'active',
        createdAt: '2024-01-02 00:00:00',
        updatedAt: '2024-01-02 00:00:00',
      },
      {
        id: 'SP003',
        supplierId: 'SUP003',
        supplierName: '鞍钢股份有限公司',
        skuId: skuId.value,
        skuCode: skuData.value.skuCode || '',
        skuName: skuData.value.skuName || '',
        supplyPrice: (skuData.value.supplyPrice || 3500) * 0.88,
        estimatedStock: 200,
        actualStock: 180,
        minOrderQty: 20,
        leadTime: 7,
        status: 'inactive',
        createdAt: '2024-01-03 00:00:00',
        updatedAt: '2024-01-03 00:00:00',
      },
    ]
  }
  return []
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

function handleViewSuppliers() {
  router.push({
    path: '/product/supplier-product',
    query: { skuId: skuId.value, skuName: skuData.value.skuName }
  })
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
