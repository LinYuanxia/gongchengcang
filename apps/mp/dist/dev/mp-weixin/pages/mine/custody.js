"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "custody",
  setup(__props, { expose: __expose }) {
    __expose();
    const balance = common_vendor.ref("158,520.00");
    const frozenAmount = common_vendor.ref("12,000.00");
    const availableAmount = common_vendor.ref("146,520.00");
    const currentTab = common_vendor.ref("all");
    const transactions = common_vendor.ref([
      { id: 1, type: "income", title: "销售订单收款", amount: "4,500.00", time: "2024-01-15 14:30" },
      { id: 2, type: "expense", title: "采购订单付款", amount: "8,400.00", time: "2024-01-15 10:20" },
      { id: 3, type: "income", title: "充值", amount: "50,000.00", time: "2024-01-14 16:00" },
      { id: 4, type: "expense", title: "提现", amount: "20,000.00", time: "2024-01-13 09:15" },
      { id: 5, type: "income", title: "销售订单收款", amount: "21,000.00", time: "2024-01-12 15:45" }
    ]);
    const filteredTransactions = common_vendor.computed(() => {
      if (currentTab.value === "all") return transactions.value;
      return transactions.value.filter((t) => t.type === currentTab.value);
    });
    function handleRecharge() {
      common_vendor.index.navigateTo({ url: "/pages/mine/custody-recharge" });
    }
    function handleWithdraw() {
      common_vendor.index.navigateTo({ url: "/pages/mine/custody-withdraw" });
    }
    const __returned__ = { balance, frozenAmount, availableAmount, currentTab, transactions, filteredTransactions, handleRecharge, handleWithdraw };
    Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
    return __returned__;
  }
});
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.t($setup.balance),
    b: common_vendor.o($setup.handleRecharge),
    c: common_vendor.o($setup.handleWithdraw),
    d: common_vendor.t($setup.frozenAmount),
    e: common_vendor.t($setup.availableAmount),
    f: $setup.currentTab === "all" ? 1 : "",
    g: common_vendor.o(($event) => $setup.currentTab = "all"),
    h: $setup.currentTab === "income" ? 1 : "",
    i: common_vendor.o(($event) => $setup.currentTab = "income"),
    j: $setup.currentTab === "expense" ? 1 : "",
    k: common_vendor.o(($event) => $setup.currentTab = "expense"),
    l: common_vendor.f($setup.filteredTransactions, (item, k0, i0) => {
      return {
        a: common_vendor.t(item.type === "income" ? "↓" : "↑"),
        b: common_vendor.t(item.title),
        c: common_vendor.t(item.time),
        d: common_vendor.t(item.type === "income" ? "+" : "-"),
        e: common_vendor.t(item.amount),
        f: item.type === "income" ? "#00b42a" : "#f53f3f",
        g: item.id
      };
    })
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-9643145c"], ["__file", "/Users/mcdreamy/Documents/trae_projects/gongchengcang2/apps/mp/src/pages/mine/custody.vue"]]);
wx.createPage(MiniProgramPage);
