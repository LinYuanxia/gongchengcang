"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "purchase",
  setup(__props, { expose: __expose }) {
    __expose();
    const activeTab = common_vendor.ref("all");
    const searchKeyword = common_vendor.ref("");
    const orders = common_vendor.ref([
      {
        id: "po001",
        orderNo: "PO2024010001",
        status: "toConfirm",
        products: [
          { name: "水泥 P.O 42.5", spec: "50kg/袋", price: 420, quantity: 200, image: "https://via.placeholder.com/100" }
        ],
        totalAmount: 84e3,
        createTime: "2024-01-15 10:30:00",
        supplierName: "海螺水泥深圳分公司"
      },
      {
        id: "po002",
        orderNo: "PO2024010002",
        status: "toConfirm",
        products: [
          { name: "螺纹钢 HRB400 16mm", spec: "16mm", price: 4100, quantity: 50, image: "https://via.placeholder.com/100" },
          { name: "螺纹钢 HRB400 20mm", spec: "20mm", price: 4050, quantity: 30, image: "https://via.placeholder.com/100" }
        ],
        totalAmount: 326500,
        createTime: "2024-01-15 09:20:00",
        supplierName: "宝钢集团深圳销售公司"
      },
      {
        id: "po003",
        orderNo: "PO2024010003",
        status: "toShip",
        products: [
          { name: "黄砂 中砂", spec: "中砂", price: 85, quantity: 1e3, image: "https://via.placeholder.com/100" }
        ],
        totalAmount: 85e3,
        createTime: "2024-01-14 16:45:00",
        supplierName: "深圳砂石供应中心",
        expectedArrival: "2024-01-17"
      },
      {
        id: "po004",
        orderNo: "PO2024010004",
        status: "toReceive",
        products: [
          { name: "商品混凝土 C30", spec: "C30", price: 400, quantity: 500, image: "https://via.placeholder.com/100" }
        ],
        totalAmount: 2e5,
        createTime: "2024-01-13 14:20:00",
        supplierName: "深圳混凝土有限公司",
        expectedArrival: "2024-01-16"
      },
      {
        id: "po005",
        orderNo: "PO2024010005",
        status: "toReceive",
        products: [
          { name: "防水涂料 聚氨酯", spec: "20kg/桶", price: 350, quantity: 100, image: "https://via.placeholder.com/100" }
        ],
        totalAmount: 35e3,
        createTime: "2024-01-12 11:30:00",
        supplierName: "东方雨虹防水材料",
        expectedArrival: "2024-01-15"
      },
      {
        id: "po006",
        orderNo: "PO2024010006",
        status: "completed",
        products: [
          { name: "轻钢龙骨 50型", spec: "50mm", price: 25, quantity: 1e3, image: "https://via.placeholder.com/100" }
        ],
        totalAmount: 25e3,
        createTime: "2024-01-10 08:15:00",
        supplierName: "深圳建材批发中心"
      },
      {
        id: "po007",
        orderNo: "PO2024010007",
        status: "completed",
        products: [
          { name: "电线 BV 2.5mm²", spec: "2.5mm²", price: 170, quantity: 200, image: "https://via.placeholder.com/100" },
          { name: "电线 BV 4mm²", spec: "4mm²", price: 300, quantity: 100, image: "https://via.placeholder.com/100" }
        ],
        totalAmount: 64e3,
        createTime: "2024-01-08 09:30:00",
        supplierName: "深圳电线电缆有限公司"
      },
      {
        id: "po008",
        orderNo: "PO2024010008",
        status: "toShip",
        products: [
          { name: "水管 PPR 20mm", spec: "20mm", price: 12, quantity: 2e3, image: "https://via.placeholder.com/100" }
        ],
        totalAmount: 24e3,
        createTime: "2024-01-14 15:40:00",
        supplierName: "深圳管道材料公司",
        expectedArrival: "2024-01-18"
      }
    ]);
    const statusCounts = common_vendor.computed(() => ({
      all: orders.value.length,
      toConfirm: orders.value.filter((o) => o.status === "toConfirm").length,
      toShip: orders.value.filter((o) => o.status === "toShip").length,
      toReceive: orders.value.filter((o) => o.status === "toReceive").length,
      completed: orders.value.filter((o) => o.status === "completed").length
    }));
    const filteredOrders = common_vendor.computed(() => {
      let result = orders.value;
      if (activeTab.value !== "all") {
        result = result.filter((o) => o.status === activeTab.value);
      }
      if (searchKeyword.value) {
        const keyword = searchKeyword.value.toLowerCase();
        result = result.filter(
          (o) => o.orderNo.toLowerCase().includes(keyword) || o.supplierName.toLowerCase().includes(keyword) || o.products.some((p) => p.name.toLowerCase().includes(keyword))
        );
      }
      return result;
    });
    function getStatusText(status) {
      const map = {
        toConfirm: "待确认",
        toShip: "待发货",
        toReceive: "待入库",
        completed: "已完成"
      };
      return map[status] || status;
    }
    function handleOrderDetail(order) {
      common_vendor.index.navigateTo({ url: `/pages/order/detail?id=${order.id}&type=purchase` });
    }
    function handleConfirm(order) {
      common_vendor.index.showModal({
        title: "确认订单",
        content: "确认接受该采购订单吗？",
        success: (res) => {
          if (res.confirm) {
            order.status = "toShip";
            common_vendor.index.showToast({ title: "确认成功", icon: "success" });
          }
        }
      });
    }
    function handleReceive(order) {
      common_vendor.index.navigateTo({ url: `/pages/order/receive?orderId=${order.id}` });
    }
    function handleRemind(order) {
      common_vendor.index.showToast({ title: "已发送催发货提醒", icon: "success" });
    }
    common_vendor.onMounted(() => {
      var _a;
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      if ((_a = currentPage == null ? void 0 : currentPage.options) == null ? void 0 : _a.status) {
        activeTab.value = currentPage.options.status;
      }
    });
    const __returned__ = { activeTab, searchKeyword, orders, statusCounts, filteredOrders, getStatusText, handleOrderDetail, handleConfirm, handleReceive, handleRemind };
    Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
    return __returned__;
  }
});
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.t($setup.statusCounts.all),
    b: $setup.activeTab === "all" ? 1 : "",
    c: common_vendor.o(($event) => $setup.activeTab = "all"),
    d: common_vendor.t($setup.statusCounts.toConfirm),
    e: $setup.activeTab === "toConfirm" ? 1 : "",
    f: common_vendor.o(($event) => $setup.activeTab = "toConfirm"),
    g: common_vendor.t($setup.statusCounts.toShip),
    h: $setup.activeTab === "toShip" ? 1 : "",
    i: common_vendor.o(($event) => $setup.activeTab = "toShip"),
    j: common_vendor.t($setup.statusCounts.toReceive),
    k: $setup.activeTab === "toReceive" ? 1 : "",
    l: common_vendor.o(($event) => $setup.activeTab = "toReceive"),
    m: common_vendor.t($setup.statusCounts.completed),
    n: $setup.activeTab === "completed" ? 1 : "",
    o: common_vendor.o(($event) => $setup.activeTab = "completed"),
    p: $setup.searchKeyword,
    q: common_vendor.o(($event) => $setup.searchKeyword = $event.detail.value),
    r: common_vendor.f($setup.filteredOrders, (order, k0, i0) => {
      return common_vendor.e({
        a: common_vendor.t(order.orderNo),
        b: common_vendor.t($setup.getStatusText(order.status)),
        c: common_vendor.n(order.status),
        d: common_vendor.t(order.supplierName),
        e: common_vendor.f(order.products, (item, index, i1) => {
          return {
            a: item.image,
            b: common_vendor.t(item.name),
            c: common_vendor.t(item.spec),
            d: common_vendor.t(item.price),
            e: common_vendor.t(item.quantity),
            f: index
          };
        }),
        f: common_vendor.t(order.totalAmount),
        g: order.status === "toConfirm"
      }, order.status === "toConfirm" ? {
        h: common_vendor.o(($event) => $setup.handleConfirm(order), order.id)
      } : {}, {
        i: order.status === "toReceive"
      }, order.status === "toReceive" ? {
        j: common_vendor.o(($event) => $setup.handleReceive(order), order.id)
      } : {}, {
        k: order.status === "toShip"
      }, order.status === "toShip" ? {
        l: common_vendor.o(($event) => $setup.handleRemind(order), order.id)
      } : {}, {
        m: common_vendor.o(($event) => $setup.handleOrderDetail(order), order.id),
        n: order.id,
        o: common_vendor.o(($event) => $setup.handleOrderDetail(order), order.id)
      });
    }),
    s: $setup.filteredOrders.length === 0
  }, $setup.filteredOrders.length === 0 ? {} : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-078d5be2"], ["__file", "/Users/mcdreamy/Documents/trae_projects/gongchengcang2/apps/mp/src/pages/order/purchase.vue"]]);
wx.createPage(MiniProgramPage);
