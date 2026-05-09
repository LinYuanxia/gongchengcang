<template>
  <div class="mp-page invoice-title">
    <div class="page-header">
      <div class="header-back" @click="$emit('navigate', 'invoice-manage')">
        <icon-left />
      </div>
      <div class="header-title">发票抬头</div>
      <div class="header-action primary" @click="handleAdd">
        <icon-plus />
      </div>
    </div>
    
    <div class="title-list">
      <div class="title-item" v-for="item in titleList" :key="item.id">
        <div class="title-header">
          <div class="title-name">{{ item.titleName }}</div>
          <div class="title-default" v-if="item.isDefault">默认</div>
        </div>
        <div class="title-info">
          <div class="info-row">
            <span class="label">税号</span>
            <span class="value">{{ item.taxNo }}</span>
          </div>
          <div class="info-row" v-if="item.type === 'special'">
            <span class="label">开户银行</span>
            <span class="value">{{ item.bankName }}</span>
          </div>
          <div class="info-row" v-if="item.type === 'special'">
            <span class="label">银行账号</span>
            <span class="value">{{ item.bankAccount }}</span>
          </div>
          <div class="info-row" v-if="item.type === 'special'">
            <span class="label">公司地址</span>
            <span class="value">{{ item.address }}</span>
          </div>
          <div class="info-row" v-if="item.type === 'special'">
            <span class="label">公司电话</span>
            <span class="value">{{ item.phone }}</span>
          </div>
          <div class="info-row">
            <span class="label">发票类型</span>
            <span class="value">{{ item.type === 'normal' ? '增值税普通发票' : '增值税专用发票' }}</span>
          </div>
        </div>
        <div class="title-actions">
          <span class="action-btn" @click="handleSetDefault(item)" v-if="!item.isDefault">
            设为默认
          </span>
          <span class="action-btn" @click="handleEdit(item)">
            编辑
          </span>
          <span class="action-btn danger" @click="handleDelete(item)">
            删除
          </span>
        </div>
      </div>
      
      <div class="empty-state" v-if="titleList.length === 0">
        <icon-file class="empty-icon" />
        <div class="empty-text">暂无发票抬头</div>
        <div class="empty-btn" @click="handleAdd">添加发票抬头</div>
      </div>
    </div>

    <div class="add-modal" v-if="showAddModal" @click="showAddModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <div class="modal-title">{{ isEdit ? '编辑发票抬头' : '添加发票抬头' }}</div>
          <div class="modal-close" @click="showAddModal = false">
            <icon-close />
          </div>
        </div>
        <div class="modal-body">
          <div class="form-item">
            <div class="form-label">发票抬头 *</div>
            <input type="text" class="form-input" v-model="formData.titleName" placeholder="请输入发票抬头" />
          </div>
          <div class="form-item">
            <div class="form-label">税号 *</div>
            <input type="text" class="form-input" v-model="formData.taxNo" placeholder="请输入纳税人识别号" />
          </div>
          <div class="form-item">
            <div class="form-label">发票类型 *</div>
            <div class="radio-group">
              <div class="radio-item" :class="{ active: formData.type === 'normal' }" @click="formData.type = 'normal'">
                普票
              </div>
              <div class="radio-item" :class="{ active: formData.type === 'special' }" @click="formData.type = 'special'">
                专票
              </div>
            </div>
          </div>
          
          <template v-if="formData.type === 'special'">
            <div class="form-item">
              <div class="form-label">开户银行 *</div>
              <input type="text" class="form-input" v-model="formData.bankName" placeholder="请输入开户银行" />
            </div>
            <div class="form-item">
              <div class="form-label">银行账号 *</div>
              <input type="text" class="form-input" v-model="formData.bankAccount" placeholder="请输入银行账号" />
            </div>
            <div class="form-item">
              <div class="form-label">公司地址 *</div>
              <input type="text" class="form-input" v-model="formData.address" placeholder="请输入公司地址" />
            </div>
            <div class="form-item">
              <div class="form-label">公司电话 *</div>
              <input type="text" class="form-input" v-model="formData.phone" placeholder="请输入公司电话" />
            </div>
          </template>
          
          <div class="form-item">
            <div class="form-label">设为默认</div>
            <div class="switch" :class="{ active: formData.isDefault }" @click="formData.isDefault = !formData.isDefault">
              <div class="switch-dot"></div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <div class="cancel-btn" @click="showAddModal = false">取消</div>
          <div class="confirm-btn" @click="handleSubmit">确定</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits(['navigate'])

const showAddModal = ref(false)
const isEdit = ref(false)
const editId = ref<number | null>(null)

const titleList = ref([
  {
    id: 1,
    titleName: '深圳市建筑工程有限公司',
    taxNo: '91440300MA5F****',
    type: 'special',
    bankName: '中国工商银行深圳分行',
    bankAccount: '4000 0123 4567 8901',
    address: '深圳市南山区科技园路100号',
    phone: '0755-88888888',
    isDefault: true
  },
  {
    id: 2,
    titleName: '深圳市建筑工程有限公司',
    taxNo: '91440300MA5F****',
    type: 'normal',
    bankName: '',
    bankAccount: '',
    address: '',
    phone: '',
    isDefault: false
  }
])

const formData = ref({
  titleName: '',
  taxNo: '',
  type: 'normal',
  bankName: '',
  bankAccount: '',
  address: '',
  phone: '',
  isDefault: false
})

function resetForm() {
  formData.value = {
    titleName: '',
    taxNo: '',
    type: 'normal',
    bankName: '',
    bankAccount: '',
    address: '',
    phone: '',
    isDefault: false
  }
}

function handleAdd() {
  resetForm()
  isEdit.value = false
  editId.value = null
  showAddModal.value = true
}

function handleEdit(item: any) {
  isEdit.value = true
  editId.value = item.id
  formData.value = { ...item }
  showAddModal.value = true
}

function handleDelete(item: any) {
  const index = titleList.value.findIndex(t => t.id === item.id)
  if (index > -1) {
    titleList.value.splice(index, 1)
  }
}

function handleSetDefault(item: any) {
  titleList.value.forEach(t => {
    t.isDefault = t.id === item.id
  })
}

function handleSubmit() {
  if (isEdit.value && editId.value) {
    const index = titleList.value.findIndex(t => t.id === editId.value)
    if (index > -1) {
      titleList.value[index] = { ...formData.value, id: editId.value }
    }
  } else {
    const newId = Math.max(...titleList.value.map(t => t.id)) + 1
    titleList.value.push({
      ...formData.value,
      id: newId
    })
  }
  
  if (formData.value.isDefault) {
    titleList.value.forEach(t => {
      if (isEdit.value && editId.value) {
        t.isDefault = t.id === editId.value
      } else {
        t.isDefault = t.id === Math.max(...titleList.value.map(item => item.id))
      }
    })
  }
  
  showAddModal.value = false
}
</script>

<style lang="scss" scoped>
.invoice-title {
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
    
    &.primary {
      background: #165dff;
      color: #fff;
      border-radius: 50%;
    }
  }
}

.title-list {
  padding: 56px 12px 12px;
}

.title-item {
  background: #fff;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
  
  .title-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    
    .title-name {
      font-size: 15px;
      font-weight: 500;
      color: #1d2129;
    }
    
    .title-default {
      font-size: 12px;
      padding: 2px 8px;
      border-radius: 4px;
      background: #e8ffea;
      color: #00b42a;
    }
  }
  
  .title-info {
    .info-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      
      .label {
        font-size: 13px;
        color: #86909c;
      }
      
      .value {
        font-size: 13px;
        color: #1d2129;
      }
    }
  }
  
  .title-actions {
    display: flex;
    justify-content: flex-end;
    gap: 16px;
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid #f2f3f5;
    
    .action-btn {
      font-size: 13px;
      color: #165dff;
      
      &.danger {
        color: #f53f3f;
      }
    }
  }
}

.empty-state {
  text-align: center;
  padding: 80px 0;
  
  .empty-icon {
    font-size: 48px;
    color: #c9cdd4;
  }
  
  .empty-text {
    margin-top: 12px;
    font-size: 14px;
    color: #86909c;
  }
  
  .empty-btn {
    margin-top: 16px;
    display: inline-block;
    padding: 8px 24px;
    background: #165dff;
    color: #fff;
    border-radius: 20px;
    font-size: 14px;
  }
}

.add-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: flex-end;
  z-index: 1000;
  
  .modal-content {
    width: 100%;
    background: #fff;
    border-radius: 12px 12px 0 0;
    max-height: 80vh;
    overflow-y: auto;
    
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
      
      .modal-close {
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #86909c;
      }
    }
    
    .modal-body {
      padding: 16px;
      
      .form-item {
        margin-bottom: 16px;
        
        .form-label {
          font-size: 14px;
          color: #1d2129;
          margin-bottom: 8px;
        }
        
        .form-input {
          width: 100%;
          height: 40px;
          border: 1px solid #e5e6eb;
          border-radius: 4px;
          padding: 0 12px;
          font-size: 14px;
          
          &::placeholder {
            color: #c9cdd4;
          }
        }
        
        .radio-group {
          display: flex;
          gap: 12px;
          
          .radio-item {
            flex: 1;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px solid #e5e6eb;
            border-radius: 4px;
            font-size: 14px;
            color: #4e5969;
            
            &.active {
              background: #e8f3ff;
              border-color: #165dff;
              color: #165dff;
            }
          }
        }
        
        .switch {
          width: 44px;
          height: 24px;
          background: #c9cdd4;
          border-radius: 12px;
          position: relative;
          
          .switch-dot {
            position: absolute;
            top: 2px;
            left: 2px;
            width: 20px;
            height: 20px;
            background: #fff;
            border-radius: 50%;
            transition: all 0.2s;
          }
          
          &.active {
            background: #165dff;
            
            .switch-dot {
              left: 22px;
            }
          }
        }
      }
    }
    
    .modal-footer {
      display: flex;
      gap: 12px;
      padding: 16px;
      border-top: 1px solid #f2f3f5;
      
      .cancel-btn, .confirm-btn {
        flex: 1;
        height: 44px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        font-size: 15px;
      }
      
      .cancel-btn {
        background: #f2f3f5;
        color: #4e5969;
      }
      
      .confirm-btn {
        background: #165dff;
        color: #fff;
      }
    }
  }
}
</style>