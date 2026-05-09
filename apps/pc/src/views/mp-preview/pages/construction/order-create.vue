<template>
  <div class="mp-page order-create">
    <div class="page-header">
      <div class="header-back" @click="$emit('navigate', 'market')">
        <icon-left />
      </div>
      <div class="header-title">确认订单</div>
    </div>

    <div class="order-content">
      <div class="address-section" @click="showAddressPicker = true">
        <div class="address-icon">
          <icon-map-pin />
        </div>
        <div class="address-info">
          <div class="address-header">
            <span class="contact-name">{{ contactInfo.name }}</span>
            <span class="contact-phone">{{ contactInfo.phone }}</span>
          </div>
          <div class="address-detail">
            {{ deliveryAddress.province }}{{ deliveryAddress.city }}{{ deliveryAddress.district }}{{ deliveryAddress.address }}
          </div>
        </div>
        <div class="address-arrow">
          <icon-arrow-right />
        </div>
      </div>

      <div class="contact-section" @click="showContactEditor = true">
        <div class="section-label">
          <icon-user />
          <span>联系人信息</span>
        </div>
        <div class="section-value">
          <span>{{ contactInfo.name }}</span>
          <span>{{ contactInfo.phone }}</span>
          <icon-arrow-right />
        </div>
      </div>

      <div class="goods-section">
        <div class="section-title">商品信息</div>
        <div class="goods-list">
          <div class="goods-item" v-for="item in cartItems" :key="item.id">
            <div class="goods-image">
              <img :src="item.image" :alt="item.name" />
            </div>
            <div class="goods-info">
              <div class="goods-name">{{ item.name }}</div>
              <div class="goods-spec">{{ item.spec }}</div>
            </div>
            <div class="goods-right">
              <div class="goods-price">¥{{ item.price }}</div>
              <div class="goods-qty">x{{ item.quantity }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="warehouse-section">
        <div class="section-label">
          <icon-warehouse />
          <span>发货仓库</span>
        </div>
        <div class="section-value">
          <span>{{ selectedWarehouse }}</span>
          <icon-arrow-right @click="showWarehousePicker = true" />
        </div>
      </div>

      <div class="remark-section">
        <div class="section-label">
          <icon-edit />
          <span>订单备注</span>
        </div>
        <input type="text" v-model="remark" placeholder="请输入订单备注（选填）" class="remark-input" />
      </div>

      <div class="payment-section">
        <div class="section-title">支付方式</div>
        <div class="payment-list">
          <div class="payment-item" :class="{ active: paymentMethod === 'transfer' }" @click="paymentMethod = 'transfer'">
            <div class="payment-icon">
              <icon-wallet />
            </div>
            <div class="payment-info">
              <div class="payment-name">转账支付</div>
              <div class="payment-desc">转账后上传凭证</div>
            </div>
            <div class="payment-radio">
              <icon-check-circle-fill v-if="paymentMethod === 'transfer'" />
              <icon-check-circle v-else />
            </div>
          </div>
        </div>
      </div>

      <div class="voucher-section" v-if="paymentMethod === 'transfer' && uploadedVoucher">
        <div class="section-title">转账凭证</div>
        <div class="voucher-preview">
          <img :src="uploadedVoucher" alt="转账凭证" />
          <div class="voucher-time">上传于 {{ voucherUploadTime }}</div>
        </div>
      </div>
    </div>

    <div class="action-bar">
      <div class="total-info">
        <span class="label">合计:</span>
        <span class="amount">¥{{ totalAmount }}</span>
      </div>
      <div class="action-btns">
        <div class="voucher-btn" v-if="paymentMethod === 'transfer' && !uploadedVoucher" @click="handleUploadVoucher">
          <icon-upload />
          <span>上传凭证</span>
        </div>
        <div class="submit-btn" :class="{ disabled: paymentMethod === 'transfer' && !uploadedVoucher }" @click="handleSubmitOrder">
          {{ paymentMethod === 'transfer' && !uploadedVoucher ? '待上传凭证' : '提交订单' }}
        </div>
      </div>
    </div>

    <div class="address-picker-popup" v-if="showAddressPicker">
      <div class="popup-mask" @click="showAddressPicker = false"></div>
      <div class="popup-content">
        <div class="popup-header">
          <span class="popup-cancel" @click="showAddressPicker = false">取消</span>
          <span class="popup-title">选择收货地址</span>
          <span class="popup-confirm" @click="showAddressPicker = false">确定</span>
        </div>
        <div class="popup-body">
          <div class="address-item" :class="{ active: selectedAddressIndex === -1 }" @click="selectStoreAddress">
            <div class="address-item-header">
              <span class="tag">门店地址</span>
              <span class="name">{{ contactInfo.name }}</span>
              <span class="phone">{{ contactInfo.phone }}</span>
            </div>
            <div class="address-item-detail">
              {{ storeAddress.province }}{{ storeAddress.city }}{{ storeAddress.district }}{{ storeAddress.address }}
            </div>
            <div class="address-check" v-if="selectedAddressIndex === -1">
              <icon-check-circle-fill />
            </div>
          </div>
          <div class="address-item" 
            v-for="(addr, index) in addressList" 
            :key="index"
            :class="{ active: selectedAddressIndex === index }"
            @click="selectedAddressIndex = index"
          >
            <div class="address-item-header">
              <span class="name">{{ addr.name }}</span>
              <span class="phone">{{ addr.phone }}</span>
            </div>
            <div class="address-item-detail">
              {{ addr.province }}{{ addr.city }}{{ addr.district }}{{ addr.address }}
            </div>
            <div class="address-check" v-if="selectedAddressIndex === index">
              <icon-check-circle-fill />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="contact-editor-popup" v-if="showContactEditor">
      <div class="popup-mask" @click="showContactEditor = false"></div>
      <div class="popup-content">
        <div class="popup-header">
          <span class="popup-cancel" @click="showContactEditor = false">取消</span>
          <span class="popup-title">编辑联系人</span>
          <span class="popup-confirm" @click="handleSaveContact">确定</span>
        </div>
        <div class="popup-body">
          <div class="form-item">
            <div class="form-label">联系人</div>
            <input type="text" v-model="tempContact.name" placeholder="请输入联系人姓名" class="form-input" />
          </div>
          <div class="form-item">
            <div class="form-label">联系电话</div>
            <input type="tel" v-model="tempContact.phone" placeholder="请输入联系电话" class="form-input" />
          </div>
        </div>
      </div>
    </div>

    <div class="warehouse-picker-popup" v-if="showWarehousePicker">
      <div class="popup-mask" @click="showWarehousePicker = false"></div>
      <div class="popup-content">
        <div class="popup-header">
          <span class="popup-cancel" @click="showWarehousePicker = false">取消</span>
          <span class="popup-title">选择发货仓库</span>
          <span class="popup-confirm" @click="showWarehousePicker = false">确定</span>
        </div>
        <div class="popup-body">
          <div class="warehouse-item" 
            v-for="wh in warehouseList" 
            :key="wh.id"
            :class="{ active: selectedWarehouse === wh.name }"
            @click="selectedWarehouse = wh.name"
          >
            <div class="warehouse-info">
              <div class="warehouse-name">{{ wh.name }}</div>
              <div class="warehouse-location">{{ wh.location }}</div>
            </div>
            <div class="warehouse-check" v-if="selectedWarehouse === wh.name">
              <icon-check-circle-fill />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="upload-popup" v-if="showUploadPopup">
      <div class="popup-mask" @click="showUploadPopup = false"></div>
      <div class="popup-content upload-content">
        <div class="popup-header">
          <span class="popup-cancel" @click="showUploadPopup = false">取消</span>
          <span class="popup-title">上传转账凭证</span>
          <span class="popup-confirm" @click="handleConfirmUpload">确定</span>
        </div>
        <div class="popup-body">
          <div class="upload-tips">
            <icon-info-circle />
            <span>请上传转账截图或凭证照片</span>
          </div>
          <div class="upload-area" @click="triggerUpload">
            <img v-if="previewImage" :src="previewImage" alt="预览" />
            <div v-else class="upload-placeholder">
              <icon-plus />
              <span>点击上传图片</span>
            </div>
          </div>
          <input type="file" ref="fileInput" accept="image/*" style="display: none" @change="handleFileChange" />
        </div>
      </div>
    </div>

    <div class="success-modal" v-if="showSuccessModal">
      <div class="modal-mask"></div>
      <div class="modal-content">
        <div class="success-icon">
          <icon-check-circle-fill />
        </div>
        <div class="success-title">订单提交成功</div>
        <div class="order-no">订单号：{{ newOrderNo }}</div>
        <div class="success-desc">请等待审核，审核通过后将自动发货</div>
        <div class="success-btns">
          <div class="btn-default" @click="$emit('navigate', 'order')">查看订单</div>
          <div class="btn-primary" @click="$emit('navigate', 'index')">返回首页</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const emit = defineEmits(['navigate'])

const storeAddress = ref({
  province: '广东省',
  city: '深圳市',
  district: '罗湖区',
  address: '宝安南路1881号万象城3楼301铺',
})

const deliveryAddress = ref({
  province: '广东省',
  city: '深圳市',
  district: '罗湖区',
  address: '宝安南路1881号万象城3楼301铺',
})

const contactInfo = ref({
  name: '张三',
  phone: '138****8000',
})

const tempContact = ref({
  name: '',
  phone: '',
})

const selectedAddressIndex = ref(-1)
const addressList = ref([
  {
    name: '李四',
    phone: '139****1234',
    province: '广东省',
    city: '广州市',
    district: '天河区',
    address: '天河路208号天河城4楼401铺',
  },
  {
    name: '王五',
    phone: '137****5678',
    province: '广东省',
    city: '东莞市',
    district: '虎门镇',
    address: '人民路88号新世纪广场2楼',
  },
])

const warehouseList = ref([
  { id: 1, name: '深圳福田仓', location: '广东省深圳市福田区' },
  { id: 2, name: '广州白云仓', location: '广东省广州市白云区' },
  { id: 3, name: '东莞虎门仓', location: '广东省东莞市虎门镇' },
])

const selectedWarehouse = ref('深圳福田仓')
const remark = ref('')
const paymentMethod = ref('transfer')
const uploadedVoucher = ref('')
const voucherUploadTime = ref('')
const showAddressPicker = ref(false)
const showContactEditor = ref(false)
const showWarehousePicker = ref(false)
const showUploadPopup = ref(false)
const showSuccessModal = ref(false)
const previewImage = ref('')
const fileInput = ref<HTMLInputElement | null>(null)
const newOrderNo = ref('')

const cartItems = ref([
  {
    id: 1,
    name: '普通硅酸盐水泥 42.5',
    spec: '50kg/袋',
    price: '450',
    image: 'https://picsum.photos/200/200?random=201',
    quantity: 10,
  },
  {
    id: 2,
    name: '螺纹钢 HRB400 16mm',
    spec: '9m/根',
    price: '4,280',
    image: 'https://picsum.photos/200/200?random=202',
    quantity: 5,
  },
])

const totalAmount = computed(() => {
  return cartItems.value.reduce((sum, item) => {
    return sum + Number(item.price.replace(',', '')) * item.quantity
  }, 0).toLocaleString()
})

function selectStoreAddress() {
  selectedAddressIndex.value = -1
  deliveryAddress.value = { ...storeAddress.value }
}

function handleSaveContact() {
  if (!tempContact.value.name || !tempContact.value.phone) {
    alert('请填写完整的联系人信息')
    return
  }
  contactInfo.value = { ...tempContact.value }
  showContactEditor.value = false
}

function triggerUpload() {
  fileInput.value?.click()
}

function handleFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (event) => {
      previewImage.value = event.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

function handleConfirmUpload() {
  if (!previewImage.value) {
    alert('请先上传凭证图片')
    return
  }
  uploadedVoucher.value = previewImage.value
  voucherUploadTime.value = new Date().toLocaleString('zh-CN')
  showUploadPopup.value = false
  previewImage.value = ''
}

function handleUploadVoucher() {
  tempContact.value = { ...contactInfo.value }
  showUploadPopup.value = true
}

function handleSubmitOrder() {
  if (paymentMethod.value === 'transfer' && !uploadedVoucher.value) {
    alert('请先上传转账凭证')
    return
  }

  newOrderNo.value = 'PO' + Date.now().toString().slice(-10)
  showSuccessModal.value = true
}
</script>

<style lang="scss" scoped>
.order-create {
  background: #f5f5f5;
  min-height: 100%;
  padding-bottom: 80px;
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
  padding: 0 16px;
  z-index: 100;
  border-bottom: 1px solid #e5e6eb;

  .header-back {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #4e5969;
  }

  .header-title {
    flex: 1;
    text-align: center;
    font-size: 16px;
    font-weight: 500;
    color: #1d2129;
    margin-right: 32px;
  }
}

.order-content {
  padding: 56px 12px 80px;
}

.address-section {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;

  .address-icon {
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #165dff, #4080ff);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 18px;
  }

  .address-info {
    flex: 1;

    .address-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 6px;

      .contact-name {
        font-size: 16px;
        font-weight: 600;
        color: #1d2129;
      }

      .contact-phone {
        font-size: 14px;
        color: #86909c;
      }
    }

    .address-detail {
      font-size: 13px;
      color: #4e5969;
      line-height: 1.5;
    }
  }

  .address-arrow {
    color: #c9cdd4;
    font-size: 16px;
  }
}

.contact-section,
.warehouse-section {
  background: #fff;
  border-radius: 12px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;

  .section-label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: #1d2129;

    svg {
      color: #165dff;
      font-size: 16px;
    }
  }

  .section-value {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: #86909c;

    svg {
      font-size: 14px;
      color: #c9cdd4;
    }
  }
}

.goods-section {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;

  .section-title {
    font-size: 15px;
    font-weight: 600;
    color: #1d2129;
    margin-bottom: 12px;
  }

  .goods-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .goods-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: #f7f8fa;
    border-radius: 8px;

    .goods-image {
      width: 60px;
      height: 60px;
      border-radius: 6px;
      overflow: hidden;
      flex-shrink: 0;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .goods-info {
      flex: 1;
      min-width: 0;

      .goods-name {
        font-size: 14px;
        font-weight: 500;
        color: #1d2129;
        margin-bottom: 4px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .goods-spec {
        font-size: 12px;
        color: #86909c;
      }
    }

    .goods-right {
      text-align: right;

      .goods-price {
        font-size: 14px;
        font-weight: 600;
        color: #1d2129;
        margin-bottom: 4px;
      }

      .goods-qty {
        font-size: 12px;
        color: #86909c;
      }
    }
  }
}

.remark-section {
  background: #fff;
  border-radius: 12px;
  padding: 14px 16px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 12px;

  .section-label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: #1d2129;
    flex-shrink: 0;

    svg {
      color: #165dff;
      font-size: 16px;
    }
  }

  .remark-input {
    flex: 1;
    border: none;
    background: transparent;
    font-size: 14px;
    color: #1d2129;
    outline: none;

    &::placeholder {
      color: #c9cdd4;
    }
  }
}

.payment-section {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;

  .section-title {
    font-size: 15px;
    font-weight: 600;
    color: #1d2129;
    margin-bottom: 12px;
  }

  .payment-list {
    .payment-item {
      display: flex;
      align-items: center;
      padding: 14px;
      background: #f7f8fa;
      border-radius: 8px;
      border: 2px solid transparent;
      transition: all 0.2s;

      &.active {
        border-color: #165dff;
        background: #e8f3ff;
      }

      .payment-icon {
        width: 40px;
        height: 40px;
        background: #fff;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 12px;

        svg {
          font-size: 20px;
          color: #165dff;
        }
      }

      .payment-info {
        flex: 1;

        .payment-name {
          font-size: 14px;
          font-weight: 500;
          color: #1d2129;
          margin-bottom: 2px;
        }

        .payment-desc {
          font-size: 12px;
          color: #86909c;
        }
      }

      .payment-radio {
        svg {
          font-size: 20px;
          color: #165dff;
        }
      }
    }
  }
}

.voucher-section {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;

  .section-title {
    font-size: 15px;
    font-weight: 600;
    color: #1d2129;
    margin-bottom: 12px;
  }

  .voucher-preview {
    position: relative;
    border-radius: 8px;
    overflow: hidden;

    img {
      width: 100%;
      max-height: 200px;
      object-fit: contain;
      background: #f7f8fa;
    }

    .voucher-time {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 8px;
      background: rgba(0, 0, 0, 0.5);
      color: #fff;
      font-size: 12px;
      text-align: center;
    }
  }
}

.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #fff;
  border-top: 1px solid #e5e6eb;
  z-index: 100;

  .total-info {
    display: flex;
    align-items: baseline;
    gap: 4px;

    .label {
      font-size: 14px;
      color: #86909c;
    }

    .amount {
      font-size: 20px;
      font-weight: 600;
      color: #ff4d4f;
    }
  }

  .action-btns {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .voucher-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 10px 16px;
    background: #f7f8fa;
    color: #165dff;
    border-radius: 20px;
    font-size: 14px;
  }

  .submit-btn {
    padding: 10px 24px;
    background: linear-gradient(135deg, #165dff, #4080ff);
    color: #fff;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 500;

    &.disabled {
      background: #d9d9d9;
      color: #fff;
    }
  }
}

.address-picker-popup,
.contact-editor-popup,
.warehouse-picker-popup,
.upload-popup {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 200;

  .popup-mask {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
  }

  .popup-content {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: #fff;
    border-radius: 16px 16px 0 0;
    max-height: 70vh;
    overflow: hidden;

    &.upload-content {
      max-height: 50vh;
    }

    .popup-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px;
      border-bottom: 1px solid #f0f0f0;

      .popup-cancel {
        font-size: 14px;
        color: #86909c;
      }

      .popup-title {
        font-size: 16px;
        font-weight: 600;
        color: #1d2129;
      }

      .popup-confirm {
        font-size: 14px;
        color: #165dff;
      }
    }

    .popup-body {
      padding: 16px;
      max-height: calc(70vh - 60px);
      overflow-y: auto;
    }
  }
}

.address-item {
  padding: 14px;
  background: #f7f8fa;
  border-radius: 8px;
  margin-bottom: 10px;
  position: relative;
  border: 2px solid transparent;

  &.active {
    border-color: #165dff;
    background: #e8f3ff;
  }

  .address-item-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 6px;

    .tag {
      font-size: 10px;
      padding: 2px 6px;
      background: #ff7d00;
      color: #fff;
      border-radius: 4px;
    }

    .name {
      font-size: 15px;
      font-weight: 600;
      color: #1d2129;
    }

    .phone {
      font-size: 14px;
      color: #86909c;
    }
  }

  .address-item-detail {
    font-size: 13px;
    color: #4e5969;
    line-height: 1.5;
  }

  .address-check {
    position: absolute;
    right: 14px;
    top: 50%;
    transform: translateY(-50%);

    svg {
      font-size: 20px;
      color: #165dff;
    }
  }
}

.warehouse-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px;
  background: #f7f8fa;
  border-radius: 8px;
  margin-bottom: 10px;
  border: 2px solid transparent;

  &.active {
    border-color: #165dff;
    background: #e8f3ff;
  }

  .warehouse-info {
    .warehouse-name {
      font-size: 14px;
      font-weight: 500;
      color: #1d2129;
      margin-bottom: 4px;
    }

    .warehouse-location {
      font-size: 12px;
      color: #86909c;
    }
  }

  .warehouse-check {
    svg {
      font-size: 20px;
      color: #165dff;
    }
  }
}

.form-item {
  margin-bottom: 16px;

  .form-label {
    font-size: 14px;
    color: #1d2129;
    margin-bottom: 8px;
  }

  .form-input {
    width: 100%;
    padding: 12px;
    border: 1px solid #e5e6eb;
    border-radius: 8px;
    font-size: 14px;
    outline: none;
    box-sizing: border-box;

    &:focus {
      border-color: #165dff;
    }
  }
}

.upload-tips {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px;
  background: #f0f5ff;
  border-radius: 6px;
  margin-bottom: 12px;
  font-size: 13px;
  color: #165dff;
}

.upload-area {
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  padding: 40px;
  text-align: center;

  img {
    max-width: 100%;
    max-height: 200px;
  }

  .upload-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    color: #86909c;

    svg {
      font-size: 32px;
    }

    span {
      font-size: 14px;
    }
  }
}

.success-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 300;
  display: flex;
  align-items: center;
  justify-content: center;

  .modal-mask {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
  }

  .modal-content {
    position: relative;
    width: 300px;
    background: #fff;
    border-radius: 16px;
    padding: 32px 24px;
    text-align: center;

    .success-icon {
      width: 64px;
      height: 64px;
      background: linear-gradient(135deg, #00b42a, #23c343);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px;

      svg {
        font-size: 40px;
        color: #fff;
      }
    }

    .success-title {
      font-size: 18px;
      font-weight: 600;
      color: #1d2129;
      margin-bottom: 8px;
    }

    .order-no {
      font-size: 14px;
      color: #86909c;
      margin-bottom: 8px;
    }

    .success-desc {
      font-size: 13px;
      color: #86909c;
      margin-bottom: 24px;
    }

    .success-btns {
      display: flex;
      gap: 12px;

      .btn-default {
        flex: 1;
        padding: 12px;
        border: 1px solid #e5e6eb;
        border-radius: 20px;
        font-size: 14px;
        color: #4e5969;
      }

      .btn-primary {
        flex: 1;
        padding: 12px;
        background: linear-gradient(135deg, #165dff, #4080ff);
        border-radius: 20px;
        font-size: 14px;
        color: #fff;
      }
    }
  }
}
</style>
