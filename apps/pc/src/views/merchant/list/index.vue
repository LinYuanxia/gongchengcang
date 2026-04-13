<template>
  <div class="page-container">
    <PrdPanel :items="prdItems" />
    
    <a-card :bordered="false">
      <div class="table-actions">
        <a-space>
          <a-input-search
            v-model="searchForm.keyword"
            placeholder="搜索商户名称/联系人/联系电话"
            style="width: 260px"
            @search="handleSearch"
            @clear="handleSearch"
            allow-clear
          />
          <a-select 
            v-model="searchForm.tenantType" 
            placeholder="商户类型" 
            style="width: 140px" 
            allow-clear
            @change="handleSearch"
          >
            <a-option v-for="item in TENANT_TYPE_OPTIONS" :key="item.value" :value="item.value">
              {{ item.label }}
            </a-option>
          </a-select>
          <a-select 
            v-model="searchForm.registrationStatus" 
            placeholder="入驻状态" 
            style="width: 120px" 
            allow-clear
            @change="handleSearch"
          >
            <a-option v-for="item in REGISTRATION_STATUS_OPTIONS" :key="item.value" :value="item.value">
              {{ item.label }}
            </a-option>
          </a-select>
          <a-select 
            v-model="searchForm.enabledStatus" 
            placeholder="启用状态" 
            style="width: 120px" 
            allow-clear
            @change="handleSearch"
          >
            <a-option v-for="item in ENABLED_STATUS_OPTIONS" :key="item.value" :value="item.value">
              {{ item.label }}
            </a-option>
          </a-select>
        </a-space>
        <a-space>
          <a-button type="primary" @click="handleAdd">
            <template #icon><icon-plus /></template>
            添加商户
          </a-button>
        </a-space>
      </div>
      <a-table
        :data="tableData"
        :loading="loading"
        :pagination="pagination"
        @page-change="handlePageChange"
        row-key="tenantId"
      >
        <template #columns>
          <a-table-column title="租户ID" data-index="tenantId" :width="180" />
          <a-table-column title="商户名称" data-index="merchantName" :width="200">
            <template #cell="{ record }">
              <a-link @click="handleViewDetail(record)">{{ record.merchantName }}</a-link>
            </template>
          </a-table-column>
          <a-table-column title="商户类型" :width="120">
            <template #cell="{ record }">
              <a-tag :color="TENANT_TYPE_MAP[record.tenantType]?.color">
                {{ TENANT_TYPE_MAP[record.tenantType]?.label }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="联系人" data-index="contactPerson" :width="100" />
          <a-table-column title="联系电话" data-index="contactPhone" :width="130" />
          <a-table-column title="入驻状态" :width="100">
            <template #cell="{ record }">
              <a-tag :color="REGISTRATION_STATUS_MAP[record.registrationStatus]?.color">
                {{ REGISTRATION_STATUS_MAP[record.registrationStatus]?.label }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="启用状态" :width="100">
            <template #cell="{ record }">
              <a-switch
                v-model="record.enabledStatus"
                :checked-value="1"
                :unchecked-value="0"
                :disabled="record.registrationStatus !== 'approved'"
                @change="(val) => handleStatusChange(record, val)"
              />
            </template>
          </a-table-column>
          <a-table-column title="创建时间" data-index="createdAt" :width="180" />
          <a-table-column title="操作" :width="280" fixed="right">
            <template #cell="{ record }">
              <a-space wrap>
                <a-button type="text" size="small" @click="handleView(record)">查看</a-button>
                <a-button type="text" size="small" @click="handleEdit(record)">编辑</a-button>
                <a-button type="text" size="small" @click="handleContract(record)">合同</a-button>
                <a-button type="text" size="small" @click="handleAccount(record)">账号</a-button>
                <a-button 
                  type="text" 
                  size="small" 
                  status="success"
                  @click="handleEnterSystem(record)"
                >
                  进入系统
                </a-button>
                <a-popconfirm content="确定要删除该商户吗？" @ok="handleDelete(record)">
                  <a-button type="text" size="small" status="danger">删除</a-button>
                </a-popconfirm>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <MerchantFormDrawer
      v-model:visible="formVisible"
      :mode="formMode"
      :tenant-id="currentTenantId"
      @success="handleFormSuccess"
    />

    <MerchantDetailDrawer
      v-model:visible="detailVisible"
      :tenant-id="currentTenantId"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import {
  TENANT_TYPE_OPTIONS,
  TENANT_TYPE_MAP,
  REGISTRATION_STATUS_OPTIONS,
  REGISTRATION_STATUS_MAP,
  ENABLED_STATUS_OPTIONS,
} from '@gongchengcang/constants'
import { getMerchantList, deleteMerchant, updateMerchantStatus } from '@gongchengcang/api'
import type { Merchant } from '@gongchengcang/types'
import MerchantFormDrawer from './components/MerchantFormDrawer.vue'
import MerchantDetailDrawer from './components/MerchantDetailDrawer.vue'
import PrdPanel from '@/components/PrdPanel/index.vue'

const prdItems = [
  {
    reqId: 1,
    moduleName: '筛选模块',
    content: `
【1】筛选模块 - 完整产品标准

---

### 一、筛选项清单

| 筛选类型 | 组件 | 占位符 | 宽度 | 允许清空 |
|----------|------|--------|------|----------|
| 🔍 关键字搜索 | InputSearch | 搜索商户名称/联系人/联系电话 | 260px | ✅ 是 |
| 商户类型 | Select下拉 | 商户类型 | 140px | ✅ 是 |
| 入驻状态 | Select下拉 | 入驻状态 | 120px | ✅ 是 |
| 启用状态 | Select下拉 | 启用状态 | 120px | ✅ 是 |

---

### 二、交互标准（强制执行）

#### 1. 关键字搜索
- **触发时机**：
  - 按回车键立即搜索
  - 点击搜索图标立即搜索
  - 点击清除按钮立即重置并搜索
- **防抖**：300ms
- **搜索范围**：商户名称 ＞ 联系人姓名 ＞ 联系电话

#### 2. 下拉筛选
- **触发时机**：选中值变更后立即执行搜索，无需额外点击查询
- **联动关系**：所有下拉支持自由组合筛选，AND逻辑关系
- **页码重置**：任何筛选条件变更，自动跳转到第1页

#### 3. 清空规则
- 单个筛选项可单独清空
- 清空后自动刷新列表数据

---

### 三、异常与边界
- 无匹配数据时显示空状态
- 搜索时显示Loading状态
- 筛选项默认值：全部为空
`
  },
  {
    reqId: 2,
    moduleName: '行操作集合',
    content: `
【2】行操作集合 - 完整产品标准

---

### 一、操作按钮清单（从左到右，优先级排序）

| 按钮 | 类型 | 权限 | 前置条件 | 交互说明 |
|------|------|------|----------|----------|
| 🔗 查看 | text链接 | 所有运营 | 无 | 打开侧边栏展示商户完整信息 |
| ✏️ 编辑 | text链接 | 运营/管理员 | 入驻状态 = 已通过 | 打开编辑抽屉 |
| 📄 合同 | text链接 | 运营/管理员 | 无 | 跳转至合同管理页面，自动带入商户ID |
| 👥 账号 | text链接 | 管理员 | 无 | 打开子账号管理弹窗 |
| 🚀 进入系统 | text+绿色 | **仅超管** | 启用状态 = 启用 | 新窗口打开，免密登录该商户系统 |
| 🗑️ 删除 | text+红色 | 仅管理员 | 无 | 弹出二次确认框 |

---

### 二、交互标准（强制执行）

#### 1. 显示规则
- 按钮横向排列，间距8px
- 空间不足时**自动换行**，保持左对齐
- 操作列**固定在表格最右侧**，不随横向滚动消失
- 无权限按钮 = 不渲染（而非禁用）

#### 2. 二次确认规范
> 删除操作必须弹出确认框：

标题：删除确认
内容：确定要删除商户「{商户名称}」吗？
按钮：取消 / 确定（红色）

#### 3. 禁用逻辑

IF 启用状态 = 禁用 THEN
   隐藏「进入系统」按钮
END IF

---

### 三、成功反馈
- 所有操作执行后显示 Message 提示
- 删除成功自动刷新列表
- 编辑成功刷新当前行数据
`
  },
  {
    reqId: 3,
    moduleName: '状态管理',
    content: `
【3】状态管理 - 完整产品标准

---

### 一、入驻状态机（不可逆流转）

>>>flow
待审核 -> 审核通过 -> 已通过（终态）
待审核 -> 审核驳回 -> 已驳回（终态）
<<<

| 状态 | 颜色 | Tag样式 | 下一状态 | 触发动作 |
|------|------|---------|----------|----------|
| 🟡 pending 待审核 | 橙色 | solid | → approved / rejected | 审核通过/驳回 |
| 🟢 approved 已通过 | 绿色 | solid | （终态） | - |
| 🔴 rejected 已驳回 | 红色 | solid | （终态） | - |

!! 已通过 / 已驳回 状态不可逆！一旦流转无法恢复！

---

### 二、启用状态控制

#### Switch组件规范
| 属性 | 值 |
|------|-----|
| 选中值 | 1 |
| 未选中值 | 0 |
| 禁用条件 | registrationStatus !== 'approved' |

#### 完整交互流程图：

>>>flow
用户点击 -> 状态校验 -> 发起请求 -> 接口返回
接口返回 -> 成功 -> Message提示
接口返回 -> 失败 -> Switch回滚 + 错误提示
<<<

---

### 三、业务规则（强制执行）

>>>flow
入驻驳回 -> 自动禁用账号 -> 禁止登录系统
<<<
`
  },
  {
    reqId: 4,
    moduleName: '新增商户表单（字段级规范）',
    content: `
【4】新增商户表单 - 完整字段级产品标准

---

### 一、整体表单结构

表单采用 [[分步向导]](warning) 模式，共5个步骤：
- 步骤1：基础信息（必填）
- 步骤2：主体信息（必填）
- 步骤3：结算账户（选填）
- 步骤4：合同信息（选填）
- 步骤5：资质信息（选填）

>> 抽屉宽度固定 720px，点击确定按钮一次性提交所有数据

---

### 二、Step 1：基础信息（必填项）

| 字段名 | 组件 | 必填 | 长度限制 | 验证规则 | 占位提示 |
|--------|------|------|----------|----------|----------|
| **商户类型** | Select下拉 | ✅ 是 | - | 必选 | 请选择商户类型 |
| **商户名称** | Input输入 | ✅ 是 | 最多 128 字符 | 非空 | 请输入商户名称 |
| **企业联系人** | Input输入 | ✅ 是 | 最多 50 字符 | 非空 | 请输入联系人姓名 |
| **联系人手机号** | Input输入 | ✅ 是 | 最多 20 字符 | 匹配 ^1[3-9]\d{9}$ | 请输入联系人手机号 |
| **备注** | Textarea | ❌ 否 | 最多 500 字符 | 无 | 请输入备注 |

!! 手机号格式强制校验：必须 1 开头，第二位 3-9，总共 11 位数字

---

### 三、Step 2：主体信息（必填项）

| 字段名 | 组件 | 必填 | 长度限制 | 验证规则 | 占位提示 |
|--------|------|------|----------|----------|----------|
| **企业名称** | Input输入 | ✅ 是 | 最多 200 字符 | 非空 | 请输入企业名称（与营业执照一致） |
| **企业类型** | Select下拉 | ✅ 是 | - | 必选 | 请选择企业类型 |
| **纳税人类型** | Select下拉 | ✅ 是 | - | 必选 | 请选择纳税人类型 |
| **统一社会信用代码** | Input输入 | ✅ 是 | **固定 18 位** | 长度 = 18 | 请输入18位统一社会信用代码 |
| **法定代表人姓名** | Input输入 | ✅ 是 | 最多 50 字符 | 非空 | 请输入法人姓名 |
| **法人身份证号** | Input输入 | ✅ 是 | **固定 18 位** | 长度 = 18 | 请输入18位身份证号 |
| **营业执照图片** | 图片上传 | ✅ 是 | 限1张 | jpg/png | - |
| **营业执照有效期** | 日期选择 | ✅ 是 | - | 必选 | - |
| **身份证正面** | 图片上传 | ✅ 是 | 限1张 | jpg/png | - |
| **身份证反面** | 图片上传 | ✅ 是 | 限1张 | jpg/png | - |
| **注册地址** | Input输入 | ❌ 否 | 最多 255 字符 | 无 | 请输入工商注册地址 |
| **实际经营地址** | Input输入 | ❌ 否 | 最多 255 字符 | 无 | 请输入实际经营地址 |
| **注册资本（万元）** | 数字输入 | ❌ 否 | 保留2位小数 | ≥ 0 | 请输入注册资本 |
| **成立日期** | 日期选择 | ❌ 否 | - | 无 | - |
| **经营范围** | Textarea | ❌ 否 | 无限制 | 无 | 请输入经营范围 |

---

### 四、Step 3：结算账户（选填项）

>> 黄色提示：结算账户信息为选填项，可在创建商户后补充完善

| 字段名 | 组件 | 必填 | 长度限制 | 验证规则 | 占位提示 |
|--------|------|------|----------|----------|----------|
| **账户名称** | Input输入 | ❌ 否 | 最多 100 字符 | 无 | 请输入账户名称（通常为企业全称） |
| **银行账号** | Input输入 | ❌ 否 | 最多 30 字符 | 无 | 请输入银行账号（15-24位） |
| **开户银行** | Input输入 | ❌ 否 | 最多 100 字符 | 无 | 如：中国建设银行 |
| **支行信息** | Input输入 | ❌ 否 | 最多 100 字符 | 无 | 如：北京长安街支行 |
| **联行号** | Input输入 | ❌ 否 | **最多 12 位** | 无 | 请输入12位联行号 |

---

### 五、Step 4：合同信息（选填项）

>> 黄色提示：合同信息为选填项，可在创建商户后补充完善

#### 核心功能：
- 支持动态 [[添加合同]](success)
- 支持合同列表展示
- 支持删除已添加的合同

#### 合同字段：
| 字段名 | 说明 |
|--------|------|
| 合同编号 | 字符型，唯一标识 |
| 合同类型 | 下拉选择：服务协议 / 框架协议 |
| 合同开始日期 | 日期选择 |
| 合同结束日期 | 日期选择 |
| 合同金额（元） | 数字，保留2位小数 |
| 合同文件 | PDF/图片上传 |

---

### 六、上传组件统一规范

| 属性 | 参数值 |
|------|--------|
| 展示样式 | picture-card 卡片式 |
| 数量限制 | limit = 1（单图上传） |
| 接受类型 | accept = "image/*" |
| 文件格式 | JPG、PNG、JPEG |
| 文件大小 | 最大 5MB |

---

### 七、交互规则（强制执行）

>>>flow
上一步 / 下一步切换 -> 自动校验当前步骤必填项
当前步骤校验失败 -> 阻断跳转 + 字段标红
点击「确定」 -> 全表单校验所有必填项
所有校验通过 -> 发起创建请求
请求成功 -> 关闭抽屉 + 刷新列表 + Message提示
<<<

!! 点击抽屉「取消」按钮时，不做任何数据保留，下次打开表单清空重置
`
  },
  {
    reqId: 5,
    moduleName: '搜索筛选模块',
    content: `
【5】搜索筛选模块 - 完整产品标准

---

### 一、筛选器布局

筛选栏采用 [[横向流式]](primary) 布局，按优先级从左到右排列：

| 控件 | 宽度 | 类型 | 说明 |
|------|------|------|------|
| 关键词搜索框 | 260px | InputSearch | 支持模糊搜索 |
| 商户类型 | 140px | Select | 下拉单选 |
| 入驻状态 | 120px | Select | 下拉单选 |
| 启用状态 | 120px | Select | 下拉单选 |

---

### 二、关键词搜索规则

#### 搜索范围（三者命中其一即可）：
- 商户名称（模糊匹配）
- 联系人姓名（模糊匹配）
- 联系电话（精确匹配）

#### 交互细节：
- 支持 clear 清除按钮
- 点击搜索图标触发查询
- 按下回车键触发查询
- 清空时自动重新查询

---

### 三、下拉筛选规则

#### 商户类型选项：
- 全部（默认）
- [[工程公司]](success)
- [[供应商]](warning)
- [[施工方]](primary)

#### 入驻状态选项：
- 全部（默认）
- 🟡 待审核
- 🟢 已通过
- 🔴 已驳回

#### 启用状态选项：
- 全部（默认）
- 🟢 已启用
- 🔴 已禁用

---

### 四、联动逻辑

>>>flow
任意筛选条件变更 -> 立即触发查询
页码自动重置 -> page = 1
保留其他筛选条件 -> 只变更当前维度
<<<

>> 良好的筛选体验：变更条件不需要用户额外点击「查询」按钮
`
  },
  {
    reqId: 6,
    moduleName: '表格展示规范',
    content: `
【6】表格展示规范 - 完整产品标准

---

### 一、列定义（从左到右）

| 列名 | 宽度 | 对齐 | 特殊渲染 |
|------|------|------|----------|
| 租户ID | 180px | 左 | 纯文本 |
| 商户名称 | 200px | 左 | 蓝色链接，点击打开详情 |
| 商户类型 | 120px | 左 | 彩色 Tag |
| 联系人 | 100px | 左 | 纯文本 |
| 联系电话 | 130px | 左 | 纯文本 |
| 入驻状态 | 100px | 左 | 彩色 Tag |
| 启用状态 | 100px | 左 | Switch开关控件 |
| 创建时间 | 180px | 左 | 标准日期格式 |
| **操作列** | 280px | 左 | **固定在右侧！** |

---

### 二、Tag 色彩规范（必须强制执行）

| 维度 | 值 | 色彩 |
|------|----|------|
| **商户类型 - 工程公司** | 1 | arcoblue |
| **商户类型 - 供应商** | 2 | green |
| **商户类型 - 施工方** | 3 | orange |
| | | |
| **入驻状态 - 待审核** | pending | orange |
| **入驻状态 - 已通过** | approved | green |
| **入驻状态 - 已驳回** | rejected | red |

---

### 三、空数据规范

| 场景 | 处理方式 |
|------|----------|
| 空字符串 | 显示 - 横杠 |
| null值 | 显示 - 横杠 |
| undefined | 显示 - 横杠 |

>> 严禁表格单元格出现空白或者 "undefined" 字符串！

---

### 四、分页规范

| 参数 | 默认值 |
|------|--------|
| 默认每页条数 | 10 |
| 可选每页条数 | 10 / 20 / 50 |
| 页码变更 | 自动滚动到表格顶部 |
`
  },
  {
    reqId: 7,
    moduleName: '权限控制矩阵',
    content: `
【7】权限控制矩阵 - 完整产品标准

---

### 一、角色定义

系统共分为 [[4个角色层级]](warning)：

| 角色 | 说明 |
|------|------|
| 👑 超级管理员 | 平台最高权限，可进入商户系统 |
| 👔 平台管理员 | 可删除商户，可管理账号 |
| 🧑‍💼 运营人员 | 日常运营，可查看编辑 |
| 👁️ 只读用户 | 仅查看权限 |

---

### 二、操作权限对照表

| 功能点 | 超管 | 管理员 | 运营 | 只读 |
|--------|------|--------|------|------|
| 查看商户列表 | ✅ | ✅ | ✅ | ✅ |
| 搜索筛选 | ✅ | ✅ | ✅ | ✅ |
| 添加商户 | ✅ | ✅ | ✅ | ❌ |
| 编辑商户 | ✅ | ✅ | ✅ | ❌ |
| 查看合同 | ✅ | ✅ | ✅ | ❌ |
| 管理子账号 | ✅ | ✅ | ❌ | ❌ |
| [[进入商户系统]](success) | ✅ | ❌ | ❌ | ❌ |
| 删除商户 | ✅ | ✅ | ❌ | ❌ |
| 启用/禁用商户 | ✅ | ✅ | ❌ | ❌ |

---

### 三、无权限处理原则

>> 核心原则：**看不见 = 不存在**

| 原则 | 处理方式 | 反模式（禁止） |
|------|----------|----------------|
| 按钮级 | ✅ 直接不渲染 | ❌ 按钮灰掉禁用 |
| 页面级 | ✅ 403 无权限 | ❌ 提示你没有权限 |
| 接口级 | ✅ 403 HTTP 状态 | ❌ code 500 报错 |

---

### 四、前端权限判断代码规范

>> 代码块规范（用文字描述避免语法冲突）：
- ✅ 正确方式：有判断权限，才渲染按钮
- ❌ 错误方式：按钮永远渲染，没有权限就禁用
`
  }
]

const router = useRouter()
const loading = ref(false)
const tableData = ref<Merchant[]>([])
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
})

const searchForm = reactive({
  keyword: '',
  tenantType: undefined as string | undefined,
  registrationStatus: undefined as string | undefined,
  enabledStatus: undefined as number | undefined,
})

const formVisible = ref(false)
const formMode = ref<'add' | 'edit'>('add')
const currentTenantId = ref('')
const detailVisible = ref(false)

onMounted(() => {
  loadData()
})

async function loadData() {
  loading.value = true
  try {
    const res = await getMerchantList({
      page: pagination.current,
      pageSize: pagination.pageSize,
      ...searchForm,
    })
    tableData.value = res.list
    pagination.total = res.total
  } catch (error: any) {
    Message.error(error.message || '获取数据失败')
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  pagination.current = 1
  loadData()
}

function handlePageChange(page: number) {
  pagination.current = page
  loadData()
}

function handleAdd() {
  formMode.value = 'add'
  currentTenantId.value = ''
  formVisible.value = true
}

function handleView(record: Merchant) {
  currentTenantId.value = record.tenantId
  detailVisible.value = true
}

function handleViewDetail(record: Merchant) {
  router.push({ path: '/merchant/detail', query: { id: record.tenantId } })
}

function handleEdit(record: Merchant) {
  formMode.value = 'edit'
  currentTenantId.value = record.tenantId
  formVisible.value = true
}

function handleContract(record: Merchant) {
  Message.info(`查看商户「${record.merchantName}」的合同`)
}

function handleAccount(record: Merchant) {
  Message.info(`查看商户「${record.merchantName}」的账号`)
}

function handleEnterSystem(record: Merchant) {
  const tenantType = record.tenantType
  const tenantId = record.tenantId
  const merchantName = record.merchantName
  
  Message.success(`正在进入「${merchantName}」的管理系统...`)
  
  localStorage.setItem('mockTenantId', tenantId)
  localStorage.setItem('mockTenantType', tenantType)
  localStorage.setItem('mockMerchantName', merchantName)
  
  if (tenantType === 'supplier') {
    router.push({ path: '/supplier/dashboard', query: { tenantId, mock: '1' } })
  } else if (tenantType === 'warehouse') {
    router.push({ path: '/warehouse/dashboard', query: { tenantId, mock: '1' } })
  } else {
    Message.warning(`商户类型「${tenantType}」暂未配置对应系统，默认进入供应商系统`)
    router.push({ path: '/supplier/dashboard', query: { tenantId, mock: '1' } })
  }
}

async function handleDelete(record: Merchant) {
  try {
    await deleteMerchant(record.tenantId)
    Message.success('删除成功')
    loadData()
  } catch (error: any) {
    Message.error(error.message || '删除失败')
  }
}

async function handleStatusChange(record: Merchant, val: number | boolean) {
  try {
    await updateMerchantStatus(record.tenantId, val as number)
    Message.success('状态更新成功')
  } catch (error: any) {
    Message.error(error.message || '状态更新失败')
    record.enabledStatus = val === 1 ? 0 : 1
  }
}

function handleFormSuccess() {
  loadData()
}
</script>
