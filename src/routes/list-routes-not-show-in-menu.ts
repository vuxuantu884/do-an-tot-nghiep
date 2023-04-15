import { RouteMenu } from "model/other";
import React from "react";
import UrlConfig from "config/url.config";

const OrderPrint = React.lazy(() => import("screens/order-online/print"));
const EcommercePrint = React.lazy(() => import("screens/ecommerce/orders/print"));
const YDpage = React.lazy(() => import("screens/social/YDpage"));
const Unichat = React.lazy(() => import("screens/social/unichat"));

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
  {
    path: UrlConfig.YDPAGE,
    exact: true,
    title: "Kênh Unichat",
    icon: "icon-YDpage",
    component: Unichat,
    key: "social-YDpage",
    isShow: true,
    header: null,
    subMenu: [],
  },
  {
    path: `${UrlConfig.SOCIAL}${UrlConfig.UNICHAT}`,
    exact: true,
    title: "Kênh Unichat",
    icon: "icon-YDpage",
    component: Unichat,
    key: "social-unichat",
    isShow: true,
    header: null,
    subMenu: [],
  },
];

export default routesNotShowInMenu;
