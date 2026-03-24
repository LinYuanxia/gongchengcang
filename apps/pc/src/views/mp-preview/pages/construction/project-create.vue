<template>
  <div class="mp-page project-create">
    <div class="page-header">
      <div class="header-back" @click="$emit('navigate', 'project-list')">
        <icon-left />
      </div>
      <div class="header-title">新建项目</div>
      <div class="header-placeholder"></div>
    </div>
    
    <div class="form-container">
      <div class="form-section">
        <div class="section-title">基本信息</div>
        
        <div class="form-item">
          <div class="form-label required">门店名称</div>
          <input type="text" class="form-input" v-model="formData.storeName" placeholder="请输入门店名称" />
        </div>
        
        <div class="form-item">
          <div class="form-label required">品牌</div>
          <div class="form-picker" @click="showBrandPicker = true">
            <span v-if="formData.brand">{{ formData.brand }}</span>
            <span class="placeholder" v-else>请选择品牌</span>
            <icon-right class="picker-arrow" />
          </div>
        </div>
        
        <div class="form-item">
          <div class="form-label required">所在地区</div>
          <div class="form-picker" @click="showRegionPicker = true">
            <span v-if="formData.province">{{ formData.province }} {{ formData.city }} {{ formData.district }}</span>
            <span class="placeholder" v-else>请选择省市区</span>
            <icon-right class="picker-arrow" />
          </div>
        </div>
        
        <div class="form-item">
          <div class="form-label required">详细地址</div>
          <textarea class="form-textarea" v-model="formData.address" placeholder="请输入详细地址"></textarea>
        </div>
      </div>
      
      <div class="form-section">
        <div class="section-title">项目周期</div>
        
        <div class="form-item">
          <div class="form-label required">开工日期</div>
          <div class="form-picker" @click="showStartDatePicker = true">
            <span v-if="formData.startDate">{{ formData.startDate }}</span>
            <span class="placeholder" v-else>请选择开工日期</span>
            <icon-right class="picker-arrow" />
          </div>
        </div>
        
        <div class="form-item">
          <div class="form-label">竣工日期</div>
          <div class="form-picker" @click="showEndDatePicker = true">
            <span v-if="formData.endDate">{{ formData.endDate }}</span>
            <span class="placeholder" v-else>请选择竣工日期</span>
            <icon-right class="picker-arrow" />
          </div>
        </div>
      </div>
      
      <div class="form-section">
        <div class="section-title">BOM包（选填）</div>
        
        <div class="form-item">
          <div class="form-label">选择BOM包</div>
          <div class="form-picker" @click="handleSelectBom">
            <span v-if="formData.bomName">{{ formData.bomName }}</span>
            <span class="placeholder" v-else>请选择BOM基装包</span>
            <icon-right class="picker-arrow" />
          </div>
        </div>
        
        <div class="bom-preview" v-if="formData.bomId">
          <div class="bom-info">
            <div class="bom-name">{{ formData.bomName }}</div>
            <div class="bom-meta">
              <span>{{ bomDetail.itemCount }}项材料</span>
              <span class="price">¥{{ bomDetail.totalPrice }}</span>
            </div>
          </div>
          <div class="bom-change" @click="handleSelectBom">更换</div>
        </div>
      </div>
    </div>
    
    <div class="bottom-actions">
      <div class="btn-submit" @click="handleSubmit">提交</div>
    </div>
    
    <div class="modal-overlay" v-if="showBomModal" @click="showBomModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <div class="modal-title">选择BOM包</div>
          <icon-close @click="showBomModal = false" />
        </div>
        <div class="modal-body">
          <div class="search-bar">
            <div class="search-input">
              <icon-search class="search-icon" />
              <input type="text" placeholder="搜索BOM包" v-model="bomSearchText" />
            </div>
          </div>
          <div class="bom-list">
            <div 
              class="bom-item" 
              :class="{ selected: formData.bomId === item.id }"
              v-for="item in filteredBomList" 
              :key="item.id"
              @click="handleBomSelect(item)"
            >
              <div class="bom-item-name">{{ item.name }}</div>
              <div class="bom-item-desc">{{ item.description }}</div>
              <div class="bom-item-meta">
                <span>{{ item.itemCount }}项材料</span>
                <span class="price">¥{{ item.price }}</span>
              </div>
              <icon-check-circle-fill v-if="formData.bomId === item.id" class="check-icon" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const emit = defineEmits(['navigate'])

const showBrandPicker = ref(false)
const showRegionPicker = ref(false)
const showStartDatePicker = ref(false)
const showEndDatePicker = ref(false)
const showBomModal = ref(false)
const bomSearchText = ref('')

const formData = ref({
  storeName: '',
  brand: '',
  province: '',
  city: '',
  district: '',
  address: '',
  startDate: '',
  endDate: '',
  bomId: 0,
  bomName: ''
})

const bomDetail = ref({
  itemCount: 28,
  totalPrice: '128,000'
})

const bomList = ref([
  { id: 1, name: '星巴克标准基装包V2.0', description: '适用于星巴克门店标准装修', itemCount: 28, price: '128,000' },
  { id: 2, name: '喜茶标准基装包V1.5', description: '适用于喜茶门店标准装修', itemCount: 24, price: '98,000' },
  { id: 3, name: '奈雪标准基装包V2.0', description: '适用于奈雪门店标准装修', itemCount: 32, price: '138,000' },
  { id: 4, name: '瑞幸咖啡标准基装包V1.0', description: '适用于瑞幸门店标准装修', itemCount: 20, price: '68,000' },
  { id: 5, name: '肯德基标准基装包V3.0', description: '适用于肯德基门店标准装修', itemCount: 35, price: '168,000' }
])

const filteredBomList = computed(() => {
  if (!bomSearchText.value) return bomList.value
  return bomList.value.filter(item => 
    item.name.includes(bomSearchText.value) || 
    item.description.includes(bomSearchText.value)
  )
})

function handleSelectBom() {
  showBomModal.value = true
}

function handleBomSelect(item: any) {
  formData.value.bomId = item.id
  formData.value.bomName = item.name
  bomDetail.value.itemCount = item.itemCount
  bomDetail.value.totalPrice = item.price
  showBomModal.value = false
}

function handleSubmit() {
  console.log('提交项目:', formData.value)
  emit('navigate', 'project-list')
}
</script>

<style lang="scss" scoped>
.project-create {
  background: #f5f5f5;
  min-height: 100%;
  padding-bottom: 70px;
}

.page-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 44px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  z-index: 100;
  
  .header-back {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #4e5969;
  }
  
  .header-title {
    font-size: 16px;
    font-weight: 500;
  }
  
  .header-placeholder {
    width: 32px;
  }
}

.form-container {
  padding: 54px 12px 12px;
}

.form-section {
  background: #fff;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
  
  .section-title {
    font-size: 14px;
    font-weight: 500;
    color: #1d2129;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid #f2f3f5;
  }
}

.form-item {
  margin-bottom: 16px;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  .form-label {
    font-size: 13px;
    color: #86909c;
    margin-bottom: 8px;
    
    &.required::before {
      content: '*';
      color: #f53f3f;
      margin-right: 4px;
    }
  }
  
  .form-input {
    width: 100%;
    height: 40px;
    border: 1px solid #e5e6eb;
    border-radius: 4px;
    padding: 0 12px;
    font-size: 14px;
    
    &:focus {
      border-color: #165dff;
      outline: none;
    }
  }
  
  .form-picker {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 40px;
    border: 1px solid #e5e6eb;
    border-radius: 4px;
    padding: 0 12px;
    font-size: 14px;
    color: #1d2129;
    
    .placeholder {
      color: #c9cdd4;
    }
    
    .picker-arrow {
      color: #c9cdd4;
    }
  }
  
  .form-textarea {
    width: 100%;
    height: 80px;
    border: 1px solid #e5e6eb;
    border-radius: 4px;
    padding: 12px;
    font-size: 14px;
    resize: none;
    
    &:focus {
      border-color: #165dff;
      outline: none;
    }
  }
}

.bom-preview {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f7f8fa;
  border-radius: 6px;
  padding: 12px;
  margin-top: 12px;
  
  .bom-info {
    .bom-name {
      font-size: 14px;
      color: #1d2129;
      font-weight: 500;
      margin-bottom: 4px;
    }
    
    .bom-meta {
      font-size: 12px;
      color: #86909c;
      
      .price {
        color: #f53f3f;
        margin-left: 12px;
      }
    }
  }
  
  .bom-change {
    font-size: 13px;
    color: #165dff;
  }
}

.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: #fff;
  display: flex;
  align-items: center;
  padding: 0 16px;
  border-top: 1px solid #e5e6eb;
  
  .btn-submit {
    flex: 1;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #165dff;
    color: #fff;
    border-radius: 4px;
    font-size: 15px;
  }
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  z-index: 200;
}

.modal-content {
  width: 100%;
  background: #fff;
  border-radius: 12px 12px 0 0;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #f2f3f5;
  
  .modal-title {
    font-size: 16px;
    font-weight: 500;
  }
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  
  .search-bar {
    padding: 12px 16px;
  }
  
  .search-input {
    display: flex;
    align-items: center;
    background: #f7f8fa;
    border-radius: 20px;
    padding: 8px 16px;
    
    .search-icon {
      color: #86909c;
      margin-right: 8px;
    }
    
    input {
      flex: 1;
      border: none;
      outline: none;
      font-size: 14px;
      background: transparent;
      
      &::placeholder {
        color: #c9cdd4;
      }
    }
  }
  
  .bom-list {
    padding: 0 16px 16px;
  }
  
  .bom-item {
    padding: 12px;
    border: 1px solid #e5e6eb;
    border-radius: 8px;
    margin-bottom: 12px;
    position: relative;
    
    &.selected {
      border-color: #165dff;
      background: #f2f7ff;
    }
    
    .bom-item-name {
      font-size: 14px;
      color: #1d2129;
      font-weight: 500;
      margin-bottom: 4px;
    }
    
    .bom-item-desc {
      font-size: 12px;
      color: #86909c;
      margin-bottom: 6px;
    }
    
    .bom-item-meta {
      font-size: 12px;
      color: #4e5969;
      
      .price {
        color: #f53f3f;
        margin-left: 12px;
      }
    }
    
    .check-icon {
      position: absolute;
      top: 12px;
      right: 12px;
      color: #165dff;
      font-size: 18px;
    }
  }
}
</style>
