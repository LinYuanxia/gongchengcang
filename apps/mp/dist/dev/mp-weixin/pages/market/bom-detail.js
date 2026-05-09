"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "bom-detail",
  setup(__props, { expose: __expose }) {
    __expose();
    const bomInfo = common_vendor.ref({
      id: "bom001",
      name: "标准住宅基础BOM包",
      type: "平台标准",
      description: "适用于标准住宅项目的基础建材配置包，包含水泥、砂石、钢筋等基础材料",
      productCount: 12,
      estimatedPrice: "158,000",
      tags: ["住宅", "基础工程", "推荐"]
    });
    const products = common_vendor.ref([
      { id: "p1", name: "水泥 P.O 42.5", spec: "42.5", image: "https://picsum.photos/100/100?random=1", price: 450, unit: "吨", qty: 10, selected: true },
      { id: "p2", name: "螺纹钢 HRB400 16mm", spec: "16mm", image: "https://picsum.photos/100/100?random=2", price: 4200, unit: "吨", qty: 5, selected: true },
      { id: "p3", name: "黄砂 中砂", spec: "中砂", image: "https://picsum.photos/100/100?random=3", price: 95, unit: "方", qty: 50, selected: true },
      { id: "p4", name: "碎石 5-31.5mm", spec: "5-31.5mm", image: "https://picsum.photos/100/100?random=4", price: 72, unit: "方", qty: 40, selected: false },
      { id: "p5", name: "商品混凝土 C30", spec: "C30", image: "https://picsum.photos/100/100?random=5", price: 420, unit: "方", qty: 30, selected: false }
    ]);
    const isAllSelected = common_vendor.computed(() => products.value.every((p) => p.selected));
    const selectedCount = common_vendor.computed(() => products.value.filter((p) => p.selected).length);
    const selectedTotal = common_vendor.computed(() => {
      return products.value.filter((p) => p.selected).reduce((sum, p) => sum + p.price * p.qty, 0).toLocaleString();
    });
    function handleSelectAll() {
      const newState = !isAllSelected.value;
      products.value.forEach((p) => p.selected = newState);
    }
    function handleSubmit() {
      const selected = products.value.filter((p) => p.selected);
      if (selected.length === 0) {
        common_vendor.index.showToast({ title: "请选择商品", icon: "none" });
        return;
      }
      common_vendor.index.showToast({ title: "已加入购物车", icon: "success" });
      setTimeout(() => {
        common_vendor.index.navigateBack();
      }, 1500);
    }
    const __returned__ = { bomInfo, products, isAllSelected, selectedCount, selectedTotal, handleSelectAll, handleSubmit };
    Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
    return __returned__;
  }
});
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.t($setup.bomInfo.name),
    b: common_vendor.t($setup.bomInfo.type),
    c: common_vendor.t($setup.bomInfo.description),
    d: common_vendor.f($setup.bomInfo.tags, (tag, k0, i0) => {
      return {
        a: common_vendor.t(tag),
        b: tag
      };
    }),
    e: common_vendor.t($setup.bomInfo.productCount),
    f: common_vendor.t($setup.bomInfo.estimatedPrice),
    g: common_vendor.t($setup.products.length),
    h: common_vendor.f($setup.products, (item, k0, i0) => {
      return {
        a: common_vendor.t(item.selected ? "☑" : "☐"),
        b: common_vendor.o(($event) => item.selected = !item.selected, item.id),
        c: item.image,
        d: common_vendor.t(item.name),
        e: common_vendor.t(item.spec),
        f: common_vendor.t(item.price),
        g: common_vendor.t(item.unit),
        h: common_vendor.o(($event) => item.qty > 1 && item.qty--, item.id),
        i: common_vendor.t(item.qty),
        j: common_vendor.o(($event) => item.qty++, item.id),
        k: item.id
      };
    }),
    i: common_vendor.t($setup.isAllSelected ? "☑" : "☐"),
    j: common_vendor.o($setup.handleSelectAll),
    k: common_vendor.t($setup.selectedCount),
    l: common_vendor.t($setup.selectedTotal),
    m: common_vendor.o($setup.handleSubmit)
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-49247bbb"], ["__file", "/Users/mcdreamy/Documents/trae_projects/gongchengcang2/apps/mp/src/pages/market/bom-detail.vue"]]);
wx.createPage(MiniProgramPage);
