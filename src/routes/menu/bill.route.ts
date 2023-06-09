import { AppConfig } from "config/app.config";
import { ORDER_PERMISSIONS } from "config/permissions/order.permission";
import UrlConfig from "config/url.config";
import { RouteMenu } from "model/other";
import React from "react";

const OrderUpdate = React.lazy(() => import("screens/order-online/order-update"));
const PackDetail = React.lazy(() => import("screens/order-online/pack/pack-detail"));
// const PackSupportScreen = React.lazy(() => import("screens/order-online/pack/pack.screen"));
const PackageSupport = React.lazy(() => import("screens/package-support"));
const DeliveryRecordsScreen = React.lazy(() => import("screens/order-online/records.screen"));
const AddReportHandOver = React.lazy(() => import("screens/order-online/pack/pack-add"));
const PackUpdate = React.lazy(() => import("screens/order-online/pack/pack-update"));
// const SplitOrdersScreen = React.lazy(() => import("screens/order-online/split-orders.screen"));
// const CustomerDuplicate = React.lazy(() => import("screens/order-online/order-duplicate/index"));
// const OrderDuplicate = React.lazy(
//   () => import("screens/order-online/order-duplicate/detail.screen"),
// );
const ListOrder = React.lazy(() => import("screens/order-online/orders/online-orders.screen"));
const OrderDetail = React.lazy(() => import("screens/order-online/order-detail"));
const OrderCreate = React.lazy(() => import("screens/order-online/order-create"));
const OnlineReturnOrders = React.lazy(
  () => import("screens/order-online/order-return/onlineReturnOrders"),
);
const ScreenReturnCreate = React.lazy(() => import("screens/order-online/order-return/create"));
const ScreenReturnDetail = React.lazy(() => import("screens/order-online/order-return/[id]"));

const YDPageAdmin = React.lazy(() => import("screens/yd-page"));
//Handover
const CreateHandoverScreen = React.lazy(() => import("screens/handover/HandOverCreate"));
const HandoverScreen = React.lazy(() => import("screens/handover/HandOverList"));
const DetailHandoverScreen = React.lazy(() => import("screens/handover/HandOverDetail"));
const UpdateHandoverScreen = React.lazy(() => import("screens/handover/HandOverUpdate"));

const isHiddenMenuEnvPro = AppConfig.ENV === "PROD" ? false : true;

const bill: Array<RouteMenu> = [
  {
    path: `${UrlConfig.ORDER}/create`,
    exact: true,
    title: "Tạo đơn Online",
    icon: "icon-dot",
    component: OrderCreate,
    key: "submenu52",
    isShow: true,
    header: null,
    permissions: [ORDER_PERMISSIONS.CREATE],
    subMenu: [],
  },
  {
    path: `${UrlConfig.ORDER}`,
    exact: true,
    title: "Danh sách đơn hàng",
    icon: "icon-dot",
    component: ListOrder,
    key: "danh-sách-đơn-hang",
    isShow: true,
    header: null,
    permissions: [ORDER_PERMISSIONS.READ],
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
        permissions: [ORDER_PERMISSIONS.READ],
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
        permissions: [ORDER_PERMISSIONS.READ],
        subMenu: [],
      },
      {
        path: `${UrlConfig.YD_PAGE}`,
        exact: true,
        title: "Đơn hàng từ YDPage",
        icon: "icon-dot",
        component: YDPageAdmin,
        key: "submenu5414",
        isShow: true,
        header: null,
        subMenu: [],
      },
    ],
  },
  {
    path: `${UrlConfig.ORDER}${UrlConfig.ORDERS_RETURN}`,
    exact: true,
    title: "Danh sách trả hàng",
    icon: "icon-dot",
    component: OnlineReturnOrders,
    key: "danh-sach-tra-hang-online",
    isShow: true,
    header: null,
    permissions: [ORDER_PERMISSIONS.READ_RETURNS],
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
        permissions: undefined,
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
        permissions: [ORDER_PERMISSIONS.READ_RETURNS],
        subMenu: [],
      },
    ],
  },
  // {
  //   path: UrlConfig.SPLIT_ORDERS,
  //   exact: true,
  //   title: "Danh sách đơn tách",
  //   icon: "icon-dot",
  //   component: SplitOrdersScreen,
  //   key: "split-orders",
  //   isShow: true,
  //   header: null,
  //   subMenu: [],
  //   // permissions: [ODERS_PERMISSIONS.SUPPORT_PACK],
  // },
  {
    path: UrlConfig.PACK_SUPPORT,
    exact: true,
    title: "Hỗ trợ đóng gói",
    icon: "icon-dot",
    component: PackageSupport,
    key: "submenu561",
    isShow: true,
    header: null,
    subMenu: [],
    permissions: [ORDER_PERMISSIONS.SUPPORT_PACK],
  },
  {
    path: UrlConfig.DELIVERY_RECORDS,
    exact: true,
    title: "Biên bản bàn giao (v1)",
    icon: "icon-dot",
    component: DeliveryRecordsScreen,
    key: "submenu562",
    isShow: isHiddenMenuEnvPro,
    header: null,
    subMenu: [
      {
        path: `${UrlConfig.DELIVERY_RECORDS}/create`,
        exact: true,
        title: "Thêm mới biên bản bàn giao",
        icon: "icon-dot",
        component: AddReportHandOver,
        key: "submenu57",
        isShow: isHiddenMenuEnvPro,
        header: null,
        subMenu: [],
        permissions: [ORDER_PERMISSIONS.CREATE_GOODS_RECEIPT],
      },
      {
        path: `${UrlConfig.DELIVERY_RECORDS}/:id`,
        exact: true,
        title: "Chi tiết biên bản bàn giao",
        icon: "icon-dot",
        component: PackDetail,
        key: "submenu58",
        isShow: isHiddenMenuEnvPro,
        header: null,
        subMenu: [],
      },
      {
        path: `${UrlConfig.DELIVERY_RECORDS}/:id/update`,
        exact: true,
        title: "Cập nhật biên bản bàn giao",
        icon: "icon-dot",
        component: PackUpdate,
        key: "submenu59",
        isShow: isHiddenMenuEnvPro,
        header: null,
        subMenu: [],
      },
    ],
    permissions: [ORDER_PERMISSIONS.READ_GOODS_RECEIPT],
  },
  {
    path: UrlConfig.HANDOVER,
    exact: true,
    title: "Biên bản bàn giao",
    icon: "icon-dot",
    component: HandoverScreen,
    key: "submenu58",
    isShow: true,
    header: null,
    subMenu: [
      {
        path: `${UrlConfig.HANDOVER}/create`,
        exact: true,
        title: "Thêm mới biên bản bàn giao",
        icon: "icon-dot",
        component: CreateHandoverScreen,
        key: "submenu581",
        isShow: true,
        header: null,
        subMenu: [],
        permissions: [ORDER_PERMISSIONS.CREATE_GOODS_RECEIPT],
      },
      {
        path: `${UrlConfig.HANDOVER}/:id`,
        exact: true,
        title: "Chi tiết biên bản bàn giao",
        icon: "icon-dot",
        component: DetailHandoverScreen,
        key: "submenu582",
        isShow: true,
        header: null,
        subMenu: [],
      },
      {
        path: `${UrlConfig.HANDOVER}/:id/update`,
        exact: true,
        title: "Cập nhật biên bản bàn giao",
        icon: "icon-dot",
        component: UpdateHandoverScreen,
        key: "submenu583",
        isShow: true,
        header: null,
        subMenu: [],
      },
    ],
    permissions: [ORDER_PERMISSIONS.READ_GOODS_RECEIPT],
  },
];

export default bill;
