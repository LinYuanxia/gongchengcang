<template>
  <div class="warehouse-list">
    <a-card>
      <template #extra>
        <a-button type="primary" @click="handleAdd">
          <template #icon><icon-plus /></template>
          新增仓库
        </a-button>
      </template>

      <a-table :data="warehouses" :pagination="pagination">
        <template #columns>
          <a-table-column title="仓库名称" data-index="name" :width="180" />
          <a-table-column title="仓库编码" data-index="code" :width="120" />
          <a-table-column title="仓库类型" :width="100">
            <template #cell="{ record }">
              <a-tag :color="record.type === 'main' ? 'blue' : 'green'">
                {{ record.type === 'main' ? '主仓' : '分仓' }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="覆盖范围" :width="200">
            <template #cell="{ record }">
              <template v-if="record.coverageType === 'city'">
                <icon-location /> {{ record.coverageNames?.join('、') || '-' }}
              </template>
              <template v-else-if="record.coverageType === 'brand'">
                <icon-apps /> {{ record.coverageNames?.join('、') || '-' }}
              </template>
              <template v-else-if="record.coverageType === 'store'">
                <icon-shop /> {{ record.coverageNames?.join('、') || '-' }}
              </template>
              <template v-else>-</template>
            </template>
          </a-table-column>
          <a-table-column title="负责人" data-index="managerName" :width="100" />
          <a-table-column title="联系电话" data-index="phone" :width="130" />
          <a-table-column title="地址" data-index="address" :width="250" />
          <a-table-column title="库存容量" :width="100" align="right">
            <template #cell="{ record }">
              {{ record.usedCapacity }} / {{ record.totalCapacity }}
            </template>
          </a-table-column>
          <a-table-column title="状态" :width="100">
            <template #cell="{ record }">
              <a-tag :color="record.status === 'active' ? 'green' : 'red'">
                {{ record.status === 'active' ? '启用' : '停用' }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="操作" :width="150" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-link @click="handleEdit(record)">编辑</a-link>
                <a-link @click="handleViewStock(record)">库存</a-link>
                <a-popconfirm content="确定要删除该仓库吗？" @ok="handleDelete(record)">
                  <a-link status="danger">删除</a-link>
                </a-popconfirm>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <a-modal v-model:visible="modalVisible" :title="isEdit ? '编辑仓库' : '新增仓库'" :width="600" @ok="handleSubmit">
      <a-form :model="form" layout="vertical">
        <a-form-item label="仓库名称" required>
          <a-input v-model="form.name" placeholder="请输入仓库名称" />
        </a-form-item>
        <a-form-item label="仓库类型" required>
          <a-radio-group v-model="form.type">
            <a-radio value="main">主仓</a-radio>
            <a-radio value="sub">分仓</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="覆盖范围类型" required>
          <a-radio-group v-model="form.coverageType" @change="handleCoverageTypeChange">
            <a-radio value="city">
              <icon-location /> 覆盖城市
            </a-radio>
            <a-radio value="brand">
              <icon-apps /> 覆盖品牌
            </a-radio>
            <a-radio value="store">
              <icon-shop /> 覆盖门店
            </a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="选择覆盖范围" required v-if="form.coverageType">
          <a-select 
            v-model="form.coverageIds" 
            multiple 
            :placeholder="getCoveragePlaceholder"
            allow-search
            allow-clear
            :max-tag-count="3"
          >
            <a-option v-if="form.coverageType === 'brand'" value="all">
              <span style="font-weight: 500;">全部品牌</span>
            </a-option>
            <a-option v-for="item in coverageOptions" :key="item.id" :value="item.id">
              {{ item.name }}
            </a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="负责人" required>
          <a-select 
            v-model="form.managerId" 
            placeholder="请选择负责人"
            allow-search
            @change="handleManagerChange"
          >
            <a-option v-for="item in accountList" :key="item.id" :value="item.id">
              {{ item.name }} ({{ item.phone }})
            </a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="联系电话">
          <a-input v-model="form.phone" placeholder="自动带出负责人电话" disabled />
        </a-form-item>
        <a-form-item label="库存容量">
          <a-input-number v-model="form.totalCapacity" :min="0" placeholder="请输入库存容量" style="width: 100%">
            <template #suffix>立方米</template>
          </a-input-number>
        </a-form-item>
        <a-form-item label="详细地址" required>
          <a-textarea v-model="form.address" placeholder="请输入详细地址" :max-length="200" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Message } from '@arco-design/web-vue'

const modalVisible = ref(false)
const isEdit = ref(false)

const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 20,
})

const form = ref({
  name: '',
  code: '',
  type: 'sub',
  coverageType: '',
  coverageIds: [] as string[],
  managerId: '',
  managerName: '',
  phone: '',
  address: '',
  totalCapacity: 0,
})

const accountList = ref([
  { id: 'acc1', name: '张三', phone: '13800138001' },
  { id: 'acc2', name: '李四', phone: '13800138002' },
  { id: 'acc3', name: '王五', phone: '13800138003' },
  { id: 'acc4', name: '赵六', phone: '13800138004' },
  { id: 'acc5', name: '钱七', phone: '13800138005' },
])

const cityOptions = ref([
  { id: 'sz', name: '深圳市' },
  { id: 'gz', name: '广州市' },
  { id: 'dg', name: '东莞市' },
  { id: 'fs', name: '佛山市' },
  { id: 'zh', name: '珠海市' },
  { id: 'hz', name: '惠州市' },
])

const brandOptions = ref([
  { id: 'zhaoYiMing', name: '赵一鸣' },
  { id: 'lingShiHenMang', name: '零食很忙' },
])

const storeOptions = ref([
  { id: 'store1', name: '深圳湾科技园店' },
  { id: 'store2', name: '福田CBD店' },
  { id: 'store3', name: '宝安机场店' },
  { id: 'store4', name: '南山科技园店' },
])

const coverageOptions = computed(() => {
  switch (form.value.coverageType) {
    case 'city':
      return cityOptions.value
    case 'brand':
      return brandOptions.value
    case 'store':
      return storeOptions.value
    default:
      return []
  }
})

const getCoveragePlaceholder = computed(() => {
  switch (form.value.coverageType) {
    case 'city':
      return '请选择覆盖城市'
    case 'brand':
      return '请选择覆盖品牌（支持多选、全部）'
    case 'store':
      return '请选择覆盖门店'
    default:
      return '请选择覆盖范围'
  }
})

const warehouses = ref([
  { id: '1', name: '深圳湾科技园主仓', code: 'WH001', type: 'main', coverageType: 'city', coverageNames: ['深圳市'], managerId: 'acc1', managerName: '张三', phone: '13800138001', address: '广东省深圳市南山区科技园南区', usedCapacity: 1200, totalCapacity: 2000, status: 'active' },
  { id: '2', name: '福田CBD分仓', code: 'WH002', type: 'sub', coverageType: 'brand', coverageNames: ['赵一鸣', '零食很忙'], managerId: 'acc2', managerName: '李四', phone: '13800138002', address: '广东省深圳市福田区CBD中心区', usedCapacity: 300, totalCapacity: 800, status: 'active' },
  { id: '3', name: '宝安机场分仓', code: 'WH003', type: 'sub', coverageType: 'store', coverageNames: ['深圳湾科技园店', '福田CBD店'], managerId: 'acc3', managerName: '王五', phone: '13800138003', address: '广东省深圳市宝安区机场附近', usedCapacity: 0, totalCapacity: 500, status: 'inactive' },
])

function handleCoverageTypeChange() {
  form.value.coverageIds = []
}

function handleManagerChange(managerId: string) {
  const account = accountList.value.find(a => a.id === managerId)
  if (account) {
    form.value.managerName = account.name
    form.value.phone = account.phone
  }
}

function handleAdd() {
  isEdit.value = false
  form.value = {
    name: '',
    code: '',
    type: 'sub',
    coverageType: '',
    coverageIds: [],
    managerId: '',
    managerName: '',
    phone: '',
    address: '',
    totalCapacity: 0,
  }
  modalVisible.value = true
}

function handleEdit(record: any) {
  isEdit.value = true
  form.value = { ...record, coverageIds: record.coverageIds || [] }
  modalVisible.value = true
}

function handleSubmit() {
  Message.success(isEdit.value ? '编辑成功' : '新增成功')
  modalVisible.value = false
}

function handleViewStock(record: any) {
  Message.info(`查看仓库库存：${record.name}`)
}

function handleDelete(record: any) {
  Message.success(`删除仓库：${record.name}`)
}
</script>

<style scoped lang="less">
.warehouse-list {
  padding: 16px;
}
</style>
