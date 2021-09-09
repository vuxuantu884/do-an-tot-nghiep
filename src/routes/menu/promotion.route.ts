import UrlConfig from "config/url.config";
import { RouteMenu } from "model/other";
import React from "react";

const accumulate = React.lazy(() => import ("screens/loyalty/accumulate/index"))
const loyaltyPage = React.lazy(() => import ("screens/loyalty/index"))
const loyaltyAccumulateDetail = React.lazy(() => import ("screens/loyalty/accumulate/detail"))

const promotion: Array<RouteMenu> = [
  {
    path: `${UrlConfig.PROMOTION}${UrlConfig.LOYALTY}`,
    exact: true,
    title: "Danh sách chương trình",
    icon: 'icon-dot',
    component: loyaltyPage,
    key: "submenu105",
    isShow: true,
    header: null,
    subMenu: [
      {
        path: `${UrlConfig.PROMOTION}${UrlConfig.LOYALTY}`,
        exact: true,
        title: "Cấu hình tích điểm",
        icon: 'icon-dot',
        component: loyaltyPage,
        key: "submenu103",
        isShow: true,
        header: null,
        subMenu: [
          {
            path: `${UrlConfig.PROMOTION}${UrlConfig.LOYALTY}/accumulation`,
            exact: true,
            title: "Tạo cấu hình tích điểm",
            icon: "icon-dot",
            component: accumulate,
            key: "submenu1032",
            isShow: true,
            header: null,
            subMenu: [],
          },
          {
            path: `${UrlConfig.PROMOTION}${UrlConfig.LOYALTY}/accumulation/:id`,
            exact: true,
            title: "Chi tiết cấu hình tích điểm",
            icon: "icon-dot",
            component: loyaltyAccumulateDetail,
            key: "submenu1031",
            isShow: true,
            header: null,
            subMenu: [],
          },
          {
            path: `${UrlConfig.PROMOTION}${UrlConfig.LOYALTY}/accumulation/:id/update`,
            exact: true,
            title: "Cập nhật cấu hình tích điểm",
            icon: "icon-dot",
            component: accumulate,
            key: "submenu1033",
            isShow: true,
            header: null,
            subMenu: [],
          }
        ],
      },
    ],
  },
]

export default promotion;