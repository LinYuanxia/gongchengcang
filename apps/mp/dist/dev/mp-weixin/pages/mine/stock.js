"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "stock",
  setup(__props, { expose: __expose }) {
    __expose();
    const currentTab = common_vendor.ref("overview");
    const keyword = common_vendor.ref("");
    const filterType = common_vendor.ref("all");
    const showFilter = common_vendor.ref(false);
    const filterWarehouse = common_vendor.ref("");
    const filterCategory = common_vendor.ref("");
    const showStockModal = common_vendor.ref(false);
    const stockModalType = common_vendor.ref("in");
    const currentStock = common_vendor.ref(null);
    const stockQty = common_vendor.ref(1);
    const stockWarehouseIndex = common_vendor.ref(0);
    const stockTypeIndex = common_vendor.ref(0);
    const stockRemark = common_vendor.ref("");
    const warehouses = ["默认仓库", "A区仓库", "B区仓库", "C区仓库"];
    const stockTypes = ["采购入库", "退货入库", "调拨入库", "盘点调整"];
    const totalSku = common_vendor.ref(156);
    const totalValue = common_vendor.ref("1,258,000");
    const warningCount = common_vendor.ref(5);
    const outCount = common_vendor.ref(2);
    const expireCount = common_vendor.ref(3);
    const stockList = common_vendor.ref([
      {
        id: "s1",
        skuCode: "SKU001",
        name: "水泥 P.O 42.5",
        spec: "42.5",
        image: "https://picsum.photos/100/100?random=1",
        stock: 50,
        maxStock: 200,
        warningStock: 30,
        unit: "吨",
        warehouse: "A区仓库",
        location: "A-01-01",
        costPrice: "450.00",
        category: "水泥"
      },
      {
        id: "s2",
        skuCode: "SKU002",
        name: "螺纹钢 HRB400 16mm",
        spec: "16mm",
        image: "https://picsum.photos/100/100?random=2",
        stock: 25,
        maxStock: 100,
        warningStock: 20,
        unit: "吨",
        warehouse: "B区仓库",
        location: "B-02-03",
        costPrice: "4200.00",
        category: "钢材"
      },
      {
        id: "s3",
        skuCode: "SKU003",
        name: "黄砂 中砂",
        spec: "中砂",
        image: "https://picsum.photos/100/100?random=3",
        stock: 15,
        maxStock: 500,
        warningStock: 50,
        unit: "方",
        warehouse: "C区仓库",
        location: "C-01",
        costPrice: "95.00",
        category: "砂石"
      },
      {
        id: "s4",
        skuCode: "SKU004",
        name: "商品混凝土 C30",
        spec: "C30",
        image: "https://picsum.photos/100/100?random=4",
        stock: 0,
        maxStock: 100,
        warningStock: 20,
        unit: "方",
        warehouse: "A区仓库",
        location: "",
        costPrice: "420.00",
        category: "水泥"
      },
      {
        id: "s5",
        skuCode: "SKU005",
        name: "碎石 5-31.5mm",
        spec: "5-31.5mm",
        image: "https://picsum.photos/100/100?random=5",
        stock: 80,
        maxStock: 300,
        warningStock: 50,
        unit: "方",
        warehouse: "C区仓库",
        location: "C-02",
        costPrice: "85.00",
        category: "砂石"
      }
    ]);
    const filteredStock = common_vendor.computed(() => {
      let result = stockList.value;
      if (keyword.value) {
        const kw = keyword.value.toLowerCase();
        result = result.filter(
          (s) => s.name.toLowerCase().includes(kw) || s.skuCode.toLowerCase().includes(kw)
        );
      }
      if (currentTab.value === "warning") {
        result = result.filter((s) => s.stock <= s.warningStock);
      } else {
        if (filterType.value === "warning") {
          result = result.filter((s) => s.stock > 0 && s.stock <= s.warningStock);
        } else if (filterType.value === "out") {
          result = result.filter((s) => s.stock === 0);
        } else if (filterType.value === "normal") {
          result = result.filter((s) => s.stock > s.warningStock);
        }
      }
      if (filterWarehouse.value) {
        result = result.filter((s) => s.warehouse.includes(filterWarehouse.value));
      }
      if (filterCategory.value) {
        result = result.filter((s) => s.category === filterCategory.value);
      }
      return result;
    });
    function getStockPercent(item) {
      return Math.min(100, item.stock / item.maxStock * 100);
    }
    function getStockColor(item) {
      if (item.stock === 0) return "#f53f3f";
      if (item.stock <= item.warningStock) return "#ff7d00";
      return "#00b42a";
    }
    function getStockStatus(item) {
      if (item.stock === 0) return "out";
      if (item.stock <= item.warningStock) return "warning";
      return "normal";
    }
    function getStockStatusText(item) {
      if (item.stock === 0) return "缺货";
      if (item.stock <= item.warningStock) return "预警";
      return "正常";
    }
    function handleDetail(item) {
      common_vendor.index.navigateTo({ url: `/pages/mine/stock-detail?id=${item.id}` });
    }
    function handleInStock(item) {
      stockModalType.value = "in";
      currentStock.value = item;
      stockQty.value = 1;
      showStockModal.value = true;
    }
    function handleOutStock(item) {
      stockModalType.value = "out";
      currentStock.value = item;
      stockQty.value = 1;
      showStockModal.value = true;
    }
    function confirmStock() {
      common_vendor.index.showToast({
        title: stockModalType.value === "in" ? "入库成功" : "出库成功",
        icon: "success"
      });
      showStockModal.value = false;
    }
    function handleInRecord() {
      common_vendor.index.navigateTo({ url: "/pages/mine/stock-records?type=in" });
    }
    function handleOutRecord() {
      common_vendor.index.navigateTo({ url: "/pages/mine/stock-records?type=out" });
    }
    function handleCheck() {
      common_vendor.index.navigateTo({ url: "/pages/mine/stock-check" });
    }
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
    function resetFilter() {
      filterWarehouse.value = "";
      filterCategory.value = "";
    }
    function applyFilter() {
      showFilter.value = false;
    }
    const __returned__ = { currentTab, keyword, filterType, showFilter, filterWarehouse, filterCategory, showStockModal, stockModalType, currentStock, stockQty, stockWarehouseIndex, stockTypeIndex, stockRemark, warehouses, stockTypes, totalSku, totalValue, warningCount, outCount, expireCount, stockList, filteredStock, getStockPercent, getStockColor, getStockStatus, getStockStatusText, handleDetail, handleInStock, handleOutStock, confirmStock, handleInRecord, handleOutRecord, handleCheck, handleScan, resetFilter, applyFilter };
    Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
    return __returned__;
  }
});
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $setup.currentTab === "overview" ? 1 : "",
    b: common_vendor.o(($event) => $setup.currentTab = "overview"),
    c: $setup.warningCount > 0
  }, $setup.warningCount > 0 ? {
    d: common_vendor.t($setup.warningCount)
  } : {}, {
    e: $setup.currentTab === "warning" ? 1 : "",
    f: common_vendor.o(($event) => $setup.currentTab = "warning"),
    g: $setup.currentTab === "overview"
  }, $setup.currentTab === "overview" ? {
    h: common_vendor.t($setup.totalSku),
    i: common_vendor.t($setup.totalValue),
    j: common_vendor.t($setup.warningCount),
    k: common_vendor.t($setup.outCount)
  } : {}, {
    l: $setup.currentTab === "warning"
  }, $setup.currentTab === "warning" ? {
    m: common_vendor.t($setup.warningCount),
    n: common_vendor.t($setup.outCount),
    o: common_vendor.t($setup.expireCount)
  } : {}, {
    p: $setup.keyword,
    q: common_vendor.o(($event) => $setup.keyword = $event.detail.value),
    r: common_vendor.o(($event) => $setup.showFilter = true),
    s: $setup.currentTab === "overview"
  }, $setup.currentTab === "overview" ? common_vendor.e({
    t: $setup.filterType === "all" ? 1 : "",
    v: common_vendor.o(($event) => $setup.filterType = "all"),
    w: $setup.warningCount > 0
  }, $setup.warningCount > 0 ? {
    x: common_vendor.t($setup.warningCount)
  } : {}, {
    y: $setup.filterType === "warning" ? 1 : "",
    z: common_vendor.o(($event) => $setup.filterType = "warning"),
    A: $setup.filterType === "out" ? 1 : "",
    B: common_vendor.o(($event) => $setup.filterType = "out"),
    C: $setup.filterType === "normal" ? 1 : "",
    D: common_vendor.o(($event) => $setup.filterType = "normal")
  }) : {}, {
    E: common_vendor.f($setup.filteredStock, (item, k0, i0) => {
      return common_vendor.e({
        a: common_vendor.t(item.skuCode),
        b: common_vendor.t($setup.getStockStatusText(item)),
        c: common_vendor.n($setup.getStockStatus(item)),
        d: item.image,
        e: common_vendor.t(item.name),
        f: common_vendor.t(item.spec),
        g: common_vendor.t(item.warehouse),
        h: item.location
      }, item.location ? {
        i: common_vendor.t(item.location)
      } : {}, {
        j: common_vendor.t(item.stock),
        k: common_vendor.t(item.unit),
        l: common_vendor.t(item.warningStock),
        m: common_vendor.t(item.maxStock),
        n: $setup.getStockPercent(item) + "%",
        o: $setup.getStockColor(item),
        p: common_vendor.t(item.costPrice),
        q: common_vendor.o(($event) => $setup.handleInStock(item), item.id),
        r: common_vendor.o(($event) => $setup.handleOutStock(item), item.id),
        s: item.id,
        t: common_vendor.o(($event) => $setup.handleDetail(item), item.id)
      });
    }),
    F: common_vendor.o($setup.handleInRecord),
    G: common_vendor.o($setup.handleOutRecord),
    H: common_vendor.o($setup.handleCheck),
    I: common_vendor.o($setup.handleScan),
    J: $setup.showFilter
  }, $setup.showFilter ? {
    K: common_vendor.o($setup.resetFilter),
    L: $setup.filterWarehouse === "" ? 1 : "",
    M: common_vendor.o(($event) => $setup.filterWarehouse = ""),
    N: $setup.filterWarehouse === "A区" ? 1 : "",
    O: common_vendor.o(($event) => $setup.filterWarehouse = "A区"),
    P: $setup.filterWarehouse === "B区" ? 1 : "",
    Q: common_vendor.o(($event) => $setup.filterWarehouse = "B区"),
    R: $setup.filterWarehouse === "C区" ? 1 : "",
    S: common_vendor.o(($event) => $setup.filterWarehouse = "C区"),
    T: $setup.filterCategory === "" ? 1 : "",
    U: common_vendor.o(($event) => $setup.filterCategory = ""),
    V: $setup.filterCategory === "水泥" ? 1 : "",
    W: common_vendor.o(($event) => $setup.filterCategory = "水泥"),
    X: $setup.filterCategory === "钢材" ? 1 : "",
    Y: common_vendor.o(($event) => $setup.filterCategory = "钢材"),
    Z: $setup.filterCategory === "砂石" ? 1 : "",
    aa: common_vendor.o(($event) => $setup.filterCategory = "砂石"),
    ab: common_vendor.o(($event) => $setup.showFilter = false),
    ac: common_vendor.o($setup.applyFilter),
    ad: common_vendor.o(($event) => $setup.showFilter = false)
  } : {}, {
    ae: $setup.showStockModal
  }, $setup.showStockModal ? common_vendor.e({
    af: common_vendor.t($setup.stockModalType === "in" ? "入库操作" : "出库操作"),
    ag: common_vendor.o(($event) => $setup.showStockModal = false),
    ah: $setup.currentStock
  }, $setup.currentStock ? {
    ai: common_vendor.t($setup.currentStock.name),
    aj: common_vendor.t($setup.currentStock.spec),
    ak: common_vendor.t($setup.currentStock.stock),
    al: common_vendor.t($setup.currentStock.unit)
  } : {}, {
    am: common_vendor.o(($event) => $setup.stockQty = Math.max(1, $setup.stockQty - 1)),
    an: $setup.stockQty,
    ao: common_vendor.o(($event) => $setup.stockQty = $event.detail.value),
    ap: common_vendor.o(($event) => $setup.stockQty++),
    aq: common_vendor.t($setup.warehouses[$setup.stockWarehouseIndex]),
    ar: $setup.stockWarehouseIndex,
    as: $setup.warehouses,
    at: common_vendor.o(($event) => $setup.stockWarehouseIndex = $event.detail.value),
    av: common_vendor.t($setup.stockTypes[$setup.stockTypeIndex]),
    aw: $setup.stockTypeIndex,
    ax: $setup.stockTypes,
    ay: common_vendor.o(($event) => $setup.stockTypeIndex = $event.detail.value),
    az: $setup.stockRemark,
    aA: common_vendor.o(($event) => $setup.stockRemark = $event.detail.value),
    aB: common_vendor.o($setup.confirmStock),
    aC: common_vendor.o(($event) => $setup.showStockModal = false)
  }) : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-c10d9087"], ["__file", "/Users/mcdreamy/Documents/trae_projects/gongchengcang2/apps/mp/src/pages/mine/stock.vue"]]);
wx.createPage(MiniProgramPage);
