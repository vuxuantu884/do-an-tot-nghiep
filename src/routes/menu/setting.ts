import UrlConfig from "config/UrlConfig";
import React from "react";
import { RouteMenu } from "model/other";
import { HEADER_TYPE } from "config/HeaderConfig";

const ManageUserScreen = React.lazy(
  () => import("screens/account/account.search.screen")
);
// const ManageStoreScreen = React.lazy(
//   () => import("screens/setting/manage-store.screen")
// );
const RoleListScreen = React.lazy(
  () => import("screens/roles/role-list.screen")
);
const RoleCreateScreen = React.lazy(
  () => import("screens/roles/role-create.screen")
);
const AccountCreateScreen = React.lazy(
  () => import("screens/account/account.create.screen")
);
const AccountUpdateScreen = React.lazy(
  () => import("screens/account/account.update.screen")
);

//store
const StoreCreateScreen = React.lazy(
  () => import("screens/store/store-create.screen")
);
const StoreListScreen = React.lazy(
  () => import("screens/store/store-list.screen")
);
const StoreUpdateScreen = React.lazy(
  () => import("screens/store/store-update.screen")
);

// fulfillment: quản lý đơn hàng
const SettingFulfillmentScreen = React.lazy(
  () => import("screens/order-online/settings/order-processing-status")
);

// order sources: quản lý nguồn đơn hàng
const SettingOrderSourcesScreen = React.lazy(
  () => import("screens/order-online/settings/order-sources")
);

// printer: quản lý mẫu in
const SettingPrinterScreen = React.lazy(
  () => import("screens/settings/printer")
);
const SettingCreatePrinterScreen = React.lazy(
  () => import("screens/settings/printer/create")
);
const SettingSinglePrinterScreen = React.lazy(
  () => import("screens/settings/printer/id")
);

const setting: Array<RouteMenu> = [
  {
    path: UrlConfig.ACCOUNTS,
    exact: true,
    title: "Quản lý người dùng",
    icon: "icon-dot",
    component: ManageUserScreen,
    key: "submenu91",
    isShow: true,
    header: null,
    subMenu: [
      {
        path: `${UrlConfig.ACCOUNTS}/create`,
        exact: true,
        title: "Thêm mới người dùng",
        icon: "icon-dot",
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
        icon: "icon-dot",
        component: AccountUpdateScreen,
        key: "account2",
        isShow: true,
        header: null,
        subMenu: [],
        type: 0,
        object: null,
        pathIgnore: ["create"],
      },
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
    icon: "icon-dot",
    component: StoreListScreen,
    key: "submenu92",
    isShow: true,
    header: null,
    subMenu: [
      {
        path: `${UrlConfig.STORE}/create`,
        exact: true,
        title: "Thêm cửa hàng",
        icon: "icon-dot",
        component: StoreCreateScreen,
        key: "submenu921",
        isShow: true,
        header: null,
        subMenu: [],
        type: 0,
        object: null,
      },
      {
        path: `${UrlConfig.STORE}/:id`,
        exact: true,
        title: "Sửa cửa hàng",
        icon: "icon-dot",
        component: StoreUpdateScreen,
        key: "submenu922",
        isShow: true,
        header: null,
        subMenu: [],
        type: 0,
        object: null,
        pathIgnore: ["create"],
      },
    ],
    type: HEADER_TYPE.BUTTON_CREATE,
    object: {
      pathCreate: `${UrlConfig.STORE}/create`,
    },
  },
  {
    path: UrlConfig.PRINTER,
    exact: true,
    title: "Quản lý mẫu in",
    icon: "icon-dot",
    component: SettingPrinterScreen,
    key: "submenu93",
    isShow: true,
    header: null,
    subMenu: [
      {
        path: `${UrlConfig.PRINTER}/create`,
        exact: true,
        title: "Thêm mới mẫu in",
        icon: "icon-dot",
        component: SettingCreatePrinterScreen,
        key: "submenu262",
        isShow: true,
        header: null,
        subMenu: [],
        type: 0,
        object: null,
      },
      {
        path: `${UrlConfig.PRINTER}/:id`,
        exact: true,
        title: "Sửa mẫu in",
        icon: "icon-dot",
        component: SettingSinglePrinterScreen,
        key: "submenu263",
        isShow: true,
        header: null,
        subMenu: [],
        type: 0,
        object: null,
        pathIgnore: ["create"],
      },
    ],
    type: 0,
    object: null,
  },
  {
    path: UrlConfig.ROLES,
    exact: true,
    title: "Quản lý nhóm quyền",
    icon: "icon-dot",
    component: RoleListScreen,
    key: "submenu94",
    isShow: true,
    header: null,
    subMenu: [
      {
        path: `${UrlConfig.ROLES}/create`,
        exact: true,
        title: "Thêm mới nhóm quyền",
        icon: "icon-dot",
        component: RoleCreateScreen,
        key: "submenu941",
        isShow: true,
        header: null,
        subMenu: [],
        type: 0,
        object: null,
      },
    ],
    type: 0,
    object: null,
  },
  {
    path: UrlConfig.ORDER_PROCESSING_STATUS,
    exact: true,
    title: "Xử lý đơn hàng",
    subTitle: "Thiết lập quy trình xử lý đơn hàng",
    icon: "icon-dot",
    component: SettingFulfillmentScreen,
    key: "submenu95",
    isShow: true,
    header: null,
    subMenu: [
      {
        path: `${UrlConfig.ORDER_PROCESSING_STATUS}/create`,
        exact: true,
        title: "Thêm mới đơn hàng",
        icon: "icon-dot",
        component: SettingFulfillmentScreen,
        key: "submenu261",
        isShow: true,
        header: null,
        subMenu: [],
        type: 0,
        object: null,
      },
    ],
    type: HEADER_TYPE.BUTTON_CREATE,
    object: {
      pathCreate: `${UrlConfig.ORDER_PROCESSING_STATUS}/create`,
    },
  },
  {
    path: UrlConfig.ORDER_SOURCES,
    exact: true,
    title: "Nguồn đơn hàng",
    subTitle: "Thêm và quản lý nguồn tạo ra đơn hàng",
    icon: "icon-dot",
    component: SettingOrderSourcesScreen,
    key: "submenu96",
    isShow: true,
    header: null,
    subMenu: [
      {
        path: `${UrlConfig.ORDER_SOURCES}/create`,
        exact: true,
        title: "Thêm mới nguồn đơn hàng",
        icon: "icon-dot",
        component: AccountCreateScreen,
        key: "submenu261",
        isShow: true,
        header: null,
        subMenu: [],
        type: 0,
        object: null,
      },
      {
        path: `${UrlConfig.ORDER_SOURCES}/:id`,
        exact: true,
        title: "Chỉnh sửa nguồn đơn hàng",
        icon: "icon-dot",
        component: AccountUpdateScreen,
        key: "account2",
        isShow: true,
        header: null,
        subMenu: [],
        type: 0,
        object: null,
        pathIgnore: ["create"],
      },
    ],
    type: HEADER_TYPE.BUTTON_CREATE,
    object: {
      pathCreate: `${UrlConfig.ORDER_PROCESSING_STATUS}/create`,
    },
  },
];

export default setting;
