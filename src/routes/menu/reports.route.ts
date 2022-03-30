// import { ODERS_PERMISSIONS } from "config/permissions/order.permission";
import UrlConfig from "config/url.config";
import { RouteMenu } from "model/other";
import React from "react";


// const ReportOrdersOnline = React.lazy(() => import("screens/reports/report-orders-online"));
// const ReportOrdersOffline = React.lazy(() => import("screens/reports/report-orders-offline"));
// const ReportTrackingItems = React.lazy(() => import("screens/reports/report-tracking-items"));
// const ReportTransferWarehouse = React.lazy(
//   () => import("screens/reports/report-transfer-warehouse")
// );
const Analytics = React.lazy(() => import("screens/reports/analytics/index"));
const ReadCustomizeAnalytics = React.lazy(
  () => import("screens/reports/analytics/read-customize/index")
);
const ReadTemplateAnalytics = React.lazy(
  () => import("screens/reports/analytics/read-template/index")
);
const CustomerVisitors = React.lazy(
  () => import("screens/reports/analytics/shared/customer-visitors")
);

const reports: Array<RouteMenu> = [
  {
    path: `${UrlConfig.ANALYTIC_SALES}`,
    exact: true,
    title: "Báo cáo bán hàng",
    icon: "icon-dot",
    component: Analytics,
    key: "menureport0",
    isShow: true,
    header: null,
    subMenu: [
      {
        path: `${UrlConfig.ANALYTICS}/:id`,
        exact: true,
        title: "Xem báo cáo tuỳ chỉnh",
        icon: "icon-dot",
        component: ReadCustomizeAnalytics,
        key: "submenureport01",
        isShow: true,
        header: null,
        subMenu: [],
      },
      {
        path: `${UrlConfig.ANALYTIC_SALES}/:id`,
        exact: true,
        title: "Mẫu báo cáo bán hàng",
        icon: "icon-dot",
        component: ReadTemplateAnalytics,
        key: "submenureport02",
        isShow: true,
        header: null,
        subMenu: [],
      },
      {
        path: `${UrlConfig.ANALYTIC_SALES}/customer-visitors`,
        exact: true,
        title: "Nhập số lượng khách vào cửa hàng",
        icon: "icon-dot",
        component: CustomerVisitors,
        key: "submenureport03",
        isShow: true,
        header: null,
        subMenu: [],
      },
    ],
  },
  {
    path: `${UrlConfig.ANALYTIC_FINACE}`,
    exact: true,
    title: "Báo cáo tài chính",
    icon: "icon-dot",
    component: Analytics,
    key: "menureport1",
    isShow: true,
    header: null,
    subMenu: [
      {
        path: `${UrlConfig.ANALYTIC_FINACE}/:id`,
        exact: true,
        title: "Mẫu báo cáo tài chính",
        icon: "icon-dot",
        component: ReadTemplateAnalytics,
        key: "submenureport12",
        isShow: true,
        header: null,
        subMenu: [],
      },
    ],
  },
  {
    path: `${UrlConfig.ANALYTIC_CUSTOMER}`,
    exact: true,
    title: "Báo cáo khách hàng",
    icon: "icon-dot",
    component: Analytics,
    key: "menureport2",
    isShow: true,
    header: null,
    subMenu: [
      {
        path: `${UrlConfig.ANALYTIC_CUSTOMER}/:id`,
        exact: true,
        title: "Mẫu báo cáo khách hàng",
        icon: "icon-dot",
        component: ReadTemplateAnalytics,
        key: "submenureport21",
        isShow: true,
        header: null,
        subMenu: [],
      },
    ],
  },
  // {
  //   path: `/reports/sales-online`,
  //   exact: true,
  //   title: "Bán hàng Online",
  //   icon: "icon-dot",
  //   component: ReportOrdersOnline,
  //   key: "submenureport1",
  //   isShow: true,
  //   header: null,
  //   subMenu: [],
  // },
  // {
  //   path: `/reports/sales-offline`,
  //   exact: true,
  //   title: "Bán hàng Offline",
  //   icon: "icon-dot",
  //   component: ReportOrdersOffline,
  //   key: "submenureport2",
  //   isShow: true,
  //   header: null,
  //   subMenu: [],
  // },
  // {
  //   path: `/reports/tracking-items`,
  //   exact: true,
  //   title: "Theo dõi hàng về",
  //   icon: "icon-dot",
  //   component: ReportTrackingItems,
  //   key: "submenureport3",
  //   isShow: true,
  //   header: null,
  //   // permissions: [ODERS_PERMISSIONS.CREATE],
  //   subMenu: [],
  // },
  // {
  //   path: `/reports/transfer-warehouse`,
  //   exact: true,
  //   title: "Chuyển kho",
  //   icon: "icon-dot",
  //   component: ReportTransferWarehouse,
  //   key: "submenureport4",
  //   isShow: true,
  //   header: null,
  //   // permissions: [ODERS_PERMISSIONS.CREATE],
  //   subMenu: [],
  // },
];

export default reports;
