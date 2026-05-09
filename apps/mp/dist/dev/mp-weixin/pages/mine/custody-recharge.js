"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "custody-recharge",
  setup(__props, { expose: __expose }) {
    __expose();
    const balance = common_vendor.ref("158,520.00");
    const frozenAmount = common_vendor.ref("12,000.00");
    const amount = common_vendor.ref("");
    const paymentMethod = common_vendor.ref("bank");
    const quickAmounts = common_vendor.ref([1e3, 5e3, 1e4, 5e4]);
    function handleCopy(text) {
      common_vendor.index.setClipboardData({
        data: text,
        success: () => {
          common_vendor.index.showToast({ title: "已复制", icon: "success" });
        }
      });
    }
    function handleSubmit() {
      if (!amount.value) {
        common_vendor.index.showToast({ title: "请输入充值金额", icon: "none" });
        return;
      }
      const amountNum = parseFloat(amount.value);
      if (amountNum <= 0) {
        common_vendor.index.showToast({ title: "充值金额必须大于0", icon: "none" });
        return;
      }
      if (paymentMethod.value === "bank") {
        common_vendor.index.showModal({
          title: "银行转账充值",
          content: "请按照上方账户信息进行转账，转账成功后1-3个工作日到账",
          showCancel: false
        });
      } else {
        common_vendor.index.showModal({
          title: "确认充值",
          content: `确定充值 ¥${amount.value} 吗？`,
          success: (res) => {
            if (res.confirm) {
              common_vendor.index.showToast({ title: "充值成功", icon: "success" });
              setTimeout(() => {
                common_vendor.index.navigateBack();
              }, 1500);
            }
          }
        });
      }
    }
    function handleNavigate(path) {
      common_vendor.index.navigateTo({ url: path });
    }
    const __returned__ = { balance, frozenAmount, amount, paymentMethod, quickAmounts, handleCopy, handleSubmit, handleNavigate };
    Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
    return __returned__;
  }
});
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.t($setup.balance),
    b: common_vendor.t($setup.frozenAmount),
    c: $setup.amount,
    d: common_vendor.o(($event) => $setup.amount = $event.detail.value),
    e: common_vendor.f($setup.quickAmounts, (item, k0, i0) => {
      return {
        a: common_vendor.t(item),
        b: $setup.amount === item ? 1 : "",
        c: item,
        d: common_vendor.o(($event) => $setup.amount = item, item)
      };
    }),
    f: $setup.paymentMethod === "bank"
  }, $setup.paymentMethod === "bank" ? {} : {}, {
    g: $setup.paymentMethod === "bank" ? 1 : "",
    h: common_vendor.o(($event) => $setup.paymentMethod = "bank"),
    i: $setup.paymentMethod === "alipay"
  }, $setup.paymentMethod === "alipay" ? {} : {}, {
    j: $setup.paymentMethod === "alipay" ? 1 : "",
    k: common_vendor.o(($event) => $setup.paymentMethod = "alipay"),
    l: $setup.paymentMethod === "wechat"
  }, $setup.paymentMethod === "wechat" ? {} : {}, {
    m: $setup.paymentMethod === "wechat" ? 1 : "",
    n: common_vendor.o(($event) => $setup.paymentMethod = "wechat"),
    o: $setup.paymentMethod === "bank"
  }, $setup.paymentMethod === "bank" ? {
    p: common_vendor.o(($event) => $setup.handleCopy("7559012345678901"))
  } : {}, {
    q: common_vendor.o($setup.handleSubmit),
    r: common_vendor.o(($event) => $setup.handleNavigate("/pages/mine/custody"))
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-c1b30d56"], ["__file", "/Users/mcdreamy/Documents/trae_projects/gongchengcang2/apps/mp/src/pages/mine/custody-recharge.vue"]]);
wx.createPage(MiniProgramPage);
