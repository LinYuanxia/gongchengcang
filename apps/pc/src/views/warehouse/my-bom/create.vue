<template>
  <div class="my-bom-create">
    <a-card>
      <template #title>
        <a-page-header :title="isEdit ? '编辑BOM包' : '创建BOM包'" @back="router.back()" />
      </template>

      <a-steps :current="currentStep" style="margin-bottom: 24px">
        <a-step title="基本信息" />
        <a-step title="SKU明细" />
        <a-step title="价格设置" />
      </a-steps>

      <div class="step-content">
        <div v-show="currentStep === 0">
          <a-form :model="formData" layout="vertical" style="max-width: 600px">
            <a-form-item label="BOM包名称" required>
              <a-input v-model="formData.name" placeholder="请输入BOM包名称" :max-length="50" />
            </a-form-item>
            <a-form-item label="BOM类型" required>
              <a-select v-model="formData.type" placeholder="请选择类型">
                <a-option value="standard">标准包</a-option>
                <a-option value="custom">定制包</a-option>
              </a-select>
            </a-form-item>
            <a-form-item label="所属分类" required>
              <a-tree-select 
                v-model="formData.categoryId" 
                :data="categoryTree" 
                placeholder="请选择分类"
                style="width: 100%"
              />
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
            <a-form-item label="BOM说明">
              <a-textarea v-model="formData.description" placeholder="请输入BOM包说明" :max-length="500" show-word-limit />
            </a-form-item>
          </a-form>
        </div>

        <div v-show="currentStep === 1">
          <div v-if="formData.sourceBomId" class="inherit-notice">
            <a-alert type="info">
              当前BOM包继承自平台BOM包，您可以根据需要调整SKU明细和数量
            </a-alert>
          </div>

          <div class="sku-toolbar">
            <a-space>
              <a-button type="primary" @click="handleAddSku">
                <template #icon><icon-plus /></template>
                添加SKU
              </a-button>
              <a-button @click="handleImportFromPlatform">
                <template #icon><icon-download /></template>
                从平台BOM导入
              </a-button>
            </a-space>
            <div class="sku-summary">
              <span>已添加 <strong>{{ formData.skuList.length }}</strong> 种SKU</span>
              <span>预估成本：<strong class="price">¥{{ totalEstimatedPrice }}</strong></span>
            </div>
          </div>

          <a-table :data="formData.skuList" :pagination="false" class="mt-16">
            <template #columns>
              <a-table-column title="SKU编码" data-index="skuCode" :width="120" />
              <a-table-column title="商品名称" :width="200">
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
              <a-table-column title="成本价" :width="100" align="right">
                <template #cell="{ record }">
                  <span class="cost-price">¥{{ record.costPrice }}</span>
                </template>
              </a-table-column>
              <a-table-column title="销售价" :width="120">
                <template #cell="{ record }">
                  <a-input-number v-model="record.salePrice" :min="0" :precision="2" size="small" style="width: 100px" />
                </template>
              </a-table-column>
              <a-table-column title="数量" :width="100">
                <template #cell="{ record }">
                  <a-input-number v-model="record.quantity" :min="1" size="small" style="width: 80px" />
                </template>
              </a-table-column>
              <a-table-column title="单位" data-index="unit" :width="60" align="center" />
              <a-table-column title="小计" :width="100" align="right">
                <template #cell="{ record }">
                  <span class="subtotal">¥{{ (record.salePrice * record.quantity).toFixed(2) }}</span>
                </template>
              </a-table-column>
              <a-table-column title="是否必选" :width="100" align="center">
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
          <a-form :model="formData" layout="vertical" style="max-width: 600px">
            <a-form-item label="价格策略" required>
              <a-radio-group v-model="formData.priceStrategy">
                <a-radio value="fixed">固定价格</a-radio>
                <a-radio value="dynamic">动态价格</a-radio>
              </a-radio-group>
            </a-form-item>

            <div v-if="formData.priceStrategy === 'fixed'">
              <a-form-item label="销售价格" required>
                <a-input-number v-model="formData.salePrice" :min="0" :precision="2" style="width: 200px">
                  <template #prefix>¥</template>
                </a-input-number>
              </a-form-item>
              <a-descriptions :column="2" bordered size="small">
                <a-descriptions-item label="成本预估">¥{{ totalEstimatedPrice }}</a-descriptions-item>
                <a-descriptions-item label="预估毛利">
                  <span :class="profitMargin >= 0 ? 'profit' : 'loss'">
                    ¥{{ (formData.salePrice - parseFloat(totalEstimatedPrice.replace(/,/g, ''))).toFixed(2) }}
                  </span>
                </a-descriptions-item>
                <a-descriptions-item label="毛利率">
                  <span :class="profitMargin >= 0 ? 'profit' : 'loss'">{{ profitMargin.toFixed(1) }}%</span>
                </a-descriptions-item>
              </a-descriptions>
            </div>

            <div v-if="formData.priceStrategy === 'dynamic'">
              <a-form-item label="加价模式">
                <a-radio-group v-model="formData.markupMode">
                  <a-radio value="percent">按比例加价</a-radio>
                  <a-radio value="fixed">固定金额加价</a-radio>
                </a-radio-group>
              </a-form-item>
              <a-form-item label="加价值">
                <a-input-number v-model="formData.markupValue" :min="0" style="width: 200px">
                  <template #suffix>{{ formData.markupMode === 'percent' ? '%' : '元' }}</template>
                </a-input-number>
              </a-form-item>
            </div>
          </a-form>

          <a-divider>预览汇总</a-divider>
          <a-descriptions :column="3" bordered>
            <a-descriptions-item label="BOM名称">{{ formData.name }}</a-descriptions-item>
            <a-descriptions-item label="SKU数量">{{ formData.skuList.length }} 种</a-descriptions-item>
            <a-descriptions-item label="成本预估">¥{{ totalEstimatedPrice }}</a-descriptions-item>
            <a-descriptions-item label="销售价格">
              {{ formData.priceStrategy === 'fixed' ? `¥${formData.salePrice}` : '动态计算' }}
            </a-descriptions-item>
            <a-descriptions-item label="预估毛利">
              <span :class="profitMargin >= 0 ? 'profit' : 'loss'">
                {{ formData.priceStrategy === 'fixed' ? `¥${(formData.salePrice - parseFloat(totalEstimatedPrice.replace(/,/g, ''))).toFixed(2)}` : '动态计算' }}
              </span>
            </a-descriptions-item>
          </a-descriptions>
        </div>
      </div>

      <div class="step-actions">
        <a-button v-if="currentStep > 0" @click="prevStep">上一步</a-button>
        <a-button v-if="currentStep < 2" type="primary" @click="nextStep">下一步</a-button>
        <a-space v-if="currentStep === 2">
          <a-button @click="handleSaveDraft">保存草稿</a-button>
          <a-button type="primary" @click="handleSubmit">保存并上架</a-button>
        </a-space>
      </div>
    </a-card>

    <a-modal v-model:visible="platformBomModalVisible" title="从平台BOM导入" :width="800" @ok="handleConfirmImport">
      <a-table :data="platformBomList" :row-selection="bomSelection" v-model:selectedKeys="selectedBomKeys" :pagination="false">
        <template #columns>
          <a-table-column title="BOM名称" data-index="name" :width="200" />
          <a-table-column title="SKU数量" data-index="skuCount" :width="100" align="center" />
          <a-table-column title="平台售价" :width="120" align="right">
            <template #cell="{ record }">
              <span class="price">¥{{ record.price }}</span>
            </template>
          </a-table-column>
          <a-table-column title="说明" data-index="description" />
        </template>
      </a-table>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Message } from '@arco-design/web-vue'

const router = useRouter()
const route = useRoute()
const isEdit = computed(() => !!route.params.id)
const currentStep = ref(0)

const formData = ref({
  name: '',
  type: 'custom',
  categoryId: '',
  image: '',
  description: '',
  sourceBomId: '',
  skuList: [
    { skuId: '1', skuCode: 'SKU-SN-001', name: '水泥 P.O 42.5', image: 'https://picsum.photos/60/60?random=1', spec: '50kg/袋', supplierName: '华新水泥', costPrice: 400, salePrice: 420, quantity: 10, unit: '吨', required: true },
    { skuId: '2', skuCode: 'SKU-FS-001', name: '防水涂料', image: 'https://picsum.photos/60/60?random=2', spec: '20kg/桶', supplierName: '东方雨虹', costPrice: 260, salePrice: 280, quantity: 5, unit: '桶', required: true },
    { skuId: '3', skuCode: 'SKU-GD-001', name: 'PVC排水管', image: 'https://picsum.photos/60/60?random=3', spec: 'DN110', supplierName: '伟星管业', costPrice: 32, salePrice: 35, quantity: 20, unit: '根', required: false },
  ],
  priceStrategy: 'fixed',
  salePrice: 3580,
  markupMode: 'percent',
  markupValue: 10,
})

const categoryTree = ref([
  { key: '1', title: '水电工程', value: '1' },
  { key: '2', title: '防水工程', value: '2' },
  { key: '3', title: '木工工程', value: '3' },
  { key: '4', title: '油漆工程', value: '4' },
  { key: '5', title: '泥瓦工程', value: '5' },
])

const totalEstimatedPrice = computed(() => {
  const total = formData.value.skuList.reduce((sum, item) => sum + item.salePrice * item.quantity, 0)
  return total.toLocaleString('zh-CN', { minimumFractionDigits: 2 })
})

const profitMargin = computed(() => {
  const cost = parseFloat(totalEstimatedPrice.value.replace(/,/g, ''))
  if (cost === 0) return 0
  return ((formData.value.salePrice - cost) / cost * 100)
})

const platformBomModalVisible = ref(false)
const selectedBomKeys = ref<string[]>([])

const bomSelection = computed(() => ({
  type: 'checkbox' as const,
}))

const platformBomList = ref([
  { id: 'p1', name: '水电材料标准包', skuCount: 12, price: '3,580.00', description: '适用于标准住宅水电改造工程' },
  { id: 'p2', name: '防水涂料套餐', skuCount: 5, price: '2,100.00', description: '卫生间、厨房防水专用套餐' },
  { id: 'p3', name: '木工基础包', skuCount: 8, price: '4,800.00', description: '吊顶、隔断基础材料套餐' },
])

function prevStep() {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

function nextStep() {
  if (currentStep.value === 0) {
    if (!formData.value.name || !formData.value.categoryId) {
      Message.warning('请填写基本信息')
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
  Message.info('添加SKU功能开发中')
}

function handleImportFromPlatform() {
  selectedBomKeys.value = []
  platformBomModalVisible.value = true
}

function handleConfirmImport() {
  if (selectedBomKeys.value.length === 0) {
    Message.warning('请选择要导入的BOM包')
    return
  }
  platformBomModalVisible.value = false
  Message.success('已导入SKU明细')
}

function handleRemoveSku(index: number) {
  formData.value.skuList.splice(index, 1)
}

function handleSaveDraft() {
  Message.success('草稿保存成功')
  router.push('/warehouse/my-bom')
}

function handleSubmit() {
  if (formData.value.priceStrategy === 'fixed' && !formData.value.salePrice) {
    Message.warning('请设置销售价格')
    return
  }
  Message.success('保存成功')
  router.push('/warehouse/my-bom')
}
</script>

<style scoped lang="less">
.my-bom-create {
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

.inherit-notice {
  margin-bottom: 16px;
}

.sku-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sku-summary {
  display: flex;
  gap: 24px;
  font-size: 14px;
  
  strong {
    color: #165dff;
  }
  
  .price {
    color: #f53f3f;
  }
}

.mt-16 {
  margin-top: 16px;
}

.product-info {
  display: flex;
  align-items: center;
}

.product-image {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  object-fit: cover;
  margin-right: 8px;
}

.cost-price {
  color: var(--color-text-2);
  font-size: 12px;
}

.price {
  color: #f53f3f;
  font-weight: 500;
}

.subtotal {
  color: #f53f3f;
  font-weight: 600;
}

.profit {
  color: #00b42a;
  font-weight: 500;
}

.loss {
  color: #f53f3f;
  font-weight: 500;
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
