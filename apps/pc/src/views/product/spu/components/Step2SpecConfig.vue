<template>
  <div class="spec-config">
    <div class="spec-header">
      <span class="title">选择规格属性</span>
      <a-button type="primary" size="small" @click="showAttrSelector = true">
        <template #icon><icon-plus /></template>
        添加属性
      </a-button>
    </div>

    <div v-if="formData.selectedAttrs.length === 0" class="empty-tip">
      <a-empty description="请添加规格属性" />
    </div>

    <div v-else class="attr-list">
      <div v-for="(attr, index) in formData.selectedAttrs" :key="attr.attrId" class="attr-item">
        <div class="attr-header">
          <span class="attr-name">{{ attr.attrName }}</span>
          <a-button type="text" size="small" status="danger" @click="removeAttr(index)">
            <icon-delete />
          </a-button>
        </div>
        <div class="attr-values">
          <a-tag
            v-for="(value, vIndex) in attr.values"
            :key="vIndex"
            closable
            @close="removeValue(index, vIndex)"
          >
            {{ value }}
          </a-tag>
          <a-input
            v-model="newValues[index]"
            placeholder="输入后回车添加"
            style="width: 120px"
            size="small"
            @press-enter="addValue(index)"
          />
        </div>
      </div>
    </div>

    <a-modal v-model:visible="showAttrSelector" title="选择规格属性" :width="600" @ok="confirmSelectAttrs">
      <div class="attr-selector">
        <a-input-search v-model="attrSearchKeyword" placeholder="搜索属性名称" style="margin-bottom: 16px" />
        <a-checkbox-group v-model="selectedAttrIds">
          <div v-for="attr in filteredAttrList" :key="attr.attrId" class="attr-option">
            <a-checkbox :value="attr.attrId">
              <span class="attr-label">{{ attr.attrName }}</span>
              <a-tag size="small" style="margin-left: 8px">{{ getAttrTypeLabel(attr.attrType) }}</a-tag>
            </a-checkbox>
            <div v-if="attr.optionValues?.length" class="attr-preview">
              可选值：{{ attr.optionValues.join('、') }}
            </div>
          </div>
        </a-checkbox-group>
      </div>
    </a-modal>

    <div v-if="formData.selectedAttrs.length > 0" class="preview-section">
      <a-divider orientation="left">SKU预览</a-divider>
      <div class="sku-preview">
        <span class="preview-label">将生成 <strong>{{ skuCount }}</strong> 个SKU组合</span>
        <a-button type="text" size="small" @click="showPreview = !showPreview">
          {{ showPreview ? '收起预览' : '展开预览' }}
        </a-button>
      </div>
      <div v-if="showPreview" class="preview-list">
        <a-tag v-for="(combo, index) in previewCombinations" :key="index" style="margin: 4px">
          {{ combo }}
        </a-tag>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { AttrType, ATTR_TYPE_OPTIONS } from '@gongchengcang/types'
import type { ProductAttr } from '@gongchengcang/types'

const props = defineProps<{
  formData: {
    selectedAttrs: { attrId: string; attrName: string; values: string[] }[]
    skuList: { skuCode: string; skuName: string; specs: Record<string, string> }[]
  }
  attrList: ProductAttr[]
}>()

const showAttrSelector = ref(false)
const selectedAttrIds = ref<string[]>([])
const attrSearchKeyword = ref('')
const newValues = ref<Record<number, string>>({})
const showPreview = ref(false)

const filteredAttrList = computed(() => {
  if (!attrSearchKeyword.value) {
    return props.attrList.filter(a => a.status === 1)
  }
  return props.attrList.filter(
    a => a.status === 1 && a.attrName.toLowerCase().includes(attrSearchKeyword.value.toLowerCase())
  )
})

const skuCount = computed(() => {
  if (props.formData.selectedAttrs.length === 0) return 0
  return props.formData.selectedAttrs.reduce((count, attr) => {
    return count * (attr.values.length || 1)
  }, 1)
})

const previewCombinations = computed(() => {
  if (props.formData.selectedAttrs.length === 0) return []
  
  const combinations: string[] = []
  
  function generate(attrs: typeof props.formData.selectedAttrs, current: string[], index: number) {
    if (index === attrs.length) {
      combinations.push(current.join(' '))
      return
    }
    const attr = attrs[index]
    if (attr.values.length === 0) {
      generate(attrs, current, index + 1)
    } else {
      for (const value of attr.values) {
        generate(attrs, [...current, `${attr.attrName}:${value}`], index + 1)
      }
    }
  }
  
  generate(props.formData.selectedAttrs, [], 0)
  return combinations.slice(0, 20)
})

function getAttrTypeLabel(type: AttrType) {
  const option = ATTR_TYPE_OPTIONS.find(o => o.value === type)
  return option?.label || type
}

function confirmSelectAttrs() {
  const existingIds = props.formData.selectedAttrs.map(a => a.attrId)
  
  for (const attrId of selectedAttrIds.value) {
    if (!existingIds.includes(attrId)) {
      const attr = props.attrList.find(a => a.attrId === attrId)
      if (attr) {
        props.formData.selectedAttrs.push({
          attrId: attr.attrId,
          attrName: attr.attrName,
          values: attr.attrType !== AttrType.INPUT ? [...attr.optionValues] : [],
        })
      }
    }
  }
  
  props.formData.selectedAttrs = props.formData.selectedAttrs.filter(a =>
    selectedAttrIds.value.includes(a.attrId)
  )
  
  selectedAttrIds.value = []
  showAttrSelector.value = false
  generateSkuList()
}

function removeAttr(index: number) {
  props.formData.selectedAttrs.splice(index, 1)
  generateSkuList()
}

function addValue(index: number) {
  const value = newValues.value[index]?.trim()
  if (value && !props.formData.selectedAttrs[index].values.includes(value)) {
    props.formData.selectedAttrs[index].values.push(value)
    newValues.value[index] = ''
    generateSkuList()
  }
}

function removeValue(attrIndex: number, valueIndex: number) {
  props.formData.selectedAttrs[attrIndex].values.splice(valueIndex, 1)
  generateSkuList()
}

function generateSkuList() {
  if (props.formData.selectedAttrs.length === 0) {
    props.formData.skuList = []
    return
  }

  const specsList: Record<string, string>[] = []
  
  function generate(attrs: typeof props.formData.selectedAttrs, current: Record<string, string>, index: number) {
    if (index === attrs.length) {
      specsList.push({ ...current })
      return
    }
    const attr = attrs[index]
    if (attr.values.length === 0) {
      generate(attrs, current, index + 1)
    } else {
      for (const value of attr.values) {
        generate(attrs, { ...current, [attr.attrName]: value }, index + 1)
      }
    }
  }
  
  generate(props.formData.selectedAttrs, {}, 0)
  
  props.formData.skuList = specsList.map((specs, index) => ({
    skuCode: `SKU-${String(index + 1).padStart(4, '0')}`,
    skuName: Object.values(specs).join(' '),
    specs,
  }))
}

defineExpose({
  validate: async () => {
    if (props.formData.selectedAttrs.length === 0) {
      return false
    }
    const hasValues = props.formData.selectedAttrs.every(a => a.values.length > 0)
    return hasValues
  },
})
</script>

<style scoped lang="less">
.spec-config {
  .spec-header {
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

  .attr-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .attr-item {
    border: 1px solid var(--color-border);
    border-radius: 8px;
    padding: 12px;

    .attr-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;

      .attr-name {
        font-weight: 500;
        color: var(--color-text-1);
      }
    }

    .attr-values {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: center;
    }
  }

  .attr-selector {
    max-height: 400px;
    overflow-y: auto;

    .attr-option {
      padding: 8px 0;
      border-bottom: 1px solid var(--color-border-2);

      &:last-child {
        border-bottom: none;
      }

      .attr-label {
        font-weight: 500;
      }

      .attr-preview {
        margin-top: 4px;
        margin-left: 24px;
        font-size: 12px;
        color: var(--color-text-3);
      }
    }
  }

  .preview-section {
    margin-top: 24px;

    .sku-preview {
      display: flex;
      align-items: center;
      gap: 16px;

      .preview-label {
        color: var(--color-text-2);
      }
    }

    .preview-list {
      margin-top: 12px;
      max-height: 200px;
      overflow-y: auto;
      padding: 12px;
      background: var(--color-fill-1);
      border-radius: 4px;
    }
  }
}
</style>
