"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "index",
  setup(__props, { expose: __expose }) {
    __expose();
    const currentTab = common_vendor.ref("sale");
    const saleStatus = common_vendor.ref("");
    const purchaseStatus = common_vendor.ref("");
    const saleKeyword = common_vendor.ref("");
    const purchaseKeyword = common_vendor.ref("");
    const statusCount = common_vendor.ref({
      toShip: 12,
      toConfirm: 5,
      toReceive: 3
    });
    const saleOrders = common_vendor.ref([
      {
        id: "so001",
        orderNo: "SO2024010012",
        status: "toShip",
        statusText: "待发货",
        createTime: "2024-01-15 14:30",
        customerName: "深圳建设集团",
        customerPhone: "138****8888",
        products: [
          { id: "p1", name: "水泥 P.O 42.5", spec: "42.5", image: "https://picsum.photos/100/100?random=1", price: 450, qty: 10 }
        ],
        totalQty: 10,
        totalAmount: "4,500.00"
      },
      {
        id: "so002",
        orderNo: "SO2024010011",
        status: "shipped",
        statusText: "已发货",
        createTime: "2024-01-15 10:20",
        customerName: "广州建筑公司",
        customerPhone: "139****9999",
        products: [
          { id: "p2", name: "螺纹钢 HRB400 16mm", spec: "16mm", image: "https://picsum.photos/100/100?random=2", price: 4200, qty: 5 }
        ],
        totalQty: 5,
        totalAmount: "21,000.00"
      },
      {
        id: "so003",
        orderNo: "SO2024010010",
        status: "completed",
        statusText: "已完成",
        createTime: "2024-01-14 16:45",
        customerName: "东莞工程公司",
        customerPhone: "137****7777",
        products: [
          { id: "p3", name: "商品混凝土 C30", spec: "C30", image: "https://picsum.photos/100/100?random=3", price: 420, qty: 50 }
        ],
        totalQty: 50,
        totalAmount: "21,000.00"
      },
      {
        id: "so004",
        orderNo: "SO2024010009",
        status: "afterSale",
        statusText: "售后中",
        createTime: "2024-01-13 11:30",
        customerName: "佛山建材市场",
        customerPhone: "136****6666",
        products: [
          { id: "p4", name: "黄砂 中砂", spec: "中砂", image: "https://picsum.photos/100/100?random=4", price: 95, qty: 100 }
        ],
        totalQty: 100,
        totalAmount: "9,500.00"
      }
    ]);
    const purchaseOrders = common_vendor.ref([
      {
        id: "po001",
        orderNo: "PO2024010001",
        status: "toConfirm",
        statusText: "待确认",
        createTime: "2024-01-15 14:30",
        supplierName: "华新水泥供应商",
        isPrimary: true,
        products: [
          { id: "p1", name: "水泥 P.O 42.5", spec: "42.5", image: "https://picsum.photos/100/100?random=5", price: 420, qty: 20 }
        ],
        totalQty: 20,
        totalAmount: "8,400.00"
      },
      {
        id: "po002",
        orderNo: "PO2024010002",
        status: "toReceive",
        statusText: "待入库",
        createTime: "2024-01-14 10:20",
        supplierName: "宝钢供应商",
        isPrimary: false,
        products: [
          { id: "p2", name: "螺纹钢 HRB400 20mm", spec: "20mm", image: "https://picsum.photos/100/100?random=6", price: 3950, qty: 10 }
        ],
        totalQty: 10,
        totalAmount: "39,500.00"
      },
      {
        id: "po003",
        orderNo: "PO2024010003",
        status: "completed",
        statusText: "已完成",
        createTime: "2024-01-12 16:45",
        supplierName: "南方建材供应商",
        isPrimary: false,
        products: [
          { id: "p3", name: "黄砂 中砂", spec: "中砂", image: "https://picsum.photos/100/100?random=7", price: 80, qty: 100 }
        ],
        totalQty: 100,
        totalAmount: "8,000.00"
      }
    ]);
    const filteredSaleOrders = common_vendor.computed(() => {
      let result = saleOrders.value;
      if (saleKeyword.value) {
        const kw = saleKeyword.value.toLowerCase();
        result = result.filter(
          (o) => o.orderNo.toLowerCase().includes(kw) || o.customerName.toLowerCase().includes(kw)
        );
      }
      if (saleStatus.value) {
        result = result.filter((o) => o.status === saleStatus.value);
      }
      return result;
    });
    const filteredPurchaseOrders = common_vendor.computed(() => {
      let result = purchaseOrders.value;
      if (purchaseKeyword.value) {
        const kw = purchaseKeyword.value.toLowerCase();
        result = result.filter(
          (o) => o.orderNo.toLowerCase().includes(kw) || o.supplierName.toLowerCase().includes(kw)
        );
      }
      if (purchaseStatus.value) {
        result = result.filter((o) => o.status === purchaseStatus.value);
      }
      return result;
    });
    function getSaleStatusColor(status) {
      const colors = {
        toPay: "#722ed1",
        toShip: "#ff7d00",
        shipped: "#165dff",
        completed: "#00b42a",
        afterSale: "#f53f3f"
      };
      return colors[status] || "#666";
    }
    function getPurchaseStatusColor(status) {
      const colors = {
        toConfirm: "#ff7d00",
        toPay: "#722ed1",
        toShip: "#165dff",
        toReceive: "#165dff",
        completed: "#00b42a"
      };
      return colors[status] || "#666";
    }
    function handleOrderDetail(item, type) {
      common_vendor.index.navigateTo({ url: `/pages/order/detail?id=${item.id}&type=${type}` });
    }
    function handleShip(item) {
      common_vendor.index.navigateTo({ url: `/pages/order/ship?id=${item.id}` });
    }
    function handlePrint(item) {
      common_vendor.index.showToast({ title: "打印发货单", icon: "none" });
    }
    function handleTrack(item) {
      common_vendor.index.showToast({ title: "查看物流", icon: "none" });
    }
    function handleInvoice(item) {
      common_vendor.index.navigateTo({ url: "/pages/mine/invoice" });
    }
    function handleAfterSale(item) {
      common_vendor.index.showToast({ title: "处理售后", icon: "none" });
    }
    function handleConfirm(item) {
      common_vendor.index.showModal({
        title: "确认订单",
        content: `确定确认采购订单 ${item.orderNo} 吗？`,
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.showToast({ title: "已确认", icon: "success" });
          }
        }
      });
    }
    function handleCancel(item) {
      common_vendor.index.showModal({
        title: "取消订单",
        content: `确定取消采购订单 ${item.orderNo} 吗？`,
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.showToast({ title: "已取消", icon: "success" });
          }
        }
      });
    }
    function handlePay(item) {
      common_vendor.index.showModal({
        title: "支付采购款",
        content: `确定支付采购款 ¥${item.totalAmount} 吗？`,
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.showToast({ title: "支付成功", icon: "success" });
          }
        }
      });
    }
    function handleReceive(item) {
      common_vendor.index.navigateTo({ url: `/pages/order/receive?id=${item.id}` });
    }
    function handleShipPage() {
      common_vendor.index.navigateTo({ url: "/pages/order/ship" });
    }
    function handleReceivePage() {
      common_vendor.index.navigateTo({ url: "/pages/order/receive" });
    }
    function handleScanShip() {
      common_vendor.index.scanCode({
        success: (res) => {
          common_vendor.index.showToast({ title: "扫码发货", icon: "success" });
        },
        fail: () => {
          common_vendor.index.showToast({ title: "扫码失败", icon: "none" });
        }
      });
    }
    function handleScanReceive() {
      common_vendor.index.scanCode({
        success: (res) => {
          common_vendor.index.showToast({ title: "扫码入库", icon: "success" });
        },
        fail: () => {
          common_vendor.index.showToast({ title: "扫码失败", icon: "none" });
        }
      });
    }
    const __returned__ = { currentTab, saleStatus, purchaseStatus, saleKeyword, purchaseKeyword, statusCount, saleOrders, purchaseOrders, filteredSaleOrders, filteredPurchaseOrders, getSaleStatusColor, getPurchaseStatusColor, handleOrderDetail, handleShip, handlePrint, handleTrack, handleInvoice, handleAfterSale, handleConfirm, handleCancel, handlePay, handleReceive, handleShipPage, handleReceivePage, handleScanShip, handleScanReceive };
    Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
    return __returned__;
  }
});
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $setup.currentTab === "sale" ? 1 : "",
    b: common_vendor.o(($event) => $setup.currentTab = "sale"),
    c: $setup.currentTab === "purchase" ? 1 : "",
    d: common_vendor.o(($event) => $setup.currentTab = "purchase"),
    e: $setup.currentTab === "sale"
  }, $setup.currentTab === "sale" ? common_vendor.e({
    f: $setup.saleStatus === "" ? 1 : "",
    g: common_vendor.o(($event) => $setup.saleStatus = ""),
    h: $setup.saleStatus === "toPay" ? 1 : "",
    i: common_vendor.o(($event) => $setup.saleStatus = "toPay"),
    j: $setup.statusCount.toShip > 0
  }, $setup.statusCount.toShip > 0 ? {
    k: common_vendor.t($setup.statusCount.toShip)
  } : {}, {
    l: $setup.saleStatus === "toShip" ? 1 : "",
    m: common_vendor.o(($event) => $setup.saleStatus = "toShip"),
    n: $setup.saleStatus === "shipped" ? 1 : "",
    o: common_vendor.o(($event) => $setup.saleStatus = "shipped"),
    p: $setup.saleStatus === "completed" ? 1 : "",
    q: common_vendor.o(($event) => $setup.saleStatus = "completed"),
    r: $setup.saleStatus === "afterSale" ? 1 : "",
    s: common_vendor.o(($event) => $setup.saleStatus = "afterSale"),
    t: $setup.saleKeyword,
    v: common_vendor.o(($event) => $setup.saleKeyword = $event.detail.value),
    w: common_vendor.f($setup.filteredSaleOrders, (item, k0, i0) => {
      return common_vendor.e({
        a: common_vendor.t(item.orderNo),
        b: common_vendor.t(item.createTime),
        c: common_vendor.t(item.statusText),
        d: $setup.getSaleStatusColor(item.status),
        e: common_vendor.t(item.customerName),
        f: common_vendor.t(item.customerPhone),
        g: common_vendor.f(item.products, (prod, k1, i1) => {
          return {
            a: prod.image,
            b: common_vendor.t(prod.name),
            c: common_vendor.t(prod.spec),
            d: common_vendor.t(prod.price),
            e: common_vendor.t(prod.qty),
            f: prod.id
          };
        }),
        h: common_vendor.t(item.totalQty),
        i: common_vendor.t(item.totalAmount),
        j: item.status === "toShip"
      }, item.status === "toShip" ? {
        k: common_vendor.o(($event) => $setup.handleShip(item), item.id)
      } : {}, {
        l: item.status === "toShip"
      }, item.status === "toShip" ? {
        m: common_vendor.o(($event) => $setup.handlePrint(item), item.id)
      } : {}, {
        n: item.status === "shipped"
      }, item.status === "shipped" ? {
        o: common_vendor.o(($event) => $setup.handleTrack(item), item.id)
      } : {}, {
        p: item.status === "completed"
      }, item.status === "completed" ? {
        q: common_vendor.o(($event) => $setup.handleInvoice(item), item.id)
      } : {}, {
        r: item.status === "afterSale"
      }, item.status === "afterSale" ? {
        s: common_vendor.o(($event) => $setup.handleAfterSale(item), item.id)
      } : {}, {
        t: item.id,
        v: common_vendor.o(($event) => $setup.handleOrderDetail(item, "sale"), item.id)
      });
    })
  }) : {}, {
    x: $setup.currentTab === "purchase"
  }, $setup.currentTab === "purchase" ? common_vendor.e({
    y: $setup.purchaseStatus === "" ? 1 : "",
    z: common_vendor.o(($event) => $setup.purchaseStatus = ""),
    A: $setup.statusCount.toConfirm > 0
  }, $setup.statusCount.toConfirm > 0 ? {
    B: common_vendor.t($setup.statusCount.toConfirm)
  } : {}, {
    C: $setup.purchaseStatus === "toConfirm" ? 1 : "",
    D: common_vendor.o(($event) => $setup.purchaseStatus = "toConfirm"),
    E: $setup.purchaseStatus === "toPay" ? 1 : "",
    F: common_vendor.o(($event) => $setup.purchaseStatus = "toPay"),
    G: $setup.purchaseStatus === "toShip" ? 1 : "",
    H: common_vendor.o(($event) => $setup.purchaseStatus = "toShip"),
    I: $setup.statusCount.toReceive > 0
  }, $setup.statusCount.toReceive > 0 ? {
    J: common_vendor.t($setup.statusCount.toReceive)
  } : {}, {
    K: $setup.purchaseStatus === "toReceive" ? 1 : "",
    L: common_vendor.o(($event) => $setup.purchaseStatus = "toReceive"),
    M: $setup.purchaseStatus === "completed" ? 1 : "",
    N: common_vendor.o(($event) => $setup.purchaseStatus = "completed"),
    O: $setup.purchaseKeyword,
    P: common_vendor.o(($event) => $setup.purchaseKeyword = $event.detail.value),
    Q: common_vendor.f($setup.filteredPurchaseOrders, (item, k0, i0) => {
      return common_vendor.e({
        a: common_vendor.t(item.orderNo),
        b: common_vendor.t(item.createTime),
        c: common_vendor.t(item.statusText),
        d: $setup.getPurchaseStatusColor(item.status),
        e: common_vendor.t(item.supplierName),
        f: item.isPrimary
      }, item.isPrimary ? {} : {}, {
        g: common_vendor.f(item.products, (prod, k1, i1) => {
          return {
            a: prod.image,
            b: common_vendor.t(prod.name),
            c: common_vendor.t(prod.spec),
            d: common_vendor.t(prod.price),
            e: common_vendor.t(prod.qty),
            f: prod.id
          };
        }),
        h: common_vendor.t(item.totalQty),
        i: common_vendor.t(item.totalAmount),
        j: item.status === "toConfirm"
      }, item.status === "toConfirm" ? {
        k: common_vendor.o(($event) => $setup.handleCancel(item), item.id)
      } : {}, {
        l: item.status === "toConfirm"
      }, item.status === "toConfirm" ? {
        m: common_vendor.o(($event) => $setup.handleConfirm(item), item.id)
      } : {}, {
        n: item.status === "toPay"
      }, item.status === "toPay" ? {
        o: common_vendor.o(($event) => $setup.handlePay(item), item.id)
      } : {}, {
        p: item.status === "toReceive"
      }, item.status === "toReceive" ? {
        q: common_vendor.o(($event) => $setup.handleTrack(item), item.id)
      } : {}, {
        r: item.status === "toReceive"
      }, item.status === "toReceive" ? {
        s: common_vendor.o(($event) => $setup.handleReceive(item), item.id)
      } : {}, {
        t: item.id,
        v: common_vendor.o(($event) => $setup.handleOrderDetail(item, "purchase"), item.id)
      });
    })
  }) : {}, {
    R: common_vendor.o($setup.handleShipPage),
    S: common_vendor.o($setup.handleReceivePage),
    T: common_vendor.o($setup.handleScanShip),
    U: common_vendor.o($setup.handleScanReceive)
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-a4b7abaf"], ["__file", "/Users/mcdreamy/Documents/trae_projects/gongchengcang2/apps/mp/src/pages/order/index.vue"]]);
wx.createPage(MiniProgramPage);
