<template>
  <div class="page-container">
    <a-tabs default-active-key="basic" type="rounded">
      <a-tab-pane key="basic" title="基本信息">
        <a-descriptions title="基础信息" :column="2" bordered>
          <a-descriptions-item label="供应商ID">SUP001</a-descriptions-item>
          <a-descriptions-item label="供应商类型">
            <a-tag color="blue">材料供应商</a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="供应商名称">宝钢集团有限公司</a-descriptions-item>
          <a-descriptions-item label="联系人">张经理</a-descriptions-item>
          <a-descriptions-item label="联系电话">138-0000-0001</a-descriptions-item>
          <a-descriptions-item label="联系邮箱">zhang@baosteel.com</a-descriptions-item>
          <a-descriptions-item label="入驻状态">
            <a-tag color="green">已认证</a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="启用状态">
            <a-tag color="green">正常</a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="创建时间">2024-01-01 10:00:00</a-descriptions-item>
          <a-descriptions-item label="入驻时间">2024-01-01 10:00:00</a-descriptions-item>
          <a-descriptions-item label="备注" :span="2">优质钢材供应商，长期合作</a-descriptions-item>
        </a-descriptions>

        <a-descriptions title="主体信息" :column="2" bordered class="mt-16">
          <a-descriptions-item label="企业名称">宝钢集团有限公司</a-descriptions-item>
          <a-descriptions-item label="企业类型">有限责任公司</a-descriptions-item>
          <a-descriptions-item label="统一社会信用代码">91310000132200X</a-descriptions-item>
          <a-descriptions-item label="纳税人类型">一般纳税人</a-descriptions-item>
          <a-descriptions-item label="法定代表人">陈德荣</a-descriptions-item>
          <a-descriptions-item label="法人身份证号">310***********1234</a-descriptions-item>
          <a-descriptions-item label="营业执照">
            <a-image src="https://via.placeholder.com/200" width="80" height="80" fit="cover" />
          </a-descriptions-item>
          <a-descriptions-item label="营业执照有效期">2020-01-01 至 2050-01-01</a-descriptions-item>
          <a-descriptions-item label="身份证正面">
            <a-image src="https://via.placeholder.com/200" width="80" height="50" fit="cover" />
          </a-descriptions-item>
          <a-descriptions-item label="身份证反面">
            <a-image src="https://via.placeholder.com/200" width="80" height="50" fit="cover" />
          </a-descriptions-item>
          <a-descriptions-item label="注册地址">上海市宝山区富锦路88号</a-descriptions-item>
          <a-descriptions-item label="实际经营地址">上海市宝山区富锦路88号</a-descriptions-item>
          <a-descriptions-item label="注册资本">500000 万元</a-descriptions-item>
          <a-descriptions-item label="成立日期">1998-11-17</a-descriptions-item>
          <a-descriptions-item label="经营范围" :span="2">
            钢材、金属材料、建筑材料、金属制品的生产、销售；货物进出口；技术进出口；普通货运；仓储服务（除危险化学品及专项规定）；装卸服务；商务信息咨询；会展服务；物业管理；从事货物及技术的进出口业务。
          </a-descriptions-item>
        </a-descriptions>

        <a-descriptions title="结算账户" :column="2" bordered class="mt-16">
          <a-descriptions-item label="账户名称">宝钢集团有限公司</a-descriptions-item>
          <a-descriptions-item label="银行账号">1001 2345 6789 0123 456</a-descriptions-item>
          <a-descriptions-item label="开户银行">中国工商银行</a-descriptions-item>
          <a-descriptions-item label="支行信息">上海宝山支行</a-descriptions-item>
          <a-descriptions-item label="联行号">102290020123</a-descriptions-item>
          <a-descriptions-item label="纳税人识别号">91310000132200X</a-descriptions-item>
          <a-descriptions-item label="账户状态">
            <a-tag color="green">已验证</a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="验证时间">2024-01-05 14:30:00</a-descriptions-item>
        </a-descriptions>

        <div class="section-title mt-16">
          <span>合同信息</span>
          <a-button type="text" size="small" @click="router.push('/supplier/merchant/contract')">
            查看全部 <icon-right />
          </a-button>
        </div>
        <a-table :data="contracts" :pagination="false" size="small" class="mt-8">
          <template #columns>
            <a-table-column title="合同编号" data-index="contractNo" :width="140" />
            <a-table-column title="合同名称" data-index="contractName" :width="180" />
            <a-table-column title="合同类型" :width="100">
              <template #cell="{ record }">
                <a-tag :color="getContractTypeColor(record.contractType)">
                  {{ getContractTypeText(record.contractType) }}
                </a-tag>
              </template>
            </a-table-column>
            <a-table-column title="签署日期" data-index="signDate" :width="120" />
            <a-table-column title="有效期" :width="200">
              <template #cell="{ record }">
                {{ record.startDate }} 至 {{ record.endDate }}
              </template>
            </a-table-column>
            <a-table-column title="状态" :width="100">
              <template #cell="{ record }">
                <a-tag :color="getStatusColor(record.status)">
                  {{ getStatusText(record.status) }}
                </a-tag>
              </template>
            </a-table-column>
          </template>
        </a-table>

        <div class="section-title mt-16">
          <span>资质信息</span>
          <a-button type="primary" size="small" @click="handleAddQualification">
            <template #icon><icon-plus /></template>
            添加资质
          </a-button>
        </div>
        <a-table :data="qualifications" :pagination="false" size="small" class="mt-8">
          <template #columns>
            <a-table-column title="资质名称" data-index="qualName" :width="150" />
            <a-table-column title="证书编号" data-index="certNo" :width="180" />
            <a-table-column title="发证日期" data-index="issueDate" :width="120" />
            <a-table-column title="有效期" :width="200">
              <template #cell="{ record }">
                {{ record.issueDate }} 至 {{ record.expireDate || '长期' }}
              </template>
            </a-table-column>
            <a-table-column title="状态" :width="100">
              <template #cell="{ record }">
                <a-tag :color="record.status === 'valid' ? 'green' : 'red'">
                  {{ record.status === 'valid' ? '有效' : '已过期' }}
                </a-tag>
              </template>
            </a-table-column>
            <a-table-column title="附件" :width="80">
              <template #cell="{ record }">
                <a-button type="text" size="small" @click="handleViewFile(record)">查看</a-button>
              </template>
            </a-table-column>
            <a-table-column title="操作" :width="80">
              <template #cell="{ record }">
                <a-button type="text" size="small" status="danger" @click="handleDeleteQualification(record)">删除</a-button>
              </template>
            </a-table-column>
          </template>
        </a-table>
      </a-tab-pane>

      <a-tab-pane key="custody" title="托管账户">
        <a-descriptions title="账户信息" :column="2" bordered>
          <a-descriptions-item label="账户ID">8888000001234567</a-descriptions-item>
          <a-descriptions-item label="账户状态">
            <a-tag color="green">正常</a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="开户状态">
            <a-tag color="green">已开户</a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="开户时间">2024-01-15 10:30:00</a-descriptions-item>
          <a-descriptions-item label="绑卡状态">
            <a-tag color="green">已绑卡</a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="绑卡时间">2024-01-15 11:00:00</a-descriptions-item>
        </a-descriptions>

        <a-descriptions title="资金信息" :column="3" bordered class="mt-16">
          <a-descriptions-item label="可用余额">
            <span class="money">¥120,680.50</span>
          </a-descriptions-item>
          <a-descriptions-item label="冻结余额">
            <span class="money frozen">¥5,000.00</span>
          </a-descriptions-item>
          <a-descriptions-item label="总余额">
            <span class="money total">¥125,680.50</span>
          </a-descriptions-item>
        </a-descriptions>

        <div class="section-title mt-16">
          <span>绑卡记录</span>
          <a-button type="primary" size="small" @click="handleBindCard">
            <template #icon><icon-plus /></template>
            绑定银行卡
          </a-button>
        </div>
        <a-table :data="bankCards" :pagination="false" size="small" class="mt-8">
          <template #columns>
            <a-table-column title="银行名称" data-index="bankName" :width="150" />
            <a-table-column title="银行账号" :width="180">
              <template #cell="{ record }">
                {{ record.bankAccountMasked }}
              </template>
            </a-table-column>
            <a-table-column title="卡类型" :width="100">
              <template #cell="{ record }">
                <a-tag :color="record.cardType === 'debit' ? 'blue' : 'orange'">
                  {{ record.cardType === 'debit' ? '借记卡' : '信用卡' }}
                </a-tag>
              </template>
            </a-table-column>
            <a-table-column title="绑定状态" :width="100">
              <template #cell="{ record }">
                <a-tag :color="record.bindStatus === 'bound' ? 'green' : 'orange'">
                  {{ record.bindStatus === 'bound' ? '已绑定' : '绑定中' }}
                </a-tag>
              </template>
            </a-table-column>
            <a-table-column title="绑定时间" data-index="bindTime" :width="180" />
            <a-table-column title="默认" :width="80">
              <template #cell="{ record }">
                <a-tag v-if="record.isDefault" color="blue">默认</a-tag>
              </template>
            </a-table-column>
            <a-table-column title="操作" :width="100">
              <template #cell="{ record }">
                <a-button type="text" size="small" @click="handleSetDefault(record)" v-if="!record.isDefault">设为默认</a-button>
              </template>
            </a-table-column>
          </template>
        </a-table>

        <div class="section-title mt-16">
          <span>开户记录</span>
        </div>
        <a-table :data="openRecords" :pagination="false" size="small" class="mt-8">
          <template #columns>
            <a-table-column title="申请类型" :width="120">
              <template #cell="{ record }">
                <a-tag :color="record.applyType === 'open' ? 'blue' : 'orange'">
                  {{ record.applyType === 'open' ? '开户' : '变更' }}
                </a-tag>
              </template>
            </a-table-column>
            <a-table-column title="提交时间" data-index="submitTime" :width="180" />
            <a-table-column title="审核状态" :width="100">
              <template #cell="{ record }">
                <a-tag :color="record.status === 'approved' ? 'green' : record.status === 'pending' ? 'orange' : 'red'">
                  {{ record.status === 'approved' ? '已通过' : record.status === 'pending' ? '审核中' : '已拒绝' }}
                </a-tag>
              </template>
            </a-table-column>
            <a-table-column title="完成时间" data-index="completeTime" :width="180" />
            <a-table-column title="备注" data-index="remark" />
          </template>
        </a-table>
      </a-tab-pane>
    </a-tabs>

    <a-modal v-model:visible="qualificationVisible" title="添加资质" :width="500" @ok="handleSaveQualification">
      <a-form :model="qualificationForm" layout="vertical">
        <a-form-item label="资质名称" :rules="[{ required: true, message: '请输入资质名称' }]">
          <a-input v-model="qualificationForm.qualName" placeholder="请输入资质名称" />
        </a-form-item>
        <a-form-item label="证书编号" :rules="[{ required: true, message: '请输入证书编号' }]">
          <a-input v-model="qualificationForm.certNo" placeholder="请输入证书编号" />
        </a-form-item>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="发证日期">
              <a-date-picker v-model="qualificationForm.issueDate" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="有效期至">
              <a-date-picker v-model="qualificationForm.expireDate" style="width: 100%" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item label="资质附件">
          <a-upload :file-list="fileList" :limit="1" accept=".pdf,.jpg,.png">
            <template #upload-button>
              <a-button type="outline">
                <template #icon><icon-upload /></template>
                上传附件
              </a-button>
            </template>
          </a-upload>
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal v-model:visible="bindCardVisible" title="绑定银行卡" :width="500" @ok="handleConfirmBindCard">
      <a-form :model="bindCardForm" layout="vertical">
        <a-form-item label="开户银行" :rules="[{ required: true, message: '请选择开户银行' }]">
          <a-select v-model="bindCardForm.bankName" placeholder="请选择开户银行">
            <a-option value="招商银行">招商银行</a-option>
            <a-option value="工商银行">工商银行</a-option>
            <a-option value="建设银行">建设银行</a-option>
            <a-option value="农业银行">农业银行</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="银行卡号" :rules="[{ required: true, message: '请输入银行卡号' }]">
          <a-input v-model="bindCardForm.cardNo" placeholder="请输入银行卡号" />
        </a-form-item>
        <a-form-item label="开户行名称" :rules="[{ required: true, message: '请输入开户行名称' }]">
          <a-input v-model="bindCardForm.branchName" placeholder="请输入开户行名称" />
        </a-form-item>
        <a-form-item label="预留手机号" :rules="[{ required: true, message: '请输入预留手机号' }]">
          <a-input v-model="bindCardForm.phone" placeholder="请输入银行预留手机号" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { Message, Modal } from '@arco-design/web-vue'

const router = useRouter()
const qualificationVisible = ref(false)
const bindCardVisible = ref(false)
const fileList = ref([])

const qualificationForm = reactive({
  qualName: '',
  certNo: '',
  issueDate: '',
  expireDate: '',
})

const bindCardForm = reactive({
  bankName: '',
  cardNo: '',
  branchName: '',
  phone: '',
})

const contracts = ref([
  {
    contractNo: 'CT-2024-001',
    contractName: '钢材年度供货合同',
    contractType: 'supply',
    signDate: '2024-01-01',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    status: 'active',
  },
  {
    contractNo: 'CT-2024-002',
    contractName: '水泥采购框架协议',
    contractType: 'framework',
    signDate: '2024-02-28',
    startDate: '2024-03-01',
    endDate: '2025-02-28',
    status: 'active',
  },
])

const qualifications = ref([
  {
    id: '1',
    qualName: '营业执照',
    certNo: '91310000132200X',
    issueDate: '2020-01-01',
    expireDate: '2050-01-01',
    status: 'valid',
  },
  {
    id: '2',
    qualName: '安全生产许可证',
    certNo: '(沪)JZ安许证字[2020]000001',
    issueDate: '2020-06-01',
    expireDate: '2026-06-01',
    status: 'valid',
  },
  {
    id: '3',
    qualName: '质量管理体系认证',
    certNo: 'ISO9001-2015',
    issueDate: '2022-01-01',
    expireDate: '2025-01-01',
    status: 'valid',
  },
])

const bankCards = ref([
  {
    id: '1',
    bankName: '招商银行',
    bankAccountMasked: '6214 **** **** 5678',
    cardType: 'debit',
    bindStatus: 'bound',
    bindTime: '2024-01-15 11:00:00',
    isDefault: true,
  },
  {
    id: '2',
    bankName: '工商银行',
    bankAccountMasked: '6222 **** **** 1234',
    cardType: 'debit',
    bindStatus: 'bound',
    bindTime: '2024-02-20 15:30:00',
    isDefault: false,
  },
])

const openRecords = ref([
  {
    id: '1',
    applyType: 'open',
    submitTime: '2024-01-10 09:00:00',
    status: 'approved',
    completeTime: '2024-01-15 10:30:00',
    remark: '首次开户',
  },
])

function handleAddQualification() {
  Object.assign(qualificationForm, {
    qualName: '',
    certNo: '',
    issueDate: '',
    expireDate: '',
  })
  fileList.value = []
  qualificationVisible.value = true
}

function handleSaveQualification() {
  Message.success('添加成功')
  qualificationVisible.value = false
}

function handleViewFile(record: any) {
  Message.info(`查看文件: ${record.certNo}`)
}

function handleDeleteQualification(record: any) {
  Modal.confirm({
    title: '删除确认',
    content: `确定要删除资质「${record.qualName}」吗？`,
    onOk: () => {
      qualifications.value = qualifications.value.filter(item => item.id !== record.id)
      Message.success('删除成功')
    },
  })
}

function handleBindCard() {
  Object.assign(bindCardForm, {
    bankName: '',
    cardNo: '',
    branchName: '',
    phone: '',
  })
  bindCardVisible.value = true
}

function handleConfirmBindCard() {
  Message.success('绑卡申请已提交，请等待验证')
  bindCardVisible.value = false
}

function handleSetDefault(record: any) {
  bankCards.value.forEach(card => {
    card.isDefault = card.id === record.id
  })
  Message.success('已设为默认银行卡')
}

function getContractTypeColor(type: string) {
  const colors: Record<string, string> = {
    supply: 'blue',
    framework: 'green',
    temp: 'orange',
  }
  return colors[type] || 'gray'
}

function getContractTypeText(type: string) {
  const texts: Record<string, string> = {
    supply: '供货合同',
    framework: '框架协议',
    temp: '临时合同',
  }
  return texts[type] || type
}

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    active: 'green',
    expired: 'red',
    pending: 'orange',
  }
  return colors[status] || 'gray'
}

function getStatusText(status: string) {
  const texts: Record<string, string> = {
    active: '生效中',
    expired: '已过期',
    pending: '待生效',
  }
  return texts[status] || status
}
</script>

<style scoped lang="less">
.page-container {
  padding: 16px;
  background: var(--color-bg-1);
  min-height: calc(100vh - 100px);
}

.mt-8 {
  margin-top: 8px;
}

.mt-16 {
  margin-top: 16px;
}

.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-1);
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--color-border);
}

.money {
  font-weight: 500;
  font-size: 16px;
  &.frozen {
    color: rgb(var(--warning-6));
  }
  &.total {
    color: rgb(var(--primary-6));
  }
}
</style>
