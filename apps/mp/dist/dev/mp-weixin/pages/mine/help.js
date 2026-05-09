"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "help",
  setup(__props, { expose: __expose }) {
    __expose();
    const keyword = common_vendor.ref("");
    const hotQuestions = common_vendor.ref([
      { id: 1, title: "如何进行采购下单？" },
      { id: 2, title: "资金托管账户如何充值？" },
      { id: 3, title: "如何管理商品库存？" },
      { id: 4, title: "订单发货流程说明" },
      { id: 5, title: "如何开具发票？" }
    ]);
    const categories = common_vendor.ref([
      { id: 1, name: "账户管理", icon: "👤", bgColor: "#e8f3ff", count: 12 },
      { id: 2, name: "采购管理", icon: "🛒", bgColor: "#fff7e8", count: 18 },
      { id: 3, name: "销售管理", icon: "📦", bgColor: "#e8ffea", count: 15 },
      { id: 4, name: "库存管理", icon: "📊", bgColor: "#f2e8ff", count: 20 },
      { id: 5, name: "资金管理", icon: "💰", bgColor: "#ffece8", count: 10 },
      { id: 6, name: "发票管理", icon: "📄", bgColor: "#e8fff3", count: 8 }
    ]);
    function handleQuestion(item) {
      common_vendor.index.showToast({ title: item.title, icon: "none" });
    }
    function handleCategory(item) {
      common_vendor.index.showToast({ title: item.name, icon: "none" });
    }
    function handleCall() {
      common_vendor.index.makePhoneCall({
        phoneNumber: "4008888888"
      });
    }
    function handleWechat() {
      common_vendor.index.showToast({ title: "在线客服功能开发中", icon: "none" });
    }
    function handleFeedback() {
      common_vendor.index.showToast({ title: "意见反馈功能开发中", icon: "none" });
    }
    const __returned__ = { keyword, hotQuestions, categories, handleQuestion, handleCategory, handleCall, handleWechat, handleFeedback };
    Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
    return __returned__;
  }
});
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: $setup.keyword,
    b: common_vendor.o(($event) => $setup.keyword = $event.detail.value),
    c: common_vendor.f($setup.hotQuestions, (item, k0, i0) => {
      return {
        a: common_vendor.t(item.title),
        b: item.id,
        c: common_vendor.o(($event) => $setup.handleQuestion(item), item.id)
      };
    }),
    d: common_vendor.f($setup.categories, (item, k0, i0) => {
      return {
        a: common_vendor.t(item.icon),
        b: item.bgColor,
        c: common_vendor.t(item.name),
        d: common_vendor.t(item.count),
        e: item.id,
        f: common_vendor.o(($event) => $setup.handleCategory(item), item.id)
      };
    }),
    e: common_vendor.o($setup.handleCall),
    f: common_vendor.o($setup.handleWechat),
    g: common_vendor.o($setup.handleFeedback)
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-1d410936"], ["__file", "/Users/mcdreamy/Documents/trae_projects/gongchengcang2/apps/mp/src/pages/mine/help.vue"]]);
wx.createPage(MiniProgramPage);
