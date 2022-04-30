import { InventoryDefectsPermission } from './../../config/permissions/inventory-defects.permission';
import { RouteMenu } from "../../model/other";
import UrlConfig, { InventoryTabUrl, ProcurementTabUrl } from "../../config/url.config";
import React from "react";
import { PurchaseOrderPermission } from "config/permissions/purchase-order.permission";
import { InventoryTransferPermission } from "config/permissions/inventory-transfer.permission";
import { InventoryAdjustmentPermission } from "config/permissions/inventory-adjustment.permission";
const ListInventoryDefect = React.lazy(() => import("screens/inventory-defects/ListInventoryDefect"));
const InventoryDefectCreate = React.lazy(() => import("screens/inventory-defects/CreateInventoryDefects"));
const ListTicket = React.lazy(() => import("screens/inventory/ListTicket"));
const DetailTicket = React.lazy(() => import("screens/inventory/DetailTicket/index"));
const UpdateTicket = React.lazy(() => import("screens/inventory/UpdateTicket"));
const CopyTicket = React.lazy(() => import("screens/inventory/UpdateTicket"));
const CreateTicketFromExcel = React.lazy(() => import("screens/inventory/UpdateTicket"));
const CreateTicket = React.lazy(() => import("screens/inventory/CreateTicket/index"));
const ProcurementScreen = React.lazy(() => import("screens/products/procurement"));
const ImportInventoryScreen = React.lazy(() => import("screens/inventory/ImportInventory/index"));
const ProcurementCreateScreen = React.lazy(() => import("screens/products/procurement/create"));

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

//PR
const ProcurementDetailScreen = React.lazy(() => import("screens/products/procurement/detail/ProcurementDetailScreen"));

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
    path: `${InventoryTabUrl.ALL}`,
    exact: true,
    title: "Tồn kho",
    icon: "icon-dot",
    component: InventoryScreen,
    key: "submenu24",
    isShow: true,
    header: null,
    subMenu: [{
      path: `${InventoryTabUrl.DETAIL}`,
      exact: true,
      title: "Tồn khon",
      icon: "icon-dot",
      component: InventoryScreen,
      key: "submenu24",
      isShow: true,
      header: null,
      subMenu: [],
    },
    {
      path: `${InventoryTabUrl.HISTORIES}`,
      exact: true,
      title: "Tồn kho",
      icon: "icon-dot",
      component: InventoryScreen,
      key: "submenu24",
      isShow: true,
      header: null,
      subMenu: [],
    },],
  },
  {
    path: UrlConfig.PURCHASE_ORDERS,
    exact: true,
    title: "Đặt hàng",
    icon: "icon-dot",
    component: PurchaseOrderListScreen,
    key: "submenu22",
    isShow: true,
    header: null,
    permissions: [PurchaseOrderPermission.read],
    subMenu: [
      {
        path: `${UrlConfig.PURCHASE_ORDERS}/create`,
        exact: true,
        title: "Tạo mới đơn đặt hàng",
        icon: "icon-dot",
        component: PurchaseOrderCreateScreen,
        key: "submenu221",
        isShow: true,
        header: null,
        permissions: [PurchaseOrderPermission.create],
        subMenu: [],
      },
      {
        path: `${UrlConfig.PURCHASE_ORDERS}/:id`,
        exact: true,
        title: "Quản lý đơn đặt hàng",
        icon: "icon-dot",
        component: PurchaseOrderDetailScreen,
        key: "submenu222",
        isShow: true,
        header: null,
        permissions: [PurchaseOrderPermission.read, PurchaseOrderPermission.update],
        subMenu: [],
        pathIgnore: ["create"],
      },
      {
        path: `${UrlConfig.PURCHASE_ORDERS}/:id/return`,
        exact: true,
        title: "Trả hàng cho đơn mua hàng",
        icon: "icon-dot",
        component: PurchaseOrderReturnScreen,
        key: "submenu223",
        isShow: true,
        header: null,
        permissions: [PurchaseOrderPermission.return],
        subMenu: [],
        pathIgnore: ["create"],
      },
    ],
  },
  {
    // path: `${ProcurementTabUrl.TODAY}`,
    path: `${UrlConfig.PROCUREMENT}`,
    exact: true,
    title: "Nhập kho",
    icon: "icon-dot",
    component: ProcurementScreen,
    key: "submenu25",
    isShow: true,
    header: null,
    permissions: [PurchaseOrderPermission.procurements_read],
    subMenu: [
      {
        path: `${UrlConfig.PROCUREMENT}/create`,
        exact: true,
        title: "Tạo phiếu nhập kho",
        icon: "icon-dot",
        component: ProcurementCreateScreen,
        key: "submenu251",
        isShow: true,
        header: null,
        permissions: [PurchaseOrderPermission.procurements_create],
        subMenu: [],
      },
      {
        path: `${UrlConfig.PURCHASE_ORDERS}/:id/procurements/:prID`,
        exact: true,
        title: "Nhập kho",
        icon: "icon-dot",
        component: ProcurementDetailScreen,
        key: "submenu251",
        isShow: true,
        header: null,
        permissions: [PurchaseOrderPermission.procurements_read],
        subMenu: [],
      },
      {
        path: `${ProcurementTabUrl.ALL}`,
        exact: true,
        title: "Nhập kho",
        icon: "icon-dot",
        component: ProcurementScreen,
        key: "submenu25",
        isShow: true,
        header: null,
        permissions: [PurchaseOrderPermission.procurements_read],
        subMenu: [],
      },
      // Do cải tiến PO và Procurement nên tạm thời k sử dụng 2 tabs này
      // {
      //   path: `${ProcurementTabUrl.TODAY}`,
      //   exact: true,
      //   title: "Nhập kho",
      //   icon: "icon-dot",
      //   component: ProcurementScreen,
      //   key: "submenu25",
      //   isShow: true,
      //   header: null,
      //   permissions: [PurchaseOrderPermission.procurements_read],
      //   subMenu: [],
      // },
      // {
      //   path: `${ProcurementTabUrl.SEVEN_DAYS}`,
      //   exact: true,
      //   title: "Nhập kho",
      //   icon: "icon-dot",
      //   component: ProcurementScreen,
      //   key: "submenu25",
      //   isShow: true,
      //   header: null,
      //   permissions: [PurchaseOrderPermission.procurements_read],
      //   subMenu: [],
      // },
      {
        path: `${ProcurementTabUrl.LOGS}`,
        exact: true,
        title: "Lịch sử phiếu nhập kho",
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
    path: UrlConfig.INVENTORY_TRANSFERS,
    exact: true,
    title: "Chuyển hàng",
    icon: "icon-dot",
    component: ListTicket,
    key: "submenu31",
    isShow: true,
    header: null,
    permissions:[InventoryTransferPermission.read],
    subMenu: [
      {
        path: `${UrlConfig.INVENTORY_TRANSFERS}/confirmed`,
        exact: true,
        title: "Đang chuyển đi",
        icon: "icon-dot",
        component: ListTicket,
        key: "submenu31",
        isShow: true,
        header: null,
        permissions:[InventoryTransferPermission.read],
        subMenu: [],
      },
      {
        path: `${UrlConfig.INVENTORY_TRANSFERS}/transferring-sender`,
        exact: true,
        title: "Đang chuyển đi",
        icon: "icon-dot",
        component: ListTicket,
        key: "submenu31",
        isShow: true,
        header: null,
        permissions:[InventoryTransferPermission.read],
        subMenu: [],
      },
      {
        path: `${UrlConfig.INVENTORY_TRANSFERS}/transferring-received`,
        exact: true,
        title: "Đang chuyển đến",
        icon: "icon-dot",
        component: ListTicket,
        key: "submenu31",
        isShow: true,
        header: null,
        permissions:[InventoryTransferPermission.read],
        subMenu: [],
      },
      {
        path: `${UrlConfig.INVENTORY_TRANSFERS}/histories`,
        exact: true,
        title: "Lịch sử chuyển hàng",
        icon: "icon-dot",
        component: ListTicket,
        key: "submenu31",
        isShow: true,
        header: null,
        permissions:[InventoryTransferPermission.read],
        subMenu: [],
      },
      {
        path: `${UrlConfig.INVENTORY_TRANSFERS}/create`,
        exact: true,
        title: "Chuyển hàng",
        icon: "icon-dot",
        component: CreateTicket,
        key: "submenu31",
        isShow: true,
        header: null,
        permissions:[InventoryTransferPermission.create],
        subMenu: [],
      },
      {
        path: `${UrlConfig.INVENTORY_TRANSFERS}/:id`,
        exact: true,
        title: "Chuyển hàng",
        icon: "icon-dot",
        component: DetailTicket,
        key: "submenu31",
        isShow: true,
        header: null,
        permissions:[InventoryTransferPermission.read],
        subMenu: [],
      },
      {
        path: `${UrlConfig.INVENTORY_TRANSFERS}/:id/update`,
        exact: true,
        title: "Chuyển hàng",
        icon: "icon-dot",
        component: UpdateTicket,
        key: "submenu31",
        isShow: true,
        header: null,
        permissions:[InventoryTransferPermission.update],
        subMenu: [],
      },
      {
        path: `${UrlConfig.INVENTORY_TRANSFERS}/:id/update`,
        exact: true,
        title: "Chuyển hàng",
        icon: "icon-dot",
        component: CopyTicket,
        key: "submenu31",
        isShow: true,
        header: null,
        permissions:[InventoryTransferPermission.clone],
        subMenu: [],
      },
      {
        path: `${UrlConfig.INVENTORY_TRANSFERS}/createImport`,
        exact: true,
        title: "Chuyển hàng",
        icon: "icon-dot",
        component: CreateTicketFromExcel,
        key: "submenu31",
        isShow: true,
        header: null,
        permissions:[InventoryTransferPermission.import, InventoryTransferPermission.create],
        subMenu: [],
      },
      {
        path: `${UrlConfig.INVENTORY_TRANSFERS}/import`,
        exact: true,
        title: "Chuyển hàng",
        icon: "icon-dot",
        component: ImportInventoryScreen,
        key: "submenu31",
        isShow: true,
        header: null,
        permissions:[InventoryTransferPermission.import, InventoryTransferPermission.create],
        subMenu: [],
      },
    ],
  },
  {
    path: UrlConfig.INVENTORY_ADJUSTMENTS,
    exact: true,
    title: "Kiểm kho",
    icon: "icon-dot",
    component: ListInventoryAdjustment,
    key: "submenu33",
    isShow: true,
    header: null,
    permissions:[InventoryAdjustmentPermission.read],
    subMenu: [
      {
        path: `${UrlConfig.INVENTORY_ADJUSTMENTS}/create`,
        exact: true,
        title: "Kiểm kho",
        icon: "icon-dot",
        component: CreateInventoryAdjustment,
        key: "submenu33",
        isShow: true,
        header: null,
        permissions:[InventoryAdjustmentPermission.create],
        subMenu: [],
      },
      {
        path: `${UrlConfig.INVENTORY_ADJUSTMENTS}/:id`,
        exact: true,
        title: "Kiểm kho",
        icon: "icon-dot",
        component: DetailInvetoryAdjustment,
        key: "submenu31",
        isShow: true,
        header: null,
        permissions:[InventoryAdjustmentPermission.read],
        subMenu: [],
      },
    ],
  },
  {
    path: UrlConfig.INVENTORY_DEFECTS,
    exact: true,
    title: "Hàng lỗi",
    icon: "icon-dot",
    component: ListInventoryDefect,
    key: "submenu34",
    isShow: true,
    header: null,
    permissions:[InventoryDefectsPermission.read],
    subMenu: [
      {
        path: `${UrlConfig.INVENTORY_DEFECTS}/create`,
        exact: true,
        title: "Thêm hàng lỗi",
        icon: "icon-dot",
        component: InventoryDefectCreate,
        key: "submenu34",
        isShow: true,
        header: null,
        permissions:[InventoryDefectsPermission.create],
        subMenu: [],
      },
    ],
  },
];
