<template>
  <div class="sku-edit-page">
    <a-page-header
      title="编辑SKU"
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
                <a-form-item field="spuId" label="所属SPU">
                  <a-select
                    v-model="formData.spuId"
                    placeholder="请选择所属SPU"
                    allow-search
                    disabled
                  >
                    <a-option v-for="item in spuList" :key="item.spuId" :value="item.spuId">
                      {{ item.spuName }}
                      <span style="color: var(--color-text-3); margin-left: 8px">{{ item.categoryName }}</span>
                    </a-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item field="skuCode" label="SKU编码">
                  <a-input v-model="formData.skuCode" placeholder="请输入SKU编码" disabled />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item field="skuName" label="SKU名称" :rules="[{ required: true, message: '请输入SKU名称' }]">
                  <a-input v-model="formData.skuName" placeholder="请输入SKU名称" />
                </a-form-item>
              </a-col>
            </a-row>

            <a-row :gutter="24">
              <a-col :span="24">
                <a-form-item label="规格属性">
                  <template #extra>
                    <a-button type="text" size="small" @click="handleAddEditSpec">
                      <icon-plus /> 新增规格属性
                    </a-button>
                  </template>
                  <div v-if="editSpecList.length === 0" class="empty-spec-tip">
                    <a-empty description="暂无规格属性" />
                  </div>
                  <div v-else class="spec-form">
                    <div v-for="spec in editSpecList" :key="spec.key" class="spec-item">
                      <a-form-item :label="spec.name">
                        <template #label>
                          <span class="spec-label">{{ spec.name }}</span>
                          <a-button type="text" size="small" class="delete-btn" @click="handleRemoveEditSpec(spec)">
                            <icon-close />
                          </a-button>
                        </template>
                        <a-input v-model="spec.value" placeholder="请输入规格值" style="width: 100%" allow-clear />
                      </a-form-item>
                    </div>
                  </div>
                </a-form-item>
              </a-col>
            </a-row>

            <a-row :gutter="24">
              <a-col :span="8">
                <a-form-item field="unit" label="计量单位">
                  <a-select v-model="formData.unit" placeholder="计量单位" disabled>
                    <a-option v-for="item in unitOptions" :key="item" :value="item">{{ item }}</a-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item field="barcode" label="条形码">
                  <a-input v-model="formData.barcode" placeholder="请输入条形码" disabled />
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
            </a-row>
          </a-card>

          <a-card title="价格信息" class="section-card">
            <a-row :gutter="24">
              <a-col :span="12">
                <a-form-item field="supplyPrice" label="供货价">
                  <a-input-number v-model="formData.supplyPrice" placeholder="供货价" :min="0" :precision="2" style="width: 100%">
                    <template #prefix>¥</template>
                  </a-input-number>
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item field="salePrice" label="销售价">
                  <a-input-number v-model="formData.salePrice" placeholder="销售价" :min="0" :precision="2" style="width: 100%">
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
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import type { Spu, UpdateSkuParams } from '@gongchengcang/types'
import { getSkuDetail, updateSku, getSpuList } from '@gongchengcang/api'

const route = useRoute()
const router = useRouter()

const skuId = route.params.id as string

const loading = ref(false)
const submitting = ref(false)
const formRef = ref()
const spuList = ref<Spu[]>([])
const mainImageFileList = ref<any[]>([])

const unitOptions = ['吨', '米', '个', '件', '套', '千克', '立方米', '平方米', '桶', '箱', '包']

const formData = ref<UpdateSkuParams & { skuId?: string; spuId?: string }>({
  skuCode: '',
  skuName: '',
  specs: {},
  unit: '',
  barcode: '',
  mainImage: '',
  supplyPrice: undefined,
  salePrice: undefined,
  spuId: '',
})

const editSpecList = ref<{ key: string; name: string; value: string }[]>([])
const editSpecCounter = ref(0)

onMounted(async () => {
  await loadSpuList()
  await loadSkuDetail()
})

async function loadSpuList() {
  try {
    const result = await getSpuList({ page: 1, pageSize: 1000 })
    spuList.value = result.list
  } catch (error) {
    console.error('加载SPU列表失败:', error)
  }
}

async function loadSkuDetail() {
  loading.value = true
  try {
    const sku = await getSkuDetail(skuId)
    if (sku) {
      formData.value = {
        skuId: sku.skuId,
        skuCode: sku.skuCode,
        skuName: sku.skuName,
        spuId: sku.spuId,
        specs: { ...sku.specs },
        unit: sku.unit,
        barcode: sku.barcode || '',
        mainImage: sku.mainImage || '',
        supplyPrice: sku.supplyPrice,
        salePrice: sku.salePrice,
      }

      if (formData.value.mainImage) {
        mainImageFileList.value = [{ uid: '1', url: formData.value.mainImage, name: 'main' }]
      }
      
      initEditSpecList()
    }
  } catch (error: any) {
    Message.error(error.message || '获取SKU详情失败')
  } finally {
    loading.value = false
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

function initEditSpecList() {
  editSpecCounter.value = 0
  editSpecList.value = []
  if (formData.value.specs) {
    Object.entries(formData.value.specs).forEach(([name, value]) => {
      editSpecCounter.value++
      editSpecList.value.push({
        key: `spec_${editSpecCounter.value}`,
        name,
        value: value || '',
      })
    })
  }
}

function handleAddEditSpec() {
  editSpecCounter.value++
  editSpecList.value.push({
    key: `custom_${editSpecCounter.value}`,
    name: '',
    value: '',
  })
}

function handleRemoveEditSpec(spec: { key: string }) {
  const index = editSpecList.value.findIndex(item => item.key === spec.key)
  if (index > -1) {
    editSpecList.value.splice(index, 1)
  }
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
    // 将可编辑规格列表转为 Record<string, string>
    const specs: Record<string, string> = {}
    editSpecList.value.forEach(spec => {
      if (spec.name && spec.value) {
        specs[spec.name] = spec.value
      }
    })
    
    await updateSku(skuId, { ...formData.value, specs })
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

.empty-spec-tip {
  padding: 20px 0;
}

.spec-form {
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
</style>