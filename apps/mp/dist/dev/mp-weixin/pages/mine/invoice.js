"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "invoice",
  setup(__props, { expose: __expose }) {
    __expose();
    const currentTab = common_vendor.ref("out");
    const outStatus = common_vendor.ref("");
    const inStatus = common_vendor.ref("");
    const selectedMonth = common_vendor.ref("");
    const selectedType = common_vendor.ref("");
    const showTypeFilter = common_vendor.ref(false);
    const outCount = common_vendor.ref(8);
    const outInvoices = common_vendor.ref([
      { id: 1, orderNo: "SO2024010012", createTime: "2024-01-15", customerName: "深圳建设集团", amount: "4,500.00", invoiceType: "增值税专用发票", status: "pending", statusText: "待开票" },
      { id: 2, orderNo: "SO2024010011", createTime: "2024-01-15", customerName: "广州建筑公司", amount: "21,000.00", invoiceType: "增值税专用发票", status: "processing", statusText: "开票中" },
      { id: 3, orderNo: "SO2024010010", createTime: "2024-01-14", customerName: "东莞工程公司", amount: "21,000.00", invoiceType: "增值税普通发票", status: "completed", statusText: "已开票" }
    ]);
    const inInvoices = common_vendor.ref([
      { id: 1, orderNo: "PO2024010001", createTime: "2024-01-15", supplierName: "华新水泥供应商", amount: "8,400.00", invoiceType: "增值税专用发票", status: "pending", statusText: "待收票" },
      { id: 2, orderNo: "PO2024010002", createTime: "2024-01-14", supplierName: "宝钢供应商", amount: "39,500.00", invoiceType: "增值税专用发票", status: "received", statusText: "已收票" },
      { id: 3, orderNo: "PO2024010003", createTime: "2024-01-12", supplierName: "南方建材供应商", amount: "8,000.00", invoiceType: "增值税专用发票", status: "verified", statusText: "已认证" }
    ]);
    const summaryData = common_vendor.ref({
      totalAmount: "128,500.00",
      count: 15
    });
    const invoiceRecords = common_vendor.ref([
      { id: 1, type: "out", title: "深圳建设集团", invoiceNo: "FP2024010001", amount: "4,500.00", time: "2024-01-15" },
      { id: 2, type: "in", title: "华新水泥供应商", invoiceNo: "FP2024010002", amount: "8,400.00", time: "2024-01-14" },
      { id: 3, type: "out", title: "广州建筑公司", invoiceNo: "FP2024010003", amount: "21,000.00", time: "2024-01-13" }
    ]);
    const filteredOutInvoices = common_vendor.computed(() => {
      if (!outStatus.value) return outInvoices.value;
      return outInvoices.value.filter((item) => item.status === outStatus.value);
    });
    const filteredInInvoices = common_vendor.computed(() => {
      if (!inStatus.value) return inInvoices.value;
      return inInvoices.value.filter((item) => item.status === inStatus.value);
    });
    function handleDateChange(e) {
      selectedMonth.value = e.detail.value;
    }
    function handleIssueInvoice(item) {
      common_vendor.index.showModal({
        title: "确认开票",
        content: `确定为 ${item.customerName} 开具发票 ¥${item.amount} 吗？`,
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.showToast({ title: "已提交开票申请", icon: "success" });
          }
        }
      });
    }
    function handleViewProgress(item) {
      common_vendor.index.showToast({ title: "查看开票进度", icon: "none" });
    }
    function handleViewInvoice(item) {
      common_vendor.index.showToast({ title: "查看发票详情", icon: "none" });
    }
    function handleDownloadInvoice(item) {
      common_vendor.index.showToast({ title: "下载发票", icon: "none" });
    }
    function handleRemindInvoice(item) {
      common_vendor.index.showModal({
        title: "提醒开票",
        content: `确定提醒 ${item.supplierName} 开具发票吗？`,
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.showToast({ title: "已发送提醒", icon: "success" });
          }
        }
      });
    }
    function handleVerifyInvoice(item) {
      common_vendor.index.showModal({
        title: "发票认证",
        content: `确定认证该发票吗？`,
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.showToast({ title: "认证成功", icon: "success" });
          }
        }
      });
    }
    const __returned__ = { currentTab, outStatus, inStatus, selectedMonth, selectedType, showTypeFilter, outCount, outInvoices, inInvoices, summaryData, invoiceRecords, filteredOutInvoices, filteredInInvoices, handleDateChange, handleIssueInvoice, handleViewProgress, handleViewInvoice, handleDownloadInvoice, handleRemindInvoice, handleVerifyInvoice };
    Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
    return __returned__;
  }
});
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $setup.outCount > 0
  }, $setup.outCount > 0 ? {
    b: common_vendor.t($setup.outCount)
  } : {}, {
    c: $setup.currentTab === "out" ? 1 : "",
    d: common_vendor.o(($event) => $setup.currentTab = "out"),
    e: $setup.currentTab === "in" ? 1 : "",
    f: common_vendor.o(($event) => $setup.currentTab = "in"),
    g: $setup.currentTab === "records" ? 1 : "",
    h: common_vendor.o(($event) => $setup.currentTab = "records"),
    i: $setup.currentTab === "out"
  }, $setup.currentTab === "out" ? {
    j: $setup.outStatus === "" ? 1 : "",
    k: common_vendor.o(($event) => $setup.outStatus = ""),
    l: $setup.outStatus === "pending" ? 1 : "",
    m: common_vendor.o(($event) => $setup.outStatus = "pending"),
    n: $setup.outStatus === "processing" ? 1 : "",
    o: common_vendor.o(($event) => $setup.outStatus = "processing"),
    p: $setup.outStatus === "completed" ? 1 : "",
    q: common_vendor.o(($event) => $setup.outStatus = "completed"),
    r: common_vendor.f($setup.filteredOutInvoices, (item, k0, i0) => {
      return common_vendor.e({
        a: common_vendor.t(item.orderNo),
        b: common_vendor.t(item.createTime),
        c: common_vendor.t(item.statusText),
        d: common_vendor.n(item.status),
        e: common_vendor.t(item.customerName),
        f: common_vendor.t(item.amount),
        g: common_vendor.t(item.invoiceType),
        h: item.status === "pending"
      }, item.status === "pending" ? {
        i: common_vendor.o(($event) => $setup.handleIssueInvoice(item), item.id)
      } : {}, {
        j: item.status === "processing"
      }, item.status === "processing" ? {
        k: common_vendor.o(($event) => $setup.handleViewProgress(item), item.id)
      } : {}, {
        l: item.status === "completed"
      }, item.status === "completed" ? {
        m: common_vendor.o(($event) => $setup.handleViewInvoice(item), item.id)
      } : {}, {
        n: item.status === "completed"
      }, item.status === "completed" ? {
        o: common_vendor.o(($event) => $setup.handleDownloadInvoice(item), item.id)
      } : {}, {
        p: item.id
      });
    })
  } : {}, {
    s: $setup.currentTab === "in"
  }, $setup.currentTab === "in" ? {
    t: $setup.inStatus === "" ? 1 : "",
    v: common_vendor.o(($event) => $setup.inStatus = ""),
    w: $setup.inStatus === "pending" ? 1 : "",
    x: common_vendor.o(($event) => $setup.inStatus = "pending"),
    y: $setup.inStatus === "received" ? 1 : "",
    z: common_vendor.o(($event) => $setup.inStatus = "received"),
    A: $setup.inStatus === "verified" ? 1 : "",
    B: common_vendor.o(($event) => $setup.inStatus = "verified"),
    C: common_vendor.f($setup.filteredInInvoices, (item, k0, i0) => {
      return common_vendor.e({
        a: common_vendor.t(item.orderNo),
        b: common_vendor.t(item.createTime),
        c: common_vendor.t(item.statusText),
        d: common_vendor.n(item.status),
        e: common_vendor.t(item.supplierName),
        f: common_vendor.t(item.amount),
        g: common_vendor.t(item.invoiceType),
        h: item.status === "pending"
      }, item.status === "pending" ? {
        i: common_vendor.o(($event) => $setup.handleRemindInvoice(item), item.id)
      } : {}, {
        j: item.status === "received"
      }, item.status === "received" ? {
        k: common_vendor.o(($event) => $setup.handleVerifyInvoice(item), item.id)
      } : {}, {
        l: item.status === "received" || item.status === "verified"
      }, item.status === "received" || item.status === "verified" ? {
        m: common_vendor.o(($event) => $setup.handleViewInvoice(item), item.id)
      } : {}, {
        n: item.id
      });
    })
  } : {}, {
    D: $setup.currentTab === "records"
  }, $setup.currentTab === "records" ? {
    E: common_vendor.t($setup.selectedMonth || "选择月份"),
    F: common_vendor.o($setup.handleDateChange),
    G: common_vendor.t($setup.selectedType || "发票类型"),
    H: common_vendor.o(($event) => $setup.showTypeFilter = true),
    I: common_vendor.t($setup.summaryData.totalAmount),
    J: common_vendor.t($setup.summaryData.count),
    K: common_vendor.f($setup.invoiceRecords, (item, k0, i0) => {
      return {
        a: common_vendor.t(item.type === "out" ? "销" : "进"),
        b: common_vendor.n(item.type),
        c: common_vendor.t(item.title),
        d: common_vendor.t(item.invoiceNo),
        e: common_vendor.t(item.amount),
        f: common_vendor.t(item.time),
        g: item.id
      };
    })
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-335dc905"], ["__file", "/Users/mcdreamy/Documents/trae_projects/gongchengcang2/apps/mp/src/pages/mine/invoice.vue"]]);
wx.createPage(MiniProgramPage);
