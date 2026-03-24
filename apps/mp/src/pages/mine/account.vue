<template>
  <view class="page">
    <view class="stats-card">
      <view class="stat-item">
        <text class="stat-value">{{ stats.total }}</text>
        <text class="stat-label">总账号</text>
      </view>
      <view class="stat-item">
        <text class="stat-value">{{ stats.active }}</text>
        <text class="stat-label">启用</text>
      </view>
      <view class="stat-item">
        <text class="stat-value">{{ stats.disabled }}</text>
        <text class="stat-label">禁用</text>
      </view>
    </view>

    <view class="search-bar">
      <text class="search-icon">🔍</text>
      <input 
        type="text" 
        v-model="keyword" 
        placeholder="搜索账号/姓名" 
        class="search-input"
      />
    </view>

    <view class="account-list">
      <view class="account-item" v-for="item in filteredAccounts" :key="item.id">
        <view class="account-main">
          <view class="avatar">{{ item.name.charAt(0) }}</view>
          <view class="account-info">
            <view class="account-header">
              <text class="account-name">{{ item.name }}</text>
              <text class="account-status" :class="item.status">{{ item.statusText }}</text>
            </view>
            <text class="account-phone">{{ item.phone }}</text>
            <view class="account-roles">
              <text class="role-tag" v-for="role in item.roles" :key="role">{{ role }}</text>
            </view>
          </view>
        </view>
        <view class="account-footer">
          <view class="account-meta">
            <text class="meta-item">创建于 {{ item.createTime }}</text>
            <text class="meta-item" v-if="item.lastLogin">最后登录: {{ item.lastLogin }}</text>
          </view>
          <view class="account-actions">
            <view class="action-btn" @click="handleEdit(item)">编辑</view>
            <view class="action-btn" v-if="item.status === 'active'" @click="handleDisable(item)">禁用</view>
            <view class="action-btn primary" v-if="item.status === 'disabled'" @click="handleEnable(item)">启用</view>
            <view class="action-btn" @click="handleResetPwd(item)">重置密码</view>
          </view>
        </view>
      </view>
    </view>

    <view class="empty-state" v-if="filteredAccounts.length === 0">
      <text class="empty-icon">👥</text>
      <text class="empty-text">暂无子账号</text>
    </view>

    <view class="add-btn" @click="handleAdd">
      <text class="add-icon">+</text>
      <text class="add-text">添加子账号</text>
    </view>

    <view class="popup" v-if="showAddPopup" @click="showAddPopup = false">
      <view class="popup-content" @click.stop>
        <view class="popup-header">
          <text class="popup-title">{{ editingItem ? '编辑账号' : '添加子账号' }}</text>
          <text class="popup-close" @click="showAddPopup = false">✕</text>
        </view>
        <view class="popup-body">
          <view class="form-item">
            <text class="form-label">姓名</text>
            <input type="text" v-model="formData.name" placeholder="请输入姓名" class="form-input" />
          </view>
          <view class="form-item">
            <text class="form-label">手机号</text>
            <input type="number" v-model="formData.phone" placeholder="请输入手机号" class="form-input" />
          </view>
          <view class="form-item">
            <text class="form-label">角色权限</text>
            <view class="role-list">
              <view 
                class="role-item" 
                :class="{ active: formData.selectedRoles.includes(item.id) }"
                v-for="item in roleOptions" 
                :key="item.id"
                @click="toggleRole(item.id)"
              >
                <text class="role-name">{{ item.name }}</text>
                <view class="role-check">
                  <view class="check-dot" v-if="formData.selectedRoles.includes(item.id)"></view>
                </view>
              </view>
            </view>
          </view>
        </view>
        <view class="popup-footer">
          <view class="popup-btn cancel" @click="showAddPopup = false">取消</view>
          <view class="popup-btn confirm" @click="handleConfirm">确定</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const keyword = ref('')
const showAddPopup = ref(false)
const editingItem = ref<any>(null)

const stats = ref({
  total: 5,
  active: 4,
  disabled: 1,
})

const formData = ref({
  name: '',
  phone: '',
  selectedRoles: [] as string[],
})

const roleOptions = ref([
  { id: 'admin', name: '管理员' },
  { id: 'sales', name: '销售' },
  { id: 'warehouse', name: '仓库' },
  { id: 'finance', name: '财务' },
])

const accounts = ref([
  {
    id: 'a1',
    name: '李四',
    phone: '139****9999',
    status: 'active',
    statusText: '启用',
    roles: ['管理员', '销售'],
    createTime: '2024-01-10',
    lastLogin: '2024-01-15 14:30',
  },
  {
    id: 'a2',
    name: '王五',
    phone: '138****8888',
    status: 'active',
    statusText: '启用',
    roles: ['仓库'],
    createTime: '2024-01-08',
    lastLogin: '2024-01-15 10:20',
  },
  {
    id: 'a3',
    name: '赵六',
    phone: '137****7777',
    status: 'disabled',
    statusText: '禁用',
    roles: ['财务'],
    createTime: '2024-01-05',
    lastLogin: '2024-01-10 16:45',
  },
])

const filteredAccounts = computed(() => {
  if (!keyword.value) return accounts.value
  const kw = keyword.value.toLowerCase()
  return accounts.value.filter(a => 
    a.name.toLowerCase().includes(kw) || 
    a.phone.includes(kw)
  )
})

function handleAdd() {
  editingItem.value = null
  formData.value = { name: '', phone: '', selectedRoles: [] }
  showAddPopup.value = true
}

function handleEdit(item: any) {
  editingItem.value = item
  formData.value = {
    name: item.name,
    phone: item.phone.replace(/\*/g, '0'),
    selectedRoles: item.roles.map((r: string) => r.toLowerCase()),
  }
  showAddPopup.value = true
}

function handleDisable(item: any) {
  uni.showModal({
    title: '禁用账号',
    content: `确定禁用 ${item.name} 的账号吗？`,
    success: (res) => {
      if (res.confirm) {
        uni.showToast({ title: '已禁用', icon: 'success' })
      }
    },
  })
}

function handleEnable(item: any) {
  uni.showModal({
    title: '启用账号',
    content: `确定启用 ${item.name} 的账号吗？`,
    success: (res) => {
      if (res.confirm) {
        uni.showToast({ title: '已启用', icon: 'success' })
      }
    },
  })
}

function handleResetPwd(item: any) {
  uni.showModal({
    title: '重置密码',
    content: `确定重置 ${item.name} 的密码吗？新密码将发送到其手机。`,
    success: (res) => {
      if (res.confirm) {
        uni.showToast({ title: '密码已重置', icon: 'success' })
      }
    },
  })
}

function toggleRole(id: string) {
  const index = formData.value.selectedRoles.indexOf(id)
  if (index > -1) {
    formData.value.selectedRoles.splice(index, 1)
  } else {
    formData.value.selectedRoles.push(id)
  }
}

function handleConfirm() {
  if (!formData.value.name) {
    uni.showToast({ title: '请输入姓名', icon: 'none' })
    return
  }
  if (!formData.value.phone) {
    uni.showToast({ title: '请输入手机号', icon: 'none' })
    return
  }
  if (formData.value.selectedRoles.length === 0) {
    uni.showToast({ title: '请选择角色', icon: 'none' })
    return
  }
  
  uni.showToast({ title: editingItem.value ? '修改成功' : '添加成功', icon: 'success' })
  showAddPopup.value = false
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding-bottom: 120rpx;
}

.stats-card {
  display: flex;
  margin: 24rpx 32rpx;
  background-color: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
}

.stat-item {
  flex: 1;
  text-align: center;
}

.stat-value {
  font-size: 40rpx;
  color: #1d2129;
  font-weight: 600;
  display: block;
}

.stat-label {
  font-size: 24rpx;
  color: #86909c;
  margin-top: 8rpx;
  display: block;
}

.search-bar {
  display: flex;
  align-items: center;
  margin: 0 32rpx 24rpx;
  padding: 0 24rpx;
  height: 72rpx;
  background-color: #fff;
  border-radius: 36rpx;
}

.search-icon {
  margin-right: 12rpx;
}

.search-input {
  flex: 1;
  font-size: 28rpx;
}

.account-list {
  padding: 0 32rpx;
}

.account-item {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
}

.account-main {
  display: flex;
}

.avatar {
  width: 80rpx;
  height: 80rpx;
  background-color: #e8f3ff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  color: #165dff;
  font-weight: 600;
  flex-shrink: 0;
}

.account-info {
  flex: 1;
  margin-left: 20rpx;
}

.account-header {
  display: flex;
  align-items: center;
}

.account-name {
  font-size: 30rpx;
  color: #1d2129;
  font-weight: 500;
}

.account-status {
  font-size: 22rpx;
  padding: 4rpx 12rpx;
  border-radius: 4rpx;
  margin-left: 12rpx;
  
  &.active {
    color: #00b42a;
    background-color: #e8ffea;
  }
  
  &.disabled {
    color: #86909c;
    background-color: #f7f8fa;
  }
}

.account-phone {
  font-size: 24rpx;
  color: #86909c;
  margin-top: 8rpx;
  display: block;
}

.account-roles {
  display: flex;
  gap: 8rpx;
  margin-top: 12rpx;
}

.role-tag {
  font-size: 22rpx;
  color: #165dff;
  background-color: #e8f3ff;
  padding: 4rpx 12rpx;
  border-radius: 4rpx;
}

.account-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16rpx;
  padding-top: 16rpx;
  border-top: 1rpx solid #f0f0f0;
}

.account-meta {
  display: flex;
  flex-direction: column;
}

.meta-item {
  font-size: 22rpx;
  color: #86909c;
}

.account-actions {
  display: flex;
  gap: 12rpx;
}

.action-btn {
  padding: 8rpx 20rpx;
  font-size: 24rpx;
  color: #666;
  background-color: #f7f8fa;
  border-radius: 24rpx;
  
  &.primary {
    color: #fff;
    background-color: #165dff;
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 0;
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 24rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #86909c;
}

.add-btn {
  position: fixed;
  bottom: 32rpx;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20rpx 48rpx;
  background-color: #165dff;
  border-radius: 40rpx;
  box-shadow: 0 8rpx 24rpx rgba(22, 93, 255, 0.3);
}

.add-icon {
  font-size: 32rpx;
  color: #fff;
  margin-right: 8rpx;
}

.add-text {
  font-size: 30rpx;
  color: #fff;
}

.popup {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 100;
  display: flex;
  align-items: flex-end;
}

.popup-content {
  width: 100%;
  background-color: #fff;
  border-radius: 24rpx 24rpx 0 0;
  padding-bottom: env(safe-area-inset-bottom);
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.popup-title {
  font-size: 32rpx;
  color: #1d2129;
  font-weight: 500;
}

.popup-close {
  font-size: 32rpx;
  color: #86909c;
}

.popup-body {
  padding: 24rpx 32rpx;
}

.form-item {
  margin-bottom: 24rpx;
}

.form-label {
  font-size: 28rpx;
  color: #1d2129;
  font-weight: 500;
  display: block;
  margin-bottom: 12rpx;
}

.form-input {
  width: 100%;
  height: 80rpx;
  padding: 0 24rpx;
  background-color: #f7f8fa;
  border-radius: 12rpx;
  font-size: 28rpx;
}

.role-list {
  border-radius: 12rpx;
  overflow: hidden;
  border: 1rpx solid #f0f0f0;
}

.role-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx;
  border-bottom: 1rpx solid #f0f0f0;
  
  &:last-child {
    border-bottom: none;
  }
  
  &.active {
    background-color: #f7f8fa;
  }
}

.role-name {
  font-size: 28rpx;
  color: #1d2129;
}

.role-check {
  width: 40rpx;
  height: 40rpx;
  border: 2rpx solid #c9cdd4;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.check-dot {
  width: 24rpx;
  height: 24rpx;
  background-color: #165dff;
  border-radius: 50%;
}

.popup-footer {
  display: flex;
  padding: 24rpx 32rpx;
  gap: 24rpx;
  border-top: 1rpx solid #f0f0f0;
}

.popup-btn {
  flex: 1;
  text-align: center;
  padding: 24rpx 0;
  border-radius: 12rpx;
  font-size: 30rpx;
  
  &.cancel {
    color: #666;
    background-color: #f7f8fa;
  }
  
  &.confirm {
    color: #fff;
    background-color: #165dff;
  }
}
</style>
