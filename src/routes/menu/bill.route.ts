import { ODERS_PERMISSIONS } from "config/permissions/order.permission";
import UrlConfig from "config/url.config";
import { RouteMenu } from "model/other";
import React from "react";
import CustomerDuplicate from "screens/order-online/duplicate.screen";
import OrderDuplicate from "screens/order-online/order-duplicate";
import OrderUpdate from "screens/order-online/order-update";
import PackDetail from "screens/order-online/pack-detail";
import PackSupportScreen from "screens/order-online/pack-support.screen";
import AddReportHandOver from "screens/order-online/pack-support/add-report-hand-over";
import PackUpdate from "screens/order-online/pack-update";
import SplitOrdersScreen from "screens/order-online/split-orders.screen";

const ListOrder = React.lazy(() => import("screens/order-online/orders/index.screen"));
const OrderDetail = React.lazy(() => import("screens/order-online/order-detail"));
const Order = React.lazy(() => import("screens/order-online/order.screen"));
const ReturnOrder = React.lazy(() => import("screens/order-online/return.screen"));
const ScreenReturnCreate = React.lazy(
  () => import("screens/order-online/order-return/create")
);
const ScreenReturnDetail = React.lazy(
  () => import("screens/order-online/order-return/[id]")
);

const YDPageCRM = React.lazy(() => import("screens/yd-page"));

const bill: Array<RouteMenu> = [
  {
    path: `${UrlConfig.ORDER}/create`,
    exact: true,
    title: "Tạo đơn Online",
    icon: "icon-dot",
    component: Order,
    key: "submenu52",
    isShow: true,
    header: null,
    permissions: [ODERS_PERMISSIONS.CREATE],
    subMenu: [],
  },
  {
    path: `${UrlConfig.ORDER}`,
    exact: true,
    title: "Danh sách đơn hàng",
    icon: "icon-dot",
    component: ListOrder,
    key: "submenu54",
    isShow: true,
    header: null,
    permissions: [ODERS_PERMISSIONS.READ],
    subMenu: [
      {
        path: `${UrlConfig.ORDER}/:id`,
        exact: true,
        title: "Chi tiết đơn hàng",
        icon: "icon-dot",
        component: OrderDetail,
        key: "submenu5413",
        isShow: true,
        header: null,
        permissions: [ODERS_PERMISSIONS.READ],
        subMenu: [],
      },
      {
        path: `${UrlConfig.ORDER}/:id/update`,
        exact: true,
        title: "Sửa đơn hàng",
        icon: "icon-dot",
        component: OrderUpdate,
        key: "submenu5414",
        isShow: true,
        header: null,
        permissions: [ODERS_PERMISSIONS.READ],
        subMenu: [],
      },
      {
        path: `${UrlConfig.YD_PAGE}`,
        exact: true,
        title: "Đơn hàng từ YDPage",
        icon: "icon-dot",
        component: YDPageCRM,
        key: "submenu5414",
        isShow: true,
        header: null,
        subMenu: [],
      },
    ],
  },
  {
		path: UrlConfig.ORDERS_RETURN,
    exact: true,
    title: "Danh sách trả hàng",
    icon: "icon-dot",
    component: ReturnOrder,
    key: "submenu55",
    isShow: true,
    header: null,
    permissions: [ODERS_PERMISSIONS.READ_RETURNS],
    subMenu: [
      {
        path: `${UrlConfig.ORDERS_RETURN}/create`,
        exact: true,
        title: "Tạo đơn trả hàng",
        icon: "icon-dot",
        component: ScreenReturnCreate,
        key: "create-return",
        isShow: true,
        header: null,
        permissions: [ODERS_PERMISSIONS.CREATE_RETURN],
        subMenu: [],
      },
      {
        path: `${UrlConfig.ORDERS_RETURN}/:id`,
        exact: true,
        title: "Chi tiết trả hàng",
        icon: "icon-dot",
        component: ScreenReturnDetail,
        key: "single-return",
        isShow: true,
        header: null,
        permissions: [ODERS_PERMISSIONS.READ_RETURNS],
        subMenu: [],
      },
    ],
  },
  {
    path: `${UrlConfig.ORDERS_DUPLICATE}`,
    exact: true,
    title: "Danh sách đơn trùng",
    icon: "icon-dot",
    component: CustomerDuplicate,
    key: "order-duplicate",
    isShow: true,
    header: null,
    subMenu: [
      {
        path: `${UrlConfig.ORDERS_DUPLICATE}/order/:customer_phone`,
        exact: true,
        title: "Danh sách đơn trùng",
        icon: "icon-dot",
        component: OrderDuplicate,
        key: "order-duplicate",
        isShow: true,
        header: null,
        subMenu: [],
      }
    ],
  },
  {
    path: `/orders-pack-support`,
    exact: true,
    title: "Hỗ trợ đóng gói",
    icon: "icon-dot",
    component: PackSupportScreen,
    key: "submenu56",
    isShow: true,
    header: null,
    subMenu: [
      {
        path: `${UrlConfig.PACK_SUPPORT}/report-hand-over-create`,
        exact: true,
        title: "Thêm mới",
        icon: "icon-dot",
        component: AddReportHandOver,
        key: "submenu57",
        isShow: true,
        header: null,
        subMenu: [],
      },
      {
        path: `${UrlConfig.PACK_SUPPORT}/:id`,
        exact: true,
        title: "Chi tiet",
        icon: "icon-dot",
        component: PackDetail,
        key: "submenu58",
        isShow: true,
        header: null,
        subMenu: [],
      },
      {
        path: `${UrlConfig.PACK_SUPPORT}/report-hand-over-update/:id`,
        exact: true,
        title: "Cập nhật",
        icon: "icon-dot",
        component: PackUpdate,
        key: "submenu59",
        isShow: true,
        header: null,
        subMenu: [],
      }
    ],
    permissions: [ODERS_PERMISSIONS.SUPPORT_PACK],
  },
	{
    path: UrlConfig.SPLIT_ORDERS,
    exact: true,
    title: "Danh sách đơn tách",
    icon: "icon-dot",
    component: SplitOrdersScreen,
    key: "split-orders",
    isShow: true,
    header: null,
    subMenu: [],
    // permissions: [ODERS_PERMISSIONS.SUPPORT_PACK],
  },
];

export default bill;
