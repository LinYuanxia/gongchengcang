<template>
  <div class="mp-page site-stock">
    <div class="page-header">
      <div class="header-back" @click="$emit('navigate', 'project-detail')">
        <icon-left />
      </div>
      <div class="header-title">现场库存</div>
      <div class="header-action" @click="showCheckModal = true">
        <icon-sync />
      </div>
    </div>
    
    <div class="project-info">
      <div class="project-name">{{ projectInfo.name }}</div>
      <div class="project-address">{{ projectInfo.address }}</div>
    </div>
    
    <div class="stock-summary">
      <div class="summary-item">
        <div class="summary-value">{{ stockSummary.totalTypes }}</div>
        <div class="summary-label">材料种类</div>
      </div>
      <div class="summary-item">
        <div class="summary-value">{{ stockSummary.totalQty }}</div>
        <div class="summary-label">库存总量</div>
      </div>
      <div class="summary-item">
        <div class="summary-value warning">{{ stockSummary.warningCount }}</div>
        <div class="summary-label">预警数量</div>
      </div>
    </div>
    
    <div class="search-bar">
      <div class="search-input">
        <icon-search class="search-icon" />
        <input type="text" placeholder="搜索材料名称" v-model="searchText" />
      </div>
    </div>
    
    <div class="stock-list">
      <div class="stock-item" v-for="item in filteredStock" :key="item.id">
        <div class="stock-header">
          <div class="product-name">{{ item.name }}</div>
          <div class="stock-qty" :class="{ warning: item.isWarning }">
            {{ item.quantity }}{{ item.unit }}
          </div>
        </div>
        <div class="stock-spec">{{ item.spec }}</div>
        <div class="stock-meta">
          <span>入库: {{ item.inQty }}{{ item.unit }}</span>
          <span>已领: {{ item.outQty }}{{ item.unit }}</span>
        </div>
        <div class="stock-actions">
          <span class="action-btn" @click="handlePick(item)">领料</span>
          <span class="action-btn" @click="handleReturn(item)">退料</span>
          <span class="action-btn" @click="handleScrap(item)">报废</span>
          <span class="action-btn" @click="handleCheck(item)">盘点</span>
        </div>
      </div>
    </div>
    
    <div class="tabbar">
      <div class="tabbar-item" @click="$emit('navigate', 'index')">
        <icon-home />
        <span>工作台</span>
      </div>
      <div class="tabbar-item" @click="$emit('navigate', 'market')">
        <icon-apps />
        <span>商品市场</span>
      </div>
      <div class="tabbar-item" @click="$emit('navigate', 'order')">
        <icon-file />
        <span>订单</span>
      </div>
      <div class="tabbar-item" @click="$emit('navigate', 'mine')">
        <icon-user />
        <span>我的</span>
      </div>
    </div>
    
    <div class="modal-overlay" v-if="showPickModal" @click="showPickModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <div class="modal-title">领料出库</div>
          <icon-close @click="showPickModal = false" />
        </div>
        <div class="modal-body">
          <div class="form-item">
            <div class="form-label">材料名称</div>
            <div class="form-value">{{ currentItem.name }}</div>
          </div>
          <div class="form-item">
            <div class="form-label">当前库存</div>
            <div class="form-value">{{ currentItem.quantity }}{{ currentItem.unit }}</div>
          </div>
          <div class="form-item">
            <div class="form-label">领料数量</div>
            <input type="number" class="form-input" v-model="pickQty" placeholder="请输入领料数量" />
          </div>
          <div class="form-item">
            <div class="form-label">领料人</div>
            <input type="text" class="form-input" v-model="pickPerson" placeholder="请输入领料人" />
          </div>
          <div class="form-item">
            <div class="form-label">工单号（选填）</div>
            <input type="text" class="form-input" v-model="workOrder" placeholder="请输入工单号" />
          </div>
        </div>
        <div class="modal-footer">
          <div class="btn-cancel" @click="showPickModal = false">取消</div>
          <div class="btn-confirm" @click="confirmPick">确认领料</div>
        </div>
      </div>
    </div>
    
    <div class="modal-overlay" v-if="showCheckModal" @click="showCheckModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <div class="modal-title">库存盘点</div>
          <icon-close @click="showCheckModal = false" />
        </div>
        <div class="modal-body">
          <div class="check-item" v-for="item in stockList" :key="item.id">
            <div class="check-name">{{ item.name }}</div>
            <div class="check-row">
              <span>账面: {{ item.quantity }}{{ item.unit }}</span>
              <input type="number" class="check-input" v-model="item.checkQty" placeholder="实盘" />
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <div class="btn-cancel" @click="showCheckModal = false">取消</div>
          <div class="btn-confirm" @click="confirmCheck">确认盘点</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const emit = defineEmits(['navigate'])

const searchText = ref('')
const showPickModal = ref(false)
const showCheckModal = ref(false)
const currentItem = ref<any>({})
const pickQty = ref('')
const pickPerson = ref('')
const workOrder = ref('')

const projectInfo = ref({
  name: '星巴克深圳万象城店',
  address: '广东省深圳市罗湖区宝安南路万象城L1层'
})

const stockSummary = ref({
  totalTypes: 12,
  totalQty: '1,250',
  warningCount: 3
})

const stockList = ref([
  { id: 1, name: '水泥 P.O 42.5', spec: '50kg/袋', quantity: 50, unit: '吨', inQty: 100, outQty: 50, isWarning: false, checkQty: '' },
  { id: 2, name: '螺纹钢 HRB400', spec: '12mm', quantity: 10, unit: '吨', inQty: 20, outQty: 10, isWarning: false, checkQty: '' },
  { id: 3, name: '防水涂料', spec: 'JS型 20kg/桶', quantity: 20, unit: '桶', inQty: 50, outQty: 30, isWarning: false, checkQty: '' },
  { id: 4, name: 'PVC管材', spec: 'DN110', quantity: 100, unit: '米', inQty: 200, outQty: 100, isWarning: false, checkQty: '' },
  { id: 5, name: '电线 BV', spec: '2.5mm²', quantity: 50, unit: '米', inQty: 500, outQty: 450, isWarning: true, checkQty: '' },
  { id: 6, name: '瓷砖胶', spec: 'C1级 25kg/袋', quantity: 5, unit: '袋', inQty: 100, outQty: 95, isWarning: true, checkQty: '' }
])

const filteredStock = computed(() => {
  if (!searchText.value) return stockList.value
  return stockList.value.filter(item => item.name.includes(searchText.value))
})

function handlePick(item: any) {
  currentItem.value = item
  pickQty.value = ''
  pickPerson.value = ''
  workOrder.value = ''
  showPickModal.value = true
}

function handleReturn(item: any) {
  console.log('退料:', item.name)
}

function handleScrap(item: any) {
  console.log('报废:', item.name)
}

function handleCheck(item: any) {
  currentItem.value = item
  console.log('盘点:', item.name)
}

function confirmPick() {
  console.log('确认领料:', pickQty.value, pickPerson.value)
  showPickModal.value = false
}

function confirmCheck() {
  console.log('确认盘点')
  showCheckModal.value = false
}
</script>

<style lang="scss" scoped>
.site-stock {
  background: #f5f5f5;
  min-height: 100%;
  padding-bottom: 60px;
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

.project-info {
  margin: 54px 12px 12px;
  background: #fff;
  border-radius: 8px;
  padding: 12px;
  
  .project-name {
    font-size: 15px;
    font-weight: 500;
    color: #1d2129;
    margin-bottom: 4px;
  }
  
  .project-address {
    font-size: 12px;
    color: #86909c;
  }
}

.stock-summary {
  display: flex;
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  margin: 0 12px 12px;
  
  .summary-item {
    flex: 1;
    text-align: center;
    
    .summary-value {
      font-size: 20px;
      font-weight: 600;
      color: #1d2129;
      
      &.warning {
        color: #f53f3f;
      }
    }
    
    .summary-label {
      font-size: 11px;
      color: #86909c;
      margin-top: 4px;
    }
  }
}

.search-bar {
  padding: 0 12px 12px;
}

.search-input {
  display: flex;
  align-items: center;
  background: #fff;
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

.stock-list {
  padding: 0 12px;
}

.stock-item {
  background: #fff;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
  
  .stock-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
    
    .product-name {
      font-size: 14px;
      color: #1d2129;
      font-weight: 500;
    }
    
    .stock-qty {
      font-size: 16px;
      color: #165dff;
      font-weight: 600;
      
      &.warning {
        color: #f53f3f;
      }
    }
  }
  
  .stock-spec {
    font-size: 12px;
    color: #86909c;
    margin-bottom: 6px;
  }
  
  .stock-meta {
    display: flex;
    gap: 16px;
    font-size: 12px;
    color: #4e5969;
    margin-bottom: 10px;
  }
  
  .stock-actions {
    display: flex;
    gap: 8px;
    
    .action-btn {
      flex: 1;
      text-align: center;
      padding: 6px 0;
      border-radius: 4px;
      font-size: 12px;
      background: #f2f3f5;
      color: #4e5969;
    }
  }
}

.tabbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50px;
  background: #fff;
  display: flex;
  border-top: 1px solid #e5e6eb;
}

.tabbar-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: #86909c;
  
  :deep(.arco-icon) {
    font-size: 20px;
    margin-bottom: 2px;
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
    
    .form-value {
      font-size: 14px;
      color: #1d2129;
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
  }
  
  .check-item {
    padding: 12px 0;
    border-bottom: 1px solid #f2f3f5;
    
    .check-name {
      font-size: 14px;
      color: #1d2129;
      margin-bottom: 8px;
    }
    
    .check-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 12px;
      color: #86909c;
      
      .check-input {
        width: 80px;
        height: 32px;
        border: 1px solid #e5e6eb;
        border-radius: 4px;
        padding: 0 8px;
        font-size: 14px;
        text-align: center;
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
