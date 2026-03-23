<template>
  <a-drawer
    :visible="visible"
    :title="isEdit ? '编辑SPU' : '新增SPU'"
    :width="720"
    :footer="false"
    @cancel="handleCancel"
  >
    <a-form ref="formRef" :model="formData" :rules="rules" layout="vertical">
      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item field="spuName" label="SPU名称" required>
            <a-input v-model="formData.spuName" placeholder="请输入SPU名称" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item field="spuCode" label="SPU编码">
            <a-input v-model="formData.spuCode" placeholder="请输入SPU编码（选填）" />
          </a-form-item>
        </a-col>
      </a-row>

      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item field="categoryId" label="商品分类" required>
            <a-cascader
              v-model="formData.categoryId"
              :options="categoryTree"
              placeholder="请选择商品分类"
              :field-names="{ value: 'categoryId', label: 'categoryName', children: 'children' }"
              allow-search
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item field="unit" label="计量单位" required>
            <a-select v-model="formData.unit" placeholder="请选择计量单位" allow-create>
              <a-option value="吨">吨</a-option>
              <a-option value="公斤">公斤</a-option>
              <a-option value="方">方</a-option>
              <a-option value="米">米</a-option>
              <a-option value="件">件</a-option>
              <a-option value="套">套</a-option>
            </a-select>
          </a-form-item>
        </a-col>
      </a-row>

      <a-form-item field="attrIds" label="关联属性" required>
        <a-select
          v-model="formData.attrIds"
          placeholder="请选择关联属性（可多选）"
          multiple
          :field-names="{ value: 'attrId', label: 'attrName' }"
        >
          <a-option v-for="attr in attrList" :key="attr.attrId" :value="attr.attrId">
            {{ attr.attrName }}
            <span style="color: var(--color-text-3); margin-left: 8px;">
              ({{ attr.optionValues.slice(0, 3).join('、') }}{{ attr.optionValues.length > 3 ? '...' : '' }})
            </span>
          </a-option>
        </a-select>
        <template #extra>
          <span style="color: var(--color-text-3);">选择属性后，可在SKU管理中配置具体规格值</span>
        </template>
      </a-form-item>

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
            <div class="upload-trigger">
              <icon-plus />
              <div class="upload-text">上传主图</div>
            </div>
          </template>
        </a-upload>
      </a-form-item>

      <a-form-item field="images" label="商品图片">
        <a-upload
          list-type="picture-card"
          :file-list="imagesFileList"
          :limit="5"
          accept="image/*"
          :auto-upload="false"
          @change="handleImagesChange"
        >
          <template #upload-button>
            <div class="upload-trigger">
              <icon-plus />
              <div class="upload-text">上传图片</div>
            </div>
          </template>
        </a-upload>
        <template #extra>
          <span style="color: var(--color-text-3);">最多上传5张图片</span>
        </template>
      </a-form-item>

      <a-form-item field="description" label="商品描述">
        <a-textarea
          v-model="formData.description"
          placeholder="请输入商品描述"
          :max-length="500"
          show-word-limit
          :auto-size="{ minRows: 3, maxRows: 6 }"
        />
      </a-form-item>

      <a-form-item field="remark" label="备注">
        <a-textarea
          v-model="formData.remark"
          placeholder="请输入备注信息"
          :max-length="200"
          show-word-limit
          :auto-size="{ minRows: 2, maxRows: 4 }"
        />
      </a-form-item>
    </a-form>

    <div class="drawer-footer">
      <a-space>
        <a-button @click="handleCancel">取消</a-button>
        <a-button type="primary" :loading="submitting" @click="handleSubmit">
          {{ isEdit ? '保存修改' : '创建SPU' }}
        </a-button>
      </a-space>
    </div>
  </a-drawer>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import { Message } from '@arco-design/web-vue'
import type { FormInstance } from '@arco-design/web-vue'
import type { ProductCategory, ProductAttr, SupplierProductSpu } from '@gongchengcang/types'

const props = defineProps<{
  visible: boolean
  spu: SupplierProductSpu | null
  categoryTree: ProductCategory[]
  attrList: ProductAttr[]
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  success: []
}>()

const formRef = ref<FormInstance>()
const submitting = ref(false)
const mainImageFileList = ref<any[]>([])
const imagesFileList = ref<any[]>([])

const isEdit = computed(() => !!props.spu)

interface FormData {
  spuName: string
  spuCode: string
  categoryId: string[]
  unit: string
  attrIds: string[]
  mainImage: string
  images: string[]
  description: string
  remark: string
}

const formData = reactive<FormData>({
  spuName: '',
  spuCode: '',
  categoryId: [],
  unit: '',
  attrIds: [],
  mainImage: '',
  images: [],
  description: '',
  remark: '',
})

const rules = {
  spuName: [{ required: true, message: '请输入SPU名称' }],
  categoryId: [{ required: true, message: '请选择商品分类' }],
  unit: [{ required: true, message: '请选择计量单位' }],
  attrIds: [{ required: true, message: '请选择关联属性', type: 'array' }],
}

watch(
  () => props.visible,
  (val) => {
    if (val) {
      if (props.spu) {
        formData.spuName = props.spu.spuName
        formData.spuCode = props.spu.spuCode || ''
        formData.categoryId = [props.spu.categoryId]
        formData.unit = props.spu.unit
        formData.attrIds = props.spu.attrIds || []
        formData.mainImage = props.spu.mainImage || ''
        formData.images = props.spu.images || []
        formData.description = props.spu.description || ''
        formData.remark = props.spu.remark || ''
        
        if (props.spu.mainImage) {
          mainImageFileList.value = [{ uid: '1', url: props.spu.mainImage }]
        }
        if (props.spu.images?.length) {
          imagesFileList.value = props.spu.images.map((url, index) => ({
            uid: String(index + 1),
            url,
          }))
        }
      } else {
        resetForm()
      }
    }
  }
)

function resetForm() {
  formData.spuName = ''
  formData.spuCode = ''
  formData.categoryId = []
  formData.unit = ''
  formData.attrIds = []
  formData.mainImage = ''
  formData.images = []
  formData.description = ''
  formData.remark = ''
  mainImageFileList.value = []
  imagesFileList.value = []
  formRef.value?.resetFields()
}

function handleMainImageChange(fileList: any[]) {
  mainImageFileList.value = fileList
  if (fileList.length > 0 && fileList[0].url) {
    formData.mainImage = fileList[0].url
  } else {
    formData.mainImage = ''
  }
}

function handleImagesChange(fileList: any[]) {
  imagesFileList.value = fileList
  formData.images = fileList.filter(f => f.url).map(f => f.url)
}

async function handleSubmit() {
  try {
    const valid = await formRef.value?.validate()
    if (valid) return
    
    submitting.value = true
    await new Promise(resolve => setTimeout(resolve, 500))
    
    Message.success(isEdit.value ? '修改成功' : '创建成功')
    emit('success')
    handleCancel()
  } finally {
    submitting.value = false
  }
}

function handleCancel() {
  emit('update:visible', false)
  resetForm()
}
</script>

<style scoped lang="less">
.upload-trigger {
  width: 80px;
  height: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--color-text-3);
  
  .upload-text {
    font-size: 12px;
    margin-top: 4px;
  }
}

.drawer-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px 20px;
  background: var(--color-bg-2);
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: flex-end;
}
</style>
