<template>
  <div class="invoice-title-list">
    <a-card>
      <template #extra>
        <a-space>
          <a-input-search
            v-model="searchForm.keyword"
            placeholder="搜索抬头名称/纳税人识别号"
            style="width: 280px"
            @search="handleSearch"
          />
          <a-button type="primary" @click="handleAddTitle">
            <template #icon><icon-plus /></template>
            新增抬头
          </a-button>
        </a-space>
      </template>

      <a-table
        :data="titleList"
        :loading="loading"
        :pagination="false"
        row-key="id"
      >
        <template #columns>
          <a-table-column title="序号" :width="60">
            <template #cell="{ index }">{{ index + 1 }}</template>
          </a-table-column>
          <a-table-column title="抬头名称" :width="200">
            <template #cell="{ record }">
              <span class="title-name">{{ record.titleName }}</span>
              <a-tag v-if="record.isDefault" color="green" style="margin-left: 8px">默认</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="纳税人识别号" :width="180" data-index="taxNumber" />
          <a-table-column title="地址电话" :width="200" data-index="addressPhone" />
          <a-table-column title="开户行及账号" :width="220" data-index="bankAccount" />
          <a-table-column title="创建时间" :width="180" data-index="createTime" />
          <a-table-column title="操作" :width="180" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-button type="text" size="small" @click="handleEditTitle(record)">编辑</a-button>
                <a-button
                  v-if="!record.isDefault"
                  type="text" size="small"
                  @click="handleSetDefault(record)">设为默认</a-button>
                <a-button
                  v-if="!record.isDefault"
                  type="text" size="small" status="danger"
                  @click="handleDelete(record)">删除</a-button>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>

      <a-empty v-if="titleList.length === 0 && !loading">
        <template #description>暂无发票抬头，请点击右上角按钮新增</template>
      </a-empty>
    </a-card>

    <a-modal
      v-model:visible="titleFormVisible"
      :title="editingTitleId ? '编辑发票抬头' : '新增发票抬头'"
      :width="520"
      @ok="handleSaveTitle"
      :ok-loading="titleSaving"
    >
      <a-form :model="titleForm" layout="vertical">
        <a-form-item label="抬头名称" required>
          <a-input v-model="titleForm.titleName" placeholder="请输入单位名称" />
        </a-form-item>
        <a-form-item label="纳税人识别号" required>
          <a-input v-model="titleForm.taxNumber" placeholder="请输入纳税人识别号" />
        </a-form-item>
        <a-form-item label="地址电话">
          <a-input v-model="titleForm.addressPhone" placeholder="请输入地址和电话" />
        </a-form-item>
        <a-form-item label="开户行及账号">
          <a-input v-model="titleForm.bankAccount" placeholder="请输入开户行及账号" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconPlus } from '@arco-design/web-vue/es/icon'

interface InvoiceTitle {
  id: string
  titleName: string
  taxNumber: string
  addressPhone: string
  bankAccount: string
  isDefault: boolean
  createTime: string
}

const loading = ref(false)
const titleList = ref<InvoiceTitle[]>([
  {
    id: '1',
    titleName: '深圳湾科技园仓储有限公司',
    taxNumber: '91440300MA5H4Y5G6M',
    addressPhone: '深圳市南山区科技园路99号 / 0755-99999999',
    bankAccount: '中国农业银行深圳南山支行 / 6228003320001234567',
    isDefault: true,
    createTime: '2024-12-01 10:30:00',
  },
  {
    id: '2',
    titleName: '深圳市工程仓供应链管理有限公司',
    taxNumber: '91440300MA5H4Y5G6N',
    addressPhone: '深圳市福田区福华路88号 / 0755-77777777',
    bankAccount: '中国建设银行深圳福田支行 / 6227004420001234567',
    isDefault: false,
    createTime: '2024-12-10 14:20:00',
  },
])

const titleFormVisible = ref(false)
const editingTitleId = ref<string | null>(null)
const titleSaving = ref(false)

const searchForm = reactive({
  keyword: '',
})

const titleForm = reactive({
  titleName: '',
  taxNumber: '',
  addressPhone: '',
  bankAccount: '',
})

const filteredList = ref<InvoiceTitle[]>([...titleList.value])

const handleSearch = () => {
  const keyword = searchForm.keyword.trim().toLowerCase()
  if (!keyword) {
    filteredList.value = [...titleList.value]
    return
  }
  filteredList.value = titleList.value.filter(
    (item) =>
      item.titleName.toLowerCase().includes(keyword) ||
      item.taxNumber.toLowerCase().includes(keyword)
  )
}

const handleAddTitle = () => {
  editingTitleId.value = null
  titleForm.titleName = ''
  titleForm.taxNumber = ''
  titleForm.addressPhone = ''
  titleForm.bankAccount = ''
  titleFormVisible.value = true
}

const handleEditTitle = (record: InvoiceTitle) => {
  editingTitleId.value = record.id
  titleForm.titleName = record.titleName
  titleForm.taxNumber = record.taxNumber
  titleForm.addressPhone = record.addressPhone
  titleForm.bankAccount = record.bankAccount
  titleFormVisible.value = true
}

const handleSaveTitle = async () => {
  if (!titleForm.titleName.trim()) {
    Message.error('请输入抬头名称')
    return
  }
  if (!titleForm.taxNumber.trim()) {
    Message.error('请输入纳税人识别号')
    return
  }

  titleSaving.value = true
  await new Promise((resolve) => setTimeout(resolve, 500))

  if (editingTitleId.value) {
    const index = titleList.value.findIndex((item) => item.id === editingTitleId.value)
    if (index !== -1) {
      titleList.value[index] = {
        ...titleList.value[index],
        titleName: titleForm.titleName,
        taxNumber: titleForm.taxNumber,
        addressPhone: titleForm.addressPhone,
        bankAccount: titleForm.bankAccount,
      }
    }
    Message.success('编辑成功')
  } else {
    const newTitle: InvoiceTitle = {
      id: Date.now().toString(),
      titleName: titleForm.titleName,
      taxNumber: titleForm.taxNumber,
      addressPhone: titleForm.addressPhone,
      bankAccount: titleForm.bankAccount,
      isDefault: titleList.value.length === 0,
      createTime: new Date().toLocaleString('zh-CN'),
    }
    titleList.value.unshift(newTitle)
    Message.success('新增成功')
  }

  handleSearch()
  titleSaving.value = false
  titleFormVisible.value = false
}

const handleSetDefault = async (record: InvoiceTitle) => {
  loading.value = true
  await new Promise((resolve) => setTimeout(resolve, 300))

  titleList.value.forEach((item) => {
    item.isDefault = item.id === record.id
  })
  handleSearch()
  loading.value = false
  Message.success('已设为默认抬头')
}

const handleDelete = (record: InvoiceTitle) => {
  if (record.isDefault) {
    Message.error('默认抬头不能删除')
    return
  }

  if (titleList.value.length <= 1) {
    Message.error('至少保留一个发票抬头')
    return
  }

  const index = titleList.value.findIndex((item) => item.id === record.id)
  if (index !== -1) {
    titleList.value.splice(index, 1)
    handleSearch()
    Message.success('删除成功')
  }
}
</script>

<style scoped>
.invoice-title-list {
  padding: 16px;
}

.title-name {
  font-weight: 500;
}
</style>
