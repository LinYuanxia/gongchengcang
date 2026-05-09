"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "message",
  setup(__props, { expose: __expose }) {
    __expose();
    const currentTab = common_vendor.ref("all");
    const unreadCount = common_vendor.ref({
      all: 5,
      order: 3,
      system: 2
    });
    const messages = common_vendor.ref([
      {
        id: "m1",
        type: "order",
        title: "新订单提醒",
        content: "您有1个新订单待发货，订单号：SO2024010012，客户：深圳建设集团",
        time: "10分钟前",
        isRead: false,
        actionText: "立即处理",
        actionUrl: "/pages/order/ship?id=so001"
      },
      {
        id: "m2",
        type: "stock",
        title: "库存预警",
        content: '商品"螺纹钢 HRB400 16mm"库存不足，当前库存：50吨，请及时补货',
        time: "1小时前",
        isRead: false,
        actionText: "立即采购",
        actionUrl: "/pages/market/index"
      },
      {
        id: "m3",
        type: "finance",
        title: "收款到账",
        content: "您收到一笔货款，金额：¥21,000.00，来自订单：SO2024010011",
        time: "2小时前",
        isRead: false,
        actionText: "查看详情",
        actionUrl: "/pages/mine/custody"
      },
      {
        id: "m4",
        type: "system",
        title: "系统升级通知",
        content: "系统将于今晚22:00-24:00进行升级维护，届时部分功能可能无法使用，请提前做好准备",
        time: "今天 09:00",
        isRead: true
      },
      {
        id: "m5",
        type: "invoice",
        title: "发票开具成功",
        content: "您申请的发票已开具成功，发票金额：¥4,500.00，购买方：深圳建设集团",
        time: "昨天 16:30",
        isRead: false,
        actionText: "查看发票",
        actionUrl: "/pages/mine/invoice"
      },
      {
        id: "m6",
        type: "system",
        title: "账户安全提醒",
        content: "检测到您的账号在新设备登录，如非本人操作，请及时修改密码",
        time: "昨天 14:20",
        isRead: true,
        actionText: "修改密码",
        actionUrl: "/pages/mine/settings"
      }
    ]);
    const hasUnread = common_vendor.computed(() => messages.value.some((m) => !m.isRead));
    const filteredMessages = common_vendor.computed(() => {
      if (currentTab.value === "all") return messages.value;
      if (currentTab.value === "order") {
        return messages.value.filter((m) => ["order", "stock", "finance", "invoice"].includes(m.type));
      }
      return messages.value.filter((m) => m.type === "system");
    });
    function getTypeIcon(type) {
      const icons = {
        order: "📦",
        stock: "📊",
        finance: "💰",
        invoice: "📄",
        system: "🔔"
      };
      return icons[type] || "📢";
    }
    function handleRead(item) {
      if (!item.isRead) {
        item.isRead = true;
        updateUnreadCount();
      }
    }
    function handleAction(item) {
      if (item.actionUrl) {
        common_vendor.index.navigateTo({ url: item.actionUrl });
      }
    }
    function handleMarkAll() {
      messages.value.forEach((m) => m.isRead = true);
      unreadCount.value = { all: 0, order: 0, system: 0 };
      common_vendor.index.showToast({ title: "已全部标记已读", icon: "success" });
    }
    function updateUnreadCount() {
      const all = messages.value.filter((m) => !m.isRead).length;
      const order = messages.value.filter((m) => !m.isRead && ["order", "stock", "finance", "invoice"].includes(m.type)).length;
      const system = messages.value.filter((m) => !m.isRead && m.type === "system").length;
      unreadCount.value = { all, order, system };
    }
    const __returned__ = { currentTab, unreadCount, messages, hasUnread, filteredMessages, getTypeIcon, handleRead, handleAction, handleMarkAll, updateUnreadCount };
    Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
    return __returned__;
  }
});
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $setup.unreadCount.all > 0
  }, $setup.unreadCount.all > 0 ? {
    b: common_vendor.t($setup.unreadCount.all)
  } : {}, {
    c: $setup.currentTab === "all" ? 1 : "",
    d: common_vendor.o(($event) => $setup.currentTab = "all"),
    e: $setup.unreadCount.order > 0
  }, $setup.unreadCount.order > 0 ? {
    f: common_vendor.t($setup.unreadCount.order)
  } : {}, {
    g: $setup.currentTab === "order" ? 1 : "",
    h: common_vendor.o(($event) => $setup.currentTab = "order"),
    i: $setup.unreadCount.system > 0
  }, $setup.unreadCount.system > 0 ? {
    j: common_vendor.t($setup.unreadCount.system)
  } : {}, {
    k: $setup.currentTab === "system" ? 1 : "",
    l: common_vendor.o(($event) => $setup.currentTab = "system"),
    m: common_vendor.f($setup.filteredMessages, (item, k0, i0) => {
      return common_vendor.e({
        a: common_vendor.t($setup.getTypeIcon(item.type)),
        b: common_vendor.n(item.type),
        c: common_vendor.t(item.title),
        d: common_vendor.t(item.time),
        e: common_vendor.t(item.content),
        f: !item.isRead ? 1 : "",
        g: item.actionText
      }, item.actionText ? {
        h: common_vendor.t(item.actionText),
        i: common_vendor.o(($event) => $setup.handleAction(item), item.id)
      } : {}, {
        j: !item.isRead
      }, !item.isRead ? {} : {}, {
        k: item.id,
        l: common_vendor.o(($event) => $setup.handleRead(item), item.id)
      });
    }),
    n: $setup.filteredMessages.length === 0
  }, $setup.filteredMessages.length === 0 ? {} : {}, {
    o: $setup.hasUnread
  }, $setup.hasUnread ? {
    p: common_vendor.o($setup.handleMarkAll)
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-b319ee87"], ["__file", "/Users/mcdreamy/Documents/trae_projects/gongchengcang2/apps/mp/src/pages/mine/message.vue"]]);
wx.createPage(MiniProgramPage);
