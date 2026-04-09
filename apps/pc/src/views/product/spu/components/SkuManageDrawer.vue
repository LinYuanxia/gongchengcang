<template>
  <a-drawer
    :visible="visible"
    title="管理SKU"
    :width="1000"
    @cancel="handleCancel"
    @ok="handleOk"
  >
    <a-spin :loading="loading">
      <div class="sku-manage-drawer">
        <!-- 步骤导航 -->
        <a-steps :current="currentStep" line-less>
          <a-step title="步骤1" description="规格属性组合">
            <template #icon>
              <icon-apps />
            </template>
          </a-step>
          <a-step title="步骤2" description="SKU编辑">
            <template #icon>
              <icon-edit />
            </template>
          </a-step>
        </a-steps>

        <!-- 步骤1：规格属性组合 -->
        <div v-if="currentStep === 1" class="step-content">
          <div class="section-title">规格属性组合</div>
          <div v-if="attrList.length === 0" class="empty-tip">
            <a-empty description="该SPU暂无规格属性，请先在SPU编辑中添加规格属性" />
          </div>
          <div v-else class="spec-combination-section">
            <div v-for="(attr, index) in attrList" :key="attr.attrId" class="spec-item">
              <div class="spec-label">
                {{ attr.attrName }}
                <span class="tip">（选择用于生成SKU的属性值）</span>
              </div>
              <a-checkbox-group v-model="selectedSpecValues[index]" @change="handleSpecChange">
                <a-checkbox
                  v-for="value in attr.optionValues"
                  :key="value"
                  :value="value"
                >
                  {{ value }}
                </a-checkbox>
              </a-checkbox-group>
            </div>
          </div>

          <div class="button-group">
            <a-button type="primary" @click="generateSkus">生成SKU</a-button>
          </div>

          <div class="section-title">生成的SKU</div>
          <div class="sku-list-section">
            <a-empty v-if="generatedSkuList.length === 0" description="请选择规格属性值并点击生成SKU" />
            <a-table v-else :data="generatedSkuList" :pagination="false" size="small">
              <template #columns>
                <a-table-column title="规格组合" :width="200">
                  <template #cell="{ record }">
                    <span v-for="(value, key) in record.specs" :key="key" style="margin-right: 8px">
                      <a-tag size="small" color="arcoblue">{{ key }}: {{ value }}</a-tag>
                    </span>
                  </template>
                </a-table-column>
                <a-table-column title="SKU编码" :width="140">
                  <template #cell="{ record }">
                    <a-input
                      v-model="record.skuCode"
                      placeholder="SKU编码"
                      size="small"
                      :maxlength="50"
                    />
                  </template>
                </a-table-column>
                <a-table-column title="SKU名称" :width="180">
                  <template #cell="{ record }">
                    <a-input
                      v-model="record.skuName"
                      placeholder="SKU名称"
                      size="small"
                      :maxlength="200"
                    />
                  </template>
                </a-table-column>
                <a-table-column title="主图" :width="80">
                  <template #cell="{ record }">
                    <a-upload
                      list-type="picture-card"
                      :file-list="record.mainImageFileList"
                      :limit="1"
                      accept="image/*"
                      :auto-upload="false"
                      @change="(fileList) => handleMainImageChange(fileList, record)"
                    >
                      <template #upload-button>
                        <div class="upload-btn">
                          <icon-plus />
                          <div class="upload-text">上传</div>
                        </div>
                      </template>
                    </a-upload>
                  </template>
                </a-table-column>
                <a-table-column title="供货价" :width="120">
                  <template #cell="{ record }">
                    <a-input-number
                      v-model="record.supplyPrice"
                      placeholder="供货价"
                      :min="0"
                      :precision="2"
                      size="small"
                      style="width: 100%"
                    >
                      <template #prefix>¥</template>
                    </a-input-number>
                  </template>
                </a-table-column>
                <a-table-column title="销售价" :width="120">
                  <template #cell="{ record }">
                    <a-input-number
                      v-model="record.salePrice"
                      placeholder="销售价"
                      :min="0"
                      :precision="2"
                      size="small"
                      style="width: 100%"
                    >
                      <template #prefix>¥</template>
                    </a-input-number>
                  </template>
                </a-table-column>
                <a-table-column title="操作" :width="80">
                  <template #cell="{ record }">
                    <a-button type="text" size="small" @click="handleRemoveSku(record)">
                      <icon-delete />
                    </a-button>
                  </template>
                </a-table-column>
              </template>
            </a-table>
          </div>

          <div class="button-group">
            <a-button type="primary" @click="goToStep2">下一步：编辑SKU</a-button>
          </div>
        </div>

        <!-- 步骤2：SKU编辑 -->
        <div v-if="currentStep === 2" class="step-content">
          <div class="section-title">SKU编辑</div>
          
          <!-- 批量编辑区域 -->
          <div class="batch-edit-section">
            <a-button type="primary" @click="openBatchEditModal">批量编辑</a-button>
          </div>

          <!-- SKU编辑表格 -->
          <div class="sku-edit-section">
            <a-empty v-if="generatedSkuList.length === 0" description="暂无SKU数据" />
            <a-table v-else :data="generatedSkuList" :pagination="false" size="small">
              <template #columns>
                <a-table-column title="规格组合" :width="200">
                  <template #cell="{ record }">
                    <span v-for="(value, key) in record.specs" :key="key" style="margin-right: 8px">
                      <a-tag size="small" color="arcoblue">{{ key }}: {{ value }}</a-tag>
                    </span>
                  </template>
                </a-table-column>
                <a-table-column title="SKU编码" :width="140">
                  <template #cell="{ record }">
                    <a-input
                      v-model="record.skuCode"
                      placeholder="SKU编码"
                      size="small"
                      :maxlength="50"
                    />
                  </template>
                </a-table-column>
                <a-table-column title="SKU名称" :width="180">
                  <template #cell="{ record }">
                    <a-input
                      v-model="record.skuName"
                      placeholder="SKU名称"
                      size="small"
                      :maxlength="200"
                    />
                  </template>
                </a-table-column>
                <a-table-column title="主图" :width="80">
                  <template #cell="{ record }">
                    <a-upload
                      list-type="picture-card"
                      :file-list="record.mainImageFileList"
                      :limit="1"
                      accept="image/*"
                      :auto-upload="false"
                      @change="(fileList) => handleMainImageChange(fileList, record)"
                    >
                      <template #upload-button>
                        <div class="upload-btn">
                          <icon-plus />
                          <div class="upload-text">上传</div>
                        </div>
                      </template>
                    </a-upload>
                  </template>
                </a-table-column>
                <a-table-column title="供货价" :width="120">
                  <template #cell="{ record }">
                    <a-input-number
                      v-model="record.supplyPrice"
                      placeholder="供货价"
                      :min="0"
                      :precision="2"
                      size="small"
                      style="width: 100%"
                    >
                      <template #prefix>¥</template>
                    </a-input-number>
                  </template>
                </a-table-column>
                <a-table-column title="销售价" :width="120">
                  <template #cell="{ record }">
                    <a-input-number
                      v-model="record.salePrice"
                      placeholder="销售价"
                      :min="0"
                      :precision="2"
                      size="small"
                      style="width: 100%"
                    >
                      <template #prefix>¥</template>
                    </a-input-number>
                  </template>
                </a-table-column>
                <a-table-column title="操作" :width="80">
                  <template #cell="{ record }">
                    <a-button type="text" size="small" @click="handleRemoveSku(record)">
                      <icon-delete />
                    </a-button>
                  </template>
                </a-table-column>
              </template>
            </a-table>
          </div>

          <div class="button-group">
            <a-button @click="goToStep1">上一步</a-button>
          </div>
        </div>
      </div>
    </a-spin>
  </a-drawer>

  <!-- 批量编辑弹窗 -->
  <a-modal
    v-model:visible="batchEditModalVisible"
    title="批量编辑"
    :width="600"
    @ok="handleBatchEditOk"
    @cancel="handleBatchEditCancel"
  >
    <a-form :model="batchEditForm" layout="vertical">
      <a-form-item label="供货价">
        <a-input-number
        v-model="batchEditForm.supplyPrice"
        placeholder="供货价"
        :min="0"
        :precision="2"
        style="width: 100%"
      >
        <template #prefix>¥</template>
      </a-input-number>
      </a-form-item>
      <a-form-item label="销售价">
        <a-input-number
        v-model="batchEditForm.salePrice"
        placeholder="销售价"
        :min="0"
        :precision="2"
        style="width: 100%"
      >
        <template #prefix>¥</template>
      </a-input-number>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Message } from '@arco-design/web-vue'
import type { Spu, Sku, ProductAttr } from '@gongchengcang/types'
import { getAttrList, getSkuList, createSku, updateSku, deleteSku } from '@gongchengcang/api'

const props = defineProps<{
  visible: boolean
  spu: Spu | null
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  success: []
}>()

const loading = ref(false)
const currentStep = ref(1)
const attrList = ref<ProductAttr[]>([])
const selectedSpecValues = ref<any[][]>([])
const generatedSkuList = ref<any[]>([])
const existingSkuList = ref<Sku[]>([])
const batchEditModalVisible = ref(false)
const batchEditForm = ref({
  supplyPrice: undefined,
  salePrice: undefined,
})

watch(
  () => props.visible,
  async (val) => {
    if (val && props.spu) {
      await loadAttrList()
      await loadExistingSkuList()
      resetState()
    }
  }
)

async function loadAttrList() {
  try {
    const result = await getAttrList({ page: 1, pageSize: 100 })
    attrList.value = result.filter((attr: ProductAttr) => props.spu?.attrIds.includes(attr.attrId))
    selectedSpecValues.value = attrList.value.map(() => [])
  } catch (error) {
    console.error('加载属性列表失败:', error)
  }
}

async function loadExistingSkuList() {
  try {
    if (props.spu) {
      const result = await getSkuList({ page: 1, pageSize: 100, spuId: props.spu.spuId })
      existingSkuList.value = result.list
    }
  } catch (error) {
    console.error('加载现有SKU列表失败:', error)
  }
}

function resetState() {
  currentStep.value = 1
  generatedSkuList.value = []
  selectedSpecValues.value = attrList.value.map(() => [])
}

function handleSpecChange() {
  // 规格选择变更时暂时不生成SKU，等待用户点击生成按钮
}

function generateSkus() {
  const specs: any = {}
  for (let i = 0; i < selectedSpecValues.value.length; i++) {
    const values = selectedSpecValues.value[i]
    if (values && values.length > 0) {
      specs[attrList.value[i].attrName] = values
    }
  }

  const keys = Object.keys(specs)
  if (keys.length === 0) {
    Message.warning('请至少选择一个规格属性值')
    return
  }

  const combinations = generateSpecCombinations(specs)
  generatedSkuList.value = combinations.map(combo => ({
    specs: combo,
    skuCode: '',
    skuName: '',
    supplyPrice: undefined,
    salePrice: undefined,
    mainImageFileList: [],
    mainImage: '',
  }))
  
  Message.success(`成功生成 ${generatedSkuList.value.length} 个SKU`)
}

function generateSpecCombinations(specs: any): any[] {
  const keys = Object.keys(specs)
  if (keys.length === 0) return []

  const values = keys.map(key => specs[key].map((val: string) => ({ [key]: val })))
  
  const combine = (arrays: any[][], index: number = 0, current: any = {}): any[] => {
    if (index === arrays.length) {
      return [current]
    }
    
    const result: any[] = []
    for (const item of arrays[index]) {
      result.push(...combine(arrays, index + 1, { ...current, ...item }))
    }
    return result
  }
  
  return combine(values)
}

function handleMainImageChange(fileList: any[], record: any) {
  record.mainImageFileList = fileList
  if (fileList.length > 0) {
    const file = fileList[0]
    if (file.url) {
      record.mainImage = file.url
    } else if (file.file) {
      record.mainImage = URL.createObjectURL(file.file)
    }
  } else {
    record.mainImage = ''
  }
}

function handleRemoveSku(record: any) {
  const index = generatedSkuList.value.indexOf(record)
  if (index > -1) {
    generatedSkuList.value.splice(index, 1)
  }
}

function goToStep1() {
  currentStep.value = 1
}

function goToStep2() {
  const validSkus = generatedSkuList.value.filter(sku => sku.skuCode && sku.skuName)
  if (validSkus.length === 0) {
    Message.warning('请至少填写一个SKU的编码和名称')
    return
  }

  // 检查SKU编码和规格组合的唯一性
  const duplicateCodes = new Set<string>()
  const duplicateSpecs = new Set<string>()
  
  for (const sku of validSkus) {
    if (duplicateCodes.has(sku.skuCode)) {
      Message.error('SKU编码重复，请检查')
      return
    }
    duplicateCodes.add(sku.skuCode)
    
    const specKey = JSON.stringify(sku.specs)
    if (duplicateSpecs.has(specKey)) {
      Message.error('规格组合重复，请检查')
      return
    }
    duplicateSpecs.add(specKey)
  }

  currentStep.value = 2
}

function openBatchEditModal() {
  batchEditForm.value = {
    supplyPrice: undefined,
    salePrice: undefined,
  }
  batchEditModalVisible.value = true
}

function handleBatchEditOk() {
  const { supplyPrice, salePrice } = batchEditForm.value
  
  if (supplyPrice === undefined && salePrice === undefined) {
    Message.warning('请至少填写一个批量编辑字段')
    return
  }

  for (const sku of generatedSkuList.value) {
    if (supplyPrice !== undefined) {
      sku.supplyPrice = supplyPrice
    }
    if (salePrice !== undefined) {
      sku.salePrice = salePrice
    }
  }
  
  batchEditModalVisible.value = false
  Message.success('批量编辑成功')
}

function handleBatchEditCancel() {
  batchEditModalVisible.value = false
}

function handleCancel() {
  emit('update:visible', false)
  resetState()
}

async function handleOk() {
  const validSkus = generatedSkuList.value.filter(sku => sku.skuCode && sku.skuName)
  if (validSkus.length === 0) {
    Message.warning('请至少填写一个SKU的编码和名称')
    return
  }

  // 检查SKU编码和规格组合的唯一性
  const duplicateCodes = new Set<string>()
  const duplicateSpecs = new Set<string>()
  
  for (const sku of validSkus) {
    if (duplicateCodes.has(sku.skuCode)) {
      Message.error('SKU编码重复，请检查')
      return
    }
    duplicateCodes.add(sku.skuCode)
    
    const specKey = JSON.stringify(sku.specs)
    if (duplicateSpecs.has(specKey)) {
      Message.error('规格组合重复，请检查')
      return
    }
    duplicateSpecs.add(specKey)
  }

  loading.value = true
  try {
    // 创建所有SKU
    for (const sku of validSkus) {
      await createSku({
        skuCode: sku.skuCode,
        skuName: sku.skuName,
        spuId: props.spu?.spuId || '',
        spuName: props.spu?.spuName || '',
        categoryId: props.spu?.categoryId || '',
        categoryName: props.spu?.categoryName || '',
        specs: sku.specs,
        unit: props.spu?.unit || '',
        mainImage: sku.mainImage,
        supplyPrice: sku.supplyPrice,
        salePrice: sku.salePrice,
      })
    }
    Message.success('SKU创建成功')
    emit('success')
    handleCancel()
  } catch (error: any) {
    Message.error(error.message || '创建SKU失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="less">
.sku-manage-drawer {
  .step-content {
    margin-top: 24px;
  }

  .section-title {
    font-weight: 500;
    font-size: 14px;
    margin-bottom: 16px;
    color: var(--color-text-1);
  }

  .empty-tip {
    padding: 40px 0;
  }

  .spec-combination-section {
    margin-bottom: 24px;

    .spec-item {
      margin-bottom: 16px;

      .spec-label {
        font-weight: 500;
        margin-bottom: 8px;
        color: var(--color-text-2);

        .tip {
          font-size: 12px;
          color: var(--color-text-3);
          font-weight: normal;
        }
      }
    }
  }

  .button-group {
    margin-bottom: 24px;
    display: flex;
    gap: 12px;
  }

  .sku-list-section {
    margin-bottom: 24px;
  }

  .batch-edit-section {
    margin-bottom: 16px;
  }

  .sku-edit-section {
    margin-bottom: 24px;
  }

  .upload-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    border: 1px dashed var(--color-border-2);
    border-radius: 4px;
    color: var(--color-text-3);
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      border-color: var(--color-primary-6);
      color: var(--color-primary-6);
    }

    .upload-text {
      font-size: 12px;
      margin-top: 4px;
    }
  }
}
</style>
