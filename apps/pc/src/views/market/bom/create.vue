<template>
  <div class="bom-create">
    <a-card>
      <template #title>
        <a-page-header :title="isEdit ? '编辑BOM包' : '创建BOM包'" @back="router.back()" />
      </template>

      <a-steps :current="currentStep" style="margin-bottom: 24px">
        <a-step title="基本信息" />
        <a-step title="SKU明细" />
        <a-step title="供应商策略" />
      </a-steps>

      <div class="step-content">
        <div v-show="currentStep === 0">
          <a-form :model="formData" layout="vertical" style="max-width: 600px">
            <a-form-item label="BOM包名称" required>
              <a-input v-model="formData.name" placeholder="请输入BOM包名称" :max-length="50" />
            </a-form-item>
            <a-form-item label="BOM图片">
              <a-upload list-type="picture-card" :limit="1">
                <template #upload-button>
                  <div class="upload-btn">
                    <icon-plus />
                    <div>上传图片</div>
                  </div>
                </template>
              </a-upload>
            </a-form-item>
            <a-form-item label="BOM标签">
              <div class="tags-container">
                <a-tag 
                  v-for="(tag, index) in formData.tags" 
                  :key="index" 
                  closable 
                  color="arcoblue"
                  @close="handleRemoveTag(index)"
                >
                  {{ tag }}
                </a-tag>
                <a-input
                  v-if="tagInputVisible"
                  ref="tagInputRef"
                  v-model="tagInputValue"
                  :style="{ width: '100px' }"
                  size="small"
                  @blur="handleTagInputConfirm"
                  @keyup.enter="handleTagInputConfirm"
                />
                <a-button v-else size="small" @click="handleShowTagInput">
                  <template #icon><icon-plus /></template>
                  添加标签
                </a-button>
              </div>
              <div class="form-hint">标签可用于快速筛选和搜索BOM包</div>
            </a-form-item>
            <a-form-item label="BOM说明">
              <a-textarea v-model="formData.description" placeholder="请输入BOM包说明" :max-length="500" show-word-limit />
            </a-form-item>
          </a-form>
        </div>

        <div v-show="currentStep === 1">
          <div class="sku-toolbar">
            <a-space>
              <a-button type="primary" @click="handleAddSku">
                <template #icon><icon-plus /></template>
                添加SKU
              </a-button>
              <a-button @click="handleBatchImport">
                <template #icon><icon-upload /></template>
                批量导入
              </a-button>
            </a-space>
            <div class="sku-summary">
              <span>已添加 <strong>{{ formData.skuList.length }}</strong> 种SKU</span>
              <span>SKU总价：<strong class="price">¥{{ totalEstimatedPrice }}</strong></span>
            </div>
          </div>

          <a-table :data="formData.skuList" :pagination="false" class="mt-16">
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
              <a-table-column title="供应商" :width="120">
                <template #cell="{ record }">
                  <span>{{ record.supplierName }}</span>
                </template>
              </a-table-column>
              <a-table-column title="单价" :width="100" align="right">
                <template #cell="{ record }">
                  <span class="price">¥{{ record.price }}</span>
                </template>
              </a-table-column>
              <a-table-column title="购买数量" :width="120">
                <template #cell="{ record }">
                  <a-input-number v-model="record.quantity" :min="1" size="small" style="width: 100%" />
                </template>
              </a-table-column>
              <a-table-column title="单位" data-index="unit" :width="60" align="center" />
              <a-table-column title="小计" :width="100" align="right">
                <template #cell="{ record }">
                  <span class="subtotal">¥{{ (record.price * record.quantity).toFixed(2) }}</span>
                </template>
              </a-table-column>
              <a-table-column title="必选" :width="70" align="center">
                <template #cell="{ record }">
                  <a-switch v-model="record.required" size="small" />
                </template>
              </a-table-column>
              <a-table-column title="操作" :width="80" fixed="right">
                <template #cell="{ record, rowIndex }">
                  <a-link status="danger" @click="handleRemoveSku(rowIndex)">移除</a-link>
                </template>
              </a-table-column>
            </template>
          </a-table>
        </div>

        <div v-show="currentStep === 2">
          <a-form :model="formData" layout="vertical" style="max-width: 800px">
            <a-form-item label="供应商分配策略" required>
              <a-radio-group v-model="formData.supplyStrategy" type="button">
                <a-radio value="smart">
                  <div class="strategy-option">
                    <div class="strategy-title">智能分配</div>
                    <div class="strategy-desc">系统为每个SKU自动选择最优供应商</div>
                  </div>
                </a-radio>
                <a-radio value="single">
                  <div class="strategy-option">
                    <div class="strategy-title">单一供应商</div>
                    <div class="strategy-desc">整个BOM包统一从指定供应商采购</div>
                  </div>
                </a-radio>
                <a-radio value="sku">
                  <div class="strategy-option">
                    <div class="strategy-title">SKU级指定</div>
                    <div class="strategy-desc">为每个SKU分别指定供应商</div>
                  </div>
                </a-radio>
              </a-radio-group>
            </a-form-item>

            <div v-if="formData.supplyStrategy === 'single'" class="strategy-config">
              <a-form-item label="指定供应商" required>
                <a-select v-model="formData.defaultSupplierId" placeholder="请选择供应商" style="width: 300px">
                  <a-option v-for="s in supplierList" :key="s.id" :value="s.id">{{ s.name }}</a-option>
                </a-select>
              </a-form-item>
              <a-alert type="info">
                选择单一供应商后，BOM包内所有SKU将统一从该供应商采购，可能获得打包折扣
              </a-alert>
            </div>

            <div v-if="formData.supplyStrategy === 'sku'" class="strategy-config">
              <a-alert type="info" style="margin-bottom: 16px">
                为BOM包内的每个SKU单独指定供应商或供应商优先级
              </a-alert>
              <a-table :data="formData.skuList" :pagination="false">
                <template #columns>
                  <a-table-column title="SKU编码" data-index="skuCode" :width="120" />
                  <a-table-column title="商品名称" data-index="name" :width="150" />
                  <a-table-column title="指定供应商" :width="200">
                    <template #cell="{ record }">
                      <a-select v-model="record.fixedSupplierId" placeholder="请选择" allow-clear style="width: 100%">
                        <a-option v-for="s in record.availableSuppliers" :key="s.id" :value="s.id">
                          {{ s.name }} (¥{{ s.price }})
                        </a-option>
                      </a-select>
                    </template>
                  </a-table-column>
                  <a-table-column title="备选供应商" :width="200">
                    <template #cell="{ record }">
                      <a-select v-model="record.backupSupplierIds" placeholder="请选择" multiple allow-clear style="width: 100%">
                        <a-option v-for="s in record.availableSuppliers" :key="s.id" :value="s.id">
                          {{ s.name }} (¥{{ s.price }})
                        </a-option>
                      </a-select>
                    </template>
                  </a-table-column>
                </template>
              </a-table>
            </div>

            <div v-if="formData.supplyStrategy === 'smart'" class="strategy-config">
              <a-alert type="info">
                系统将根据价格、评分、供货时效等因素，自动为每个SKU选择最优供应商
              </a-alert>
            </div>
          </a-form>

          <a-divider>预览汇总</a-divider>
          <a-descriptions :column="3" bordered>
            <a-descriptions-item label="BOM名称">{{ formData.name }}</a-descriptions-item>
            <a-descriptions-item label="SKU数量">{{ formData.skuList.length }} 种</a-descriptions-item>
            <a-descriptions-item label="供应商策略">{{ getStrategyText(formData.supplyStrategy) }}</a-descriptions-item>
            <a-descriptions-item label="SKU总价">¥{{ totalEstimatedPrice }}</a-descriptions-item>
            <a-descriptions-item label="BOM标签">
              <a-tag v-for="tag in formData.tags" :key="tag" color="arcoblue" size="small">{{ tag }}</a-tag>
              <span v-if="!formData.tags.length">-</span>
            </a-descriptions-item>
            <a-descriptions-item label="必选SKU">{{ formData.skuList.filter(s => s.required).length }} 种</a-descriptions-item>
          </a-descriptions>
        </div>
      </div>

      <div class="step-actions">
        <a-button v-if="currentStep > 0" @click="prevStep">上一步</a-button>
        <a-button v-if="currentStep < 2" type="primary" @click="nextStep">下一步</a-button>
        <a-space v-if="currentStep === 2">
          <a-button @click="handleSaveDraft">保存草稿</a-button>
          <a-button type="primary" @click="handleSubmit">提交审核</a-button>
        </a-space>
      </div>
    </a-card>

    <a-modal v-model:visible="skuSelectVisible" title="选择SKU" :width="900" @ok="handleConfirmSku">
      <a-form :model="skuSearchForm" layout="inline" style="margin-bottom: 16px">
        <a-form-item label="关键词">
          <a-input v-model="skuSearchForm.keyword" placeholder="SKU编码/名称" allow-clear />
        </a-form-item>
        <a-form-item label="分类">
          <a-select v-model="skuSearchForm.category" placeholder="全部" allow-clear style="width: 150px">
            <a-option value="cement">水泥</a-option>
            <a-option value="steel">钢材</a-option>
            <a-option value="sand">砂石</a-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-button type="primary">搜索</a-button>
        </a-form-item>
      </a-form>
      <a-table 
        :data="availableSkuList" 
        :row-selection="skuSelection"
        v-model:selectedKeys="selectedSkuKeys"
        :pagination="false"
        :scroll="{ y: 400 }"
      >
        <template #columns>
          <a-table-column title="SKU编码" data-index="skuCode" :width="120" />
          <a-table-column title="商品名称" data-index="name" :width="180" />
          <a-table-column title="规格" data-index="spec" :width="100" />
          <a-table-column title="供应商" data-index="supplierName" :width="120" />
          <a-table-column title="单价" :width="100" align="right">
            <template #cell="{ record }">
              <span class="price">¥{{ record.price }}</span>
            </template>
          </a-table-column>
          <a-table-column title="单位" data-index="unit" :width="60" align="center" />
        </template>
      </a-table>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Message } from '@arco-design/web-vue'

const router = useRouter()
const route = useRoute()
const isEdit = computed(() => !!route.params.id)
const currentStep = ref(0)

const formData = ref({
  name: '',
  image: '',
  description: '',
  tags: ['热门', '推荐'],
  skuList: [
    { skuId: '1', skuCode: 'SKU-SN-001', name: '水泥 P.O 42.5', image: 'https://picsum.photos/60/60?random=1', spec: '50kg/袋', supplierName: '华新水泥', price: 420, quantity: 10, unit: '吨', required: true, fixedSupplierId: '', backupSupplierIds: [], availableSuppliers: [{ id: 's1', name: '华新水泥', price: 420 }, { id: 's2', name: '海螺水泥', price: 415 }] },
    { skuId: '2', skuCode: 'SKU-FS-001', name: '防水涂料', image: 'https://picsum.photos/60/60?random=2', spec: '20kg/桶', supplierName: '东方雨虹', price: 280, quantity: 5, unit: '桶', required: true, fixedSupplierId: '', backupSupplierIds: [], availableSuppliers: [{ id: 's3', name: '东方雨虹', price: 280 }] },
    { skuId: '3', skuCode: 'SKU-GD-001', name: 'PVC排水管', image: 'https://picsum.photos/60/60?random=3', spec: 'DN110', supplierName: '伟星管业', price: 35, quantity: 20, unit: '根', required: false, fixedSupplierId: '', backupSupplierIds: [], availableSuppliers: [{ id: 's4', name: '伟星管业', price: 35 }, { id: 's5', name: '金德管业', price: 38 }] },
  ],
  supplyStrategy: 'smart',
  defaultSupplierId: '',
})

const tagInputVisible = ref(false)
const tagInputValue = ref('')
const tagInputRef = ref()

function handleShowTagInput() {
  tagInputVisible.value = true
  nextTick(() => {
    tagInputRef.value?.focus()
  })
}

function handleTagInputConfirm() {
  if (tagInputValue.value && !formData.value.tags.includes(tagInputValue.value)) {
    formData.value.tags.push(tagInputValue.value)
  }
  tagInputValue.value = ''
  tagInputVisible.value = false
}

function handleRemoveTag(index: number) {
  formData.value.tags.splice(index, 1)
}

const supplierList = ref([
  { id: 's1', name: '华新水泥供应商' },
  { id: 's2', name: '海螺水泥供应商' },
  { id: 's3', name: '东方雨虹供应商' },
  { id: 's4', name: '伟星管业供应商' },
])

const totalEstimatedPrice = computed(() => {
  const total = formData.value.skuList.reduce((sum, item) => sum + item.price * item.quantity, 0)
  return total.toLocaleString('zh-CN', { minimumFractionDigits: 2 })
})

const skuSelectVisible = ref(false)
const selectedSkuKeys = ref<string[]>([])
const skuSearchForm = ref({
  keyword: '',
  category: '',
})

const skuSelection = computed(() => ({
  type: 'checkbox' as const,
  showCheckedAll: true,
}))

const availableSkuList = ref([
  { skuId: '4', skuCode: 'SKU-SN-002', name: '水泥 P.O 52.5', spec: '50kg/袋', supplierName: '华新水泥', price: 450, unit: '吨' },
  { skuId: '5', skuCode: 'SKU-LG-001', name: '螺纹钢 HRB400', spec: '16mm', supplierName: '宝钢集团', price: 4100, unit: '吨' },
  { skuId: '6', skuCode: 'SKU-DB-001', name: '电线 BV2.5', spec: '2.5mm²', supplierName: '远东电缆', price: 180, unit: '卷' },
])

function getStrategyText(strategy: string) {
  const texts: Record<string, string> = {
    smart: '智能分配',
    single: '单一供应商',
    sku: 'SKU级指定',
  }
  return texts[strategy] || strategy
}

function prevStep() {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

function nextStep() {
  if (currentStep.value === 0) {
    if (!formData.value.name) {
      Message.warning('请填写BOM包名称')
      return
    }
  }
  if (currentStep.value === 1) {
    if (formData.value.skuList.length === 0) {
      Message.warning('请添加SKU明细')
      return
    }
  }
  if (currentStep.value < 2) {
    currentStep.value++
  }
}

function handleAddSku() {
  selectedSkuKeys.value = []
  skuSelectVisible.value = true
}

function handleBatchImport() {
  Message.info('批量导入功能开发中')
}

function handleConfirmSku() {
  const newItems = availableSkuList.value
    .filter(sku => selectedSkuKeys.value.includes(sku.skuId))
    .filter(sku => !formData.value.skuList.find(item => item.skuId === sku.skuId))
    .map(sku => ({
      ...sku,
      image: `https://picsum.photos/60/60?random=${sku.skuId}`,
      quantity: 1,
      required: true,
      fixedSupplierId: '',
      backupSupplierIds: [],
      availableSuppliers: [{ id: 's1', name: sku.supplierName, price: sku.price }],
    }))
  formData.value.skuList.push(...newItems)
  skuSelectVisible.value = false
  Message.success(`已添加 ${newItems.length} 个SKU`)
}

function handleRemoveSku(index: number) {
  formData.value.skuList.splice(index, 1)
}

function handleSaveDraft() {
  Message.success('草稿保存成功')
  router.push('/market/bom')
}

function handleSubmit() {
  Message.success('已提交审核')
  router.push('/market/bom')
}
</script>

<style scoped lang="less">
.bom-create {
  padding: 16px;
}

.step-content {
  min-height: 400px;
  padding: 24px 0;
}

.step-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid var(--color-border);
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.form-hint {
  font-size: 12px;
  color: var(--color-text-3);
  margin-top: 4px;
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

.mt-16 {
  margin-top: 16px;
}

.sku-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sku-summary {
  display: flex;
  gap: 24px;
  
  strong {
    color: #165dff;
  }
  
  .price {
    font-size: 16px;
  }
}

.strategy-option {
  padding: 8px 0;
  
  .strategy-title {
    font-weight: 500;
    margin-bottom: 4px;
  }
  
  .strategy-desc {
    font-size: 12px;
    color: var(--color-text-3);
  }
}

.strategy-config {
  margin-top: 16px;
  padding: 16px;
  background: var(--color-fill-1);
  border-radius: 4px;
}

.upload-btn {
  width: 80px;
  height: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--color-text-3);
  
  :deep(.arco-icon) {
    font-size: 20px;
    margin-bottom: 4px;
  }
}
</style>
