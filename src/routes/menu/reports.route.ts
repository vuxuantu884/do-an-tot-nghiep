// import { ODERS_PERMISSIONS } from "config/permissions/order.permission";
import UrlConfig from "config/url.config";
import { RouteMenu } from "model/other";
import React from "react";


const ReportOrders = React.lazy(() => import("screens/reports/report-orders"));
const ReportTrackingItems = React.lazy(() => import("screens/reports/report-tracking-items"));
const ReportTransferWarehouse = React.lazy(() => import("screens/reports/report-transfer-warehouse"));


const reports: Array<RouteMenu> = [
  {
    path: `/reports/orders`,
    exact: true,
    title: "Đơn hàng",
    icon: "icon-dot",
    component: ReportOrders,
    key: "submenureport1",
    isShow: true,
    header: null,
    // permissions: [ODERS_PERMISSIONS.CREATE],
    subMenu: [],
  },
  {
    path: `/reports/tracking-items`,
    exact: true,
    title: "Theo dõi hàng về",
    icon: "icon-dot",
    component: ReportTrackingItems,
    key: "submenureport2",
    isShow: true,
    header: null,
    // permissions: [ODERS_PERMISSIONS.CREATE],
    subMenu: [],
  },
  {
    path: `/reports/transfer-warehouse`,
    exact: true,
    title: "Chuyển kho",
    icon: "icon-dot",
    component: ReportTransferWarehouse,
    key: "submenureport3",
    isShow: true,
    header: null,
    // permissions: [ODERS_PERMISSIONS.CREATE],
    subMenu: [],
  },
];

export default reports;
