"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "profile",
  setup(__props, { expose: __expose }) {
    __expose();
    const companyInfo = common_vendor.ref({
      name: "深圳湾科技园项目仓",
      creditCode: "91440300MA5FXXXXXX",
      type: "有限责任公司",
      establishDate: "2020-05-18",
      registeredCapital: "500万元人民币",
      address: "广东省深圳市南山区科技园南区深圳湾科技生态园10栋",
      businessScope: "建筑材料销售、仓储服务、供应链管理",
      certStatus: "已认证",
      contactName: "张三",
      contactPhone: "138****8888",
      contactEmail: "zhangsan@example.com",
      certificates: [
        { id: 1, name: "营业执照", image: "https://picsum.photos/200/150?random=1", status: "valid", statusText: "有效" },
        { id: 2, name: "开户许可证", image: "https://picsum.photos/200/150?random=2", status: "valid", statusText: "有效" },
        { id: 3, name: "建筑资质证书", image: "https://picsum.photos/200/150?random=3", status: "expiring", statusText: "即将到期" }
      ],
      bankAccounts: [
        { id: 1, bankName: "招商银行", accountNo: "**** **** **** 8888", status: "verified", statusText: "已验证" },
        { id: 2, bankName: "工商银行", accountNo: "**** **** **** 6666", status: "pending", statusText: "待验证" }
      ]
    });
    const invoiceInfo = common_vendor.ref({
      title: "深圳湾科技园项目仓",
      taxNo: "91440300MA5FXXXXXX",
      bankName: "招商银行深圳分行",
      bankAccount: "7559 **** **** 8888",
      address: "广东省深圳市南山区科技园南区",
      phone: "0755-8888****"
    });
    function handleEdit(field) {
      common_vendor.index.showModal({
        title: "编辑信息",
        editable: true,
        placeholderText: "请输入新内容",
        success: (res) => {
          if (res.confirm && res.content) {
            common_vendor.index.showToast({ title: "修改成功", icon: "success" });
          }
        }
      });
    }
    function handlePreviewImage(url) {
      common_vendor.index.previewImage({
        urls: [url]
      });
    }
    function handleUpdateCert(item) {
      common_vendor.index.chooseImage({
        count: 1,
        success: (res) => {
          common_vendor.index.showToast({ title: "更新成功", icon: "success" });
        }
      });
    }
    function handleAddCert() {
      common_vendor.index.showActionSheet({
        itemList: ["营业执照", "开户许可证", "建筑资质证书", "其他证书"],
        success: (res) => {
          common_vendor.index.chooseImage({
            count: 1,
            success: () => {
              common_vendor.index.showToast({ title: "上传成功", icon: "success" });
            }
          });
        }
      });
    }
    function handleNavigate(path) {
      common_vendor.index.navigateTo({ url: path });
    }
    const __returned__ = { companyInfo, invoiceInfo, handleEdit, handlePreviewImage, handleUpdateCert, handleAddCert, handleNavigate };
    Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
    return __returned__;
  }
});
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.t($setup.companyInfo.name.charAt(0)),
    b: common_vendor.t($setup.companyInfo.name),
    c: common_vendor.t($setup.companyInfo.certStatus),
    d: common_vendor.t($setup.companyInfo.name),
    e: common_vendor.t($setup.companyInfo.creditCode),
    f: common_vendor.t($setup.companyInfo.type),
    g: common_vendor.t($setup.companyInfo.establishDate),
    h: common_vendor.t($setup.companyInfo.registeredCapital),
    i: common_vendor.t($setup.companyInfo.address),
    j: common_vendor.t($setup.companyInfo.businessScope),
    k: common_vendor.t($setup.companyInfo.contactName),
    l: common_vendor.o(($event) => $setup.handleEdit("contactName")),
    m: common_vendor.t($setup.companyInfo.contactPhone),
    n: common_vendor.o(($event) => $setup.handleEdit("contactPhone")),
    o: common_vendor.t($setup.companyInfo.contactEmail),
    p: common_vendor.o(($event) => $setup.handleEdit("contactEmail")),
    q: common_vendor.f($setup.companyInfo.certificates, (item, k0, i0) => {
      return {
        a: item.image,
        b: common_vendor.o(($event) => $setup.handlePreviewImage(item.image), item.id),
        c: common_vendor.t(item.name),
        d: common_vendor.t(item.statusText),
        e: common_vendor.n(item.status),
        f: common_vendor.o(($event) => $setup.handleUpdateCert(item), item.id),
        g: item.id
      };
    }),
    r: common_vendor.o($setup.handleAddCert),
    s: common_vendor.f($setup.companyInfo.bankAccounts, (item, k0, i0) => {
      return {
        a: common_vendor.t(item.bankName.charAt(0)),
        b: common_vendor.t(item.bankName),
        c: common_vendor.t(item.accountNo),
        d: common_vendor.t(item.statusText),
        e: common_vendor.n(item.status),
        f: item.id
      };
    }),
    t: common_vendor.o(($event) => $setup.handleNavigate("/pages/mine/bankcard")),
    v: common_vendor.t($setup.invoiceInfo.title),
    w: common_vendor.t($setup.invoiceInfo.taxNo),
    x: common_vendor.t($setup.invoiceInfo.bankName),
    y: common_vendor.t($setup.invoiceInfo.bankAccount),
    z: common_vendor.t($setup.invoiceInfo.address),
    A: common_vendor.t($setup.invoiceInfo.phone)
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-a55bda20"], ["__file", "/Users/mcdreamy/Documents/trae_projects/gongchengcang2/apps/mp/src/pages/mine/profile.vue"]]);
wx.createPage(MiniProgramPage);
