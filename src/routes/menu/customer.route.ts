import UrlConfig from "config/url.config";
import { RouteMenu } from "model/other";
import React from "react";

const customer = React.lazy(() => import ("screens/customer/index"))
const customergroup = React.lazy(() => import ("screens/customer/customer-group"))
const loyaltyCard = React.lazy(() => import ("screens/loyalty-card"))
const uploadLoyaltyCard = React.lazy(() => import ("screens/loyalty-card/upload"))
const rank = React.lazy(() => import ("screens/ranking/index"))
const createRank = React.lazy(() => import ("screens/ranking/component/create/index"))
const pointAdjustment = React.lazy(() => import ("screens/customer/point-adjustment/index"))

const customers: Array<RouteMenu> = [
  {
    path: `${UrlConfig.CUSTOMER}`,
    exact: true,
    title: "Danh sách khách hàng",
    icon: 'icon-dot',
    component: customer,
    key: "submenu152",
    isShow: true,
    header: null,
    subMenu: [],
  },
  {
    path: `${UrlConfig.CUSTOMER}/groups`,
    exact: true,
    title: "Nhóm khách hàng",
    icon: 'icon-dot',
    component: customergroup,
    key: "submenu155",
    isShow: true,
    header: null,
    subMenu: [],
  },
  {
    path: `${UrlConfig.CUSTOMER}/cards`,
    exact: true,
    title: "Thẻ khách hàng",
    icon: "icon-dot",
    component: loyaltyCard,
    key: "submenu156",
    isShow: true,
    header: null,
    subMenu: [
      {
        path: `${UrlConfig.CUSTOMER}/cards/upload`,
        exact: true,
        title: "Thẻ khách hàng",
        icon: "icon-dot",
        component: uploadLoyaltyCard,
        key: "submenu1561",
        isShow: true,
        header: null,
        subMenu: [],
      }
    ],
  },
  {
    path: `${UrlConfig.CUSTOMER}/rankings`,
    exact: true,
    title: "Hạng khách hàng",
    icon: 'icon-dot',
    component: rank,
    key: "submenu157",
    isShow: true,
    header: null,
    subMenu: [
      {
        path: `${UrlConfig.CUSTOMER}/rankings/create`,
        exact: true,
        title: "Tạo hạng thẻ",
        icon: 'icon-dot',
        component: createRank,
        key: "submenu1571",
        isShow: true,
        header: null,
        subMenu: [],
      },
      {
        path: `${UrlConfig.CUSTOMER}/rankings/:id/update`,
        exact: true,
        title: "Sửa hạng thẻ",
        icon: 'icon-dot',
        component: createRank,
        key: "submenu1572",
        isShow: true,
        header: null,
        subMenu: [],
      },
    ],
  },
  {
    path: `${UrlConfig.CUSTOMER}/point-adjustments`,
    exact: true,
    title: "Phiếu điều chỉnh",
    icon: 'icon-dot',
    component: pointAdjustment,
    key: "submenu158",
    isShow: true,
    header: null,
    subMenu: [],
  },
]

export default customers;