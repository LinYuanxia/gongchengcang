"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "index",
  setup(__props, { expose: __expose }) {
    __expose();
    const phone = common_vendor.ref("");
    const password = common_vendor.ref("");
    const showPassword = common_vendor.ref(false);
    function handleLogin() {
      if (!phone.value) {
        common_vendor.index.showToast({ title: "请输入手机号", icon: "none" });
        return;
      }
      if (!password.value) {
        common_vendor.index.showToast({ title: "请输入密码", icon: "none" });
        return;
      }
      common_vendor.index.showLoading({ title: "登录中..." });
      setTimeout(() => {
        common_vendor.index.hideLoading();
        common_vendor.index.switchTab({ url: "/pages/index/index" });
      }, 1e3);
    }
    function handleScanLogin() {
      common_vendor.index.showToast({ title: "扫码登录", icon: "none" });
    }
    function handleSmsLogin() {
      common_vendor.index.showToast({ title: "短信登录", icon: "none" });
    }
    const __returned__ = { phone, password, showPassword, handleLogin, handleScanLogin, handleSmsLogin };
    Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
    return __returned__;
  }
});
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: $setup.phone,
    b: common_vendor.o(($event) => $setup.phone = $event.detail.value),
    c: $setup.showPassword ? "text" : "password",
    d: $setup.password,
    e: common_vendor.o(($event) => $setup.password = $event.detail.value),
    f: common_vendor.t($setup.showPassword ? "👁️" : "👁️‍🗨️"),
    g: common_vendor.o(($event) => $setup.showPassword = !$setup.showPassword),
    h: common_vendor.o($setup.handleLogin),
    i: common_vendor.o($setup.handleScanLogin),
    j: common_vendor.o($setup.handleSmsLogin)
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-45258083"], ["__file", "/Users/mcdreamy/Documents/trae_projects/gongchengcang2/apps/mp/src/pages/login/index.vue"]]);
wx.createPage(MiniProgramPage);
