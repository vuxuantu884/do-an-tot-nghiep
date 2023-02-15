import { InventoryAdjustmentPermission } from "config/permissions/inventory-adjustment.permission";
import { InventoryTransferPermission } from "config/permissions/inventory-transfer.permission";
import React from "react";
import UrlConfig, { InventoryTabUrl } from "../../config/url.config";
import { RouteMenu } from "../../model/other";
import { InventoryDefectsPermission } from "../../config/permissions/inventory-defects.permission";
import { StockInOutOthersPermission } from "config/permissions/stock-in-out.permission";
import ImportOneFromStoreMultipleToStore from "../../screens/inventory/ImportInventory/ImportOneFromStoreMultipleToStore";
const ListInventoryDefect = React.lazy(
  () => import("screens/inventory-defects/ListInventoryDefect"),
);
const InventoryDefectCreate = React.lazy(
  () => import("screens/inventory-defects/CreateInventoryDefects"),
);
const ListTicket = React.lazy(() => import("screens/inventory/ListTicket"));
const DetailTicket = React.lazy(() => import("screens/inventory/DetailTicket/index"));
const UpdateTicket = React.lazy(() => import("screens/inventory/UpdateTicket"));
const CopyTicket = React.lazy(() => import("screens/inventory/UpdateTicket"));
const CreateTicketFromExcel = React.lazy(() => import("screens/inventory/UpdateTicket"));
const CreateTicket = React.lazy(() => import("screens/inventory/CreateTicket/index"));
const RequestTicket = React.lazy(() => import("screens/inventory/RequestTicket/index"));
const ImportInventoryScreen = React.lazy(() => import("screens/inventory/ImportInventory/index"));
const ImportMultipleInventoryScreen = React.lazy(
  () => import("screens/inventory/ImportInventory/ImportMultipleInventory"),
);
const ImportOneStoreMultipleInventory = React.lazy(
  () => import("screens/inventory/ImportInventory/ImportOneStoreMultipleInventory"),
);

//STOCK IN OUT
const StockInOutOtherScreen = React.lazy(() => import("screens/stock-in-out-products"));
const StockInOtherCreate = React.lazy(
  () => import("screens/stock-in-out-products/StockInOtherCreate"),
);
const StockOutOtherCreate = React.lazy(
  () => import("screens/stock-in-out-products/StockOutOtherCreate"),
);
const StockInOutDetail = React.lazy(() => import("screens/stock-in-out-products/StockInOutDetail"));

//Kiểm kê, DUOCNC 20211021

const ListInventoryAdjustment = React.lazy(
  () => import("screens/inventory-adjustment/ListInventoryAdjustment"),
);
const CreateInventoryAdjustment = React.lazy(
  () => import("screens/inventory-adjustment/CreateInventoryAdjustment"),
);
const DetailInvetoryAdjustment = React.lazy(
  () => import("screens/inventory-adjustment/DetailInvetoryAdjustment"),
);

//Inventory
const InventoryScreen = React.lazy(() => import("screens/products/inventory"));

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
    subMenu: [
      {
        path: `${InventoryTabUrl.DETAIL}`,
        exact: true,
        title: "Tồn khon",
        icon: "icon-dot",
        component: InventoryScreen,
        // key: "submenu24",
        key: "submenu24_1",
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
        // key: "submenu24",
        key: "submenu24_2",
        isShow: true,
        header: null,
        subMenu: [],
      },
    ],
  },

  {
    path: `${UrlConfig.INVENTORY_TRANSFERS}/`,
    exact: true,
    title: "Chuyển hàng",
    icon: "icon-dot",
    component: ListTicket,
    key: "submenu31",
    isShow: true,
    header: null,
    permissions: [InventoryTransferPermission.read],
    subMenu: [
      {
        path: `${UrlConfig.INVENTORY_TRANSFERS}/confirmed`,
        exact: true,
        title: "Đang chuyển đi",
        icon: "icon-dot",
        component: ListTicket,
        key: "submenu31_1",
        isShow: true,
        header: null,
        permissions: [InventoryTransferPermission.read],
        subMenu: [],
      },
      {
        path: `${UrlConfig.INVENTORY_TRANSFERS}/transferring-sender`,
        exact: true,
        title: "Chuyển đi",
        icon: "icon-dot",
        component: ListTicket,
        key: "submenu31_2",
        isShow: true,
        header: null,
        permissions: [InventoryTransferPermission.read],
        subMenu: [],
      },
      {
        path: `${UrlConfig.INVENTORY_TRANSFERS}/transferring-receive`,
        exact: true,
        title: "Chuyển đến",
        icon: "icon-dot",
        component: ListTicket,
        key: "submenu31_3",
        isShow: true,
        header: null,
        permissions: [InventoryTransferPermission.read],
        subMenu: [],
      },
      {
        path: `${UrlConfig.INVENTORY_TRANSFERS}/export-import-list`,
        exact: true,
        title: "Sản phẩm chuyển kho",
        icon: "icon-dot",
        component: ListTicket,
        key: "submenu31_4",
        isShow: true,
        header: null,
        permissions: [InventoryTransferPermission.read],
        subMenu: [],
      },
      {
        path: `${UrlConfig.INVENTORY_TRANSFERS}/histories`,
        exact: true,
        title: "Lịch sử chuyển hàng",
        icon: "icon-dot",
        component: ListTicket,
        key: "submenu31_5",
        isShow: true,
        header: null,
        permissions: [InventoryTransferPermission.read],
        subMenu: [],
      },
      {
        path: `${UrlConfig.INVENTORY_TRANSFERS}/create`,
        exact: true,
        title: "Tạo phiếu chuyển hàng",
        icon: "icon-dot",
        component: CreateTicket,
        key: "submenu31_6",
        isShow: true,
        header: null,
        permissions: [InventoryTransferPermission.create],
        subMenu: [],
      },
      {
        path: `${UrlConfig.INVENTORY_TRANSFERS}/request`,
        exact: true,
        title: "Yêu cầu phiếu chuyển hàng",
        icon: "icon-dot",
        component: RequestTicket,
        key: "submenu31_7",
        isShow: true,
        header: null,
        // permissions:[InventoryTransferPermission.request],
        subMenu: [],
      },
      {
        path: `${UrlConfig.INVENTORY_TRANSFERS}/:id`,
        exact: true,
        title: "Chuyển hàng",
        icon: "icon-dot",
        component: DetailTicket,
        key: "submenu31_8",
        isShow: true,
        header: null,
        permissions: [InventoryTransferPermission.read],
        subMenu: [],
      },
      {
        path: `${UrlConfig.INVENTORY_TRANSFERS}/:id/update`,
        exact: true,
        title: "Chuyển hàng",
        icon: "icon-dot",
        component: UpdateTicket,
        key: "submenu31_9",
        isShow: true,
        header: null,
        permissions: [InventoryTransferPermission.update],
        subMenu: [],
      },
      {
        path: `${UrlConfig.INVENTORY_TRANSFERS}/:id/update`,
        exact: true,
        title: "Chuyển hàng",
        icon: "icon-dot",
        component: CopyTicket,
        key: "submenu31_10",
        isShow: true,
        header: null,
        permissions: [InventoryTransferPermission.clone],
        subMenu: [],
      },
      {
        path: `${UrlConfig.INVENTORY_TRANSFERS}/createImport`,
        exact: true,
        title: "Chuyển hàng",
        icon: "icon-dot",
        component: CreateTicketFromExcel,
        key: "submenu31_11",
        isShow: true,
        header: null,
        permissions: [InventoryTransferPermission.import, InventoryTransferPermission.create],
        subMenu: [],
      },
      {
        path: `${UrlConfig.INVENTORY_TRANSFERS}/import`,
        exact: true,
        title: "Chuyển hàng",
        icon: "icon-dot",
        component: ImportInventoryScreen,
        key: "submenu31_12",
        isShow: true,
        header: null,
        permissions: [InventoryTransferPermission.import, InventoryTransferPermission.create],
        subMenu: [],
      },
      {
        path: `${UrlConfig.INVENTORY_TRANSFERS}/import-multiple`,
        exact: true,
        title: "Chuyển hàng",
        icon: "icon-dot",
        component: ImportMultipleInventoryScreen,
        key: "submenu31_12",
        isShow: true,
        header: null,
        permissions: [InventoryTransferPermission.import, InventoryTransferPermission.create],
        subMenu: [],
      },
      {
        path: `${UrlConfig.INVENTORY_TRANSFERS}/import-multiple-from-store`,
        exact: true,
        title: "Chuyển hàng",
        icon: "icon-dot",
        component: ImportOneFromStoreMultipleToStore,
        key: "submenu31_12",
        isShow: true,
        header: null,
        permissions: [InventoryTransferPermission.import, InventoryTransferPermission.create],
        subMenu: [],
      },
      {
        path: `${UrlConfig.INVENTORY_TRANSFERS}/import-multiple-file-one-store`,
        exact: true,
        title: "Chuyển hàng",
        icon: "icon-dot",
        component: ImportOneStoreMultipleInventory,
        key: "submenu31_12",
        isShow: true,
        header: null,
        permissions: [InventoryTransferPermission.import, InventoryTransferPermission.create],
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
    permissions: [InventoryAdjustmentPermission.read],
    subMenu: [
      {
        path: `${UrlConfig.INVENTORY_ADJUSTMENTS}/create`,
        exact: true,
        title: "Thêm mới phiếu kiểm kho",
        icon: "icon-dot",
        component: CreateInventoryAdjustment,
        key: "submenu33",
        isShow: true,
        header: null,
        permissions: [InventoryAdjustmentPermission.create],
        subMenu: [],
      },
      {
        path: `${UrlConfig.INVENTORY_ADJUSTMENTS}/:id`,
        exact: true,
        title: "Chi tiết phiếu kiểm kho",
        icon: "icon-dot",
        component: DetailInvetoryAdjustment,
        key: "submenu33",
        isShow: true,
        header: null,
        permissions: [InventoryAdjustmentPermission.read],
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
    permissions: [InventoryDefectsPermission.read],
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
        permissions: [InventoryDefectsPermission.create],
        subMenu: [],
      },
      {
        path: UrlConfig.INVENTORY_DEFECTS_HISTORY,
        exact: true,
        title: "Lịch sử hàng lỗi",
        icon: "icon-dot",
        component: ListInventoryDefect,
        key: "submenu43",
        isShow: true,
        header: null,
        permissions: [InventoryDefectsPermission.create],
        subMenu: [],
      },
    ],
  },
  {
    path: UrlConfig.STOCK_IN_OUT_OTHERS,
    exact: true,
    title: "Nhập xuất khác",
    icon: "icon-dot",
    component: StockInOutOtherScreen,
    key: "submenu35",
    isShow: true,
    header: null,
    permissions: [StockInOutOthersPermission.read],
    subMenu: [
      {
        path: `${UrlConfig.STOCK_IN_OUT_OTHERS}/create-stock-in`,
        exact: true,
        title: "Thêm nhập khác",
        icon: "icon-dot",
        component: StockInOtherCreate,
        key: "submenu35",
        isShow: true,
        header: null,
        permissions: [StockInOutOthersPermission.create],
        subMenu: [],
      },
      {
        path: `${UrlConfig.STOCK_IN_OUT_OTHERS}/create-stock-out`,
        exact: true,
        title: "Thêm xuất khác",
        icon: "icon-dot",
        component: StockOutOtherCreate,
        key: "submenu35",
        isShow: true,
        header: null,
        permissions: [StockInOutOthersPermission.create],
        subMenu: [],
      },
      {
        path: `${UrlConfig.STOCK_IN_OUT_OTHERS}/:id`,
        exact: true,
        title: "Chi tiết xuất nhập khác",
        icon: "icon-dot",
        component: StockInOutDetail,
        key: "submenu35",
        isShow: true,
        header: null,
        permissions: [StockInOutOthersPermission.read],
        subMenu: [],
      },
    ],
  },
];
