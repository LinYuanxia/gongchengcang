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
    const stats = common_vendor.ref({
      toShip: 12,
      toReceive: 5,
      toInvoice: 8,
      message: 3,
      stockWarning: 5
    });
    const custodyBalance = common_vendor.ref("158,520.00");
    const frozenAmount = common_vendor.ref("12,000.00");
    const businessMenus = common_vendor.ref([
      { id: 1, name: "主体信息", icon: "🏢", path: "/pages/mine/profile", desc: "企业信息、资质" },
      { id: 2, name: "商品管理", icon: "📦", path: "/pages/mine/product", badge: "156" },
      { id: 3, name: "库存管理", icon: "📊", path: "/pages/mine/stock", badge: "5" },
      { id: 4, name: "子账号管理", icon: "👥", path: "/pages/mine/account" }
    ]);
    const financeMenus = common_vendor.ref([
      { id: 1, name: "销项发票", icon: "📄", path: "/pages/mine/invoice?type=out", badge: "8" },
      { id: 2, name: "进项发票", icon: "📥", path: "/pages/mine/invoice?type=in" },
      { id: 3, name: "开票记录", icon: "📋", path: "/pages/mine/invoice-records" },
      { id: 4, name: "银行卡管理", icon: "💳", path: "/pages/mine/bankcard" }
    ]);
    const settingMenus = common_vendor.ref([
      { id: 1, name: "消息中心", icon: "🔔", path: "/pages/mine/message", badge: "3" },
      { id: 2, name: "设置", icon: "⚙️", path: "/pages/mine/settings" },
      { id: 3, name: "帮助中心", icon: "❓", path: "/pages/mine/help" },
      { id: 4, name: "关于我们", icon: "ℹ️", path: "/pages/mine/about" }
    ]);
    function handleNavigate(path) {
      common_vendor.index.navigateTo({ url: path });
    }
    function handleLogout() {
      common_vendor.index.showModal({
        title: "提示",
        content: "确定退出登录吗？",
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.reLaunch({ url: "/pages/login/index" });
          }
        }
      });
    }
    const __returned__ = { userInfo, stats, custodyBalance, frozenAmount, businessMenus, financeMenus, settingMenus, handleNavigate, handleLogout };
    Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
    return __returned__;
  }
});
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.t($setup.userInfo.name),
    b: common_vendor.t($setup.userInfo.company),
    c: common_vendor.o(($event) => $setup.handleNavigate("/pages/mine/profile")),
    d: common_vendor.t($setup.stats.toShip),
    e: common_vendor.o(($event) => $setup.handleNavigate("/pages/order/index?tab=sale&status=toShip")),
    f: common_vendor.t($setup.stats.toReceive),
    g: common_vendor.o(($event) => $setup.handleNavigate("/pages/order/index?tab=purchase&status=toReceive")),
    h: common_vendor.t($setup.stats.toInvoice),
    i: common_vendor.o(($event) => $setup.handleNavigate("/pages/mine/invoice?type=out")),
    j: common_vendor.t($setup.stats.message),
    k: common_vendor.o(($event) => $setup.handleNavigate("/pages/mine/message")),
    l: common_vendor.t($setup.custodyBalance),
    m: common_vendor.t($setup.frozenAmount),
    n: common_vendor.o(($event) => $setup.handleNavigate("/pages/mine/custody-recharge")),
    o: common_vendor.o(($event) => $setup.handleNavigate("/pages/mine/custody-withdraw")),
    p: common_vendor.o(($event) => $setup.handleNavigate("/pages/mine/custody-records")),
    q: common_vendor.o(($event) => $setup.handleNavigate("/pages/mine/custody")),
    r: common_vendor.o(($event) => $setup.handleNavigate("/pages/order/ship")),
    s: common_vendor.o(($event) => $setup.handleNavigate("/pages/order/receive")),
    t: $setup.stats.stockWarning > 0
  }, $setup.stats.stockWarning > 0 ? {
    v: common_vendor.t($setup.stats.stockWarning)
  } : {}, {
    w: common_vendor.o(($event) => $setup.handleNavigate("/pages/mine/stock?tab=warning")),
    x: common_vendor.o(($event) => $setup.handleNavigate("/pages/mine/product")),
    y: $setup.stats.toInvoice > 0
  }, $setup.stats.toInvoice > 0 ? {
    z: common_vendor.t($setup.stats.toInvoice)
  } : {}, {
    A: common_vendor.o(($event) => $setup.handleNavigate("/pages/mine/invoice?type=out")),
    B: common_vendor.o(($event) => $setup.handleNavigate("/pages/mine/account")),
    C: common_vendor.o(($event) => $setup.handleNavigate("/pages/mine/bankcard")),
    D: common_vendor.o(($event) => $setup.handleNavigate("/pages/mine/settings")),
    E: common_vendor.f($setup.businessMenus, (item, k0, i0) => {
      return common_vendor.e({
        a: common_vendor.t(item.icon),
        b: common_vendor.t(item.name),
        c: item.desc
      }, item.desc ? {
        d: common_vendor.t(item.desc)
      } : {}, {
        e: item.badge
      }, item.badge ? {
        f: common_vendor.t(item.badge)
      } : {}, {
        g: item.id,
        h: common_vendor.o(($event) => $setup.handleNavigate(item.path), item.id)
      });
    }),
    F: common_vendor.f($setup.financeMenus, (item, k0, i0) => {
      return common_vendor.e({
        a: common_vendor.t(item.icon),
        b: common_vendor.t(item.name),
        c: item.badge
      }, item.badge ? {
        d: common_vendor.t(item.badge)
      } : {}, {
        e: item.id,
        f: common_vendor.o(($event) => $setup.handleNavigate(item.path), item.id)
      });
    }),
    G: common_vendor.f($setup.settingMenus, (item, k0, i0) => {
      return common_vendor.e({
        a: common_vendor.t(item.icon),
        b: common_vendor.t(item.name),
        c: item.badge
      }, item.badge ? {
        d: common_vendor.t(item.badge)
      } : {}, {
        e: item.id,
        f: common_vendor.o(($event) => $setup.handleNavigate(item.path), item.id)
      });
    }),
    H: common_vendor.o($setup.handleLogout)
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-9023ef44"], ["__file", "/Users/mcdreamy/Documents/trae_projects/gongchengcang2/apps/mp/src/pages/mine/index.vue"]]);
wx.createPage(MiniProgramPage);
