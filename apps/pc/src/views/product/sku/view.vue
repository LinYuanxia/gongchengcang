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
            <a-descriptions-item label="品牌">{{ skuData.brand || '-' }}</a-descriptions-item>
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

        <a-row :gutter="16">
          <a-col :span="12">
            <a-card title="价格信息" class="section-card">
              <a-descriptions :column="1" bordered>
                <a-descriptions-item label="供货基准价">
                  <span v-if="skuData.supplyPrice" class="price-value">¥{{ skuData.supplyPrice.toFixed(2) }}</span>
                  <span v-else>-</span>
                </a-descriptions-item>
                <a-descriptions-item label="建议销售价">
                  <span v-if="skuData.salePrice" class="price-value">¥{{ skuData.salePrice.toFixed(2) }}</span>
                  <span v-else>-</span>
                </a-descriptions-item>
              </a-descriptions>
            </a-card>
          </a-col>

          <a-col :span="12">
            <a-card title="准入供应商" class="section-card">
              <a-table :data="supplierList" :pagination="false" size="small">
                <template #columns>
                  <a-table-column title="供应商名称" data-index="supplierName" :width="250" />
                  <a-table-column title="基础供货价" :width="150" align="right">
                    <template #cell="{ record }">
                      <span class="price-value">¥{{ record.supplyPrice.toFixed(2) }}</span>
                    </template>
                  </a-table-column>
                  <a-table-column title="供货状态" :width="120" align="center">
                    <template #cell="{ record }">
                      <a-tag :color="record.status === 'supplying' ? 'green' : record.status === 'paused' ? 'orange' : 'red'">
                        {{ record.status === 'supplying' ? '供货中' : record.status === 'paused' ? '暂停' : '停止' }}
                      </a-tag>
                    </template>
                  </a-table-column>
                </template>
              </a-table>
            </a-card>
          </a-col>
        </a-row>

        <a-card v-if="splitRules.length > 0" title="分账配置" class="section-card">
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
const skuData = ref<Partial<Sku>>({})
const splitRules = ref<SplitRule[]>([])

const supplierList = ref([
  {
    supplierName: '华润水泥(深圳)有限公司',
    supplyPrice: 420,
    status: 'supplying',
    priority: 1,
  },
  {
    supplierName: '海螺水泥(广东)',
    supplyPrice: 415,
    status: 'supplying',
    priority: 2,
  },
  {
    supplierName: '南方水泥',
    supplyPrice: 418,
    status: 'paused',
    priority: 3,
  },
  {
    supplierName: '塔牌水泥集团',
    supplyPrice: 425,
    status: 'stopped',
    priority: 3,
  },
])

onMounted(async () => {
  await loadSkuDetail()
})

async function loadSkuDetail() {
  loading.value = true
  try {
    const sku = await getSkuDetail(skuId.value)
    skuData.value = {
      ...sku,
      brand: '海螺'
    }

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
