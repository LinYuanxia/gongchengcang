"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "stock-records",
  setup(__props, { expose: __expose }) {
    __expose();
    const recordType = common_vendor.ref("in");
    const keyword = common_vendor.ref("");
    const filterDate = common_vendor.ref("");
    const inRecords = common_vendor.ref([
      {
        id: "ir001",
        orderNo: "RK2024010001",
        sourceType: "purchase",
        products: [
          { name: "水泥 P.O 42.5", spec: "50kg/袋", image: "https://via.placeholder.com/80", qty: 100, unit: "吨" }
        ],
        warehouse: "A区仓库",
        operator: "张三",
        time: "2024-01-15 14:30",
        totalQty: 100
      },
      {
        id: "ir002",
        orderNo: "RK2024010002",
        sourceType: "purchase",
        products: [
          { name: "螺纹钢 HRB400 16mm", spec: "16mm", image: "https://via.placeholder.com/80", qty: 50, unit: "吨" },
          { name: "螺纹钢 HRB400 20mm", spec: "20mm", image: "https://via.placeholder.com/80", qty: 30, unit: "吨" }
        ],
        warehouse: "B区仓库",
        operator: "李四",
        time: "2024-01-14 10:20",
        totalQty: 80
      },
      {
        id: "ir003",
        orderNo: "RK2024010003",
        sourceType: "return",
        products: [
          { name: "黄砂 中砂", spec: "中砂", image: "https://via.placeholder.com/80", qty: 20, unit: "方" }
        ],
        warehouse: "C区仓库",
        operator: "王五",
        time: "2024-01-13 16:45",
        totalQty: 20
      },
      {
        id: "ir004",
        orderNo: "RK2024010004",
        sourceType: "transfer",
        products: [
          { name: "商品混凝土 C30", spec: "C30", image: "https://via.placeholder.com/80", qty: 30, unit: "方" }
        ],
        warehouse: "A区仓库",
        operator: "赵六",
        time: "2024-01-12 09:15",
        totalQty: 30
      },
      {
        id: "ir005",
        orderNo: "RK2024010005",
        sourceType: "check",
        products: [
          { name: "防水涂料 聚氨酯", spec: "20kg/桶", image: "https://via.placeholder.com/80", qty: 10, unit: "桶" }
        ],
        warehouse: "A区仓库",
        operator: "张三",
        time: "2024-01-11 11:30",
        totalQty: 10
      }
    ]);
    const outRecords = common_vendor.ref([
      {
        id: "or001",
        orderNo: "CK2024010001",
        sourceType: "sale",
        products: [
          { name: "水泥 P.O 42.5", spec: "50kg/袋", image: "https://via.placeholder.com/80", qty: 50, unit: "吨" }
        ],
        warehouse: "A区仓库",
        operator: "张三",
        time: "2024-01-15 15:30",
        totalQty: 50
      },
      {
        id: "or002",
        orderNo: "CK2024010002",
        sourceType: "sale",
        products: [
          { name: "螺纹钢 HRB400 16mm", spec: "16mm", image: "https://via.placeholder.com/80", qty: 20, unit: "吨" }
        ],
        warehouse: "B区仓库",
        operator: "李四",
        time: "2024-01-14 14:20",
        totalQty: 20
      },
      {
        id: "or003",
        orderNo: "CK2024010003",
        operator: "李四",
        time: "2024-01-14 11:20",
        totalQty: 20
      },
      {
        id: "or003",
        orderNo: "CK2024010003",
        sourceType: "transfer",
        products: [
          { name: "碎石 5-31.5mm", spec: "5-31.5mm", image: "https://via.placeholder.com/80", qty: 40, unit: "方" }
        ],
        warehouse: "C区仓库",
        operator: "王五",
        time: "2024-01-13 14:45",
        totalQty: 40
      },
      {
        id: "or004",
        orderNo: "CK2024010004",
        sourceType: "check",
        products: [
          { name: "轻钢龙骨 50型", spec: "50mm", image: "https://via.placeholder.com/80", qty: 5, unit: "根" }
        ],
        warehouse: "A区仓库",
        operator: "赵六",
        time: "2024-01-12 16:15",
        totalQty: 5
      }
    ]);
    const filteredRecords = common_vendor.computed(() => {
      let result = recordType.value === "in" ? inRecords.value : outRecords.value;
      if (keyword.value) {
        const kw = keyword.value.toLowerCase();
        result = result.filter(
          (r) => r.orderNo.toLowerCase().includes(kw) || r.products.some((p) => p.name.toLowerCase().includes(kw))
        );
      }
      if (filterDate.value) {
        result = result.filter((r) => r.time.startsWith(filterDate.value));
      }
      return result;
    });
    function getSourceText(type) {
      const inMap = {
        purchase: "采购入库",
        return: "退货入库",
        transfer: "调拨入库",
        check: "盘点调整"
      };
      const outMap = {
        sale: "销售出库",
        transfer: "调拨出库",
        check: "盘点调整"
      };
      return recordType.value === "in" ? inMap[type] : outMap[type];
    }
    common_vendor.onMounted(() => {
      var _a;
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      if ((_a = currentPage == null ? void 0 : currentPage.options) == null ? void 0 : _a.type) {
        recordType.value = currentPage.options.type;
      }
    });
    const __returned__ = { recordType, keyword, filterDate, inRecords, outRecords, filteredRecords, getSourceText };
    Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
    return __returned__;
  }
});
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $setup.recordType === "in" ? 1 : "",
    b: common_vendor.o(($event) => $setup.recordType = "in"),
    c: $setup.recordType === "out" ? 1 : "",
    d: common_vendor.o(($event) => $setup.recordType = "out"),
    e: $setup.keyword,
    f: common_vendor.o(($event) => $setup.keyword = $event.detail.value),
    g: common_vendor.t($setup.filterDate || "选择日期"),
    h: $setup.filterDate,
    i: common_vendor.o(($event) => $setup.filterDate = $event.detail.value),
    j: common_vendor.f($setup.filteredRecords, (item, k0, i0) => {
      return {
        a: common_vendor.t(item.orderNo),
        b: common_vendor.t($setup.getSourceText(item.sourceType)),
        c: common_vendor.n(item.sourceType),
        d: common_vendor.f(item.products, (prod, idx, i1) => {
          return {
            a: prod.image,
            b: common_vendor.t(prod.name),
            c: common_vendor.t(prod.spec),
            d: common_vendor.t(prod.qty),
            e: common_vendor.t(prod.unit),
            f: idx
          };
        }),
        e: common_vendor.t(item.warehouse),
        f: common_vendor.t(item.operator),
        g: common_vendor.t(item.time),
        h: common_vendor.t(item.totalQty),
        i: item.id
      };
    }),
    k: $setup.filteredRecords.length === 0
  }, $setup.filteredRecords.length === 0 ? {
    l: common_vendor.t($setup.recordType === "in" ? "入库" : "出库")
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-575a941a"], ["__file", "/Users/mcdreamy/Documents/trae_projects/gongchengcang2/apps/mp/src/pages/mine/stock-records.vue"]]);
wx.createPage(MiniProgramPage);
