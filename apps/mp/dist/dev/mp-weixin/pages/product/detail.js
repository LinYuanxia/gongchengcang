"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "detail",
  setup(__props, { expose: __expose }) {
    __expose();
    const productImages = common_vendor.ref([
      "https://picsum.photos/750/750?random=1",
      "https://picsum.photos/750/750?random=2",
      "https://picsum.photos/750/750?random=3"
    ]);
    const product = common_vendor.ref({
      id: "p001",
      name: "水泥 P.O 42.5 普通硅酸盐水泥",
      description: "适用于一般土木建筑、道路、桥梁、水利等工程",
      price: 450,
      unit: "吨",
      sales: 1280,
      hasPermission: true,
      isHot: true,
      specs: {
        "强度等级": "42.5",
        "品种": "普通硅酸盐水泥",
        "包装": "散装/袋装",
        "产地": "湖北"
      }
    });
    const suppliers = common_vendor.ref([
      { id: "s1", name: "华新水泥供应商", supplyPrice: 420, stock: 500, isPrimary: true, hasStock: true },
      { id: "s2", name: "海螺水泥供应商", supplyPrice: 415, stock: 300, isPrimary: false, hasStock: true },
      { id: "s3", name: "南方水泥供应商", supplyPrice: 425, stock: 0, isPrimary: false, hasStock: false }
    ]);
    const cartCount = common_vendor.ref(3);
    function handleMessage() {
      common_vendor.index.showToast({ title: "客服功能开发中", icon: "none" });
    }
    function handleCart() {
      common_vendor.index.navigateTo({ url: "/pages/cart/index" });
    }
    function handleAddCart() {
      common_vendor.index.showToast({ title: "已加入购物车", icon: "success" });
      cartCount.value++;
    }
    function handleBuyNow() {
      common_vendor.index.navigateTo({ url: "/pages/order/create" });
    }
    const __returned__ = { productImages, product, suppliers, cartCount, handleMessage, handleCart, handleAddCart, handleBuyNow };
    Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
    return __returned__;
  }
});
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.f($setup.productImages, (img, index, i0) => {
      return {
        a: img,
        b: index
      };
    }),
    b: common_vendor.t($setup.product.price),
    c: common_vendor.t($setup.product.unit),
    d: common_vendor.t($setup.product.sales),
    e: common_vendor.t($setup.product.name),
    f: common_vendor.t($setup.product.description),
    g: $setup.product.hasPermission
  }, $setup.product.hasPermission ? {} : {}, {
    h: $setup.product.isHot
  }, $setup.product.isHot ? {} : {}, {
    i: common_vendor.f($setup.product.specs, (value, key, i0) => {
      return {
        a: common_vendor.t(key),
        b: common_vendor.t(value),
        c: key
      };
    }),
    j: common_vendor.t($setup.suppliers.length),
    k: common_vendor.f($setup.suppliers, (item, k0, i0) => {
      return common_vendor.e({
        a: common_vendor.t(item.name),
        b: item.isPrimary
      }, item.isPrimary ? {} : {}, {
        c: item.hasStock
      }, item.hasStock ? {} : {}, {
        d: common_vendor.t(item.supplyPrice),
        e: common_vendor.t(item.stock),
        f: item.id
      });
    }),
    l: common_vendor.t($setup.product.unit),
    m: common_vendor.o($setup.handleMessage),
    n: $setup.cartCount > 0
  }, $setup.cartCount > 0 ? {
    o: common_vendor.t($setup.cartCount)
  } : {}, {
    p: common_vendor.o($setup.handleCart),
    q: common_vendor.o($setup.handleAddCart),
    r: common_vendor.o($setup.handleBuyNow)
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-8216645a"], ["__file", "/Users/mcdreamy/Documents/trae_projects/gongchengcang2/apps/mp/src/pages/product/detail.vue"]]);
wx.createPage(MiniProgramPage);
