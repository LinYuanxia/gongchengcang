"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const common_vendor = require("./common/vendor.js");
if (!Math) {
  "./pages/index/index.js";
  "./pages/market/index.js";
  "./pages/market/bom.js";
  "./pages/market/bom-detail.js";
  "./pages/cart/index.js";
  "./pages/order/index.js";
  "./pages/order/sale.js";
  "./pages/order/purchase.js";
  "./pages/order/detail.js";
  "./pages/order/create.js";
  "./pages/order/ship.js";
  "./pages/order/receive.js";
  "./pages/product/detail.js";
  "./pages/mine/index.js";
  "./pages/mine/profile.js";
  "./pages/mine/custody.js";
  "./pages/mine/custody-recharge.js";
  "./pages/mine/custody-withdraw.js";
  "./pages/mine/invoice.js";
  "./pages/mine/product.js";
  "./pages/mine/stock.js";
  "./pages/mine/account.js";
  "./pages/mine/bankcard.js";
  "./pages/mine/message.js";
  "./pages/mine/settings.js";
  "./pages/mine/custody-records.js";
  "./pages/mine/stock-records.js";
  "./pages/mine/stock-check.js";
  "./pages/mine/help.js";
  "./pages/mine/about.js";
  "./pages/mine/invoice-records.js";
  "./pages/login/index.js";
}
const _sfc_main = {
  onLaunch: function() {
    console.log("App Launch");
  },
  onShow: function() {
    console.log("App Show");
  },
  onHide: function() {
    console.log("App Hide");
  }
};
const App = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__file", "/Users/mcdreamy/Documents/trae_projects/gongchengcang2/apps/mp/src/App.vue"]]);
function createApp() {
  const app = common_vendor.createSSRApp(App);
  const pinia = common_vendor.createPinia();
  app.use(pinia);
  return {
    app,
    pinia
  };
}
createApp().app.mount("#app");
exports.createApp = createApp;
