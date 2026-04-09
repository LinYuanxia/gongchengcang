<template>
  <div class="platform-selector">
    <a-steps :current="currentStep" style="margin-bottom: 24px">
      <a-step title="选择商品" />
      <a-step title="设置供货信息" />
    </a-steps>

    <div v-if="currentStep === 1">
      <div class="product-selector">
        <div class="selector-left">
          <div class="selector-header">
            <a-radio-group v-model="productSelectMode" type="button" size="small">
              <a-radio value="spu">按SPU选择</a-radio>
              <a-radio value="sku">按SKU选择</a-radio>
            </a-radio-group>
          </div>
          <div class="selector-filter">
            <a-input-search
              v-model="searchKeyword"
              placeholder="搜索商品名称/编码"
              style="width: 200px"
              @search="handleSearch"
            />
            <a-cascader
              v-model="searchCategory"
              :options="categoryTree"
              placeholder="分类"
              style="width: 150px"
              allow-clear
              :field-names="{ value: 'categoryId', label: 'categoryName', children: 'children' }"
            />
          </div>
          
          <div class="selector-list">
            <template v-if="productSelectMode === 'spu'">
              <div 
                v-for="spu in filteredSpuList" 
                :key="spu.spuId"
                class="spu-item"
                :class="{ 'is-expanded': expandedSpuIds.includes(spu.spuId) }"
              >
                <div class="spu-header" @click="toggleSpuExpand(spu.spuId)">
                  <a-checkbox 
                    :model-value="isSpuSelected(spu.spuId)"
                    :indeterminate="isSpuIndeterminate(spu.spuId)"
                    @change="(checked: boolean) => handleSpuSelect(spu, checked)"
                    @click.stop
                  />
                  <icon-right class="expand-icon" />
                  <span class="spu-name">{{ spu.spuName }}</span>
                  <a-tag size="small">{{ spu.skuList.length }}个SKU</a-tag>
                </div>
                <div v-if="expandedSpuIds.includes(spu.spuId)" class="sku-list">
                  <div 
                    v-for="sku in spu.skuList" 
                    :key="sku.skuId"
                    class="sku-item"
                    :class="{ 'is-selected': selectedSkuIds.includes(sku.skuId) }"
                    @click="handleSkuToggle(sku)"
                  >
                    <a-checkbox 
                      :model-value="selectedSkuIds.includes(sku.skuId)"
                      @change="handleSkuToggle(sku)"
                      @click.stop
                    />
                    <span class="sku-code">{{ sku.skuCode }}</span>
                    <span class="sku-spec">
                      <a-tag v-for="(value, key) in sku.specs" :key="key" size="small">{{ value }}</a-tag>
                    </span>
                    <span class="sku-price">¥{{ sku.platformPrice?.toFixed(2) }}</span>
                  </div>
                </div>
              </div>
            </template>
            
            <template v-else>
              <div 
                v-for="sku in filteredSkuList" 
                :key="sku.skuId"
                class="sku-item-flat"
                :class="{ 'is-selected': selectedSkuIds.includes(sku.skuId) }"
                @click="handleSkuToggle(sku)"
              >
                <a-checkbox 
                  :model-value="selectedSkuIds.includes(sku.skuId)"
                  @click.stop
                />
                <a-image :src="sku.mainImage" :width="40" :height="40" fit="cover" />
                <div class="sku-info">
                  <div class="sku-name">{{ sku.skuName }}</div>
                  <div class="sku-meta">
                    <span>{{ sku.skuCode }}</span>
                    <a-tag v-for="(value, key) in sku.specs" :key="key" size="small">{{ value }}</a-tag>
                  </div>
                </div>
                <span class="sku-price">¥{{ sku.platformPrice?.toFixed(2) }}</span>
              </div>
            </template>
          </div>
        </div>
        
        <div class="selector-right">
          <div class="selector-header">
            <span>已选商品 ({{ selectedSkuIds.length }}个SKU)</span>
            <a-button type="text" size="small" @click="clearSelectedSkus">清空</a-button>
          </div>
          <div class="selected-list">
            <div v-for="sku in selectedSkus" :key="sku.skuId" class="selected-item">
              <span class="selected-name">{{ sku.skuName }}</span>
              <span class="selected-spec">
                <a-tag v-for="(value, key) in sku.specs" :key="key" size="small">{{ value }}</a-tag>
              </span>
              <a-button type="text" size="small" @click="removeSelectedSku(sku.skuId)">
                <icon-close />
              </a-button>
            </div>
            <a-empty v-if="selectedSkuIds.length === 0" description="请从左侧选择商品" />
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <a-button @click="emit('cancel')">取消</a-button>
        <a-button type="primary" :disabled="selectedSkuIds.length === 0" @click="currentStep = 2">
          下一步 (已选{{ selectedSkuIds.length }}个SKU)
        </a-button>
      </div>
    </div>

    <div v-else-if="currentStep === 2">
      <div class="supply-form-section">
        <a-alert type="info" style="margin-bottom: 16px">
          已选择 <strong>{{ selectedSkuIds.length }}</strong> 个SKU，请设置供货信息后提交审核。
        </a-alert>
        
        <a-divider>批量设置供货信息</a-divider>
        
        <a-form :model="supplyForm" layout="vertical">
          <a-row :gutter="16">
            <a-col :span="8">
              <a-form-item label="预计供货量">
                <a-input-number v-model="supplyForm.estimatedStock" :min="0" style="width: 100%">
                  <template #suffix>件</template>
                </a-input-number>
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="最小起订量">
                <a-input-number v-model="supplyForm.minOrderQty" :min="1" style="width: 100%">
                  <template #suffix>件</template>
                </a-input-number>
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="供货周期">
                <a-input-number v-model="supplyForm.leadTime" :min="1" style="width: 100%">
                  <template #suffix>天</template>
                </a-input-number>
              </a-form-item>
            </a-col>
          </a-row>
          <a-button type="outline" @click="applyBatchSupply" style="margin-bottom: 16px">
            应用到所有SKU
          </a-button>
        </a-form>

        <a-divider>SKU供货详情</a-divider>
        
        <a-table :data="selectedSkuList" :pagination="false" :max-height="300" :scroll="{ x: 1000 }" size="small">
          <template #columns>
            <a-table-column title="SKU编码" data-index="skuCode" :width="130" />
            <a-table-column title="商品名称" data-index="skuName" :width="150" />
            <a-table-column title="规格" :width="120">
              <template #cell="{ record }">
                <span v-for="(value, key) in record.specs" :key="key" style="margin-right: 4px">
                  <a-tag size="small">{{ value }}</a-tag>
                </span>
              </template>
            </a-table-column>
            <a-table-column title="平台参考价" :width="100">
              <template #cell="{ record }">
                <span class="price">¥{{ record.platformPrice?.toFixed(2) || '-' }}</span>
              </template>
            </a-table-column>
            <a-table-column title="供货价" :width="120">
              <template #cell="{ record }">
                <a-input-number v-model="record.supplyPrice" size="small" :min="0" :precision="2" style="width: 100%" disabled>
                  <template #prefix>¥</template>
                </a-input-number>
              </template>
            </a-table-column>
            <a-table-column title="预计供货量" :width="120">
              <template #cell="{ record }">
                <a-input-number v-model="record.estimatedStock" size="small" :min="0" style="width: 100%" />
              </template>
            </a-table-column>
            <a-table-column title="最小起订量" :width="120">
              <template #cell="{ record }">
                <a-input-number v-model="record.minOrderQty" size="small" :min="1" style="width: 100%" />
              </template>
            </a-table-column>
            <a-table-column title="供货周期" :width="100">
              <template #cell="{ record }">
                <a-input-number v-model="record.leadTime" size="small" :min="1" style="width: 100%">
                  <template #suffix>天</template>
                </a-input-number>
              </template>
            </a-table-column>
          </template>
        </a-table>
      </div>
      
      <div class="modal-footer">
        <a-button @click="currentStep = 1">上一步</a-button>
        <a-button type="primary" @click="handleSubmit">确认提交</a-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import type { ProductCategory } from '@gongchengcang/types'

const emit = defineEmits<{
  (e: 'select', products: any[]): void
  (e: 'cancel'): void
}>()

interface PlatformSku {
  skuId: string
  skuCode: string
  skuName: string
  spuId: string
  spuName: string
  categoryName: string
  specs: Record<string, string>
  unit: string
  mainImage?: string
  platformPrice?: number
  supplyPrice?: number
  estimatedStock?: number
  minOrderQty?: number
  leadTime?: number
}

interface PlatformSpu {
  spuId: string
  spuCode: string
  spuName: string
  categoryName: string
  mainImage?: string
  skuList: PlatformSku[]
}

const currentStep = ref(1)
const productSelectMode = ref<'spu' | 'sku'>('spu')
const searchKeyword = ref('')
const searchCategory = ref<string[] | undefined>()
const categoryTree = ref<ProductCategory[]>([])
const expandedSpuIds = ref<string[]>([])
const selectedSkuIds = ref<string[]>([])

const supplyForm = reactive({
  estimatedStock: undefined as number | undefined,
  minOrderQty: undefined as number | undefined,
  leadTime: undefined as number | undefined,
})

const mockSkuList: PlatformSku[] = [
  {
    skuId: 'platform-sku-001',
    skuCode: 'SKU-SN-001-42.5',
    skuName: '水泥 P.O 42.5',
    spuId: 'platform-spu-001',
    spuName: '普通硅酸盐水泥',
    categoryName: '水泥',
    specs: { '强度等级': '42.5' },
    unit: '吨',
    mainImage: 'https://picsum.photos/200/200?random=10',
    platformPrice: 420,
  },
  {
    skuId: 'platform-sku-002',
    skuCode: 'SKU-SN-001-52.5',
    skuName: '水泥 P.O 52.5',
    spuId: 'platform-spu-001',
    spuName: '普通硅酸盐水泥',
    categoryName: '水泥',
    specs: { '强度等级': '52.5' },
    unit: '吨',
    mainImage: 'https://picsum.photos/200/200?random=11',
    platformPrice: 480,
  },
  {
    skuId: 'platform-sku-003',
    skuCode: 'SKU-LWG-001-20',
    skuName: '螺纹钢 HRB400E 20mm',
    spuId: 'platform-spu-002',
    spuName: '高强度螺纹钢',
    categoryName: '钢材',
    specs: { '规格': '20mm', '材质': 'HRB400E' },
    unit: '吨',
    mainImage: 'https://picsum.photos/200/200?random=12',
    platformPrice: 3600,
  },
  {
    skuId: 'platform-sku-004',
    skuCode: 'SKU-LWG-001-25',
    skuName: '螺纹钢 HRB400E 25mm',
    spuId: 'platform-spu-002',
    spuName: '高强度螺纹钢',
    categoryName: '钢材',
    specs: { '规格': '25mm', '材质': 'HRB400E' },
    unit: '吨',
    mainImage: 'https://picsum.photos/200/200?random=13',
    platformPrice: 3550,
  },
  {
    skuId: 'platform-sku-005',
    skuCode: 'SKU-SZ-001',
    skuName: '砂子 中砂',
    spuId: 'platform-spu-003',
    spuName: '建筑用砂',
    categoryName: '砂石',
    specs: { '类型': '中砂' },
    unit: '方',
    mainImage: 'https://picsum.photos/200/200?random=14',
    platformPrice: 85,
  },
]

const skuList = ref<PlatformSku[]>(mockSkuList)

const spuList = computed<PlatformSpu[]>(() => {
  const spuMap = new Map<string, PlatformSpu>()
  
  skuList.value.forEach(sku => {
    if (!spuMap.has(sku.spuId)) {
      spuMap.set(sku.spuId, {
        spuId: sku.spuId,
        spuCode: `SPU-${sku.spuId.slice(-3)}`,
        spuName: sku.spuName,
        categoryName: sku.categoryName,
        mainImage: sku.mainImage,
        skuList: [sku],
      })
    } else {
      spuMap.get(sku.spuId)!.skuList.push(sku)
    }
  })
  
  return Array.from(spuMap.values())
})

const filteredSpuList = computed(() => {
  let result = spuList.value
  
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(spu => 
      spu.spuName.toLowerCase().includes(keyword) ||
      spu.skuList.some(sku => sku.skuCode.toLowerCase().includes(keyword))
    )
  }
  
  return result
})

const filteredSkuList = computed(() => {
  let result = skuList.value
  
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(sku => 
      sku.skuName.toLowerCase().includes(keyword) || 
      sku.skuCode.toLowerCase().includes(keyword)
    )
  }
  
  return result
})

const selectedSkus = computed(() => {
  return skuList.value.filter(sku => selectedSkuIds.value.includes(sku.skuId))
})

const selectedSkuList = computed(() => {
  return selectedSkus.value.map(sku => ({
    ...sku,
    supplyPrice: sku.supplyPrice ?? sku.platformPrice,
    estimatedStock: sku.estimatedStock,
    minOrderQty: sku.minOrderQty,
    leadTime: sku.leadTime,
  }))
})

function toggleSpuExpand(spuId: string) {
  const index = expandedSpuIds.value.indexOf(spuId)
  if (index > -1) {
    expandedSpuIds.value.splice(index, 1)
  } else {
    expandedSpuIds.value.push(spuId)
  }
}

function isSpuSelected(spuId: string) {
  const spu = spuList.value.find(s => s.spuId === spuId)
  if (!spu) return false
  return spu.skuList.every(sku => selectedSkuIds.value.includes(sku.skuId))
}

function isSpuIndeterminate(spuId: string) {
  const spu = spuList.value.find(s => s.spuId === spuId)
  if (!spu) return false
  const selectedCount = spu.skuList.filter(sku => selectedSkuIds.value.includes(sku.skuId)).length
  return selectedCount > 0 && selectedCount < spu.skuList.length
}

function handleSpuSelect(spu: PlatformSpu, checked: boolean) {
  if (checked) {
    spu.skuList.forEach(sku => {
      if (!selectedSkuIds.value.includes(sku.skuId)) {
        selectedSkuIds.value.push(sku.skuId)
      }
    })
  } else {
    selectedSkuIds.value = selectedSkuIds.value.filter(
      id => !spu.skuList.some(sku => sku.skuId === id)
    )
  }
}

function handleSkuToggle(sku: PlatformSku) {
  const index = selectedSkuIds.value.indexOf(sku.skuId)
  if (index > -1) {
    selectedSkuIds.value.splice(index, 1)
  } else {
    selectedSkuIds.value.push(sku.skuId)
  }
}

function clearSelectedSkus() {
  selectedSkuIds.value = []
}

function removeSelectedSku(skuId: string) {
  const index = selectedSkuIds.value.indexOf(skuId)
  if (index > -1) {
    selectedSkuIds.value.splice(index, 1)
  }
}

function handleSearch() {
  // 搜索逻辑已通过computed实现
}

function applyBatchSupply() {
  if (supplyForm.estimatedStock !== undefined) {
    selectedSkuList.value.forEach(sku => {
      sku.estimatedStock = supplyForm.estimatedStock
    })
  }
  if (supplyForm.minOrderQty !== undefined) {
    selectedSkuList.value.forEach(sku => {
      sku.minOrderQty = supplyForm.minOrderQty
    })
  }
  if (supplyForm.leadTime !== undefined) {
    selectedSkuList.value.forEach(sku => {
      sku.leadTime = supplyForm.leadTime
    })
  }
  Message.success('批量设置成功')
}

function handleSubmit() {
  const hasSupplyPrice = selectedSkuList.value.every(sku => 
    sku.supplyPrice !== undefined && sku.supplyPrice > 0
  )
  
  if (!hasSupplyPrice) {
    Message.warning('请为所有SKU填写供货价')
    return
  }
  
  emit('select', selectedSkuList.value)
}

onMounted(() => {
  categoryTree.value = [
    {
      categoryId: 'cat001',
      categoryName: '钢材',
      level: 1,
      sortOrder: 1,
      status: 1,
      createdAt: '',
      updatedAt: '',
    },
    {
      categoryId: 'cat002',
      categoryName: '水泥',
      level: 1,
      sortOrder: 2,
      status: 1,
      createdAt: '',
      updatedAt: '',
    },
  ]
})
</script>

<style scoped lang="less">
.platform-selector {
  .product-selector {
    display: flex;
    gap: 16px;
    min-height: 400px;
  }

  .selector-left {
    flex: 1;
    border: 1px solid var(--color-border);
    border-radius: 4px;
    display: flex;
    flex-direction: column;
  }

  .selector-right {
    width: 280px;
    border: 1px solid var(--color-border);
    border-radius: 4px;
    display: flex;
    flex-direction: column;
  }

  .selector-header {
    padding: 12px;
    border-bottom: 1px solid var(--color-border);
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: var(--color-fill-1);
  }

  .selector-filter {
    padding: 12px;
    display: flex;
    gap: 8px;
    border-bottom: 1px solid var(--color-border);
  }

  .selector-list {
    flex: 1;
    overflow-y: auto;
    padding: 8px;
  }

  .spu-item {
    margin-bottom: 8px;
    border: 1px solid var(--color-border);
    border-radius: 4px;

    &.is-expanded {
      .expand-icon {
        transform: rotate(90deg);
      }
    }
  }

  .spu-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px;
    cursor: pointer;
    background: var(--color-fill-1);

    &:hover {
      background: var(--color-fill-2);
    }

    .expand-icon {
      transition: transform 0.2s;
    }

    .spu-name {
      flex: 1;
      font-weight: 500;
    }
  }

  .sku-list {
    padding: 8px;
    background: var(--color-bg-1);
  }

  .sku-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    cursor: pointer;
    border-radius: 4px;

    &:hover {
      background: var(--color-fill-1);
    }

    &.is-selected {
      background: rgb(var(--primary-1));
    }

    .sku-code {
      width: 130px;
      color: var(--color-text-2);
      font-size: 12px;
    }

    .sku-spec {
      flex: 1;
    }

    .sku-price {
      color: rgb(var(--danger-6));
      font-weight: 500;
    }
  }

  .sku-item-flat {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    cursor: pointer;
    border-radius: 4px;
    margin-bottom: 8px;
    border: 1px solid var(--color-border);

    &:hover {
      background: var(--color-fill-1);
    }

    &.is-selected {
      background: rgb(var(--primary-1));
      border-color: rgb(var(--primary-6));
    }

    .sku-info {
      flex: 1;

      .sku-name {
        font-weight: 500;
        margin-bottom: 4px;
      }

      .sku-meta {
        font-size: 12px;
        color: var(--color-text-3);
        display: flex;
        gap: 8px;
        align-items: center;
      }
    }

    .sku-price {
      color: rgb(var(--danger-6));
      font-weight: 500;
    }
  }

  .selected-list {
    flex: 1;
    overflow-y: auto;
    padding: 8px;
  }

  .selected-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px;
    background: var(--color-fill-1);
    border-radius: 4px;
    margin-bottom: 8px;

    .selected-name {
      flex: 1;
      font-size: 13px;
    }

    .selected-spec {
      display: flex;
      gap: 4px;
    }
  }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 24px;
    padding-top: 16px;
    border-top: 1px solid var(--color-border);
  }

  .supply-form-section {
    .price {
      color: rgb(var(--danger-6));
      font-weight: 500;
    }
  }
}
</style>
