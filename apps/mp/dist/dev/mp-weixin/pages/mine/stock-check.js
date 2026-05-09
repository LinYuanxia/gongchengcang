"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "stock-check",
  setup(__props, { expose: __expose }) {
    __expose();
    const checkStats = common_vendor.ref({
      total: 3,
      completed: 12,
      diff: 5
    });
    const checkList = common_vendor.ref([
      {
        id: "c001",
        checkNo: "PD2024010001",
        status: "completed",
        warehouse: "A区仓库",
        checkTime: "2024-01-10 14:30",
        operator: "张三",
        totalSku: 156,
        matched: 151,
        diff: 5
      },
      {
        id: "c002",
        checkNo: "PD2024010002",
        status: "completed",
        warehouse: "B区仓库",
        checkTime: "2024-01-08 10:20",
        operator: "李四",
        totalSku: 89,
        matched: 89,
        diff: 0
      },
      {
        id: "c003",
        checkNo: "PD2024010003",
        status: "pending",
        warehouse: "C区仓库",
        checkTime: "2024-01-15 09:00",
        operator: "张三",
        totalSku: 67,
        matched: 45,
        diff: 0
      },
      {
        id: "c004",
        checkNo: "PD2024010004",
        status: "draft",
        warehouse: "A区仓库",
        checkTime: "2024-01-15 15:30",
        operator: "王五",
        totalSku: 0,
        matched: 0,
        diff: 0
      }
    ]);
    function getStatusText(status) {
      const map = {
        draft: "草稿",
        pending: "进行中",
        completed: "已完成"
      };
      return map[status] || status;
    }
    function handleNewCheck() {
      common_vendor.index.showModal({
        title: "新建盘点",
        content: "确定要开始新的库存盘点吗？",
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.showToast({ title: "创建成功", icon: "success" });
          }
        }
      });
    }
    function handleScanCheck() {
      common_vendor.index.scanCode({
        success: (res) => {
          common_vendor.index.showToast({ title: "扫码成功: " + res.result, icon: "none" });
        },
        fail: () => {
          common_vendor.index.showToast({ title: "扫码失败", icon: "none" });
        }
      });
    }
    function handleViewDetail(item) {
      common_vendor.index.navigateTo({ url: `/pages/mine/stock-check-detail?id=${item.id}` });
    }
    function handleContinue(item) {
      common_vendor.index.navigateTo({ url: `/pages/mine/stock-check?id=${item.id}` });
    }
    function handleExport(item) {
      common_vendor.index.showToast({ title: "导出盘点报表", icon: "none" });
    }
    const __returned__ = { checkStats, checkList, getStatusText, handleNewCheck, handleScanCheck, handleViewDetail, handleContinue, handleExport };
    Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
    return __returned__;
  }
});
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.t($setup.checkStats.total),
    b: common_vendor.t($setup.checkStats.completed),
    c: common_vendor.t($setup.checkStats.diff),
    d: common_vendor.o($setup.handleNewCheck),
    e: common_vendor.o($setup.handleScanCheck),
    f: common_vendor.f($setup.checkList, (item, k0, i0) => {
      return common_vendor.e({
        a: common_vendor.t(item.checkNo),
        b: common_vendor.t($setup.getStatusText(item.status)),
        c: common_vendor.n(item.status),
        d: common_vendor.t(item.warehouse),
        e: common_vendor.t(item.checkTime),
        f: common_vendor.t(item.operator),
        g: common_vendor.t(item.totalSku),
        h: common_vendor.t(item.matched),
        i: common_vendor.t(item.diff),
        j: common_vendor.o(($event) => $setup.handleViewDetail(item), item.id),
        k: item.status === "pending"
      }, item.status === "pending" ? {
        l: common_vendor.o(($event) => $setup.handleContinue(item), item.id)
      } : {}, {
        m: item.status === "completed"
      }, item.status === "completed" ? {
        n: common_vendor.o(($event) => $setup.handleExport(item), item.id)
      } : {}, {
        o: item.id
      });
    }),
    g: $setup.checkList.length === 0
  }, $setup.checkList.length === 0 ? {
    h: common_vendor.o($setup.handleNewCheck)
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-08eb5d51"], ["__file", "/Users/mcdreamy/Documents/trae_projects/gongchengcang2/apps/mp/src/pages/mine/stock-check.vue"]]);
wx.createPage(MiniProgramPage);
