<template>
  <view class="page">
    <view class="header-card">
      <view class="company-logo">
        <text class="logo-text">{{ companyInfo.name.charAt(0) }}</text>
      </view>
      <view class="company-info">
        <text class="company-name">{{ companyInfo.name }}</text>
        <view class="cert-status">
          <text class="cert-icon">✓</text>
          <text class="cert-text">{{ companyInfo.certStatus }}</text>
        </view>
      </view>
    </view>

    <view class="section">
      <view class="section-header">
        <text class="section-title">基本信息</text>
      </view>
      <view class="info-group">
        <view class="info-item">
          <text class="info-label">企业名称</text>
          <text class="info-value">{{ companyInfo.name }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">统一社会信用代码</text>
          <text class="info-value">{{ companyInfo.creditCode }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">企业类型</text>
          <text class="info-value">{{ companyInfo.type }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">成立日期</text>
          <text class="info-value">{{ companyInfo.establishDate }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">注册资本</text>
          <text class="info-value">{{ companyInfo.registeredCapital }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">经营地址</text>
          <text class="info-value">{{ companyInfo.address }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">经营范围</text>
          <text class="info-value">{{ companyInfo.businessScope }}</text>
        </view>
      </view>
    </view>

    <view class="section">
      <view class="section-header">
        <text class="section-title">联系信息</text>
      </view>
      <view class="info-group">
        <view class="info-item" @click="handleEdit('contactName')">
          <text class="info-label">联系人</text>
          <view class="info-right">
            <text class="info-value">{{ companyInfo.contactName }}</text>
            <text class="info-arrow">></text>
          </view>
        </view>
        <view class="info-item" @click="handleEdit('contactPhone')">
          <text class="info-label">联系电话</text>
          <view class="info-right">
            <text class="info-value">{{ companyInfo.contactPhone }}</text>
            <text class="info-arrow">></text>
          </view>
        </view>
        <view class="info-item" @click="handleEdit('contactEmail')">
          <text class="info-label">电子邮箱</text>
          <view class="info-right">
            <text class="info-value">{{ companyInfo.contactEmail }}</text>
            <text class="info-arrow">></text>
          </view>
        </view>
      </view>
    </view>

    <view class="section">
      <view class="section-header">
        <text class="section-title">资质证照</text>
      </view>
      <view class="cert-list">
        <view class="cert-item" v-for="item in companyInfo.certificates" :key="item.id">
          <image :src="item.image" class="cert-image" mode="aspectFill" @click="handlePreviewImage(item.image)" />
          <view class="cert-info">
            <text class="cert-name">{{ item.name }}</text>
            <text class="cert-status" :class="item.status">{{ item.statusText }}</text>
          </view>
          <view class="cert-actions">
            <text class="cert-btn" @click="handleUpdateCert(item)">更新</text>
          </view>
        </view>
      </view>
      <view class="add-cert-btn" @click="handleAddCert">
        <text class="add-icon">+</text>
        <text class="add-text">添加资质证照</text>
      </view>
    </view>

    <view class="section">
      <view class="section-header">
        <text class="section-title">银行账户</text>
      </view>
      <view class="bank-list">
        <view class="bank-item" v-for="item in companyInfo.bankAccounts" :key="item.id">
          <view class="bank-icon">{{ item.bankName.charAt(0) }}</view>
          <view class="bank-info">
            <text class="bank-name">{{ item.bankName }}</text>
            <text class="bank-account">{{ item.accountNo }}</text>
          </view>
          <view class="bank-status" :class="item.status">{{ item.statusText }}</view>
        </view>
      </view>
      <view class="add-btn" @click="handleNavigate('/pages/mine/bankcard')">
        <text class="add-icon">+</text>
        <text class="add-text">添加银行账户</text>
      </view>
    </view>

    <view class="section">
      <view class="section-header">
        <text class="section-title">开票信息</text>
      </view>
      <view class="info-group">
        <view class="info-item">
          <text class="info-label">发票抬头</text>
          <text class="info-value">{{ invoiceInfo.title }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">税号</text>
          <text class="info-value">{{ invoiceInfo.taxNo }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">开户银行</text>
          <text class="info-value">{{ invoiceInfo.bankName }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">银行账号</text>
          <text class="info-value">{{ invoiceInfo.bankAccount }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">注册地址</text>
          <text class="info-value">{{ invoiceInfo.address }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">注册电话</text>
          <text class="info-value">{{ invoiceInfo.phone }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const companyInfo = ref({
  name: '深圳湾科技园项目仓',
  creditCode: '91440300MA5FXXXXXX',
  type: '有限责任公司',
  establishDate: '2020-05-18',
  registeredCapital: '500万元人民币',
  address: '广东省深圳市南山区科技园南区深圳湾科技生态园10栋',
  businessScope: '建筑材料销售、仓储服务、供应链管理',
  certStatus: '已认证',
  contactName: '张三',
  contactPhone: '138****8888',
  contactEmail: 'zhangsan@example.com',
  certificates: [
    { id: 1, name: '营业执照', image: 'https://picsum.photos/200/150?random=1', status: 'valid', statusText: '有效' },
    { id: 2, name: '开户许可证', image: 'https://picsum.photos/200/150?random=2', status: 'valid', statusText: '有效' },
    { id: 3, name: '建筑资质证书', image: 'https://picsum.photos/200/150?random=3', status: 'expiring', statusText: '即将到期' },
  ],
  bankAccounts: [
    { id: 1, bankName: '招商银行', accountNo: '**** **** **** 8888', status: 'verified', statusText: '已验证' },
    { id: 2, bankName: '工商银行', accountNo: '**** **** **** 6666', status: 'pending', statusText: '待验证' },
  ],
})

const invoiceInfo = ref({
  title: '深圳湾科技园项目仓',
  taxNo: '91440300MA5FXXXXXX',
  bankName: '招商银行深圳分行',
  bankAccount: '7559 **** **** 8888',
  address: '广东省深圳市南山区科技园南区',
  phone: '0755-8888****',
})

function handleEdit(field: string) {
  uni.showModal({
    title: '编辑信息',
    editable: true,
    placeholderText: '请输入新内容',
    success: (res) => {
      if (res.confirm && res.content) {
        uni.showToast({ title: '修改成功', icon: 'success' })
      }
    },
  })
}

function handlePreviewImage(url: string) {
  uni.previewImage({
    urls: [url],
  })
}

function handleUpdateCert(item: any) {
  uni.chooseImage({
    count: 1,
    success: (res) => {
      uni.showToast({ title: '更新成功', icon: 'success' })
    },
  })
}

function handleAddCert() {
  uni.showActionSheet({
    itemList: ['营业执照', '开户许可证', '建筑资质证书', '其他证书'],
    success: (res) => {
      uni.chooseImage({
        count: 1,
        success: () => {
          uni.showToast({ title: '上传成功', icon: 'success' })
        },
      })
    },
  })
}

function handleNavigate(path: string) {
  uni.navigateTo({ url: path })
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding-bottom: 32rpx;
}

.header-card {
  display: flex;
  align-items: center;
  padding: 48rpx 32rpx;
  background: linear-gradient(135deg, #165dff 0%, #4080ff 100%);
}

.company-logo {
  width: 100rpx;
  height: 100rpx;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-text {
  font-size: 48rpx;
  color: #fff;
  font-weight: 600;
}

.company-info {
  margin-left: 24rpx;
  color: #fff;
}

.company-name {
  font-size: 36rpx;
  font-weight: 600;
  display: block;
}

.cert-status {
  display: inline-flex;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.2);
  padding: 4rpx 12rpx;
  border-radius: 20rpx;
  margin-top: 12rpx;
}

.cert-icon {
  font-size: 20rpx;
  margin-right: 4rpx;
}

.cert-text {
  font-size: 22rpx;
}

.section {
  margin: 24rpx 32rpx;
  background-color: #fff;
  border-radius: 16rpx;
  overflow: hidden;
}

.section-header {
  padding: 24rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.section-title {
  font-size: 28rpx;
  color: #1d2129;
  font-weight: 500;
}

.info-group {
  padding: 0 24rpx;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #f7f8fa;
  
  &:last-child {
    border-bottom: none;
  }
}

.info-label {
  font-size: 28rpx;
  color: #86909c;
  flex-shrink: 0;
}

.info-value {
  font-size: 28rpx;
  color: #1d2129;
  text-align: right;
  flex: 1;
  margin-left: 24rpx;
}

.info-right {
  display: flex;
  align-items: center;
}

.info-arrow {
  color: #c9cdd4;
  margin-left: 12rpx;
}

.cert-list {
  padding: 0 24rpx;
}

.cert-item {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f7f8fa;
  
  &:last-child {
    border-bottom: none;
  }
}

.cert-image {
  width: 120rpx;
  height: 90rpx;
  border-radius: 8rpx;
  flex-shrink: 0;
}

.cert-info {
  flex: 1;
  margin-left: 16rpx;
}

.cert-name {
  font-size: 28rpx;
  color: #1d2129;
  display: block;
}

.cert-status {
  font-size: 22rpx;
  margin-top: 8rpx;
  
  &.valid {
    color: #00b42a;
  }
  
  &.expiring {
    color: #ff7d00;
  }
  
  &.expired {
    color: #f53f3f;
  }
}

.cert-actions {
  flex-shrink: 0;
}

.cert-btn {
  font-size: 26rpx;
  color: #165dff;
  padding: 8rpx 16rpx;
  background-color: #e8f3ff;
  border-radius: 8rpx;
}

.add-cert-btn, .add-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24rpx;
  border-top: 1rpx solid #f0f0f0;
}

.add-icon {
  font-size: 32rpx;
  color: #165dff;
  margin-right: 8rpx;
}

.add-text {
  font-size: 28rpx;
  color: #165dff;
}

.bank-list {
  padding: 0 24rpx;
}

.bank-item {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f7f8fa;
  
  &:last-child {
    border-bottom: none;
  }
}

.bank-icon {
  width: 64rpx;
  height: 64rpx;
  background-color: #e8f3ff;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  color: #165dff;
  font-weight: 600;
}

.bank-info {
  flex: 1;
  margin-left: 16rpx;
}

.bank-name {
  font-size: 28rpx;
  color: #1d2129;
  display: block;
}

.bank-account {
  font-size: 24rpx;
  color: #86909c;
  margin-top: 4rpx;
  display: block;
}

.bank-status {
  font-size: 22rpx;
  padding: 4rpx 12rpx;
  border-radius: 4rpx;
  
  &.verified {
    color: #00b42a;
    background-color: #e8ffea;
  }
  
  &.pending {
    color: #ff7d00;
    background-color: #fff7e8;
  }
}
</style>
