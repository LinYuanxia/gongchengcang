"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "index",
  setup(__props, { expose: __expose }) {
    __expose();
    const currentTab = common_vendor.ref("product");
    const keyword = common_vendor.ref("");
    const sortType = common_vendor.ref("default");
    const sortOrder = common_vendor.ref("desc");
    const currentCategory = common_vendor.ref("");
    const showFilterPanel = common_vendor.ref(false);
    const filterSupplier = common_vendor.ref("");
    const priceMin = common_vendor.ref("");
    const priceMax = common_vendor.ref("");
    const cartCount = common_vendor.ref(3);
    const bomType = common_vendor.ref("");
    const startDate = common_vendor.ref("");
    const endDate = common_vendor.ref("");
    const historyStatus = common_vendor.ref("");
    const categories = common_vendor.ref([
      { id: "steel", name: "钢材" },
      { id: "cement", name: "水泥" },
      { id: "sand", name: "砂石" },
      { id: "concrete", name: "混凝土" },
      { id: "brick", name: "砌体材料" },
      { id: "decoration", name: "装修材料" }
    ]);
    const supplierList = common_vendor.ref([
      { id: "s001", name: "华新水泥供应商" },
      { id: "s002", name: "海螺水泥供应商" },
      { id: "s003", name: "宝钢供应商" },
      { id: "s004", name: "南方建材供应商" },
      { id: "s005", name: "中建混凝土供应商" }
    ]);
    const products = common_vendor.ref([
      {
        id: "mp001",
        skuId: "sku001",
        skuCode: "SKU-SN-001-42.5",
        skuName: "水泥 P.O 42.5",
        categoryName: "水泥",
        categoryId: "cement",
        specs: { "强度等级": "42.5" },
        mainImage: "https://picsum.photos/200/200?random=1",
        unit: "吨",
        marketPrice: 450,
        hasPermission: true,
        isHot: true,
        suppliers: [
          { supplierId: "s001", supplierName: "华新水泥供应商", supplyPrice: 420, supplyStatus: "supplying", estimatedStock: 500 },
          { supplierId: "s002", supplierName: "海螺水泥供应商", supplyPrice: 415, supplyStatus: "supplying", estimatedStock: 300 }
        ]
      },
      {
        id: "mp002",
        skuId: "sku002",
        skuCode: "SKU-GC-002-16",
        skuName: "螺纹钢 HRB400 16mm",
        categoryName: "钢材",
        categoryId: "steel",
        specs: { "规格": "16mm" },
        mainImage: "https://picsum.photos/200/200?random=2",
        unit: "吨",
        marketPrice: 4200,
        hasPermission: true,
        isHot: true,
        suppliers: [
          { supplierId: "s003", supplierName: "宝钢供应商", supplyPrice: 4e3, supplyStatus: "supplying", estimatedStock: 100 }
        ]
      },
      {
        id: "mp003",
        skuId: "sku003",
        skuCode: "SKU-SS-003",
        skuName: "黄砂 中砂",
        categoryName: "砂石",
        categoryId: "sand",
        specs: { "类型": "中砂" },
        mainImage: "https://picsum.photos/200/200?random=3",
        unit: "方",
        marketPrice: 95,
        hasPermission: true,
        isHot: false,
        suppliers: [
          { supplierId: "s004", supplierName: "南方建材供应商", supplyPrice: 80, supplyStatus: "supplying", estimatedStock: 1e3 }
        ]
      },
      {
        id: "mp004",
        skuId: "sku004",
        skuCode: "SKU-HNT-004-C30",
        skuName: "商品混凝土 C30",
        categoryName: "混凝土",
        categoryId: "concrete",
        specs: { "强度等级": "C30" },
        mainImage: "https://picsum.photos/200/200?random=4",
        unit: "方",
        marketPrice: 420,
        hasPermission: true,
        isHot: false,
        suppliers: [
          { supplierId: "s005", supplierName: "中建混凝土供应商", supplyPrice: 380, supplyStatus: "supplying", estimatedStock: 500 }
        ]
      },
      {
        id: "mp005",
        skuId: "sku005",
        skuCode: "SKU-GC-005-20",
        skuName: "螺纹钢 HRB400 20mm",
        categoryName: "钢材",
        categoryId: "steel",
        specs: { "规格": "20mm" },
        mainImage: "https://picsum.photos/200/200?random=5",
        unit: "吨",
        marketPrice: 4150,
        hasPermission: true,
        isHot: false,
        suppliers: [
          { supplierId: "s003", supplierName: "宝钢供应商", supplyPrice: 3950, supplyStatus: "supplying", estimatedStock: 80 }
        ]
      }
    ]);
    const bomList = common_vendor.ref([
      {
        id: "bom001",
        name: "标准住宅基础BOM包",
        type: "平台标准",
        description: "适用于标准住宅项目的基础建材配置包，包含水泥、砂石、钢筋等基础材料",
        productCount: 12,
        estimatedPrice: "158,000",
        tags: ["住宅", "基础工程", "推荐"]
      },
      {
        id: "bom002",
        name: "商业建筑主体BOM包",
        type: "平台标准",
        description: "适用于商业建筑主体工程的建材配置包，包含钢结构、混凝土、砌体材料等",
        productCount: 18,
        estimatedPrice: "328,000",
        tags: ["商业", "主体工程"]
      },
      {
        id: "bom003",
        name: "装修工程BOM包",
        type: "自定义",
        description: "室内装修工程材料配置包，包含瓷砖、涂料、管材等装修材料",
        productCount: 25,
        estimatedPrice: "85,000",
        tags: ["装修", "室内"]
      }
    ]);
    const purchaseHistory = common_vendor.ref([
      {
        id: "po001",
        orderNo: "PO2024010001",
        status: "pending",
        statusText: "待确认",
        supplierName: "华新水泥供应商",
        createTime: "2024-01-15 14:30",
        products: [
          { id: "p1", name: "水泥 P.O 42.5", spec: "42.5", image: "https://picsum.photos/100/100?random=10", price: 420, qty: 20 }
        ],
        totalQty: 20,
        totalAmount: "8,400.00"
      },
      {
        id: "po002",
        orderNo: "PO2024010002",
        status: "shipped",
        statusText: "已发货",
        supplierName: "宝钢供应商",
        createTime: "2024-01-14 10:20",
        products: [
          { id: "p2", name: "螺纹钢 HRB400 20mm", spec: "20mm", image: "https://picsum.photos/100/100?random=11", price: 3950, qty: 10 }
        ],
        totalQty: 10,
        totalAmount: "39,500.00"
      },
      {
        id: "po003",
        orderNo: "PO2024010003",
        status: "completed",
        statusText: "已完成",
        supplierName: "南方建材供应商",
        createTime: "2024-01-12 16:45",
        products: [
          { id: "p3", name: "黄砂 中砂", spec: "中砂", image: "https://picsum.photos/100/100?random=12", price: 80, qty: 100 }
        ],
        totalQty: 100,
        totalAmount: "8,000.00"
      }
    ]);
    const filteredProducts = common_vendor.computed(() => {
      let result = products.value;
      if (keyword.value) {
        const kw = keyword.value.toLowerCase();
        result = result.filter(
          (p) => p.skuName.toLowerCase().includes(kw) || p.skuCode.toLowerCase().includes(kw)
        );
      }
      if (currentCategory.value) {
        result = result.filter((p) => p.categoryId === currentCategory.value);
      }
      if (filterSupplier.value) {
        result = result.filter(
          (p) => p.suppliers && p.suppliers.some((s) => s.supplierId === filterSupplier.value)
        );
      }
      if (priceMin.value || priceMax.value) {
        const min = parseFloat(priceMin.value) || 0;
        const max = parseFloat(priceMax.value) || Infinity;
        result = result.filter((p) => p.marketPrice >= min && p.marketPrice <= max);
      }
      if (sortType.value === "price") {
        result = [...result].sort(
          (a, b) => sortOrder.value === "asc" ? a.marketPrice - b.marketPrice : b.marketPrice - a.marketPrice
        );
      } else if (sortType.value === "sales") {
        result = [...result].sort(
          (a, b) => sortOrder.value === "asc" ? (a.isHot ? 0 : 1) - (b.isHot ? 0 : 1) : (b.isHot ? 0 : 1) - (a.isHot ? 0 : 1)
        );
      }
      return result;
    });
    const filteredBomList = common_vendor.computed(() => {
      if (!bomType.value) return bomList.value;
      return bomList.value.filter(
        (b) => bomType.value === "platform" ? b.type === "平台标准" : b.type === "自定义"
      );
    });
    const filteredHistory = common_vendor.computed(() => {
      if (!historyStatus.value) return purchaseHistory.value;
      return purchaseHistory.value.filter((h) => h.status === historyStatus.value);
    });
    function handleScan() {
      common_vendor.index.scanCode({
        success: (res) => {
          common_vendor.index.showToast({ title: "扫码成功", icon: "success" });
        },
        fail: () => {
          common_vendor.index.showToast({ title: "扫码失败", icon: "none" });
        }
      });
    }
    function handleSearch() {
      common_vendor.index.showToast({ title: "搜索完成", icon: "none" });
    }
    function handleCategoryChange(id) {
      currentCategory.value = id;
    }
    function handleSort(type) {
      if (sortType.value === type) {
        sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";
      } else {
        sortType.value = type;
        sortOrder.value = "desc";
      }
    }
    function resetFilter() {
      filterSupplier.value = "";
      priceMin.value = "";
      priceMax.value = "";
    }
    function confirmFilter() {
      showFilterPanel.value = false;
    }
    function formatSpecs(specs) {
      return Object.entries(specs).map(([k, v]) => v).join(" / ");
    }
    function getMinPrice(suppliers) {
      const min = suppliers.reduce((m, s) => s.supplyPrice < m ? s.supplyPrice : m, suppliers[0].supplyPrice);
      return min.toFixed(2);
    }
    function handleProductDetail(item) {
      common_vendor.index.navigateTo({ url: `/pages/product/detail?id=${item.id}` });
    }
    function handleAddCart(item) {
      common_vendor.index.showToast({ title: "已加入购物车", icon: "success" });
      cartCount.value++;
    }
    function handleBomDetail(item) {
      common_vendor.index.navigateTo({ url: `/pages/market/bom-detail?id=${item.id}` });
    }
    function handleBomPurchase(item) {
      common_vendor.index.navigateTo({ url: `/pages/market/bom-detail?id=${item.id}&action=purchase` });
    }
    function onStartDateChange(e) {
      startDate.value = e.detail.value;
    }
    function onEndDateChange(e) {
      endDate.value = e.detail.value;
    }
    function getStatusColor(status) {
      const colors = {
        pending: "#ff7d00",
        shipped: "#165dff",
        completed: "#00b42a"
      };
      return colors[status] || "#666";
    }
    function handleHistoryDetail(item) {
      common_vendor.index.navigateTo({ url: `/pages/order/detail?id=${item.id}&type=purchase` });
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
    function handleCart() {
      common_vendor.index.navigateTo({ url: "/pages/cart/index" });
    }
    const __returned__ = { currentTab, keyword, sortType, sortOrder, currentCategory, showFilterPanel, filterSupplier, priceMin, priceMax, cartCount, bomType, startDate, endDate, historyStatus, categories, supplierList, products, bomList, purchaseHistory, filteredProducts, filteredBomList, filteredHistory, handleScan, handleSearch, handleCategoryChange, handleSort, resetFilter, confirmFilter, formatSpecs, getMinPrice, handleProductDetail, handleAddCart, handleBomDetail, handleBomPurchase, onStartDateChange, onEndDateChange, getStatusColor, handleHistoryDetail, handleCancel, handleConfirm, handleCart };
    Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
    return __returned__;
  }
});
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.o($setup.handleSearch),
    b: $setup.keyword,
    c: common_vendor.o(($event) => $setup.keyword = $event.detail.value),
    d: common_vendor.o($setup.handleScan),
    e: $setup.currentTab === "product" ? 1 : "",
    f: common_vendor.o(($event) => $setup.currentTab = "product"),
    g: $setup.currentTab === "bom" ? 1 : "",
    h: common_vendor.o(($event) => $setup.currentTab = "bom"),
    i: $setup.currentTab === "history" ? 1 : "",
    j: common_vendor.o(($event) => $setup.currentTab = "history"),
    k: $setup.currentTab === "product"
  }, $setup.currentTab === "product" ? common_vendor.e({
    l: $setup.currentCategory === "" ? 1 : "",
    m: common_vendor.o(($event) => $setup.handleCategoryChange("")),
    n: common_vendor.f($setup.categories, (cat, k0, i0) => {
      return {
        a: common_vendor.t(cat.name),
        b: cat.id,
        c: $setup.currentCategory === cat.id ? 1 : "",
        d: common_vendor.o(($event) => $setup.handleCategoryChange(cat.id), cat.id)
      };
    }),
    o: $setup.sortType === "default" ? 1 : "",
    p: common_vendor.o(($event) => $setup.handleSort("default")),
    q: $setup.sortType === "sales"
  }, $setup.sortType === "sales" ? {
    r: common_vendor.t($setup.sortOrder === "asc" ? "↑" : "↓")
  } : {}, {
    s: $setup.sortType === "sales" ? 1 : "",
    t: common_vendor.o(($event) => $setup.handleSort("sales")),
    v: $setup.sortType === "price"
  }, $setup.sortType === "price" ? {
    w: common_vendor.t($setup.sortOrder === "asc" ? "↑" : "↓")
  } : {}, {
    x: $setup.sortType === "price" ? 1 : "",
    y: common_vendor.o(($event) => $setup.handleSort("price")),
    z: $setup.showFilterPanel ? 1 : "",
    A: common_vendor.o(($event) => $setup.showFilterPanel = true),
    B: $setup.showFilterPanel
  }, $setup.showFilterPanel ? {
    C: common_vendor.o(($event) => $setup.showFilterPanel = false),
    D: $setup.filterSupplier === "" ? 1 : "",
    E: common_vendor.o(($event) => $setup.filterSupplier = ""),
    F: common_vendor.f($setup.supplierList, (s, k0, i0) => {
      return {
        a: common_vendor.t(s.name),
        b: s.id,
        c: $setup.filterSupplier === s.id ? 1 : "",
        d: common_vendor.o(($event) => $setup.filterSupplier = s.id, s.id)
      };
    }),
    G: $setup.priceMin,
    H: common_vendor.o(($event) => $setup.priceMin = $event.detail.value),
    I: $setup.priceMax,
    J: common_vendor.o(($event) => $setup.priceMax = $event.detail.value),
    K: common_vendor.o($setup.resetFilter),
    L: common_vendor.o($setup.confirmFilter)
  } : {}, {
    M: $setup.filteredProducts.length > 0
  }, $setup.filteredProducts.length > 0 ? {
    N: common_vendor.f($setup.filteredProducts, (item, k0, i0) => {
      return common_vendor.e({
        a: item.mainImage,
        b: common_vendor.t(item.skuName),
        c: item.hasPermission
      }, item.hasPermission ? {} : {}, {
        d: item.isHot
      }, item.isHot ? {} : {}, {
        e: common_vendor.t($setup.formatSpecs(item.specs)),
        f: item.suppliers && item.suppliers.length > 1
      }, item.suppliers && item.suppliers.length > 1 ? {
        g: common_vendor.t(item.suppliers.length),
        h: common_vendor.t($setup.getMinPrice(item.suppliers))
      } : item.suppliers && item.suppliers.length === 1 ? {
        j: common_vendor.t(item.suppliers[0].supplierName),
        k: common_vendor.t(item.suppliers[0].estimatedStock),
        l: common_vendor.t(item.unit)
      } : {}, {
        i: item.suppliers && item.suppliers.length === 1,
        m: common_vendor.t(item.marketPrice),
        n: common_vendor.t(item.unit),
        o: item.suppliers && item.suppliers.length > 0
      }, item.suppliers && item.suppliers.length > 0 ? {
        p: common_vendor.t(item.suppliers[0].supplyPrice)
      } : {}, {
        q: common_vendor.o(($event) => $setup.handleAddCart(item), item.id),
        r: item.id,
        s: common_vendor.o(($event) => $setup.handleProductDetail(item), item.id)
      });
    })
  } : {}) : {}, {
    O: $setup.currentTab === "bom"
  }, $setup.currentTab === "bom" ? {
    P: $setup.bomType === "" ? 1 : "",
    Q: common_vendor.o(($event) => $setup.bomType = ""),
    R: $setup.bomType === "platform" ? 1 : "",
    S: common_vendor.o(($event) => $setup.bomType = "platform"),
    T: $setup.bomType === "custom" ? 1 : "",
    U: common_vendor.o(($event) => $setup.bomType = "custom"),
    V: common_vendor.f($setup.filteredBomList, (item, k0, i0) => {
      return {
        a: common_vendor.t(item.name),
        b: common_vendor.t(item.type),
        c: common_vendor.t(item.description),
        d: common_vendor.t(item.productCount),
        e: common_vendor.t(item.estimatedPrice),
        f: common_vendor.f(item.tags, (tag, k1, i1) => {
          return {
            a: common_vendor.t(tag),
            b: tag
          };
        }),
        g: common_vendor.o(($event) => $setup.handleBomPurchase(item), item.id),
        h: item.id,
        i: common_vendor.o(($event) => $setup.handleBomDetail(item), item.id)
      };
    })
  } : {}, {
    W: $setup.currentTab === "history"
  }, $setup.currentTab === "history" ? {
    X: common_vendor.t($setup.startDate || "开始日期"),
    Y: $setup.startDate,
    Z: common_vendor.o($setup.onStartDateChange),
    aa: common_vendor.t($setup.endDate || "结束日期"),
    ab: $setup.endDate,
    ac: common_vendor.o($setup.onEndDateChange),
    ad: $setup.historyStatus === "" ? 1 : "",
    ae: common_vendor.o(($event) => $setup.historyStatus = ""),
    af: $setup.historyStatus === "pending" ? 1 : "",
    ag: common_vendor.o(($event) => $setup.historyStatus = "pending"),
    ah: $setup.historyStatus === "shipped" ? 1 : "",
    ai: common_vendor.o(($event) => $setup.historyStatus = "shipped"),
    aj: $setup.historyStatus === "completed" ? 1 : "",
    ak: common_vendor.o(($event) => $setup.historyStatus = "completed"),
    al: common_vendor.f($setup.filteredHistory, (item, k0, i0) => {
      return common_vendor.e({
        a: common_vendor.t(item.orderNo),
        b: common_vendor.t(item.statusText),
        c: $setup.getStatusColor(item.status),
        d: common_vendor.t(item.supplierName),
        e: common_vendor.f(item.products, (prod, k1, i1) => {
          return {
            a: prod.image,
            b: common_vendor.t(prod.name),
            c: common_vendor.t(prod.spec),
            d: common_vendor.t(prod.price),
            e: common_vendor.t(prod.qty),
            f: prod.id
          };
        }),
        f: common_vendor.t(item.totalQty),
        g: common_vendor.t(item.totalAmount),
        h: common_vendor.t(item.createTime),
        i: item.status === "pending"
      }, item.status === "pending" ? {
        j: common_vendor.o(($event) => $setup.handleCancel(item), item.id),
        k: common_vendor.o(($event) => $setup.handleConfirm(item), item.id)
      } : {}, {
        l: item.id,
        m: common_vendor.o(($event) => $setup.handleHistoryDetail(item), item.id)
      });
    })
  } : {}, {
    am: $setup.cartCount > 0
  }, $setup.cartCount > 0 ? {
    an: common_vendor.t($setup.cartCount)
  } : {}, {
    ao: common_vendor.o($setup.handleCart)
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-e37f2196"], ["__file", "/Users/mcdreamy/Documents/trae_projects/gongchengcang2/apps/mp/src/pages/market/index.vue"]]);
wx.createPage(MiniProgramPage);
