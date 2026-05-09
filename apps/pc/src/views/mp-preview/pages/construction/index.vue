<template>
  <div class="mp-page index">
    <div class="page-header">
      <div class="search-bar" @click="showSearchPopup = true">
        <icon-search class="search-icon" />
        <span class="search-placeholder">搜索门店/项目名称或编号</span>
      </div>
    </div>
    
    <div class="quick-entry-section">
      <div class="quick-grid">
        <div class="quick-item" @click="$emit('navigate', 'market')">
          <div class="quick-icon">
            <icon-shopping-cart />
          </div>
          <span class="quick-text">材料采购</span>
        </div>
        <div class="quick-item" @click="$emit('navigate', 'bom-market')">
          <div class="quick-icon">
            <icon-package />
          </div>
          <span class="quick-text">BOM下单</span>
        </div>
        <div class="quick-item" @click="$emit('navigate', 'order')">
          <div class="quick-icon">
            <icon-file-text />
          </div>
          <span class="quick-text">我的订单</span>
        </div>
        <div class="quick-item" @click="$emit('navigate', 'message-center')">
          <div class="quick-icon">
            <icon-bell />
          </div>
          <span class="quick-text">消息通知</span>
        </div>
      </div>
    </div>
    
    <div class="stats-section">
      <div class="stats-card">
        <div class="stats-item">
          <div class="stats-value">{{ stats.inProgress }}</div>
          <div class="stats-label">进行中</div>
        </div>
        <div class="stats-divider"></div>
        <div class="stats-item">
          <div class="stats-value">{{ stats.pending }}</div>
          <div class="stats-label">待验收</div>
        </div>
        <div class="stats-divider"></div>
        <div class="stats-item">
          <div class="stats-value">{{ stats.completed }}</div>
          <div class="stats-label">已完成</div>
        </div>
      </div>
    </div>
    
    <div class="recent-project-section">
      <div class="section-header">
        <span class="section-title">项目列表</span>
        <span class="section-more" @click="$emit('navigate', 'project-list')">查看全部</span>
      </div>
      
      <div class="status-tabs primary">
        <div 
          class="status-tab" 
          :class="{ active: selectedPrimaryStatus === '' }"
          @click="handlePrimaryStatusChange('')"
        >全部</div>
        <div 
          class="status-tab" 
          :class="{ active: selectedPrimaryStatus === 'in-progress' }"
          @click="handlePrimaryStatusChange('in-progress')"
        >进行中</div>
        <div 
          class="status-tab" 
          :class="{ active: selectedPrimaryStatus === 'completed' }"
          @click="handlePrimaryStatusChange('completed')"
        >已完成</div>
        <div 
          class="status-tab" 
          :class="{ active: selectedPrimaryStatus === 'paused' }"
          @click="handlePrimaryStatusChange('paused')"
        >暂停中</div>
        <div 
          class="status-tab" 
          :class="{ active: selectedPrimaryStatus === 'terminated' }"
          @click="handlePrimaryStatusChange('terminated')"
        >已终止</div>
      </div>
      
      <div class="status-tabs secondary" v-if="selectedPrimaryStatus || secondaryStatuses.length > 0">
        <div 
          class="status-tab" 
          :class="{ active: selectedSecondaryStatus === '' }"
          @click="selectedSecondaryStatus = ''"
        >全部子状态</div>
        <div 
          v-for="status in secondaryStatuses" 
          :key="status.value"
          class="status-tab" 
          :class="{ active: selectedSecondaryStatus === status.value }"
          @click="selectedSecondaryStatus = status.value"
        >{{ status.label }}</div>
      </div>
      
      <div class="project-list">
        <div class="project-card" v-for="item in filteredProjects" :key="item.id" @click="handleProjectClick(item)">
          <div class="project-cover">
            <img :src="item.coverImage" :alt="item.storeName" />
            <div class="store-code-badge">{{ item.code }}</div>
          </div>
          <div class="project-info">
            <div class="project-header">
              <div class="store-name">
                <span class="brand-icon" :class="getBrandClass(item.brand)">
                  <svg v-if="getBrandIcon(item.brand) === 'icon-coffee'" class="arco-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 8h1a4 4 0 0 1 0 8h-1"/>
                    <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8"/>
                    <line x1="6" y1="1" x2="6" y2="4"/>
                    <line x1="10" y1="1" x2="10" y2="4"/>
                    <line x1="14" y1="1" x2="14" y2="4"/>
                  </svg>
                  <svg v-else-if="getBrandIcon(item.brand) === 'icon-wine'" class="arco-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 7h-9"/>
                    <path d="M11 20H7a1 1 0 0 1-1-1v-3H5a1 1 0 0 1-1-1v-7a4 4 0 0 1 8 0v10a1 1 0 0 1-1 1h-1"/>
                    <path d="M11 7h6a1 1 0 0 1 1 1v3"/>
                    <path d="M11 11h5"/>
                  </svg>
                  <svg v-else-if="getBrandIcon(item.brand) === 'icon-cup-soda'" class="arco-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M7 21h10"/>
                    <path d="M8 21V5a4 4 0 0 1 8 0v16"/>
                    <path d="M6 8h12"/>
                  </svg>
                  <svg v-else-if="getBrandIcon(item.brand) === 'icon-leaf'" class="arco-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 22c-3.866 0-7-3.134-7-7s3.134-7 7-7 7 3.134 7 7-3.134 7-7 7"/>
                    <path d="M9 12l3-3 3 3"/>
                  </svg>
                  <svg v-else class="arco-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 21h18"/>
                    <path d="M19 21V8a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v13"/>
                    <path d="M9 21V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v16"/>
                  </svg>
                </span>
                {{ item.storeName }}
              </div>
              <div class="project-status-wrap">
                <span class="project-status primary" :class="item.primaryStatus">{{ getPrimaryStatusText(item.primaryStatus) }}</span>
                <span class="project-status secondary" :class="item.secondaryStatus">{{ getSecondaryStatusText(item.secondaryStatus) }}</span>
              </div>
            </div>
            <div class="project-type">{{ item.projectType }}</div>
            <div class="project-meta">
              <span class="meta-item">
                <icon-map-marker />
                {{ item.address }}
              </span>
              <span class="meta-item">{{ item.distance }}</span>
            </div>
            <div class="project-manager">
              <icon-user />
              {{ item.supervisor }}
            </div>
            <div class="project-date">
              <icon-calendar />
              {{ item.createDate }}
            </div>
            <div class="project-progress" v-if="item.status === 'construction'">
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: item.progress + '%' }"></div>
              </div>
              <div class="progress-text">{{ item.progress }}%</div>
            </div>
            <div class="project-actions">
              <div class="action-btn" @click.stop="handleCallSupervisor(item)">
                <icon-phone />
                联系监理
              </div>
              <div class="action-btn primary" @click.stop="handleOrderMaterial(item)">
                <icon-shopping-cart />
                下单
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="search-popup" v-if="showSearchPopup">
      <div class="popup-mask" @click="showSearchPopup = false"></div>
      <div class="popup-content">
        <div class="search-header">
          <div class="search-input-wrap">
            <icon-search class="search-icon" />
            <input 
              v-model="searchKeyword" 
              type="text" 
              placeholder="搜索门店/项目名称或编号" 
              class="search-input"
              autofocus
            />
            <div class="search-clear" v-if="searchKeyword" @click="searchKeyword = ''">
              <icon-close />
            </div>
          </div>
          <div class="search-cancel" @click="showSearchPopup = false">取消</div>
        </div>
        
        <div class="filter-section">
          <div class="filter-row">
            <div class="filter-item" @click="showProvincePicker = true">
              <span class="filter-label">{{ selectedProvince || '省' }}</span>
              <icon-down />
            </div>
            <div class="filter-item" @click="showCityPicker = true">
              <span class="filter-label">{{ selectedCity || '市' }}</span>
              <icon-down />
            </div>
            <div class="filter-item" @click="showDistrictPicker = true">
              <span class="filter-label">{{ selectedDistrict || '区' }}</span>
              <icon-down />
            </div>
          </div>
        </div>
        
        <div class="search-result">
          <div class="result-empty" v-if="!searchKeyword && !selectedProvince">
            <icon-search />
            <span>请输入关键词或选择省市区搜索</span>
          </div>
          <div class="result-list" v-else>
            <div 
              class="result-item" 
              v-for="item in searchResults" 
              :key="item.id"
              @click="handleProjectClick(item)"
            >
              <div class="item-name">{{ item.storeName }}</div>
              <div class="item-brand">{{ item.brand }}</div>
            </div>
            <div class="result-empty" v-if="searchResults.length === 0">
              <span>未找到匹配的项目</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="picker-popup" v-if="showProvincePicker">
      <div class="popup-mask" @click="showProvincePicker = false"></div>
      <div class="picker-content">
        <div class="picker-header">
          <span class="picker-cancel" @click="showProvincePicker = false">取消</span>
          <span class="picker-title">选择省份</span>
          <span class="picker-confirm" @click="handleProvinceConfirm">确定</span>
        </div>
        <div class="picker-body">
          <div 
            class="picker-item" 
            :class="{ active: tempProvince === item }"
            v-for="item in provinces" 
            :key="item"
            @click="tempProvince = item"
          >
            {{ item }}
          </div>
        </div>
      </div>
    </div>
    
    <div class="picker-popup" v-if="showCityPicker">
      <div class="popup-mask" @click="showCityPicker = false"></div>
      <div class="picker-content">
        <div class="picker-header">
          <span class="picker-cancel" @click="showCityPicker = false">取消</span>
          <span class="picker-title">选择城市</span>
          <span class="picker-confirm" @click="handleCityConfirm">确定</span>
        </div>
        <div class="picker-body">
          <div 
            class="picker-item" 
            :class="{ active: tempCity === item }"
            v-for="item in cityList" 
            :key="item"
            @click="tempCity = item"
          >
            {{ item }}
          </div>
        </div>
      </div>
    </div>
    
    <div class="picker-popup" v-if="showDistrictPicker">
      <div class="popup-mask" @click="showDistrictPicker = false"></div>
      <div class="picker-content">
        <div class="picker-header">
          <span class="picker-cancel" @click="showDistrictPicker = false">取消</span>
          <span class="picker-title">选择区县</span>
          <span class="picker-confirm" @click="handleDistrictConfirm">确定</span>
        </div>
        <div class="picker-body">
          <div 
            class="picker-item" 
            :class="{ active: tempDistrict === item }"
            v-for="item in districtList" 
            :key="item"
            @click="tempDistrict = item"
          >
            {{ item }}
          </div>
        </div>
      </div>
    </div>
    
    <div class="detail-modal" v-if="showStoreDetail">
      <div class="modal-mask" @click="showStoreDetail = false"></div>
      <div class="modal-content">
        <div class="modal-header">
          <span class="modal-title">门店信息</span>
          <span class="modal-close" @click="showStoreDetail = false">
            <icon-close />
          </span>
        </div>
        <div class="store-detail-content">
          <div class="detail-row">
            <span class="label">门店名称</span>
            <span class="value">{{ currentStore.name }}</span>
          </div>
          <div class="detail-row">
            <span class="label">门店编码</span>
            <span class="value">{{ currentStore.code }}</span>
          </div>
          <div class="detail-row">
            <span class="label">门店地址</span>
            <span class="value">{{ currentStore.address }}</span>
          </div>
          <div class="detail-row">
            <span class="label">联系电话</span>
            <span class="value">{{ currentStore.phone }}</span>
          </div>
          <div class="detail-row">
            <span class="label">项目经理</span>
            <span class="value">{{ currentStore.manager }}</span>
          </div>
        </div>
        <div class="manager-section">
          <div class="section-title">门店负责人</div>
          <div class="manager-list">
            <div class="manager-item" v-for="m in managers" :key="m.id">
              <div class="manager-info">
                <div class="manager-name">{{ m.name }}</div>
                <div class="manager-phone">{{ m.phone }}</div>
              </div>
              <div class="manager-role">{{ m.role }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="tabbar">
      <div class="tabbar-item active">
        <icon-home />
        <span>工作台</span>
      </div>
      <div class="tabbar-item" @click="$emit('navigate', 'market')">
        <icon-apps />
        <span>商品市场</span>
      </div>
      <div class="tabbar-item" @click="$emit('navigate', 'order')">
        <icon-file />
        <span>我的订单</span>
      </div>
      <div class="tabbar-item" @click="$emit('navigate', 'mine')">
        <icon-user />
        <span>我的</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const emit = defineEmits(['navigate'])

const showSearchPopup = ref(false)
const searchKeyword = ref('')

const stats = ref({
  inProgress: 3,
  pending: 1,
  completed: 5,
})

const showProvincePicker = ref(false)
const showCityPicker = ref(false)
const showDistrictPicker = ref(false)
const selectedProvince = ref('')
const selectedCity = ref('')
const selectedDistrict = ref('')
const selectedPrimaryStatus = ref('')
const selectedSecondaryStatus = ref('')
const tempProvince = ref('')
const tempCity = ref('')
const tempDistrict = ref('')

const primaryStatusMap: Record<string, string> = {
  'in-progress': '进行中',
  'completed': '已完成',
  'paused': '暂停中',
  'terminated': '已终止',
}

const secondaryStatusMap: Record<string, string> = {
  'surveying': '堪场中',
  'finalizing': '定稿中',
  'designing': '设计中',
  'constructing': '施工中',
  'accepting': '验收交付',
  'settling': '工程结算',
  'rectifying': '工程整改',
}

const primaryToSecondaryMap: Record<string, string[]> = {
  'in-progress': ['surveying', 'finalizing', 'designing', 'constructing'],
  'completed': ['accepting', 'settling'],
  'paused': ['surveying', 'finalizing', 'designing', 'constructing', 'accepting'],
  'terminated': ['rectifying'],
}

const secondaryStatuses = computed(() => {
  if (!selectedPrimaryStatus.value) return []
  const statuses = primaryToSecondaryMap[selectedPrimaryStatus.value] || []
  return statuses.map(value => ({
    value,
    label: secondaryStatusMap[value] || value,
  }))
})

function getPrimaryStatusText(status: string) {
  return primaryStatusMap[status] || status
}

function getSecondaryStatusText(status: string) {
  return secondaryStatusMap[status] || status
}

function handlePrimaryStatusChange(status: string) {
  selectedPrimaryStatus.value = status
  selectedSecondaryStatus.value = ''
}

const provinces = ['广东省', '浙江省', '江苏省', '北京市', '上海市', '四川省', '湖北省', '湖南省']
const citiesData: Record<string, string[]> = {
  '广东省': ['深圳市', '广州市', '东莞市', '佛山市', '珠海市'],
  '浙江省': ['杭州市', '宁波市', '温州市', '嘉兴市'],
  '江苏省': ['南京市', '苏州市', '无锡市', '常州市'],
  '北京市': ['北京市'],
  '上海市': ['上海市'],
  '四川省': ['成都市', '绵阳市', '德阳市'],
  '湖北省': ['武汉市', '宜昌市', '襄阳市'],
  '湖南省': ['长沙市', '株洲市', '湘潭市'],
}
const districtsData: Record<string, string[]> = {
  '深圳市': ['罗湖区', '福田区', '南山区', '宝安区', '龙岗区'],
  '广州市': ['天河区', '越秀区', '海珠区', '白云区', '番禺区'],
  '东莞市': ['南城区', '东城区', '莞城区', '万江区'],
  '佛山市': ['禅城区', '南海区', '顺德区', '高明区'],
  '珠海市': ['香洲区', '斗门区', '金湾区'],
  '杭州市': ['西湖区', '上城区', '下城区', '拱墅区', '滨江区'],
  '宁波市': ['海曙区', '江北区', '镇海区', '北仑区'],
  '温州市': ['鹿城区', '龙湾区', '瓯海区'],
  '嘉兴市': ['南湖区', '秀洲区'],
  '南京市': ['玄武区', '秦淮区', '鼓楼区', '建邺区'],
  '苏州市': ['姑苏区', '虎丘区', '吴中区', '相城区'],
  '无锡市': ['梁溪区', '锡山区', '惠山区'],
  '常州市': ['天宁区', '钟楼区', '新北区'],
  '北京市': ['东城区', '西城区', '朝阳区', '海淀区'],
  '上海市': ['黄浦区', '徐汇区', '长宁区', '静安区'],
  '成都市': ['锦江区', '青羊区', '金牛区', '武侯区'],
  '绵阳市': ['涪城区', '游仙区', '安州区'],
  '德阳市': ['旌阳区', '罗江区'],
  '武汉市': ['江岸区', '江汉区', '汉阳区', '武昌区'],
  '宜昌市': ['西陵区', '伍家岗区', '点军区'],
  '襄阳市': ['襄城区', '樊城区', '襄州区'],
  '长沙市': ['芙蓉区', '天心区', '岳麓区', '开福区'],
  '株洲市': ['天元区', '芦淞区', '石峰区'],
  '湘潭市': ['雨湖区', '岳塘区'],
}

const cityList = computed(() => {
  if (!tempProvince.value) return []
  return citiesData[tempProvince.value] || []
})

const districtList = computed(() => {
  if (!tempCity.value) return []
  return districtsData[tempCity.value] || []
})

const brandIcons: Record<string, string> = {
  '星巴克': 'icon-coffee',
  '喜茶': 'icon-wine',
  '瑞幸咖啡': 'icon-cup-soda',
  '奈雪的茶': 'icon-leaf',
}

const brandColors: Record<string, string> = {
  '星巴克': 'brand-starbucks',
  '喜茶': 'brand-heytea',
  '瑞幸咖啡': 'brand-luckin',
  '奈雪的茶': 'brand-naixue',
}

function getBrandIcon(brand: string) {
  return brandIcons[brand] || 'icon-store'
}

function getBrandClass(brand: string) {
  return brandColors[brand] || 'brand-default'
}

const recentProjects = ref([
  {
    id: 1,
    storeName: '星巴克深圳万象城店',
    brand: '星巴克',
    brandLogo: 'https://picsum.photos/40/40?random=1',
    coverImage: 'https://picsum.photos/300/200?random=101',
    code: 'CD001',
    projectType: '标准店装修',
    address: '广东省深圳市罗湖区宝安南路1881号',
    distance: '2.3km',
    primaryStatus: 'in-progress',
    secondaryStatus: 'surveying',
    supervisor: '张三',
    supervisorPhone: '13800138001',
    createDate: '2024-03-15',
    progress: 15,
  },
  {
    id: 2,
    storeName: '喜茶广州天河城店',
    brand: '喜茶',
    brandLogo: 'https://picsum.photos/40/40?random=2',
    coverImage: 'https://picsum.photos/300/200?random=102',
    code: 'CD002',
    projectType: '旗舰店装修',
    address: '广东省广州市天河区天河路208号',
    distance: '5.6km',
    primaryStatus: 'in-progress',
    secondaryStatus: 'finalizing',
    supervisor: '李四',
    supervisorPhone: '13800138002',
    createDate: '2024-03-12',
    progress: 25,
  },
  {
    id: 3,
    storeName: '瑞幸咖啡东莞万达店',
    brand: '瑞幸咖啡',
    brandLogo: 'https://picsum.photos/40/40?random=3',
    coverImage: 'https://picsum.photos/300/200?random=103',
    code: 'CD003',
    projectType: '标准店装修',
    address: '广东省东莞市南城区鸿福路199号',
    distance: '8.9km',
    primaryStatus: 'in-progress',
    secondaryStatus: 'constructing',
    supervisor: '王五',
    supervisorPhone: '13800138003',
    createDate: '2024-03-08',
    progress: 57,
  },
  {
    id: 4,
    storeName: '奈雪的茶佛山顺联店',
    brand: '奈雪的茶',
    brandLogo: 'https://picsum.photos/40/40?random=4',
    coverImage: 'https://picsum.photos/300/200?random=104',
    code: 'CD004',
    projectType: '标准店装修',
    address: '广东省佛山市顺德区乐从大道东B270号',
    distance: '12.1km',
    primaryStatus: 'completed',
    secondaryStatus: 'settling',
    supervisor: '赵六',
    supervisorPhone: '13800138004',
    createDate: '2024-02-20',
    progress: 100,
  },
])

const filteredProjects = computed(() => {
  let projects = recentProjects.value
  if (selectedPrimaryStatus.value) {
    projects = projects.filter(item => item.primaryStatus === selectedPrimaryStatus.value)
  }
  if (selectedSecondaryStatus.value) {
    projects = projects.filter(item => item.secondaryStatus === selectedSecondaryStatus.value)
  }
  return projects
})

const searchResults = computed(() => {
  if (!searchKeyword.value && !selectedProvince.value) return []
  return recentProjects.value.filter(item => {
    const matchKeyword = !searchKeyword.value || 
      item.storeName.includes(searchKeyword.value) || 
      item.brand.includes(searchKeyword.value)
    const matchProvince = !selectedProvince.value || item.address.includes(selectedProvince.value)
    return matchKeyword && matchProvince
  })
})

function handleProvinceConfirm() {
  selectedProvince.value = tempProvince.value
  selectedCity.value = ''
  selectedDistrict.value = ''
  tempCity.value = ''
  tempDistrict.value = ''
  showProvincePicker.value = false
}

function handleCityConfirm() {
  selectedCity.value = tempCity.value
  selectedDistrict.value = ''
  tempDistrict.value = ''
  showCityPicker.value = false
}

function handleDistrictConfirm() {
  selectedDistrict.value = tempDistrict.value
  showDistrictPicker.value = false
}

function handleProjectClick(item: any) {
  showSearchPopup.value = false
  emit('navigate', 'project-detail', { projectId: item.id })
}

function handleCallSupervisor(item: any) {
  alert(`拨打监理电话: ${item.supervisorPhone}`)
}

function handleOrderMaterial(item: any) {
  emit('navigate', 'market', { projectId: item.id })
}
</script>

<style lang="scss" scoped>
.index {
  background: #f5f5f5;
  min-height: 100%;
  padding-bottom: 60px;
}

.page-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: linear-gradient(135deg, #165dff, #4080ff);
  padding: 10px 16px;
  z-index: 100;
  
  .search-bar {
    display: flex;
    align-items: center;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 20px;
    padding: 0 14px;
    height: 36px;
    
    .search-icon {
      color: #86909c;
      font-size: 16px;
      margin-right: 8px;
    }
    
    .search-placeholder {
      font-size: 14px;
      color: #86909c;
    }
  }
}

.quick-entry-section {
  padding: 60px 12px 12px;
  
  .quick-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
  }
  
  .quick-item {
    background: #fff;
    border-radius: 12px;
    padding: 16px 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    
    .quick-icon {
      width: 44px;
      height: 44px;
      background: linear-gradient(135deg, #165dff, #4080ff);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 20px;
    }
    
    .quick-text {
      font-size: 12px;
      color: #4e5969;
    }
  }
}

.stats-section {
  padding: 0 12px 12px;
  
  .stats-card {
    background: linear-gradient(135deg, #165dff, #4080ff);
    border-radius: 12px;
    padding: 20px 16px;
    display: flex;
    align-items: center;
    
    .stats-item {
      flex: 1;
      text-align: center;
      
      .stats-value {
        font-size: 28px;
        font-weight: 700;
        color: #fff;
        margin-bottom: 4px;
      }
      
      .stats-label {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.8);
      }
    }
    
    .stats-divider {
      width: 1px;
      height: 40px;
      background: rgba(255, 255, 255, 0.3);
    }
  }
}

.recent-project-section {
  padding: 0 12px 12px;
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    
    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: #1d2129;
    }
    
    .section-more {
      font-size: 13px;
      color: #165dff;
    }
  }
  
  .status-tabs {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
    overflow-x: auto;
    padding-bottom: 4px;
    
    &::-webkit-scrollbar {
      display: none;
    }
    
    .status-tab {
      flex-shrink: 0;
      padding: 6px 14px;
      font-size: 12px;
      color: #86909c;
      background: #f7f8fa;
      border-radius: 16px;
      transition: all 0.2s;
      
      &.active {
        background: linear-gradient(135deg, #165dff, #4080ff);
        color: #fff;
      }
    }
  }
  
  .project-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    
    .project-card {
      background: #fff;
      border-radius: 12px;
      overflow: hidden;
      
      .project-cover {
        position: relative;
        height: 120px;
        
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .store-code-badge {
          position: absolute;
          top: 8px;
          left: 8px;
          background: rgba(0, 0, 0, 0.5);
          color: #fff;
          font-size: 11px;
          padding: 3px 8px;
          border-radius: 10px;
        }
      }
      
      .project-info {
        padding: 12px;
        
        .project-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 6px;
          
          .store-name {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 15px;
            font-weight: 600;
            color: #1d2129;
            flex: 1;
            
            .brand-icon {
              width: 20px;
              height: 20px;
              border-radius: 4px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 12px;
              
              &.brand-starbucks {
                background: #006241;
                color: #fff;
              }
              
              &.brand-heytea {
                background: linear-gradient(135deg, #ff3149, #ff7d00);
                color: #fff;
              }
              
              &.brand-luckin {
                background: #00b056;
                color: #fff;
              }
              
              &.brand-naixue {
                background: #00c48c;
                color: #fff;
              }
              
              &.brand-default {
                background: #e8f3ff;
                color: #165dff;
              }
            }
          }
          
          .project-status-wrap {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 3px;
          }
          
          .project-status {
            font-size: 10px;
            padding: 2px 6px;
            border-radius: 8px;
            
            &.primary {
              background: #f7f8fa;
              color: #86909c;
              
              &.in-progress {
                background: #e8ffea;
                color: #00b42a;
              }
              
              &.completed {
                background: #f7f8fa;
                color: #86909c;
              }
              
              &.paused {
                background: #fff7e8;
                color: #ff7d00;
              }
              
              &.terminated {
                background: #fff1f0;
                color: #ff4d4f;
              }
            }
            
            &.secondary {
              background: #f0f5ff;
              color: #165dff;
              font-size: 9px;
              
              &.surveying {
                background: #fff7e8;
                color: #ff7d00;
              }
              
              &.finalizing {
                background: #e8f3ff;
                color: #165dff;
              }
              
              &.designing {
                background: #f3e8ff;
                color: #722ed1;
              }
              
              &.constructing {
                background: #e8ffea;
                color: #00b42a;
              }
              
              &.accepting {
                background: #fff7e8;
                color: #ff7d00;
              }
              
              &.settling {
                background: #f7f8fa;
                color: #86909c;
              }
              
              &.rectifying {
                background: #fff1f0;
                color: #ff4d4f;
              }
            }
          }
        }
        
        .project-type {
          font-size: 12px;
          color: #86909c;
          margin-bottom: 8px;
        }
        
        .project-meta {
          display: flex;
          gap: 12px;
          margin-bottom: 6px;
          
          .meta-item {
            display: flex;
            align-items: center;
            gap: 4px;
            font-size: 12px;
            color: #4e5969;
          }
        }
        
        .project-manager,
        .project-date {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: #86909c;
          margin-bottom: 4px;
        }
        
        .project-progress {
          margin-top: 8px;
          margin-bottom: 10px;
          
          .progress-bar {
            height: 6px;
            background: #f2f3f5;
            border-radius: 3px;
            overflow: hidden;
            
            .progress-fill {
              height: 100%;
              background: linear-gradient(90deg, #165dff, #4080ff);
              border-radius: 3px;
              transition: width 0.3s;
            }
          }
          
          .progress-text {
            font-size: 11px;
            color: #165dff;
            margin-top: 4px;
            text-align: right;
          }
        }
        
        .project-actions {
          display: flex;
          gap: 10px;
          margin-top: 10px;
          padding-top: 10px;
          border-top: 1px solid #f2f3f5;
          
          .action-btn {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 4px;
            padding: 8px;
            font-size: 13px;
            color: #4e5969;
            background: #f7f8fa;
            border-radius: 8px;
            
            &.primary {
              background: linear-gradient(135deg, #165dff, #4080ff);
              color: #fff;
            }
          }
        }
      }
    }
  }
}
</style>
