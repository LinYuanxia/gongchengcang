"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "bom",
  setup(__props, { expose: __expose }) {
    __expose();
    const keyword = common_vendor.ref("");
    const filterType = common_vendor.ref("");
    const bomList = common_vendor.ref([
      {
        id: "bom001",
        code: "BOM-STD-001",
        name: "标准两居室基装包",
        description: "适用于80-100平米两居室的标准装修基材套餐",
        type: "platform",
        productCount: 45,
        areaRange: "80-100㎡",
        referencePrice: "35,800.00",
        mainProducts: ["水泥", "黄砂", "电线", "水管", "防水涂料"],
        supplierName: "平台优选供应商"
      },
      {
        id: "bom002",
        code: "BOM-STD-002",
        name: "标准三居室基装包",
        description: "适用于100-130平米三居室的标准装修基材套餐",
        type: "platform",
        productCount: 58,
        areaRange: "100-130㎡",
        referencePrice: "48,500.00",
        mainProducts: ["水泥", "黄砂", "电线", "水管", "瓷砖胶"],
        supplierName: "平台优选供应商"
      },
      {
        id: "bom003",
        code: "BOM-CUS-001",
        name: "深圳湾项目定制包",
        description: "深圳湾科技园项目专用基材套餐",
        type: "custom",
        productCount: 62,
        areaRange: "定制",
        referencePrice: "52,300.00",
        mainProducts: ["水泥", "螺纹钢", "商品混凝土", "防水卷材"],
        supplierName: "华新建材供应商"
      },
      {
        id: "bom004",
        code: "BOM-STD-003",
        name: "商业办公基装包",
        description: "适用于商业办公空间的标准装修基材套餐",
        type: "platform",
        productCount: 38,
        areaRange: "不限",
        referencePrice: "28,600.00",
        mainProducts: ["轻钢龙骨", "石膏板", "电线", "网线", "防火涂料"],
        supplierName: "平台优选供应商"
      }
    ]);
    const filteredBomList = common_vendor.computed(() => {
      let result = bomList.value;
      if (keyword.value) {
        const kw = keyword.value.toLowerCase();
        result = result.filter(
          (item) => item.name.toLowerCase().includes(kw) || item.code.toLowerCase().includes(kw)
        );
      }
      if (filterType.value) {
        result = result.filter((item) => item.type === filterType.value);
      }
      return result;
    });
    function handleDetail(item) {
      common_vendor.index.navigateTo({ url: `/pages/market/bom-detail?id=${item.id}` });
    }
    function handlePurchase(item) {
      common_vendor.index.showModal({
        title: "确认采购",
        content: `确定采购 ${item.name} 吗？`,
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.navigateTo({ url: `/pages/order/create?bomId=${item.id}` });
          }
        }
      });
    }
    const __returned__ = { keyword, filterType, bomList, filteredBomList, handleDetail, handlePurchase };
    Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
    return __returned__;
  }
});
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $setup.keyword,
    b: common_vendor.o(($event) => $setup.keyword = $event.detail.value),
    c: $setup.filterType === "" ? 1 : "",
    d: common_vendor.o(($event) => $setup.filterType = ""),
    e: $setup.filterType === "platform" ? 1 : "",
    f: common_vendor.o(($event) => $setup.filterType = "platform"),
    g: $setup.filterType === "custom" ? 1 : "",
    h: common_vendor.o(($event) => $setup.filterType = "custom"),
    i: common_vendor.f($setup.filteredBomList, (item, k0, i0) => {
      return {
        a: common_vendor.t(item.type === "platform" ? "平台标准" : "自定义"),
        b: common_vendor.n(item.type),
        c: common_vendor.t(item.code),
        d: common_vendor.t(item.name),
        e: common_vendor.t(item.description),
        f: common_vendor.t(item.productCount),
        g: common_vendor.t(item.areaRange),
        h: common_vendor.t(item.referencePrice),
        i: common_vendor.f(item.mainProducts, (prod, k1, i1) => {
          return {
            a: common_vendor.t(prod),
            b: prod
          };
        }),
        j: common_vendor.t(item.supplierName),
        k: common_vendor.o(($event) => $setup.handlePurchase(item), item.id),
        l: item.id,
        m: common_vendor.o(($event) => $setup.handleDetail(item), item.id)
      };
    }),
    j: $setup.filteredBomList.length === 0
  }, $setup.filteredBomList.length === 0 ? {} : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-338bc5ef"], ["__file", "/Users/mcdreamy/Documents/trae_projects/gongchengcang2/apps/mp/src/pages/market/bom.vue"]]);
wx.createPage(MiniProgramPage);
