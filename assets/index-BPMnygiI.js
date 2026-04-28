import{a6 as mt,N as y,O as t,P as l,r as k,Q as c,M as f,ab as u,ac as n,ag as i,af as P,ad as z,ae as M,aQ as j,al as U,au as _e,aa as X,aN as b,ai as V,_ as ct}from"./index-93qNuSZS.js";import{P as pt}from"./index-BXPQ1dB3.js";const ft={class:"page-container"},vt={class:"search-area"},kt={class:"push-count"},_t={class:"push-list"},gt={class:"push-item-header"},ht={class:"parent-warehouse"},yt={class:"sub-warehouse"},St={key:0,class:"push-actions"},Nt={key:1,class:"push-summary"},Ct={key:2,class:"push-reject-reason"},wt={key:1,class:"text-muted"},Pt={class:"sku-toolbar"},xt={class:"sub-text"},Ut={class:"form-footer"},bt={class:"summary"},Vt={style:{"margin-left":"24px"}},Kt={class:"highlight"},Lt={class:"sku-selector"},It={class:"selector-search"},Qt={class:"spu-list"},Wt={class:"spu-header"},Tt={class:"spu-info"},Ht={class:"spu-name"},Ot={class:"sku-count"},zt={class:"spec-values"},At={class:"price"},qt={class:"selector-footer"},$t={class:"warehouse-selector"},Bt={class:"selector-header"},Dt={class:"warehouse-list"},Rt={class:"warehouse-header"},Ft={class:"warehouse-name"},Mt={class:"warehouse-desc"},jt={class:"sub-warehouse-list"},Et=["onClick"],Yt={class:"warehouse-info"},Jt={class:"name"},Xt={class:"contact"},Zt={class:"publish-footer"},Gt={class:"selected-info"},ea={class:"text-muted",style:{"font-size":"12px"}},ta={style:{"font-size":"12px"}},aa={class:"text-success"},la={style:{"font-size":"12px","margin-top":"4px"}},sa={class:"highlight"},na={key:1,class:"text-muted"},ua={key:1,class:"text-muted"},ia={class:"sub-text"},oa={class:"highlight"},da={class:"sub-text"},ra={class:"text-danger"},ma={style:{"margin-top":"24px","text-align":"right"}},ca=mt({__name:"index",setup(pa){const ge=[{title:"1. 项目背景",content:`
**业务痛点：**
- 多仓库采购需求分散，缺乏统一汇总机制
- 人工邮件/微信传递采购需求，信息易丢失
- 采购执行进度黑盒，无法追踪各仓库确认状态
- 相同物料重复采购，导致库存积压和资金浪费

**解决目标：**
- 建立统一的采购计划汇总平台
- 实现计划从创建 → 推送 → 确认 → 执行的全链路可追溯
- 自动合并同类型物料采购需求，降低采购成本
- 各仓库确认状态可视化，异常自动预警

**模块定位：**
- 供应链的起点和入口
- 采购需求的统一收口
- 仓库与采购部门的协同枢纽
- 库存健康度的第一道防线

**与其他模块关系：**
- 上游：销售预测 / 安全库存预警
- 下游：采购订单 / 入库单 / 财务付款
    `},{title:"2. 用户对象",content:`
| 用户角色 | 特征 | 核心目标 | 使用频率 |
|---------|------|---------|---------|
| 采购经理 | 负责整体采购策略 | 宏观把控 + 成本优化 | 每日 3-5 次 |
| 采购专员 | 执行具体采购 | 确保计划按时执行 | 每日 10-15 次 |
| 仓库主管 | 各仓库负责人 | 按需确认 + 准时收货 | 每日 2-3 次 |
| 财务人员 | 预算和付款 | 预算控制 + 资金安排 | 每日 1-2 次 |
| 需求申请人 | 各部门人员 | 跟踪需求进度 | 每周 1-3 次 |
    `},{title:"3. 权限体系",content:`
### 3.1 功能权限矩阵

| 功能点 | 超管 | 采购经理 | 采购专员 | 仓库主管 | 财务 | 只读 |
|--------|------|---------|---------|---------|-----|------|
| 查看所有计划 | ✅ | ✅ | ✅ | 本仓库 | ✅ | ✅ |
| 创建计划 | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| 编辑计划 | ✅ | ✅ | 创建人 | ❌ | ❌ | ❌ |
| 发布计划 | ✅ | ✅ | 创建人 | ❌ | ❌ | ❌ |
| 取消计划 | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| 删除计划 | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| 推送仓库 | ✅ | ✅ | 创建人 | ❌ | ❌ | ❌ |
| 确认收货 | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| 导出报表 | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |

### 3.2 数据权限
- **采购专员**：仅可见自己创建的计划
- **仓库主管**：仅可见推送到本仓库的计划
- **采购经理/超管**：可见所有计划

### 3.3 操作权限
- 草稿状态：可编辑 / 可删除 / 可发布
- 已发布状态：可取消 / 可推送仓库
- 已推送状态：仓库可见，采购不可编辑
    `},{title:"4. 核心业务场景",content:`
### 场景 1：常规采购补货
- **触发条件**：系统基于安全库存自动生成采购建议
- **参与者**：采购专员
- **结果**：生成正式采购计划 → 推送给供应商

### 场景 2：多仓库集中采购
- **触发条件**：月初各仓库提交月度采购需求
- **参与者**：采购经理
- **结果**：合并相同 SKU 需求 → 集中采购议价

### 场景 3：紧急插单采购
- **触发条件**：工地突发缺货申请
- **参与者**：需求人 + 采购专员
- **结果**：绿色通道审批 → 24 小时内完成采购

### 场景 4：供应商分批送货
- **触发条件**：采购数量过大无法一次交付
- **参与者**：仓库主管 + 供应商
- **结果**：按批次确认收货，系统自动累计完成度

### 场景 5：计划变更取消
- **触发条件**：项目延期/取消导致采购需求变更
- **参与者**：采购经理
- **结果**：通知供应商取消 → 避免违约成本
    `},{title:"5. 业务逻辑图",content:`
\`\`\`mermaid
graph TD
    A[安全库存预警] --> B[创建采购计划草稿]
    C[人工申请] --> B
    B --> D[添加SKU明细]
    B --> E[选择目标仓库]
    D --> F[采购审核]
    E --> F
    F --> G{审核通过?}
    G -->|否| H[驳回修改]
    H --> B
    G -->|是| I[计划发布]
    I --> J[推送到目标仓库]
    J --> K{仓库确认?}
    K -->|确认| L[生成采购订单]
    K -->|拒绝| M[注明原因]
    M --> I
    L --> N[供应商送货]
    N --> O[仓库收货确认]
    O --> P{全部收货?}
    P -->|部分收货| N
    P -->|全部完成| Q[计划完成]
    R[紧急取消] --> S[计划作废]
    S --> T[通知供应商]
\`\`\`

**异常流程：**
- 计划作废 → 已生成的采购订单同步作废
- 仓库拒收 → 退回采购专员重新分配
- 超期未确认（>48小时）→ 自动提醒 + 升级
    `},{title:"6. 功能清单",content:`
| 模块 | 功能点 | 优先级 | 对应角色 |
|------|--------|-------|---------|
| 基础功能 | 计划列表查询 | P0 | 全员 |
| 基础功能 | 高级筛选搜索 | P0 | 全员 |
| 基础功能 | 计划详情查看 | P0 | 全员 |
| 计划管理 | 创建采购计划 | P0 | 采购 |
| 计划管理 | 编辑草稿计划 | P0 | 采购 |
| 计划管理 | 计划发布/取消 | P0 | 采购经理 |
| 计划管理 | 删除计划 | P2 | 超管 |
| 仓库协同 | 推送至指定仓库 | P0 | 采购 |
| 仓库协同 | 仓库确认/拒绝 | P0 | 仓库主管 |
| 仓库协同 | 收货进度可视化 | P1 | 全员 |
| 报表分析 | 计划导出Excel | P1 | 全员 |
| 报表分析 | 采购达成率统计 | P2 | 采购经理 |
    `},{title:"7. 功能详细说明",content:`
### 7.1 搜索筛选

| 筛选条件 | 组件类型 | 宽度 | 校验规则 |
|---------|---------|------|---------|
| 计划编号 | Input输入框 | 180px | 模糊匹配，支持 PLAN-xxx |
| 计划名称 | Input输入框 | 180px | 模糊匹配，最大20字 |
| 计划状态 | Select下拉框 | 140px | 单选：草稿/已发布/待确认/已确认/已完成/已取消 |
| 创建时间 | RangePicker | 280px | 默认最近30天 |
| 创建人 | Select人员 | 140px | 支持多选 |

### 7.2 表格列定义

| 列名 | 宽度 | 对齐 | 特殊处理 |
|------|------|-----|---------|
| 计划编号 | 150px | left | 蓝色可点击，跳转详情 |
| 计划名称 | 200px | left | 超长省略号 |
| SKU数量 | 100px | center | 显示 "N 个"，hover看明细 |
| 预计金额 | 120px | right | ¥ 前缀 + 千分位 |
| 目标仓库 | 180px | left | 悬浮显示仓库明细弹层 |
| 状态 | 120px | left | Tag 色彩标记 |
| 创建人 | 120px | left | 显示头像+姓名 |
| 创建时间 | 180px | left | YYYY-MM-DD HH:mm |
| 操作 | 220px | left | 固定右侧，根据状态显示按钮 |

### 7.3 交互说明
- 点击计划编号 → 打开计划详情页（新标签页）
- 点击目标仓库 → Popover 显示各子仓库确认状态
- 发布操作 → 二次确认弹窗，防止误操作
- 删除操作 → 只有草稿状态可删，已发布的需先取消
    `},{title:"8. Tag 色彩规范",content:`
| 状态值 | Tag颜色 | 含义 |
|--------|---------|------|
| 草稿 | gray | 未提交，可编辑 |
| 已发布 | blue | 采购审核通过，待推送 |
| 待确认 | gold | 已推送仓库，待收货确认 |
| 部分确认 | orange | 部分仓库已确认 |
| 全部确认 | green | 所有仓库已确认收货 |
| 已完成 | purple | 采购订单全部执行完毕 |
| 已取消 | red | 人工终止执行 |

**状态流转规则：**
- 草稿 → 已发布 → 待确认 → 已确认 → 已完成
- 草稿 → 已取消
- 已发布 → 已取消
    `},{title:"9. 非功能性要求",content:`
### 性能要求
- 列表加载时间 < 1 秒
- 支持 1000+ SKU 大计划流畅编辑
- 10000 条计划数据下筛选响应 < 500ms

### 安全要求
- 采购价格字段仅财务和采购可见
- 计划变更全程操作日志留痕
- 敏感操作（发布/取消）需二次确认

### 埋点要求
- plan_create 埋点：创建人、SKU数、预估金额
- plan_publish 埋点：发布人、审核时长
- warehouse_confirm 埋点：确认时效、是否拒绝
- plan_cancel 埋点：取消原因、取消时点

### 异常处理
- 推送失败自动重试 3 次
- 超 48 小时未确认自动发送企业微信提醒
- 预计金额超预算自动触发预警
    `}],he=k(!1),g=X({planNo:"",planName:"",status:""}),Z=X({current:1,pageSize:10,total:50}),E=k([{warehouseId:"WH001",warehouseName:"深圳宝安工程仓",warehouseDesc:"主营水泥、砂石料",subWarehouses:[{id:"WH001-S01",name:"西乡主仓",address:"宝安区西乡街道1号"},{id:"WH001-S02",name:"福永分仓",address:"宝安区福永街道2号"},{id:"WH001-S03",name:"沙井应急仓",address:"宝安区沙井街道3号"}]},{warehouseId:"WH002",warehouseName:"广州天河工程仓",warehouseDesc:"主营钢材、混凝土",subWarehouses:[{id:"WH002-S01",name:"天河智慧城仓",address:"天河区智慧城园区A区"},{id:"WH002-S02",name:"黄埔分仓",address:"黄埔区开发区B区"}]},{warehouseId:"WH003",warehouseName:"东莞南城工程仓",warehouseDesc:"综合建材仓",subWarehouses:[{id:"WH003-S01",name:"南城中心仓",address:"南城区CBD商圈旁"}]}]),Y=k([{id:"1",planNo:"PO202401001",planName:"2024年1月建材采购计划",skuCount:15,estimatedAmount:125800,status:"published",createTime:"2024-01-15 10:30:00",description:"本月常规建材补货计划",skuList:[{skuCode:"SKU001",productName:"32.5级普通硅酸盐水泥",specValues:"强度:32.5级",unit:"吨",quantity:100,referencePrice:450},{skuCode:"SKU002",productName:"河沙（中粗）",specValues:"颗粒:中粗砂",unit:"方",quantity:200,referencePrice:180},{skuCode:"SKU003",productName:"碎石(5-20mm)",specValues:"粒径:5-20mm",unit:"方",quantity:150,referencePrice:120}],pushList:[{warehouseId:"WH001-S01",warehouseParentName:"深圳宝安工程仓",warehouseName:"西乡主仓",status:"pending",pushTime:"2024-01-15 14:00:00"},{warehouseId:"WH002-S01",warehouseParentName:"广州天河工程仓",warehouseName:"天河智慧城仓",status:"confirmed",pushTime:"2024-01-15 14:00:00",confirmTime:"2024-01-16 10:00:00",orderNo:"SO202401001",actualAmount:128500,totalConfirmedQuantity:435,confirmedItems:[{skuCode:"SKU001",productName:"32.5级普通硅酸盐水泥",specValues:"强度:32.5级",unit:"吨",planQuantity:100,confirmedQuantity:95,remark:"库存不足"},{skuCode:"SKU002",productName:"河沙（中粗）",specValues:"颗粒:中粗砂",unit:"方",planQuantity:200,confirmedQuantity:200,remark:""},{skuCode:"SKU003",productName:"碎石(5-20mm)",specValues:"粒径:5-20mm",unit:"方",planQuantity:150,confirmedQuantity:140,remark:"缺货，下周补货"}]}]},{id:"2",planNo:"PO202401002",planName:"春节前备货计划",skuCount:28,estimatedAmount:356e3,status:"partial",createTime:"2024-01-18 09:00:00",description:"",skuList:[{skuCode:"SKU001",productName:"32.5级普通硅酸盐水泥",specValues:"强度:32.5级",unit:"吨",quantity:100,referencePrice:450},{skuCode:"SKU002",productName:"河沙（中粗）",specValues:"颗粒:中粗砂",unit:"方",quantity:200,referencePrice:180}],pushList:[{warehouseId:"WH001-S02",warehouseParentName:"深圳宝安工程仓",warehouseName:"福永分仓",status:"confirmed",pushTime:"2024-01-18 11:00:00",confirmTime:"2024-01-19 15:30:00",orderNo:"SO202401002",actualAmount:362e3,totalConfirmedQuantity:290,confirmedItems:[{skuCode:"SKU001",productName:"32.5级普通硅酸盐水泥",specValues:"强度:32.5级",unit:"吨",planQuantity:100,confirmedQuantity:95,remark:"缺货5吨"},{skuCode:"SKU002",productName:"河沙（中粗）",specValues:"颗粒:中粗砂",unit:"方",planQuantity:200,confirmedQuantity:195,remark:"运输延迟"}]},{warehouseId:"WH003-S01",warehouseParentName:"东莞南城工程仓",warehouseName:"南城中心仓",status:"pending",pushTime:"2024-01-18 11:00:00"}]},{id:"3",planNo:"PO202401003",planName:"新项目启动采购",skuCount:42,estimatedAmount:528e3,status:"confirmed",createTime:"2024-01-20 14:00:00",description:"",skuList:[{skuCode:"SKU001",productName:"32.5级普通硅酸盐水泥",specValues:"强度:32.5级",unit:"吨",quantity:100,referencePrice:450}],pushList:[{warehouseId:"WH002-S02",warehouseParentName:"广州天河工程仓",warehouseName:"黄埔分仓",status:"confirmed",pushTime:"2024-01-20 16:00:00",confirmTime:"2024-01-21 10:00:00",orderNo:"SO202401003",actualAmount:535e3,totalConfirmedQuantity:100,confirmedItems:[{skuCode:"SKU001",productName:"32.5级普通硅酸盐水泥",specValues:"强度:32.5级",unit:"吨",planQuantity:100,confirmedQuantity:100,remark:""}]}]},{id:"4",planNo:"PO202401004",planName:"瓷砖补货计划",skuCount:8,estimatedAmount:45e3,status:"draft",createTime:"2024-01-22 09:30:00",description:"",pushList:[]}]),ye=b(()=>{let s=Y.value;return g.planNo&&(s=s.filter(e=>e.planNo.includes(g.planNo))),g.planName&&(s=s.filter(e=>e.planName.includes(g.planName))),g.status&&(s=s.filter(e=>e.status===g.status)),s}),T=k(!1),A=k(!1),ne=k(""),v=X({planName:"",description:"",skuList:[]}),q=k(!1),Q=k(""),$=k(""),S=k([]),ue=k([]),G=k([{spuId:"SPU001",spuCode:"SPU001",spuName:"普通硅酸盐水泥",categoryName:"水泥建材",skuList:[{skuId:"SKU001",skuCode:"SKU001",productName:"普通硅酸盐水泥P.O42.5",specs:[{name:"强度等级",value:"P.O42.5"},{name:"包装",value:"50kg/袋"}],specValues:"50kg/袋",unit:"袋",referencePrice:28,stock:5e3},{skuId:"SKU001_2",skuCode:"SKU001_2",productName:"普通硅酸盐水泥P.O52.5",specs:[{name:"强度等级",value:"P.O52.5"},{name:"包装",value:"50kg/袋"}],specValues:"50kg/袋",unit:"袋",referencePrice:35,stock:3e3},{skuId:"SKU001_3",skuCode:"SKU001_3",productName:"普通硅酸盐水泥P.O42.5R",specs:[{name:"强度等级",value:"P.O42.5R"},{name:"包装",value:"50kg/袋"}],specValues:"50kg/袋",unit:"袋",referencePrice:30,stock:2e3}]},{spuId:"SPU002",spuCode:"SPU002",spuName:"螺纹钢HRB400",categoryName:"钢材钢筋",skuList:[{skuId:"SKU002",skuCode:"SKU002",productName:"螺纹钢HRB400",specs:[{name:"规格",value:"Φ12mm"},{name:"材质",value:"HRB400"}],specValues:"Φ12mm",unit:"吨",referencePrice:4200,stock:200},{skuId:"SKU002_2",skuCode:"SKU002_2",productName:"螺纹钢HRB400",specs:[{name:"规格",value:"Φ16mm"},{name:"材质",value:"HRB400"}],specValues:"Φ16mm",unit:"吨",referencePrice:4150,stock:150},{skuId:"SKU002_3",skuCode:"SKU002_3",productName:"螺纹钢HRB400",specs:[{name:"规格",value:"Φ20mm"},{name:"材质",value:"HRB400"}],specValues:"Φ20mm",unit:"吨",referencePrice:4100,stock:180},{skuId:"SKU002_4",skuCode:"SKU002_4",productName:"螺纹钢HRB400E",specs:[{name:"规格",value:"Φ25mm"},{name:"材质",value:"HRB400E"}],specValues:"Φ25mm",unit:"吨",referencePrice:4300,stock:80}]},{spuId:"SPU003",spuCode:"SPU003",spuName:"陶瓷抛光砖",categoryName:"陶瓷瓷砖",skuList:[{skuId:"SKU003",skuCode:"SKU003",productName:"抛光砖",specs:[{name:"尺寸",value:"800×800mm"},{name:"纹理",value:"米黄"}],specValues:"800×800mm",unit:"片",referencePrice:45,stock:3e3},{skuId:"SKU003_2",skuCode:"SKU003_2",productName:"抛光砖",specs:[{name:"尺寸",value:"600×600mm"},{name:"纹理",value:"米黄"}],specValues:"600×600mm",unit:"片",referencePrice:28,stock:5e3},{skuId:"SKU003_3",skuCode:"SKU003_3",productName:"抛光砖",specs:[{name:"尺寸",value:"800×800mm"},{name:"纹理",value:"白麻"}],specValues:"800×800mm",unit:"片",referencePrice:52,stock:2500}]},{spuId:"SPU004",spuCode:"SPU004",spuName:"建筑涂料",categoryName:"涂料油漆",skuList:[{skuId:"SKU004",skuCode:"SKU004",productName:"内墙乳胶漆",specs:[{name:"容量",value:"20L/桶"},{name:"系列",value:"净味"}],specValues:"20L/桶",unit:"桶",referencePrice:380,stock:150},{skuId:"SKU004_2",skuCode:"SKU004_2",productName:"内墙乳胶漆",specs:[{name:"容量",value:"5L/桶"},{name:"系列",value:"竹炭"}],specValues:"5L/桶",unit:"桶",referencePrice:120,stock:300},{skuId:"SKU005",skuCode:"SKU005",productName:"防水涂料",specs:[{name:"容量",value:"18kg/桶"},{name:"类型",value:"JS聚合物"}],specValues:"18kg/桶",unit:"桶",referencePrice:260,stock:80}]},{spuId:"SPU005",spuCode:"SPU005",spuName:"装饰板材",categoryName:"建材",skuList:[{skuId:"SKU006",skuCode:"SKU006",productName:"石膏板",specs:[{name:"尺寸",value:"1200×2400×9.5mm"},{name:"类型",value:"普通"}],specValues:"1200×2400×9.5mm",unit:"张",referencePrice:35,stock:500},{skuId:"SKU006_2",skuCode:"SKU006_2",productName:"石膏板",specs:[{name:"尺寸",value:"1200×2400×12mm"},{name:"类型",value:"耐火"}],specValues:"1200×2400×12mm",unit:"张",referencePrice:48,stock:200}]}]),ie=b(()=>{let s=G.value;return Q.value&&(s=s.filter(e=>e.spuName.includes(Q.value)||e.spuCode.includes(Q.value)||e.skuList.some(d=>d.productName.includes(Q.value)))),$.value&&(s=s.filter(e=>e.categoryName===$.value)),s}),Se=b(()=>{var s;return((s=ie.value[0])==null?void 0:s.spuId)||""});function Ne(s){return s.skuList.every(e=>S.value.includes(e.skuId))}function Ce(s){const e=s.skuList.filter(d=>S.value.includes(d.skuId)).length;return e>0&&e<s.skuList.length}function we(s,e){const d=s.skuList.map(m=>m.skuId);if(e){const m=[...new Set([...S.value,...d])];S.value=m}else S.value=S.value.filter(m=>!d.includes(m))}function Pe(s){return{type:"checkbox",selectedRowKeys:S.value,onlyCurrent:!1,onChange:e=>{const d=G.value.flatMap(m=>m.skuList.map(C=>C.skuId));S.value=e.filter(m=>d.includes(m))}}}const oe=b(()=>v.skuList.reduce((s,e)=>s+e.quantity*e.referencePrice,0).toFixed(2)),ee=k(!1),B=k(!1),xe=k(!1),p=k({}),N=k({}),Ue=k({}),de=k(!1),be=X({reason:""}),H=k(!1),h=k([]),W=k(""),J=b(()=>E.value.flatMap(s=>s.subWarehouses)),Ve=b(()=>W.value?E.value.filter(s=>s.warehouseName.includes(W.value)?!0:s.subWarehouses.some(e=>e.name.includes(W.value))):E.value),Ke=b(()=>{const s=J.value.filter(e=>!K(e.id));return s.length===0?!1:s.every(e=>h.value.includes(e.id))}),Le=b(()=>{const s=J.value.filter(d=>!K(d.id)).map(d=>d.id),e=h.value.filter(d=>s.includes(d));return e.length>0&&e.length<s.length}),Ie=b(()=>h.value.filter(s=>!K(s)).length);function K(s){var e;return(e=p.value.pushList)==null?void 0:e.some(d=>d.warehouseId===s)}function Qe(s){s?h.value=J.value.filter(e=>!K(e.id)).map(e=>e.id):h.value=[]}function We(s){if(K(s))return;const e=h.value.indexOf(s);e>-1?h.value.splice(e,1):h.value.push(s)}function Te(){Z.current=1}function He(){g.planNo="",g.planName="",g.status=""}function Oe(s){Z.current=s}function ze(){A.value=!1,ne.value="",v.planName="",v.description="",v.skuList=[],T.value=!0}function Ae(s){A.value=!0,ne.value=s.id,v.planName=s.planName,v.description=s.description||"",v.skuList=[{skuId:"SKU001",skuCode:"SKU001",productName:"普通硅酸盐水泥P.O42.5",specValues:"50kg/袋",unit:"袋",referencePrice:28,quantity:100,remark:""},{skuId:"SKU003",skuCode:"SKU003",productName:"抛光砖",specValues:"800×800mm",unit:"片",referencePrice:45,quantity:500,remark:"优先选择广东品牌"}],T.value=!0}function qe(s){p.value={...s,skuList:[{skuCode:"SKU001",productName:"普通硅酸盐水泥P.O42.5",specValues:"50kg/袋",unit:"袋",referencePrice:28,quantity:100,remark:""},{skuCode:"SKU003",productName:"抛光砖",specValues:"800×800mm",unit:"片",referencePrice:45,quantity:500,remark:"优先选择广东品牌"},{skuCode:"SKU004",productName:"内墙乳胶漆",specValues:"20L/桶",unit:"桶",referencePrice:380,quantity:20,remark:""}]},ee.value=!0}function $e(s){p.value={...s},h.value=[],W.value="",H.value=!0}function Be(s){p.value={...s},h.value=[],W.value="",H.value=!0}function De(){if(h.value.length===0){V.warning("请选择至少一个仓库");return}const s=h.value.map(e=>{const d=J.value.find(C=>C.id===e),m=E.value.find(C=>C.subWarehouses.some(L=>L.id===e));return{warehouseId:e,warehouseName:(d==null?void 0:d.name)||"",warehouseParentName:(m==null?void 0:m.warehouseName)||"",status:"pending",pushTime:new Date().toLocaleString(),confirmedItems:[],totalConfirmedQuantity:0}});p.value.pushList||(p.value.pushList=[]),p.value.pushList.push(...s),p.value.status="published",V.success(`已推送到 ${h.value.length} 个仓库`),H.value=!1}function re(s,e){de.value=!1,e.confirmedItems&&e.confirmedItems.length===0&&(e.confirmedItems=[{skuCode:"SKU001",productName:"32.5级普通硅酸盐水泥",specValues:"强度:32.5级",unit:"吨",planQuantity:100,confirmedQuantity:95,remark:"库存不足"},{skuCode:"SKU002",productName:"河沙（中粗）",specValues:"颗粒:中粗砂",unit:"方",planQuantity:200,confirmedQuantity:200,remark:""},{skuCode:"SKU003",productName:"碎石(5-20mm)",specValues:"粒径:5-20mm",unit:"方",planQuantity:150,confirmedQuantity:140,remark:"缺货"}],e.totalConfirmedQuantity=435,e.confirmTime=new Date().toLocaleString()),N.value=e,B.value=!0}function Re(s,e){de.value=!0,p.value=s,N.value=e,(!e.confirmedItems||e.confirmedItems.length===0)&&(e.confirmedItems=(s.skuList||[]).map(d=>({skuCode:d.skuCode,productName:d.productName,specValues:d.specValues,unit:d.unit,planQuantity:d.quantity,confirmedQuantity:d.quantity,remark:""}))),B.value=!0}function Fe(s,e){p.value=s,Ue.value=e,be.reason="",xe.value=!0}function Me(s){s.status="cancelled",s.cancelTime=new Date().toLocaleString(),V.success("计划已取消，相关采购单已作废")}function je(s){const e=Y.value.findIndex(d=>d.id===s.id);e>-1&&(Y.value.splice(e,1),V.success("删除成功"))}function Ee(){S.value=[],Q.value="",$.value="",q.value=!0}function Ye(){const e=G.value.flatMap(d=>d.skuList).filter(d=>S.value.includes(d.skuId)).filter(d=>!v.skuList.some(m=>m.skuId===d.skuId)).map(d=>({...d,quantity:1,remark:""}));v.skuList.push(...e),S.value=[],q.value=!1,V.success(`已添加 ${e.length} 个SKU`)}function Je(s){v.skuList.splice(s,1)}function Xe(){if(!v.planName){V.warning("请输入计划名称");return}if(v.skuList.length===0){V.warning("请添加采购商品");return}if(A.value)V.success("保存成功");else{const s={id:Date.now().toString(),planNo:`PO${Date.now().toString().slice(-8)}`,planName:v.planName,skuCount:v.skuList.length,estimatedAmount:parseFloat(oe.value),status:"draft",createTime:new Date().toLocaleString(),description:v.description,pushList:[]};Y.value.unshift(s),V.success("创建成功，请发布到工程仓")}T.value=!1}function me(s){return{draft:"gray",published:"blue",partial:"orange",confirmed:"cyan",completed:"green",cancelled:"red"}[s]||"gray"}function ce(s){return{draft:"草稿",published:"已发布",partial:"部分确认",confirmed:"全部确认",completed:"已完成",cancelled:"已取消"}[s]||s}function te(s){return{pending:"orange",confirmed:"green",rejected:"red",cancelled:"red"}[s]||"gray"}function ae(s){return{pending:"待确认",confirmed:"已确认",rejected:"已拒绝",cancelled:"已取消"}[s]||s}return(s,e)=>{const d=c("icon-plus"),m=c("a-button"),C=c("a-input"),L=c("a-form-item"),w=c("a-option"),pe=c("a-select"),Ze=c("icon-search"),D=c("a-space"),fe=c("a-form"),r=c("a-table-column"),Ge=c("icon-right"),I=c("a-tag"),et=c("a-link"),tt=c("a-popover"),ve=c("a-popconfirm"),O=c("a-table"),at=c("a-card"),lt=c("a-col"),st=c("a-row"),nt=c("a-textarea"),R=c("a-divider"),ut=c("a-input-number"),F=c("a-modal"),ke=c("a-input-search"),le=c("a-checkbox"),it=c("a-collapse-item"),ot=c("a-collapse"),dt=c("a-alert"),_=c("a-descriptions-item"),se=c("a-descriptions");return f(),y("div",ft,[t(pt,{items:ge}),t(at,{bordered:!1},{title:l(()=>[...e[20]||(e[20]=[u("span",null,"采购计划管理",-1)])]),extra:l(()=>[t(m,{type:"primary",onClick:ze},{icon:l(()=>[t(d)]),default:l(()=>[e[21]||(e[21]=n(" 创建采购计划 ",-1))]),_:1})]),default:l(()=>[u("div",vt,[t(fe,{model:g,layout:"inline"},{default:l(()=>[t(L,{label:"计划编号"},{default:l(()=>[t(C,{modelValue:g.planNo,"onUpdate:modelValue":e[0]||(e[0]=a=>g.planNo=a),placeholder:"请输入计划编号","allow-clear":""},null,8,["modelValue"])]),_:1}),t(L,{label:"计划名称"},{default:l(()=>[t(C,{modelValue:g.planName,"onUpdate:modelValue":e[1]||(e[1]=a=>g.planName=a),placeholder:"请输入计划名称","allow-clear":""},null,8,["modelValue"])]),_:1}),t(L,{label:"计划状态"},{default:l(()=>[t(pe,{modelValue:g.status,"onUpdate:modelValue":e[2]||(e[2]=a=>g.status=a),placeholder:"请选择状态","allow-clear":"",style:{width:"140px"}},{default:l(()=>[t(w,{value:"draft"},{default:l(()=>[...e[22]||(e[22]=[n("草稿",-1)])]),_:1}),t(w,{value:"published"},{default:l(()=>[...e[23]||(e[23]=[n("已发布",-1)])]),_:1}),t(w,{value:"partial"},{default:l(()=>[...e[24]||(e[24]=[n("部分确认",-1)])]),_:1}),t(w,{value:"confirmed"},{default:l(()=>[...e[25]||(e[25]=[n("全部确认",-1)])]),_:1}),t(w,{value:"completed"},{default:l(()=>[...e[26]||(e[26]=[n("已完成",-1)])]),_:1}),t(w,{value:"cancelled"},{default:l(()=>[...e[27]||(e[27]=[n("已取消",-1)])]),_:1})]),_:1},8,["modelValue"])]),_:1}),t(L,null,{default:l(()=>[t(D,null,{default:l(()=>[t(m,{type:"primary",onClick:Te},{icon:l(()=>[t(Ze)]),default:l(()=>[e[28]||(e[28]=n(" 搜索 ",-1))]),_:1}),t(m,{onClick:He},{default:l(()=>[...e[29]||(e[29]=[n("重置",-1)])]),_:1})]),_:1})]),_:1})]),_:1},8,["model"])]),t(O,{data:ye.value,loading:he.value,pagination:Z,"row-key":"id",onPageChange:Oe},{columns:l(()=>[t(r,{title:"计划编号","data-index":"planNo",width:150}),t(r,{title:"计划名称","data-index":"planName",width:200}),t(r,{title:"SKU数量",width:100,align:"center"},{cell:l(({record:a})=>[n(i(a.skuCount)+" 个 ",1)]),_:1}),t(r,{title:"预计金额",width:120,align:"right"},{cell:l(({record:a})=>{var o;return[n(" ¥"+i(((o=a.estimatedAmount)==null?void 0:o.toLocaleString())||"0"),1)]}),_:1}),t(r,{title:"推送仓库",width:180},{cell:l(({record:a})=>[a.pushList&&a.pushList.length>0?(f(),P(tt,{key:0,trigger:"hover"},{content:l(()=>[u("div",_t,[(f(!0),y(z,null,M(a.pushList,o=>(f(),y("div",{key:o.warehouseId,class:"push-item"},[u("div",gt,[u("div",null,[u("span",ht,i(o.warehouseParentName),1),u("span",yt,i(o.warehouseName),1)]),t(I,{color:te(o.status),size:"small"},{default:l(()=>[n(i(ae(o.status)),1)]),_:2},1032,["color"])]),o.status==="pending"?(f(),y("div",St,[t(m,{type:"text",size:"small",status:"success",onClick:j(x=>Re(a,o),["stop"])},{default:l(()=>[...e[30]||(e[30]=[n(" 确认收货 ",-1)])]),_:1},8,["onClick"]),t(m,{type:"text",size:"small",status:"danger",onClick:j(x=>Fe(a,o),["stop"])},{default:l(()=>[...e[31]||(e[31]=[n(" 拒绝 ",-1)])]),_:1},8,["onClick"])])):U("",!0),o.status==="confirmed"&&o.totalConfirmedQuantity>0?(f(),y("div",Nt,[e[33]||(e[33]=n(" 确认数量: ",-1)),u("strong",null,i(o.totalConfirmedQuantity),1),e[34]||(e[34]=n(" 件 ",-1)),t(et,{size:"small",onClick:j(x=>re(a,o),["stop"])},{default:l(()=>[...e[32]||(e[32]=[n(" 查看明细 ",-1)])]),_:1},8,["onClick"])])):U("",!0),o.status==="rejected"?(f(),y("div",Ct," 拒绝原因："+i(o.rejectReason||"未填写"),1)):U("",!0)]))),128))])]),default:l(()=>[u("span",kt,[n(i(a.pushList.length)+" 个仓库 ",1),t(Ge)])]),_:2},1024)):(f(),y("span",wt,"-"))]),_:1}),t(r,{title:"计划状态",width:100},{cell:l(({record:a})=>[t(I,{color:me(a.status)},{default:l(()=>[n(i(ce(a.status)),1)]),_:2},1032,["color"])]),_:1}),t(r,{title:"创建时间",width:160},{cell:l(({record:a})=>[n(i(a.createTime),1)]),_:1}),t(r,{title:"操作",width:220,fixed:"right"},{cell:l(({record:a})=>[t(D,null,{default:l(()=>[t(m,{type:"text",size:"small",onClick:o=>qe(a)},{default:l(()=>[...e[35]||(e[35]=[n("查看",-1)])]),_:1},8,["onClick"]),a.status==="draft"?(f(),P(m,{key:0,type:"text",size:"small",onClick:o=>Ae(a)},{default:l(()=>[...e[36]||(e[36]=[n(" 编辑 ",-1)])]),_:1},8,["onClick"])):U("",!0),a.status==="draft"?(f(),P(m,{key:1,type:"text",size:"small",status:"success",onClick:o=>$e(a)},{default:l(()=>[...e[37]||(e[37]=[n(" 发布 ",-1)])]),_:1},8,["onClick"])):U("",!0),a.status==="published"||a.status==="partial"?(f(),P(m,{key:2,type:"text",size:"small",onClick:o=>Be(a)},{default:l(()=>[...e[38]||(e[38]=[n(" 继续推送 ",-1)])]),_:1},8,["onClick"])):U("",!0),a.status==="draft"?(f(),P(ve,{key:3,content:"确定要删除此计划吗？",onOk:o=>je(a)},{default:l(()=>[t(m,{type:"text",size:"small",status:"danger"},{default:l(()=>[...e[39]||(e[39]=[n("删除",-1)])]),_:1})]),_:1},8,["onOk"])):U("",!0),a.status==="published"||a.status==="partial"?(f(),P(ve,{key:4,content:"取消后已生成的采购单也将作废，确定吗？",onOk:o=>Me(a)},{default:l(()=>[t(m,{type:"text",size:"small",status:"danger"},{default:l(()=>[...e[40]||(e[40]=[n("取消计划",-1)])]),_:1})]),_:1},8,["onOk"])):U("",!0)]),_:2},1024)]),_:1})]),_:1},8,["data","loading","pagination"])]),_:1}),t(F,{visible:T.value,"onUpdate:visible":e[6]||(e[6]=a=>T.value=a),title:A.value?"编辑采购计划":"创建采购计划",width:1e3,footer:!1,"unmount-on-close":""},{default:l(()=>[t(fe,{model:v,layout:"vertical"},{default:l(()=>[t(st,{gutter:16},{default:l(()=>[t(lt,{span:24},{default:l(()=>[t(L,{label:"计划名称",required:""},{default:l(()=>[t(C,{modelValue:v.planName,"onUpdate:modelValue":e[3]||(e[3]=a=>v.planName=a),placeholder:"请输入计划名称"},null,8,["modelValue"])]),_:1})]),_:1})]),_:1}),t(L,{label:"计划说明"},{default:l(()=>[t(nt,{modelValue:v.description,"onUpdate:modelValue":e[4]||(e[4]=a=>v.description=a),placeholder:"请输入计划说明（选填）","max-length":500},null,8,["modelValue"])]),_:1}),t(R,null,{default:l(()=>[...e[41]||(e[41]=[n("采购商品清单",-1)])]),_:1}),u("div",Pt,[t(m,{type:"outline",onClick:Ee},{icon:l(()=>[t(d)]),default:l(()=>[e[42]||(e[42]=n(" 添加商品 ",-1))]),_:1})]),t(O,{data:v.skuList,pagination:!1,style:{"margin-top":"16px"}},{columns:l(()=>[t(r,{title:"SKU编码","data-index":"skuCode",width:120}),t(r,{title:"商品名称",width:200},{cell:l(({record:a})=>[u("div",null,i(a.productName),1),u("div",xt,i(a.specValues),1)]),_:1}),t(r,{title:"单位","data-index":"unit",width:60,align:"center"}),t(r,{title:"建议采购量",width:120},{cell:l(({record:a})=>[t(ut,{modelValue:a.quantity,"onUpdate:modelValue":o=>a.quantity=o,min:1,max:99999,style:{width:"100%"}},null,8,["modelValue","onUpdate:modelValue"])]),_:1}),t(r,{title:"供货价",width:100,align:"right"},{cell:l(({record:a})=>[n(" ¥"+i(a.referencePrice),1)]),_:1}),t(r,{title:"预计金额",width:100,align:"right"},{cell:l(({record:a})=>[n(" ¥"+i((a.quantity*a.referencePrice).toFixed(2)),1)]),_:1}),t(r,{title:"备注",width:150},{cell:l(({record:a})=>[t(C,{modelValue:a.remark,"onUpdate:modelValue":o=>a.remark=o,placeholder:"备注"},null,8,["modelValue","onUpdate:modelValue"])]),_:1}),t(r,{title:"操作",width:80,fixed:"right"},{cell:l(({rowIndex:a})=>[t(m,{type:"text",size:"small",status:"danger",onClick:o=>Je(a)},{default:l(()=>[...e[43]||(e[43]=[n(" 删除 ",-1)])]),_:1},8,["onClick"])]),_:1})]),_:1},8,["data"]),u("div",Ut,[u("div",bt,[u("span",null,[e[44]||(e[44]=n("共 ",-1)),u("strong",null,i(v.skuList.length),1),e[45]||(e[45]=n(" 个SKU",-1))]),u("span",Vt,[e[46]||(e[46]=n(" 预计总金额：",-1)),u("strong",Kt,"¥"+i(oe.value),1)])]),t(D,null,{default:l(()=>[t(m,{onClick:e[5]||(e[5]=a=>T.value=!1)},{default:l(()=>[...e[47]||(e[47]=[n("取消",-1)])]),_:1}),t(m,{type:"primary",onClick:Xe},{default:l(()=>[n(i(A.value?"保存":"创建"),1)]),_:1})]),_:1})])]),_:1},8,["model"])]),_:1},8,["visible","title"]),t(F,{visible:q.value,"onUpdate:visible":e[12]||(e[12]=a=>q.value=a),title:"选择商品",width:1e3,footer:!1},{default:l(()=>[u("div",Lt,[u("div",It,[t(ke,{modelValue:Q.value,"onUpdate:modelValue":e[7]||(e[7]=a=>Q.value=a),placeholder:"搜索商品名称或SPU编码",style:{width:"300px"}},null,8,["modelValue"]),t(pe,{modelValue:$.value,"onUpdate:modelValue":e[8]||(e[8]=a=>$.value=a),placeholder:"选择分类","allow-clear":"",style:{width:"150px","margin-left":"12px"}},{default:l(()=>[t(w,{value:"cement"},{default:l(()=>[...e[48]||(e[48]=[n("水泥建材",-1)])]),_:1}),t(w,{value:"steel"},{default:l(()=>[...e[49]||(e[49]=[n("钢材钢筋",-1)])]),_:1}),t(w,{value:"ceramic"},{default:l(()=>[...e[50]||(e[50]=[n("陶瓷瓷砖",-1)])]),_:1}),t(w,{value:"paint"},{default:l(()=>[...e[51]||(e[51]=[n("涂料油漆",-1)])]),_:1})]),_:1},8,["modelValue"])]),u("div",Qt,[t(ot,{"active-keys":ue.value,"onUpdate:activeKeys":e[10]||(e[10]=a=>ue.value=a),"default-active-key":Se.value,bordered:""},{default:l(()=>[(f(!0),y(z,null,M(ie.value,a=>(f(),P(it,{key:a.spuId,name:a.spuId},{header:l(()=>[u("div",Wt,[t(le,{"model-value":Ne(a),indeterminate:Ce(a),onChange:o=>we(a,o),onClick:e[9]||(e[9]=j(()=>{},["stop"]))},null,8,["model-value","indeterminate","onChange"]),u("div",Tt,[u("span",Ht,i(a.spuName),1),t(I,{color:"blue",size:"small"},{default:l(()=>[n(i(a.categoryName),1)]),_:2},1024),u("span",Ot," 共 "+i(a.skuList.length)+" 个SKU规格 ",1)])])]),default:l(()=>[t(O,{data:a.skuList,pagination:!1,size:"small","row-key":"skuId","row-selection":Pe(a),bordered:!1},{columns:l(()=>[t(r,{title:"SKU编码","data-index":"skuCode",width:120}),t(r,{title:"规格信息",width:280},{cell:l(({record:o})=>[u("div",zt,[(f(!0),y(z,null,M(o.specs,(x,rt)=>(f(),P(I,{key:rt,size:"small",color:"gray",style:{"margin-right":"4px","margin-bottom":"4px"}},{default:l(()=>[n(i(x.name)+": "+i(x.value),1)]),_:2},1024))),128))])]),_:1}),t(r,{title:"单位","data-index":"unit",width:60,align:"center"}),t(r,{title:"参考价",width:100,align:"right"},{cell:l(({record:o})=>[u("span",At,"¥"+i(o.referencePrice),1)]),_:1})]),_:1},8,["data","row-selection"])]),_:2},1032,["name"]))),128))]),_:1},8,["active-keys","default-active-key"])]),u("div",qt,[u("span",null,[e[52]||(e[52]=n("已选择 ",-1)),u("strong",null,i(S.value.length),1),e[53]||(e[53]=n(" 个SKU",-1))]),t(D,null,{default:l(()=>[t(m,{onClick:e[11]||(e[11]=a=>q.value=!1)},{default:l(()=>[...e[54]||(e[54]=[n("取消",-1)])]),_:1}),t(m,{type:"primary",disabled:S.value.length===0,onClick:Ye},{default:l(()=>[...e[55]||(e[55]=[n(" 确认添加 ",-1)])]),_:1},8,["disabled"])]),_:1})])])]),_:1},8,["visible"]),t(F,{visible:H.value,"onUpdate:visible":e[16]||(e[16]=a=>H.value=a),title:"发布采购计划",width:700,footer:!1,"unmount-on-close":""},{default:l(()=>[t(dt,{type:"info",style:{"margin-bottom":"16px"}},{default:l(()=>[...e[56]||(e[56]=[n(" 选择要推送的工程仓，计划将发送给选中的工程仓进行确认下单。 ",-1)])]),_:1}),t(se,{column:2,bordered:"",size:"small",style:{"margin-bottom":"16px"}},{default:l(()=>[t(_,{label:"计划编号"},{default:l(()=>[n(i(p.value.planNo),1)]),_:1}),t(_,{label:"计划名称"},{default:l(()=>[n(i(p.value.planName),1)]),_:1}),t(_,{label:"SKU数量"},{default:l(()=>[n(i(p.value.skuCount)+" 个",1)]),_:1}),t(_,{label:"预计金额"},{default:l(()=>{var a;return[n("¥"+i((a=p.value.estimatedAmount)==null?void 0:a.toLocaleString()),1)]}),_:1})]),_:1}),t(R,null,{default:l(()=>[...e[57]||(e[57]=[n("选择工程仓仓库",-1)])]),_:1}),u("div",$t,[u("div",Bt,[t(le,{"model-value":Ke.value,indeterminate:Le.value,onChange:Qe},{default:l(()=>[...e[58]||(e[58]=[n(" 全选 ",-1)])]),_:1},8,["model-value","indeterminate"]),t(ke,{modelValue:W.value,"onUpdate:modelValue":e[13]||(e[13]=a=>W.value=a),placeholder:"搜索工程仓/仓库",style:{width:"200px"}},null,8,["modelValue"])]),u("div",Dt,[(f(!0),y(z,null,M(Ve.value,a=>(f(),y("div",{key:a.warehouseId,class:"warehouse-group"},[u("div",Rt,[u("span",Ft,i(a.warehouseName),1),u("span",Mt,i(a.warehouseDesc),1)]),u("div",jt,[(f(!0),y(z,null,M(a.subWarehouses,o=>(f(),y("div",{key:o.id,class:_e(["warehouse-item",{"is-selected":h.value.includes(o.id),"is-pushed":K(o.id)}]),onClick:x=>We(o.id)},[t(le,{"model-value":h.value.includes(o.id),disabled:K(o.id),onClick:e[14]||(e[14]=j(()=>{},["stop"]))},null,8,["model-value","disabled"]),u("div",Yt,[u("span",Jt,"📦 "+i(o.name),1),u("span",Xt,i(o.address),1)]),K(o.id)?(f(),P(I,{key:0,color:"arcoblue",size:"small"},{default:l(()=>[...e[59]||(e[59]=[n("已推送",-1)])]),_:1})):U("",!0)],10,Et))),128))])]))),128))])]),u("div",Zt,[u("div",Gt,[e[60]||(e[60]=n(" 已选择 ",-1)),u("strong",null,i(Ie.value),1),e[61]||(e[61]=n(" 个工程仓 ",-1))]),t(D,null,{default:l(()=>[t(m,{onClick:e[15]||(e[15]=a=>H.value=!1)},{default:l(()=>[...e[62]||(e[62]=[n("取消",-1)])]),_:1}),t(m,{type:"primary",disabled:h.value.length===0,onClick:De},{default:l(()=>[...e[63]||(e[63]=[n(" 确认发布 ",-1)])]),_:1},8,["disabled"])]),_:1})])]),_:1},8,["visible"]),t(F,{visible:ee.value,"onUpdate:visible":e[17]||(e[17]=a=>ee.value=a),title:"采购计划详情",width:1100,footer:!1},{default:l(()=>[t(se,{column:3,bordered:""},{default:l(()=>[t(_,{label:"计划编号"},{default:l(()=>[n(i(p.value.planNo),1)]),_:1}),t(_,{label:"计划名称"},{default:l(()=>[n(i(p.value.planName),1)]),_:1}),t(_,{label:"计划状态"},{default:l(()=>[t(I,{color:me(p.value.status)},{default:l(()=>[n(i(ce(p.value.status)),1)]),_:1},8,["color"])]),_:1}),t(_,{label:"SKU数量"},{default:l(()=>[n(i(p.value.skuCount)+" 个",1)]),_:1}),t(_,{label:"预计金额"},{default:l(()=>{var a;return[n("¥"+i((a=p.value.estimatedAmount)==null?void 0:a.toLocaleString()),1)]}),_:1}),t(_,{label:"创建时间"},{default:l(()=>[n(i(p.value.createTime),1)]),_:1}),t(_,{label:"计划说明",span:3},{default:l(()=>[n(i(p.value.description||"-"),1)]),_:1})]),_:1}),t(R,null,{default:l(()=>[...e[64]||(e[64]=[n("推送工程仓状态",-1)])]),_:1}),t(O,{data:p.value.pushList||[],pagination:!1,style:{"margin-bottom":"16px"}},{columns:l(()=>[t(r,{title:"工程仓",width:180},{cell:l(({record:a})=>[u("div",null,[u("div",ea,i(a.warehouseParentName),1),u("div",null,i(a.warehouseName),1)])]),_:1}),t(r,{title:"状态",width:100},{cell:l(({record:a})=>[t(I,{color:te(a.status)},{default:l(()=>[n(i(ae(a.status)),1)]),_:2},1032,["color"])]),_:1}),t(r,{title:"确认汇总",width:200},{cell:l(({record:a})=>{var o,x;return[a.status==="confirmed"?(f(),y(z,{key:0},[u("div",ta,[e[65]||(e[65]=u("span",null,"SKU: ",-1)),u("strong",aa,i(((o=a.confirmedItems)==null?void 0:o.length)||0),1),e[66]||(e[66]=u("span",{style:{margin:"0 8px"}},"/",-1)),u("span",null,i(((x=p.value.skuList)==null?void 0:x.length)||0),1)]),u("div",la,[e[67]||(e[67]=u("span",null,"数量: ",-1)),u("strong",sa,i(a.totalConfirmedQuantity||0),1)])],64)):(f(),y("span",na,"-"))]}),_:1}),t(r,{title:"推送时间","data-index":"pushTime",width:160}),t(r,{title:"确认时间",width:160},{cell:l(({record:a})=>[n(i(a.confirmTime||"-"),1)]),_:1}),t(r,{title:"操作",width:120,fixed:"right"},{cell:l(({record:a})=>[a.status==="confirmed"?(f(),P(m,{key:0,type:"text",size:"small",onClick:o=>re(p.value,a)},{default:l(()=>[...e[68]||(e[68]=[n(" 查看明细 ",-1)])]),_:1},8,["onClick"])):(f(),y("span",ua,"-"))]),_:1})]),_:1},8,["data"]),t(R,null,{default:l(()=>[...e[69]||(e[69]=[n("采购商品清单",-1)])]),_:1}),t(O,{data:p.value.skuList||[],pagination:!1},{columns:l(()=>[t(r,{title:"SKU编码","data-index":"skuCode",width:120}),t(r,{title:"商品名称",width:200},{cell:l(({record:a})=>[u("div",null,i(a.productName),1),u("div",ia,i(a.specValues),1)]),_:1}),t(r,{title:"单位","data-index":"unit",width:60,align:"center"}),t(r,{title:"建议采购量","data-index":"quantity",width:100,align:"center"}),t(r,{title:"供货价",width:100,align:"right"},{cell:l(({record:a})=>[n(" ¥"+i(a.referencePrice),1)]),_:1}),t(r,{title:"预计金额",width:100,align:"right"},{cell:l(({record:a})=>[n(" ¥"+i((a.quantity*a.referencePrice).toFixed(2)),1)]),_:1}),t(r,{title:"备注","data-index":"remark",width:150})]),_:1},8,["data"])]),_:1},8,["visible"]),t(F,{visible:B.value,"onUpdate:visible":e[19]||(e[19]=a=>B.value=a),title:`${N.value.warehouseParentName} - ${N.value.warehouseName} 确认明细`,width:1e3,footer:!1},{default:l(()=>[t(se,{column:3,bordered:"",size:"small"},{default:l(()=>[t(_,{label:"所属工程仓"},{default:l(()=>[n(i(N.value.warehouseParentName),1)]),_:1}),t(_,{label:"确认仓库"},{default:l(()=>[n(i(N.value.warehouseName),1)]),_:1}),t(_,{label:"确认状态"},{default:l(()=>[t(I,{color:te(N.value.status)},{default:l(()=>[n(i(ae(N.value.status)),1)]),_:1},8,["color"])]),_:1}),t(_,{label:"推送时间"},{default:l(()=>[n(i(N.value.pushTime),1)]),_:1}),t(_,{label:"确认时间"},{default:l(()=>[n(i(N.value.confirmTime||"-"),1)]),_:1}),t(_,{label:"确认总数量"},{default:l(()=>[u("strong",oa,i(N.value.totalConfirmedQuantity||0),1),e[70]||(e[70]=n(" 件 ",-1))]),_:1})]),_:1}),t(R,null,{default:l(()=>[...e[71]||(e[71]=[n("确认商品明细",-1)])]),_:1}),t(O,{data:N.value.confirmedItems||[],pagination:!1},{columns:l(()=>[t(r,{title:"SKU编码","data-index":"skuCode",width:120}),t(r,{title:"商品名称",width:200},{cell:l(({record:a})=>[u("div",null,i(a.productName),1),u("div",da,i(a.specValues),1)]),_:1}),t(r,{title:"单位","data-index":"unit",width:60,align:"center"}),t(r,{title:"计划采购量",width:100,align:"right"},{cell:l(({record:a})=>[n(i(a.planQuantity),1)]),_:1}),t(r,{title:"实际确认量",width:100,align:"right"},{cell:l(({record:a})=>[u("span",{class:_e(a.confirmedQuantity<a.planQuantity?"text-warning":"text-success")},i(a.confirmedQuantity),3)]),_:1}),t(r,{title:"差异数量",width:100,align:"right"},{cell:l(({record:a})=>[u("span",ra,i(a.planQuantity-a.confirmedQuantity),1)]),_:1})]),_:1},8,["data"]),u("div",ma,[t(m,{onClick:e[18]||(e[18]=a=>B.value=!1)},{default:l(()=>[...e[72]||(e[72]=[n("关闭",-1)])]),_:1})])]),_:1},8,["visible","title"])])}}}),ka=ct(ca,[["__scopeId","data-v-ecc2b736"]]);export{ka as default};
//# sourceMappingURL=index-BPMnygiI.js.map
