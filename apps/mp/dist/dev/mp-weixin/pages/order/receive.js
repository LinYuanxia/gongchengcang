"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "receive",
  setup(__props, { expose: __expose }) {
    __expose();
    const keyword = common_vendor.ref("");
    const showFilter = common_vendor.ref(false);
    const filterStatus = common_vendor.ref("");
    const filterSupplier = common_vendor.ref("");
    const showReceiveModal = common_vendor.ref(false);
    const currentOrder = common_vendor.ref(null);
    const receiveTypeIndex = common_vendor.ref(0);
    const qualityIndex = common_vendor.ref(0);
    const receiveRemark = common_vendor.ref("");
    const uploadImages = common_vendor.ref([]);
    const warehouses = ["默认仓库", "A区仓库", "B区仓库", "C区仓库"];
    const receiveTypes = ["采购入库", "退货入库", "调拨入库"];
    const qualityStatus = ["合格", "待检", "不合格"];
    const stats = common_vendor.ref({
      total: 8,
      today: 3,
      inTransit: 5,
      partial: 2
    });
    const orders = common_vendor.ref([
      {
        id: "po001",
        orderNo: "PO2024010002",
        status: "arrived",
        statusText: "已到货",
        createTime: "2024-01-15 14:30",
        supplierName: "宝钢供应商",
        contactName: "张经理",
        contactPhone: "138****8888",
        logisticsCompany: "顺丰速运",
        logisticsNo: "SF1234567890",
        receivedQty: 0,
        totalQty: 10,
        totalAmount: "39,500.00",
        products: [
          { id: "p1", name: "螺纹钢 HRB400 20mm", spec: "20mm", image: "https://picsum.photos/100/100?random=1", qty: 10, receivedQty: 0, warehouse: "A区仓库" }
        ]
      },
      {
        id: "po002",
        orderNo: "PO2024010003",
        status: "inTransit",
        statusText: "运输中",
        createTime: "2024-01-14 10:20",
        supplierName: "华新水泥供应商",
        contactName: "李经理",
        contactPhone: "139****9999",
        logisticsCompany: "中通快递",
        logisticsNo: "ZT9876543210",
        receivedQty: 15,
        totalQty: 30,
        totalAmount: "12,600.00",
        products: [
          { id: "p2", name: "水泥 P.O 42.5", spec: "42.5", image: "https://picsum.photos/100/100?random=2", qty: 30, receivedQty: 15, warehouse: "B区仓库" }
        ]
      },
      {
        id: "po003",
        orderNo: "PO2024010004",
        status: "arrived",
        statusText: "已到货",
        createTime: "2024-01-13 16:45",
        supplierName: "南方建材供应商",
        contactName: "王经理",
        contactPhone: "137****7777",
        logisticsCompany: "自配送",
        logisticsNo: "",
        receivedQty: 0,
        totalQty: 100,
        totalAmount: "8,000.00",
        products: [
          { id: "p3", name: "黄砂 中砂", spec: "中砂", image: "https://picsum.photos/100/100?random=3", qty: 100, receivedQty: 0, warehouse: "C区仓库" }
        ]
      }
    ]);
    const filteredOrders = common_vendor.computed(() => {
      let result = orders.value;
      if (keyword.value) {
        const kw = keyword.value.toLowerCase();
        result = result.filter(
          (o) => o.orderNo.toLowerCase().includes(kw) || o.supplierName.toLowerCase().includes(kw)
        );
      }
      if (filterStatus.value === "inTransit") {
        result = result.filter((o) => o.status === "inTransit");
      } else if (filterStatus.value === "arrived") {
        result = result.filter((o) => o.status === "arrived");
      } else if (filterStatus.value === "partial") {
        result = result.filter((o) => o.receivedQty > 0);
      }
      if (filterSupplier.value) {
        result = result.filter((o) => o.supplierName.includes(filterSupplier.value));
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
    function handleCallSupplier(item) {
      common_vendor.index.makePhoneCall({
        phoneNumber: item.contactPhone,
        fail: () => {
          common_vendor.index.showToast({ title: "拨打电话失败", icon: "none" });
        }
      });
    }
    function handleTrack(item) {
      common_vendor.index.showToast({ title: "查看物流", icon: "none" });
    }
    function handleDetail(item) {
      common_vendor.index.navigateTo({ url: `/pages/order/detail?id=${item.id}&type=purchase` });
    }
    function handleReceive(item) {
      currentOrder.value = JSON.parse(JSON.stringify(item));
      currentOrder.value.products.forEach((p) => {
        p.receiveQty = p.qty - (p.receivedQty || 0);
        p.warehouseIndex = warehouses.indexOf(p.warehouse) || 0;
      });
      showReceiveModal.value = true;
    }
    function handleContinueReceive(item) {
      handleReceive(item);
    }
    function handleUpload() {
      common_vendor.index.chooseImage({
        count: 3,
        success: (res) => {
          uploadImages.value = [...uploadImages.value, ...res.tempFilePaths];
        }
      });
    }
    function handlePartialReceive() {
      common_vendor.index.showToast({ title: "部分入库成功", icon: "success" });
      showReceiveModal.value = false;
    }
    function confirmReceive() {
      common_vendor.index.showToast({ title: "入库成功", icon: "success" });
      showReceiveModal.value = false;
    }
    function resetFilter() {
      filterStatus.value = "";
      filterSupplier.value = "";
    }
    function applyFilter() {
      showFilter.value = false;
    }
    const __returned__ = { keyword, showFilter, filterStatus, filterSupplier, showReceiveModal, currentOrder, receiveTypeIndex, qualityIndex, receiveRemark, uploadImages, warehouses, receiveTypes, qualityStatus, stats, orders, filteredOrders, handleScan, handleCallSupplier, handleTrack, handleDetail, handleReceive, handleContinueReceive, handleUpload, handlePartialReceive, confirmReceive, resetFilter, applyFilter };
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
    g: common_vendor.t($setup.stats.inTransit),
    h: common_vendor.t($setup.stats.partial),
    i: common_vendor.f($setup.filteredOrders, (item, k0, i0) => {
      return common_vendor.e({
        a: common_vendor.t(item.orderNo),
        b: common_vendor.t(item.statusText),
        c: common_vendor.n(item.status),
        d: item.receivedQty > 0
      }, item.receivedQty > 0 ? {} : {}, {
        e: common_vendor.t(item.createTime),
        f: common_vendor.t(item.supplierName),
        g: common_vendor.t(item.contactName),
        h: common_vendor.t(item.contactPhone),
        i: common_vendor.o(($event) => $setup.handleCallSupplier(item), item.id),
        j: item.logisticsNo
      }, item.logisticsNo ? {
        k: common_vendor.t(item.logisticsCompany),
        l: common_vendor.t(item.logisticsNo),
        m: common_vendor.o(($event) => $setup.handleTrack(item), item.id)
      } : {}, {
        n: common_vendor.f(item.products, (prod, k1, i1) => {
          return common_vendor.e({
            a: prod.image,
            b: common_vendor.t(prod.name),
            c: common_vendor.t(prod.spec),
            d: common_vendor.t(prod.warehouse || "默认仓库"),
            e: common_vendor.t(prod.qty),
            f: prod.receivedQty
          }, prod.receivedQty ? {
            g: common_vendor.t(prod.receivedQty)
          } : {}, {
            h: prod.id
          });
        }),
        o: common_vendor.t(item.totalQty),
        p: common_vendor.t(item.totalAmount),
        q: item.receivedQty > 0
      }, item.receivedQty > 0 ? {
        r: common_vendor.t(item.receivedQty),
        s: common_vendor.t(item.totalQty),
        t: item.receivedQty / item.totalQty * 100 + "%"
      } : {}, {
        v: common_vendor.o(($event) => $setup.handleDetail(item), item.id),
        w: item.receivedQty > 0 && item.receivedQty < item.totalQty
      }, item.receivedQty > 0 && item.receivedQty < item.totalQty ? {
        x: common_vendor.o(($event) => $setup.handleContinueReceive(item), item.id)
      } : {}, {
        y: common_vendor.o(($event) => $setup.handleReceive(item), item.id),
        z: item.id
      });
    }),
    j: $setup.showFilter
  }, $setup.showFilter ? {
    k: common_vendor.o($setup.resetFilter),
    l: $setup.filterStatus === "" ? 1 : "",
    m: common_vendor.o(($event) => $setup.filterStatus = ""),
    n: $setup.filterStatus === "inTransit" ? 1 : "",
    o: common_vendor.o(($event) => $setup.filterStatus = "inTransit"),
    p: $setup.filterStatus === "arrived" ? 1 : "",
    q: common_vendor.o(($event) => $setup.filterStatus = "arrived"),
    r: $setup.filterStatus === "partial" ? 1 : "",
    s: common_vendor.o(($event) => $setup.filterStatus = "partial"),
    t: $setup.filterSupplier === "" ? 1 : "",
    v: common_vendor.o(($event) => $setup.filterSupplier = ""),
    w: $setup.filterSupplier === "华新" ? 1 : "",
    x: common_vendor.o(($event) => $setup.filterSupplier = "华新"),
    y: $setup.filterSupplier === "宝钢" ? 1 : "",
    z: common_vendor.o(($event) => $setup.filterSupplier = "宝钢"),
    A: common_vendor.o(($event) => $setup.showFilter = false),
    B: common_vendor.o($setup.applyFilter),
    C: common_vendor.o(($event) => $setup.showFilter = false)
  } : {}, {
    D: $setup.showReceiveModal
  }, $setup.showReceiveModal ? {
    E: common_vendor.o(($event) => $setup.showReceiveModal = false),
    F: common_vendor.t((_a = $setup.currentOrder) == null ? void 0 : _a.orderNo),
    G: common_vendor.t((_b = $setup.currentOrder) == null ? void 0 : _b.supplierName),
    H: common_vendor.f((_c = $setup.currentOrder) == null ? void 0 : _c.products, (prod, k0, i0) => {
      return {
        a: common_vendor.t(prod.name),
        b: common_vendor.t(prod.spec),
        c: common_vendor.t(prod.qty),
        d: common_vendor.t(prod.receivedQty || 0),
        e: common_vendor.o(($event) => prod.receiveQty = Math.max(0, (prod.receiveQty || 0) - 1), prod.id),
        f: prod.receiveQty,
        g: common_vendor.o(($event) => prod.receiveQty = $event.detail.value, prod.id),
        h: common_vendor.o(($event) => prod.receiveQty = Math.min(prod.qty - (prod.receivedQty || 0), (prod.receiveQty || 0) + 1), prod.id),
        i: common_vendor.t($setup.warehouses[prod.warehouseIndex || 0]),
        j: prod.warehouseIndex || 0,
        k: common_vendor.o(($event) => prod.warehouseIndex = $event.detail.value, prod.id),
        l: prod.location,
        m: common_vendor.o(($event) => prod.location = $event.detail.value, prod.id),
        n: prod.id
      };
    }),
    I: $setup.warehouses,
    J: common_vendor.t($setup.receiveTypes[$setup.receiveTypeIndex]),
    K: $setup.receiveTypeIndex,
    L: $setup.receiveTypes,
    M: common_vendor.o(($event) => $setup.receiveTypeIndex = $event.detail.value),
    N: common_vendor.t($setup.qualityStatus[$setup.qualityIndex]),
    O: $setup.qualityIndex,
    P: $setup.qualityStatus,
    Q: common_vendor.o(($event) => $setup.qualityIndex = $event.detail.value),
    R: $setup.receiveRemark,
    S: common_vendor.o(($event) => $setup.receiveRemark = $event.detail.value),
    T: common_vendor.f($setup.uploadImages, (img, idx, i0) => {
      return {
        a: img,
        b: common_vendor.o(($event) => $setup.uploadImages.splice(idx, 1), idx),
        c: idx
      };
    }),
    U: common_vendor.o($setup.handleUpload),
    V: common_vendor.o($setup.handlePartialReceive),
    W: common_vendor.o($setup.confirmReceive),
    X: common_vendor.o(($event) => $setup.showReceiveModal = false)
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-8132225c"], ["__file", "/Users/mcdreamy/Documents/trae_projects/gongchengcang2/apps/mp/src/pages/order/receive.vue"]]);
wx.createPage(MiniProgramPage);
