import { HEADER_TYPE } from "config/HeaderConfig";
import { RouteMenu } from "model/other";
import React from "react";

const CreateBill = React.lazy(() => import ("screens/order-online/order-online.screen"))
const ListOrder = React.lazy(() => import ("screens/order-online/index.screen"))

const bill: Array<RouteMenu> = [
  {
    path: "/order-online/create",
    exact: true,
    title: "Tạo đơn Online",
    icon: 'icon-dot',
    component: CreateBill,
    key: "submenu51",
    isShow: true,
    header: null,
    subMenu: [],
    type: HEADER_TYPE.STEP,
    object: null,
  },
  {
    path: "/list-orders",
    exact: true,
    title: "Danh sách đơn hàng",
    icon: 'icon-dot',
    component: ListOrder,
    key: "submenu52",
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
    component: CreateBill,
    key: "submenu53",
    isShow: true,
    header: null,
    subMenu: [],
    type: 0,
    object: null,
  },
]

export default bill;