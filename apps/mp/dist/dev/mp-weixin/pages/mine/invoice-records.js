"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "invoice-records",
  setup(__props, { expose: __expose }) {
    __expose();
    const filterType = common_vendor.ref("all");
    const keyword = common_vendor.ref("");
    const records = common_vendor.ref([
      {
        id: "ir001",
        invoiceNo: "FP2024010001",
        type: "output",
        orderNo: "SO2024010012",
        company: "深圳建设集团",
        amount: "4,500.00",
        date: "2024-01-15",
        status: "issued"
      },
      {
        id: "ir002",
        invoiceNo: "FP2024010002",
        type: "output",
        orderNo: "SO2024010010",
        company: "广州建筑公司",
        amount: "21,000.00",
        date: "2024-01-14",
        status: "issued"
      },
      {
        id: "ir003",
        invoiceNo: "FP2024010003",
        type: "input",
        orderNo: "PO2024010008",
        company: "海螺水泥供应商",
        amount: "24,000.00",
        date: "2024-01-13",
        status: "received"
      },
      {
        id: "ir004",
        invoiceNo: "FP2024010004",
        type: "output",
        orderNo: "SO2024010008",
        company: "东莞工程公司",
        amount: "8,500.00",
        date: "2024-01-12",
        status: "red"
      },
      {
        id: "ir005",
        invoiceNo: "FP2024010005",
        type: "input",
        orderNo: "PO2024010006",
        company: "宝钢供应商",
        amount: "39,500.00",
        date: "2024-01-11",
        status: "received"
      },
      {
        id: "ir006",
        invoiceNo: "FP2024010006",
        type: "output",
        orderNo: "SO2024010005",
        company: "佛山建材市场",
        amount: "9,500.00",
        date: "2024-01-10",
        status: "pending"
      }
    ]);
    const filteredRecords = common_vendor.computed(() => {
      let result = records.value;
      if (filterType.value !== "all") {
        result = result.filter((r) => r.type === filterType.value);
      }
      if (keyword.value) {
        const kw = keyword.value.toLowerCase();
        result = result.filter(
          (r) => r.invoiceNo.toLowerCase().includes(kw) || r.orderNo.toLowerCase().includes(kw)
        );
      }
      return result;
    });
    function getStatusText(status) {
      const map = {
        pending: "待开票",
        issued: "已开票",
        received: "已收到",
        red: "已红冲"
      };
      return map[status] || status;
    }
    function handlePreview(item) {
      common_vendor.index.showToast({ title: "查看发票: " + item.invoiceNo, icon: "none" });
    }
    function handleDownload(item) {
      common_vendor.index.showToast({ title: "下载发票", icon: "none" });
    }
    const __returned__ = { filterType, keyword, records, filteredRecords, getStatusText, handlePreview, handleDownload };
    Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
    return __returned__;
  }
});
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $setup.filterType === "all" ? 1 : "",
    b: common_vendor.o(($event) => $setup.filterType = "all"),
    c: $setup.filterType === "output" ? 1 : "",
    d: common_vendor.o(($event) => $setup.filterType = "output"),
    e: $setup.filterType === "input" ? 1 : "",
    f: common_vendor.o(($event) => $setup.filterType = "input"),
    g: $setup.keyword,
    h: common_vendor.o(($event) => $setup.keyword = $event.detail.value),
    i: common_vendor.f($setup.filteredRecords, (item, k0, i0) => {
      return {
        a: common_vendor.t(item.invoiceNo),
        b: common_vendor.t(item.type === "output" ? "销项" : "进项"),
        c: common_vendor.n(item.type),
        d: common_vendor.t(item.orderNo),
        e: common_vendor.t(item.type === "output" ? "购买方" : "销售方"),
        f: common_vendor.t(item.company),
        g: common_vendor.t(item.amount),
        h: common_vendor.t(item.date),
        i: common_vendor.t($setup.getStatusText(item.status)),
        j: common_vendor.n(item.status),
        k: common_vendor.o(($event) => $setup.handlePreview(item), item.id),
        l: common_vendor.o(($event) => $setup.handleDownload(item), item.id),
        m: item.id
      };
    }),
    j: $setup.filteredRecords.length === 0
  }, $setup.filteredRecords.length === 0 ? {} : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-4209d216"], ["__file", "/Users/mcdreamy/Documents/trae_projects/gongchengcang2/apps/mp/src/pages/mine/invoice-records.vue"]]);
wx.createPage(MiniProgramPage);
