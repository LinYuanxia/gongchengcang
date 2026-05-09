"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "custody-records",
  setup(__props, { expose: __expose }) {
    __expose();
    const balance = common_vendor.ref("158,520.00");
    const frozen = common_vendor.ref("12,000.00");
    const filterType = common_vendor.ref("all");
    const startDate = common_vendor.ref("");
    const endDate = common_vendor.ref("");
    const records = common_vendor.ref([
      {
        id: "r001",
        type: "income",
        title: "销售收款",
        desc: "订单 SO2024010012",
        amount: "4,500.00",
        afterBalance: "158,520.00",
        time: "2024-01-15 14:30:00"
      },
      {
        id: "r002",
        type: "expense",
        title: "采购付款",
        desc: "订单 PO2024010008",
        amount: "24,000.00",
        afterBalance: "154,020.00",
        time: "2024-01-15 10:20:00"
      },
      {
        id: "r003",
        type: "income",
        title: "账户充值",
        desc: "银行卡充值",
        amount: "50,000.00",
        afterBalance: "178,020.00",
        time: "2024-01-14 16:45:00"
      },
      {
        id: "r004",
        type: "freeze",
        title: "订单冻结",
        desc: "订单 SO2024010015",
        amount: "12,000.00",
        afterBalance: "166,020.00",
        time: "2024-01-14 11:30:00"
      },
      {
        id: "r005",
        type: "expense",
        title: "提现",
        desc: "提现至招商银行尾号8888",
        amount: "20,000.00",
        afterBalance: "146,020.00",
        time: "2024-01-13 09:15:00"
      },
      {
        id: "r006",
        type: "income",
        title: "销售收款",
        desc: "订单 SO2024010010",
        amount: "21,000.00",
        afterBalance: "166,020.00",
        time: "2024-01-12 15:40:00"
      },
      {
        id: "r007",
        type: "expense",
        title: "采购付款",
        desc: "订单 PO2024010006",
        amount: "25,000.00",
        afterBalance: "145,020.00",
        time: "2024-01-11 14:20:00"
      },
      {
        id: "r008",
        type: "income",
        title: "退款解冻",
        desc: "订单 SO2024010008 退款",
        amount: "8,500.00",
        afterBalance: "153,520.00",
        time: "2024-01-10 10:30:00"
      },
      {
        id: "r009",
        type: "expense",
        title: "服务费",
        desc: "平台服务费",
        amount: "1,500.00",
        afterBalance: "152,020.00",
        time: "2024-01-10 08:00:00"
      },
      {
        id: "r010",
        type: "income",
        title: "销售收款",
        desc: "订单 SO2024010005",
        amount: "35,000.00",
        afterBalance: "187,020.00",
        time: "2024-01-09 16:30:00"
      }
    ]);
    const filteredRecords = common_vendor.computed(() => {
      let result = records.value;
      if (filterType.value !== "all") {
        result = result.filter((r) => r.type === filterType.value);
      }
      return result;
    });
    function getTypeIcon(type) {
      const icons = {
        income: "💰",
        expense: "💸",
        freeze: "🔒"
      };
      return icons[type] || "📋";
    }
    const __returned__ = { balance, frozen, filterType, startDate, endDate, records, filteredRecords, getTypeIcon };
    Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
    return __returned__;
  }
});
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.t($setup.balance),
    b: common_vendor.t($setup.frozen),
    c: $setup.filterType === "all" ? 1 : "",
    d: common_vendor.o(($event) => $setup.filterType = "all"),
    e: $setup.filterType === "income" ? 1 : "",
    f: common_vendor.o(($event) => $setup.filterType = "income"),
    g: $setup.filterType === "expense" ? 1 : "",
    h: common_vendor.o(($event) => $setup.filterType = "expense"),
    i: $setup.filterType === "freeze" ? 1 : "",
    j: common_vendor.o(($event) => $setup.filterType = "freeze"),
    k: common_vendor.t($setup.startDate || "开始日期"),
    l: $setup.startDate,
    m: common_vendor.o(($event) => $setup.startDate = $event.detail.value),
    n: common_vendor.t($setup.endDate || "结束日期"),
    o: $setup.endDate,
    p: common_vendor.o(($event) => $setup.endDate = $event.detail.value),
    q: common_vendor.f($setup.filteredRecords, (item, k0, i0) => {
      return {
        a: common_vendor.t($setup.getTypeIcon(item.type)),
        b: common_vendor.n(item.type),
        c: common_vendor.t(item.title),
        d: common_vendor.t(item.desc),
        e: common_vendor.t(item.time),
        f: common_vendor.t(item.type === "income" ? "+" : "-"),
        g: common_vendor.t(item.amount),
        h: common_vendor.n(item.type),
        i: common_vendor.t(item.afterBalance),
        j: item.id
      };
    }),
    r: $setup.filteredRecords.length === 0
  }, $setup.filteredRecords.length === 0 ? {} : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-39fac17f"], ["__file", "/Users/mcdreamy/Documents/trae_projects/gongchengcang2/apps/mp/src/pages/mine/custody-records.vue"]]);
wx.createPage(MiniProgramPage);
