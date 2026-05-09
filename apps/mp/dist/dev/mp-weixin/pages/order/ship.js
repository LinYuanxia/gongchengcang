"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "ship",
  setup(__props, { expose: __expose }) {
    __expose();
    const keyword = common_vendor.ref("");
    const showFilter = common_vendor.ref(false);
    const filterType = common_vendor.ref("");
    const filterDate = common_vendor.ref("");
    const showShipModal = common_vendor.ref(false);
    const currentOrder = common_vendor.ref(null);
    const logisticsIndex = common_vendor.ref(0);
    const logisticsNo = common_vendor.ref("");
    const shipRemark = common_vendor.ref("");
    const logisticsCompanies = ["顺丰速运", "中通快递", "圆通速递", "韵达快递", "申通快递", "自配送"];
    const stats = common_vendor.ref({
      total: 12,
      today: 5,
      urgent: 2,
      partial: 3
    });
    const orders = common_vendor.ref([
      {
        id: "so001",
        orderNo: "SO2024010012",
        createTime: "2024-01-15 14:30",
        customerName: "深圳建设集团",
        customerPhone: "138****8888",
        address: "深圳市南山区科技园xxx大厦",
        isUrgent: true,
        shippedQty: 0,
        totalQty: 10,
        totalAmount: "4,500.00",
        products: [
          { id: "p1", name: "水泥 P.O 42.5", spec: "42.5", image: "https://picsum.photos/100/100?random=1", qty: 10, stock: 50, shippedQty: 0 }
        ]
      },
      {
        id: "so002",
        orderNo: "SO2024010013",
        createTime: "2024-01-15 16:20",
        customerName: "广州建筑公司",
        customerPhone: "139****9999",
        address: "广州市天河区xxx路xxx号",
        isUrgent: false,
        shippedQty: 5,
        totalQty: 10,
        totalAmount: "21,000.00",
        products: [
          { id: "p2", name: "螺纹钢 HRB400 16mm", spec: "16mm", image: "https://picsum.photos/100/100?random=2", qty: 10, stock: 20, shippedQty: 5 }
        ]
      },
      {
        id: "so003",
        orderNo: "SO2024010014",
        createTime: "2024-01-14 09:15",
        customerName: "东莞工程公司",
        customerPhone: "137****7777",
        address: "东莞市xxx镇xxx工业区",
        isUrgent: false,
        shippedQty: 0,
        totalQty: 50,
        totalAmount: "21,000.00",
        products: [
          { id: "p3", name: "商品混凝土 C30", spec: "C30", image: "https://picsum.photos/100/100?random=3", qty: 50, stock: 30, shippedQty: 0 }
        ]
      }
    ]);
    const filteredOrders = common_vendor.computed(() => {
      let result = orders.value;
      if (keyword.value) {
        const kw = keyword.value.toLowerCase();
        result = result.filter(
          (o) => o.orderNo.toLowerCase().includes(kw) || o.customerName.toLowerCase().includes(kw)
        );
      }
      if (filterType.value === "urgent") {
        result = result.filter((o) => o.isUrgent);
      } else if (filterType.value === "partial") {
        result = result.filter((o) => o.shippedQty > 0);
      }
      return result;
    });
    function handleScan() {
      common_vendor.index.scanCode({
        success: (res) => {
          common_vendor.index.showToast({ title: "扫码成功: " + res.result, icon: "none" });
        },
        fail: () => {
          common_vendor.index.showToast({ title: "扫码失败", icon: "none" });
        }
      });
    }
    function handleCallCustomer(item) {
      common_vendor.index.makePhoneCall({
        phoneNumber: item.customerPhone,
        fail: () => {
          common_vendor.index.showToast({ title: "拨打电话失败", icon: "none" });
        }
      });
    }
    function handlePrint(item) {
      common_vendor.index.showToast({ title: "打印发货单", icon: "none" });
    }
    function handleShip(item) {
      currentOrder.value = JSON.parse(JSON.stringify(item));
      currentOrder.value.products.forEach((p) => {
        p.shipQty = p.qty - (p.shippedQty || 0);
      });
      showShipModal.value = true;
    }
    function handleContinueShip(item) {
      handleShip(item);
    }
    function scanLogistics() {
      common_vendor.index.scanCode({
        success: (res) => {
          logisticsNo.value = res.result;
        },
        fail: () => {
          common_vendor.index.showToast({ title: "扫码失败", icon: "none" });
        }
      });
    }
    function handlePartialShip() {
      common_vendor.index.showToast({ title: "部分发货成功", icon: "success" });
      showShipModal.value = false;
    }
    function confirmShip() {
      common_vendor.index.showToast({ title: "发货成功", icon: "success" });
      showShipModal.value = false;
    }
    function resetFilter() {
      filterType.value = "";
      filterDate.value = "";
    }
    function applyFilter() {
      showFilter.value = false;
    }
    const __returned__ = { keyword, showFilter, filterType, filterDate, showShipModal, currentOrder, logisticsIndex, logisticsNo, shipRemark, logisticsCompanies, stats, orders, filteredOrders, handleScan, handleCallCustomer, handlePrint, handleShip, handleContinueShip, scanLogistics, handlePartialShip, confirmShip, resetFilter, applyFilter };
    Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
    return __returned__;
  }
});
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  var _a, _b, _c;
  return common_vendor.e({
    a: common_vendor.o($setup.handleScan),
    b: $setup.keyword,
    c: common_vendor.o(($event) => $setup.keyword = $event.detail.value),
    d: common_vendor.o(($event) => $setup.showFilter = true),
    e: common_vendor.t($setup.stats.total),
    f: common_vendor.t($setup.stats.today),
    g: common_vendor.t($setup.stats.urgent),
    h: common_vendor.t($setup.stats.partial),
    i: common_vendor.f($setup.filteredOrders, (item, k0, i0) => {
      return common_vendor.e({
        a: common_vendor.t(item.orderNo),
        b: item.isUrgent
      }, item.isUrgent ? {} : {}, {
        c: item.shippedQty > 0
      }, item.shippedQty > 0 ? {} : {}, {
        d: common_vendor.t(item.createTime),
        e: common_vendor.t(item.customerName),
        f: common_vendor.t(item.address),
        g: common_vendor.o(($event) => $setup.handleCallCustomer(item), item.id),
        h: common_vendor.f(item.products, (prod, k1, i1) => {
          return common_vendor.e({
            a: prod.image,
            b: common_vendor.t(prod.name),
            c: common_vendor.t(prod.spec),
            d: common_vendor.t(prod.stock),
            e: prod.stock < prod.qty ? 1 : "",
            f: common_vendor.t(prod.qty),
            g: prod.shippedQty
          }, prod.shippedQty ? {
            h: common_vendor.t(prod.shippedQty)
          } : {}, {
            i: prod.id
          });
        }),
        i: common_vendor.t(item.totalQty),
        j: common_vendor.t(item.totalAmount),
        k: item.shippedQty > 0
      }, item.shippedQty > 0 ? {
        l: common_vendor.t(item.shippedQty),
        m: common_vendor.t(item.totalQty),
        n: item.shippedQty / item.totalQty * 100 + "%"
      } : {}, {
        o: common_vendor.o(($event) => $setup.handlePrint(item), item.id),
        p: item.shippedQty > 0 && item.shippedQty < item.totalQty
      }, item.shippedQty > 0 && item.shippedQty < item.totalQty ? {
        q: common_vendor.o(($event) => $setup.handleContinueShip(item), item.id)
      } : {}, {
        r: common_vendor.o(($event) => $setup.handleShip(item), item.id),
        s: item.id
      });
    }),
    j: $setup.showFilter
  }, $setup.showFilter ? {
    k: common_vendor.o($setup.resetFilter),
    l: $setup.filterType === "" ? 1 : "",
    m: common_vendor.o(($event) => $setup.filterType = ""),
    n: $setup.filterType === "urgent" ? 1 : "",
    o: common_vendor.o(($event) => $setup.filterType = "urgent"),
    p: $setup.filterType === "partial" ? 1 : "",
    q: common_vendor.o(($event) => $setup.filterType = "partial"),
    r: $setup.filterDate === "" ? 1 : "",
    s: common_vendor.o(($event) => $setup.filterDate = ""),
    t: $setup.filterDate === "today" ? 1 : "",
    v: common_vendor.o(($event) => $setup.filterDate = "today"),
    w: $setup.filterDate === "week" ? 1 : "",
    x: common_vendor.o(($event) => $setup.filterDate = "week"),
    y: common_vendor.o(($event) => $setup.showFilter = false),
    z: common_vendor.o($setup.applyFilter),
    A: common_vendor.o(($event) => $setup.showFilter = false)
  } : {}, {
    B: $setup.showShipModal
  }, $setup.showShipModal ? {
    C: common_vendor.o(($event) => $setup.showShipModal = false),
    D: common_vendor.t((_a = $setup.currentOrder) == null ? void 0 : _a.orderNo),
    E: common_vendor.t((_b = $setup.currentOrder) == null ? void 0 : _b.customerName),
    F: common_vendor.f((_c = $setup.currentOrder) == null ? void 0 : _c.products, (prod, k0, i0) => {
      return {
        a: common_vendor.t(prod.name),
        b: common_vendor.o(($event) => prod.shipQty = Math.max(1, (prod.shipQty || prod.qty) - 1), prod.id),
        c: prod.shipQty,
        d: common_vendor.o(($event) => prod.shipQty = $event.detail.value, prod.id),
        e: common_vendor.o(($event) => prod.shipQty = Math.min(prod.qty - (prod.shippedQty || 0), (prod.shipQty || prod.qty) + 1), prod.id),
        f: common_vendor.t(prod.qty - (prod.shippedQty || 0)),
        g: prod.id
      };
    }),
    G: common_vendor.t($setup.logisticsCompanies[$setup.logisticsIndex]),
    H: $setup.logisticsIndex,
    I: $setup.logisticsCompanies,
    J: common_vendor.o(($event) => $setup.logisticsIndex = $event.detail.value),
    K: $setup.logisticsNo,
    L: common_vendor.o(($event) => $setup.logisticsNo = $event.detail.value),
    M: common_vendor.o($setup.scanLogistics),
    N: $setup.shipRemark,
    O: common_vendor.o(($event) => $setup.shipRemark = $event.detail.value),
    P: common_vendor.o($setup.handlePartialShip),
    Q: common_vendor.o($setup.confirmShip),
    R: common_vendor.o(($event) => $setup.showShipModal = false)
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-9fe5ed6c"], ["__file", "/Users/mcdreamy/Documents/trae_projects/gongchengcang2/apps/mp/src/pages/order/ship.vue"]]);
wx.createPage(MiniProgramPage);
