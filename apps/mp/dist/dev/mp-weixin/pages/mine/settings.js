"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "settings",
  setup(__props, { expose: __expose }) {
    __expose();
    const phone = common_vendor.ref("138****8888");
    const notificationEnabled = common_vendor.ref(true);
    const cacheSize = common_vendor.ref("23.5MB");
    const showPwdPopup = common_vendor.ref(false);
    const pwdForm = common_vendor.ref({
      oldPwd: "",
      newPwd: "",
      confirmPwd: ""
    });
    function handleChangePwd() {
      pwdForm.value = { oldPwd: "", newPwd: "", confirmPwd: "" };
      showPwdPopup.value = true;
    }
    function handleConfirmPwd() {
      if (!pwdForm.value.oldPwd) {
        common_vendor.index.showToast({ title: "请输入原密码", icon: "none" });
        return;
      }
      if (!pwdForm.value.newPwd) {
        common_vendor.index.showToast({ title: "请输入新密码", icon: "none" });
        return;
      }
      if (pwdForm.value.newPwd !== pwdForm.value.confirmPwd) {
        common_vendor.index.showToast({ title: "两次密码不一致", icon: "none" });
        return;
      }
      common_vendor.index.showToast({ title: "密码修改成功", icon: "success" });
      showPwdPopup.value = false;
    }
    function handleBindPhone() {
      common_vendor.index.showToast({ title: "绑定手机", icon: "none" });
    }
    function handleToggleNotification(e) {
      notificationEnabled.value = e.detail.value;
      common_vendor.index.showToast({ title: notificationEnabled.value ? "已开启通知" : "已关闭通知", icon: "none" });
    }
    function handleClearCache() {
      common_vendor.index.showModal({
        title: "清除缓存",
        content: "确定要清除缓存吗？",
        success: (res) => {
          if (res.confirm) {
            cacheSize.value = "0KB";
            common_vendor.index.showToast({ title: "缓存已清除", icon: "success" });
          }
        }
      });
    }
    function handleCheckUpdate() {
      common_vendor.index.showLoading({ title: "检查中..." });
      setTimeout(() => {
        common_vendor.index.hideLoading();
        common_vendor.index.showModal({
          title: "检查更新",
          content: "当前已是最新版本",
          showCancel: false
        });
      }, 1500);
    }
    function handleNavigate(path) {
      common_vendor.index.showToast({ title: "功能开发中", icon: "none" });
    }
    function handleFeedback() {
      common_vendor.index.showToast({ title: "意见反馈", icon: "none" });
    }
    function handleContactService() {
      common_vendor.index.makePhoneCall({
        phoneNumber: "4008888888",
        fail: () => {
          common_vendor.index.showToast({ title: "拨号失败", icon: "none" });
        }
      });
    }
    function handleLogout() {
      common_vendor.index.showModal({
        title: "退出登录",
        content: "确定退出登录吗？",
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.reLaunch({ url: "/pages/login/index" });
          }
        }
      });
    }
    const __returned__ = { phone, notificationEnabled, cacheSize, showPwdPopup, pwdForm, handleChangePwd, handleConfirmPwd, handleBindPhone, handleToggleNotification, handleClearCache, handleCheckUpdate, handleNavigate, handleFeedback, handleContactService, handleLogout };
    Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
    return __returned__;
  }
});
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.o($setup.handleChangePwd),
    b: common_vendor.t($setup.phone),
    c: common_vendor.o($setup.handleBindPhone),
    d: $setup.notificationEnabled,
    e: common_vendor.o($setup.handleToggleNotification),
    f: common_vendor.t($setup.cacheSize),
    g: common_vendor.o($setup.handleClearCache),
    h: common_vendor.o($setup.handleCheckUpdate),
    i: common_vendor.o(($event) => $setup.handleNavigate("/pages/mine/about")),
    j: common_vendor.o(($event) => $setup.handleNavigate("/pages/mine/help")),
    k: common_vendor.o(($event) => $setup.handleNavigate("/pages/mine/privacy")),
    l: common_vendor.o(($event) => $setup.handleNavigate("/pages/mine/agreement")),
    m: common_vendor.o($setup.handleFeedback),
    n: common_vendor.o($setup.handleContactService),
    o: common_vendor.o($setup.handleLogout),
    p: $setup.showPwdPopup
  }, $setup.showPwdPopup ? {
    q: common_vendor.o(($event) => $setup.showPwdPopup = false),
    r: $setup.pwdForm.oldPwd,
    s: common_vendor.o(($event) => $setup.pwdForm.oldPwd = $event.detail.value),
    t: $setup.pwdForm.newPwd,
    v: common_vendor.o(($event) => $setup.pwdForm.newPwd = $event.detail.value),
    w: $setup.pwdForm.confirmPwd,
    x: common_vendor.o(($event) => $setup.pwdForm.confirmPwd = $event.detail.value),
    y: common_vendor.o(($event) => $setup.showPwdPopup = false),
    z: common_vendor.o($setup.handleConfirmPwd),
    A: common_vendor.o(() => {
    }),
    B: common_vendor.o(($event) => $setup.showPwdPopup = false)
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-3f12c944"], ["__file", "/Users/mcdreamy/Documents/trae_projects/gongchengcang2/apps/mp/src/pages/mine/settings.vue"]]);
wx.createPage(MiniProgramPage);
