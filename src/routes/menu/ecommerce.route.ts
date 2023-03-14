import React from "react";
import UrlConfig from "config/url.config";
import { RouteMenu } from "model/other";
import { EcommerceOrderPermission } from "config/permissions/ecommerce.permission";

const Config = React.lazy(() => import("screens/ecommerce/config"));
const EcommerceOrders = React.lazy(() => import("screens/ecommerce/orders"));
const OrdersMapping = React.lazy(() => import("screens/ecommerce/orders-mapping"));
const Products = React.lazy(() => import("screens/ecommerce/products"));
const ProductsPushing = React.lazy(
  () => import("screens/ecommerce/ecommerce-tools/products-pushing/index"),
);

const PushingDetails = React.lazy(
  () => import("screens/ecommerce/ecommerce-tools/products-pushing/pushing-details"),
);

const Feedbacks = React.lazy(() => import("screens/ecommerce/ecommerce-tools/feedback"));

const AutoReply = React.lazy(() => import("screens/ecommerce/config/auto-reply"));

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
    permissions: ordersMappingViewPermission,
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
    subMenu: [
      {
        path: `${UrlConfig.ECOMMERCE}-products/total-item`,
        exact: true,
        title: "Sản phẩm",
        icon: "icon-dot",
        component: Products,
        key: "submenu402",
        isShow: true,
        header: null,
        subMenu: [],
      },
      {
        path: `${UrlConfig.ECOMMERCE}-products/connected-item`,
        exact: true,
        title: "Sản phẩm",
        icon: "icon-dot",
        component: Products,
        key: "submenu403",
        isShow: true,
        header: null,
        subMenu: [],
      },
      {
        path: `${UrlConfig.ECOMMERCE}-products/not-connected-item`,
        exact: true,
        title: "Sản phẩm",
        icon: "icon-dot",
        component: Products,
        key: "submenu404",
        isShow: true,
        header: null,
        subMenu: [],
      },
    ],
  },
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
  {
    path: `${UrlConfig.ECOMMERCE}-tools`,
    exact: true,
    title: "Công cụ",
    icon: "icon-dot",
    component: ProductsPushing,
    key: "405",
    isShow: true,
    header: null,
    showMenuThird: true,
    subMenu: [
      {
        path: `${UrlConfig.ECOMMERCE}-tools/products-pushing`,
        exact: true,
        title: "Đẩy sản phẩm Shopee",
        icon: "icon-dot",
        component: ProductsPushing,
        key: "406",
        isShow: true,
        header: null,
        subMenu: [
          {
            path: `${UrlConfig.ECOMMERCE}-tools/products-pushing/:id`,
            exact: true,
            title: "Sản phẩm đang đẩy",
            icon: "icon-dot",
            component: PushingDetails,
            key: "407",
            isShow: true,
            header: null,
            subMenu: [],
          },
        ],
      },
      {
        path: `${UrlConfig.ECOMMERCE}-tools/feedbacks`,
        exact: true,
        title: "Phản hồi đánh giá",
        icon: "icon-dot",
        component: Feedbacks,
        key: "408",
        isShow: true,
        header: null,
        subMenu: [],
      },
      {
        path: `${UrlConfig.ECOMMERCE}-tools/auto-reply`,
        exact: true,
        title: "Phản hồi tự động",
        icon: "icon-dot",
        component: AutoReply,
        key: "409",
        isShow: true,
        header: null,
        subMenu: [],
      },
    ],
  },
];

export default ecommerce;
