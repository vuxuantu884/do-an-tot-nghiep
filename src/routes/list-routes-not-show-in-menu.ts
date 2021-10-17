import UrlConfig from "config/url.config";
import { RouteMenu } from "model/other";
import React from "react";

const OrderPrint = React.lazy(() => import("screens/order-online/print"));
const PrintTicket = React.lazy(() => import("screens/inventory/PrintTicket"));

const routesNotShowInMenu: Array<RouteMenu> = [
  {
    path: `/orders/print-preview`,
    exact: true,
    title: "In",
    icon: "icon-dot",
    component: OrderPrint,
    key: "print",
    isShow: true,
    header: null,
    subMenu: [],
  },
  {
    path: `${UrlConfig.INVENTORY_TRANSFER}/print-preview`,
    exact: true,
    title: "Chuyển hàng",
    icon: "icon-dot",
    component: PrintTicket,
    key: "submenu31",
    isShow: true,
    header: null,
    subMenu: [],
  },
];

export default routesNotShowInMenu;
