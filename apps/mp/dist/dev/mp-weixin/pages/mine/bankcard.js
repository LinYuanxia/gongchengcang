"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "bankcard",
  setup(__props, { expose: __expose }) {
    __expose();
    const showAddPopup = common_vendor.ref(false);
    const formData = common_vendor.ref({
      holderName: "深圳湾科技园项目仓",
      bankName: "",
      accountNo: "",
      branch: ""
    });
    const bankOptions = common_vendor.ref([
      { id: 1, name: "招商银行" },
      { id: 2, name: "工商银行" },
      { id: 3, name: "建设银行" },
      { id: 4, name: "农业银行" },
      { id: 5, name: "中国银行" },
      { id: 6, name: "交通银行" },
      { id: 7, name: "浦发银行" },
      { id: 8, name: "民生银行" }
    ]);
    const bankCards = common_vendor.ref([
      {
        id: "b1",
        bankName: "招商银行",
        cardType: "储蓄卡",
        accountNo: "**** **** **** 8888",
        status: "verified",
        statusText: "已验证",
        isDefault: true,
        bgColor: "#e8f3ff"
      },
      {
        id: "b2",
        bankName: "工商银行",
        cardType: "储蓄卡",
        accountNo: "**** **** **** 6666",
        status: "pending",
        statusText: "待验证",
        isDefault: false,
        bgColor: "#fff7e8"
      }
    ]);
    function handleBankChange(e) {
      formData.value.bankName = bankOptions.value[e.detail.value].name;
    }
    function handleAdd() {
      formData.value = {
        holderName: "深圳湾科技园项目仓",
        bankName: "",
        accountNo: "",
        branch: ""
      };
      showAddPopup.value = true;
    }
    function handleSetDefault(item) {
      common_vendor.index.showModal({
        title: "设为默认",
        content: `确定将 ${item.bankName} 尾号 ${item.accountNo.slice(-4)} 设为默认银行卡吗？`,
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.showToast({ title: "设置成功", icon: "success" });
          }
        }
      });
    }
    function handleVerify(item) {
      common_vendor.index.showModal({
        title: "验证银行卡",
        content: "平台将向该银行卡转入0.01-0.99元，请查看银行流水后输入收到的金额完成验证",
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.showToast({ title: "已发起验证", icon: "success" });
          }
        }
      });
    }
    function handleUnbind(item) {
      common_vendor.index.showModal({
        title: "解绑银行卡",
        content: `确定解绑 ${item.bankName} 尾号 ${item.accountNo.slice(-4)} 吗？`,
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.showToast({ title: "已解绑", icon: "success" });
          }
        }
      });
    }
    function handleConfirm() {
      if (!formData.value.bankName) {
        common_vendor.index.showToast({ title: "请选择开户银行", icon: "none" });
        return;
      }
      if (!formData.value.accountNo) {
        common_vendor.index.showToast({ title: "请输入银行卡号", icon: "none" });
        return;
      }
      if (!formData.value.branch) {
        common_vendor.index.showToast({ title: "请输入开户支行", icon: "none" });
        return;
      }
      common_vendor.index.showModal({
        title: "确认绑定",
        content: "绑定后需进行小额打款验证，验证成功后可用于提现",
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.showToast({ title: "绑定成功", icon: "success" });
            showAddPopup.value = false;
          }
        }
      });
    }
    const __returned__ = { showAddPopup, formData, bankOptions, bankCards, handleBankChange, handleAdd, handleSetDefault, handleVerify, handleUnbind, handleConfirm };
    Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
    return __returned__;
  }
});
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.f($setup.bankCards, (item, k0, i0) => {
      return common_vendor.e({
        a: common_vendor.t(item.bankName.charAt(0)),
        b: item.bgColor,
        c: common_vendor.t(item.bankName),
        d: common_vendor.t(item.cardType),
        e: common_vendor.t(item.accountNo),
        f: common_vendor.t(item.statusText),
        g: common_vendor.n(item.status),
        h: item.isDefault
      }, item.isDefault ? {} : {}, {
        i: !item.isDefault && item.status === "verified"
      }, !item.isDefault && item.status === "verified" ? {
        j: common_vendor.o(($event) => $setup.handleSetDefault(item), item.id)
      } : {}, {
        k: item.status === "pending"
      }, item.status === "pending" ? {
        l: common_vendor.o(($event) => $setup.handleVerify(item), item.id)
      } : {}, {
        m: item.status === "verified"
      }, item.status === "verified" ? {
        n: common_vendor.o(($event) => $setup.handleUnbind(item), item.id)
      } : {}, {
        o: item.id
      });
    }),
    b: $setup.bankCards.length < 5
  }, $setup.bankCards.length < 5 ? {
    c: common_vendor.o($setup.handleAdd)
  } : {}, {
    d: $setup.showAddPopup
  }, $setup.showAddPopup ? {
    e: common_vendor.o(($event) => $setup.showAddPopup = false),
    f: $setup.formData.holderName,
    g: common_vendor.o(($event) => $setup.formData.holderName = $event.detail.value),
    h: common_vendor.t($setup.formData.bankName || "请选择开户银行"),
    i: !$setup.formData.bankName ? 1 : "",
    j: $setup.bankOptions,
    k: common_vendor.o($setup.handleBankChange),
    l: $setup.formData.accountNo,
    m: common_vendor.o(($event) => $setup.formData.accountNo = $event.detail.value),
    n: $setup.formData.branch,
    o: common_vendor.o(($event) => $setup.formData.branch = $event.detail.value),
    p: common_vendor.o(($event) => $setup.showAddPopup = false),
    q: common_vendor.o($setup.handleConfirm),
    r: common_vendor.o(() => {
    }),
    s: common_vendor.o(($event) => $setup.showAddPopup = false)
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-8ac59e79"], ["__file", "/Users/mcdreamy/Documents/trae_projects/gongchengcang2/apps/mp/src/pages/mine/bankcard.vue"]]);
wx.createPage(MiniProgramPage);
