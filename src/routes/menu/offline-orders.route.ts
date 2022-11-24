import { ORDER_PERMISSIONS } from "config/permissions/order.permission";
import UrlConfig from "config/url.config";
import { RouteMenu } from "model/other";
import React from "react";

const OfflineOrders = React.lazy(() => import("screens/order-online/orders/offline-orders.screen"));
const OfflineReturnOrders = React.lazy(
  () => import("screens/order-online/order-return/offlineReturnOrders"),
);
const offlineOrdersRoute: Array<RouteMenu> = [
  {
    fullUrl: `${process.env.REACT_APP_BASE_POS}`,
    path: `${process.env.REACT_APP_BASE_POS}`,
    exact: true,
    title: "Tạo đơn bán lẻ",
    icon: "icon-dot",
    component: null,
    key: "tao-don-hang-offline",
    isShow: true,
    header: null,
    permissions: [ORDER_PERMISSIONS.READ],
    subMenu: [],
  },
  {
    path: `${UrlConfig.OFFLINE_ORDERS}`,
    exact: true,
    title: "Danh sách bán lẻ",
    icon: "icon-dot",
    component: OfflineOrders,
    key: "danh sách bán lẻ",
    isShow: true,
    header: null,
    permissions: [ORDER_PERMISSIONS.READ],
    subMenu: [],
  },
  {
    path: `${UrlConfig.OFFLINE_ORDERS}${UrlConfig.ORDERS_RETURN}`,
    exact: true,
    title: "Danh sách trả hàng",
    icon: "icon-dot",
    component: OfflineReturnOrders,
    key: "danh-sach-tra-hang-offline",
    isShow: true,
    header: null,
    permissions: [ORDER_PERMISSIONS.READ_RETURNS],
    subMenu: [],
  },
];

export default offlineOrdersRoute;
