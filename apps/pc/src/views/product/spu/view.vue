<template>
  <div class="spu-view-page">
    <a-page-header
      title="SPU详情"
      subtitle="查看商品信息"
      @back="handleBack"
    >
      <template #extra>
        <a-space>
          <a-button @click="handleManageSku">
            <template #icon><icon-list /></template>
            管理SKU
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
            <a-descriptions-item label="SPU名称">{{ spuData.spuName }}</a-descriptions-item>
            <a-descriptions-item label="SPU编码">{{ spuData.spuCode }}</a-descriptions-item>
            <a-descriptions-item label="所属分类">{{ spuData.categoryName }}</a-descriptions-item>
            <a-descriptions-item label="计量单位">{{ spuData.unit }}</a-descriptions-item>
            <a-descriptions-item label="SKU数量">{{ spuData.skuCount }} 个</a-descriptions-item>
            <a-descriptions-item label="状态">
              <a-tag :color="spuData.status === 'enabled' ? 'green' : 'red'">
                {{ spuData.status === 'enabled' ? '启用' : '禁用' }}
              </a-tag>
            </a-descriptions-item>
          </a-descriptions>
          
          <a-row :gutter="24" style="margin-top: 24px">
            <a-col :span="12">
              <div class="image-section">
                <div class="image-label">商品主图</div>
                <div v-if="spuData.mainImage" class="image-preview">
                  <a-image :src="spuData.mainImage" :width="200" :height="200" fit="cover" />
                </div>
                <div v-else class="image-empty">
                  <a-empty description="暂无主图" />
                </div>
              </div>
            </a-col>
            <a-col :span="12">
              <div class="image-section">
                <div class="image-label">商品相册</div>
                <div v-if="spuData.images && spuData.images.length > 0" class="image-gallery">
                  <a-image-preview-group>
                    <a-image v-for="(img, index) in spuData.images" :key="index" :src="img" :width="80" :height="80" fit="cover" style="margin-right: 8px" />
                  </a-image-preview-group>
                </div>
                <div v-else class="image-empty">
                  <a-empty description="暂无相册图片" />
                </div>
              </div>
            </a-col>
          </a-row>

          <a-row :gutter="24" style="margin-top: 24px">
            <a-col :span="24">
              <div class="desc-section">
                <div class="desc-label">商品描述</div>
                <div class="desc-content">{{ spuData.description || '暂无描述' }}</div>
              </div>
            </a-col>
          </a-row>
        </a-card>

        <a-card title="SKU列表" class="section-card">
          <template #extra>
            <span class="sku-count">共 {{ skuList.length }} 个SKU</span>
          </template>

          <div v-if="skuList.length === 0" class="empty-sku">
            <a-empty description="暂无SKU数据" />
          </div>

          <a-table v-else :data="skuList" :pagination="false" size="small">
            <template #columns>
              <a-table-column title="SKU主图" :width="80">
                <template #cell="{ record }">
                  <a-image v-if="record.mainImage" :src="record.mainImage" :width="48" :height="48" fit="cover" />
                  <span v-else>-</span>
                </template>
              </a-table-column>
              <a-table-column title="SKU编码" data-index="skuCode" :width="140" />
              <a-table-column title="SKU名称" data-index="skuName" :width="150" />
              <a-table-column title="规格组合" :width="180">
                <template #cell="{ record }">
                  <span v-for="(value, key) in record.specs" :key="key" style="margin-right: 8px">
                    <a-tag size="small" color="arcoblue">{{ key }}: {{ value }}</a-tag>
                  </span>
                </template>
              </a-table-column>
              <a-table-column title="供货价" :width="100">
                <template #cell="{ record }">
                  <span v-if="record.supplyPrice">¥{{ record.supplyPrice.toFixed(2) }}</span>
                  <span v-else>-</span>
                </template>
              </a-table-column>
              <a-table-column title="销售价" :width="100">
                <template #cell="{ record }">
                  <span v-if="record.salePrice">¥{{ record.salePrice.toFixed(2) }}</span>
                  <span v-else>-</span>
                </template>
              </a-table-column>
              <a-table-column title="状态" :width="80">
                <template #cell="{ record }">
                  <a-tag :color="record.status === 'on_shelf' ? 'green' : 'red'">
                    {{ record.status === 'on_shelf' ? '上架' : '下架' }}
                  </a-tag>
                </template>
              </a-table-column>
            </template>
          </a-table>
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

        <a-card title="操作记录" class="section-card">
          <a-empty description="暂无操作记录" />
        </a-card>
      </a-spin>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import type { Spu, Sku, SplitRule } from '@gongchengcang/types'
import { SPLIT_RULE_CATEGORY_OPTIONS } from '@gongchengcang/types'
import { getSpuDetail, getSkuList, getSplitRulesBySpuId } from '@gongchengcang/api'

const route = useRoute()
const router = useRouter()

const spuId = computed(() => route.params.id as string)

const loading = ref(false)
const spuData = ref<Partial<Spu>>({})
const skuList = ref<Sku[]>([])
const splitRules = ref<SplitRule[]>([])

onMounted(async () => {
  await loadSpuDetail()
})

async function loadSpuDetail() {
  loading.value = true
  try {
    const spu = await getSpuDetail(spuId.value)
    spuData.value = spu

    const skuResult = await getSkuList({ page: 1, pageSize: 100, spuId: spuId.value })
    skuList.value = skuResult.list

    const rules = await getSplitRulesBySpuId(spuId.value)
    splitRules.value = rules
  } catch (error: any) {
    Message.error(error.message || '获取SPU详情失败')
  } finally {
    loading.value = false
  }
}

function handleBack() {
  router.push('/product/spu')
}

function handleEdit() {
  router.push(`/product/spu/edit/${spuId.value}`)
}

function handleManageSku() {
  router.push({
    path: '/product/sku',
    query: { spuId: spuId.value, spuName: spuData.value.spuName }
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
import { computed } from 'vue'
export default {
  name: 'SpuView',
}
</script>

<style scoped lang="less">
.spu-view-page {
  background: var(--color-bg-2);
  min-height: 100vh;
}

.page-content {
  padding: 16px;
}

.section-card {
  margin-bottom: 16px;
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

.desc-section {
  .desc-label {
    font-weight: 500;
    margin-bottom: 12px;
    color: var(--color-text-1);
  }
  
  .desc-content {
    color: var(--color-text-2);
    line-height: 1.6;
    white-space: pre-wrap;
  }
}

.sku-count {
  color: var(--color-text-3);
  font-size: 14px;
}

.empty-sku {
  padding: 40px 0;
}

.rate-value {
  color: var(--color-primary);
  font-weight: 500;
}
</style>
