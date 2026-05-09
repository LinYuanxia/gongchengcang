"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "product",
  setup(__props, { expose: __expose }) {
    __expose();
    const keyword = common_vendor.ref("");
    const currentStatus = common_vendor.ref("");
    const showFilter = common_vendor.ref(false);
    const filterCategory = common_vendor.ref("");
    const filterLinked = common_vendor.ref("");
    const applyFilterCategory = common_vendor.ref("");
    const applyFilterLinked = common_vendor.ref("");
    const statusCount = common_vendor.ref({
      total: 156,
      onSale: 128,
      offSale: 28,
      warning: 5
    });
    const categories = common_vendor.ref([
      { id: "c1", name: "水泥建材" },
      { id: "c2", name: "钢材" },
      { id: "c3", name: "砂石料" },
      { id: "c4", name: "装饰材料" }
    ]);
    const products = common_vendor.ref([
      {
        id: "p1",
        name: "水泥 P.O 42.5",
        code: "SN-PO42.5",
        spec: "42.5级 | 袋装",
        image: "https://picsum.photos/100/100?random=1",
        supplyPrice: "420.00",
        salePrice: "450.00",
        stock: 500,
        unit: "吨",
        status: "onSale",
        statusText: "销售中",
        isWarning: false,
        isLinked: true,
        categoryId: "c1",
        categoryName: "水泥建材"
      },
      {
        id: "p2",
        name: "螺纹钢 HRB400 16mm",
        code: "LG-HRB400-16",
        spec: "HRB400 | 16mm",
        image: "https://picsum.photos/100/100?random=2",
        supplyPrice: "3950.00",
        salePrice: "4200.00",
        stock: 50,
        unit: "吨",
        status: "onSale",
        statusText: "销售中",
        isWarning: true,
        isLinked: true,
        categoryId: "c2",
        categoryName: "钢材"
      },
      {
        id: "p3",
        name: "黄砂 中砂",
        code: "HS-ZS",
        spec: "中砂",
        image: "https://picsum.photos/100/100?random=3",
        supplyPrice: "80.00",
        salePrice: "95.00",
        stock: 200,
        unit: "方",
        status: "onSale",
        statusText: "销售中",
        isWarning: false,
        isLinked: false,
        categoryId: "c3",
        categoryName: "砂石料"
      },
      {
        id: "p4",
        name: "商品混凝土 C30",
        code: "HNT-C30",
        spec: "C30",
        image: "https://picsum.photos/100/100?random=4",
        supplyPrice: "380.00",
        salePrice: "420.00",
        stock: 0,
        unit: "方",
        status: "offSale",
        statusText: "已下架",
        isWarning: false,
        isLinked: true,
        categoryId: "c1",
        categoryName: "水泥建材"
      }
    ]);
    const filteredProducts = common_vendor.computed(() => {
      let result = products.value;
      if (keyword.value) {
        const kw = keyword.value.toLowerCase();
        result = result.filter(
          (p) => p.name.toLowerCase().includes(kw) || p.code.toLowerCase().includes(kw)
        );
      }
      if (currentStatus.value) {
        if (currentStatus.value === "warning") {
          result = result.filter((p) => p.isWarning);
        } else {
          result = result.filter((p) => p.status === currentStatus.value);
        }
      }
      if (applyFilterCategory.value) {
        result = result.filter((p) => p.categoryId === applyFilterCategory.value);
      }
      if (applyFilterLinked.value) {
        if (applyFilterLinked.value === "linked") {
          result = result.filter((p) => p.isLinked);
        } else {
          result = result.filter((p) => !p.isLinked);
        }
      }
      return result;
    });
    function handleEdit(item) {
      common_vendor.index.showToast({ title: "编辑商品", icon: "none" });
    }
    function handleOffSale(item) {
      common_vendor.index.showModal({
        title: "下架商品",
        content: `确定下架 ${item.name} 吗？`,
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.showToast({ title: "已下架", icon: "success" });
          }
        }
      });
    }
    function handleOnSale(item) {
      common_vendor.index.showModal({
        title: "上架商品",
        content: `确定上架 ${item.name} 吗？`,
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.showToast({ title: "已上架", icon: "success" });
          }
        }
      });
    }
    function handleLink(item) {
      common_vendor.index.showModal({
        title: "关联标准品",
        content: "请选择要关联的平台标准商品",
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.showToast({ title: "关联成功", icon: "success" });
          }
        }
      });
    }
    function handleAdd() {
      common_vendor.index.showToast({ title: "添加商品", icon: "none" });
    }
    function handleResetFilter() {
      filterCategory.value = "";
      filterLinked.value = "";
    }
    function handleConfirmFilter() {
      applyFilterCategory.value = filterCategory.value;
      applyFilterLinked.value = filterLinked.value;
      showFilter.value = false;
    }
    const __returned__ = { keyword, currentStatus, showFilter, filterCategory, filterLinked, applyFilterCategory, applyFilterLinked, statusCount, categories, products, filteredProducts, handleEdit, handleOffSale, handleOnSale, handleLink, handleAdd, handleResetFilter, handleConfirmFilter };
    Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
    return __returned__;
  }
});
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $setup.keyword,
    b: common_vendor.o(($event) => $setup.keyword = $event.detail.value),
    c: common_vendor.o(($event) => $setup.showFilter = true),
    d: $setup.statusCount.total > 0
  }, $setup.statusCount.total > 0 ? {
    e: common_vendor.t($setup.statusCount.total)
  } : {}, {
    f: $setup.currentStatus === "" ? 1 : "",
    g: common_vendor.o(($event) => $setup.currentStatus = ""),
    h: $setup.statusCount.onSale > 0
  }, $setup.statusCount.onSale > 0 ? {
    i: common_vendor.t($setup.statusCount.onSale)
  } : {}, {
    j: $setup.currentStatus === "onSale" ? 1 : "",
    k: common_vendor.o(($event) => $setup.currentStatus = "onSale"),
    l: $setup.statusCount.offSale > 0
  }, $setup.statusCount.offSale > 0 ? {
    m: common_vendor.t($setup.statusCount.offSale)
  } : {}, {
    n: $setup.currentStatus === "offSale" ? 1 : "",
    o: common_vendor.o(($event) => $setup.currentStatus = "offSale"),
    p: $setup.statusCount.warning > 0
  }, $setup.statusCount.warning > 0 ? {
    q: common_vendor.t($setup.statusCount.warning)
  } : {}, {
    r: $setup.currentStatus === "warning" ? 1 : "",
    s: common_vendor.o(($event) => $setup.currentStatus = "warning"),
    t: common_vendor.f($setup.filteredProducts, (item, k0, i0) => {
      return common_vendor.e({
        a: item.image,
        b: common_vendor.t(item.name),
        c: common_vendor.t(item.statusText),
        d: common_vendor.n(item.status),
        e: common_vendor.t(item.code),
        f: common_vendor.t(item.spec),
        g: common_vendor.t(item.supplyPrice),
        h: common_vendor.t(item.salePrice),
        i: common_vendor.t(item.stock),
        j: common_vendor.t(item.unit),
        k: item.isWarning
      }, item.isWarning ? {} : {}, {
        l: common_vendor.t(item.categoryName),
        m: item.isLinked
      }, item.isLinked ? {} : {}, {
        n: common_vendor.o(($event) => $setup.handleEdit(item), item.id),
        o: item.status === "onSale"
      }, item.status === "onSale" ? {
        p: common_vendor.o(($event) => $setup.handleOffSale(item), item.id)
      } : {}, {
        q: item.status === "offSale"
      }, item.status === "offSale" ? {
        r: common_vendor.o(($event) => $setup.handleOnSale(item), item.id)
      } : {}, {
        s: !item.isLinked
      }, !item.isLinked ? {
        t: common_vendor.o(($event) => $setup.handleLink(item), item.id)
      } : {}, {
        v: item.id
      });
    }),
    v: $setup.filteredProducts.length === 0
  }, $setup.filteredProducts.length === 0 ? {} : {}, {
    w: common_vendor.o($setup.handleAdd),
    x: $setup.showFilter
  }, $setup.showFilter ? {
    y: common_vendor.o($setup.handleResetFilter),
    z: $setup.filterCategory === "" ? 1 : "",
    A: common_vendor.o(($event) => $setup.filterCategory = ""),
    B: common_vendor.f($setup.categories, (cat, k0, i0) => {
      return {
        a: common_vendor.t(cat.name),
        b: $setup.filterCategory === cat.id ? 1 : "",
        c: cat.id,
        d: common_vendor.o(($event) => $setup.filterCategory = cat.id, cat.id)
      };
    }),
    C: $setup.filterLinked === "" ? 1 : "",
    D: common_vendor.o(($event) => $setup.filterLinked = ""),
    E: $setup.filterLinked === "linked" ? 1 : "",
    F: common_vendor.o(($event) => $setup.filterLinked = "linked"),
    G: $setup.filterLinked === "unlinked" ? 1 : "",
    H: common_vendor.o(($event) => $setup.filterLinked = "unlinked"),
    I: common_vendor.o(($event) => $setup.showFilter = false),
    J: common_vendor.o($setup.handleConfirmFilter),
    K: common_vendor.o(() => {
    }),
    L: common_vendor.o(($event) => $setup.showFilter = false)
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-d902481b"], ["__file", "/Users/mcdreamy/Documents/trae_projects/gongchengcang2/apps/mp/src/pages/mine/product.vue"]]);
wx.createPage(MiniProgramPage);
