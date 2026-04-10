<template>
  <a-drawer
    :visible="visible"
    title="SKU管理"
    :width="1100"
    @cancel="handleCancel"
    @ok="handleOk"
  >
    <a-spin :loading="loading">
      <div class="sku-manage-drawer">
        <div class="toolbar">
          <a-space>
            <a-button type="primary" @click="openAddSkuModal">
              <template #icon><icon-plus /></template>
              单独新增SKU
            </a-button>
            <a-button @click="openGenerateModal">
              <template #icon><icon-magic-stick /></template>
              按规格生成SKU
            </a-button>
          </a-space>
          <a-button type="outline" @click="openBatchEditModal">批量编辑价格</a-button>
        </div>

        <div class="section-title">SKU列表（共 {{ skuList.length }} 个）</div>
        
        <div class="sku-table-container">
          <a-empty v-if="skuList.length === 0" description="暂无SKU数据，请点击上方按钮添加SKU" />
          <a-table v-else :data="skuList" :pagination="false">
            <template #columns>
              <a-table-column title="规格信息" :width="220">
                <template #cell="{ record, rowIndex }">
                  <div class="spec-tags">
                    <a-tag
                      v-for="(value, key) in record.specs"
                      :key="key"
                      size="small"
                      color="arcoblue"
                      closable
                      @close="handleRemoveSpec(record, key, rowIndex)"
                    >
                      {{ key }}: {{ value }}
                    </a-tag>
                    <a-button
                      type="text"
                      size="small"
                      @click="handleEditSpec(record)"
                    >
                      编辑规格
                    </a-button>
                  </div>
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
                    :file-list="record.mainImageFileList || []"
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
              <a-table-column title="库存" :width="100">
                <template #cell="{ record }">
                  <a-input-number
                    v-model="record.stock"
                    placeholder="库存"
                    :min="0"
                    :precision="0"
                    size="small"
                    style="width: 100%"
                  />
                </template>
              </a-table-column>
              <a-table-column title="来源" :width="100">
                <template #cell="{ record }">
                  <a-tag :color="record.source === 'auto' ? 'green' : 'blue'" size="small">
                    {{ record.source === 'auto' ? '规格生成' : '手动新增' }}
                  </a-tag>
                </template>
              </a-table-column>
              <a-table-column title="操作" :width="100" fixed="right">
                <template #cell="{ record }">
                  <a-space>
                    <a-button type="text" size="small" @click="handleEditSpec(record)">编辑规格</a-button>
                    <a-popconfirm
                      title="确认删除该SKU吗？"
                      content="删除后不可恢复"
                      @ok="handleDeleteSku(record)"
                    >
                      <a-button type="text" size="small" status="danger">删除</a-button>
                    </a-popconfirm>
                  </a-space>
                </template>
              </a-table-column>
            </template>
          </a-table>
        </div>
      </div>
    </a-spin>
  </a-drawer>

  <!-- 单独新增SKU弹窗 -->
  <a-modal v-model:visible="addSkuModalVisible" title="单独新增SKU" :width="700" @ok="handleAddSkuConfirm" @cancel="addSkuModalVisible = false">
    <a-form :model="newSkuForm" layout="vertical">
      <a-form-item label="自定义规格描述">
        <a-input v-model="newSkuForm.specDesc" placeholder="如：定制款、特殊规格、无规格商品等" :maxlength="100" />
      </a-form-item>
      <a-divider orientation="left">规格属性（可选，用于自定义组合规格）</a-divider>
      <a-form-item label="规格属性">
        <div class="spec-edit-area">
          <div v-for="(spec, index) in newSkuForm.specList" :key="index" class="spec-edit-item">
            <a-select
              v-model="spec.name"
              placeholder="规格名称"
              allow-create
              allow-search
              style="width: 150px"
            >
              <a-option v-for="attr in attrList" :key="attr.attrId" :value="attr.attrName">
                {{ attr.attrName }}
              </a-option>
            </a-select>
            <a-select
              v-model="spec.value"
              placeholder="规格值"
              allow-create
              allow-search
              style="width: 150px; margin-left: 8px"
            >
              <a-option v-for="val in getAttrValues(spec.name)" :key="val" :value="val">
                {{ val }}
              </a-option>
            </a-select>
            <a-button type="text" status="danger" style="margin-left: 8px" @click="removeNewSkuSpec(index)">
              <icon-delete />
            </a-button>
          </div>
          <a-button type="text" @click="addNewSkuSpec">
            <icon-plus />
            添加规格项
          </a-button>
        </div>
      </a-form-item>
      <a-divider />
      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="SKU编码">
            <a-input v-model="newSkuForm.skuCode" placeholder="系统自动生成或手动输入" :maxlength="50" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="SKU名称">
            <a-input v-model="newSkuForm.skuName" placeholder="SKU名称" :maxlength="200" />
          </a-form-item>
        </a-col>
      </a-row>
      <a-row :gutter="16">
        <a-col :span="8">
          <a-form-item label="供货价">
            <a-input-number
              v-model="newSkuForm.supplyPrice"
              placeholder="供货价"
              :min="0"
              :precision="2"
              style="width: 100%"
            >
              <template #prefix>¥</template>
            </a-input-number>
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item label="销售价">
            <a-input-number
              v-model="newSkuForm.salePrice"
              placeholder="销售价"
              :min="0"
              :precision="2"
              style="width: 100%"
            >
              <template #prefix>¥</template>
            </a-input-number>
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item label="初始库存">
            <a-input-number
              v-model="newSkuForm.stock"
              placeholder="库存"
              :min="0"
              :precision="0"
              style="width: 100%"
            />
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
  </a-modal>

  <!-- 按规格生成SKU弹窗 -->
  <a-modal v-model:visible="generateModalVisible" title="按规格属性生成SKU" :width="800" :footer="false">
    <div class="generate-sku-content">
      <div class="spec-combination-section">
        <div v-for="(attr, index) in attrList" :key="attr.attrId" class="spec-item">
          <div class="spec-label">
            {{ attr.attrName }}
            <span class="tip">（选择用于生成SKU的属性值）</span>
          </div>
          <a-checkbox-group v-model="generateSelectedSpecs[index]" @change="handleGenerateSpecChange">
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
        <a-space>
          <a-button @click="generateModalVisible = false">取消</a-button>
          <a-button type="primary" :disabled="!canGenerate" @click="handleGenerateConfirm">生成SKU</a-button>
        </a-space>
      </div>

      <a-divider />

      <div class="preview-section">
        <div class="section-title">预览将生成以下 SKU：</div>
        <a-table :data="previewSkuList" :pagination="false" size="small">
          <template #columns>
            <a-table-column title="规格组合" :width="300">
              <template #cell="{ record }">
                <span v-for="(value, key) in record.specs" :key="key" style="margin-right: 8px">
                  <a-tag size="small" color="arcoblue">{{ key }}: {{ value }}</a-tag>
                </span>
              </template>
            </a-table-column>
            <a-table-column title="SKU编码" :width="150">
              <template #cell="{ record }">
                <a-input
                  v-model="record.skuCode"
                  placeholder="SKU编码"
                  size="small"
                />
              </template>
            </a-table-column>
          </template>
        </a-table>
      </div>

      <div class="button-group" style="justify-content: flex-end">
        <a-space>
          <a-button @click="generateModalVisible = false">取消</a-button>
          <a-button type="primary" :disabled="previewSkuList.length === 0" @click="handleAddGeneratedSkus">
            确认添加到SKU列表
          </a-button>
        </a-space>
      </div>
    </div>
  </a-modal>

  <!-- 编辑规格弹窗 -->
  <a-modal v-model:visible="editSpecModalVisible" title="编辑SKU规格" :width="600" @ok="handleEditSpecConfirm" @cancel="editSpecModalVisible = false">
    <a-form :model="editSpecForm" layout="vertical">
      <a-form-item label="规格属性">
        <div class="spec-edit-area">
          <div v-for="(spec, index) in editSpecForm.specList" :key="index" class="spec-edit-item">
            <a-select
              v-model="spec.name"
              placeholder="规格名称"
              allow-create
              allow-search
              style="width: 150px"
            >
              <a-option v-for="attr in attrList" :key="attr.attrId" :value="attr.attrName">
                {{ attr.attrName }}
              </a-option>
            </a-select>
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

  <!-- 批量编辑弹窗 -->
  <a-modal
    v-model:visible="batchEditModalVisible"
    title="批量编辑价格"
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
import { getAttrList, getSkuList } from '@gongchengcang/api'

const props = defineProps<{
  visible: boolean
  spu: Spu | null
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  success: []
}>()

const loading = ref(false)
const skuList = ref<any[]>([])
const attrList = ref<ProductAttr[]>([])

const addSkuModalVisible = ref(false)
const generateModalVisible = ref(false)
const editSpecModalVisible = ref(false)
const batchEditModalVisible = ref(false)

const currentEditingSku = ref<any>(null)

const newSkuForm = ref({
  specDesc: '',
  specList: [{ name: '', value: '' }],
  skuCode: '',
  skuName: '',
  supplyPrice: undefined as number | undefined,
  salePrice: undefined as number | undefined,
  stock: 0,
})

const editSpecForm = ref({
  specList: [{ name: '', value: '' }],
})

const generateSelectedSpecs = ref<any[][]>([])
const previewSkuList = ref<any[]>([])

const batchEditForm = ref({
  supplyPrice: undefined as number | undefined,
  salePrice: undefined as number | undefined,
})

const canGenerate = computed(() => {
  return generateSelectedSpecs.value.some(arr => arr && arr.length > 0)
})

watch(
  () => props.visible,
  async (val) => {
    if (val && props.spu) {
      await loadAttrList()
      await loadExistingSkuList()
    }
  }
)

async function loadAttrList() {
  try {
    const result = await getAttrList({ page: 1, pageSize: 100 })
    attrList.value = result.filter((attr: ProductAttr) => props.spu?.attrIds.includes(attr.attrId))
    generateSelectedSpecs.value = attrList.value.map(() => [])
  } catch (error) {
    console.error('加载属性列表失败:', error)
  }
}

async function loadExistingSkuList() {
  try {
    if (props.spu) {
      const result = await getSkuList({ page: 1, pageSize: 100, spuId: props.spu.spuId })
      skuList.value = result.list.map((sku: Sku) => ({
        ...sku,
        source: sku.source || 'auto',
        specs: sku.specs || {},
        mainImageFileList: sku.mainImage ? [{ url: sku.mainImage, response: sku.mainImage }] : [],
      }))
    }
  } catch (error) {
    console.error('加载现有SKU列表失败:', error)
  }
}

function openAddSkuModal() {
  newSkuForm.value = {
    specDesc: '',
    specList: [{ name: '', value: '' }],
    skuCode: '',
    skuName: '',
    supplyPrice: undefined,
    salePrice: undefined,
    stock: 0,
  }
  addSkuModalVisible.value = true
}

function addNewSkuSpec() {
  newSkuForm.value.specList.push({ name: '', value: '' })
}

function removeNewSkuSpec(index: number) {
  newSkuForm.value.specList.splice(index, 1)
}

function getAttrValues(attrName: string) {
  const attr = attrList.value.find(a => a.attrName === attrName)
  return attr?.optionValues || []
}

function handleAddSkuConfirm() {
  const specs: Record<string, string> = {}
  newSkuForm.value.specList.forEach(spec => {
    if (spec.name && spec.value) {
      specs[spec.name] = spec.value
    }
  })

  if (newSkuForm.value.specDesc) {
    specs['自定义'] = newSkuForm.value.specDesc
  }

  const newSku = {
    skuId: 'new_' + Date.now(),
    skuCode: newSkuForm.value.skuCode || ('SKU' + Date.now()),
    skuName: newSkuForm.value.skuName || (props.spu?.spuName || '自定义SKU'),
    specs,
    supplyPrice: newSkuForm.value.supplyPrice,
    salePrice: newSkuForm.value.salePrice,
    stock: newSkuForm.value.stock || 0,
    source: 'manual',
    mainImageFileList: [],
    isNew: true,
  }

  skuList.value.push(newSku)
  addSkuModalVisible.value = false
  Message.success('SKU添加成功')
}

function openGenerateModal() {
  generateSelectedSpecs.value = attrList.value.map(() => [])
  previewSkuList.value = []
  generateModalVisible.value = true
}

function handleGenerateSpecChange() {
  generatePreviewSkus()
}

function generatePreviewSkus() {
  const selectedAttrs = attrList.value
    .map((attr, idx) => ({
      attr: attr.attrName,
      values: generateSelectedSpecs.value[idx] || [],
    }))
    .filter(a => a.values.length > 0)

  if (selectedAttrs.length === 0) {
    previewSkuList.value = []
    return
  }

  function cartesianProduct(arrays: any[], index = 0, current: any = {}, result: any[] = []) {
    if (index === arrays.length) {
      result.push({ ...current })
      return result
    }
    for (const value of arrays[index].values) {
      current[arrays[index].attr] = value
      cartesianProduct(arrays, index + 1, current, result)
    }
    return result
  }

  const combinations = cartesianProduct(selectedAttrs)
  previewSkuList.value = combinations.map((specs, idx) => ({
    specs,
    skuCode: '',
  }))
}

function handleGenerateConfirm() {
  generatePreviewSkus()
}

function handleAddGeneratedSkus() {
  previewSkuList.value.forEach((previewSku, idx) => {
    skuList.value.push({
      skuId: 'new_' + Date.now() + '_' + idx,
      skuCode: previewSku.skuCode || ('SKU' + Date.now() + idx),
      skuName: (props.spu?.spuName || '') + ' ' + Object.values(previewSku.specs).join(' '),
      specs: previewSku.specs,
      supplyPrice: undefined,
      salePrice: undefined,
      stock: 0,
      source: 'auto',
      mainImageFileList: [],
      isNew: true,
    })
  })

  generateModalVisible.value = false
  Message.success(`成功添加 ${previewSkuList.value.length} 个SKU`)
  previewSkuList.value = []
}

function handleEditSpec(record: any) {
  currentEditingSku.value = record
  editSpecForm.value.specList = Object.entries(record.specs || {}).map(([name, value]) => ({
    name,
    value,
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

function handleRemoveSpec(record: any, key: string, rowIndex: number) {
  delete record.specs[key]
}

function handleDeleteSku(record: any) {
  const index = skuList.value.indexOf(record)
  if (index > -1) {
    skuList.value.splice(index, 1)
  }
  Message.success('删除成功')
}

function openBatchEditModal() {
  batchEditForm.value = {
    supplyPrice: undefined,
    salePrice: undefined,
  }
  batchEditModalVisible.value = true
}

function handleBatchEditOk() {
  skuList.value.forEach(sku => {
    if (batchEditForm.value.supplyPrice !== undefined) {
      sku.supplyPrice = batchEditForm.value.supplyPrice
    }
    if (batchEditForm.value.salePrice !== undefined) {
      sku.salePrice = batchEditForm.value.salePrice
    }
  })
  batchEditModalVisible.value = false
  Message.success('批量编辑成功')
}

function handleBatchEditCancel() {
  batchEditModalVisible.value = false
}

function handleMainImageChange(fileList: any[], record: any) {
  record.mainImageFileList = fileList
}

function handleCancel() {
  emit('update:visible', false)
}

function handleOk() {
  emit('success')
  emit('update:visible', false)
  Message.success('SKU保存成功')
}
</script>

<style scoped>
.sku-manage-drawer {
  padding: 0 8px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e8e8e8;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  margin: 16px 0;
  color: #1d2129;
}

.sku-table-container {
  margin-top: 8px 0;
}

.spec-tags {
  min-height: 32px;
}

.spec-edit-area {
  padding: 8px 0;
}

.spec-edit-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.generate-sku-content {
  padding: 8px 0;
}

.spec-combination-section {
  margin-bottom: 16px 0;
}

.spec-item {
  margin-bottom: 16px 0;
}

.spec-label {
  font-weight: 500;
  margin-bottom: 8px 0;
}

.spec-label .tip {
  font-weight: normal;
  font-size: 12px;
  color: #86909c;
  margin-left: 8px;
}

.button-group {
  display: flex;
  justify-content: center;
  margin: 16px 0;
}

.preview-section {
  margin-top: 16px;
}

.upload-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  color: #86909c;
}

.upload-text {
  font-size: 12px;
  margin-top: 2px;
}
</style>
