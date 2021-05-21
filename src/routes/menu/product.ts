import React from 'react';
import { RouteMenu } from "model/other";

const ManageUserScreen = React.lazy(() => import ("screens/setting/manage-user.screen"));
const ManageStoreScreen = React.lazy(() => import ("screens/setting/manage-store.screen"));
const ManageRoleScreen = React.lazy(() => import ("screens/setting/manage-role.screen"));

const product: Array<RouteMenu> = [
  {
    path: "/products",
    exact: true,
    title: "Danh sách sản phẩm",
    icon: 'icon-dot',
    component: ManageUserScreen,
    key: "submenu21",
    isShow: true,
    header: null,
    subMenu: [],
  },
  {
    path: "/products/categories",
    exact: true,
    title: "Danh mục",
    icon: 'icon-dot',
    component: ManageStoreScreen,
    key: "submenu22",
    isShow: true,
    header: null,
    subMenu: [],
  },
  {
    path: "/products/materials",
    exact: true,
    title: "Chất liệu",
    icon: 'icon-dot',
    component: ManageStoreScreen,
    key: "submenu23",
    isShow: true,
    header: null,
    subMenu: [],
  },
  {
    path: "/products/sizes",
    exact: true,
    title: "Kích cỡ",
    icon: 'icon-dot',
    component: ManageRoleScreen,
    key: "submenu24",
    isShow: true,
    header: null,
    subMenu: [],
  },
  {
    path: "/products/colors",
    exact: true,
    title: "Màu sắc",
    icon: 'icon-dot',
    component: ManageRoleScreen,
    key: "submenu25",
    isShow: true,
    header: null,
    subMenu: [],
  },
  {
    path: "/products/suppliers",
    exact: true,
    title: "Nhà cung cấp",
    icon: 'icon-dot',
    component: ManageRoleScreen,
    key: "submenu26",
    isShow: true,
    header: null,
    subMenu: [],
  }
]

export default product;