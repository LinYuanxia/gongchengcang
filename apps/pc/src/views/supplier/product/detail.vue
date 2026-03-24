<template>
  <div class="spu-detail-page">
    <a-page-header
      :title="pageTitle"
      :subtitle="isFromPlatform ? '从平台商品库选择，填写供货信息' : '供应商商品信息管理'"
      @back="handleBack"
    >
      <template #extra>
        <a-space>
          <a-button @click="handleBack">取消</a-button>
          <a-button type="primary" :loading="submitting" @click="handleSave">
            提交审核
          </a-button>
        </a-space>
      </template>
    </a-page-header>

    <div class="page-content">
      <a-spin :loading="loading" style="width: 100%">
        <a-form ref="formRef" :model="formData" layout="vertical">
          <a-card title="基本信息" class="section-card">
            <template v-if="isFromPlatform">
              <a-alert type="info" style="margin-bottom: 16px">
                已从平台库选择 {{ formData.skuList.length }} 个SKU，请完善供货信息后提交审核
              </a-alert>
            </template>
            
            <a-row :gutter="24">
              <a-col :span="8">
                <a-form-item field="spuName" label="SPU名称" :rules="[{ required: true, message: '请输入SPU名称' }]">
                  <a-input 
                    v-model="formData.spuName" 
                    placeholder="请输入SPU名称" 
                    :max-length="100"
                    :disabled="isFromPlatform"
                  />
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
                    :disabled="isFromPlatform"
                    @change="handleCategoryChange"
                  />
                </a-form-item>
              </a-col>
            </a-row>
            <a-row :gutter="24">
              <a-col :span="8">
                <a-form-item field="unit" label="计量单位" :rules="[{ required: true, message: '请选择计量单位' }]">
                  <a-select 
                    v-model="formData.unit" 
                    placeholder="请选择或输入计量单位" 
                    allow-create 
                    allow-search
                    :disabled="isFromPlatform"
                  >
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
                    :disabled="isFromPlatform"
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
                    :disabled="isFromPlatform"
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
                  <a-textarea 
                    v-model="formData.description" 
                    placeholder="请输入商品描述" 
                    :max-length="500" 
                    show-word-limit 
                    :auto-size="{ minRows: 3, maxRows: 6 }"
                    :disabled="isFromPlatform"
                  />
                </a-form-item>
              </a-col>
            </a-row>
          </a-card>

          <a-card title="规格属性" class="section-card">
            <template #extra>
              <a-space>
                <a-button type="primary" size="small" @click="addSpec">
                  <template #icon><icon-plus /></template>
                  添加规格
                </a-button>
                <a-button type="outline" size="small" @click="showAddSkuModal">
                  <template #icon><icon-plus /></template>
                  添加SKU
                </a-button>
              </a-space>
            </template>

            <div v-if="formData.specList.length === 0" class="empty-spec">
              <a-empty description="暂无规格属性，请添加规格或直接添加SKU" />
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
                      :disabled="isFromPlatform"
                      @change="(val) => handleSpecNameChange(specIndex, val)"
                    >
                      <a-option v-for="attr in availableAttrList(specIndex)" :key="attr.attrId" :value="attr.attrName">
                        {{ attr.attrName }}
                      </a-option>
                    </a-select>
                  </div>
                  <a-button type="text" status="danger" @click="removeSpec(specIndex)" :disabled="isFromPlatform">
                    <icon-delete />
                  </a-button>
                </div>
                <div class="spec-values">
                  <a-tag
                    v-for="(value, valueIndex) in spec.values"
                    :key="valueIndex"
                    closable
                    color="arcoblue"
                    :disabled="isFromPlatform"
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
                    :disabled="isFromPlatform"
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
                <a-button size="small" @click="showBatchPriceModal">批量设置价格</a-button>
                <a-button size="small" @click="showBatchSupplyModal">批量设置供货信息</a-button>
                <span class="sku-count">共 {{ formData.skuList.length }} 个SKU</span>
              </a-space>
            </template>

            <div v-if="formData.skuList.length === 0" class="empty-sku">
              <a-empty description="暂无SKU，请添加规格自动生成或点击上方【添加SKU】按钮手动添加" />
            </div>

            <a-table v-else :data="formData.skuList" :pagination="false" :scroll="{ x: 1500 }" size="small">
              <template #columns>
                <a-table-column title="SKU主图" :width="80" fixed="left">
                  <template #cell="{ record, rowIndex }">
                    <a-upload
                      :file-list="record.imageFileList || []"
                      :show-file-list="false"
                      :auto-upload="false"
                      accept="image/*"
                      :disabled="isFromPlatform"
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
                    <a-input v-model="record.skuName" size="small" placeholder="SKU名称" :disabled="isFromPlatform" />
                  </template>
                </a-table-column>
                <a-table-column title="规格组合" :width="180">
                  <template #cell="{ record }">
                    <span v-for="(value, key) in record.specs" :key="key" style="margin-right: 8px">
                      <a-tag size="small" color="arcoblue">{{ key }}: {{ value }}</a-tag>
                    </span>
                  </template>
                </a-table-column>
                <a-table-column title="建议售价" :width="120">
                  <template #cell="{ record }">
                    <a-input-number v-model="record.suggestPrice" size="small" placeholder="建议售价" :min="0" :precision="2">
                      <template #prefix>¥</template>
                    </a-input-number>
                  </template>
                </a-table-column>
                <a-table-column title="供货价" :width="120">
                  <template #cell="{ record }">
                    <a-input-number v-model="record.supplyPrice" size="small" placeholder="供货价" :min="0" :precision="2">
                      <template #prefix>¥</template>
                    </a-input-number>
                  </template>
                </a-table-column>
                <a-table-column title="预计供货量" :width="130">
                  <template #cell="{ record }">
                    <a-input-number v-model="record.estimatedStock" size="small" placeholder="预计供货量" :min="0">
                      <template #suffix>{{ formData.unit }}</template>
                    </a-input-number>
                  </template>
                </a-table-column>
                <a-table-column title="最小起订量" :width="130">
                  <template #cell="{ record }">
                    <a-input-number v-model="record.minOrderQty" size="small" placeholder="最小起订量" :min="1">
                      <template #suffix>{{ formData.unit }}</template>
                    </a-input-number>
                  </template>
                </a-table-column>
                <a-table-column title="供货周期" :width="120">
                  <template #cell="{ record }">
                    <a-input-number v-model="record.leadTime" size="small" placeholder="供货周期" :min="1">
                      <template #suffix>天</template>
                    </a-input-number>
                  </template>
                </a-table-column>
                <a-table-column title="操作" :width="80" fixed="right">
                  <template #cell="{ rowIndex }">
                    <a-button 
                      type="text" 
                      size="small" 
                      status="danger" 
                      @click="removeSku(rowIndex)"
                      :disabled="isFromPlatform"
                    >
                      删除
                    </a-button>
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
            <a-form-item label="建议售价">
              <a-input-number v-model="batchPrice.suggestPrice" placeholder="建议售价" :min="0" :precision="2" style="width: 100%">
                <template #prefix>¥</template>
              </a-input-number>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="供货价">
              <a-input-number v-model="batchPrice.supplyPrice" placeholder="供货价" :min="0" :precision="2" style="width: 100%">
                <template #prefix>¥</template>
              </a-input-number>
            </a-form-item>
          </a-col>
        </a-row>
        <a-alert type="info">填写的价格将应用到所有SKU，留空的价格字段不会被修改</a-alert>
      </a-form>
    </a-modal>

    <a-modal v-model:visible="batchSupplyVisible" title="批量设置供货信息" @ok="applyBatchSupply">
      <a-form :model="batchSupply" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item label="预计供货量">
              <a-input-number v-model="batchSupply.estimatedStock" placeholder="预计供货量" :min="0" style="width: 100%">
                <template #suffix>{{ formData.unit }}</template>
              </a-input-number>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="最小起订量">
              <a-input-number v-model="batchSupply.minOrderQty" placeholder="最小起订量" :min="1" style="width: 100%">
                <template #suffix>{{ formData.unit }}</template>
              </a-input-number>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="供货周期">
              <a-input-number v-model="batchSupply.leadTime" placeholder="供货周期" :min="1" style="width: 100%">
                <template #suffix>天</template>
              </a-input-number>
            </a-form-item>
          </a-col>
        </a-row>
        <a-alert type="info">填写的信息将应用到所有SKU，留空的字段不会被修改</a-alert>
      </a-form>
    </a-modal>

    <a-modal v-model:visible="addSkuVisible" title="添加SKU" :width="600" @ok="handleAddSku">
      <a-form :model="addSkuForm" layout="vertical">
        <a-form-item label="SKU名称" required>
          <a-input v-model="addSkuForm.skuName" placeholder="请输入SKU名称" />
        </a-form-item>
        <a-form-item label="规格组合">
          <div v-if="formData.specList.length === 0" class="empty-spec-tip">
            <a-alert type="info">暂无规格属性，可直接添加SKU</a-alert>
          </div>
          <div v-else class="spec-select-list">
            <div v-for="(spec, index) in formData.specList" :key="index" class="spec-select-item">
              <span class="spec-label">{{ spec.name }}：</span>
              <a-select
                v-model="addSkuForm.specs[spec.name]"
                :placeholder="`请选择${spec.name}`"
                allow-create
                allow-search
                style="flex: 1"
              >
                <a-option v-for="value in spec.values" :key="value" :value="value">{{ value }}</a-option>
              </a-select>
            </div>
          </div>
        </a-form-item>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="建议售价">
              <a-input-number v-model="addSkuForm.suggestPrice" :min="0" :precision="2" style="width: 100%">
                <template #prefix>¥</template>
              </a-input-number>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="供货价" required>
              <a-input-number v-model="addSkuForm.supplyPrice" :min="0" :precision="2" style="width: 100%">
                <template #prefix>¥</template>
              </a-input-number>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item label="预计供货量">
              <a-input-number v-model="addSkuForm.estimatedStock" :min="0" style="width: 100%">
                <template #suffix>{{ formData.unit }}</template>
              </a-input-number>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="最小起订量">
              <a-input-number v-model="addSkuForm.minOrderQty" :min="1" style="width: 100%">
                <template #suffix>{{ formData.unit }}</template>
              </a-input-number>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="供货周期">
              <a-input-number v-model="addSkuForm.leadTime" :min="1" style="width: 100%">
                <template #suffix>天</template>
              </a-input-number>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import type { ProductCategory, ProductAttr } from '@gongchengcang/types'

const route = useRoute()
const router = useRouter()

const isEdit = computed(() => !!route.params.id)
const spuId = computed(() => route.params.id as string)
const isFromPlatform = computed(() => route.query.source === 'platform')

const pageTitle = computed(() => {
  if (isFromPlatform.value) return '申请供货'
  if (isEdit.value) return '编辑SPU'
  return '新增SPU'
})

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
  suggestPrice: undefined as number | undefined,
  supplyPrice: undefined as number | undefined,
})

const batchSupplyVisible = ref(false)
const batchSupply = reactive({
  estimatedStock: undefined as number | undefined,
  minOrderQty: undefined as number | undefined,
  leadTime: undefined as number | undefined,
})

const addSkuVisible = ref(false)
const addSkuForm = reactive({
  skuName: '',
  specs: {} as Record<string, string>,
  suggestPrice: undefined as number | undefined,
  supplyPrice: undefined as number | undefined,
  estimatedStock: undefined as number | undefined,
  minOrderQty: undefined as number | undefined,
  leadTime: undefined as number | undefined,
})

interface SpecItem {
  name: string
  values: string[]
}

interface SkuItem {
  skuId?: string
  skuCode: string
  skuName: string
  specs: Record<string, string>
  skuImage?: string
  imageFileList?: any[]
  suggestPrice?: number
  supplyPrice?: number
  estimatedStock?: number
  minOrderQty?: number
  leadTime?: number
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
  specList: SpecItem[]
  skuList: SkuItem[]
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
  specList: [],
  skuList: [],
})

onMounted(async () => {
  await Promise.all([loadCategoryTree(), loadAttrList()])
  
  if (isFromPlatform.value && route.query.skuData) {
    loadPlatformSkuData()
  } else if (isEdit.value && spuId.value) {
    await loadSpuDetail()
  } else {
    generateSpuCode()
  }
})

async function loadCategoryTree() {
  categoryTree.value = [
    {
      categoryId: 'cat001',
      categoryName: '钢材',
      level: 1,
      sortOrder: 1,
      status: 1,
      createdAt: '',
      updatedAt: '',
    },
    {
      categoryId: 'cat002',
      categoryName: '水泥',
      level: 1,
      sortOrder: 2,
      status: 1,
      createdAt: '',
      updatedAt: '',
    },
  ]
}

async function loadAttrList() {
  attrList.value = [
    {
      attrId: 'attr001',
      attrName: '规格',
      optionValues: ['12mm', '16mm', '20mm', '25mm'],
      status: 1,
      createdAt: '',
      updatedAt: '',
    },
    {
      attrId: 'attr002',
      attrName: '材质',
      optionValues: ['HRB400E', 'HRB500E', 'Q235'],
      status: 1,
      createdAt: '',
      updatedAt: '',
    },
    {
      attrId: 'attr003',
      attrName: '强度等级',
      optionValues: ['42.5', '52.5', '62.5'],
      status: 1,
      createdAt: '',
      updatedAt: '',
    },
  ]
}

function loadPlatformSkuData() {
  try {
    const skuDataStr = route.query.skuData as string
    if (!skuDataStr) return
    const skuData = JSON.parse(decodeURIComponent(skuDataStr))
    
    if (skuData && skuData.length > 0) {
      const firstSku = skuData[0]
      formData.spuName = firstSku.spuName
      formData.categoryId = firstSku.categoryName === '钢材' ? 'cat001' : 'cat002'
      formData.categoryIdPath = [formData.categoryId]
      formData.unit = firstSku.unit || '吨'
      formData.mainImage = firstSku.mainImage || ''
      
      if (formData.mainImage) {
        mainImageFileList.value = [{ uid: '1', url: formData.mainImage, name: 'main' }]
      }
      
      formData.skuList = skuData.map((sku: any, index: number) => ({
        skuId: sku.skuId,
        skuCode: sku.skuCode,
        skuName: sku.skuName,
        specs: sku.specs || {},
        skuImage: sku.mainImage,
        imageFileList: sku.mainImage ? [{ uid: '1', url: sku.mainImage, name: 'main' }] : [],
        suggestPrice: undefined,
        supplyPrice: undefined,
        estimatedStock: undefined,
        minOrderQty: undefined,
        leadTime: undefined,
      }))
      
      generateSpuCode()
    }
  } catch (error) {
    Message.error('解析平台商品数据失败')
  }
}

async function loadSpuDetail() {
  loading.value = true
  try {
    formData.spuId = spuId.value
    formData.spuName = '测试SPU'
    formData.spuCode = 'SPU-TEST-001'
    formData.categoryId = 'cat001'
    formData.categoryIdPath = ['cat001']
    formData.unit = '吨'
    formData.mainImage = 'https://picsum.photos/200/200'
    
    if (formData.mainImage) {
      mainImageFileList.value = [{ uid: '1', url: formData.mainImage, name: 'main' }]
    }
    
    formData.specList = [
      { name: '强度等级', values: ['42.5', '52.5'] },
    ]
    
    formData.skuList = [
      {
        skuId: 'sku-001',
        skuCode: 'SPU-TEST-001-0001',
        skuName: '测试SPU 42.5',
        specs: { '强度等级': '42.5' },
        skuImage: 'https://picsum.photos/200/200',
        imageFileList: [{ uid: '1', url: 'https://picsum.photos/200/200', name: 'main' }],
        suggestPrice: 450,
        supplyPrice: 420,
        estimatedStock: 1000,
        minOrderQty: 10,
        leadTime: 3,
      },
      {
        skuId: 'sku-002',
        skuCode: 'SPU-TEST-001-0002',
        skuName: '测试SPU 52.5',
        specs: { '强度等级': '52.5' },
        skuImage: 'https://picsum.photos/200/200',
        imageFileList: [{ uid: '1', url: 'https://picsum.photos/200/200', name: 'main' }],
        suggestPrice: 510,
        supplyPrice: 480,
        estimatedStock: 800,
        minOrderQty: 10,
        leadTime: 3,
      },
    ]
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
  if (!isFromPlatform.value) {
    formData.skuList.forEach(sku => {
      if (!sku.skuImage || sku.skuImage === formData.mainImage) {
        sku.skuImage = newMainImage
        sku.imageFileList = newMainImage ? [{ uid: '1', url: newMainImage, name: 'main' }] : []
      }
    })
  }
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
  const validSpecs = formData.specList.filter(s => s.name && s.values.length > 0)
  
  if (validSpecs.length === 0) {
    formData.skuList = []
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
  
  const existingSkuMap = new Map<string, SkuItem>()
  formData.skuList.forEach(sku => {
    const key = JSON.stringify(sku.specs)
    existingSkuMap.set(key, sku)
  })
  
  formData.skuList = specsList.map((specs, index) => {
    const key = JSON.stringify(specs)
    const existingSku = existingSkuMap.get(key)
    
    if (existingSku) {
      return existingSku
    }
    
    const skuName = Object.values(specs).join(' ')
    
    return {
      skuCode: generateSkuCode(index),
      skuName: `${formData.spuName} ${skuName}`,
      specs,
      skuImage: formData.mainImage,
      imageFileList: formData.mainImage ? [{ uid: '1', url: formData.mainImage, name: 'main' }] : [],
      suggestPrice: undefined,
      supplyPrice: undefined,
      estimatedStock: undefined,
      minOrderQty: undefined,
      leadTime: undefined,
    }
  })
}

function handleSkuImageChange(rowIndex: number, fileList: any[]) {
  const sku = formData.skuList[rowIndex]
  if (sku) {
    sku.imageFileList = fileList
    if (fileList.length > 0) {
      const file = fileList[0]
      sku.skuImage = file.url || (file.file ? URL.createObjectURL(file.file) : '')
    } else {
      sku.skuImage = ''
    }
  }
}

function showBatchPriceModal() {
  batchPriceVisible.value = true
}

function applyBatchPrice() {
  if (batchPrice.suggestPrice !== undefined) {
    formData.skuList.forEach(sku => {
      sku.suggestPrice = batchPrice.suggestPrice
    })
  }
  if (batchPrice.supplyPrice !== undefined) {
    formData.skuList.forEach(sku => {
      sku.supplyPrice = batchPrice.supplyPrice
    })
  }
  batchPriceVisible.value = false
  Message.success('批量设置成功')
}

function showBatchSupplyModal() {
  batchSupplyVisible.value = true
}

function applyBatchSupply() {
  if (batchSupply.estimatedStock !== undefined) {
    formData.skuList.forEach(sku => {
      sku.estimatedStock = batchSupply.estimatedStock
    })
  }
  if (batchSupply.minOrderQty !== undefined) {
    formData.skuList.forEach(sku => {
      sku.minOrderQty = batchSupply.minOrderQty
    })
  }
  if (batchSupply.leadTime !== undefined) {
    formData.skuList.forEach(sku => {
      sku.leadTime = batchSupply.leadTime
    })
  }
  batchSupplyVisible.value = false
  Message.success('批量设置成功')
}

function showAddSkuModal() {
  addSkuForm.skuName = formData.spuName
  addSkuForm.specs = {}
  addSkuForm.suggestPrice = undefined
  addSkuForm.supplyPrice = undefined
  addSkuForm.estimatedStock = undefined
  addSkuForm.minOrderQty = undefined
  addSkuForm.leadTime = undefined
  addSkuVisible.value = true
}

function handleAddSku() {
  if (!addSkuForm.skuName.trim()) {
    Message.warning('请输入SKU名称')
    return
  }
  
  if (addSkuForm.supplyPrice === undefined || addSkuForm.supplyPrice <= 0) {
    Message.warning('请填写供货价')
    return
  }
  
  const newSkuCode = generateSkuCode(formData.skuList.length)
  
  const newSku: SkuItem = {
    skuCode: newSkuCode,
    skuName: addSkuForm.skuName,
    specs: { ...addSkuForm.specs },
    skuImage: formData.mainImage,
    imageFileList: formData.mainImage ? [{ uid: '1', url: formData.mainImage, name: 'main' }] : [],
    suggestPrice: addSkuForm.suggestPrice,
    supplyPrice: addSkuForm.supplyPrice,
    estimatedStock: addSkuForm.estimatedStock,
    minOrderQty: addSkuForm.minOrderQty,
    leadTime: addSkuForm.leadTime,
  }
  
  formData.skuList.push(newSku)
  addSkuVisible.value = false
  Message.success('SKU添加成功')
}

function removeSku(index: number) {
  formData.skuList.splice(index, 1)
  Message.success('SKU已删除')
}

async function handleSave() {
  try {
    const valid = await formRef.value?.validate()
    if (valid) return
    
    if (formData.skuList.length === 0) {
      Message.warning('请至少添加一个SKU')
      return
    }
    
    const hasSupplyInfo = formData.skuList.every(sku => 
      sku.supplyPrice !== undefined && sku.supplyPrice > 0
    )
    if (!hasSupplyInfo) {
      Message.warning('请为所有SKU填写供货价')
      return
    }
    
    submitting.value = true
    
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    Message.success('提交成功，请等待平台审核')
    router.push('/supplier/product/list')
  } catch (error: any) {
    Message.error(error.message || '提交失败')
  } finally {
    submitting.value = false
  }
}

function handleBack() {
  router.back()
}
</script>

<style scoped lang="less">
.spu-detail-page {
  padding: 16px;
  background: var(--color-bg-1);
  min-height: 100vh;
}

.page-content {
  margin-top: 16px;
}

.section-card {
  margin-bottom: 16px;
}

.upload-btn {
  width: 80px;
  height: 80px;
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

.empty-spec,
.empty-sku {
  padding: 40px 0;
  text-align: center;
}

.spec-list {
  .spec-item {
    margin-bottom: 16px;
    padding: 16px;
    background: var(--color-fill-1);
    border-radius: 4px;
    
    .spec-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    
    .spec-values {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: center;
    }
  }
}

.sku-preview {
  .preview-info {
    padding: 12px;
    background: var(--color-fill-1);
    border-radius: 4px;
    text-align: center;
  }
}

.sku-image-upload {
  width: 48px;
  height: 48px;
  border: 1px dashed var(--color-border);
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  
  .sku-image-preview {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .sku-image-placeholder {
    color: var(--color-text-3);
  }
}

.sku-count {
  color: var(--color-text-3);
  font-size: 12px;
}

.empty-spec-tip {
  margin-bottom: 16px;
}

.spec-select-list {
  .spec-select-item {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
    
    .spec-label {
      width: 80px;
      flex-shrink: 0;
    }
  }
}
</style>
