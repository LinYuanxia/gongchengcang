<template>
  <a-form ref="formRef" :model="formData" layout="vertical">
    <a-row :gutter="16">
      <a-col :span="12">
        <a-form-item field="spuName" label="SPU名称" :rules="[{ required: true, message: '请输入SPU名称' }]">
          <a-input v-model="formData.spuName" placeholder="请输入SPU名称" />
        </a-form-item>
      </a-col>
      <a-col :span="12">
        <a-form-item field="spuCode" label="SPU编码">
          <a-input v-model="formData.spuCode" placeholder="请输入SPU编码" />
        </a-form-item>
      </a-col>
    </a-row>
    <a-row :gutter="16">
      <a-col :span="12">
        <a-form-item field="categoryId" label="所属分类" :rules="[{ required: true, message: '请选择所属分类' }]">
          <a-cascader
            v-model="formData.categoryId"
            :data="categoryTree"
            placeholder="请选择所属分类"
            :field-names="{ value: 'categoryId', label: 'categoryName', children: 'children' }"
          />
        </a-form-item>
      </a-col>
      <a-col :span="12">
        <a-form-item field="unit" label="计量单位" :rules="[{ required: true, message: '请输入计量单位' }]">
          <a-select v-model="formData.unit" placeholder="请选择或输入计量单位" allow-create>
            <a-option value="吨">吨</a-option>
            <a-option value="米">米</a-option>
            <a-option value="个">个</a-option>
            <a-option value="件">件</a-option>
            <a-option value="套">套</a-option>
            <a-option value="千克">千克</a-option>
            <a-option value="立方米">立方米</a-option>
            <a-option value="平方米">平方米</a-option>
          </a-select>
        </a-form-item>
      </a-col>
    </a-row>
    <a-row :gutter="16">
      <a-col :span="12">
        <a-form-item field="mainImage" label="商品主图">
          <a-input v-model="formData.mainImage" placeholder="请输入主图URL" />
        </a-form-item>
      </a-col>
      <a-col :span="12">
        <a-form-item label="商品相册">
          <div class="image-list">
            <div v-for="(img, index) in formData.images" :key="index" class="image-item">
              <a-image :src="img" :width="60" :height="60" fit="cover" />
              <a-button type="text" size="mini" status="danger" class="remove-btn" @click="removeImage(index)">
                <icon-delete />
              </a-button>
            </div>
            <a-input
              v-model="newImageUrl"
              placeholder="输入图片URL后回车添加"
              style="width: 200px"
              @press-enter="addImage"
            />
          </div>
        </a-form-item>
      </a-col>
    </a-row>
    <a-form-item field="description" label="商品描述">
      <a-textarea v-model="formData.description" placeholder="请输入商品描述" :max-length="500" show-word-limit :auto-size="{ minRows: 3, maxRows: 6 }" />
    </a-form-item>
    <a-form-item field="remark" label="商品备注">
      <a-textarea v-model="formData.remark" placeholder="请输入商品备注" :max-length="500" show-word-limit :auto-size="{ minRows: 2, maxRows: 4 }" />
    </a-form-item>
  </a-form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { ProductCategory } from '@gongchengcang/types'

const props = defineProps<{
  formData: {
    spuName: string
    spuCode: string
    categoryId: string
    unit: string
    mainImage: string
    images: string[]
    description: string
    remark: string
  }
  categoryTree: ProductCategory[]
}>()

const formRef = ref()
const newImageUrl = ref()

defineExpose({
  validate: async () => {
    try {
      await formRef.value?.validate()
      return true
    } catch {
      return false
    }
  },
})

function addImage() {
  if (newImageUrl.value && newImageUrl.value.trim()) {
    props.formData.images.push(newImageUrl.value.trim())
    newImageUrl.value = ''
  }
}

function removeImage(index: number) {
  props.formData.images.splice(index, 1)
}
</script>

<style scoped lang="less">
.image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.image-item {
  position: relative;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  overflow: hidden;

  .remove-btn {
    position: absolute;
    top: 0;
    right: 0;
    background: rgba(0, 0, 0, 0.5);
    color: #fff;
  }
}
</style>
