import { HEADER_TYPE } from "config/HeaderConfig";
import UrlConfig from "config/UrlConfig";
import { RouteMenu } from "model/other";
import React from "react";

const customer = React.lazy(() => import ("screens/customer/index"))
const customergroup = React.lazy(() => import ("screens/customer/customer.group"))
const customers: Array<RouteMenu> = [
  {
    path: `${UrlConfig.CUSTOMER}/list`,
    exact: true,
    title: "Danh sách khách hàng",
    icon: 'icon-dot',
    component: customer,
    key: "submenu152",
    isShow: true,
    header: null,
    subMenu: [],
    type: HEADER_TYPE.STEP,
    object: null,
  },
  {
    path: `${UrlConfig.CUSTOMER}/group`,
    exact: true,
    title: "Nhóm khách hàng",
    icon: 'icon-dot',
    component: customergroup,
    key: "submenu155",
    isShow: true,
    header: null,
    subMenu: [],
    type: 0,
    object: null,
  },
]

export default customers;