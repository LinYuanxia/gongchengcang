"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "detail",
  setup(__props, { expose: __expose }) {
    __expose();
    const orderInfo = common_vendor.ref({
      id: "so001",
      orderNo: "SO2024010012",
      type: "sale",
      status: "toShip",
      statusText: "待发货",
      createTime: "2024-01-15 14:30:25",
      payTime: "2024-01-15 14:32:18",
      customerName: "深圳建设集团",
      customerPhone: "138****8888",
      address: "广东省深圳市南山区科技园南区深圳湾科技生态园10栋",
      productAmount: "4,500.00",
      freight: "0.00",
      discount: "50.00",
      totalAmount: "4,450.00",
      products: [
        { id: "p1", name: "水泥 P.O 42.5", spec: "42.5级 | 袋装", image: "https://picsum.photos/100/100?random=1", price: "450.00", qty: 10, isGift: false }
      ],
      logistics: null
    });
    const showActions = common_vendor.computed(() => {
      return ["toShip", "toReceive", "toConfirm", "toPay", "completed", "shipped"].includes(orderInfo.value.status);
    });
    function getStatusBgColor(status) {
      const colors = {
        toPay: "#722ed1",
        toShip: "#ff7d00",
        shipped: "#165dff",
        toReceive: "#165dff",
        completed: "#00b42a",
        afterSale: "#f53f3f",
        toConfirm: "#ff7d00"
      };
      return colors[status] || "#165dff";
    }
    function getStatusIcon(status) {
      const icons = {
        toPay: "💳",
        toShip: "📦",
        shipped: "🚚",
        toReceive: "📥",
        completed: "✅",
        afterSale: "🔄",
        toConfirm: "⏳"
      };
      return icons[status] || "📋";
    }
    function getStatusDesc(status) {
      const descs = {
        toPay: "等待买家付款",
        toShip: "请尽快安排发货",
        shipped: "商品正在配送中",
        toReceive: "商品已发出，等待收货入库",
        completed: "订单已完成",
        afterSale: "售后处理中",
        toConfirm: "等待确认采购订单"
      };
      return descs[status] || "";
    }
    function handleCopy(text) {
      common_vendor.index.setClipboardData({
        data: text,
        success: () => {
          common_vendor.index.showToast({ title: "已复制", icon: "success" });
        }
      });
    }
    function handleShip() {
      common_vendor.index.navigateTo({ url: `/pages/order/ship?id=${orderInfo.value.id}` });
    }
    function handlePrint() {
      common_vendor.index.showToast({ title: "打印发货单", icon: "none" });
    }
    function handleReceive() {
      common_vendor.index.navigateTo({ url: `/pages/order/receive?id=${orderInfo.value.id}` });
    }
    function handleConfirm() {
      common_vendor.index.showModal({
        title: "确认订单",
        content: "确定确认该采购订单吗？",
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.showToast({ title: "已确认", icon: "success" });
          }
        }
      });
    }
    function handleCancel() {
      common_vendor.index.showModal({
        title: "取消订单",
        content: "确定取消该订单吗？",
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.showToast({ title: "已取消", icon: "success" });
            setTimeout(() => {
              common_vendor.index.navigateBack();
            }, 1500);
          }
        }
      });
    }
    function handlePay() {
      common_vendor.index.showModal({
        title: "支付采购款",
        content: `确定支付 ¥${orderInfo.value.totalAmount} 吗？`,
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.showToast({ title: "支付成功", icon: "success" });
          }
        }
      });
    }
    function handleInvoice() {
      common_vendor.index.navigateTo({ url: "/pages/mine/invoice" });
    }
    function handleTrack() {
      common_vendor.index.showToast({ title: "查看物流", icon: "none" });
    }
    const __returned__ = { orderInfo, showActions, getStatusBgColor, getStatusIcon, getStatusDesc, handleCopy, handleShip, handlePrint, handleReceive, handleConfirm, handleCancel, handlePay, handleInvoice, handleTrack };
    Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
    return __returned__;
  }
});
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.t($setup.getStatusIcon($setup.orderInfo.status)),
    b: common_vendor.t($setup.orderInfo.statusText),
    c: common_vendor.t($setup.getStatusDesc($setup.orderInfo.status)),
    d: $setup.getStatusBgColor($setup.orderInfo.status),
    e: $setup.orderInfo.type === "sale"
  }, $setup.orderInfo.type === "sale" ? {
    f: common_vendor.t($setup.orderInfo.customerName),
    g: common_vendor.t($setup.orderInfo.customerPhone),
    h: common_vendor.t($setup.orderInfo.address)
  } : {}, {
    i: $setup.orderInfo.type === "purchase"
  }, $setup.orderInfo.type === "purchase" ? {
    j: common_vendor.t($setup.orderInfo.supplierName),
    k: common_vendor.t($setup.orderInfo.supplierPhone),
    l: common_vendor.t($setup.orderInfo.supplierAddress)
  } : {}, {
    m: common_vendor.t($setup.orderInfo.orderNo),
    n: common_vendor.o(($event) => $setup.handleCopy($setup.orderInfo.orderNo)),
    o: common_vendor.t($setup.orderInfo.createTime),
    p: $setup.orderInfo.payTime
  }, $setup.orderInfo.payTime ? {
    q: common_vendor.t($setup.orderInfo.payTime)
  } : {}, {
    r: $setup.orderInfo.shipTime
  }, $setup.orderInfo.shipTime ? {
    s: common_vendor.t($setup.orderInfo.shipTime)
  } : {}, {
    t: $setup.orderInfo.receiveTime
  }, $setup.orderInfo.receiveTime ? {
    v: common_vendor.t($setup.orderInfo.receiveTime)
  } : {}, {
    w: common_vendor.f($setup.orderInfo.products, (item, k0, i0) => {
      return common_vendor.e({
        a: item.image,
        b: common_vendor.t(item.name),
        c: common_vendor.t(item.spec),
        d: item.isGift
      }, item.isGift ? {} : {}, {
        e: common_vendor.t(item.price),
        f: common_vendor.t(item.qty),
        g: item.id
      });
    }),
    x: common_vendor.t($setup.orderInfo.productAmount),
    y: common_vendor.t($setup.orderInfo.freight),
    z: $setup.orderInfo.discount
  }, $setup.orderInfo.discount ? {
    A: common_vendor.t($setup.orderInfo.discount)
  } : {}, {
    B: common_vendor.t($setup.orderInfo.totalAmount),
    C: $setup.orderInfo.logistics
  }, $setup.orderInfo.logistics ? {
    D: common_vendor.t($setup.orderInfo.logistics.company),
    E: common_vendor.t($setup.orderInfo.logistics.no),
    F: common_vendor.o(($event) => $setup.handleCopy($setup.orderInfo.logistics.no)),
    G: common_vendor.f($setup.orderInfo.logistics.timeline, (item, index, i0) => {
      return {
        a: index === 0 ? 1 : "",
        b: common_vendor.t(item.text),
        c: index === 0 ? 1 : "",
        d: common_vendor.t(item.time),
        e: index
      };
    })
  } : {}, {
    H: $setup.showActions
  }, $setup.showActions ? common_vendor.e({
    I: $setup.orderInfo.status === "toShip"
  }, $setup.orderInfo.status === "toShip" ? {
    J: common_vendor.o($setup.handleShip)
  } : {}, {
    K: $setup.orderInfo.status === "toShip"
  }, $setup.orderInfo.status === "toShip" ? {
    L: common_vendor.o($setup.handlePrint)
  } : {}, {
    M: $setup.orderInfo.status === "toReceive"
  }, $setup.orderInfo.status === "toReceive" ? {
    N: common_vendor.o($setup.handleReceive)
  } : {}, {
    O: $setup.orderInfo.status === "toConfirm"
  }, $setup.orderInfo.status === "toConfirm" ? {
    P: common_vendor.o($setup.handleCancel)
  } : {}, {
    Q: $setup.orderInfo.status === "toConfirm"
  }, $setup.orderInfo.status === "toConfirm" ? {
    R: common_vendor.o($setup.handleConfirm)
  } : {}, {
    S: $setup.orderInfo.status === "toPay"
  }, $setup.orderInfo.status === "toPay" ? {
    T: common_vendor.o($setup.handlePay)
  } : {}, {
    U: $setup.orderInfo.status === "completed"
  }, $setup.orderInfo.status === "completed" ? {
    V: common_vendor.o($setup.handleInvoice)
  } : {}, {
    W: $setup.orderInfo.status === "shipped"
  }, $setup.orderInfo.status === "shipped" ? {
    X: common_vendor.o($setup.handleTrack)
  } : {}) : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-5511cfa9"], ["__file", "/Users/mcdreamy/Documents/trae_projects/gongchengcang2/apps/mp/src/pages/order/detail.vue"]]);
wx.createPage(MiniProgramPage);
