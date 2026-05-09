"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "custody-withdraw",
  setup(__props, { expose: __expose }) {
    __expose();
    const availableBalance = common_vendor.ref("146,520.00");
    const frozenAmount = common_vendor.ref("12,000.00");
    const amount = common_vendor.ref("");
    const selectedBank = common_vendor.ref("bank1");
    const bankCards = common_vendor.ref([
      { id: "bank1", bankName: "招商银行", accountNo: "**** **** **** 8888" },
      { id: "bank2", bankName: "工商银行", accountNo: "**** **** **** 6666" }
    ]);
    function handleAll() {
      amount.value = availableBalance.value.replace(/,/g, "");
    }
    function handleSubmit() {
      if (!amount.value) {
        common_vendor.index.showToast({ title: "请输入提现金额", icon: "none" });
        return;
      }
      const amountNum = parseFloat(amount.value);
      const maxAmount = parseFloat(availableBalance.value.replace(/,/g, ""));
      if (amountNum <= 0) {
        common_vendor.index.showToast({ title: "提现金额必须大于0", icon: "none" });
        return;
      }
      if (amountNum > maxAmount) {
        common_vendor.index.showToast({ title: "提现金额超出可提现余额", icon: "none" });
        return;
      }
      if (!selectedBank.value) {
        common_vendor.index.showToast({ title: "请选择提现账户", icon: "none" });
        return;
      }
      common_vendor.index.showModal({
        title: "确认提现",
        content: `确定提现 ¥${amount.value} 到所选银行卡吗？`,
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.showToast({ title: "提现申请已提交", icon: "success" });
            setTimeout(() => {
              common_vendor.index.navigateBack();
            }, 1500);
          }
        }
      });
    }
    function handleNavigate(path) {
      common_vendor.index.navigateTo({ url: path });
    }
    const __returned__ = { availableBalance, frozenAmount, amount, selectedBank, bankCards, handleAll, handleSubmit, handleNavigate };
    Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
    return __returned__;
  }
});
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.t($setup.availableBalance),
    b: common_vendor.t($setup.frozenAmount),
    c: $setup.amount,
    d: common_vendor.o(($event) => $setup.amount = $event.detail.value),
    e: common_vendor.o($setup.handleAll),
    f: common_vendor.t($setup.availableBalance),
    g: common_vendor.f($setup.bankCards, (item, k0, i0) => {
      return common_vendor.e({
        a: common_vendor.t(item.bankName.charAt(0)),
        b: common_vendor.t(item.bankName),
        c: common_vendor.t(item.accountNo),
        d: $setup.selectedBank === item.id
      }, $setup.selectedBank === item.id ? {} : {}, {
        e: $setup.selectedBank === item.id ? 1 : "",
        f: item.id,
        g: common_vendor.o(($event) => $setup.selectedBank = item.id, item.id)
      });
    }),
    h: common_vendor.o(($event) => $setup.handleNavigate("/pages/mine/bankcard")),
    i: common_vendor.o($setup.handleSubmit),
    j: common_vendor.o(($event) => $setup.handleNavigate("/pages/mine/custody"))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-e68fdcc7"], ["__file", "/Users/mcdreamy/Documents/trae_projects/gongchengcang2/apps/mp/src/pages/mine/custody-withdraw.vue"]]);
wx.createPage(MiniProgramPage);
