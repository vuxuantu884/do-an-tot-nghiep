import React from 'react';
import { RouteMenu } from "model/other";

const ManageUserScreen = React.lazy(() => import ("screens/account/account.search.screen"));
const ManageStoreScreen = React.lazy(() => import ("screens/setting/manage-store.screen"));
const ManageRoleScreen = React.lazy(() => import ("screens/setting/manage-role.screen"));

const setting: Array<RouteMenu> = [
  {
    path: "/setting/accounts",
    exact: true,
    title: "Quản lý người dùng",
    icon: 'icon-dot',
    component: ManageUserScreen,
    key: "submenu91",
    isShow: true,
    header: null,
    subMenu: [],
    type: 0,
    object: null,
  },
  {
    path: "/setting/stores",
    exact: true,
    title: "Quản lý cửa hàng",
    icon: 'icon-dot',
    component: ManageStoreScreen,
    key: "submenu92",
    isShow: true,
    header: null,
    subMenu: [],
    type: 0,
    object: null,
  },
  {
    path: "/setting/printers",
    exact: true,
    title: "Quản lý mẫu in",
    icon: 'icon-dot',
    component: ManageStoreScreen,
    key: "submenu93",
    isShow: true,
    header: null,
    subMenu: [],
    type: 0,
    object: null,
  },
  {
    path: "/setting/roles",
    exact: true,
    title: "Phân quyền vai trò",
    icon: 'icon-dot',
    component: ManageRoleScreen,
    key: "submenu94",
    isShow: true,
    header: null,
    subMenu: [],
    type: 0,
    object: null,
  }
]

export default setting;