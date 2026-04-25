<template>
  <div class="prd-panel-container">
    <div class="prd-float-btn" @click="openPanel">
      <img src="/prd.png" alt="PRD" class="prd-icon" />
      <span class="tip">打开PRD</span>
    </div>

    <a-drawer
      v-model:visible="visible"
      width="850"
      :title="`📋 ${currentPageName} - 产品需求文档`"
      :footer="false"
    >
      <div class="prd-content">
        <a-empty v-if="!currentPrdItems || currentPrdItems.length === 0" description="当前页面暂无PRD需求文档" />

        <div v-else>
          <a-alert type="info" style="margin-bottom: 20px">
            <template #content>
              <div>📌 本文档为该页面的完整产品需求，开发前请仔细阅读每一条</div>
            </template>
          </a-alert>

          <a-steps direction="vertical" :current="-1">
            <a-step
              v-for="item in currentPrdItems"
              :key="item.reqId"
              :title="`#${item.reqId} - ${item.moduleName}`"
            >
              <template #description>
                <a-card size="small" class="prd-card">
                  <pre class="prd-markdown">{{ item.content }}</pre>
                </a-card>
              </template>
            </a-step>
          </a-steps>
        </div>
      </div>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

interface PrdItem {
  reqId: number
  moduleName: string
  content: string
}

const route = useRoute()
const visible = ref(false)

const prdDatabase: Record<string, { name: string; items: PrdItem[] }> = {

  '/product/sku': {
    name: 'SKU列表管理页面',
    items: [
      {
        reqId: 1,
        moduleName: '一、需求背景与定位',
        content: `
============================================================================
                          【需求背景】
============================================================================

1. 【业务背景】
   SKU是整个系统的最小库存单元，是采购、入库、销售、盘点的核心对象
   平台端运营人员需要统一管理全平台的SKU基础数据

2. 【功能定位】
   → 平台端管理所有SKU的唯一入口
   → 提供SKU的增删改查、上下架、价格设置功能
   → 作为SPU的子级，支持从SPU列表页直接进入管理

3. 【使用角色】
   → 平台运营人员（主要）
   → 平台管理员
`
      },
      {
        reqId: 2,
        moduleName: '二、入口与筛选联动设计',
        content: `
============================================================================
                        【双入口设计规范】
============================================================================

| 入口场景 | 触发方式 | 自动筛选逻辑 |
|----------|---------|-------------|
| 全局入口 | 菜单：商品管理 → SKU列表 | 无筛选，显示全部SKU |
| 关联入口 | SPU列表 → 点击"管理SKU"按钮 | 自动带入spuId筛选，只显示该SPU下的SKU |

>>> 完整交互流程
   点击SPU的"管理SKU"
   → 自动填入"所属SPU"筛选器
   → 自动触发查询
   → 页面标题变更为：SKU列表 - {SPU名称}
   → 右上角显示"清除筛选"按钮
   → 点击"清除筛选" → 清空筛选 → 显示全部SKU
<<<
`
      },
      {
        reqId: 3,
        moduleName: '三、筛选器详细设计',
        content: `
============================================================================
                        【筛选器设计规范】
============================================================================

  位置：卡片标题下方，横向排列，左对齐

  | 控件名称 | 类型 | 宽度 | 占位文案 | 行为规范 |
  |----------|------|------|---------|---------|
  | 关键词搜索 | InputSearch | 240px | 搜索SKU名称/编码 | 支持模糊搜索，回车/点击图标触发 |
  | 商品分类 | Cascader | 200px | 商品分类 | 三级级联选择，支持清空 |
  | 所属SPU | Select | 200px | 所属SPU | 可搜索下拉，支持清空 |

  【布局规范】
  → 控件间距：12px（使用a-space默认）
  → 同一行，不折行
  → 不需要"查询"按钮，变更即查询
`
      },
      {
        reqId: 4,
        moduleName: '四、表格列定义（必须严格遵守！）',
        content: `
============================================================================
                        【表格列规范 - 从左到右】
============================================================================

  | 列名 | 固定宽度 | 对齐方式 | 渲染规范 |
  |------|---------|---------|---------|
  | 主图 | 80px | center | 48×48px，圆角4px，点击可放大 |
  | SKU编码 | 150px | left | 纯文本，等宽字体 |
  | SKU名称 | 200px | left | 纯文本，超出省略号 |
  | 所属SPU | 150px | left | 纯文本 |
  | 所属分类 | 100px | left | 纯文本 |
  | 规格 | 200px | left | key:value 组合，small尺寸Tag，间距8px |
  | 单位 | 60px | left | 纯文本 |
  | 供货价 | 100px | right | ¥0.00格式，保留2位小数 |
  | 销售价 | 100px | right | ¥0.00格式，保留2位小数 |
  | 状态 | 80px | center | Switch开关（上架/下架） |
  | 创建时间 | 180px | left | YYYY-MM-DD HH:mm:ss |
  | 操作列 | 200px | left | ✅ 固定在右侧！ |

  ⚠️ 【价格显示特殊规则】
  ① 有值：¥199.00 格式化显示
  ② null/undefined/0：显示 - 横杠（不要显示¥0.00）
`
      },
      {
        reqId: 5,
        moduleName: '五、操作按钮与交互',
        content: `
============================================================================
                          【操作规范】
============================================================================

  | 按钮 | 类型 | 点击后行为 | 权限控制 |
  |------|------|----------|---------|
  | 详情 | text | 侧滑打开SKU详情页 | 所有人 |
  | 编辑 | text | 侧滑打开编辑弹窗 | 运营 |
  | 删除 | text + 图标 | 二次确认弹窗 → 删除 | 管理员 |

  【批量操作】
  → 暂不做批量操作，单行处理即可

  【状态变更】
  点击Switch开关 → 直接变更状态 → Message提示成功
  ✅ 不需要二次确认
`
      },
      {
        reqId: 6,
        moduleName: '六、新增SKU弹窗设计',
        content: `
============================================================================
                        【新增SKU弹窗规范】
============================================================================

  弹窗尺寸：700px

  | 字段名 | 控件类型 | 必填 | 默认值 | 说明 |
  |--------|---------|-----|--------|------|
  | 所属SPU | Select | ✅ 是 | 空 | 选择SPU后自动带出规格选项 |
  | 主图 | 上传 | ❌ 否 | 空 | 单图，建议尺寸800×800 |
  | SKU编码 | Input | ❌ 否 | 自动生成 | 留空则系统自动编码 |
  | SKU名称 | Input | ✅ 是 | 空 | 最大200字符 |
  | 规格属性 | 动态表单 | ✅ 是 | - | 选择SPU后自动带出规格，也可手动新增 |
  | 供货价 | InputNumber | ✅ 是 | 0 | 精确到分，最小值0 |
  | 销售价 | InputNumber | ✅ 是 | 0 | 精确到分，最小值0 |

  ✅ 灵魂规范：
  规格可手动新增，不要强制只能用SPU预定义的！
`
      }
    ]
  },

  '/warehouse/stock': {
    name: '工程仓-库存列表',
    items: [
      {
        reqId: 1,
        moduleName: '一、需求背景与定位',
        content: `
============================================================================
                          【需求背景】
============================================================================

1. 【业务痛点】
   工程仓有多个子仓库（比如A项目仓、B项目仓、总仓）
   仓库管理员需要快速知道每个SKU在各个仓的库存数量
   入库、出库后需要实时看到库存变化

2. 【功能定位】
   → 工程仓查看库存的核心入口
   → 支持按子仓库维度筛选查看
   → 快速定位低库存、零库存商品

3. 【使用角色】
   → 工程仓仓库管理员
   → 工程仓采购人员
   → 工程仓老板

⚠️ 【核心灵魂原则】
   这是工地仓库，不是银行金库！
   看到数字就行，不用追求100%精确，账实差几个很正常
`
      },
      {
        reqId: 2,
        moduleName: '二、筛选器设计规范',
        content: `
============================================================================
                        【筛选器设计规范】
============================================================================

  ⚠️  第一优先级：子仓库必须默认选中第一个！绝对不能空！

  | 控件名称 | 类型 | 宽度 | 默认值 | 行为规范 |
  |----------|------|------|--------|---------|
  | 子仓库 | Select | 160px | 第一个子仓库 | 切换仓库自动刷新 |
  | 商品分类 | Cascader | 180px | 空 | 三级分类，可清空 |
  | 关键词 | InputSearch | 240px | 空 | SKU名称/编码模糊搜索 |
  | 库存状态 | RadioGroup | - | 全部 | 全部 / 库存预警 / 零库存 |

  ✅ 交互规范：
  切换子仓库时，保留其他所有筛选条件
  只变更仓库维度，不要重置其他条件
`
      },
      {
        reqId: 3,
        moduleName: '三、表格列定义规范',
        content: `
============================================================================
                          【表格列规范】
============================================================================

  | 列名 | 宽度 | 对齐 | 渲染规范 |
  |------|------|------|---------|
  | 主图 | 70px | center | 48×48缩略图 |
  | SKU编码 | 140px | left | - |
  | SKU名称 | 200px | left | - |
  | 规格 | 180px | left | small Tag展示 |
  | 单位 | 60px | left | - |
  | 当前库存 | 100px | right | ✅ 重点：右对齐！数字都要右对齐！ |
  | 预警状态 | 100px | center | 低于预警值显示 🔴 红色标签 |
  | 最近入库 | 160px | left | YYYY-MM-DD HH:mm |
  | 操作 | 140px | left | 固定在右侧 |

  ✅ 神奇小交互：
  点击"当前库存"的数字 → 弹窗显示该SKU的批次明细！

  ✅ 数字颜色规范：
  库存 > 预警值：黑色正常
  0 < 库存 ≤ 预警值：橙色 + 预警标签
  库存 = 0：红色 + 零库存标签
`
      },
      {
        reqId: 4,
        moduleName: '四、业务流程说明',
        content: `
============================================================================
                          【库存流转逻辑】
============================================================================

  【库存增加场景】
  1. 采购订单确认收货 → 增加对应仓库库存
  2. 调拨入库 → 从其他仓库调拨过来

  【库存减少场景】
  1. 销售订单确认出库 → 扣减库存
  2. 盘点亏损 → 调整库存
  3. 货损登记 → 扣减库存

  ⚠️ 【灵魂级产品决策】
  不需要负库存拦截！工地经常先把货拿走再录单子
  允许负库存，允许账实不符！
  系统只负责记录，不负责卡死业务！
`
      },
      {
        reqId: 5,
        moduleName: '五、功能清单与优先级',
        content: `
============================================================================
                        【功能开发优先级】
============================================================================

  P0 必须做：
  ✅ 按子仓库筛选查看库存
  ✅ 关键词搜索SKU
  ✅ 库存数字点击看批次明细
  ✅ 库存预警高亮显示

  P1 建议做：
  ✅ 库存盘点功能
  ✅ 库存调整单
  ✅ 出入库流水记录

  P2 可以延后：
  ❌ 库存预警消息推送
  ❌ 库存报表导出
  ❌ 库存ABC分类
`
      }
    ]
  },

  '/product/spu': {
    name: 'SPU列表管理页面',
    items: [
      {
        reqId: 1,
        moduleName: '一、需求背景与定位',
        content: `
============================================================================
                          【需求背景】
============================================================================

1. 【概念说明】
   SPU = Standard Product Unit 标准产品单元
   例："公牛插座 3米"是一个SPU
   下面可以有白色、黑色等多个SKU

2. 【功能定位】
   → 平台统一维护商品库的核心入口
   → 所有供应商只能从这里选品，不能自己新建
   → 这是控品的关键！

3. 【为什么供应商不能自己建商品】
   → 同样的东西，A供应商叫"3米插排"，B叫"公牛插板3m"
   → 工程仓搜索出来重复，不知道该买谁的
   → 平台统一建SPU，供应商选了供货就行，大家看到的是同一个商品
`
      },
      {
        reqId: 2,
        moduleName: '二、三步创建流程',
        content: `
============================================================================
                        【SPU三步创建法】
============================================================================

  Step 1 / 3 - 基本信息
  ──────────────────────
  | 字段 | 必填 | 说明 |
  |------|-----|------|
  | 商品分类 | ✅ | 三级分类选择 |
  | SPU名称 | ✅ | 统一命名，禁止简称 |
  | 单位 | ✅ | 个/箱/米/卷等 |
  | 主图 | ✅ | 白底图800×800 |

  Step 2 / 3 - 规格属性
  ──────────────────────
  从平台规格库选择规格组
  例：颜色 → 白色/黑色
  选择后自动生成SKU矩阵

  Step 3 / 3 - SKU价格设置
  ──────────────────────
  给每个SKU设置默认供货价、销售价

  ✅ 规范：三步都走完才能提交
`
      },
      {
        reqId: 3,
        moduleName: '三、操作规范',
        content: `
============================================================================
                          【操作规范】
============================================================================

  | 按钮 | 行为 | 说明 |
  |------|------|------|
  | 编辑SPU | 修改基本信息、规格 | 改规格会影响已有SKU |
  | 管理SKU | 跳转到SKU列表，自动筛选 | 核心操作入口 |
  | 新增SKU | 单独给SPU加SKU | 建议还是从SPU编辑里加 |
  | 上下架 | 控制整个SPU可见性 | 下架后供应商不可见 |
  | 删除 | 二次确认删除 | 有SKU的SPU禁止删除 |

  ⚠️  删除限制：
  SPU下面有SKU → 不让删，提示"请先删除所有SKU"
`
      }
    ]
  },

  '/product/category': {
    name: '商品分类管理',
    items: [
      {
        reqId: 1,
        moduleName: '一、分类设计原则',
        content: `
============================================================================
                          【分类设计原则】
============================================================================

  三级分类结构：
  一级 → 建材、五金、电工、工具...
  二级 → 建材 → 水泥、沙子、砖块...
  三级 → 水泥 → 325#、425#、白水泥...

  ✅ 原则：不要超过三级！找起来太麻烦！
`
      },
      {
        reqId: 2,
        moduleName: '二、功能规范',
        content: `
============================================================================
                          【功能规范】
============================================================================

  支持操作：
  ✅ 拖拽调整同级排序
  ✅ 新增同级/子级
  ✅ 修改分类名称
  ✅ 删除分类

  删除逻辑：
  分类下面有子分类 → 提示"该分类下有子分类，确定删除？"
  分类下面有商品 → 提示"该分类下有商品，删除后商品归为未分类"

  ✅ 不要做强制限制！确认了就可以删
`
      }
    ]
  },

  '/warehouse/warehouse/list': {
    name: '子仓库管理',
    items: [
      {
        reqId: 1,
        moduleName: '一、设计原则',
        content: `
============================================================================
                          【设计灵魂】
============================================================================

  这是工地仓库，不是银行金库！
  → 想加就加，想删就删，想改就改
  → 不要做任何限制，最多弹个确认框就行
`
      },
      {
        reqId: 2,
        moduleName: '二、功能清单',
        content: `
============================================================================
                          【功能清单】
============================================================================

  | 功能 | 说明 | 限制 |
  |------|------|------|
  | 新增子仓库 | 名称、地址、联系人3个字段 | 无，随便加多少个 |
  | 编辑子仓库 | 随时可以改任何字段 | 无限制 |
  | 删除子仓库 | 点击删除按钮 | 有库存也能删，弹个确认就行 |
  | 设为默认 | 设置默认仓库 | 只能有一个默认 |
`
      }
    ]
  }
}

function matchPrd(path: string) {
  const cleanPath = (path || '')
    .replace('/gongchengcang', '')
    .replace('#', '')
    .split('?')[0] || '/'
  
  console.log('🏷️ 原始路由:', path, '清理后:', cleanPath)
  
  for (const key in prdDatabase) {
    if (key === cleanPath || cleanPath.endsWith(key)) {
      console.log('✅ PRD匹配成功:', key, prdDatabase[key].name)
      return prdDatabase[key]
    }
  }
  console.log('❌ 没有找到匹配的PRD')
  return null
}

const currentPageName = computed(() => {
  const prd = matchPrd(route.path || '')
  return prd?.name || route.path || '当前页面'
})

const currentPrdItems = computed(() => {
  const prd = matchPrd(route.path || '')
  return prd?.items || []
})

const openPanel = () => {
  visible.value = true
}
</script>

<style scoped lang="less">
.prd-panel-container {
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 9999;
}

.prd-float-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  .prd-icon {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.18);

    .tip {
      opacity: 1;
      transform: translateX(0);
    }
  }

  .tip {
    position: absolute;
    right: 52px;
    background: #1D2129;
    color: white;
    padding: 5px 10px;
    border-radius: 4px;
    font-size: 12px;
    white-space: nowrap;
    opacity: 0;
    transform: translateX(10px);
    transition: all 0.25s ease;

    &::after {
      content: '';
      position: absolute;
      right: -5px;
      top: 50%;
      transform: translateY(-50%);
      width: 0;
      height: 0;
      border-top: 5px solid transparent;
      border-bottom: 5px solid transparent;
      border-left: 5px solid #1D2129;
    }
  }
}

.prd-content {
  padding: 12px 0;

  :deep(.arco-steps-item) {
    .arco-steps-item-title {
      font-weight: 600;
      font-size: 15px;
      color: #1D2129;
    }

    .arco-steps-item-content-line {
      padding-bottom: 28px;
    }
  }

  .prd-card {
    margin-top: 8px;

    :deep(.arco-card-body) {
      padding: 16px;
    }
  }

  .prd-markdown {
    font-size: 12px;
    line-height: 1.6;
    white-space: pre-wrap;
    word-break: break-all;
    font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
    background: #FAFAFA;
    padding: 16px;
    border-radius: 6px;
    margin: 0;
    max-height: 600px;
    overflow-y: auto;
  }
}
</style>
