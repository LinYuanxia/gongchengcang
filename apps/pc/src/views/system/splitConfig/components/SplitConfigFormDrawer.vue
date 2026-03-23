<template>
  <a-drawer
    :visible="visible"
    :title="mode === 'add' ? '新增分账配置' : '编辑分账配置'"
    :width="700"
    :footer="true"
    @cancel="handleClose"
    unmount-on-close
  >
    <a-form ref="formRef" :model="formData" layout="vertical">
      <a-form-item field="ruleName" label="规则名称" :rules="[{ required: true, message: '请输入规则名称' }]">
        <a-input v-model="formData.ruleName" placeholder="请输入规则名称" :max-length="50" />
      </a-form-item>

      <a-form-item field="ruleCategory" label="规则类型" :rules="[{ required: true, message: '请选择规则类型' }]">
        <a-select v-model="formData.ruleCategory" placeholder="请选择规则类型" @change="handleRuleCategoryChange">
          <a-option v-for="item in SPLIT_RULE_CATEGORY_OPTIONS" :key="item.value" :value="item.value">
            <div class="rule-category-option">
              <span class="label">{{ item.label }}</span>
              <span class="desc">{{ item.description }}</span>
            </div>
          </a-option>
        </a-select>
        <div v-if="currentCategoryInfo" class="priority-tip">
          <a-tag color="blue">优先级：{{ currentCategoryInfo.priority }}</a-tag>
          <span class="desc">{{ currentCategoryInfo.description }}</span>
        </div>
      </a-form-item>

      <template v-if="formData.ruleCategory === SplitRuleCategory.PRODUCT">
        <a-form-item field="productType" label="商品范围" :rules="[{ required: true, message: '请选择商品范围' }]">
          <a-select v-model="formData.productType" placeholder="请选择商品范围" @change="handleProductTypeChange">
            <a-option v-for="item in SPLIT_RULE_PRODUCT_TYPE_OPTIONS" :key="item.value" :value="item.value">
              {{ item.label }}
            </a-option>
          </a-select>
        </a-form-item>

        <a-form-item
          v-if="formData.productType === SplitRuleProductType.CATEGORY"
          field="categoryIds"
          label="选择商品分类"
          :rules="[{ required: true, message: '请选择商品分类' }]"
        >
          <a-select
            v-model="formData.categoryIds"
            placeholder="请选择商品分类（可多选）"
            multiple
            :max-tag-count="5"
            allow-search
          >
            <a-option v-for="item in categoryOptions" :key="item.value" :value="item.value">
              {{ item.label }}
            </a-option>
          </a-select>
        </a-form-item>

        <a-form-item
          v-if="formData.productType === SplitRuleProductType.SPU"
          field="spuIds"
          label="选择SPU"
          :rules="[{ required: true, message: '请选择SPU' }]"
        >
          <a-select
            v-model="formData.spuIds"
            placeholder="请选择SPU（可多选）"
            multiple
            :max-tag-count="5"
            allow-search
          >
            <a-option v-for="item in spuOptions" :key="item.value" :value="item.value">
              {{ item.label }}
            </a-option>
          </a-select>
        </a-form-item>

        <a-form-item
          v-if="formData.productType === SplitRuleProductType.SKU"
          field="skuIds"
          label="选择SKU"
          :rules="[{ required: true, message: '请选择SKU' }]"
        >
          <a-select
            v-model="formData.skuIds"
            placeholder="请选择SKU（可多选）"
            multiple
            :max-tag-count="5"
            allow-search
          >
            <a-option v-for="item in skuOptions" :key="item.value" :value="item.value">
              {{ item.label }}
            </a-option>
          </a-select>
        </a-form-item>
      </template>

      <template v-if="formData.ruleCategory === SplitRuleCategory.MERCHANT">
        <a-form-item field="merchantType" label="商户范围" :rules="[{ required: true, message: '请选择商户范围' }]">
          <a-select v-model="formData.merchantType" placeholder="请选择商户范围" @change="handleMerchantTypeChange">
            <a-option v-for="item in SPLIT_RULE_MERCHANT_TYPE_OPTIONS" :key="item.value" :value="item.value">
              {{ item.label }}
            </a-option>
          </a-select>
        </a-form-item>

        <a-form-item
          v-if="formData.merchantType === SplitRuleMerchantType.TYPE"
          field="merchantTypeIds"
          label="选择商户类型"
          :rules="[{ required: true, message: '请选择商户类型' }]"
        >
          <a-select
            v-model="formData.merchantTypeIds"
            placeholder="请选择商户类型（可多选）"
            multiple
            :max-tag-count="5"
          >
            <a-option v-for="item in merchantTypeOptions" :key="item.value" :value="item.value">
              {{ item.label }}
            </a-option>
          </a-select>
        </a-form-item>

        <template v-if="formData.merchantType === SplitRuleMerchantType.SPECIFIC">
          <a-form-item label="筛选商户类型">
            <a-select
              v-model="merchantFilterType"
              placeholder="请选择商户类型筛选"
              allow-clear
              @change="handleMerchantFilterChange"
            >
              <a-option value="all">全部</a-option>
              <a-option v-for="item in merchantTypeOptions" :key="item.value" :value="item.value">
                {{ item.label }}
              </a-option>
            </a-select>
          </a-form-item>

          <a-form-item
            field="merchantIds"
            label="选择商户"
            :rules="[{ required: true, message: '请选择商户' }]"
          >
            <a-select
              v-model="formData.merchantIds"
              placeholder="请选择商户（可多选）"
              multiple
              :max-tag-count="5"
              allow-search
            >
              <a-option v-for="item in filteredMerchantOptions" :key="item.value" :value="item.value">
                <div class="merchant-option">
                  <span>{{ item.label }}</span>
                  <a-tag size="small" :color="getMerchantTypeTagColor(item.type)">{{ getMerchantTypeLabel(item.type) }}</a-tag>
                </div>
              </a-option>
            </a-select>
          </a-form-item>
        </template>
      </template>

      <template v-if="formData.ruleCategory === SplitRuleCategory.MERCHANT_PRODUCT">
        <a-form-item field="merchantType" label="商户范围" :rules="[{ required: true, message: '请选择商户范围' }]">
          <a-select v-model="formData.merchantType" placeholder="请选择商户范围" @change="handleMerchantTypeChange">
            <a-option v-for="item in SPLIT_RULE_MERCHANT_TYPE_OPTIONS" :key="item.value" :value="item.value">
              {{ item.label }}
            </a-option>
          </a-select>
        </a-form-item>

        <a-form-item
          v-if="formData.merchantType === SplitRuleMerchantType.TYPE"
          field="merchantTypeIds"
          label="选择商户类型"
          :rules="[{ required: true, message: '请选择商户类型' }]"
        >
          <a-select
            v-model="formData.merchantTypeIds"
            placeholder="请选择商户类型（可多选）"
            multiple
            :max-tag-count="5"
          >
            <a-option v-for="item in merchantTypeOptions" :key="item.value" :value="item.value">
              {{ item.label }}
            </a-option>
          </a-select>
        </a-form-item>

        <template v-if="formData.merchantType === SplitRuleMerchantType.SPECIFIC">
          <a-form-item label="筛选商户类型">
            <a-select
              v-model="merchantFilterType"
              placeholder="请选择商户类型筛选"
              allow-clear
              @change="handleMerchantFilterChange"
            >
              <a-option value="all">全部</a-option>
              <a-option v-for="item in merchantTypeOptions" :key="item.value" :value="item.value">
                {{ item.label }}
              </a-option>
            </a-select>
          </a-form-item>

          <a-form-item
            field="merchantIds"
            label="选择商户"
            :rules="[{ required: true, message: '请选择商户' }]"
          >
            <a-select
              v-model="formData.merchantIds"
              placeholder="请选择商户（可多选）"
              multiple
              :max-tag-count="5"
              allow-search
            >
              <a-option v-for="item in filteredMerchantOptions" :key="item.value" :value="item.value">
                <div class="merchant-option">
                  <span>{{ item.label }}</span>
                  <a-tag size="small" :color="getMerchantTypeTagColor(item.type)">{{ getMerchantTypeLabel(item.type) }}</a-tag>
                </div>
              </a-option>
            </a-select>
          </a-form-item>
        </template>

        <a-divider />

        <a-form-item field="productType" label="商品范围" :rules="[{ required: true, message: '请选择商品范围' }]">
          <a-select v-model="formData.productType" placeholder="请选择商品范围" @change="handleProductTypeChange">
            <a-option v-for="item in SPLIT_RULE_PRODUCT_TYPE_OPTIONS" :key="item.value" :value="item.value">
              {{ item.label }}
            </a-option>
          </a-select>
        </a-form-item>

        <a-form-item
          v-if="formData.productType === SplitRuleProductType.CATEGORY"
          field="categoryIds"
          label="选择商品分类"
          :rules="[{ required: true, message: '请选择商品分类' }]"
        >
          <a-select
            v-model="formData.categoryIds"
            placeholder="请选择商品分类（可多选）"
            multiple
            :max-tag-count="5"
            allow-search
          >
            <a-option v-for="item in categoryOptions" :key="item.value" :value="item.value">
              {{ item.label }}
            </a-option>
          </a-select>
        </a-form-item>

        <a-form-item
          v-if="formData.productType === SplitRuleProductType.SPU"
          field="spuIds"
          label="选择SPU"
          :rules="[{ required: true, message: '请选择SPU' }]"
        >
          <a-select
            v-model="formData.spuIds"
            placeholder="请选择SPU（可多选）"
            multiple
            :max-tag-count="5"
            allow-search
          >
            <a-option v-for="item in spuOptions" :key="item.value" :value="item.value">
              {{ item.label }}
            </a-option>
          </a-select>
        </a-form-item>

        <a-form-item
          v-if="formData.productType === SplitRuleProductType.SKU"
          field="skuIds"
          label="选择SKU"
          :rules="[{ required: true, message: '请选择SKU' }]"
        >
          <a-select
            v-model="formData.skuIds"
            placeholder="请选择SKU（可多选）"
            multiple
            :max-tag-count="5"
            allow-search
          >
            <a-option v-for="item in skuOptions" :key="item.value" :value="item.value">
              {{ item.label }}
            </a-option>
          </a-select>
        </a-form-item>
      </template>

      <a-form-item field="rateValue" label="费率（%）" :rules="[{ required: true, message: '请输入费率' }]">
        <a-input-number
          v-model="formData.rateValue"
          placeholder="请输入百分比，如0.35表示0.35%"
          :min="0"
          :max="100"
          :precision="2"
          style="width: 200px"
        >
          <template #suffix>%</template>
        </a-input-number>
      </a-form-item>

      <a-form-item label="有效期">
        <a-radio-group v-model="effectiveType" @change="handleEffectiveTypeChange">
          <a-radio value="permanent">永久有效</a-radio>
          <a-radio value="range">指定日期区间</a-radio>
        </a-radio-group>
      </a-form-item>

      <template v-if="effectiveType === 'range'">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item field="effectiveStart" label="生效开始时间">
              <a-date-picker
                v-model="formData.effectiveStart"
                show-time
                format="YYYY-MM-DD HH:mm:ss"
                placeholder="选择开始时间"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="effectiveEnd" label="生效结束时间">
              <a-date-picker
                v-model="formData.effectiveEnd"
                show-time
                format="YYYY-MM-DD HH:mm:ss"
                placeholder="选择结束时间"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
        </a-row>
      </template>
    </a-form>

    <template #footer>
      <a-space>
        <a-button @click="handleClose">取消</a-button>
        <a-button type="primary" :loading="submitLoading" @click="handleSubmit">确定</a-button>
      </a-space>
    </template>
  </a-drawer>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { Message } from '@arco-design/web-vue'
import { getSplitConfigDetail, createSplitConfig, updateSplitConfig } from '@gongchengcang/api'
import {
  SplitRuleCategory,
  SplitRuleProductType,
  SplitRuleMerchantType,
  SPLIT_RULE_CATEGORY_OPTIONS,
  SPLIT_RULE_PRODUCT_TYPE_OPTIONS,
  SPLIT_RULE_MERCHANT_TYPE_OPTIONS,
} from '@gongchengcang/types'

const props = defineProps<{
  visible: boolean
  mode: 'add' | 'edit'
  ruleId: string
}>()

const emit = defineEmits<{
  (e: 'update:visible', visible: boolean): void
  (e: 'success'): void
}>()

const formRef = ref()
const submitLoading = ref(false)
const effectiveType = ref<'permanent' | 'range'>('permanent')
const merchantFilterType = ref<string>('all')

const defaultFormData = {
  ruleName: '',
  ruleCategory: SplitRuleCategory.ALL,
  priority: 4,
  rateValue: 0,
  productType: SplitRuleProductType.ALL,
  merchantType: SplitRuleMerchantType.TYPE,
  categoryIds: [] as string[],
  categoryNames: [] as string[],
  spuIds: [] as string[],
  spuNames: [] as string[],
  skuIds: [] as string[],
  skuNames: [] as string[],
  merchantTypeIds: [] as string[],
  merchantTypeNames: [] as string[],
  merchantIds: [] as string[],
  merchantNames: [] as string[],
  isPermanent: 1,
  effectiveStart: '',
  effectiveEnd: '',
}

const formData = ref({ ...defaultFormData })

const currentCategoryInfo = computed(() => {
  return SPLIT_RULE_CATEGORY_OPTIONS.find(item => item.value === formData.value.ruleCategory)
})

const merchantTypeOptions = [
  { value: 'supplier', label: '供应商' },
  { value: 'constructor', label: '施工方' },
  { value: 'warehouse', label: '工程仓' },
]

const merchantOptions = [
  { value: 'M001', label: '华东工程仓', type: 'warehouse' },
  { value: 'M002', label: '华南工程仓', type: 'warehouse' },
  { value: 'M003', label: '华北工程仓', type: 'warehouse' },
  { value: 'M004', label: '西南工程仓', type: 'warehouse' },
  { value: 'M005', label: '西北工程仓', type: 'warehouse' },
  { value: 'M006', label: '宝钢供应商', type: 'supplier' },
  { value: 'M007', label: '海螺水泥供应商', type: 'supplier' },
  { value: 'M008', label: '中建施工方', type: 'constructor' },
  { value: 'M009', label: '中铁施工方', type: 'constructor' },
]

const filteredMerchantOptions = computed(() => {
  if (merchantFilterType.value === 'all') {
    return merchantOptions
  }
  return merchantOptions.filter(item => item.type === merchantFilterType.value)
})

const categoryOptions = [
  { value: 'CAT001', label: '钢材' },
  { value: 'CAT002', label: '水泥' },
  { value: 'CAT003', label: '管材' },
  { value: 'CAT004', label: '砂石' },
  { value: 'CAT005', label: '木材' },
]

const spuOptions = [
  { value: 'SPU001', label: '螺纹钢HRB400' },
  { value: 'SPU002', label: '海螺水泥P.O42.5' },
  { value: 'SPU003', label: 'PVC管材' },
  { value: 'SPU004', label: '中砂' },
  { value: 'SPU005', label: '松木方料' },
]

const skuOptions = [
  { value: 'SKU001', label: '螺纹钢HRB400-12mm' },
  { value: 'SKU002', label: '螺纹钢HRB400-16mm' },
  { value: 'SKU003', label: '螺纹钢HRB400-20mm' },
  { value: 'SKU004', label: '海螺水泥P.O42.5-50kg' },
  { value: 'SKU005', label: 'PVC管材DN110' },
]

watch(
  () => props.visible,
  async (val) => {
    if (val) {
      if (props.mode === 'edit' && props.ruleId) {
        await loadRuleDetail()
      } else {
        formData.value = { ...defaultFormData }
        effectiveType.value = 'permanent'
        merchantFilterType.value = 'all'
      }
    }
  }
)

async function loadRuleDetail() {
  try {
    const res = await getSplitConfigDetail(props.ruleId)
    formData.value = {
      ruleName: res.ruleName,
      ruleCategory: res.ruleCategory,
      priority: res.priority,
      rateValue: res.rateValue,
      productType: res.productType || SplitRuleProductType.ALL,
      merchantType: res.merchantType || SplitRuleMerchantType.TYPE,
      categoryIds: res.categoryIds || [],
      categoryNames: res.categoryNames || [],
      spuIds: res.spuIds || [],
      spuNames: res.spuNames || [],
      skuIds: res.skuIds || [],
      skuNames: res.skuNames || [],
      merchantTypeIds: res.merchantTypeIds || [],
      merchantTypeNames: res.merchantTypeNames || [],
      merchantIds: res.merchantIds || [],
      merchantNames: res.merchantNames || [],
      isPermanent: res.isPermanent,
      effectiveStart: res.effectiveStart || '',
      effectiveEnd: res.effectiveEnd || '',
    }
    effectiveType.value = res.isPermanent === 1 ? 'permanent' : 'range'
    merchantFilterType.value = 'all'
  } catch (error: any) {
    Message.error(error.message || '获取规则详情失败')
  }
}

function handleRuleCategoryChange(value: SplitRuleCategory) {
  const categoryInfo = SPLIT_RULE_CATEGORY_OPTIONS.find(item => item.value === value)
  formData.value.priority = categoryInfo?.priority || 4
  formData.value.productType = SplitRuleProductType.ALL
  formData.value.merchantType = SplitRuleMerchantType.TYPE
  formData.value.categoryIds = []
  formData.value.categoryNames = []
  formData.value.spuIds = []
  formData.value.spuNames = []
  formData.value.skuIds = []
  formData.value.skuNames = []
  formData.value.merchantTypeIds = []
  formData.value.merchantTypeNames = []
  formData.value.merchantIds = []
  formData.value.merchantNames = []
  merchantFilterType.value = 'all'
}

function handleProductTypeChange() {
  formData.value.categoryIds = []
  formData.value.categoryNames = []
  formData.value.spuIds = []
  formData.value.spuNames = []
  formData.value.skuIds = []
  formData.value.skuNames = []
}

function handleMerchantTypeChange() {
  formData.value.merchantTypeIds = []
  formData.value.merchantTypeNames = []
  formData.value.merchantIds = []
  formData.value.merchantNames = []
  merchantFilterType.value = 'all'
}

function handleMerchantFilterChange() {
  formData.value.merchantIds = []
  formData.value.merchantNames = []
}

function handleEffectiveTypeChange(val: string | number | boolean) {
  if (val === 'permanent') {
    formData.value.isPermanent = 1
    formData.value.effectiveStart = ''
    formData.value.effectiveEnd = ''
  } else {
    formData.value.isPermanent = 0
  }
}

function getMerchantTypeLabel(type: string) {
  const option = merchantTypeOptions.find(o => o.value === type)
  return option?.label || type
}

function getMerchantTypeTagColor(type: string) {
  switch (type) {
    case 'supplier':
      return 'green'
    case 'constructor':
      return 'blue'
    case 'warehouse':
      return 'orange'
    default:
      return 'gray'
  }
}

function getNamesByIds(ids: string[], options: { value: string; label: string }[]): string[] {
  return ids.map(id => {
    const opt = options.find(o => o.value === id)
    return opt?.label || id
  })
}

function handleClose() {
  emit('update:visible', false)
}

function validateFormData(): boolean {
  if (formData.value.ruleCategory === SplitRuleCategory.PRODUCT) {
    if (formData.value.productType === SplitRuleProductType.CATEGORY && formData.value.categoryIds.length === 0) {
      Message.error('请选择商品分类')
      return false
    }
    if (formData.value.productType === SplitRuleProductType.SPU && formData.value.spuIds.length === 0) {
      Message.error('请选择SPU')
      return false
    }
    if (formData.value.productType === SplitRuleProductType.SKU && formData.value.skuIds.length === 0) {
      Message.error('请选择SKU')
      return false
    }
  }

  if (formData.value.ruleCategory === SplitRuleCategory.MERCHANT) {
    if (formData.value.merchantType === SplitRuleMerchantType.TYPE && formData.value.merchantTypeIds.length === 0) {
      Message.error('请选择商户类型')
      return false
    }
    if (formData.value.merchantType === SplitRuleMerchantType.SPECIFIC && formData.value.merchantIds.length === 0) {
      Message.error('请选择商户')
      return false
    }
  }

  if (formData.value.ruleCategory === SplitRuleCategory.MERCHANT_PRODUCT) {
    if (formData.value.merchantType === SplitRuleMerchantType.TYPE && formData.value.merchantTypeIds.length === 0) {
      Message.error('请选择商户类型')
      return false
    }
    if (formData.value.merchantType === SplitRuleMerchantType.SPECIFIC && formData.value.merchantIds.length === 0) {
      Message.error('请选择商户')
      return false
    }
    if (formData.value.productType === SplitRuleProductType.CATEGORY && formData.value.categoryIds.length === 0) {
      Message.error('请选择商品分类')
      return false
    }
    if (formData.value.productType === SplitRuleProductType.SPU && formData.value.spuIds.length === 0) {
      Message.error('请选择SPU')
      return false
    }
    if (formData.value.productType === SplitRuleProductType.SKU && formData.value.skuIds.length === 0) {
      Message.error('请选择SKU')
      return false
    }
  }

  return true
}

async function handleSubmit() {
  try {
    await formRef.value?.validate()
  } catch {
    return
  }

  if (!validateFormData()) {
    return
  }

  submitLoading.value = true
  try {
    const data = {
      ruleName: formData.value.ruleName,
      ruleCategory: formData.value.ruleCategory,
      priority: formData.value.priority,
      rateValue: formData.value.rateValue,
      productType: formData.value.productType,
      merchantType: formData.value.merchantType,
      categoryIds: formData.value.categoryIds,
      categoryNames: getNamesByIds(formData.value.categoryIds, categoryOptions),
      spuIds: formData.value.spuIds,
      spuNames: getNamesByIds(formData.value.spuIds, spuOptions),
      skuIds: formData.value.skuIds,
      skuNames: getNamesByIds(formData.value.skuIds, skuOptions),
      merchantTypeIds: formData.value.merchantTypeIds,
      merchantTypeNames: getNamesByIds(formData.value.merchantTypeIds, merchantTypeOptions),
      merchantIds: formData.value.merchantIds,
      merchantNames: getNamesByIds(formData.value.merchantIds, merchantOptions),
      isPermanent: effectiveType.value === 'permanent' ? 1 : 0,
      effectiveStart: formData.value.effectiveStart || undefined,
      effectiveEnd: effectiveType.value === 'permanent' ? '2999-12-31 23:59:59' : formData.value.effectiveEnd || undefined,
    }

    if (props.mode === 'edit') {
      await updateSplitConfig(props.ruleId, data)
      Message.success('修改成功')
    } else {
      await createSplitConfig(data)
      Message.success('添加成功')
    }
    emit('success')
    handleClose()
  } catch (error: any) {
    Message.error(error.message || '操作失败')
  } finally {
    submitLoading.value = false
  }
}
</script>

<style scoped lang="less">
.rule-category-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;

  .label {
    font-weight: 500;
  }

  .desc {
    color: var(--text-color-secondary);
    font-size: 12px;
  }
}

.priority-tip {
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 8px;

  .desc {
    color: var(--text-color-secondary);
    font-size: 12px;
  }
}

.merchant-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}
</style>
