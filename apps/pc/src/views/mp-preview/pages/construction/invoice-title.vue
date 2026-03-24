<template>
  <div class="mp-page invoice-title-manage">
    <div class="page-header">
      <div class="header-back" @click="$emit('navigate', 'mine')">
        <icon-left />
      </div>
      <div class="header-title">发票抬头</div>
      <div class="header-action" @click="handleAdd">
        <icon-plus />
      </div>
    </div>
    
    <div class="title-list">
      <div class="title-item" v-for="item in titleList" :key="item.id">
        <div class="title-content" @click="handleSelect(item)">
          <div class="title-header">
            <span class="name">{{ item.name }}</span>
            <span class="default-tag" v-if="item.isDefault">默认</span>
          </div>
          <div class="title-info">
            <div class="info-row">
              <span class="label">纳税人识别号</span>
              <span class="value">{{ item.taxNo }}</span>
            </div>
            <div class="info-row" v-if="item.bank">
              <span class="label">开户行</span>
              <span class="value">{{ item.bank }}</span>
            </div>
            <div class="info-row" v-if="item.bankAccount">
              <span class="label">银行账号</span>
              <span class="value">{{ item.bankAccount }}</span>
            </div>
            <div class="info-row" v-if="item.address">
              <span class="label">地址电话</span>
              <span class="value">{{ item.address }}</span>
            </div>
          </div>
        </div>
        <div class="title-actions">
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
    
    <div class="empty-state" v-if="titleList.length === 0">
      <icon-file class="empty-icon" />
      <div class="empty-text">暂无发票抬头</div>
      <div class="empty-btn" @click="handleAdd">添加抬头</div>
    </div>
    
    <div class="modal-overlay" v-if="showModal" @click="showModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <div class="modal-title">{{ isEdit ? '编辑抬头' : '新增抬头' }}</div>
          <icon-close @click="showModal = false" />
        </div>
        <div class="modal-body">
          <div class="form-item">
            <div class="form-label">抬头名称</div>
            <input type="text" class="form-input" v-model="formData.name" placeholder="请输入抬头名称" />
          </div>
          <div class="form-item">
            <div class="form-label">纳税人识别号</div>
            <input type="text" class="form-input" v-model="formData.taxNo" placeholder="请输入纳税人识别号" />
          </div>
          <div class="form-item">
            <div class="form-label">开户行（选填）</div>
            <input type="text" class="form-input" v-model="formData.bank" placeholder="请输入开户行" />
          </div>
          <div class="form-item">
            <div class="form-label">银行账号（选填）</div>
            <input type="text" class="form-input" v-model="formData.bankAccount" placeholder="请输入银行账号" />
          </div>
          <div class="form-item">
            <div class="form-label">地址电话（选填）</div>
            <input type="text" class="form-input" v-model="formData.address" placeholder="请输入地址电话" />
          </div>
          <div class="form-item">
            <div class="form-checkbox" @click="formData.isDefault = !formData.isDefault">
              <icon-check-circle-fill v-if="formData.isDefault" class="checked" />
              <icon-check-circle v-else />
              <span>设为默认抬头</span>
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
const isEdit = ref(false)

const formData = ref({
  id: 0,
  name: '',
  taxNo: '',
  bank: '',
  bankAccount: '',
  address: '',
  isDefault: false
})

const titleList = ref([
  {
    id: 1,
    name: '深圳市建筑工程有限公司',
    taxNo: '91440300MA5EXXXXXX',
    bank: '中国建设银行深圳分行',
    bankAccount: '4420 1580 0000 5250 XXXX',
    address: '深圳市福田区深南大道1000号 0755-88888888',
    isDefault: true
  },
  {
    id: 2,
    name: '广州装饰设计工程有限公司',
    taxNo: '91440101MA5XXXXXXX',
    bank: '中国工商银行广州分行',
    bankAccount: '3602 0000 0000 0000 XXXX',
    address: '广州市天河区天河路100号 020-88888888',
    isDefault: false
  }
])

function handleAdd() {
  isEdit.value = false
  formData.value = {
    id: 0,
    name: '',
    taxNo: '',
    bank: '',
    bankAccount: '',
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
  console.log('选择抬头:', item)
}

function handleDefault(item: any) {
  titleList.value.forEach(title => {
    title.isDefault = title.id === item.id
  })
}

function handleDelete(item: any) {
  console.log('删除抬头:', item.id)
}

function handleSave() {
  console.log('保存抬头:', formData.value)
  showModal.value = false
}
</script>

<style lang="scss" scoped>
.invoice-title-manage {
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

.title-list {
  padding: 54px 12px 12px;
}

.title-item {
  background: #fff;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
  
  .title-content {
    padding-bottom: 12px;
    border-bottom: 1px solid #f2f3f5;
  }
  
  .title-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 10px;
    
    .name {
      font-size: 15px;
      font-weight: 500;
      color: #1d2129;
    }
    
    .default-tag {
      font-size: 11px;
      padding: 2px 6px;
      background: #e8f3ff;
      color: #165dff;
      border-radius: 2px;
    }
  }
  
  .title-info {
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 4px 0;
      
      .label {
        font-size: 12px;
        color: #86909c;
      }
      
      .value {
        font-size: 12px;
        color: #1d2129;
      }
    }
  }
  
  .title-actions {
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
