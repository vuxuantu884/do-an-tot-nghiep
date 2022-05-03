import React from "react";
import UrlConfig from "config/url.config";
import { RouteMenu } from "model/other";

const WebAppOrdersSync = React.lazy(() => import("screens/web-app/orders-sync/WebAppOrdersSync"));
const WebAppOrders = React.lazy(() => import("screens/web-app/orders/WebAppOrders"));
const WebAppProducts = React.lazy(() => import("screens/web-app/products/WebAppProducts"));
const WebAppConfig = React.lazy(() => import("screens/web-app/config/WebAppConfig"));

const webAppRoute: Array<RouteMenu> = [
  {
    path: `${UrlConfig.WEB_APP}-orders-sync`,
    exact: true,
    title: "Đồng bộ đơn hàng",
    icon: "icon-dot",
    component: WebAppOrdersSync,
    key: "web-app-orders-sync",
    isShow: true,
    header: null,
    subMenu: [],
    permissions: [],

  },
  {
    path: `${UrlConfig.WEB_APP}-orders`,
    exact: true,
    title: "Danh sách đơn hàng",
    icon: "icon-dot",
    component: WebAppOrders,
    key: "web-app-orders",
    isShow: true,
    header: null,
    subMenu: [],
  },
  {
    path: `${UrlConfig.WEB_APP_PRODUCTS}`,
    exact: true,
    title: "Danh sách sản phẩm",
    icon: "icon-dot",
    component: WebAppProducts,
    key: "web-app-products",
    isShow: true,
    header: null,
    subMenu: [{
      path: `${UrlConfig.WEB_APP_PRODUCTS}/total-item`,
      exact: true,
      title: "Tất cả sản phẩm",
      icon: "icon-dot",
      component: WebAppProducts,
      key: "web-app-all-products",
      isShow: true,
      header: null,
      subMenu: [],
    },{
      path: `${UrlConfig.WEB_APP_PRODUCTS}/connected-item`,
      exact: true,
      title: "Sản phẩm đã ghép",
      icon: "icon-dot",
      component: WebAppProducts,
      key: "web-app-connected-products",
      isShow: true,
      header: null,
      subMenu: [],
    },{
      path: `${UrlConfig.WEB_APP_PRODUCTS}/not-connected-item`,
      exact: true,
      title: "Sản phẩm chưa ghép",
      icon: "icon-dot",
      component: WebAppProducts,
      key: "web-app-not-connected-products",
      isShow: true,
      header: null,
      subMenu: [],
    }],
  },
  {
    path: `${UrlConfig.WEB_APP_CONFIGS}`,
    exact: true,
    title: "Cấu hình",
    icon: "icon-dot",
    component: WebAppConfig,
    key: "web-app-configs",
    isShow: true,
    header: null,
    subMenu: [
      {
        path: `${UrlConfig.WEB_APP_CONFIGS}/shop-list`,
        exact: true,
        title: "Gian hàng",

        icon: "icon-dot",
        component: WebAppConfig,
        key: "web-app-shop-list",
        isShow: true,
        header: null,
        subMenu: [],
      },
      {
        path: `${UrlConfig.WEB_APP_CONFIGS}/config-shop/:id`,
        exact: true,
        title: "Cấu hình gian hàng",
        icon: "icon-dot",
        component: WebAppConfig,
        key: "web-app-config-shop",
        isShow: true,
        header: null,
        subMenu: [],
      },
      {
        path: `${UrlConfig.WEB_APP_CONFIGS}/config-shop`,
        exact: true,
        title: "Cấu hình gian hàng",
        icon: "icon-dot",
        component: WebAppConfig,
        key: "web-app-config-shop",
        isShow: true,
        header: null,
        subMenu: [],
      }
    ],
  },
];

export default webAppRoute;
