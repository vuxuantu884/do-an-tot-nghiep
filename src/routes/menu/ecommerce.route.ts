import UrlConfig from "config/url.config";
import { RouteMenu } from "model/other";
import React from "react";

const Config = React.lazy(() => import("screens/ecommerce/config"));
const ForControl = React.lazy(() => import("screens/ecommerce/for-control"));
const Orders = React.lazy(() => import("screens/ecommerce/orders"));
const Products = React.lazy(() => import("screens/ecommerce/products"));
const Report = React.lazy(() => import("screens/ecommerce/report"));

const ecommerce: Array<RouteMenu> = [
  {
    path: `${UrlConfig.ECOMMERCE}/orders`,
    exact: true,
    title: "Đơn hàng",
    icon: "icon-dot",
    component: Orders,
    key: "submenu400",
    isShow: true,
    header: null,
    subMenu: [],
  },
  {
    path: `${UrlConfig.ECOMMERCE}/products`,
    exact: true,
    title: "Sản phẩm",
    icon: "icon-dot",
    component: Products,
    key: "submenu401",
    isShow: true,
    header: null,
    subMenu: [],
  },
  {
    path: `${UrlConfig.ECOMMERCE}/for-control`,
    exact: true,
    title: "Đối soát",
    icon: "icon-dot",
    component: ForControl,
    key: "submenu402",
    isShow: true,
    header: null,
    subMenu: [],
  },
  {
    path: `${UrlConfig.ECOMMERCE}/report`,
    exact: true,
    title: "Báo cáo",
    icon: "icon-dot",
    component: Report,
    key: "submenu403",
    isShow: true,
    header: null,
    subMenu: [],
  },
  {
    path: `${UrlConfig.ECOMMERCE}/config`,
    exact: true,
    title: "Cấu hình",
    icon: "icon-dot",
    component: Config,
    key: "404",
    isShow: true,
    header: null,
    subMenu: [],
  },
];

export default ecommerce;
