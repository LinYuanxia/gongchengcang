<template>
  <div class="sku-price">
    <div class="price-header">
      <span class="title">SKU定价（共 {{ formData.skuList.length }} 个）</span>
      <a-space>
        <a-button size="small" type="primary" @click="openAddSkuModal">
          <template #icon><icon-plus /></template>
          单独新增SKU
        </a-button>
        <a-button size="small" @click="showBatchSetPrice = true">批量设置价格</a-button>
        <a-button size="small" @click="resetPrices">清空价格</a-button>
      </a-space>
    </div>

    <div v-if="formData.skuList.length === 0" class="empty-tip">
      <a-empty description="暂无SKU，可通过配置规格属性生成，或点击上方按钮单独新增SKU" />
    </div>

    <a-table v-else :data="formData.skuList" :pagination="false" :scroll="{ x: 1400 }" size="small">
      <template #columns>
        <a-table-column title="SKU编码" data-index="skuCode" :width="120" fixed="left">
          <template #cell="{ record, rowIndex }">
            <a-input v-model="record.skuCode" size="small" placeholder="编码" />
          </template>
        </a-table-column>
        <a-table-column title="SKU名称" data-index="skuName" :width="150">
          <template #cell="{ record }">
            <a-input v-model="record.skuName" size="small" placeholder="名称" />
          </template>
        </a-table-column>
        <a-table-column title="规格组合" :width="250">
          <template #cell="{ record }">
            <span v-for="(value, key) in record.specs" :key="key" style="margin-right: 6px">
              <a-tag size="small" closable @close="() => handleRemoveSpec(record, key)">
                {{ key }}: {{ value }}
              </a-tag>
            </span>
            <a-button type="text" size="small" @click="handleEditSpec(record)">编辑规格</a-button>
          </template>
        </a-table-column>
        <a-table-column title="来源" :width="100">
          <template #cell="{ record }">
            <a-tag :color="record.source === 'auto' ? 'green' : 'blue'" size="small">
              {{ record.source === 'auto' ? '规格生成' : '手动新增' }}
            </a-tag>
          </template>
        </a-table-column>
        <a-table-column title="建议零售价" :width="120">
          <template #cell="{ record }">
            <a-input-number v-model="record.suggestPrice" size="small" placeholder="建议零售价" :min="0" :precision="2" />
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

    <a-modal v-model:visible="showBatchSetPrice" title="批量设置价格" @ok="applyBatchPrice">
      <a-form :model="batchPrice" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="建议零售价">
              <a-input-number v-model="batchPrice.suggestPrice" placeholder="建议零售价" :min="0" :precision="2" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="供货价">
              <a-input-number v-model="batchPrice.supplyPrice" placeholder="供货价" :min="0" :precision="2" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="销售价">
              <a-input-number v-model="batchPrice.salePrice" placeholder="销售价" :min="0" :precision="2" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-alert type="info" style="margin-top: 8px">
          填写的价格将应用到所有SKU，留空的价格字段不会被修改
        </a-alert>
      </a-form>
    </a-modal>

    <a-modal v-model:visible="addSkuModalVisible" title="单独新增SKU" :width="700" @ok="handleAddSkuConfirm" @cancel="addSkuModalVisible = false">
      <a-form :model="addSkuForm" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="SKU编码">
              <a-input v-model="addSkuForm.skuCode" placeholder="系统自动生成或手动输入" :maxlength="50" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="SKU名称" :rules="[{ required: true, message: '请输入SKU名称' }]">
              <a-input v-model="addSkuForm.skuName" placeholder="SKU名称" :maxlength="200" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item label="SKU规格属性">
          <template #extra>
            <a-button type="text" size="small" @click="handleAddSkuCustomSpec">
              <icon-plus /> 新增规格属性
            </a-button>
          </template>
          
          <div v-if="addSkuSpecList.length === 0" class="empty-spec-tip">
            <a-empty description="该SPU暂无规格属性，可点击上方按钮新增" :image-size="80" />
          </div>
          <div v-else class="spec-form">
            <div v-for="spec in addSkuSpecList" :key="spec.key" class="spec-item">
              <a-form-item :label="spec.name">
                <template #label>
                  <span class="spec-label">{{ spec.name || '自定义规格' }}</span>
                  <a-button
                    type="text"
                    size="small"
                    class="delete-btn"
                    @click="handleRemoveSkuSpec(spec)"
                  >
                    <icon-close />
                  </a-button>
                </template>
                <a-input-group>
                  <a-select
                    v-if="spec.isCustom"
                    v-model="spec.name"
                    placeholder="选择规格属性"
                    style="width: 140px"
                    allow-clear
                    allow-search
                  >
                    <a-option
                      v-for="attr in getAvailableAttrsForSku(spec)"
                      :key="attr.attrId"
                      :value="attr.attrName"
                    >
                      {{ attr.attrName }}
                    </a-option>
                  </a-select>
                  <a-select
                    v-if="spec.optionValues && spec.optionValues.length > 0"
                    v-model="spec.selectedValue"
                    placeholder="请选择规格值"
                    style="width: 100%"
                    allow-clear
                  >
                    <a-option
                      v-for="value in spec.optionValues"
                      :key="value"
                      :value="value"
                    >
                      {{ value }}
                    </a-option>
                  </a-select>
                  <a-input
                    v-else
                    v-model="spec.selectedValue"
                    placeholder="请输入规格值"
                    style="width: 100%"
                    allow-clear
                  />
                </a-input-group>
              </a-form-item>
            </div>
          </div>
        </a-form-item>
        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item label="建议零售价">
              <a-input-number v-model="addSkuForm.suggestPrice" placeholder="建议零售价" :min="0" :precision="2" style="width: 100%" />
            </a-form-item>
          </a-col>
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

    <a-modal v-model:visible="editSpecModalVisible" title="编辑SKU规格" :width="700" @ok="handleEditSpecConfirm" @cancel="editSpecModalVisible = false">
      <a-form layout="vertical">
        <a-form-item label="规格属性">
          <template #extra>
            <a-button type="text" size="small" @click="handleAddEditSpec">
              <icon-plus /> 新增规格属性
            </a-button>
          </template>
          
          <div class="spec-form">
            <div v-for="spec in editSpecList" :key="spec.key" class="spec-item">
              <a-form-item :label="spec.name">
                <template #label>
                  <span class="spec-label">{{ spec.name || '自定义规格' }}</span>
                  <a-button
                    type="text"
                    size="small"
                    class="delete-btn"
                    @click="handleRemoveEditSpec(spec)"
                  >
                    <icon-close />
                  </a-button>
                </template>
                <a-input-group>
                  <a-select
                    v-if="spec.isCustom"
                    v-model="spec.name"
                    placeholder="选择规格属性"
                    style="width: 140px"
                    allow-clear
                    allow-search
                  >
                    <a-option
                      v-for="attr in getAvailableAttrsForEdit(spec)"
                      :key="attr.attrId"
                      :value="attr.attrName"
                    >
                      {{ attr.attrName }}
                    </a-option>
                  </a-select>
                  <a-select
                    v-if="spec.optionValues && spec.optionValues.length > 0"
                    v-model="spec.selectedValue"
                    placeholder="请选择规格值"
                    style="width: 100%"
                    allow-clear
                  >
                    <a-option
                      v-for="value in spec.optionValues"
                      :key="value"
                      :value="value"
                    >
                      {{ value }}
                    </a-option>
                  </a-select>
                  <a-input
                    v-else
                    v-model="spec.selectedValue"
                    placeholder="请输入规格值"
                    style="width: 100%"
                    allow-clear
                  />
                </a-input-group>
              </a-form-item>
            </div>
          </div>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watchEffect, inject } from 'vue'
import { Message } from '@arco-design/web-vue'
import type { ProductAttr } from '@gongchengcang/types'

const props = defineProps<{
  formData: {
    skuList: any[]
    specList: any[]
  }
}>()

const attrList = inject('attrList', ref<ProductAttr[]>([]))

const showBatchSetPrice = ref(false)
const addSkuModalVisible = ref(false)
const editSpecModalVisible = ref(false)
const currentEditingSku = ref<any>(null)
const addSkuSpecList = ref<any[]>([])
const addSkuSpecCounter = ref(0)
const editSpecList = ref<any[]>([])
const editSpecCounter = ref(0)

const batchPrice = reactive({
  suggestPrice: undefined as number | undefined,
  supplyPrice: undefined as number | undefined,
  salePrice: undefined as number | undefined,
})

const addSkuForm = ref({
  skuCode: '',
  skuName: '',
  specInfo: '',
  suggestPrice: undefined as number | undefined,
  supplyPrice: undefined as number | undefined,
  salePrice: undefined as number | undefined,
})

const editSpecForm = ref({
  specList: [{ name: '', value: '' }],
})

watchEffect(() => {
  addSkuSpecList.value.forEach(spec => {
    if (spec.isCustom && spec.name) {
      const attr = attrList.value.find(a => a.attrName === spec.name)
      if (attr) {
        spec.optionValues = attr.optionValues || []
      }
    }
  })
  
  editSpecList.value.forEach(spec => {
    if (spec.isCustom && spec.name) {
      const attr = attrList.value.find(a => a.attrName === spec.name)
      if (attr) {
        spec.optionValues = attr.optionValues || []
      }
    }
  })
})

function applyBatchPrice() {
  props.formData.skuList.forEach(sku => {
    if (batchPrice.suggestPrice !== undefined) sku.suggestPrice = batchPrice.suggestPrice
    if (batchPrice.supplyPrice !== undefined) sku.supplyPrice = batchPrice.supplyPrice
    if (batchPrice.salePrice !== undefined) sku.salePrice = batchPrice.salePrice
  })
  showBatchSetPrice.value = false
}

function resetPrices() {
  props.formData.skuList.forEach(sku => {
    sku.suggestPrice = undefined
    sku.supplyPrice = undefined
    sku.salePrice = undefined
  })
}

function handleDeleteSku(record: any) {
  const index = props.formData.skuList.indexOf(record)
  if (index > -1) {
    props.formData.skuList.splice(index, 1)
  }
  Message.success('删除成功')
}

function handleRemoveSpec(record: any, key: string) {
  delete record.specs[key]
  Message.success('删除规格成功')
}

function handleEditSpec(record: any) {
  currentEditingSku.value = record
  
  editSpecList.value = []
  editSpecCounter.value = 0
  
  Object.entries(record.specs || {}).forEach(([key, value]) => {
    const specInfo = props.formData.specList.find((s: any) => s.name === key)
    editSpecCounter.value++
    
    editSpecList.value.push({
      key: `spec_${editSpecCounter.value}`,
      name: key,
      optionValues: specInfo?.values || [],
      selectedValue: value,
      isCustom: !specInfo,
    })
  })
  
  editSpecModalVisible.value = true
}

function getAvailableAttrsForSku(spec: any) {
  const usedNames = addSkuSpecList.value
    .filter((s: any) => s.key !== spec.key && s.name)
    .map((s: any) => s.name)
  return attrList.value.filter((attr: any) => !usedNames.includes(attr.attrName))
}

function getAvailableAttrsForEdit(spec: any) {
  const usedNames = editSpecList.value
    .filter((s: any) => s.key !== spec.key && s.name)
    .map((s: any) => s.name)
  return attrList.value.filter((attr: any) => !usedNames.includes(attr.attrName))
}

function handleAddSkuCustomSpec() {
  addSkuSpecCounter.value++
  const key = `custom_${addSkuSpecCounter.value}`
  addSkuSpecList.value.push({
    key,
    name: '',
    optionValues: [],
    selectedValue: '',
    isCustom: true,
  })
}

function handleRemoveSkuSpec(spec: any) {
  const index = addSkuSpecList.value.findIndex(item => item.key === spec.key)
  if (index > -1) {
    addSkuSpecList.value.splice(index, 1)
  }
}

function handleAddEditSpec() {
  editSpecCounter.value++
  const key = `custom_${editSpecCounter.value}`
  editSpecList.value.push({
    key,
    name: '',
    optionValues: [],
    selectedValue: '',
    isCustom: true,
  })
}

function handleRemoveEditSpec(spec: any) {
  const index = editSpecList.value.findIndex(item => item.key === spec.key)
  if (index > -1) {
    editSpecList.value.splice(index, 1)
  }
}

function handleEditSpecConfirm() {
  if (currentEditingSku.value) {
    const specs: Record<string, string> = {}
    editSpecList.value.forEach(spec => {
      const specKey = spec.name || spec.key
      if (specKey && spec.selectedValue) {
        specs[specKey] = spec.selectedValue
      }
    })
    
    if (Object.keys(specs).length === 0) {
      specs['规格'] = '标准款'
    }
    
    currentEditingSku.value.specs = specs
  }
  editSpecModalVisible.value = false
  Message.success('规格更新成功')
}

function openAddSkuModal() {
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  addSkuForm.value = {
    skuCode: `SKU-MANUAL-${timestamp}${random}`,
    skuName: '',
    specInfo: '',
    suggestPrice: undefined,
    supplyPrice: undefined,
    salePrice: undefined,
  }
  
  addSkuSpecList.value = props.formData.specList.map((spec: any, index: number) => ({
    key: `spec_${index}`,
    name: spec.name,
    optionValues: spec.values || [],
    selectedValue: '',
    isCustom: false,
  }))
  addSkuSpecCounter.value = props.formData.specList.length
  
  addSkuModalVisible.value = true
}

function handleAddSkuConfirm() {
  if (!addSkuForm.value.skuName) {
    Message.warning('请输入SKU名称')
    return
  }
  
  const specs: Record<string, string> = {}
  addSkuSpecList.value.forEach(spec => {
    const specKey = spec.name || spec.key
    if (specKey && spec.selectedValue) {
      specs[specKey] = spec.selectedValue
    }
  })
  
  if (Object.keys(specs).length === 0) {
    specs['规格'] = '标准款'
  }
  
  const existSku = props.formData.skuList.find((sku: any) => {
    const currentSpecs = Object.entries(specs).sort().join(',')
    const existSpecs = Object.entries(sku.specs || {}).sort().join(',')
    return currentSpecs === existSpecs
  })
  
  if (existSku) {
    Message.warning('该规格组合的SKU已存在')
    return
  }

  const newSku = {
    skuId: 'new_' + Date.now(),
    skuCode: addSkuForm.value.skuCode,
    skuName: addSkuForm.value.skuName,
    specs,
    suggestPrice: addSkuForm.value.suggestPrice,
    supplyPrice: addSkuForm.value.supplyPrice,
    salePrice: addSkuForm.value.salePrice,
    source: 'manual',
  }

  props.formData.skuList.push(newSku)
  addSkuModalVisible.value = false
  Message.success('SKU添加成功')
}

defineExpose({
  validate: async () => {
    return true
  },
})
</script>

<style scoped lang="less">
.sku-price {
  .price-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .title {
      font-size: 16px;
      font-weight: 500;
    }
  }

  .empty-tip {
    padding: 40px 0;
  }

  .empty-spec-tip {
    padding: 20px 0;
  }

  :deep(.arco-input-number) {
    width: 100%;
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

  .spec-edit-item {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
  }
}
</style>
