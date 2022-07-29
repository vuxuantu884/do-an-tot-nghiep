import { RouteMenu } from "model/other";
import React from "react";

const OrderPrint = React.lazy(() => import("screens/order-online/print"));
const EcommercePrint = React.lazy(() => import("screens/ecommerce/orders/print"));

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
    path: `/ecommerce/print-preview`,
    exact: true,
    title: "In",
    icon: "icon-dot",
    component: EcommercePrint,
    key: "print",
    isShow: true,
    header: null,
    subMenu: [],
  },
];

export default routesNotShowInMenu;
