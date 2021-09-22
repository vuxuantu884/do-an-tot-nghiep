import UrlConfig from "config/url.config";
import { RouteMenu } from "model/other";
import React from "react";

const ListOrder = React.lazy(() => import("screens/order-online/index.screen"));
const OrderDetail = React.lazy(
  () => import("screens/order-online/order-detail")
);
const Order = React.lazy(() => import("screens/order-online/order.screen"));
const ReturnOrder = React.lazy(
  () => import("screens/order-online/return.screen")
);
const ScreenReturnCreate = React.lazy(
  () => import("screens/order-online/OrderReturn/create")
);
const ScreenReturnDetail = React.lazy(
  () => import("screens/order-online/OrderReturn/[id]")
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
    path: `${UrlConfig.ORDER}/list`,
    exact: true,
    title: "Danh sách đơn hàng",
    icon: "icon-dot",
    component: ListOrder,
    key: "submenu54",
    isShow: true,
    header: null,
    subMenu: [
      {
        path: `${UrlConfig.ORDER}/list`,
        exact: true,
        title: "Chi tiết đơn hàng",
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
        path: `${UrlConfig.ORDER}/orders-return/create`,
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
        path: `${UrlConfig.ORDER}/orders-return/:id`,
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
    path: "/bill/return",
    exact: true,
    title: "Trả hàng",
    icon: "icon-dot",
    component: Order,
    key: "submenu56",
    isShow: true,
    header: null,
    subMenu: [],
  },
];

export default bill;
