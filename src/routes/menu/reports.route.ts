import { ReportPermissions } from "config/permissions/report.permisstion";
import UrlConfig, { REPORTS_URL } from "config/url.config";
import { RouteMenu } from "model/other";
import React from "react";

const Analytics = React.lazy(() => import("screens/reports/analytics/index"));
const ReadCustomizeAnalytics = React.lazy(
  () => import("screens/reports/analytics/read-customize/index"),
);
const ReadTemplateAnalytics = React.lazy(
  () => import("screens/reports/analytics/read-template/index"),
);
const CustomerVisitors = React.lazy(
  () => import("screens/reports/analytics/shared/customer-visitors"),
);
const KeyDriverOffline = React.lazy(() => import("screens/reports/key-driver-offline"));
const KeyDriverOfflineStore = React.lazy(
  () => import("screens/reports/key-driver-offline/key-driver-offline-store"),
);
const KeyDriverOfflineStaff = React.lazy(
  () => import("screens/reports/key-driver-offline/key-driver-offline-staff"),
);

const KeyDriverOnline = React.lazy(() => import("screens/reports/key-driver-online"));
const KeyDriverOnlineCounter = React.lazy(
  () => import("screens/reports/key-driver-online/key-counter"),
);

const PotentialImporting = React.lazy(
  () => import("screens/reports/key-driver-offline/potential-importing"),
);

const reports: Array<RouteMenu> = [
  {
    path: `${UrlConfig.ANALYTIC_SALES_OFFLINE}`,
    exact: true,
    title: "Báo cáo bán lẻ",
    icon: "icon-dot",
    component: Analytics,
    key: "menureport0",
    isShow: true,
    header: null,
    permissions: [ReportPermissions.report_pos],
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
        path: `${UrlConfig.ANALYTIC_SALES_OFFLINE}/:id`,
        permissions: [ReportPermissions.report_pos],
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
        path: `${UrlConfig.ANALYTIC_SALES_OFFLINE}/customer-visitors`,
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
    path: `${UrlConfig.ANALYTIC_SALES_ONLINE}`,
    exact: true,
    title: "Báo cáo đơn hàng",
    icon: "icon-dot",
    component: Analytics,
    key: "menureport01",
    isShow: true,
    header: null,
    permissions: [ReportPermissions.report_sales],
    subMenu: [
      {
        path: `${UrlConfig.ANALYTICS}/:id`,
        exact: true,
        title: "Xem báo cáo tuỳ chỉnh",
        icon: "icon-dot",
        component: ReadCustomizeAnalytics,
        key: "submenureport011",
        isShow: true,
        header: null,
        subMenu: [],
      },
      {
        path: `${UrlConfig.ANALYTIC_SALES_ONLINE}/:id`,
        permissions: [ReportPermissions.report_sales],
        exact: true,
        title: "Mẫu báo cáo bán hàng",
        icon: "icon-dot",
        component: ReadTemplateAnalytics,
        key: "submenureport012",
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
    permissions: [ReportPermissions.report_costs],
    subMenu: [
      {
        path: `${UrlConfig.ANALYTIC_FINACE}/:id`,
        permissions: [ReportPermissions.report_costs],
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
    permissions: [ReportPermissions.repost_customers],
    subMenu: [
      {
        path: `${UrlConfig.ANALYTIC_CUSTOMER}/:id`,
        permissions: [ReportPermissions.repost_customers],
        exact: true,
        title: "Mẫu báo cáo khách hàng",
        icon: "icon-dot",
        component: ReadTemplateAnalytics,
        key: "submenureport21",
        isShow: true,
        header: null,
        subMenu: [],
      },
      {
        path: `${UrlConfig.KEY_DRIVER_OFFLINE}`,
        exact: true,
        title: "Báo cáo Kết quả kinh doanh offline",
        icon: "icon-dot",
        component: KeyDriverOffline,
        key: "menureport05",
        isShow: true,
        header: null,
        subMenu: [
          {
            path: `${UrlConfig.KEY_DRIVER_OFFLINE}/:asmName`,
            exact: true,
            title: "Báo cáo Kết quả kinh doanh offline các cửa hàng",
            icon: "icon-dot",
            component: KeyDriverOfflineStore,
            key: "submenureport051",
            isShow: true,
            header: null,
            subMenu: [],
          },
          {
            path: `${UrlConfig.KEY_DRIVER_OFFLINE}/:asmName/:storeName`,
            exact: true,
            title: "Báo cáo Kết quả kinh doanh offline các NV cửa hàng",
            icon: "icon-dot",
            component: KeyDriverOfflineStaff,
            key: "submenureport052",
            isShow: true,
            header: null,
            subMenu: [],
          },
          {
            path: `${UrlConfig.KEY_DRIVER_OFFLINE}/potential-importing`,
            exact: true,
            title: "Nhập file khách hàng tiềm năng",
            icon: "icon-dot",
            component: PotentialImporting,
            key: "submenureport053",
            isShow: true,
            header: null,
            subMenu: [],
          },
        ],
      },
      {
        path: `${UrlConfig.KEY_DRIVER_ONLINE}`,
        exact: true,
        title: "Báo cáo Kết quả kinh doanh online",
        icon: "icon-dot",
        component: KeyDriverOnline,
        key: "menureport6",
        isShow: true,
        header: null,
        subMenu: [],
      },
      {
        path: `${UrlConfig.KEY_DRIVER_ONLINE}/key-counter`,
        exact: true,
        title: "Nhập kết quả kinh doanh online",
        icon: "icon-dot",
        component: KeyDriverOnlineCounter,
        key: "menureport7",
        isShow: true,
        header: null,
        subMenu: [],
      },
    ],
  },
  {
    path: REPORTS_URL.MARKETING,
    permissions: [ReportPermissions.report_marketing],
    exact: true,
    title: "Báo cáo marketing",
    icon: "icon-dot",
    component: Analytics,
    key: "menureport3",
    isShow: true,
    header: null,
    subMenu: [
      {
        path: `${REPORTS_URL.MARKETING}/:id`,
        permissions: [ReportPermissions.report_marketing],
        exact: true,
        title: "Mẫu báo cáo marketing",
        icon: "icon-dot",
        component: ReadTemplateAnalytics,
        key: "submenureport31",
        isShow: true,
        header: null,
        subMenu: [],
      },
    ],
  },
];

export default reports;
