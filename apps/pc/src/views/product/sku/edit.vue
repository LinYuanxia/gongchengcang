<template>
  <div class="sku-edit-page">
    <a-page-header
      :title="isEdit ? '编辑SKU' : '新增SKU'"
      subtitle="商品SKU信息管理"
      @back="handleBack"
    >
      <template #extra>
        <a-space>
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
                <a-form-item field="spuId" label="所属SPU" :rules="[{ required: true, message: '请选择所属SPU' }]">
                  <a-select
                    v-model="formData.spuId"
                    placeholder="请选择所属SPU"
                    allow-search
                    :disabled="isEdit"
                    @change="handleSpuChange"
                  >
                    <a-option v-for="item in spuList" :key="item.spuId" :value="item.spuId">
                      {{ item.spuName }}
                      <span style="color: var(--color-text-3); margin-left: 8px">{{ item.categoryName }}</span>
                    </a-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item field="skuCode" label="SKU编码" :rules="[{ required: true, message: '请输入SKU编码' }]">
                  <a-input v-model="formData.skuCode" placeholder="请输入SKU编码" :disabled="isEdit" />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item field="skuName" label="SKU名称" :rules="[{ required: true, message: '请输入SKU名称' }]">
                  <a-input v-model="formData.skuName" placeholder="请输入SKU名称" />
                </a-form-item>
              </a-col>
            </a-row>

            <a-row v-if="selectedSpu" :gutter="24">
              <a-col :span="24">
                <a-form-item label="规格属性">
                  <div class="spec-form">
                    <div v-for="attrId in selectedSpu.attrIds" :key="attrId" class="spec-item">
                      <span class="spec-label">{{ getAttrName(attrId) }}</span>
                      <a-select
                        v-model="formData.specs[getAttrName(attrId)]"
                        :placeholder="`请选择${getAttrName(attrId)}`"
                        allow-clear
                        allow-create
                      >
                        <a-option v-for="value in getAttrValues(attrId)" :key="value" :value="value">
                          {{ value }}
                        </a-option>
                      </a-select>
                    </div>
                  </div>
                </a-form-item>
              </a-col>
            </a-row>

            <a-row :gutter="24">
              <a-col :span="8">
                <a-form-item field="unit" label="计量单位" :rules="[{ required: true, message: '请输入计量单位' }]">
                  <a-select v-model="formData.unit" placeholder="请选择或输入计量单位" allow-create allow-search>
                    <a-option v-for="item in unitOptions" :key="item" :value="item">{{ item }}</a-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item field="barcode" label="条形码">
                  <a-input v-model="formData.barcode" placeholder="请输入条形码" />
                </a-form-item>
              </a-col>
            </a-row>

            <a-row :gutter="24">
              <a-col :span="12">
                <a-form-item field="mainImage" label="SKU主图">
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
          </a-card>

          <a-card title="价格信息" class="section-card">
            <a-row :gutter="24">
              <a-col :span="6">
                <a-form-item field="supplyPrice" label="供货价">
                  <a-input-number v-model="formData.supplyPrice" placeholder="供货价" :min="0" :precision="2" style="width: 100%">
                    <template #prefix>¥</template>
                  </a-input-number>
                </a-form-item>
              </a-col>
              <a-col :span="6">
                <a-form-item field="salePrice" label="销售价">
                  <a-input-number v-model="formData.salePrice" placeholder="销售价" :min="0" :precision="2" style="width: 100%">
                    <template #prefix>¥</template>
                  </a-input-number>
                </a-form-item>
              </a-col>
              <a-col :span="6">
                <a-form-item field="costPrice" label="销售成本价">
                  <a-input-number v-model="formData.costPrice" placeholder="销售成本价" :min="0" :precision="2" style="width: 100%">
                    <template #prefix>¥</template>
                  </a-input-number>
                </a-form-item>
              </a-col>
              <a-col :span="6">
                <a-form-item field="marketPrice">
                  <template #label>
                    <span>市场价</span>
                    <span style="text-decoration: line-through; margin-left: 4px; color: var(--color-text-3); font-size: 12px;">价格</span>
                  </template>
                  <a-input-number v-model="formData.marketPrice" placeholder="市场价" :min="0" :precision="2" style="width: 100%">
                    <template #prefix>¥</template>
                  </a-input-number>
                </a-form-item>
              </a-col>
            </a-row>
          </a-card>
        </a-form>
      </a-spin>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import type { Spu, ProductAttr, UpdateSkuParams } from '@gongchengcang/types'
import { getSkuDetail, updateSku, getSpuList, getAttrList } from '@gongchengcang/api'

const route = useRoute()
const router = useRouter()

const isEdit = computed(() => !!route.params.id)
const skuId = computed(() => route.params.id as string)

const loading = ref(false)
const submitting = ref(false)
const formRef = ref()
const spuList = ref<Spu[]>([])
const attrList = ref<ProductAttr[]>([])
const mainImageFileList = ref<any[]>([])
const imagesFileList = ref<any[]>([])

const unitOptions = ['吨', '米', '个', '件', '套', '千克', '立方米', '平方米', '桶', '箱', '包']

const formData = ref<UpdateSkuParams & { skuId?: string }>({
  skuCode: '',
  skuName: '',
  specs: {},
  unit: '',
  barcode: '',
  mainImage: '',
  images: [],
  supplyPrice: undefined,
  salePrice: undefined,
  costPrice: undefined,
  marketPrice: undefined,
})

const selectedSpu = computed(() => {
  return spuList.value.find(s => s.spuId === formData.value.spuId)
})

onMounted(async () => {
  await loadSpuList()
  await loadAttrList()
  if (isEdit.value) {
    await loadSkuDetail()
  }
})

async function loadSpuList() {
  try {
    const result = await getSpuList({ page: 1, pageSize: 1000 })
    spuList.value = result.list
  } catch (error) {
    console.error('加载SPU列表失败:', error)
  }
}

async function loadAttrList() {
  try {
    attrList.value = await getAttrList()
  } catch (error) {
    console.error('加载属性列表失败:', error)
  }
}

async function loadSkuDetail() {
  loading.value = true
  try {
    const sku = await getSkuDetail(skuId.value)
    formData.value = {
      skuId: sku.skuId,
      skuCode: sku.skuCode,
      skuName: sku.skuName,
      spuId: sku.spuId,
      specs: { ...sku.specs },
      unit: sku.unit,
      barcode: sku.barcode || '',
      mainImage: sku.mainImage || '',
      images: sku.images || [],
      supplyPrice: sku.supplyPrice,
      salePrice: sku.salePrice,
      costPrice: sku.costPrice,
      marketPrice: sku.marketPrice,
    }

    if (formData.value.mainImage) {
      mainImageFileList.value = [{ uid: '1', url: formData.value.mainImage, name: 'main' }]
    }
    if (formData.value.images && formData.value.images.length > 0) {
      imagesFileList.value = formData.value.images.map((url, index) => ({
        uid: String(index),
        url,
        name: `image-${index}`,
      }))
    }
  } catch (error: any) {
    Message.error(error.message || '获取SKU详情失败')
  } finally {
    loading.value = false
  }
}

function getAttrName(attrId: string) {
  const attr = attrList.value.find(a => a.attrId === attrId)
  return attr?.attrName || attrId
}

function getAttrValues(attrId: string) {
  const attr = attrList.value.find(a => a.attrId === attrId)
  return attr?.optionValues || []
}

function handleSpuChange(spuId: string) {
  const spu = spuList.value.find(s => s.spuId === spuId)
  if (spu) {
    formData.value.unit = spu.unit
    formData.value.specs = {}
  }
}

function handleMainImageChange(fileList: any[]) {
  mainImageFileList.value = fileList
  if (fileList.length > 0) {
    const file = fileList[0]
    if (file.url) {
      formData.value.mainImage = file.url
    } else if (file.file) {
      formData.value.mainImage = URL.createObjectURL(file.file)
    }
  } else {
    formData.value.mainImage = ''
  }
}

function handleImagesChange(fileList: any[]) {
  imagesFileList.value = fileList
  formData.value.images = fileList
    .filter(f => f.url || f.file)
    .map(f => f.url || (f.file ? URL.createObjectURL(f.file) : ''))
}

function handleBack() {
  router.push('/product/sku')
}

async function handleSave() {
  try {
    await formRef.value.validate()
  } catch {
    return
  }

  submitting.value = true
  try {
    await updateSku(skuId.value, formData.value)
    Message.success('保存成功')
    handleBack()
  } catch (error: any) {
    Message.error(error.message || '保存失败')
  } finally {
    submitting.value = false
  }
}
</script>

<script lang="ts">
export default {
  name: 'SkuEdit',
}
</script>

<style scoped lang="less">
.sku-edit-page {
  background: var(--color-bg-2);
  min-height: 100vh;
}

.page-content {
  padding: 16px;
}

.section-card {
  margin-bottom: 16px;
}

.spec-form {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;

  .spec-item {
    display: flex;
    align-items: center;
    gap: 8px;

    .spec-label {
      min-width: 80px;
      color: var(--color-text-2);
    }

    .arco-select {
      width: 200px;
    }
  }
}

.upload-btn {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--color-text-3);

  .upload-text {
    margin-top: 8px;
    font-size: 12px;
  }
}

:deep(.arco-input-number) {
  width: 100%;
}
</style>
