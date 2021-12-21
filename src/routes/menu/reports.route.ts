// import { ODERS_PERMISSIONS } from "config/permissions/order.permission";
import { RouteMenu } from "model/other";
import React from "react";

const ReportOrdersOnline = React.lazy(() => import("screens/reports/report-orders-online"));
const ReportOrdersOffline = React.lazy(() => import("screens/reports/report-orders-offline"));
const ReportTrackingItems = React.lazy(() => import("screens/reports/report-tracking-items"));
const ReportTransferWarehouse = React.lazy(() => import("screens/reports/report-transfer-warehouse"));


const reports: Array<RouteMenu> = [
  {
    path: `/reports/sales-online`,
    exact: true,
    title: "Bán hàng Online",
    icon: "icon-dot",
    component: ReportOrdersOnline,
    key: "submenureport1",
    isShow: true,
    header: null,
    subMenu: [],
  },
  {
    path: `/reports/sales-offline`,
    exact: true,
    title: "Bán hàng Offline",
    icon: "icon-dot",
    component: ReportOrdersOffline,
    key: "submenureport2",
    isShow: true,
    header: null,
    subMenu: [],
  },
  {
    path: `/reports/tracking-items`,
    exact: true,
    title: "Theo dõi hàng về",
    icon: "icon-dot",
    component: ReportTrackingItems,
    key: "submenureport3",
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
    key: "submenureport4",
    isShow: true,
    header: null,
    // permissions: [ODERS_PERMISSIONS.CREATE],
    subMenu: [],
  },
];

export default reports;
