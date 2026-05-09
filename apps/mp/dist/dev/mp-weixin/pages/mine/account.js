"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "account",
  setup(__props, { expose: __expose }) {
    __expose();
    const keyword = common_vendor.ref("");
    const showAddPopup = common_vendor.ref(false);
    const editingItem = common_vendor.ref(null);
    const stats = common_vendor.ref({
      total: 5,
      active: 4,
      disabled: 1
    });
    const formData = common_vendor.ref({
      name: "",
      phone: "",
      selectedRoles: []
    });
    const roleOptions = common_vendor.ref([
      { id: "admin", name: "管理员" },
      { id: "sales", name: "销售" },
      { id: "warehouse", name: "仓库" },
      { id: "finance", name: "财务" }
    ]);
    const accounts = common_vendor.ref([
      {
        id: "a1",
        name: "李四",
        phone: "139****9999",
        status: "active",
        statusText: "启用",
        roles: ["管理员", "销售"],
        createTime: "2024-01-10",
        lastLogin: "2024-01-15 14:30"
      },
      {
        id: "a2",
        name: "王五",
        phone: "138****8888",
        status: "active",
        statusText: "启用",
        roles: ["仓库"],
        createTime: "2024-01-08",
        lastLogin: "2024-01-15 10:20"
      },
      {
        id: "a3",
        name: "赵六",
        phone: "137****7777",
        status: "disabled",
        statusText: "禁用",
        roles: ["财务"],
        createTime: "2024-01-05",
        lastLogin: "2024-01-10 16:45"
      }
    ]);
    const filteredAccounts = common_vendor.computed(() => {
      if (!keyword.value) return accounts.value;
      const kw = keyword.value.toLowerCase();
      return accounts.value.filter(
        (a) => a.name.toLowerCase().includes(kw) || a.phone.includes(kw)
      );
    });
    function handleAdd() {
      editingItem.value = null;
      formData.value = { name: "", phone: "", selectedRoles: [] };
      showAddPopup.value = true;
    }
    function handleEdit(item) {
      editingItem.value = item;
      formData.value = {
        name: item.name,
        phone: item.phone.replace(/\*/g, "0"),
        selectedRoles: item.roles.map((r) => r.toLowerCase())
      };
      showAddPopup.value = true;
    }
    function handleDisable(item) {
      common_vendor.index.showModal({
        title: "禁用账号",
        content: `确定禁用 ${item.name} 的账号吗？`,
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.showToast({ title: "已禁用", icon: "success" });
          }
        }
      });
    }
    function handleEnable(item) {
      common_vendor.index.showModal({
        title: "启用账号",
        content: `确定启用 ${item.name} 的账号吗？`,
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.showToast({ title: "已启用", icon: "success" });
          }
        }
      });
    }
    function handleResetPwd(item) {
      common_vendor.index.showModal({
        title: "重置密码",
        content: `确定重置 ${item.name} 的密码吗？新密码将发送到其手机。`,
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.showToast({ title: "密码已重置", icon: "success" });
          }
        }
      });
    }
    function toggleRole(id) {
      const index = formData.value.selectedRoles.indexOf(id);
      if (index > -1) {
        formData.value.selectedRoles.splice(index, 1);
      } else {
        formData.value.selectedRoles.push(id);
      }
    }
    function handleConfirm() {
      if (!formData.value.name) {
        common_vendor.index.showToast({ title: "请输入姓名", icon: "none" });
        return;
      }
      if (!formData.value.phone) {
        common_vendor.index.showToast({ title: "请输入手机号", icon: "none" });
        return;
      }
      if (formData.value.selectedRoles.length === 0) {
        common_vendor.index.showToast({ title: "请选择角色", icon: "none" });
        return;
      }
      common_vendor.index.showToast({ title: editingItem.value ? "修改成功" : "添加成功", icon: "success" });
      showAddPopup.value = false;
    }
    const __returned__ = { keyword, showAddPopup, editingItem, stats, formData, roleOptions, accounts, filteredAccounts, handleAdd, handleEdit, handleDisable, handleEnable, handleResetPwd, toggleRole, handleConfirm };
    Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
    return __returned__;
  }
});
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.t($setup.stats.total),
    b: common_vendor.t($setup.stats.active),
    c: common_vendor.t($setup.stats.disabled),
    d: $setup.keyword,
    e: common_vendor.o(($event) => $setup.keyword = $event.detail.value),
    f: common_vendor.f($setup.filteredAccounts, (item, k0, i0) => {
      return common_vendor.e({
        a: common_vendor.t(item.name.charAt(0)),
        b: common_vendor.t(item.name),
        c: common_vendor.t(item.statusText),
        d: common_vendor.n(item.status),
        e: common_vendor.t(item.phone),
        f: common_vendor.f(item.roles, (role, k1, i1) => {
          return {
            a: common_vendor.t(role),
            b: role
          };
        }),
        g: common_vendor.t(item.createTime),
        h: item.lastLogin
      }, item.lastLogin ? {
        i: common_vendor.t(item.lastLogin)
      } : {}, {
        j: common_vendor.o(($event) => $setup.handleEdit(item), item.id),
        k: item.status === "active"
      }, item.status === "active" ? {
        l: common_vendor.o(($event) => $setup.handleDisable(item), item.id)
      } : {}, {
        m: item.status === "disabled"
      }, item.status === "disabled" ? {
        n: common_vendor.o(($event) => $setup.handleEnable(item), item.id)
      } : {}, {
        o: common_vendor.o(($event) => $setup.handleResetPwd(item), item.id),
        p: item.id
      });
    }),
    g: $setup.filteredAccounts.length === 0
  }, $setup.filteredAccounts.length === 0 ? {} : {}, {
    h: common_vendor.o($setup.handleAdd),
    i: $setup.showAddPopup
  }, $setup.showAddPopup ? {
    j: common_vendor.t($setup.editingItem ? "编辑账号" : "添加子账号"),
    k: common_vendor.o(($event) => $setup.showAddPopup = false),
    l: $setup.formData.name,
    m: common_vendor.o(($event) => $setup.formData.name = $event.detail.value),
    n: $setup.formData.phone,
    o: common_vendor.o(($event) => $setup.formData.phone = $event.detail.value),
    p: common_vendor.f($setup.roleOptions, (item, k0, i0) => {
      return common_vendor.e({
        a: common_vendor.t(item.name),
        b: $setup.formData.selectedRoles.includes(item.id)
      }, $setup.formData.selectedRoles.includes(item.id) ? {} : {}, {
        c: $setup.formData.selectedRoles.includes(item.id) ? 1 : "",
        d: item.id,
        e: common_vendor.o(($event) => $setup.toggleRole(item.id), item.id)
      });
    }),
    q: common_vendor.o(($event) => $setup.showAddPopup = false),
    r: common_vendor.o($setup.handleConfirm),
    s: common_vendor.o(() => {
    }),
    t: common_vendor.o(($event) => $setup.showAddPopup = false)
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-51c4d6d5"], ["__file", "/Users/mcdreamy/Documents/trae_projects/gongchengcang2/apps/mp/src/pages/mine/account.vue"]]);
wx.createPage(MiniProgramPage);
