"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "create",
  setup(__props, { expose: __expose }) {
    __expose();
    const orderItems = common_vendor.ref([]);
    const selectedAddress = common_vendor.ref(null);
    const showRemarkModal = common_vendor.ref(false);
    const showAddressModal = common_vendor.ref(false);
    const currentSupplierId = common_vendor.ref("");
    const remarkInput = common_vendor.ref("");
    const supplierRemarks = common_vendor.ref({});
    const addressList = common_vendor.ref([
      {
        id: "a1",
        name: "张三",
        phone: "13800138000",
        province: "广东省",
        city: "深圳市",
        district: "南山区",
        detail: "科技园南区A栋101",
        isDefault: true
      },
      {
        id: "a2",
        name: "李四",
        phone: "13900139000",
        province: "广东省",
        city: "深圳市",
        district: "福田区",
        detail: "华强北路赛格广场",
        isDefault: false
      }
    ]);
    const groupedItems = common_vendor.computed(() => {
      const groups = {};
      orderItems.value.forEach((item) => {
        if (!groups[item.supplierId]) {
          groups[item.supplierId] = {
            supplierId: item.supplierId,
            supplierName: item.supplierName,
            deliveryDays: item.deliveryDays,
            items: [],
            remark: supplierRemarks.value[item.supplierId] || ""
          };
        }
        groups[item.supplierId].items.push(item);
      });
      return Object.values(groups);
    });
    const productTotal = common_vendor.computed(() => {
      return orderItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2);
    });
    const freight = common_vendor.computed(() => {
      return "0.00";
    });
    const totalPrice = common_vendor.computed(() => {
      return (parseFloat(productTotal.value) + parseFloat(freight.value)).toFixed(2);
    });
    common_vendor.onMounted(() => {
      var _a, _b, _c, _d;
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      const itemsParam = (_a = currentPage == null ? void 0 : currentPage.options) == null ? void 0 : _a.items;
      if (itemsParam) {
        try {
          orderItems.value = JSON.parse(decodeURIComponent(itemsParam));
        } catch (e) {
          console.error("解析订单数据失败", e);
        }
      } else {
        const productId = (_b = currentPage == null ? void 0 : currentPage.options) == null ? void 0 : _b.productId;
        const supplierId = (_c = currentPage == null ? void 0 : currentPage.options) == null ? void 0 : _c.supplierId;
        const quantity = (_d = currentPage == null ? void 0 : currentPage.options) == null ? void 0 : _d.quantity;
        if (productId && supplierId && quantity) {
          orderItems.value = [{
            productId,
            supplierId,
            supplierName: "华新水泥供应商",
            name: "水泥 P.O 42.5",
            spec: "50kg/袋",
            price: 420,
            quantity: parseInt(quantity),
            image: "https://picsum.photos/200/200?random=1",
            deliveryDays: 2
          }];
        }
      }
      selectedAddress.value = addressList.value.find((a) => a.isDefault) || addressList.value[0];
    });
    function handleSelectAddress() {
      showAddressModal.value = true;
    }
    function handleChooseAddress(addr) {
      selectedAddress.value = addr;
      showAddressModal.value = false;
    }
    function handleAddAddress() {
      common_vendor.index.showToast({ title: "新增地址功能开发中", icon: "none" });
    }
    function handleRemark(supplierId) {
      currentSupplierId.value = supplierId;
      remarkInput.value = supplierRemarks.value[supplierId] || "";
      showRemarkModal.value = true;
    }
    function handleConfirmRemark() {
      supplierRemarks.value[currentSupplierId.value] = remarkInput.value;
      showRemarkModal.value = false;
    }
    function handleSubmit() {
      if (!selectedAddress.value) {
        common_vendor.index.showToast({ title: "请选择收货地址", icon: "none" });
        return;
      }
      if (orderItems.value.length === 0) {
        common_vendor.index.showToast({ title: "订单数据异常", icon: "none" });
        return;
      }
      common_vendor.index.showModal({
        title: "确认提交",
        content: `订单总金额：¥${totalPrice.value}，确认提交？`,
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.showLoading({ title: "提交中..." });
            setTimeout(() => {
              common_vendor.index.hideLoading();
              common_vendor.index.showToast({ title: "提交成功", icon: "success" });
              setTimeout(() => {
                common_vendor.index.redirectTo({ url: "/pages/order/index" });
              }, 1500);
            }, 1e3);
          }
        }
      });
    }
    const __returned__ = { orderItems, selectedAddress, showRemarkModal, showAddressModal, currentSupplierId, remarkInput, supplierRemarks, addressList, groupedItems, productTotal, freight, totalPrice, handleSelectAddress, handleChooseAddress, handleAddAddress, handleRemark, handleConfirmRemark, handleSubmit };
    Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
    return __returned__;
  }
});
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $setup.selectedAddress
  }, $setup.selectedAddress ? common_vendor.e({
    b: common_vendor.t($setup.selectedAddress.name),
    c: common_vendor.t($setup.selectedAddress.phone),
    d: $setup.selectedAddress.isDefault
  }, $setup.selectedAddress.isDefault ? {} : {}, {
    e: common_vendor.t($setup.selectedAddress.province),
    f: common_vendor.t($setup.selectedAddress.city),
    g: common_vendor.t($setup.selectedAddress.district),
    h: common_vendor.t($setup.selectedAddress.detail)
  }) : {}, {
    i: common_vendor.o($setup.handleSelectAddress),
    j: common_vendor.f($setup.groupedItems, (group, k0, i0) => {
      return {
        a: common_vendor.t(group.supplierName),
        b: common_vendor.t(group.deliveryDays),
        c: common_vendor.f(group.items, (item, k1, i1) => {
          return {
            a: item.image,
            b: common_vendor.t(item.name),
            c: common_vendor.t(item.spec),
            d: common_vendor.t(item.price),
            e: common_vendor.t(item.quantity),
            f: item.productId
          };
        }),
        d: common_vendor.t(group.remark || "选填，请先与供应商协商一致"),
        e: !group.remark ? 1 : "",
        f: common_vendor.o(($event) => $setup.handleRemark(group.supplierId), group.supplierId),
        g: group.supplierId
      };
    }),
    k: common_vendor.t($setup.productTotal),
    l: common_vendor.t($setup.freight),
    m: common_vendor.t($setup.totalPrice),
    n: common_vendor.o($setup.handleSubmit),
    o: $setup.showRemarkModal
  }, $setup.showRemarkModal ? {
    p: common_vendor.o(($event) => $setup.showRemarkModal = false),
    q: $setup.remarkInput,
    r: common_vendor.o(($event) => $setup.remarkInput = $event.detail.value),
    s: common_vendor.o($setup.handleConfirmRemark),
    t: common_vendor.o(() => {
    }),
    v: common_vendor.o(($event) => $setup.showRemarkModal = false)
  } : {}, {
    w: $setup.showAddressModal
  }, $setup.showAddressModal ? {
    x: common_vendor.o(($event) => $setup.showAddressModal = false),
    y: common_vendor.f($setup.addressList, (addr, k0, i0) => {
      var _a, _b, _c;
      return common_vendor.e({
        a: ((_a = $setup.selectedAddress) == null ? void 0 : _a.id) === addr.id
      }, ((_b = $setup.selectedAddress) == null ? void 0 : _b.id) === addr.id ? {} : {}, {
        b: common_vendor.t(addr.name),
        c: common_vendor.t(addr.phone),
        d: addr.isDefault
      }, addr.isDefault ? {} : {}, {
        e: common_vendor.t(addr.province),
        f: common_vendor.t(addr.city),
        g: common_vendor.t(addr.district),
        h: common_vendor.t(addr.detail),
        i: ((_c = $setup.selectedAddress) == null ? void 0 : _c.id) === addr.id ? 1 : "",
        j: addr.id,
        k: common_vendor.o(($event) => $setup.handleChooseAddress(addr), addr.id)
      });
    }),
    z: common_vendor.o($setup.handleAddAddress),
    A: common_vendor.o(() => {
    }),
    B: common_vendor.o(($event) => $setup.showAddressModal = false)
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-3789eeb8"], ["__file", "/Users/mcdreamy/Documents/trae_projects/gongchengcang2/apps/mp/src/pages/order/create.vue"]]);
wx.createPage(MiniProgramPage);
