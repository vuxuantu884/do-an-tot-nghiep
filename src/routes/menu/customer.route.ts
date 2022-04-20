import UrlConfig from "config/url.config";
import { RouteMenu } from "model/other";
import React from "react";

const customer = React.lazy(() => import ("screens/customer/index"))
const customergroup = React.lazy(() => import ("screens/customer/customer-group"))
const loyaltyCard = React.lazy(() => import ("screens/customer/loyalty-card"))
const uploadLoyaltyCard = React.lazy(() => import ("screens/customer/loyalty-card/upload"))
const rank = React.lazy(() => import ("screens/customer/ranking/index"))
const createRank = React.lazy(() => import ("screens/customer/ranking/component/create/index"))
const PointAdjustment = React.lazy(() => import ("screens/customer/point-adjustment/PointAdjustment"))
const CreatePointAdjustment = React.lazy(() => import ("screens/customer/point-adjustment/CreatePointAdjustment"))
const PointAdjustmentDetail = React.lazy(() => import ("screens/customer/point-adjustment/PointAdjustmentDetail"))

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
    path: `${UrlConfig.CUSTOMER2}-groups`,
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
    path: `${UrlConfig.CUSTOMER_CARDS}`,
    exact: true,
    title: "Thẻ khách hàng",
    icon: "icon-dot",
    component: loyaltyCard,
    key: "submenu156",
    isShow: true,
    header: null,
    subMenu: [
      {
        path: `${UrlConfig.CUSTOMER_CARDS}/upload`,
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
    path: `${UrlConfig.CUSTOMER2}-rankings`,
    exact: true,
    title: "Hạng khách hàng",
    icon: 'icon-dot',
    component: rank,
    key: "submenu157",
    isShow: true,
    header: null,
    subMenu: [
      {
        path: `${UrlConfig.CUSTOMER2}-rankings/create`,
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
        path: `${UrlConfig.CUSTOMER2}-rankings/:id/update`,
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
    path: `${UrlConfig.CUSTOMER2}-adjustments`,
    exact: true,
    title: "Phiếu điều chỉnh",
    icon: 'icon-dot',
    component: PointAdjustment,
    key: "submenu158",
    isShow: true,
    header: null,
    subMenu: [
      {
        path: `${UrlConfig.CUSTOMER2}-adjustments/create`,
        exact: true,
        title: "Tạo mới phiếu điều chỉnh",
        icon: 'icon-dot',
        component: CreatePointAdjustment,
        key: "create_point_adjustment",
        isShow: true,
        header: null,
        subMenu: [],
      },
      {
        path: `${UrlConfig.CUSTOMER2}-adjustments/:id`,
        exact: true,
        title: `Chi tiết phiếu điều chỉnh`,
        icon: 'icon-dot',
        component: PointAdjustmentDetail,
        key: "point_adjustment_detail",
        isShow: true,
        header: null,
        subMenu: [],
      }
    ],
  },
]

export default customers;