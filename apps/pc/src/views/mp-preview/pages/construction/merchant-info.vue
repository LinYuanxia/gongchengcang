<template>
  <div class="mp-page merchant-info">
    <div class="page-header">
      <div class="back-btn" @click="handleBack">
        <icon-left />
      </div>
      <div class="header-title">商户信息</div>
    </div>
    
    <div class="content">
      <div class="section">
        <div class="section-title">基本信息</div>
        <div class="info-list">
          <div class="info-item">
            <span class="label">商户名称</span>
            <span class="value">{{ merchantData.name }}</span>
          </div>
          <div class="info-item">
            <span class="label">联系人</span>
            <span class="value">{{ merchantData.contact }}</span>
          </div>
          <div class="info-item">
            <span class="label">联系电话</span>
            <span class="value">{{ merchantData.phone }}</span>
          </div>
          <div class="info-item">
            <span class="label">所在地区</span>
            <span class="value">{{ merchantData.region }}</span>
          </div>
          <div class="info-item address">
            <span class="label">详细地址</span>
            <span class="value">{{ merchantData.address }}</span>
          </div>
        </div>
      </div>
      
      <div class="section">
        <div class="section-title">主体信息</div>
        <div class="info-list">
          <div class="info-item">
            <span class="label">企业名称</span>
            <span class="value">{{ merchantData.companyName }}</span>
          </div>
          <div class="info-item">
            <span class="label">统一社会信用代码</span>
            <span class="value code">{{ merchantData.creditCode }}</span>
          </div>
          <div class="info-item">
            <span class="label">企业类型</span>
            <span class="value">{{ merchantData.companyType }}</span>
          </div>
          <div class="info-item">
            <span class="label">经营范围</span>
            <span class="value">{{ merchantData.businessScope }}</span>
          </div>
          <div class="info-item verify">
            <span class="label">认证状态</span>
            <span class="value">
              <span class="verified-badge">
                <icon-check-circle-fill />
                已认证
              </span>
            </span>
          </div>
        </div>
      </div>
      
      <div class="section">
        <div class="section-title">资质证明</div>
        <div class="license-grid">
          <div class="license-item" v-for="(item, index) in merchantData.licenses" :key="index">
            <div class="license-image">
              <img :src="item.image" :alt="item.name" />
            </div>
            <div class="license-name">{{ item.name }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits(['navigate'])

const merchantData = ref({
  name: '深圳市建筑工程有限公司',
  contact: '张三',
  phone: '138****5678',
  region: '广东省 深圳市 南山区',
  address: '科技园南区高新南一道8号创维大厦A座1205室',
  companyName: '深圳市建筑工程有限公司',
  creditCode: '91440300MA5GJHX2XX',
  companyType: '有限责任公司',
  businessScope: '建筑工程、装修装饰工程、机电安装工程',
  licenses: [
    { name: '营业执照', image: 'https://picsum.photos/200/140?random=license1' },
    { name: '资质证书', image: 'https://picsum.photos/200/140?random=license2' },
  ]
})

function handleBack() {
  emit('navigate', 'mine')
}
</script>

<style lang="scss" scoped>
.merchant-info {
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
  padding: 0 16px;
  z-index: 100;
  border-bottom: 1px solid #eee;
  
  .back-btn {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 8px;
    color: #4e5969;
  }
  
  .header-title {
    font-size: 16px;
    font-weight: 500;
    color: #1d2129;
  }
}

.content {
  padding: 54px 12px 24px;
}

.section {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  
  .section-title {
    font-size: 15px;
    font-weight: 500;
    color: #1d2129;
    margin-bottom: 12px;
  }
}

.info-list {
  .info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #f0f0f0;
    
    &:last-child {
      border-bottom: none;
    }
    
    &.address {
      align-items: flex-start;
      
      .value {
        text-align: right;
        line-height: 1.5;
      }
    }
    
    &.verify {
      .verified-badge {
        display: flex;
        align-items: center;
        gap: 4px;
        color: #00b42a;
        font-size: 13px;
      }
    }
    
    .label {
      font-size: 14px;
      color: #86909c;
      flex-shrink: 0;
    }
    
    .value {
      font-size: 14px;
      color: #1d2129;
      text-align: right;
      
      &.code {
        font-family: 'Courier New', monospace;
        font-size: 13px;
      }
    }
  }
}

.license-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  
  .license-item {
    .license-image {
      width: 100%;
      height: 100px;
      border-radius: 6px;
      overflow: hidden;
      margin-bottom: 6px;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
    
    .license-name {
      font-size: 12px;
      color: #4e5969;
      text-align: center;
    }
  }
}
</style>
