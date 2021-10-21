import { RouteMenu } from "../../model/other";
import UrlConfig from "../../config/url.config";
import React from "react";
const ListTicket = React.lazy(() => import("screens/inventory/ListTicket"));
const DetailTicket = React.lazy(() => import("screens/inventory/DetailTicket/index"));
const UpdateTicket = React.lazy(() => import("screens/inventory/UpdateTicket"));
const CreateTicket = React.lazy(() => import("screens/inventory/CreateTicket/index"));
const ProcurementScreen = React.lazy(() => import("screens/products/procurement"));

//PO
const PurchaseOrderListScreen = React.lazy(
  () => import("screens/purchase-order/purchase-order-list.screen")
);
const PurchaseOrderCreateScreen = React.lazy(
  () => import("screens/purchase-order/purchase-order-create.screen")
);
const PurchaseOrderDetailScreen = React.lazy(
  () => import("screens/purchase-order/purchase-order-detail.screen")
);
const PurchaseOrderReturnScreen = React.lazy(
  () => import("screens/purchase-order/purchase-order-return.screen")
);

export const inventory: Array<RouteMenu> = [
  {
    path: UrlConfig.PURCHASE_ORDER,
    exact: true,
    title: "Nhập hàng",
    icon: "icon-dot",
    component: PurchaseOrderListScreen,
    key: "submenu22",
    isShow: true,
    header: null,
    subMenu: [
      {
        path: `${UrlConfig.PURCHASE_ORDER}/create`,
        exact: true,
        title: "Thêm sản phẩm mới",
        icon: "icon-dot",
        component: PurchaseOrderCreateScreen,
        key: "submenu221",
        isShow: true,
        header: null,
        subMenu: [],
      },
      {
        path: `${UrlConfig.PURCHASE_ORDER}/:id`,
        exact: true,
        title: "Thêm sản phẩm mới",
        icon: "icon-dot",
        component: PurchaseOrderDetailScreen,
        key: "submenu222",
        isShow: true,
        header: null,
        subMenu: [],
        pathIgnore: ["create"],
      },
      {
        path: `${UrlConfig.PURCHASE_ORDER}/:id/return`,
        exact: true,
        title: "Trả hàng cho đơn mua hàng",
        icon: "icon-dot",
        component: PurchaseOrderReturnScreen,
        key: "submenu223",
        isShow: true,
        header: null,
        subMenu: [],
        pathIgnore: ["create"],
      },
    ],
  },
  {
    path: `${UrlConfig.PROCUREMENT}/`,
    exact: true,
    title: "Phiếu nhập kho",
    icon: "icon-dot",
    component: ProcurementScreen,
    key: "submenu25",
    isShow: true,
    header: null,
    subMenu: [
      {
        path: `${UrlConfig.PROCUREMENT}/:id`,
        exact: true,
        title: "Phiếu nhập kho",
        icon: "icon-dot",
        component: ProcurementScreen,
        key: "submenu25",
        isShow: true,
        header: null,
        subMenu: [],
      },
    ],
  },
  {
    path: UrlConfig.INVENTORY_TRANSFER,
    exact: true,
    title: "Chuyển hàng",
    icon: "icon-dot",
    component: ListTicket,
    key: "submenu31",
    isShow: true,
    header: null,
    subMenu: [
      {
        path: `${UrlConfig.INVENTORY_TRANSFER}/create`,
        exact: true,
        title: "Chuyển hàng",
        icon: "icon-dot",
        component: CreateTicket,
        key: "submenu31",
        isShow: true,
        header: null,
        subMenu: [],
      },
      {
        path: `${UrlConfig.INVENTORY_TRANSFER}/:id`,
        exact: true,
        title: "Chuyển hàng",
        icon: "icon-dot",
        component: DetailTicket,
        key: "submenu31",
        isShow: true,
        header: null,
        subMenu: [],
      },
      {
        path: `${UrlConfig.INVENTORY_TRANSFER}/:id/update`,
        exact: true,
        title: "Chuyển hàng",
        icon: "icon-dot",
        component: UpdateTicket,
        key: "submenu31",
        isShow: true,
        header: null,
        subMenu: [],
      },
    ],
  },
];
