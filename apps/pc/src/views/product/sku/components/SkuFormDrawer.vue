<template>
  <a-drawer
    :visible="visible"
    :title="isEdit ? '编辑SKU' : '新增SKU'"
    :width="800"
    @cancel="handleCancel"
    @ok="handleOk"
  >
    <a-spin :loading="loading">
      <a-form :model="formData" :rules="rules" layout="vertical" ref="formRef">
        <a-form-item field="spuId" label="所属SPU">
          <a-input
            v-model="formData.spuName"
            placeholder="请选择SPU"
            readonly
            style="width: 100%"
          >
            <template #suffix>
              <icon-search @click="showSpuSelector = true" />
            </template>
          </a-input>
        </a-form-item>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item field="skuCode" label="SKU编码">
              <a-input
                v-model="formData.skuCode"
                placeholder="请输入SKU编码"
                :maxlength="50"
                show-word-limit
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="skuName" label="SKU名称">
              <a-input
                v-model="formData.skuName"
                placeholder="请输入SKU名称"
                :maxlength="200"
                show-word-limit
              />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item field="barcode" label="条形码">
              <a-input
                v-model="formData.barcode"
                placeholder="请输入条形码"
                :maxlength="50"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="unit" label="计量单位">
              <a-input
                v-model="formData.unit"
                placeholder="请输入计量单位"
                :maxlength="20"
              />
            </a-form-item>
          </a-col>
        </a-row>

        <a-divider orientation="left">价格信息</a-divider>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item field="supplyPrice" label="供货价">
              <a-input-number
                v-model="formData.supplyPrice"
                placeholder="请输入供货价"
                :min="0"
                :precision="2"
                style="width: 100%"
              >
                <template #prefix>¥</template>
              </a-input-number>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="salePrice" label="销售价">
              <a-input-number
                v-model="formData.salePrice"
                placeholder="请输入销售价"
                :min="0"
                :precision="2"
                style="width: 100%"
              >
                <template #prefix>¥</template>
              </a-input-number>
            </a-form-item>
          </a-col>
        </a-row>

        <a-divider orientation="left">图片信息</a-divider>

        <a-form-item field="mainImage" label="主图">
          <a-upload
            list-type="picture-card"
            :file-list="mainImageFileList"
            :limit="1"
            accept="image/*"
            :auto-upload="false"
            @change="handleMainImageChange"
          >
            <template #upload-button>
              <div class="upload-btn">
                <icon-plus />
                <div class="upload-text">上传主图</div>
              </div>
            </template>
          </a-upload>
        </a-form-item>

        <a-divider orientation="left">
          <template #extra>
            <a-button type="text" size="small" @click="handleAddCustomSpec">
              <icon-plus /> 新增规格属性
            </a-button>
          </template>
          规格属性
        </a-divider>

        <div v-if="!formData.spuId" class="empty-tip">
          <a-empty description="请先选择SPU，自动加载规格属性" />
        </div>
        <div v-else class="spec-form">
          <div v-for="attr in displayAttrList" :key="attr.attrId || attr.key" class="spec-item">
            <a-form-item :label="attr.attrName">
              <template #label>
                <span class="spec-label">{{ attr.attrName }}</span>
                <a-button
                  type="text"
                  size="small"
                  class="delete-btn"
                  @click="handleRemoveSpec(attr)"
                >
                  <icon-close />
                </a-button>
              </template>
              <a-input-group>
                <a-select
                  v-if="attr.isCustom"
                  v-model="attr.attrName"
                  placeholder="输入或选择规格属性"
                  style="width: 140px"
                  allow-clear
                  allow-search
                  @change="handleCustomAttrChange(attr)"
                >
                  <a-option
                    v-for="a in getAvailableAttrs(attr)"
                    :key="a.attrId"
                    :value="a.attrName"
                  >
                    {{ a.attrName }}
                  </a-option>
                  <a-option v-if="!getAvailableAttrs(attr).length" :value="attr.attrName" disabled>
                    无可用属性，请直接输入
                  </a-option>
                </a-select>
                <a-input
                  v-if="attr.isCustom && !getAvailableAttrs(attr).length"
                  v-model="attr.attrName"
                  placeholder="输入自定义规格名称"
                  style="width: 140px"
                  allow-clear
                  @input="handleCustomNameInput(attr)"
                />
                <a-select
                  v-if="!attr.isCustom || (attr.isCustom && attr.optionValues && attr.optionValues.length > 0)"
                  v-model="formData.specs[attr.attrName || attr.key]"
                  placeholder="请选择规格值"
                  style="width: 100%"
                  allow-clear
                >
                  <a-option
                    v-for="value in attr.optionValues"
                    :key="value"
                    :value="value"
                  >
                    {{ value }}
                  </a-option>
                </a-select>
                <a-input
                  v-if="attr.isCustom && (!attr.optionValues || attr.optionValues.length === 0)"
                  :model-value="formData.specs[attr.attrName || attr.key]"
                  placeholder="请输入规格值"
                  style="width: 100%"
                  allow-clear
                  @input="(val: string) => { const key = attr.attrName || attr.key; if (key) formData.specs[key] = val }"
                />
              </a-input-group>
            </a-form-item>
          </div>
        </div>
      </a-form>
    </a-spin>
  </a-drawer>

  <a-modal
    v-model:visible="showSpuSelector"
    title="选择SPU"
    :width="900"
    @ok="confirmSelectSpu"
    @cancel="showSpuSelector = false"
  >
    <div class="spu-selector">
      <a-input-search
        v-model="spuSearchKeyword"
        placeholder="搜索SPU名称/编码"
        style="margin-bottom: 16px"
        @search="loadSpuList"
      />
      <a-table
        :data="spuList"
        :loading="spuLoading"
        :pagination="spuPagination"
        @page-change="handleSpuPageChange"
        @page-size-change="handleSpuPageSizeChange"
        @selection-change="handleSpuSelectionChange"
        row-key="spuId"
      >
        <template #columns>
          <a-table-column type="selection" :width="60" />
          <a-table-column title="SPU编码" data-index="spuCode" :width="150" />
          <a-table-column title="SPU名称" data-index="spuName" :width="200" />
          <a-table-column title="分类" data-index="categoryName" :width="150" />
          <a-table-column title="单位" data-index="unit" :width="100" />
          <a-table-column title="状态" :width="100">
            <template #cell="{ record }">
              <a-tag :color="record.status === 1 ? 'green' : 'red'">
                {{ record.status === 1 ? '启用' : '禁用' }}
              </a-tag>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed, nextTick } from 'vue'
import { Message } from '@arco-design/web-vue'
import type { FormInstance } from '@arco-design/web-vue'
import type { Spu, Sku, ProductAttr } from '@gongchengcang/types'
import { getSpuList, getAttrList, createSku, updateSku } from '@gongchengcang/api'

const props = defineProps<{
  visible: boolean
  sku: Sku | null
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  success: []
}>()

const formRef = ref<FormInstance>()
const loading = ref(false)
const isEdit = ref(false)
const showSpuSelector = ref(false)
const spuLoading = ref(false)
const spuSearchKeyword = ref('')
const spuList = ref<Spu[]>([])
const spuPagination = ref({ current: 1, pageSize: 10, total: 0 })
const selectedSpu = ref<Spu | null>(null)
const attrList = ref<ProductAttr[]>([])
const customSpecs = ref<any[]>([])
const customSpecKeyCounter = ref(0)

const displayAttrList = computed(() => {
  return [...attrList.value, ...customSpecs.value].filter(attr => !attr.deleted)
})

const formData = reactive({
  spuId: '',
  spuName: '',
  skuCode: '',
  skuName: '',
  barcode: '',
  unit: '',
  supplyPrice: undefined,
  salePrice: undefined,
  mainImage: '',
  specs: {} as Record<string, string>,
})

const mainImageFileList = ref<any[]>([])

const rules = {
  spuId: [{ required: true, message: '请选择所属SPU' }],
  skuCode: [{ required: true, message: '请输入SKU编码' }],
  skuName: [{ required: true, message: '请输入SKU名称' }],
  unit: [{ required: true, message: '请输入计量单位' }],
}

watch(
  () => props.visible,
  async (val) => {
    if (val) {
      resetForm()
      if (props.sku) {
        isEdit.value = true
        await loadSkuDetail()
      } else {
        isEdit.value = false
      }
    }
  }
)

function resetForm() {
  Object.assign(formData, {
    spuId: '',
    spuName: '',
    skuCode: '',
    skuName: '',
    barcode: '',
    unit: '',
    supplyPrice: undefined,
    salePrice: undefined,
    mainImage: '',
    specs: {},
  })
  mainImageFileList.value = []
  selectedSpu.value = null
  attrList.value = []
  customSpecs.value = []
}

async function loadSkuDetail() {
  if (!props.sku) return
  
  Object.assign(formData, {
    spuId: props.sku.spuId,
    spuName: props.sku.spuName || '',
    skuCode: props.sku.skuCode,
    skuName: props.sku.skuName,
    barcode: props.sku.barcode || '',
    unit: props.sku.unit,
    supplyPrice: props.sku.supplyPrice,
    salePrice: props.sku.salePrice,
    mainImage: props.sku.mainImage || '',
    specs: props.sku.specs,
  })
  
  if (props.sku.mainImage) {
    mainImageFileList.value = [{
      uid: '-1',
      name: 'mainImage',
      url: props.sku.mainImage,
    }]
  }
  
  await loadAttrList(props.sku.spuId)
  
  nextTick(() => {
    processEditModeSpecs()
  })
}

async function loadSpuList() {
  spuLoading.value = true
  try {
    const result = await getSpuList({
      page: spuPagination.value.current,
      pageSize: spuPagination.value.pageSize,
      keyword: spuSearchKeyword.value,
      status: 1,
    })
    spuList.value = result.list
    spuPagination.value.total = result.total
  } catch (error) {
    console.error('加载SPU列表失败:', error)
  } finally {
    spuLoading.value = false
  }
}

function handleSpuPageChange(page: number) {
  spuPagination.value.current = page
  loadSpuList()
}

function handleSpuPageSizeChange(pageSize: number) {
  spuPagination.value.pageSize = pageSize
  spuPagination.value.current = 1
  loadSpuList()
}

function handleSpuSelectionChange(selection: Spu[]) {
  selectedSpu.value = selection[0] || null
}

async function confirmSelectSpu() {
  if (!selectedSpu.value) {
    Message.warning('请选择一个SPU')
    return
  }
  
  formData.spuId = selectedSpu.value.spuId
  formData.spuName = selectedSpu.value.spuName
  formData.unit = selectedSpu.value.unit
  
  await loadAttrList(selectedSpu.value.spuId)
  
  showSpuSelector.value = false
}

async function loadAttrList(spuId: string) {
  try {
    const result = await getAttrList({ page: 1, pageSize: 100 })
    attrList.value = (result.list || result).filter((attr: ProductAttr) => selectedSpu.value?.attrIds.includes(attr.attrId))
  } catch (error) {
    console.error('加载属性列表失败:', error)
  }
}

function handleAddCustomSpec() {
  customSpecKeyCounter.value++
  const key = `custom_${customSpecKeyCounter.value}`
  customSpecs.value.push({
    key,
    attrId: '',
    attrName: '',
    isCustom: true,
    optionValues: [],
    deleted: false,
  })
  formData.specs[key] = ''
}

function handleRemoveSpec(attr: any) {
  if (attr.isCustom) {
    const index = customSpecs.value.findIndex(item => item.key === attr.key)
    if (index > -1) {
      customSpecs.value.splice(index, 1)
    }
    delete formData.specs[attr.key]
    delete formData.specs[attr.attrName]
  } else {
    attr.deleted = true
    delete formData.specs[attr.attrName]
  }
}

function getAvailableAttrs(attr: any) {
  const usedNames = displayAttrList.value
    .filter(a => a.key !== attr.key && (a.attrName || a.name))
    .map(a => a.attrName || a.name)
  return attrList.value.filter(a => !usedNames.includes(a.attrName))
}

function handleCustomAttrChange(attr: any) {
  const selectedAttr = attrList.value.find(a => a.attrName === attr.attrName)
  if (selectedAttr) {
    attr.optionValues = selectedAttr.optionValues || []
  } else {
    attr.optionValues = []
  }
  updateCustomSpecKey(attr)
}

function handleCustomNameInput(attr: any) {
  if (attr.attrName && attr.key) {
    const oldValue = formData.specs[attr.key]
    delete formData.specs[attr.key]
    formData.specs[attr.attrName] = oldValue
  }
}

function updateCustomSpecKey(attr: any) {
  if (attr.attrName && attr.key) {
    const oldValue = formData.specs[attr.key]
    delete formData.specs[attr.key]
    formData.specs[attr.attrName] = oldValue
  }
}

function processEditModeSpecs() {
  if (!props.sku || !props.sku.specs) return
  
  const inheritedAttrNames = attrList.value.map(attr => attr.attrName)
  
  Object.entries(props.sku.specs).forEach(([key, value]) => {
    if (!inheritedAttrNames.includes(key)) {
      customSpecKeyCounter.value++
      const internalKey = `custom_${customSpecKeyCounter.value}`
      customSpecs.value.push({
        key: internalKey,
        attrId: '',
        attrName: key,
        isCustom: true,
        optionValues: [],
        deleted: false,
      })
      delete formData.specs[key]
      formData.specs[internalKey] = value as string
    }
  })
}

function prepareFinalSpecs() {
  const finalSpecs: Record<string, string> = {}
  
  displayAttrList.value.forEach(attr => {
    if (attr.isCustom) {
      const specKey = attr.attrName || attr.key
      const specValue = formData.specs[attr.key] || formData.specs[attr.attrName || '']
      if (specKey && specValue) {
        finalSpecs[specKey] = specValue
      }
    } else {
      if (formData.specs[attr.attrName]) {
        finalSpecs[attr.attrName] = formData.specs[attr.attrName]
      }
    }
  })
  
  return finalSpecs
}

function handleMainImageChange(fileList: any[]) {
  mainImageFileList.value = fileList
  if (fileList.length > 0) {
    const file = fileList[0]
    if (file.url) {
      formData.mainImage = file.url
    } else if (file.file) {
      formData.mainImage = URL.createObjectURL(file.file)
    }
  } else {
    formData.mainImage = ''
  }
}

function handleCancel() {
  emit('update:visible', false)
}

async function handleOk() {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
  } catch (error) {
    return
  }
  
  loading.value = true
  try {
    const finalSpecs = prepareFinalSpecs()
    
    if (isEdit.value && props.sku) {
      await updateSku(props.sku.skuId, {
        skuCode: formData.skuCode,
        skuName: formData.skuName,
        specs: finalSpecs,
        barcode: formData.barcode,
        unit: formData.unit,
        mainImage: formData.mainImage,
        supplyPrice: formData.supplyPrice,
        salePrice: formData.salePrice,
      })
      Message.success('编辑成功')
    } else {
      await createSku({
        skuCode: formData.skuCode,
        skuName: formData.skuName,
        spuId: formData.spuId,
        specs: finalSpecs,
        barcode: formData.barcode,
        unit: formData.unit,
        mainImage: formData.mainImage,
        supplyPrice: formData.supplyPrice,
        salePrice: formData.salePrice,
      })
      Message.success('新增成功')
    }
    emit('success')
    handleCancel()
  } catch (error: any) {
    Message.error(error.message || '操作失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="less">
.spu-selector {
  .arco-table-th {
    white-space: nowrap;
  }
}

.spec-form {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0 24px;

  .spec-item {
    position: relative;

    :deep(.arco-form-item-label) {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
    }
  }
}

.empty-tip {
  padding: 40px 0;
}

.spec-label {
  font-size: 14px;
  font-weight: 500;
}

.delete-btn {
  margin-left: 8px;
  padding: 0 4px;
  color: var(--color-text-3);
  
  &:hover {
    color: #f53f3f;
  }
}

.upload-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100px;
  height: 100px;
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
    margin-top: 8px;
  }
}
</style>
