import UrlConfig from "config/url.config";
import { RouteMenu } from "model/other";
import React from "react";
import OrderUpdate from "screens/order-online/order-update";
import PackSupportScreen from "screens/order-online/pack-support.screen";

const ListOrder = React.lazy(() => import("screens/order-online/index.screen"));
const OrderDetail = React.lazy(() => import("screens/order-online/order-detail"));
const Order = React.lazy(() => import("screens/order-online/order.screen"));
const ReturnOrder = React.lazy(() => import("screens/order-online/return.screen"));
const ScreenReturnCreate = React.lazy(
  () => import("screens/order-online/order-return/create")
);
const ScreenReturnDetail = React.lazy(
  () => import("screens/order-online/order-return/[id]")
);

const FpageCRM = React.lazy(() => import("screens/fpage"));

const bill: Array<RouteMenu> = [
  {
    path: `${UrlConfig.ORDER}/create`,
    exact: true,
    title: "Tạo đơn Online",
    icon: "icon-dot",
    component: Order,
    key: "submenu52",
    isShow: true,
    header: null,
    subMenu: [],
  },
  {
    path: `${UrlConfig.ORDER}`,
    exact: true,
    title: "Danh sách đơn hàng",
    icon: "icon-dot",
    component: ListOrder,
    key: "submenu54",
    isShow: true,
    header: null,
    subMenu: [
      {
        path: `${UrlConfig.ORDER}`,
        exact: true,
        title: "Danh sách đơn hàng",
        icon: "icon-dot",
        component: ListOrder,
        key: "submenu5412",
        isShow: true,
        header: null,
        subMenu: [],
      },
      {
        path: `${UrlConfig.ORDER}/:id`,
        exact: true,
        title: "Chi tiết đơn hàng",
        icon: "icon-dot",
        component: OrderDetail,
        key: "submenu5413",
        isShow: true,
        header: null,
        subMenu: [],
      },
      {
        path: `${UrlConfig.ORDER}/:id/update`,
        exact: true,
        title: "Sửa đơn hàng",
        icon: "icon-dot",
        component: OrderUpdate,
        key: "submenu5414",
        isShow: true,
        header: null,
        subMenu: [],
      },
      {
        path: `${UrlConfig.FPAGE}`,
        exact: true,
        title: "Đơn hàng từ Fpage",
        icon: "icon-dot",
        component: FpageCRM,
        key: "submenu5414",
        isShow: true,
        header: null,
        subMenu: [],
      },
    ],
  },
  {
    path: `/orders-return`,
    exact: true,
    title: "Danh sách trả hàng",
    icon: "icon-dot",
    component: ReturnOrder,
    key: "submenu55",
    isShow: true,
    header: null,
    subMenu: [
      {
        path: `${UrlConfig.ORDERS_RETURN}/create`,
        exact: true,
        title: "Tạo đơn trả hàng",
        icon: "icon-dot",
        component: ScreenReturnCreate,
        key: "create-return",
        isShow: true,
        header: null,
        subMenu: [],
      },
      {
        path: `${UrlConfig.ORDERS_RETURN}/:id`,
        exact: true,
        title: "Chi tiết trả hàng",
        icon: "icon-dot",
        component: ScreenReturnDetail,
        key: "single-return",
        isShow: true,
        header: null,
        subMenu: [],
      },
    ],
  },
  {
    path: `/orders-pack-support`,
    exact: true,
    title: "Đóng gói và biên bản bàn giao",
    icon: "icon-dot",
    component: PackSupportScreen,
    key: "submenu56",
    isShow: true,
    header: null,
    subMenu: [],
  },
];

export default bill;
