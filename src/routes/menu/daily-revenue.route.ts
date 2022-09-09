import { AppConfig } from "config/app.config";
import { DAILY_REVENUE_PERMISSIONS } from "config/permissions/daily-revenue.permission";
import UrlConfig from "config/url.config";
import { RouteMenu } from "model/other";
import React from "react";

const DailyRevenueDetailScreen = React.lazy(
  () => import("screens/DailyRevenue/DailyRevenueDetail"),
);
const DailyRevenueListScreen = React.lazy(() => import("screens/DailyRevenue/daily-revenue-list"));
const DailyRevenueToday = React.lazy(() => import("screens/DailyRevenue/DailyRevenueToday"));
const ExpenditureListScreen = React.lazy(
  () => import("screens/DailyRevenue/expenditure/expenditure-list"),
);
const DailyRevenueImport = React.lazy(() => import("screens/DailyRevenue/DailyRevenueImport"));
const isHiddenMenuEnvPro = AppConfig.ENV === "PROD" ? false : true;
const dailyRevenueRoute: Array<RouteMenu> = [
  {
    path: `${UrlConfig.DAILY_REVENUE}`,
    exact: true,
    title: "Danh sách phiếu",
    icon: "icon-dot",
    component: DailyRevenueListScreen,
    key: "danh-sach-tong-ket-ca",
    isShow: isHiddenMenuEnvPro,
    header: null,
    permissions: [DAILY_REVENUE_PERMISSIONS.daily_payments_read],
    subMenu: [
      {
        path: `${UrlConfig.DAILY_REVENUE}/:id`,
        exact: true,
        title: "Chi tiết tổng kết ca",
        icon: "icon-dot",
        component: DailyRevenueDetailScreen,
        key: "chi-tiet-tong-ket-ca",
        isShow: true,
        header: null,
        permissions: [DAILY_REVENUE_PERMISSIONS.daily_payments_read],
        subMenu: [],
      },
      {
        path: `${UrlConfig.DAILY_REVENUE}/import/:type`,
        exact: true,
        title: "Nhập file",
        icon: "icon-dot",
        component: DailyRevenueImport,
        key: "nhap-file-tong-ket-ca",
        isShow: true,
        header: null,
        subMenu: [],
      },
    ],
  },

  {
    path: `${UrlConfig.DAILY_REVENUE}/today`,
    exact: true,
    title: "Phiếu hôm nay",
    icon: "icon-dot",
    component: DailyRevenueToday,
    key: "phieu-tong-ket-ca-hom-nay",
    isShow: isHiddenMenuEnvPro,
    header: null,
    permissions: [DAILY_REVENUE_PERMISSIONS.daily_payments_read],
    subMenu: [],
  },

  {
    path: `${UrlConfig.EXPENDITURE}`,
    exact: true,
    title: "Danh sách phiếu thu chi",
    icon: "icon-dot",
    component: ExpenditureListScreen,
    key: "danh-sach-phieu-thu-chi",
    isShow: false,
    header: null,
    subMenu: [],
  },
];

export default dailyRevenueRoute;
