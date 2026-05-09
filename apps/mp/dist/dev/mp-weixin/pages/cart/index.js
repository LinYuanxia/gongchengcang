"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "index",
  setup(__props, { expose: __expose }) {
    __expose();
    const cartList = common_vendor.ref([
      {
        supplierId: "s001",
        supplierName: "华新水泥供应商",
        selected: true,
        items: [
          { id: "p1", name: "水泥 P.O 42.5", spec: "42.5", image: "https://picsum.photos/100/100?random=1", price: 420, unit: "吨", qty: 10, selected: true }
        ]
      },
      {
        supplierId: "s002",
        supplierName: "宝钢供应商",
        selected: true,
        items: [
          { id: "p2", name: "螺纹钢 HRB400 16mm", spec: "16mm", image: "https://picsum.photos/100/100?random=2", price: 4e3, unit: "吨", qty: 5, selected: true },
          { id: "p3", name: "螺纹钢 HRB400 20mm", spec: "20mm", image: "https://picsum.photos/100/100?random=3", price: 3950, unit: "吨", qty: 3, selected: false }
        ]
      }
    ]);
    const isAllSelected = common_vendor.computed(() => {
      return cartList.value.every((g) => g.selected && g.items.every((i) => i.selected));
    });
    const selectedCount = common_vendor.computed(() => {
      return cartList.value.reduce((count, g) => {
        return count + g.items.filter((i) => i.selected).length;
      }, 0);
    });
    const selectedTotal = common_vendor.computed(() => {
      return cartList.value.reduce((sum, g) => {
        return sum + g.items.filter((i) => i.selected).reduce((s, i) => s + i.price * i.qty, 0);
      }, 0).toLocaleString();
    });
    function toggleGroup(group) {
      group.selected = !group.selected;
      group.items.forEach((i) => i.selected = group.selected);
    }
    function toggleItem(group, item) {
      item.selected = !item.selected;
      group.selected = group.items.every((i) => i.selected);
    }
    function toggleAll() {
      const newState = !isAllSelected.value;
      cartList.value.forEach((g) => {
        g.selected = newState;
        g.items.forEach((i) => i.selected = newState);
      });
    }
    function handleGoMarket() {
      common_vendor.index.switchTab({ url: "/pages/market/index" });
    }
    function handleSubmit() {
      const selected = cartList.value.flatMap((g) => g.items.filter((i) => i.selected));
      if (selected.length === 0) {
        common_vendor.index.showToast({ title: "请选择商品", icon: "none" });
        return;
      }
      common_vendor.index.navigateTo({ url: "/pages/order/create" });
    }
    const __returned__ = { cartList, isAllSelected, selectedCount, selectedTotal, toggleGroup, toggleItem, toggleAll, handleGoMarket, handleSubmit };
    Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
    return __returned__;
  }
});
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $setup.cartList.length > 0
  }, $setup.cartList.length > 0 ? {
    b: common_vendor.f($setup.cartList, (group, k0, i0) => {
      return {
        a: common_vendor.t(group.selected ? "☑" : "☐"),
        b: common_vendor.o(($event) => $setup.toggleGroup(group), group.supplierId),
        c: common_vendor.t(group.supplierName),
        d: common_vendor.f(group.items, (item, k1, i1) => {
          return {
            a: common_vendor.t(item.selected ? "☑" : "☐"),
            b: common_vendor.o(($event) => $setup.toggleItem(group, item), item.id),
            c: item.image,
            d: common_vendor.t(item.name),
            e: common_vendor.t(item.spec),
            f: common_vendor.t(item.price),
            g: common_vendor.t(item.unit),
            h: common_vendor.o(($event) => item.qty > 1 && item.qty--, item.id),
            i: common_vendor.t(item.qty),
            j: common_vendor.o(($event) => item.qty++, item.id),
            k: item.id
          };
        }),
        e: group.supplierId
      };
    })
  } : {
    c: common_vendor.o($setup.handleGoMarket)
  }, {
    d: $setup.cartList.length > 0
  }, $setup.cartList.length > 0 ? {
    e: common_vendor.t($setup.isAllSelected ? "☑" : "☐"),
    f: common_vendor.o($setup.toggleAll),
    g: common_vendor.t($setup.selectedTotal),
    h: common_vendor.t($setup.selectedCount),
    i: common_vendor.o($setup.handleSubmit)
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-3277fd7b"], ["__file", "/Users/mcdreamy/Documents/trae_projects/gongchengcang2/apps/mp/src/pages/cart/index.vue"]]);
wx.createPage(MiniProgramPage);
