---
name: "prd-generator-helper"
description: "Generate structured PRD documents for B2B supply chain systems. Invoke when writing product specs, creating feature lists, or need PRD templates."
---

# PRD生成助手

专为工程仓B2B供应链系统定制的产品需求生成器，完全贴合线下生意的信任机制和业务逻辑。

## 核心能力

1. **需求分层输出** - 从业务灵魂到页面细节，四层输出
2. **状态机设计** - 订单/支付/发货三状态独立设计专家
3. **功能全景清单** - 按端/模块/页面自动罗列排期表
4. **内置PRD数据库** - 自动关联页面悬浮入口

## 使用流程

当用户需要写PRD时，按以下顺序执行：

### Step 1 - 业务灵魂确认（必须先做！）
```markdown
## 核心设计原则（这3条是灵魂！）
| 状态 | 说明 | 彼此独立 |
|------|------|---------|
| 订单状态 | 已确认/已完成/已取消 | 不依赖支付 |
| 支付状态 | 未支付/已支付（只做标记） | 不影响发货 |
| 发货状态 | 待发货/部分发货/已发货 | 不管付没付钱都能发 |

> 线下生意就是这样，工程仓说"先发货，钱下午转"，供应商就直接发了
> 系统不做强校验，只做状态记录！
```

### Step 2 - 功能全景输出
按以下CSV格式输出所有端的功能清单：
```csv
所属端,模块,一级菜单,二级菜单,核心功能点,物理文件,开发优先级,备注
```

### Step 3 - 页面级PRD设计
每个页面的PRD自动生成，同时写入PrdPanel组件的数据库，格式：
```typescript
const prdDatabase = {
  '/路由路径': {
    name: '页面名称',
    items: [
      { reqId: 1, moduleName: '模块名', content: `PRD内容` }
    ]
  }
}
```

### Step 4 - 业务流程图
使用Mermaid语法，重点突出：
- 分批发货场景
- 货损售后补发
- 线下转账凭证
- 发票关联流程

## 黄金准则

❌ **绝对禁止的错误写法：**
```typescript
// 判断能不能发货
&& order.payment_status === 'paid'   ← 千万不要加！
```

✅ **正确写法：**
```typescript
const canShip = computed(() => {
  return order.order_status === 'confirmed' 
      && order.ship_status !== 'shipped'
})
```

## 四端边界

| 端 | 核心诉求 | 禁忌功能 |
|-----|---------|---------|
| 平台端 | 控品、对账、看全局 | 不要干预业务执行 |
| 工程仓端 | 买货、入库、卖给施工方 | 不要做在线支付 |
| 供应商端 | 接单、发货、收钱 | 不要做商品录入 |
| 施工方端 | 小程序下单收货 | 不要搞复杂后台 |

> 记住：我们做的不是淘宝，是「熟人圈子里的建材生意」
