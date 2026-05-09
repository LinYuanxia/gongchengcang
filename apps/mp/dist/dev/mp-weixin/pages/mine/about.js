"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "about",
  setup(__props, { expose: __expose }) {
    __expose();
    function handleCall() {
      common_vendor.index.makePhoneCall({
        phoneNumber: "4008888888"
      });
    }
    function handleWebsite() {
      common_vendor.index.showToast({ title: "正在跳转官网...", icon: "none" });
    }
    function handleAgreement() {
      common_vendor.index.showToast({ title: "用户协议", icon: "none" });
    }
    function handlePrivacy() {
      common_vendor.index.showToast({ title: "隐私政策", icon: "none" });
    }
    function handleCheckUpdate() {
      common_vendor.index.showModal({
        title: "检查更新",
        content: "当前已是最新版本",
        showCancel: false
      });
    }
    const __returned__ = { handleCall, handleWebsite, handleAgreement, handlePrivacy, handleCheckUpdate };
    Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
    return __returned__;
  }
});
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.o($setup.handleCall),
    b: common_vendor.o($setup.handleWebsite),
    c: common_vendor.o($setup.handleAgreement),
    d: common_vendor.o($setup.handlePrivacy),
    e: common_vendor.o($setup.handleCheckUpdate)
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-53c62696"], ["__file", "/Users/mcdreamy/Documents/trae_projects/gongchengcang2/apps/mp/src/pages/mine/about.vue"]]);
wx.createPage(MiniProgramPage);
