import { HEADER_TYPE } from "config/HeaderConfig";
import UrlConfig from "config/UrlConfig";
import { RouteMenu } from "model/other";
import React from "react";

const ListOrder = React.lazy(() => import ("screens/order-online/index.screen"))
const OrderDetail = React.lazy(() => import ("screens/order-online/order-detail"))
const Order = React.lazy(() => import ("screens/order-online/order.screen"))

const bill: Array<RouteMenu> = [
  {
    path: `${UrlConfig.ORDER}/create`,
    exact: true,
    title: "Tạo đơn Online",
    icon: 'icon-dot',
    component: Order,
    key: "submenu52",
    isShow: true,
    header: null,
    subMenu: [],
    type: HEADER_TYPE.STEP,
    object: null,
  },
  {
    path: `${UrlConfig.ORDER}/list`,
    exact: true,
    title: "Danh sách đơn hàng",
    icon: 'icon-dot',
    component: ListOrder,
    key: "submenu54",
    isShow: true,
    header: null,
    subMenu: [
      {
        path: `${UrlConfig.ORDER}/:id`,
        exact: true,
        title: "Chi tiết đơn hàng",
        icon: 'icon-dot',
        component: OrderDetail,
        key: "submenu5412",
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
    path: "/bill/return",
    exact: true,
    title: "Trả hàng",
    icon: 'icon-dot',
    component: Order,
    key: "submenu55",
    isShow: true,
    header: null,
    subMenu: [],
    type: 0,
    object: null,
  },
]

export default bill;