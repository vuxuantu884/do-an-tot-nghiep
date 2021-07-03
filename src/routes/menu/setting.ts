import UrlConfig from 'config/UrlConfig';
import React from 'react';
import { RouteMenu } from "model/other";
import { HEADER_TYPE } from 'config/HeaderConfig';

const ManageUserScreen = React.lazy(() => import("screens/account/account.search.screen"));
const ManageStoreScreen = React.lazy(() => import("screens/setting/manage-store.screen"));
const ManageRoleScreen = React.lazy(() => import("screens/roles/role-list.screen"));
const AccountCreateScreen = React.lazy(() => import("screens/account/account.create.screen"));
const AccountUpdateScreen = React.lazy(() => import("screens/account/account.update.screen"));

//store
const StoreCreateScreen = React.lazy(() => import("screens/store/store-create.screen"));
const StoreListScreen = React.lazy(() => import("screens/store/store-list.screen"));
const StoreUpdateScreen = React.lazy(() => import("screens/store/store-update.screen"));


const setting: Array<RouteMenu> = [
  {
    path: "/accounts",
    exact: true,
    title: "Quản lý người dùng",
    icon: 'icon-dot',
    component: ManageUserScreen,
    key: "submenu91",
    isShow: true,
    header: null,
    subMenu: [
      {
        path: `${UrlConfig.ACCOUNTS}/create`,
        exact: true,
        title: "Thêm mới người dùng",
        icon: 'icon-dot',
        component: AccountCreateScreen,
        key: "submenu261",
        isShow: true,
        header: null,
        subMenu: [],
        type: 0,
        object: null,
      },
      {
        path: `${UrlConfig.ACCOUNTS}/:id`,
        exact: true,
        title: "Chỉnh sửa người dùng",
        icon: 'icon-dot',
        component: AccountUpdateScreen,
        key: "account2",
        isShow: true,
        header: null,
        subMenu: [],
        type: 0,
        object: null,
        pathIgnore: ['create']
      }
    ],
    type: HEADER_TYPE.BUTTON_CREATE,
    object: {
      pathCreate: `${UrlConfig.ACCOUNTS}/create`,
    },
  },
  {
    path: `${UrlConfig.STORE}`,
    exact: true,
    title: "Quản lý cửa hàng",
    icon: 'icon-dot',
    component: StoreListScreen,
    key: "submenu92",
    isShow: true,
    header: null,
    subMenu: [
      {
        path: `${UrlConfig.STORE}/create`,
        exact: true,
        title: "Thêm cửa hàng",
        icon: 'icon-dot',
        component: StoreCreateScreen,
        key: "submenu921",
        isShow: false,
        header: null,
        subMenu: [],
        type: 0,
        object: null,
      },
      {
        path: `${UrlConfig.STORE}/:id`,
        exact: true,
        title: "Sửa cửa hàng",
        icon: 'icon-dot',
        component: StoreUpdateScreen,
        key: "submenu922",
        isShow: false,
        header: null,
        subMenu: [],
        type: 0,
        object: null,
        pathIgnore: ["create"]
      },
    ],
    type: HEADER_TYPE.BUTTON_CREATE,
    object: {
      pathCreate: `${UrlConfig.STORE}/create`
    },
  },
  {
    path: "/printers",
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
    path: "/roles",
    exact: true,
    title: "Quản lý nhóm quyền",
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