"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "index",
  setup(__props, { expose: __expose }) {
    __expose();
    const userInfo = common_vendor.ref({
      name: "张三",
      company: "深圳湾科技园项目仓"
    });
    const unreadCount = common_vendor.ref(5);
    const dataTab = common_vendor.ref("today");
    const noticeType = common_vendor.ref("all");
    const dashboardData = common_vendor.computed(() => {
      const data = {
        today: [
          { label: "今日订单", value: "28", color: "#165dff", bgColor: "#e8f3ff", icon: "📋", trend: 12 },
          { label: "今日销售额", value: "¥58,920", color: "#00b42a", bgColor: "#e8ffea", icon: "💰", trend: 8 },
          { label: "待发货", value: "12", color: "#ff7d00", bgColor: "#fff7e8", icon: "📦", trend: 0 },
          { label: "待处理售后", value: "3", color: "#f53f3f", bgColor: "#ffece8", icon: "🔄", trend: -5 },
          { label: "待开票", value: "8", color: "#722ed1", bgColor: "#f2e8ff", icon: "📄", trend: 0 },
          { label: "低库存预警", value: "5", color: "#f53f3f", bgColor: "#ffece8", icon: "⚠️", trend: 0 }
        ],
        week: [
          { label: "本周订单", value: "186", color: "#165dff", bgColor: "#e8f3ff", icon: "📋", trend: 15 },
          { label: "本周销售额", value: "¥398,520", color: "#00b42a", bgColor: "#e8ffea", icon: "💰", trend: 22 },
          { label: "待发货", value: "12", color: "#ff7d00", bgColor: "#fff7e8", icon: "📦", trend: 0 },
          { label: "待处理售后", value: "3", color: "#f53f3f", bgColor: "#ffece8", icon: "🔄", trend: 0 },
          { label: "待开票", value: "8", color: "#722ed1", bgColor: "#f2e8ff", icon: "📄", trend: 0 },
          { label: "低库存预警", value: "5", color: "#f53f3f", bgColor: "#ffece8", icon: "⚠️", trend: 0 }
        ],
        month: [
          { label: "本月订单", value: "756", color: "#165dff", bgColor: "#e8f3ff", icon: "📋", trend: 18 },
          { label: "本月销售额", value: "¥1,528,900", color: "#00b42a", bgColor: "#e8ffea", icon: "💰", trend: 25 },
          { label: "待发货", value: "12", color: "#ff7d00", bgColor: "#fff7e8", icon: "📦", trend: 0 },
          { label: "待处理售后", value: "3", color: "#f53f3f", bgColor: "#ffece8", icon: "🔄", trend: 0 },
          { label: "待开票", value: "8", color: "#722ed1", bgColor: "#f2e8ff", icon: "📄", trend: 0 },
          { label: "低库存预警", value: "5", color: "#f53f3f", bgColor: "#ffece8", icon: "⚠️", trend: 0 }
        ]
      };
      return data[dataTab.value];
    });
    const quickTools = common_vendor.ref([
      { id: 1, name: "扫码发货", icon: "📦", bgColor: "#e8f3ff", badge: "12" },
      { id: 2, name: "发起采购", icon: "🛒", bgColor: "#fff7e8" },
      { id: 3, name: "BOM采购", icon: "📋", bgColor: "#e8ffea" },
      { id: 4, name: "快速补货", icon: "⚡", bgColor: "#f2e8ff" },
      { id: 5, name: "库存预警", icon: "⚠️", bgColor: "#ffece8", badge: "5" },
      { id: 6, name: "收货入库", icon: "📥", bgColor: "#e8fff3", badge: "3" },
      { id: 7, name: "扫码入库", icon: "📷", bgColor: "#f0f5ff" },
      { id: 8, name: "更多功能", icon: "⋯", bgColor: "#f7f8fa" }
    ]);
    const notices = common_vendor.ref([
      { id: 1, type: "order", title: "待发货提醒", desc: "您有12笔订单待发货，请及时处理", time: "10分钟前", icon: "📦", bgColor: "#e8f3ff", actionText: "立即处理", isRead: false },
      { id: 2, type: "stock", title: "库存预警", desc: "水泥P.O 42.5库存不足，当前库存50吨，低于预警线", time: "1小时前", icon: "⚠️", bgColor: "#ffece8", actionText: "立即补货", isRead: false },
      { id: 3, type: "order", title: "采购订单状态", desc: "采购订单PO2024010001已发货，预计明日到达", time: "2小时前", icon: "🚚", bgColor: "#e8ffea", actionText: "查看详情", isRead: true },
      { id: 4, type: "finance", title: "开票提醒", desc: "销售订单SO2024010012待开票，金额¥4,500.00", time: "3小时前", icon: "📄", bgColor: "#fff7e8", actionText: "去开票", isRead: true },
      { id: 5, type: "finance", title: "收款到账", desc: "销售订单SO2024010010已收款¥21,000.00", time: "5小时前", icon: "💰", bgColor: "#e8ffea", isRead: true },
      { id: 6, type: "stock", title: "入库完成", desc: "采购订单PO2024010002已入库完成，共10吨", time: "昨天", icon: "📥", bgColor: "#e8fff3", isRead: true }
    ]);
    const filteredNotices = common_vendor.computed(() => {
      if (noticeType.value === "all") return notices.value;
      return notices.value.filter((n) => n.type === noticeType.value);
    });
    const pendingList = common_vendor.ref([
      { id: 1, title: "待发货订单", desc: "需要尽快处理发货", count: 12, icon: "📦", bgColor: "#e8f3ff" },
      { id: 2, title: "待确认采购", desc: "供应商已报价待确认", count: 5, icon: "🛒", bgColor: "#fff7e8" },
      { id: 3, title: "待收货入库", desc: "采购订单在途待入库", count: 3, icon: "📥", bgColor: "#e8fff3" },
      { id: 4, title: "待处理售后", desc: "客户申请售后待处理", count: 3, icon: "🔄", bgColor: "#ffece8" },
      { id: 5, title: "待开票订单", desc: "已完成订单待开票", count: 8, icon: "📄", bgColor: "#f2e8ff" },
      { id: 6, title: "库存预警", desc: "商品库存低于预警线", count: 5, icon: "⚠️", bgColor: "#fff1e8" }
    ]);
    const totalPending = common_vendor.computed(() => {
      return pendingList.value.reduce((sum, item) => sum + item.count, 0);
    });
    function handleMessage() {
      common_vendor.index.navigateTo({ url: "/pages/mine/message" });
    }
    function handleDataClick(item) {
      switch (item.label) {
        case "今日订单":
        case "本周订单":
        case "本月订单":
          common_vendor.index.navigateTo({ url: "/pages/order/sale" });
          break;
        case "待发货":
          common_vendor.index.navigateTo({ url: "/pages/order/sale?status=toShip" });
          break;
        case "待处理售后":
          common_vendor.index.navigateTo({ url: "/pages/order/sale?status=afterSale" });
          break;
        case "待开票":
          common_vendor.index.navigateTo({ url: "/pages/mine/invoice" });
          break;
        case "低库存预警":
          common_vendor.index.navigateTo({ url: "/pages/mine/stock?filter=warning" });
          break;
      }
    }
    function handleTool(item) {
      switch (item.id) {
        case 1:
          common_vendor.index.navigateTo({ url: "/pages/order/ship" });
          break;
        case 2:
          common_vendor.index.switchTab({ url: "/pages/market/index" });
          break;
        case 3:
          common_vendor.index.navigateTo({ url: "/pages/market/bom" });
          break;
        case 4:
          common_vendor.index.navigateTo({ url: "/pages/mine/stock" });
          break;
        case 5:
          common_vendor.index.navigateTo({ url: "/pages/mine/stock?filter=warning" });
          break;
        case 6:
          common_vendor.index.navigateTo({ url: "/pages/order/receive" });
          break;
        case 7:
          common_vendor.index.scanCode({
            success: (res) => {
              common_vendor.index.showToast({ title: "扫码成功", icon: "success" });
            },
            fail: () => {
              common_vendor.index.showToast({ title: "扫码失败", icon: "none" });
            }
          });
          break;
        case 8:
          common_vendor.index.showToast({ title: "更多功能开发中", icon: "none" });
          break;
      }
    }
    function handleNotice(item) {
      switch (item.type) {
        case "order":
          if (item.title === "待发货提醒") {
            common_vendor.index.navigateTo({ url: "/pages/order/sale?status=toShip" });
          } else if (item.title === "采购订单状态") {
            common_vendor.index.navigateTo({ url: "/pages/order/purchase" });
          }
          break;
        case "stock":
          if (item.title === "库存预警") {
            common_vendor.index.navigateTo({ url: "/pages/mine/stock?filter=warning" });
          } else {
            common_vendor.index.navigateTo({ url: "/pages/mine/stock" });
          }
          break;
        case "finance":
          if (item.title === "开票提醒") {
            common_vendor.index.navigateTo({ url: "/pages/mine/invoice" });
          } else {
            common_vendor.index.navigateTo({ url: "/pages/mine/custody" });
          }
          break;
      }
    }
    function handlePending(item) {
      switch (item.id) {
        case 1:
          common_vendor.index.navigateTo({ url: "/pages/order/sale?status=toShip" });
          break;
        case 2:
          common_vendor.index.navigateTo({ url: "/pages/order/purchase?status=toConfirm" });
          break;
        case 3:
          common_vendor.index.navigateTo({ url: "/pages/order/receive" });
          break;
        case 4:
          common_vendor.index.navigateTo({ url: "/pages/order/sale?status=afterSale" });
          break;
        case 5:
          common_vendor.index.navigateTo({ url: "/pages/mine/invoice" });
          break;
        case 6:
          common_vendor.index.navigateTo({ url: "/pages/mine/stock?filter=warning" });
          break;
      }
    }
    const __returned__ = { userInfo, unreadCount, dataTab, noticeType, dashboardData, quickTools, notices, filteredNotices, pendingList, totalPending, handleMessage, handleDataClick, handleTool, handleNotice, handlePending };
    Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
    return __returned__;
  }
});
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.t($setup.userInfo.name),
    b: common_vendor.t($setup.userInfo.company),
    c: $setup.unreadCount > 0
  }, $setup.unreadCount > 0 ? {
    d: common_vendor.t($setup.unreadCount)
  } : {}, {
    e: common_vendor.o($setup.handleMessage),
    f: $setup.dataTab === "today" ? 1 : "",
    g: common_vendor.o(($event) => $setup.dataTab = "today"),
    h: $setup.dataTab === "week" ? 1 : "",
    i: common_vendor.o(($event) => $setup.dataTab = "week"),
    j: $setup.dataTab === "month" ? 1 : "",
    k: common_vendor.o(($event) => $setup.dataTab = "month"),
    l: common_vendor.f($setup.dashboardData, (item, k0, i0) => {
      return common_vendor.e({
        a: common_vendor.t(item.icon),
        b: item.bgColor,
        c: common_vendor.t(item.value),
        d: item.color,
        e: common_vendor.t(item.label),
        f: item.trend
      }, item.trend ? {
        g: common_vendor.t(item.trend > 0 ? "↑" : "↓"),
        h: common_vendor.n(item.trend > 0 ? "up" : "down"),
        i: common_vendor.t(Math.abs(item.trend)),
        j: common_vendor.n(item.trend > 0 ? "up" : "down")
      } : {}, {
        k: item.label,
        l: common_vendor.o(($event) => $setup.handleDataClick(item), item.label)
      });
    }),
    m: common_vendor.f($setup.quickTools, (item, k0, i0) => {
      return common_vendor.e({
        a: common_vendor.t(item.icon),
        b: item.bgColor,
        c: common_vendor.t(item.name),
        d: item.badge
      }, item.badge ? {
        e: common_vendor.t(item.badge)
      } : {}, {
        f: item.id,
        g: common_vendor.o(($event) => $setup.handleTool(item), item.id)
      });
    }),
    n: common_vendor.o($setup.handleMessage),
    o: $setup.noticeType === "all" ? 1 : "",
    p: common_vendor.o(($event) => $setup.noticeType = "all"),
    q: $setup.noticeType === "order" ? 1 : "",
    r: common_vendor.o(($event) => $setup.noticeType = "order"),
    s: $setup.noticeType === "stock" ? 1 : "",
    t: common_vendor.o(($event) => $setup.noticeType = "stock"),
    v: $setup.noticeType === "finance" ? 1 : "",
    w: common_vendor.o(($event) => $setup.noticeType = "finance"),
    x: common_vendor.f($setup.filteredNotices, (item, k0, i0) => {
      return common_vendor.e({
        a: common_vendor.t(item.icon),
        b: item.bgColor,
        c: common_vendor.t(item.title),
        d: common_vendor.t(item.time),
        e: common_vendor.t(item.desc),
        f: item.actionText
      }, item.actionText ? {
        g: common_vendor.t(item.actionText)
      } : {}, {
        h: !item.isRead
      }, !item.isRead ? {} : {}, {
        i: item.id,
        j: common_vendor.o(($event) => $setup.handleNotice(item), item.id)
      });
    }),
    y: common_vendor.t($setup.totalPending),
    z: common_vendor.f($setup.pendingList, (item, k0, i0) => {
      return {
        a: common_vendor.t(item.icon),
        b: item.bgColor,
        c: common_vendor.t(item.title),
        d: common_vendor.t(item.desc),
        e: common_vendor.t(item.count),
        f: item.id,
        g: common_vendor.o(($event) => $setup.handlePending(item), item.id)
      };
    })
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-83a5a03c"], ["__file", "/Users/mcdreamy/Documents/trae_projects/gongchengcang2/apps/mp/src/pages/index/index.vue"]]);
wx.createPage(MiniProgramPage);
