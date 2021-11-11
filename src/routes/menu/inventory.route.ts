import { RouteMenu } from "../../model/other";
import UrlConfig from "../../config/url.config";
import React from "react";
import { PurchaseOrderPermission } from "config/permissions/purchase-order.permission";
const ListTicket = React.lazy(() => import("screens/inventory/ListTicket"));
const DetailTicket = React.lazy(() => import("screens/inventory/DetailTicket/index"));
const UpdateTicket = React.lazy(() => import("screens/inventory/UpdateTicket"));
const CopyTicket = React.lazy(() => import("screens/inventory/UpdateTicket"));
const CreateTicketFromExcel = React.lazy(() => import("screens/inventory/UpdateTicket"));
const CreateTicket = React.lazy(() => import("screens/inventory/CreateTicket/index"));
const ProcurementScreen = React.lazy(() => import("screens/products/procurement"));
const ImportInventoryScreen = React.lazy(() => import("screens/inventory/ImportInventory/index"));

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

//Kiểm kê, DUOCNC 20211021

const ListInventoryAdjustment = React.lazy(() => import("screens/inventory-adjustment/ListInventoryAdjustment"));
const CreateInventoryAdjustment = React.lazy(() => import("screens/inventory-adjustment/CreateInventoryAdjustment"));
const DetailInvetoryAdjustment = React.lazy( () => import("screens/inventory-adjustment/DetailInvetoryAdjustment"));

//Inventory
const InventoryScreen = React.lazy(
  () => import("screens/products/inventory")
);

export const inventory: Array<RouteMenu> = [
  {
    path: `${UrlConfig.INVENTORY}`,
    exact: true,
    title: "Danh sách tồn",
    icon: "icon-dot",
    component: InventoryScreen,
    key: "submenu24",
    isShow: true,
    header: null,
    subMenu: [],
  },
  {
    path: UrlConfig.PURCHASE_ORDER,
    exact: true,
    title: "Nhập hàng",
    icon: "icon-dot",
    component: PurchaseOrderListScreen,
    key: "submenu22",
    isShow: true,
    header: null,
    permissions: [PurchaseOrderPermission.po_read],
    subMenu: [
      {
        path: `${UrlConfig.PURCHASE_ORDER}/create`,
        exact: true,
        title: "Tạo mới đơn đặt hàng",
        icon: "icon-dot",
        component: PurchaseOrderCreateScreen,
        key: "submenu221",
        isShow: true,
        header: null,
        permissions: [PurchaseOrderPermission.po_create],
        subMenu: [],
      },
      {
        path: `${UrlConfig.PURCHASE_ORDER}/:id`,
        exact: true,
        title: "Quản lý đơn đặt hàng",
        icon: "icon-dot",
        component: PurchaseOrderDetailScreen,
        key: "submenu222",
        isShow: true,
        header: null,
        permissions: [PurchaseOrderPermission.po_read, PurchaseOrderPermission.po_update],
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
        permissions: [PurchaseOrderPermission.po_return],
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
    permissions: [PurchaseOrderPermission.procurements_read],
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
        permissions: [PurchaseOrderPermission.procurements_read],
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
      {
        path: `${UrlConfig.INVENTORY_TRANSFER}/:id/update`,
        exact: true,
        title: "Chuyển hàng",
        icon: "icon-dot",
        component: CopyTicket,
        key: "submenu31",
        isShow: true,
        header: null,
        subMenu: [],
      },
      {
        path: `${UrlConfig.INVENTORY_TRANSFER}/createImport`,
        exact: true,
        title: "Chuyển hàng",
        icon: "icon-dot",
        component: CreateTicketFromExcel,
        key: "submenu31",
        isShow: true,
        header: null,
        subMenu: [],
      },
      {
        path: `${UrlConfig.INVENTORY_TRANSFER}/import`,
        exact: true,
        title: "Chuyển hàng",
        icon: "icon-dot",
        component: ImportInventoryScreen,
        key: "submenu31",
        isShow: true,
        header: null,
        subMenu: [],
      },
    ],
  },
  {
    path: UrlConfig.INVENTORY_ADJUSTMENT,
    exact: true,
    title: "Kiểm kho",
    icon: "icon-dot",
    component: ListInventoryAdjustment,
    key: "submenu33",
    isShow: true,
    header: null,
    subMenu: [
      {
        path: `${UrlConfig.INVENTORY_ADJUSTMENT}/create`,
        exact: true,
        title: "Kiểm kho",
        icon: "icon-dot",
        component: CreateInventoryAdjustment,
        key: "submenu33",
        isShow: true,
        header: null,
        subMenu: [],
      },
      {
        path: `${UrlConfig.INVENTORY_ADJUSTMENT}/:id`,
        exact: true,
        title: "Kiểm kho",
        icon: "icon-dot",
        component: DetailInvetoryAdjustment,
        key: "submenu31",
        isShow: true,
        header: null,
        subMenu: [],
      },
    ],
  },
];
