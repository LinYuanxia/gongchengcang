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
        <a-form-item label="SKU规格信息">
          <a-textarea v-model="addSkuForm.specInfo" placeholder="请输入规格信息，如：红色、XL、纯棉 或 颜色:红色、尺寸:XL" :max-length="200" show-word-limit :auto-size="{ minRows: 2, maxRows: 4 }" />
          <div class="form-tip">提示：多个规格用顿号、逗号、空格或换行分隔，支持键值对格式</div>
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

    <a-modal v-model:visible="editSpecModalVisible" title="编辑SKU规格" :width="600" @ok="handleEditSpecConfirm" @cancel="editSpecModalVisible = false">
      <a-form :model="editSpecForm" layout="vertical">
        <a-form-item label="规格属性">
          <div class="spec-edit-area">
            <div v-for="(spec, index) in editSpecForm.specList" :key="index" class="spec-edit-item">
              <a-input
                v-model="spec.name"
                placeholder="规格名称"
                style="width: 150px"
              />
              <a-input
                v-model="spec.value"
                placeholder="规格值"
                style="width: 150px; margin-left: 8px"
              />
              <a-button type="text" status="danger" style="margin-left: 8px" @click="removeEditSpec(index)">
                <icon-delete />
              </a-button>
            </div>
            <a-button type="text" @click="addEditSpec">
              <icon-plus />
              添加规格项
            </a-button>
          </div>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Message } from '@arco-design/web-vue'
import type { SkuPriceInfo } from '@gongchengcang/types'

const props = defineProps<{
  formData: {
    skuList: any[]
  }
}>()

const showBatchSetPrice = ref(false)
const addSkuModalVisible = ref(false)
const editSpecModalVisible = ref(false)
const currentEditingSku = ref<any>(null)

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
  editSpecForm.value.specList = Object.entries(record.specs || {}).map(([name, value]) => ({
    name,
    value: value as string,
  }))
  if (editSpecForm.value.specList.length === 0) {
    editSpecForm.value.specList.push({ name: '', value: '' })
  }
  editSpecModalVisible.value = true
}

function addEditSpec() {
  editSpecForm.value.specList.push({ name: '', value: '' })
}

function removeEditSpec(index: number) {
  editSpecForm.value.specList.splice(index, 1)
}

function handleEditSpecConfirm() {
  const specs: Record<string, string> = {}
  editSpecForm.value.specList.forEach(spec => {
    if (spec.name && spec.value) {
      specs[spec.name] = spec.value
    }
  })
  currentEditingSku.value.specs = specs
  editSpecModalVisible.value = false
  Message.success('规格更新成功')
}

function openAddSkuModal() {
  addSkuForm.value = {
    skuCode: '',
    skuName: '',
    specInfo: '',
    suggestPrice: undefined,
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
    skuCode: addSkuForm.value.skuCode || ('SKU' + Date.now()),
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

  :deep(.arco-input-number) {
    width: 100%;
  }

  .form-tip {
    font-size: 12px;
    color: #86909c;
    margin-top: 4px;
  }

  .spec-edit-area {
    padding: 8px 0;
  }

  .spec-edit-item {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
  }
}
</style>
