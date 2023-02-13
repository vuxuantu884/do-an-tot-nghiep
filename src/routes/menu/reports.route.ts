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

const InventoryBalance = React.lazy(() => import("screens/reports/inventory-balance"));

const GoodsReports = React.lazy(() => import("screens/reports/goods-reports"));
const SellingPowerReport = React.lazy(
  () => import("screens/reports/goods-reports/selling-power-report"),
);
const GrossProfitReport = React.lazy(
  () => import("screens/reports/goods-reports/gross-profit-report"),
);

export const KDOfflineV1Url = "/kd-offline-v1";

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
      {
        path: `${UrlConfig.ANALYTIC_FINACE}/${REPORTS_URL.INVENTORY_BALANCE}`,
        permissions: [],
        exact: true,
        title: "Báo cáo xuất nhập tồn kho",
        icon: "icon-dot",
        component: InventoryBalance,
        key: "menureport5",
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
  {
    path: REPORTS_URL.GOODS,
    permissions: [],
    exact: true,
    title: "Báo cáo hàng hoá",
    icon: "icon-dot",
    component: GoodsReports,
    key: "menureport06",
    isShow: true,
    header: null,
    subMenu: [
      {
        path: REPORTS_URL.SELLING_POWER,
        permissions: [],
        exact: true,
        title: "Báo cáo tồn bán sức bán",
        icon: "icon-dot",
        component: SellingPowerReport,
        key: "menureport061",
        isShow: true,
        header: null,
        subMenu: [],
      },
      {
        path: REPORTS_URL.GROSS_PROFIT,
        permissions: [],
        exact: true,
        title: "Báo cáo lợi nhuận gộp theo mã 3, nhóm hàng",
        icon: "icon-dot",
        component: GrossProfitReport,
        key: "menureport062",
        isShow: true,
        header: null,
        subMenu: [],
      },
    ],
  },
];

export default reports;
