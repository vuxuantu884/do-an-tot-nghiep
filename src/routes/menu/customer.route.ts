import UrlConfig from "config/url.config";
import { RouteMenu } from "model/other";
import React from "react";
import {
  CustomerGroupPermission,
  CustomerLevelPermission,
  CustomerListPermission,
} from "config/permissions/customer.permission";
import { ODERS_PERMISSIONS } from "config/permissions/order.permission";
import { LoyaltyPermission } from "config/permissions/loyalty.permission";

const customer = React.lazy(() => import("screens/customer/index"));
const CustomerCreate = React.lazy(() => import("screens/customer/customer-create/CustomerCreate"));
const CustomerUpdate = React.lazy(() => import("screens/customer/customer-update/CustomerUpdate"));
const CustomerDetail = React.lazy(() => import("screens/customer/customer-detail/CustomerDetail"));
const customergroup = React.lazy(() => import("screens/customer/customer-group"));
const loyaltyCard = React.lazy(() => import("screens/customer/loyalty-card"));
const uploadLoyaltyCard = React.lazy(() => import("screens/customer/loyalty-card/upload"));
const rank = React.lazy(() => import("screens/customer/ranking/index"));
const createRank = React.lazy(() => import("screens/customer/ranking/component/create/index"));
const PointAdjustment = React.lazy(
  () => import("screens/customer/point-adjustment/PointAdjustment"),
);
const CreatePointAdjustment = React.lazy(
  () => import("screens/customer/point-adjustment/CreatePointAdjustment"),
);
const PointAdjustmentDetail = React.lazy(
  () => import("screens/customer/point-adjustment/PointAdjustmentDetail"),
);

const customers: Array<RouteMenu> = [
  {
    path: `${UrlConfig.CUSTOMER}`,
    exact: true,
    title: "Danh sách khách hàng",
    icon: "icon-dot",
    component: customer,
    key: "submenu152",
    isShow: true,
    header: null,
    permissions: [CustomerListPermission.customers_read],
    subMenu: [
      {
        path: "/customers/create",
        exact: true,
        title: "Thêm khách hàng",
        icon: "icon-dot",
        component: CustomerCreate,
        key: "customers-create",
        isShow: true,
        header: null,
        permissions: [CustomerListPermission.customers_create],
        subMenu: [],
      },
      {
        path: "/customers/:id/update",
        exact: true,
        title: "Sửa thông tin khách hàng",
        icon: "icon-dot",
        component: CustomerUpdate,
        key: "customers-update",
        isShow: true,
        header: null,
        permissions: [CustomerListPermission.customers_update],
        subMenu: [],
      },
      {
        path: "/customers/:id",
        exact: true,
        title: "Chi tiết khách hàng",
        icon: "icon-customer",
        component: CustomerDetail,
        key: "customers-detail",
        isShow: true,
        header: null,
        permissions: [CustomerListPermission.customers_read, ODERS_PERMISSIONS.CREATE],
        subMenu: [],
      },
    ],
  },
  {
    path: `${UrlConfig.CUSTOMER2}-groups`,
    exact: true,
    title: "Nhóm khách hàng",
    icon: "icon-dot",
    component: customergroup,
    key: "submenu155",
    isShow: true,
    header: null,
    permissions: [CustomerGroupPermission.groups_read],
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
    permissions: [LoyaltyPermission.cards_read],
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
        permissions: [LoyaltyPermission.cards_release],
        subMenu: [],
      },
    ],
  },
  {
    path: `${UrlConfig.CUSTOMER2}-rankings`,
    exact: true,
    title: "Hạng khách hàng",
    icon: "icon-dot",
    component: rank,
    key: "submenu157",
    isShow: true,
    header: null,
    permissions: [CustomerLevelPermission.levels_read],
    subMenu: [
      {
        path: `${UrlConfig.CUSTOMER2}-rankings/create`,
        exact: true,
        title: "Tạo hạng thẻ",
        icon: "icon-dot",
        component: createRank,
        key: "submenu1571",
        isShow: true,
        header: null,
        permissions: [CustomerLevelPermission.levels_create],
        subMenu: [],
      },
      {
        path: `${UrlConfig.CUSTOMER2}-rankings/:id/update`,
        exact: true,
        title: "Sửa hạng thẻ",
        icon: "icon-dot",
        component: createRank,
        key: "submenu1572",
        isShow: true,
        header: null,
        permissions: [CustomerLevelPermission.levels_update],
        subMenu: [],
      },
    ],
  },
  {
    path: `${UrlConfig.CUSTOMER2}-adjustments`,
    exact: true,
    title: "Phiếu điều chỉnh",
    icon: "icon-dot",
    component: PointAdjustment,
    key: "submenu158",
    isShow: true,
    header: null,
    subMenu: [
      {
        path: `${UrlConfig.CUSTOMER2}-adjustments/create`,
        exact: true,
        title: "Tạo mới phiếu điều chỉnh",
        icon: "icon-dot",
        component: CreatePointAdjustment,
        key: "create_point_adjustment",
        isShow: true,
        header: null,
        permissions: [LoyaltyPermission.points_update],
        subMenu: [],
      },
      {
        path: `${UrlConfig.CUSTOMER2}-adjustments/:id`,
        exact: true,
        title: `Chi tiết phiếu điều chỉnh`,
        icon: "icon-dot",
        component: PointAdjustmentDetail,
        key: "point_adjustment_detail",
        isShow: true,
        header: null,
        subMenu: [],
      },
    ],
  },
];

export default customers;
