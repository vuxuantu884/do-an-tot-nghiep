import React from "react";
import UrlConfig from "config/url.config";
import { RouteMenu } from "model/other";
import { EcommerceOrderPermission } from "config/permissions/ecommerce.permission";

const Config = React.lazy(() => import("screens/ecommerce/config"));
const EcommerceOrders = React.lazy(() => import("screens/ecommerce/orders"));
const OrdersMapping = React.lazy(() => import("screens/ecommerce/orders-mapping"));
const Products = React.lazy(() => import("screens/ecommerce/products"));

//@todo: implement later
// const ForControl = React.lazy(() => import("screens/ecommerce/for-control"));
// const Report = React.lazy(() => import("screens/ecommerce/report"));


const ordersMappingViewPermission = [EcommerceOrderPermission?.orders_mapping_view];


const ecommerce: Array<RouteMenu> = [
  {
    path: `${UrlConfig.ECOMMERCE}-orders-mapping`,
    exact: true,
    title: "Đồng bộ đơn hàng",
    icon: "icon-dot",
    component: OrdersMapping,
    key: "manage_orders",
    isShow: true,
    header: null,
    subMenu: [],
    permissions: ordersMappingViewPermission
  },
  {
    path: `${UrlConfig.ECOMMERCE}-orders`,
    exact: true,
    title: "Danh sách đơn hàng",
    icon: "icon-dot",
    component: EcommerceOrders,
    key: "ecommerce_orders",
    isShow: true,
    header: null,
    subMenu: [],
  },
  {
    path: `${UrlConfig.ECOMMERCE}-products`,
    exact: true,
    title: "Danh sách sản phẩm",
    icon: "icon-dot",
    component: Products,
    key: "submenu401",
    isShow: true,
    header: null,
    subMenu: [{
      path: `${UrlConfig.ECOMMERCE}-products/total-item`,
      exact: true,
      title: "Sản phẩm",
      icon: "icon-dot",
      component: Products,
      key: "submenu402",
      isShow: true,
      header: null,
      subMenu: [],
    },{
      path: `${UrlConfig.ECOMMERCE}-products/connected-item`,
      exact: true,
      title: "Sản phẩm",
      icon: "icon-dot",
      component: Products,
      key: "submenu403",
      isShow: true,
      header: null,
      subMenu: [],
    },{
      path: `${UrlConfig.ECOMMERCE}-products/not-connected-item`,
      exact: true,
      title: "Sản phẩm",
      icon: "icon-dot",
      component: Products,
      key: "submenu404",
      isShow: true,
      header: null,
      subMenu: [],
    }],
  },
  //@todo: implement later
  // {
  //   path: `${UrlConfig.ECOMMERCE}/for-control`,
  //   exact: true,
  //   title: "Đối soát",
  //   icon: "icon-dot",
  //   component: ForControl,
  //   key: "submenu402",
  //   isShow: true,
  //   header: null,
  //   subMenu: [],
  // },
  // {
  //   path: `${UrlConfig.ECOMMERCE}/report`,
  //   exact: true,
  //   title: "Báo cáo",
  //   icon: "icon-dot",
  //   component: Report,
  //   key: "submenu403",
  //   isShow: true,
  //   header: null,
  //   subMenu: [],
  // },
  {
    path: `${UrlConfig.ECOMMERCE}-configs`,
    exact: true,
    title: "Cấu hình gian hàng",
    icon: "icon-dot",
    component: Config,
    key: "404",
    isShow: true,
    header: null,
    subMenu: [],
  },
];

export default ecommerce;
