import UrlConfig from "config/url.config";
import { RouteMenu } from "model/other";
import React from "react";

const ListFulfillmentScreen = React.lazy(
  () => import("screens/order-online/list-shipments")
);

const shipments: Array<RouteMenu> = [
  {
    path: `${UrlConfig.SHIPMENTS}`,
    exact: true,
    title: "Danh sách đơn giao",
    icon: "icon-dot",
    component: ListFulfillmentScreen,
    key: "submenu66",
    isShow: true,
    header: null,
    subMenu: [],
  },
  {
    path: `${UrlConfig.SHIPMENTS}/create1`,
    exact: true,
    title: "Cấu hình HVC",
    icon: "icon-dot",
    component: ListFulfillmentScreen,
    key: "submenu67",
    isShow: true,
    header: null,
    subMenu: [],
  },
  {
    path: `${UrlConfig.SHIPMENTS}/create2`,
    exact: true,
    title: "Cấu hình phí giao hàng",
    icon: "icon-dot",
    component: ListFulfillmentScreen,
    key: "submenu68",
    isShow: true,
    header: null,
    subMenu: [],
  },
];

export default shipments;
