import { HEADER_TYPE } from "config/HeaderConfig";
import { RouteMenu } from "model/other";
import React from "react";

const CreateBill = React.lazy(() => import ("screens/bill/create-bill"))


const bill: Array<RouteMenu> = [
  {
    path: "/bill/create",
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
    path: "/bill",
    exact: true,
    title: "Danh sách đon hàng",
    icon: 'icon-dot',
    component: CreateBill,
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