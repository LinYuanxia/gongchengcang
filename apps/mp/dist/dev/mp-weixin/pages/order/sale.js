"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "sale",
  setup(__props, { expose: __expose }) {
    __expose();
    const activeTab = common_vendor.ref("all");
    const searchKeyword = common_vendor.ref("");
    const orders = common_vendor.ref([
      {
        id: "so001",
        orderNo: "SO2024010001",
        status: "toShip",
        products: [
          { name: "水泥 P.O 42.5", spec: "50kg/袋", price: 450, quantity: 100, image: "https://via.placeholder.com/100" }
        ],
        totalAmount: 45e3,
        createTime: "2024-01-15 10:30:00",
        buyerName: "深圳建工集团"
      },
      {
        id: "so002",
        orderNo: "SO2024010002",
        status: "toShip",
        products: [
          { name: "螺纹钢 HRB400 16mm", spec: "16mm", price: 4280, quantity: 10, image: "https://via.placeholder.com/100" }
        ],
        totalAmount: 42800,
        createTime: "2024-01-15 09:20:00",
        buyerName: "中建三局"
      },
      {
        id: "so003",
        orderNo: "SO2024010003",
        status: "shipped",
        products: [
          { name: "黄砂 中砂", spec: "中砂", price: 95, quantity: 500, image: "https://via.placeholder.com/100" },
          { name: "碎石 5-31.5mm", spec: "5-31.5mm", price: 85, quantity: 300, image: "https://via.placeholder.com/100" }
        ],
        totalAmount: 73e3,
        createTime: "2024-01-14 16:45:00",
        buyerName: "深圳湾置业"
      },
      {
        id: "so004",
        orderNo: "SO2024010004",
        status: "completed",
        products: [
          { name: "商品混凝土 C30", spec: "C30", price: 420, quantity: 200, image: "https://via.placeholder.com/100" }
        ],
        totalAmount: 84e3,
        createTime: "2024-01-13 14:20:00",
        buyerName: "万科地产"
      },
      {
        id: "so005",
        orderNo: "SO2024010005",
        status: "afterSale",
        products: [
          { name: "防水涂料 聚氨酯", spec: "20kg/桶", price: 380, quantity: 50, image: "https://via.placeholder.com/100" }
        ],
        totalAmount: 19e3,
        createTime: "2024-01-12 11:30:00",
        buyerName: "恒大地产"
      },
      {
        id: "so006",
        orderNo: "SO2024010006",
        status: "toShip",
        products: [
          { name: "轻钢龙骨 50型", spec: "50mm", price: 28, quantity: 500, image: "https://via.placeholder.com/100" },
          { name: "石膏板 12mm", spec: "1200x2400mm", price: 45, quantity: 200, image: "https://via.placeholder.com/100" }
        ],
        totalAmount: 23e3,
        createTime: "2024-01-15 08:15:00",
        buyerName: "华润置地"
      },
      {
        id: "so007",
        orderNo: "SO2024010007",
        status: "shipped",
        products: [
          { name: "电线 BV 2.5mm²", spec: "2.5mm²", price: 180, quantity: 100, image: "https://via.placeholder.com/100" }
        ],
        totalAmount: 18e3,
        createTime: "2024-01-14 09:30:00",
        buyerName: "招商地产"
      },
      {
        id: "so008",
        orderNo: "SO2024010008",
        status: "completed",
        products: [
          { name: "水管 PPR 20mm", spec: "20mm", price: 15, quantity: 1e3, image: "https://via.placeholder.com/100" }
        ],
        totalAmount: 15e3,
        createTime: "2024-01-11 15:40:00",
        buyerName: "碧桂园"
      }
    ]);
    const statusCounts = common_vendor.computed(() => ({
      all: orders.value.length,
      toShip: orders.value.filter((o) => o.status === "toShip").length,
      shipped: orders.value.filter((o) => o.status === "shipped").length,
      completed: orders.value.filter((o) => o.status === "completed").length,
      afterSale: orders.value.filter((o) => o.status === "afterSale").length
    }));
    const filteredOrders = common_vendor.computed(() => {
      let result = orders.value;
      if (activeTab.value !== "all") {
        result = result.filter((o) => o.status === activeTab.value);
      }
      if (searchKeyword.value) {
        const keyword = searchKeyword.value.toLowerCase();
        result = result.filter(
          (o) => o.orderNo.toLowerCase().includes(keyword) || o.products.some((p) => p.name.toLowerCase().includes(keyword))
        );
      }
      return result;
    });
    function getStatusText(status) {
      const map = {
        toShip: "待发货",
        shipped: "已发货",
        completed: "已完成",
        afterSale: "售后中"
      };
      return map[status] || status;
    }
    function handleOrderDetail(order) {
      common_vendor.index.navigateTo({ url: `/pages/order/detail?id=${order.id}` });
    }
    function handleShip(order) {
      common_vendor.index.navigateTo({ url: `/pages/order/ship?orderId=${order.id}` });
    }
    function handleTrack(order) {
      common_vendor.index.showToast({ title: "物流查询功能开发中", icon: "none" });
    }
    common_vendor.onMounted(() => {
      var _a;
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      if ((_a = currentPage == null ? void 0 : currentPage.options) == null ? void 0 : _a.status) {
        activeTab.value = currentPage.options.status;
      }
    });
    const __returned__ = { activeTab, searchKeyword, orders, statusCounts, filteredOrders, getStatusText, handleOrderDetail, handleShip, handleTrack };
    Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
    return __returned__;
  }
});
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.t($setup.statusCounts.all),
    b: $setup.activeTab === "all" ? 1 : "",
    c: common_vendor.o(($event) => $setup.activeTab = "all"),
    d: common_vendor.t($setup.statusCounts.toShip),
    e: $setup.activeTab === "toShip" ? 1 : "",
    f: common_vendor.o(($event) => $setup.activeTab = "toShip"),
    g: common_vendor.t($setup.statusCounts.shipped),
    h: $setup.activeTab === "shipped" ? 1 : "",
    i: common_vendor.o(($event) => $setup.activeTab = "shipped"),
    j: common_vendor.t($setup.statusCounts.completed),
    k: $setup.activeTab === "completed" ? 1 : "",
    l: common_vendor.o(($event) => $setup.activeTab = "completed"),
    m: common_vendor.t($setup.statusCounts.afterSale),
    n: $setup.activeTab === "afterSale" ? 1 : "",
    o: common_vendor.o(($event) => $setup.activeTab = "afterSale"),
    p: $setup.searchKeyword,
    q: common_vendor.o(($event) => $setup.searchKeyword = $event.detail.value),
    r: common_vendor.f($setup.filteredOrders, (order, k0, i0) => {
      return common_vendor.e({
        a: common_vendor.t(order.orderNo),
        b: common_vendor.t($setup.getStatusText(order.status)),
        c: common_vendor.n(order.status),
        d: common_vendor.f(order.products, (item, index, i1) => {
          return {
            a: item.image,
            b: common_vendor.t(item.name),
            c: common_vendor.t(item.spec),
            d: common_vendor.t(item.price),
            e: common_vendor.t(item.quantity),
            f: index
          };
        }),
        e: common_vendor.t(order.totalAmount),
        f: order.status === "toShip"
      }, order.status === "toShip" ? {
        g: common_vendor.o(($event) => $setup.handleShip(order), order.id)
      } : {}, {
        h: order.status === "shipped"
      }, order.status === "shipped" ? {
        i: common_vendor.o(($event) => $setup.handleTrack(order), order.id)
      } : {}, {
        j: common_vendor.o(($event) => $setup.handleOrderDetail(order), order.id),
        k: order.id,
        l: common_vendor.o(($event) => $setup.handleOrderDetail(order), order.id)
      });
    }),
    s: $setup.filteredOrders.length === 0
  }, $setup.filteredOrders.length === 0 ? {} : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-171234fc"], ["__file", "/Users/mcdreamy/Documents/trae_projects/gongchengcang2/apps/mp/src/pages/order/sale.vue"]]);
wx.createPage(MiniProgramPage);
