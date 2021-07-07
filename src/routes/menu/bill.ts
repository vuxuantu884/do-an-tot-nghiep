import { HEADER_TYPE } from "config/HeaderConfig";
import { RouteMenu } from "model/other";
import React from "react";

const ListOrder = React.lazy(() => import ("screens/order-online/index.screen"))
const OrderDetail = React.lazy(() => import ("screens/order-online/order-detail"))
const Order = React.lazy(() => import ("screens/order-online/order.screen"))

const bill: Array<RouteMenu> = [
  {
    path: "/order-online/create-order",
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
    path: `/order-online/detail/:id`,
    exact: true,
    title: "Chi tiết đơn hàng",
    icon: 'icon-dot',
    component: OrderDetail,
    key: "submenu53",
    isShow: false,
    header: null,
    subMenu: [],
    type: 0,
    object: null,
  },
  {
    path: "/list-orders",
    exact: true,
    title: "Danh sách đơn hàng",
    icon: 'icon-dot',
    component: ListOrder,
    key: "submenu54",
    isShow: true,
    header: null,
    subMenu: [],
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