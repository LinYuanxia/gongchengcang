<template>
  <a-drawer
    :visible="visible"
    :title="mode === 'add' ? '添加商户' : '编辑商户'"
    :width="720"
    :footer="true"
    @cancel="handleClose"
    @ok="handleOk"
    unmount-on-close
  >
    <a-steps :current="currentStep" class="steps">
      <a-step title="基础信息" />
      <a-step title="主体信息" />
      <a-step title="结算账户" />
      <a-step title="合同信息" />
      <a-step title="资质信息" />
    </a-steps>

    <a-form
      ref="formRef"
      :model="formData"
      layout="vertical"
      class="form-container"
    >
      <div v-show="currentStep === 0">
        <a-form-item field="basicInfo.tenantType" label="商户类型" :rules="[{ required: true, message: '请选择商户类型' }]">
          <a-select v-model="formData.basicInfo.tenantType" placeholder="请选择商户类型">
            <a-option v-for="item in TENANT_TYPE_OPTIONS" :key="item.value" :value="item.value">
              {{ item.label }}
            </a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="basicInfo.merchantName" label="商户名称" :rules="[{ required: true, message: '请输入商户名称' }]">
          <a-input v-model="formData.basicInfo.merchantName" placeholder="请输入商户名称" :max-length="128" />
        </a-form-item>
        <a-form-item field="basicInfo.contactPerson" label="企业联系人" :rules="[{ required: true, message: '请输入联系人姓名' }]">
          <a-input v-model="formData.basicInfo.contactPerson" placeholder="请输入联系人姓名" :max-length="50" />
        </a-form-item>
        <a-form-item field="basicInfo.contactPhone" label="联系人手机号" :rules="[{ required: true, message: '请输入手机号' }, { match: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }]">
          <a-input v-model="formData.basicInfo.contactPhone" placeholder="请输入联系人手机号" :max-length="20" />
        </a-form-item>
        <a-form-item field="basicInfo.remark" label="备注">
          <a-textarea v-model="formData.basicInfo.remark" placeholder="请输入备注" :max-length="500" :auto-size="{ minRows: 3, maxRows: 5 }" />
        </a-form-item>
      </div>

      <div v-show="currentStep === 1">
        <a-form-item field="enterpriseInfo.enterpriseName" label="企业名称" :rules="[{ required: true, message: '请输入企业名称' }]">
          <a-input v-model="formData.enterpriseInfo.enterpriseName" placeholder="请输入企业名称（与营业执照一致）" :max-length="200" />
        </a-form-item>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item field="enterpriseInfo.enterpriseType" label="企业类型" :rules="[{ required: true, message: '请选择企业类型' }]">
              <a-select v-model="formData.enterpriseInfo.enterpriseType" placeholder="请选择企业类型">
                <a-option v-for="item in ENTERPRISE_TYPE_OPTIONS" :key="item.value" :value="item.value">
                  {{ item.label }}
                </a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="enterpriseInfo.taxPayerType" label="纳税人类型" :rules="[{ required: true, message: '请选择纳税人类型' }]">
              <a-select v-model="formData.enterpriseInfo.taxPayerType" placeholder="请选择纳税人类型">
                <a-option v-for="item in TAX_PAYER_TYPE_OPTIONS" :key="item.value" :value="item.value">
                  {{ item.label }}
                </a-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item field="enterpriseInfo.unifiedSocialCreditCode" label="统一社会信用代码" :rules="[{ required: true, message: '请输入统一社会信用代码' }, { len: 18, message: '统一社会信用代码为18位' }]">
          <a-input v-model="formData.enterpriseInfo.unifiedSocialCreditCode" placeholder="请输入18位统一社会信用代码" :max-length="18" />
        </a-form-item>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item field="enterpriseInfo.legalPersonName" label="法定代表人姓名" :rules="[{ required: true, message: '请输入法人姓名' }]">
              <a-input v-model="formData.enterpriseInfo.legalPersonName" placeholder="请输入法人姓名" :max-length="50" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="enterpriseInfo.legalPersonIdCard" label="法人身份证号" :rules="[{ required: true, message: '请输入身份证号' }, { len: 18, message: '身份证号为18位' }]">
              <a-input v-model="formData.enterpriseInfo.legalPersonIdCard" placeholder="请输入18位身份证号" :max-length="18" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item field="enterpriseInfo.businessLicensePic" label="营业执照图片" :rules="[{ required: true, message: '请上传营业执照' }]">
          <a-upload
            list-type="picture-card"
            :file-list="businessLicenseFileList"
            :limit="1"
            accept="image/*"
            @change="handleBusinessLicenseChange"
          >
            <template #upload-button>
              <div class="upload-btn">
                <icon-plus />
                <div class="upload-text">上传营业执照</div>
              </div>
            </template>
          </a-upload>
        </a-form-item>
        <a-form-item field="enterpriseInfo.businessLicenseExpire" label="营业执照有效期" :rules="[{ required: true, message: '请选择有效期' }]">
          <a-date-picker v-model="formData.enterpriseInfo.businessLicenseExpire" style="width: 100%" />
        </a-form-item>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item field="enterpriseInfo.idCardPicFront" label="身份证正面" :rules="[{ required: true, message: '请上传身份证正面' }]">
              <a-upload
                list-type="picture-card"
                :file-list="idCardFrontFileList"
                :limit="1"
                accept="image/*"
                @change="handleIdCardFrontChange"
              >
                <template #upload-button>
                  <div class="upload-btn">
                    <icon-plus />
                    <div class="upload-text">上传正面</div>
                  </div>
                </template>
              </a-upload>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="enterpriseInfo.idCardPicBack" label="身份证反面" :rules="[{ required: true, message: '请上传身份证反面' }]">
              <a-upload
                list-type="picture-card"
                :file-list="idCardBackFileList"
                :limit="1"
                accept="image/*"
                @change="handleIdCardBackChange"
              >
                <template #upload-button>
                  <div class="upload-btn">
                    <icon-plus />
                    <div class="upload-text">上传反面</div>
                  </div>
                </template>
              </a-upload>
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item field="enterpriseInfo.registeredAddress" label="注册地址">
          <a-input v-model="formData.enterpriseInfo.registeredAddress" placeholder="请输入工商注册地址" :max-length="255" />
        </a-form-item>
        <a-form-item field="enterpriseInfo.actualAddress" label="实际经营地址">
          <a-input v-model="formData.enterpriseInfo.actualAddress" placeholder="请输入实际经营地址" :max-length="255" />
        </a-form-item>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item field="enterpriseInfo.registeredCapital" label="注册资本（万元）">
              <a-input-number v-model="formData.enterpriseInfo.registeredCapital" placeholder="请输入注册资本" :precision="2" :min="0" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="enterpriseInfo.establishedDate" label="成立日期">
              <a-date-picker v-model="formData.enterpriseInfo.establishedDate" style="width: 100%" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item field="enterpriseInfo.businessScope" label="经营范围">
          <a-textarea v-model="formData.enterpriseInfo.businessScope" placeholder="请输入经营范围" :auto-size="{ minRows: 3, maxRows: 5 }" />
        </a-form-item>
      </div>

      <div v-show="currentStep === 2">
        <a-alert type="warning" style="margin-bottom: 16px">结算账户信息为选填项，可在创建商户后补充完善</a-alert>
        <a-form-item field="settlementAccount.accountName" label="账户名称">
          <a-input v-model="formData.settlementAccount.accountName" placeholder="请输入账户名称（通常为企业全称）" :max-length="100" />
        </a-form-item>
        <a-form-item field="settlementAccount.bankAccount" label="银行账号">
          <a-input v-model="formData.settlementAccount.bankAccount" placeholder="请输入银行账号（15-24位）" :max-length="30" />
        </a-form-item>
        <a-form-item field="settlementAccount.bankName" label="开户银行">
          <a-input v-model="formData.settlementAccount.bankName" placeholder="如：中国建设银行" :max-length="100" />
        </a-form-item>
        <a-form-item field="settlementAccount.bankBranch" label="支行信息">
          <a-input v-model="formData.settlementAccount.bankBranch" placeholder="如：北京长安街支行" :max-length="100" />
        </a-form-item>
        <a-form-item field="settlementAccount.bankBranchCode" label="联行号">
          <a-input v-model="formData.settlementAccount.bankBranchCode" placeholder="请输入12位联行号" :max-length="12" />
        </a-form-item>
      </div>

      <div v-show="currentStep === 3">
        <a-alert type="warning" style="margin-bottom: 16px">合同信息为选填项，可在创建商户后补充完善</a-alert>
        <div class="section-header">
          <span class="section-title">合同列表</span>
          <a-button type="primary" size="small" @click="handleAddContract">
            <template #icon><icon-plus /></template>
            添加合同
          </a-button>
        </div>
        <a-table :data="formData.contracts" :pagination="false" size="small" v-if="formData.contracts.length > 0">
          <template #columns>
            <a-table-column title="合同编号" data-index="contractNo" :width="120" />
            <a-table-column title="合同类型" :width="100">
              <template #cell="{ record }">
                {{ CONTRACT_TYPE_MAP[record.contractType]?.label }}
              </template>
            </a-table-column>
            <a-table-column title="签署日期" data-index="signDate" :width="120" />
            <a-table-column title="有效期" :width="200">
              <template #cell="{ record }">
                {{ record.contractStartDate }} 至 {{ record.contractEndDate || '长期' }}
              </template>
            </a-table-column>
            <a-table-column title="操作" :width="100">
              <template #cell="{ record, rowIndex }">
                <a-button type="text" size="small" status="danger" @click="handleRemoveContract(rowIndex)">删除</a-button>
              </template>
            </a-table-column>
          </template>
        </a-table>
        <a-empty v-else description="暂无合同信息" />
      </div>

      <div v-show="currentStep === 4">
        <a-alert type="warning" style="margin-bottom: 16px">资质信息为选填项，可在创建商户后补充完善</a-alert>
        <div class="section-header">
          <span class="section-title">资质列表</span>
          <a-button type="primary" size="small" @click="handleAddQualification">
            <template #icon><icon-plus /></template>
            添加资质
          </a-button>
        </div>
        <a-table :data="formData.qualifications" :pagination="false" size="small" v-if="formData.qualifications.length > 0">
          <template #columns>
            <a-table-column title="资质名称" data-index="qualName" :width="150" />
            <a-table-column title="证书编号" data-index="certNo" :width="120" />
            <a-table-column title="有效期" :width="200">
              <template #cell="{ record }">
                {{ record.issueDate || '-' }} 至 {{ record.expireDate || '长期' }}
              </template>
            </a-table-column>
            <a-table-column title="发证机关" data-index="issuingAuthority" :width="150" />
            <a-table-column title="操作" :width="100">
              <template #cell="{ record, rowIndex }">
                <a-button type="text" size="small" status="danger" @click="handleRemoveQualification(rowIndex)">删除</a-button>
              </template>
            </a-table-column>
          </template>
        </a-table>
        <a-empty v-else description="暂无资质信息" />
      </div>
    </a-form>

    <template #footer>
      <a-space>
        <a-button v-if="currentStep > 0" @click="handlePrev">上一步</a-button>
        <a-button v-if="currentStep < 4" type="primary" @click="handleNext">下一步</a-button>
        <a-button v-if="currentStep >= 1" type="primary" :loading="submitLoading" @click="handleSubmit">
          {{ mode === 'add' ? '提交' : '保存' }}
        </a-button>
      </a-space>
    </template>

    <ContractFormModal
      v-model:visible="contractModalVisible"
      @ok="handleContractOk"
    />

    <QualificationFormModal
      v-model:visible="qualificationModalVisible"
      @ok="handleQualificationOk"
    />
  </a-drawer>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { Message } from '@arco-design/web-vue'
import {
  TENANT_TYPE_OPTIONS,
  ENTERPRISE_TYPE_OPTIONS,
  TAX_PAYER_TYPE_OPTIONS,
  CONTRACT_TYPE_MAP,
} from '@gongchengcang/constants'
import { createMerchant, updateMerchant, getMerchantDetail } from '@gongchengcang/api'
import type { MerchantFormData, ContractFormData, QualificationFormData, TenantType, EnterpriseType, TaxPayerType } from '@gongchengcang/types'
import ContractFormModal from './ContractFormModal.vue'
import QualificationFormModal from './QualificationFormModal.vue'

const props = defineProps<{
  visible: boolean
  mode: 'add' | 'edit'
  tenantId: string
}>()

const emit = defineEmits<{
  (e: 'update:visible', visible: boolean): void
  (e: 'success'): void
}>()

const formRef = ref()
const currentStep = ref(0)
const submitLoading = ref(false)
const contractModalVisible = ref(false)
const qualificationModalVisible = ref(false)

const businessLicenseFileList = ref<any[]>([])
const idCardFrontFileList = ref<any[]>([])
const idCardBackFileList = ref<any[]>([])

const stepFields = [
  ['basicInfo.tenantType', 'basicInfo.merchantName', 'basicInfo.contactPerson', 'basicInfo.contactPhone'],
  ['enterpriseInfo.enterpriseName', 'enterpriseInfo.enterpriseType', 'enterpriseInfo.unifiedSocialCreditCode', 'enterpriseInfo.taxPayerType', 'enterpriseInfo.legalPersonName', 'enterpriseInfo.legalPersonIdCard', 'enterpriseInfo.businessLicensePic', 'enterpriseInfo.businessLicenseExpire', 'enterpriseInfo.idCardPicFront', 'enterpriseInfo.idCardPicBack'],
  [],
  [],
  [],
]

const defaultFormData: MerchantFormData = {
  basicInfo: {
    tenantType: '' as TenantType,
    merchantName: '',
    contactPerson: '',
    contactPhone: '',
    remark: '',
  },
  enterpriseInfo: {
    enterpriseName: '',
    enterpriseType: '' as EnterpriseType,
    unifiedSocialCreditCode: '',
    taxPayerType: '' as TaxPayerType,
    legalPersonName: '',
    legalPersonIdCard: '',
    businessLicensePic: '',
    businessLicenseExpire: '',
    idCardPicFront: '',
    idCardPicBack: '',
    registeredAddress: '',
    actualAddress: '',
    registeredCapital: undefined,
    establishedDate: '',
    businessScope: '',
  },
  settlementAccount: {
    accountName: '',
    bankAccount: '',
    bankName: '',
    bankBranch: '',
    bankBranchCode: '',
  },
  contracts: [],
  qualifications: [],
}

const formData = reactive<MerchantFormData>(JSON.parse(JSON.stringify(defaultFormData)))

watch(
  () => props.visible,
  async (val) => {
    if (val) {
      currentStep.value = 0
      if (props.mode === 'edit' && props.tenantId) {
        await loadMerchantDetail()
      } else {
        Object.assign(formData, JSON.parse(JSON.stringify(defaultFormData)))
        businessLicenseFileList.value = []
        idCardFrontFileList.value = []
        idCardBackFileList.value = []
      }
    }
  }
)

async function loadMerchantDetail() {
  try {
    const res = await getMerchantDetail(props.tenantId)
    formData.basicInfo = {
      tenantType: res.tenantType,
      merchantName: res.merchantName,
      contactPerson: res.contactPerson,
      contactPhone: res.contactPhone,
      remark: res.remark || '',
    }
    if (res.enterpriseInfo) {
      Object.assign(formData.enterpriseInfo, res.enterpriseInfo)
      if (res.enterpriseInfo.businessLicensePic) {
        businessLicenseFileList.value = [{ url: res.enterpriseInfo.businessLicensePic }]
      }
      if (res.enterpriseInfo.idCardPicFront) {
        idCardFrontFileList.value = [{ url: res.enterpriseInfo.idCardPicFront }]
      }
      if (res.enterpriseInfo.idCardPicBack) {
        idCardBackFileList.value = [{ url: res.enterpriseInfo.idCardPicBack }]
      }
    }
    if (res.settlementAccount) {
      Object.assign(formData.settlementAccount, res.settlementAccount)
    }
  } catch (error: any) {
    Message.error(error.message || '获取商户详情失败')
  }
}

function handleBusinessLicenseChange(fileList: any[]) {
  businessLicenseFileList.value = fileList
  if (fileList.length > 0 && fileList[0].url) {
    formData.enterpriseInfo.businessLicensePic = fileList[0].url
  } else {
    formData.enterpriseInfo.businessLicensePic = ''
  }
}

function handleIdCardFrontChange(fileList: any[]) {
  idCardFrontFileList.value = fileList
  if (fileList.length > 0 && fileList[0].url) {
    formData.enterpriseInfo.idCardPicFront = fileList[0].url
  } else {
    formData.enterpriseInfo.idCardPicFront = ''
  }
}

function handleIdCardBackChange(fileList: any[]) {
  idCardBackFileList.value = fileList
  if (fileList.length > 0 && fileList[0].url) {
    formData.enterpriseInfo.idCardPicBack = fileList[0].url
  } else {
    formData.enterpriseInfo.idCardPicBack = ''
  }
}

function handlePrev() {
  currentStep.value--
}

function handleNext() {
  currentStep.value++
}

function handleAddContract() {
  contractModalVisible.value = true
}

function handleContractOk(data: ContractFormData) {
  formData.contracts.push(data)
}

function handleRemoveContract(index: number) {
  formData.contracts.splice(index, 1)
}

function handleAddQualification() {
  qualificationModalVisible.value = true
}

function handleQualificationOk(data: QualificationFormData) {
  formData.qualifications.push(data)
}

function handleRemoveQualification(index: number) {
  formData.qualifications.splice(index, 1)
}

async function handleSubmit() {
  submitLoading.value = true
  try {
    if (props.mode === 'add') {
      await createMerchant(formData)
      Message.success('添加成功，商户入驻审核通过后将自动创建管理员账号')
    } else {
      await updateMerchant(props.tenantId, formData)
      Message.success('保存成功')
    }
    emit('success')
    handleClose()
  } catch (error: any) {
    Message.error(error.message || '操作失败')
  } finally {
    submitLoading.value = false
  }
}

function handleOk() {
  handleSubmit()
}

function handleClose() {
  emit('update:visible', false)
}
</script>

<style scoped lang="less">
.steps {
  margin-bottom: 24px;
}

.form-container {
  max-height: calc(100vh - 280px);
  overflow-y: auto;
  padding-right: 16px;
}

.upload-btn {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-color-secondary);
}

.upload-text {
  margin-top: 8px;
  font-size: 12px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-color);
}
</style>
