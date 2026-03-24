<template>
  <div class="mp-page address-manage">
    <div class="page-header">
      <div class="header-back" @click="$emit('navigate', 'mine')">
        <icon-left />
      </div>
      <div class="header-title">收货地址</div>
      <div class="header-action" @click="handleAdd">
        <icon-plus />
      </div>
    </div>
    
    <div class="address-list">
      <div class="address-item" v-for="item in addressList" :key="item.id">
        <div class="address-content" @click="handleSelect(item)">
          <div class="address-header">
            <span class="name">{{ item.name }}</span>
            <span class="phone">{{ item.phone }}</span>
            <span class="default-tag" v-if="item.isDefault">默认</span>
          </div>
          <div class="address-detail">
            {{ item.province }}{{ item.city }}{{ item.district }}{{ item.address }}
          </div>
        </div>
        <div class="address-actions">
          <span class="action-btn" @click="handleEdit(item)">
            <icon-edit />
            编辑
          </span>
          <span class="action-btn" @click="handleDefault(item)" v-if="!item.isDefault">
            <icon-check-circle />
            设为默认
          </span>
          <span class="action-btn delete" @click="handleDelete(item)">
            <icon-delete />
            删除
          </span>
        </div>
      </div>
    </div>
    
    <div class="empty-state" v-if="addressList.length === 0">
      <icon-location class="empty-icon" />
      <div class="empty-text">暂无收货地址</div>
      <div class="empty-btn" @click="handleAdd">添加地址</div>
    </div>
    
    <div class="modal-overlay" v-if="showModal" @click="showModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <div class="modal-title">{{ isEdit ? '编辑地址' : '新增地址' }}</div>
          <icon-close @click="showModal = false" />
        </div>
        <div class="modal-body">
          <div class="form-item">
            <div class="form-label">收货人</div>
            <input type="text" class="form-input" v-model="formData.name" placeholder="请输入收货人姓名" />
          </div>
          <div class="form-item">
            <div class="form-label">联系电话</div>
            <input type="tel" class="form-input" v-model="formData.phone" placeholder="请输入联系电话" />
          </div>
          <div class="form-item">
            <div class="form-label">所在地区</div>
            <div class="region-picker" @click="showRegionPicker = true">
              <span v-if="formData.province">{{ formData.province }} {{ formData.city }} {{ formData.district }}</span>
              <span class="placeholder" v-else>请选择省市区</span>
              <icon-right class="picker-arrow" />
            </div>
          </div>
          <div class="form-item">
            <div class="form-label">详细地址</div>
            <textarea class="form-textarea" v-model="formData.address" placeholder="请输入详细地址"></textarea>
          </div>
          <div class="form-item">
            <div class="form-checkbox" @click="formData.isDefault = !formData.isDefault">
              <icon-check-circle-fill v-if="formData.isDefault" class="checked" />
              <icon-check-circle v-else />
              <span>设为默认地址</span>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <div class="btn-cancel" @click="showModal = false">取消</div>
          <div class="btn-confirm" @click="handleSave">保存</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits(['navigate'])

const showModal = ref(false)
const showRegionPicker = ref(false)
const isEdit = ref(false)

const formData = ref({
  id: 0,
  name: '',
  phone: '',
  province: '',
  city: '',
  district: '',
  address: '',
  isDefault: false
})

const addressList = ref([
  {
    id: 1,
    name: '张三',
    phone: '13800138000',
    province: '广东省',
    city: '深圳市',
    district: '罗湖区',
    address: '宝安南路万象城L1层',
    isDefault: true
  },
  {
    id: 2,
    name: '李四',
    phone: '13900139000',
    province: '广东省',
    city: '广州市',
    district: '天河区',
    address: '天河路208号天河城B1层',
    isDefault: false
  }
])

function handleAdd() {
  isEdit.value = false
  formData.value = {
    id: 0,
    name: '',
    phone: '',
    province: '',
    city: '',
    district: '',
    address: '',
    isDefault: false
  }
  showModal.value = true
}

function handleEdit(item: any) {
  isEdit.value = true
  formData.value = { ...item }
  showModal.value = true
}

function handleSelect(item: any) {
  console.log('选择地址:', item)
}

function handleDefault(item: any) {
  addressList.value.forEach(addr => {
    addr.isDefault = addr.id === item.id
  })
}

function handleDelete(item: any) {
  console.log('删除地址:', item.id)
}

function handleSave() {
  console.log('保存地址:', formData.value)
  showModal.value = false
}
</script>

<style lang="scss" scoped>
.address-manage {
  background: #f5f5f5;
  min-height: 100%;
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
  
  .header-action {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #165dff;
  }
}

.address-list {
  padding: 54px 12px 12px;
}

.address-item {
  background: #fff;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
  
  .address-content {
    padding-bottom: 12px;
    border-bottom: 1px solid #f2f3f5;
  }
  
  .address-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    
    .name {
      font-size: 15px;
      font-weight: 500;
      color: #1d2129;
    }
    
    .phone {
      font-size: 14px;
      color: #4e5969;
    }
    
    .default-tag {
      font-size: 11px;
      padding: 2px 6px;
      background: #e8f3ff;
      color: #165dff;
      border-radius: 2px;
    }
  }
  
  .address-detail {
    font-size: 13px;
    color: #86909c;
    line-height: 1.5;
  }
  
  .address-actions {
    display: flex;
    gap: 16px;
    padding-top: 12px;
    
    .action-btn {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      color: #4e5969;
      
      &.delete {
        color: #f53f3f;
      }
    }
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  
  .empty-icon {
    font-size: 64px;
    color: #c9cdd4;
  }
  
  .empty-text {
    font-size: 14px;
    color: #86909c;
    margin: 16px 0;
  }
  
  .empty-btn {
    padding: 10px 32px;
    background: #165dff;
    color: #fff;
    border-radius: 4px;
    font-size: 14px;
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
  overflow-y: auto;
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
  padding: 16px;
  
  .form-item {
    margin-bottom: 16px;
    
    .form-label {
      font-size: 13px;
      color: #86909c;
      margin-bottom: 8px;
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
    
    .region-picker {
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
    
    .form-checkbox {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      color: #4e5969;
      
      .checked {
        color: #165dff;
      }
    }
  }
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 16px;
  border-top: 1px solid #f2f3f5;
  
  .btn-cancel {
    flex: 1;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #e5e6eb;
    border-radius: 4px;
    font-size: 14px;
    color: #4e5969;
  }
  
  .btn-confirm {
    flex: 1;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #165dff;
    border-radius: 4px;
    font-size: 14px;
    color: #fff;
  }
}
</style>
