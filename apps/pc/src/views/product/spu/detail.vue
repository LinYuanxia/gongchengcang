<template>
  <div class="spu-detail-page">
    <a-page-header
      :title="isEdit ? '编辑SPU' : '新增SPU'"
      subtitle="商品基本信息管理"
      @back="handleBack"
    >
      <template #extra>
        <a-space>
          <a-button v-if="isEdit" @click="handleManageSku">
            <template #icon><icon-list /></template>
            管理SKU
          </a-button>
          <a-button @click="handleBack">取消</a-button>
          <a-button type="primary" :loading="submitting" @click="handleSave">
            保存
          </a-button>
        </a-space>
      </template>
    </a-page-header>

    <div class="page-content">
      <a-spin :loading="loading" style="width: 100%">
        <a-form ref="formRef" :model="formData" layout="vertical">
          <a-card title="基本信息" class="section-card">
            <a-row :gutter="24">
              <a-col :span="8">
                <a-form-item field="spuName" label="SPU名称" :rules="[{ required: true, message: '请输入SPU名称' }]">
                  <a-input v-model="formData.spuName" placeholder="请输入SPU名称" :max-length="100" />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item field="spuCode" label="SPU编码">
                  <a-input v-model="formData.spuCode" placeholder="系统自动生成" disabled />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item field="categoryId" label="所属分类" :rules="[{ required: true, message: '请选择所属分类' }]">
                  <a-cascader
                    v-model="formData.categoryIdPath"
                    :options="categoryTree"
                    placeholder="请选择所属分类"
                    :field-names="{ value: 'categoryId', label: 'categoryName', children: 'children' }"
                    @change="handleCategoryChange"
                  />
                </a-form-item>
              </a-col>
            </a-row>
            <a-row :gutter="24">
              <a-col :span="8">
                <a-form-item field="unit" label="计量单位" :rules="[{ required: true, message: '请选择计量单位' }]">
                  <a-select v-model="formData.unit" placeholder="请选择或输入计量单位" allow-create allow-search>
                    <a-option v-for="item in unitOptions" :key="item" :value="item">{{ item }}</a-option>
                  </a-select>
                </a-form-item>
              </a-col>
            </a-row>
            <a-row :gutter="24">
              <a-col :span="12">
                <a-form-item field="mainImage" label="商品主图">
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
              </a-col>
              <a-col :span="12">
                <a-form-item field="images" label="商品相册">
                  <a-upload
                    list-type="picture-card"
                    :file-list="imagesFileList"
                    :limit="9"
                    accept="image/*"
                    :auto-upload="false"
                    multiple
                    @change="handleImagesChange"
                  >
                    <template #upload-button>
                      <div class="upload-btn">
                        <icon-plus />
                        <div class="upload-text">上传图片</div>
                      </div>
                    </template>
                  </a-upload>
                </a-form-item>
              </a-col>
            </a-row>
            <a-row :gutter="24">
              <a-col :span="24">
                <a-form-item field="description" label="商品描述">
                  <a-textarea v-model="formData.description" placeholder="请输入商品描述" :max-length="500" show-word-limit :auto-size="{ minRows: 3, maxRows: 6 }" />
                </a-form-item>
              </a-col>
            </a-row>
            <a-row :gutter="24">
              <a-col :span="24">
                <a-form-item field="remark" label="商品备注">
                  <a-textarea v-model="formData.remark" placeholder="请输入商品备注" :max-length="500" show-word-limit :auto-size="{ minRows: 2, maxRows: 4 }" />
                </a-form-item>
              </a-col>
            </a-row>
          </a-card>

          <a-card title="规格属性" class="section-card">
            <template #extra>
              <a-button type="primary" size="small" @click="addSpec">
                <template #icon><icon-plus /></template>
                添加规格
              </a-button>
            </template>

            <div v-if="formData.specList.length === 0" class="empty-spec">
              <a-empty description="暂无规格属性，请添加规格" />
            </div>

            <div v-else class="spec-list">
              <div v-for="(spec, specIndex) in formData.specList" :key="specIndex" class="spec-item">
                <div class="spec-header">
                  <div class="spec-name-input">
                    <a-select
                      v-model="spec.name"
                      placeholder="选择或输入规格名称"
                      allow-create
                      allow-search
                      style="width: 200px"
                      @change="(val) => handleSpecNameChange(specIndex, val)"
                    >
                      <a-option v-for="attr in availableAttrList(specIndex)" :key="attr.attrId" :value="attr.attrName">
                        {{ attr.attrName }}
                      </a-option>
                    </a-select>
                  </div>
                  <a-button type="text" status="danger" @click="removeSpec(specIndex)">
                    <icon-delete />
                  </a-button>
                </div>
                <div class="spec-values">
                  <a-tag
                    v-for="(value, valueIndex) in spec.values"
                    :key="valueIndex"
                    closable
                    color="arcoblue"
                    @close="removeSpecValue(specIndex, valueIndex)"
                  >
                    {{ value }}
                  </a-tag>
                  <a-select
                    v-model="newSpecValues[specIndex]"
                    placeholder="选择或输入规格值"
                    allow-create
                    allow-search
                    style="width: 150px"
                    size="small"
                    @change="(val) => addSpecValue(specIndex, val)"
                  >
                    <a-option v-for="optVal in getAvailableOptionValues(specIndex)" :key="optVal" :value="optVal">
                      {{ optVal }}
                    </a-option>
                  </a-select>
                </div>
              </div>
            </div>

            <div v-if="formData.specList.length > 0" class="sku-preview">
              <a-divider orientation="left">SKU预览</a-divider>
              <div class="preview-info">
                <span>将生成 <strong>{{ formData.skuList.length }}</strong> 个SKU组合</span>
              </div>
            </div>
          </a-card>

          <a-card title="SKU列表" class="section-card">
            <template #extra>
              <a-space>
                <a-button size="small" type="primary" @click="openAddSkuModal">
                  <template #icon><icon-plus /></template>
                  单独新增SKU
                </a-button>
                <a-button size="small" @click="showBatchPriceModal">批量设置价格</a-button>
                <span class="sku-count">共 {{ formData.skuList.length }} 个SKU</span>
              </a-space>
            </template>

            <div v-if="formData.skuList.length === 0" class="empty-sku">
              <a-empty description="请先添加规格属性，系统将自动生成SKU组合" />
            </div>

            <a-table v-else :data="formData.skuList" :pagination="false" :scroll="{ x: 1600 }" size="small">
              <template #columns>
                <a-table-column title="SKU主图" :width="80" fixed="left">
                  <template #cell="{ record, rowIndex }">
                    <a-upload
                      :file-list="record.imageFileList || []"
                      :show-file-list="false"
                      :auto-upload="false"
                      accept="image/*"
                      @change="(fileList: any[]) => handleSkuImageChange(rowIndex, fileList)"
                    >
                      <template #upload-button>
                        <div class="sku-image-upload">
                          <img v-if="record.skuImage" :src="record.skuImage" class="sku-image-preview" />
                          <div v-else class="sku-image-placeholder">
                            <icon-plus />
                          </div>
                        </div>
                      </template>
                    </a-upload>
                  </template>
                </a-table-column>
                <a-table-column title="SKU编码" :width="140">
                  <template #cell="{ record }">
                    <a-input v-model="record.skuCode" size="small" placeholder="自动生成" disabled />
                  </template>
                </a-table-column>
                <a-table-column title="SKU名称" :width="150">
                  <template #cell="{ record }">
                    <a-input v-model="record.skuName" size="small" placeholder="SKU名称" />
                  </template>
                </a-table-column>
                <a-table-column title="规格组合" :width="220">
                  <template #cell="{ record }">
                    <div class="spec-combo-cell">
                      <div class="spec-tags">
                        <span v-for="(value, key) in record.specs" :key="key" style="margin-right: 4px">
                          <a-tag size="small" color="arcoblue">{{ key }}: {{ value }}</a-tag>
                        </span>
                      </div>
                      <a-button type="text" size="small" @click="handleEditSpecText(record)">编辑规格</a-button>
                    </div>
                  </template>
                </a-table-column>
                <a-table-column title="供货价" :width="120">
                  <template #cell="{ record }">
                    <a-input-number v-model="record.supplyPrice" size="small" placeholder="供货价" :min="0" :precision="2" />
                  </template>
                </a-table-column>
                <a-table-column title="销售价" :width="120">
                  <template #cell="{ record }">
                    <a-input-number v-model="record.salePrice" size="small" placeholder="销售价" :min="0" :precision="2" />
                  </template>
                </a-table-column>
                <a-table-column title="操作" :width="80" fixed="right">
                  <template #cell="{ record }">
                    <a-popconfirm
                      title="确认删除"
                      content="确定删除该SKU吗？删除后可通过重新生成规格或单独新增添加"
                      @ok="handleDeleteSku(record)"
                    >
                      <a-button type="text" size="small" status="danger">删除</a-button>
                    </a-popconfirm>
                  </template>
                </a-table-column>
              </template>
            </a-table>
          </a-card>
        </a-form>
      </a-spin>
    </div>

    <a-modal v-model:visible="batchPriceVisible" title="批量设置价格" @ok="applyBatchPrice">
      <a-form :model="batchPrice" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="供货价">
              <a-input-number v-model="batchPrice.supplyPrice" placeholder="供货价" :min="0" :precision="2" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="销售价">
              <a-input-number v-model="batchPrice.salePrice" placeholder="销售价" :min="0" :precision="2" style="width: 100%" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-alert type="info">填写的价格将应用到所有SKU，留空的价格字段不会被修改</a-alert>
      </a-form>
    </a-modal>

    <a-modal v-model:visible="addSkuModalVisible" title="单独新增SKU" :width="700" @ok="handleAddSkuConfirm" @cancel="addSkuModalVisible = false">
      <a-form :model="addSkuForm" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="SKU编码">
              <a-input v-model="addSkuForm.skuCode" placeholder="系统自动生成或手动输入" :maxlength="50" disabled />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="SKU名称" :rules="[{ required: true, message: '请输入SKU名称' }]">
              <a-input v-model="addSkuForm.skuName" placeholder="SKU名称" :maxlength="200" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item label="SKU规格信息">
          <a-textarea v-model="addSkuForm.specInfo" placeholder="请输入规格信息，如：红色、XL、纯棉 或 颜色:红色、尺寸:XL" :max-length="200" show-word-limit :auto-size="{ minRows: 2, maxRows: 4 }" />
          <div class="form-tip">提示：多个规格用顿号、逗号、空格或换行分隔，支持键值对格式</div>
        </a-form-item>
        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item label="供货价">
              <a-input-number v-model="addSkuForm.supplyPrice" placeholder="供货价" :min="0" :precision="2" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="销售价">
              <a-input-number v-model="addSkuForm.salePrice" placeholder="销售价" :min="0" :precision="2" style="width: 100%" />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>

    <a-modal v-model:visible="editSpecModalVisible" title="编辑SKU规格" :width="600" @ok="handleEditSpecConfirm" @cancel="editSpecModalVisible = false">
      <a-form layout="vertical">
        <a-form-item label="规格信息">
          <a-textarea v-model="editSpecForm.specInfo" placeholder="请输入规格信息，如：红色、XL、纯棉 或 颜色:红色、尺寸:XL" :max-length="200" show-word-limit :auto-size="{ minRows: 3, maxRows: 6 }" />
          <div class="form-tip">提示：多个规格用顿号、逗号、空格或换行分隔，支持键值对格式</div>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import type { ProductCategory, ProductAttr, SkuPriceInfo } from '@gongchengcang/types'
import { getSpuDetail, createSpu, updateSpu, createSku, getCategoryTree, getAttrList } from '@gongchengcang/api'

const route = useRoute()
const router = useRouter()

const isEdit = computed(() => !!route.params.id)
const spuId = computed(() => route.params.id as string)

const loading = ref(false)
const submitting = ref(false)
const formRef = ref()
const categoryTree = ref<ProductCategory[]>([])
const attrList = ref<ProductAttr[]>([])

const unitOptions = ['吨', '米', '个', '件', '套', '千克', '立方米', '平方米', '桶', '箱', '包']

const mainImageFileList = ref<any[]>([])
const imagesFileList = ref<any[]>([])
const newSpecValues = ref<Record<number, string>>({})

const batchPriceVisible = ref(false)
const batchPrice = reactive({
  supplyPrice: undefined as number | undefined,
  salePrice: undefined as number | undefined,
})

const addSkuModalVisible = ref(false)
const addSkuForm = ref({
  skuCode: '',
  skuName: '',
  specInfo: '',
  supplyPrice: undefined as number | undefined,
  salePrice: undefined as number | undefined,
})

const editSpecModalVisible = ref(false)
const editSpecForm = ref({
  specInfo: '',
})
const currentEditingSku = ref<any>(null)

interface SpecItem {
  name: string
  values: string[]
}

interface FormData {
  spuId?: string
  spuName: string
  spuCode: string
  categoryId: string
  categoryIdPath: string[]
  unit: string
  mainImage: string
  images: string[]
  description: string
  remark: string
  specList: SpecItem[]
  skuList: SkuPriceInfo[]
}

const formData = reactive<FormData>({
  spuName: '',
  spuCode: '',
  categoryId: '',
  categoryIdPath: [],
  unit: '',
  mainImage: '',
  images: [],
  description: '',
  remark: '',
  specList: [],
  skuList: [],
})

onMounted(async () => {
  await Promise.all([loadCategoryTree(), loadAttrList()])
  if (isEdit.value && spuId.value) {
    await loadSpuDetail()
  } else {
    generateSpuCode()
  }
})

async function loadCategoryTree() {
  try {
    categoryTree.value = await getCategoryTree()
  } catch (error) {
    console.error('加载分类树失败:', error)
  }
}

async function loadAttrList() {
  try {
    const result = await getAttrList({ page: 1, pageSize: 100, status: 1 })
    attrList.value = result.list
  } catch (error) {
    console.error('加载属性列表失败:', error)
  }
}

async function loadSpuDetail() {
  loading.value = true
  try {
    const spu = await getSpuDetail(spuId.value)
    formData.spuId = spu.spuId
    formData.spuName = spu.spuName
    formData.spuCode = spu.spuCode || ''
    formData.categoryId = spu.categoryId
    formData.unit = spu.unit
    formData.mainImage = spu.mainImage || ''
    formData.images = spu.images || []
    formData.description = spu.description || ''
    formData.remark = spu.remark || ''
    
    if (formData.mainImage) {
      mainImageFileList.value = [{ uid: '1', url: formData.mainImage, name: 'main' }]
    }
    if (formData.images.length > 0) {
      imagesFileList.value = formData.images.map((url, index) => ({
        uid: String(index),
        url,
        name: `image-${index}`,
      }))
    }
  } catch (error: any) {
    Message.error(error.message || '获取SPU详情失败')
  } finally {
    loading.value = false
  }
}

function generateSpuCode() {
  const timestamp = Date.now().toString().slice(-8)
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  formData.spuCode = `SPU${timestamp}${random}`
}

function generateSkuCode(index: number) {
  const spuPrefix = formData.spuCode || 'SKU'
  return `${spuPrefix}-${String(index + 1).padStart(4, '0')}`
}

function handleCategoryChange(value: string[]) {
  if (value && value.length > 0) {
    formData.categoryId = value[value.length - 1]
  } else {
    formData.categoryId = ''
  }
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

watch(() => formData.mainImage, (newMainImage) => {
  formData.skuList.forEach(sku => {
    if (!sku.skuImage || sku.skuImage === formData.mainImage) {
      sku.skuImage = newMainImage
      sku.imageFileList = newMainImage ? [{ uid: '1', url: newMainImage, name: 'main' }] : []
    }
  })
})

function handleImagesChange(fileList: any[]) {
  imagesFileList.value = fileList
  formData.images = fileList
    .filter(f => f.url || f.file)
    .map(f => f.url || (f.file ? URL.createObjectURL(f.file) : ''))
}

function availableAttrList(currentIndex: number) {
  const usedNames = formData.specList
    .filter((_, index) => index !== currentIndex)
    .map(s => s.name)
  return attrList.value.filter(attr => !usedNames.includes(attr.attrName))
}

function getAvailableOptionValues(specIndex: number) {
  const spec = formData.specList[specIndex]
  if (!spec || !spec.name) return []
  
  const attr = attrList.value.find(a => a.attrName === spec.name)
  if (!attr || !attr.optionValues) return []
  
  return attr.optionValues.filter(v => !spec.values.includes(v))
}

function handleSpecNameChange(specIndex: number, name: string) {
  const spec = formData.specList[specIndex]
  if (spec) {
    spec.name = name
    spec.values = []
    generateSkuList()
  }
}

function addSpec() {
  formData.specList.push({
    name: '',
    values: [],
  })
}

function removeSpec(index: number) {
  formData.specList.splice(index, 1)
  generateSkuList()
}

function addSpecValue(specIndex: number, value: string | undefined) {
  if (!value) return
  
  const spec = formData.specList[specIndex]
  if (spec && !spec.values.includes(value)) {
    spec.values.push(value)
    generateSkuList()
  }
  newSpecValues.value[specIndex] = '' as any
}

function removeSpecValue(specIndex: number, valueIndex: number) {
  formData.specList[specIndex].values.splice(valueIndex, 1)
  generateSkuList()
}

function generateSkuList() {
  const manualSkus = formData.skuList.filter((sku: any) => sku.source === 'manual')
  const validSpecs = formData.specList.filter(s => s.name && s.values.length > 0)
  
  if (validSpecs.length === 0) {
    formData.skuList = [...manualSkus]
    return
  }

  const specsList: Record<string, string>[] = []
  
  function generate(specs: typeof validSpecs, current: Record<string, string>, index: number) {
    if (index === specs.length) {
      specsList.push({ ...current })
      return
    }
    const spec = specs[index]
    for (const value of spec.values) {
      generate(specs, { ...current, [spec.name]: value }, index + 1)
    }
  }
  
  generate(validSpecs, {}, 0)
  
  const existingSkuMap = new Map<string, SkuPriceInfo>()
  formData.skuList.forEach(sku => {
    const key = JSON.stringify(sku.specs)
    existingSkuMap.set(key, sku)
  })
  
  const autoSkus = specsList.map((specs, index) => {
    const key = JSON.stringify(specs)
    const existing = existingSkuMap.get(key)
    if (existing) {
      return existing
    }
    return {
      skuCode: generateSkuCode(index),
      skuName: Object.values(specs).join(' '),
      specs,
      skuImage: formData.mainImage,
      imageFileList: formData.mainImage ? [{ uid: '1', url: formData.mainImage, name: 'main' }] : [],
      supplyPrice: undefined,
      salePrice: undefined,
      costPrice: undefined,
      marketPrice: undefined,
      source: 'auto',
    }
  })
  
  formData.skuList = [...autoSkus, ...manualSkus] as any
}

function handleSkuImageChange(skuIndex: number, fileList: any[]) {
  const sku = formData.skuList[skuIndex]
  if (sku) {
    sku.imageFileList = fileList
    if (fileList.length > 0) {
      const file = fileList[0]
      if (file.url) {
        sku.skuImage = file.url
      } else if (file.file) {
        sku.skuImage = URL.createObjectURL(file.file)
      }
    } else {
      sku.skuImage = ''
    }
  }
}

function showBatchPriceModal() {
  batchPrice.supplyPrice = undefined
  batchPrice.salePrice = undefined
  batchPrice.costPrice = undefined
  batchPrice.marketPrice = undefined
  batchPriceVisible.value = true
}

function applyBatchPrice() {
  formData.skuList.forEach(sku => {
    if (batchPrice.supplyPrice !== undefined) sku.supplyPrice = batchPrice.supplyPrice
    if (batchPrice.salePrice !== undefined) sku.salePrice = batchPrice.salePrice
  })
  batchPriceVisible.value = false
  Message.success('批量设置价格成功')
}

function handleDeleteSku(record: any) {
  const index = formData.skuList.indexOf(record)
  if (index > -1) {
    formData.skuList.splice(index, 1)
  }
  Message.success('删除成功')
}

function openAddSkuModal() {
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  addSkuForm.value = {
    skuCode: `${formData.spuCode || 'SKU'}-MANUAL-${timestamp}${random}`,
    skuName: '',
    specInfo: '',
    supplyPrice: undefined,
    salePrice: undefined,
  }
  addSkuModalVisible.value = true
}

function parseSpecInfo(specInfo: string): Record<string, string> {
  if (!specInfo.trim()) {
    return { 规格: '标准款' }
  }
  
  const specs: Record<string, string> = {}
  const items = specInfo.split(/[、，,\s\n]+/).filter(s => s.trim())
  
  items.forEach((item, index) => {
    if (item.includes(':')) {
      const [key, value] = item.split(':')
      specs[key.trim()] = value.trim()
    } else if (item.includes('：')) {
      const [key, value] = item.split('：')
      specs[key.trim()] = value.trim()
    } else {
      specs[`规格${index + 1}`] = item.trim()
    }
  })
  
  return specs
}

function handleAddSkuConfirm() {
  if (!addSkuForm.value.skuName) {
    Message.warning('请输入SKU名称')
    return
  }

  const specs = parseSpecInfo(addSkuForm.value.specInfo)

  const newSku = {
    skuId: 'new_' + Date.now(),
    skuCode: addSkuForm.value.skuCode || (`SKU${Date.now()}`),
    skuName: addSkuForm.value.skuName,
    specs,
    skuImage: formData.mainImage,
    imageFileList: formData.mainImage ? [{ uid: '1', url: formData.mainImage, name: 'main' }] : [],
    supplyPrice: addSkuForm.value.supplyPrice,
    salePrice: addSkuForm.value.salePrice,
    source: 'manual',
  }

  formData.skuList.push(newSku)
  addSkuModalVisible.value = false
  Message.success('SKU添加成功')
}

function handleEditSpecText(record: any) {
  currentEditingSku.value = record
  const specTexts = Object.entries(record.specs || {}).map(([key, value]) => `${key}:${value}`).join('、')
  editSpecForm.value.specInfo = specTexts
  editSpecModalVisible.value = true
}

function handleEditSpecConfirm() {
  if (currentEditingSku.value) {
    const specs = parseSpecInfo(editSpecForm.value.specInfo)
    currentEditingSku.value.specs = specs
    currentEditingSku.value.skuName = Object.values(specs).join(' ')
  }
  editSpecModalVisible.value = false
  Message.success('规格更新成功')
}

async function handleSave() {
  try {
    await formRef.value?.validate()
  } catch {
    Message.warning('请完善必填信息')
    return
  }

  if (formData.specList.length === 0 || formData.skuList.length === 0) {
    Message.warning('请至少添加一个规格属性并生成SKU')
    return
  }

  submitting.value = true
  try {
    const spuParams = {
      spuName: formData.spuName,
      spuCode: formData.spuCode,
      categoryId: formData.categoryId,
      unit: formData.unit,
      mainImage: formData.mainImage,
      images: formData.images,
      description: formData.description,
      remark: formData.remark,
      attrIds: [],
    }

    let currentSpuId: string
    if (isEdit.value && formData.spuId) {
      await updateSpu(formData.spuId, spuParams)
      currentSpuId = formData.spuId
      Message.success('SPU更新成功')
    } else {
      const spu = await createSpu(spuParams)
      currentSpuId = spu.spuId
      Message.success('SPU创建成功')
    }

    for (const sku of formData.skuList) {
      await createSku({
        skuCode: sku.skuCode,
        skuName: sku.skuName,
        spuId: currentSpuId,
        specs: sku.specs,
        unit: formData.unit,
        suggestPrice: sku.suggestPrice,
        supplyPrice: sku.supplyPrice,
        salePrice: sku.salePrice,
        costPrice: sku.costPrice,
        marketPrice: sku.marketPrice,
      })
    }

    handleBack()
  } catch (error: any) {
    Message.error(error.message || '保存失败')
  } finally {
    submitting.value = false
  }
}

function handleBack() {
  router.push('/product/spu')
}

function handleManageSku() {
  router.push({
    path: '/product/sku',
    query: { spuId: spuId.value, spuName: formData.spuName }
  })
}
</script>

<style scoped lang="less">
.spu-detail-page {
  background: var(--color-bg-2);
  min-height: 100vh;
}

.page-content {
  padding: 16px;
}

.section-card {
  margin-bottom: 16px;
}

.upload-btn {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--color-text-3);
}

.upload-text {
  margin-top: 8px;
  font-size: 12px;
}

.empty-spec,
.empty-sku {
  padding: 40px 0;
}

.spec-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.spec-item {
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 16px;
  background: var(--color-fill-1);
}

.spec-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.spec-name-input {
  flex: 1;
}

.spec-values {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.sku-preview {
  margin-top: 24px;
  
  .preview-info {
    color: var(--color-text-2);
    
    strong {
      color: var(--color-primary);
      font-size: 18px;
    }
  }
}

.sku-count {
  color: var(--color-text-3);
  font-size: 14px;
}

.spec-combo-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
  
  .spec-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 2px;
  }
}

.sku-image-upload {
  width: 48px;
  height: 48px;
  border: 1px dashed var(--color-border);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
  transition: border-color 0.2s;
  
  &:hover {
    border-color: var(--color-primary);
  }
}

.sku-image-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.sku-image-placeholder {
  color: var(--color-text-3);
  font-size: 16px;
}

:deep(.arco-input-number) {
  width: 100%;
}
</style>
