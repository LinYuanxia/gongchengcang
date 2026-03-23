<template>
  <a-drawer
    :visible="visible"
    :title="isEdit ? '编辑分类' : '新增分类'"
    :width="480"
    @cancel="handleCancel"
    @ok="handleOk"
  >
    <a-form ref="formRef" :model="formData" :rules="rules" layout="vertical">
      <a-form-item field="categoryName" label="分类名称" :rules="[{ required: true, message: '请输入分类名称' }]">
        <a-input v-model="formData.categoryName" placeholder="请输入分类名称" />
      </a-form-item>
      <a-form-item field="parentId" label="上级分类">
        <a-tree-select
          v-model="formData.parentId"
          :data="parentTreeData"
          placeholder="请选择上级分类（不选则为一级分类）"
          allow-clear
          :field-names="{ key: 'categoryId', title: 'categoryName', children: 'children' }"
        />
      </a-form-item>
      <a-form-item field="sortOrder" label="排序号">
        <a-input-number v-model="formData.sortOrder" placeholder="请输入排序号" :min="0" />
      </a-form-item>
      <a-form-item field="status" label="状态">
        <a-radio-group v-model="formData.status">
          <a-radio :value="ProductCategoryStatus.ENABLED">启用</a-radio>
          <a-radio :value="ProductCategoryStatus.DISABLED">禁用</a-radio>
        </a-radio-group>
      </a-form-item>
    </a-form>
  </a-drawer>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Message } from '@arco-design/web-vue'
import { ProductCategoryStatus } from '@gongchengcang/types'
import type { ProductCategory, CreateCategoryParams, UpdateCategoryParams } from '@gongchengcang/types'
import { createCategory, updateCategory } from '@gongchengcang/api'

const props = defineProps<{
  visible: boolean
  category: ProductCategory | null
  parentId?: string
  categoryList: ProductCategory[]
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  success: []
}>()

const formRef = ref()
const isEdit = computed(() => !!props.category)

const formData = ref<CreateCategoryParams & { categoryId?: string }>({
  categoryName: '',
  parentId: undefined,
  sortOrder: 0,
  status: ProductCategoryStatus.ENABLED,
})

const rules = {
  categoryName: [{ required: true, message: '请输入分类名称' }],
}

const parentTreeData = computed(() => {
  if (isEdit.value && props.category) {
    return filterCategoryTree(props.categoryList, props.category.categoryId)
  }
  return buildTreeData(props.categoryList)
})

function buildTreeData(list: ProductCategory[]): ProductCategory[] {
  const map = new Map<string, ProductCategory>()
  const roots: ProductCategory[] = []
  
  list.forEach(item => {
    map.set(item.categoryId, { ...item, children: [] })
  })
  
  list.forEach(item => {
    const node = map.get(item.categoryId)!
    if (item.parentId) {
      const parent = map.get(item.parentId)
      if (parent) {
        parent.children = parent.children || []
        parent.children.push(node)
      }
    } else {
      roots.push(node)
    }
  })
  
  return roots
}

function filterCategoryTree(list: ProductCategory[], excludeId: string): ProductCategory[] {
  return list
    .filter(item => item.categoryId !== excludeId)
    .map(item => ({
      ...item,
      children: item.children ? filterCategoryTree(item.children, excludeId) : undefined,
    }))
}

watch(
  () => props.visible,
  (val) => {
    if (val) {
      if (props.category) {
        formData.value = {
          categoryId: props.category.categoryId,
          categoryName: props.category.categoryName,
          parentId: props.category.parentId,
          sortOrder: props.category.sortOrder,
          status: props.category.status,
        }
      } else {
        formData.value = {
          categoryName: '',
          parentId: props.parentId,
          sortOrder: 0,
          status: ProductCategoryStatus.ENABLED,
        }
      }
    }
  }
)

function handleCancel() {
  emit('update:visible', false)
  formRef.value?.resetFields()
}

async function handleOk() {
  try {
    await formRef.value?.validate()
    
    if (isEdit.value && formData.value.categoryId) {
      const params: UpdateCategoryParams = {
        categoryName: formData.value.categoryName,
        sortOrder: formData.value.sortOrder,
        status: formData.value.status,
      }
      await updateCategory(formData.value.categoryId, params)
      Message.success('编辑成功')
    } else {
      const params: CreateCategoryParams = {
        categoryName: formData.value.categoryName,
        parentId: formData.value.parentId,
        sortOrder: formData.value.sortOrder,
        status: formData.value.status,
      }
      await createCategory(params)
      Message.success('新增成功')
    }
    
    emit('success')
    handleCancel()
  } catch (error: any) {
    if (error.message) {
      Message.error(error.message)
    }
  }
}
</script>
