import { PurchaseOrderPermission } from "config/permissions/purchase-order.permission";
import { SuppliersPermissions } from "config/permissions/supplier.permisssion";
import UrlConfig, { ProcurementTabUrl } from "config/url.config";
import { RouteMenu } from "model/other";
import React from "react";
import { PurchaseOrderTabUrl } from "screens/purchase-order/helper";

//PO
const PurchaseOrderScreen = React.lazy(
  () => import("screens/purchase-order/PurchaseOrderScreen/PurchaseOrderScreen"),
);
const PurchaseOrderDetail = React.lazy(
  () => import("screens/purchase-order/PurchaseOrderScreen/PurchaseOrderDetail"),
);

const PurchaseOrderCreateScreen = React.lazy(
  () => import("screens/purchase-order/purchase-order-create.screen"),
);
const PurchaseOrderDetailScreen = React.lazy(
  () => import("screens/purchase-order/purchase-order-detail.screen"),
);
const PurchaseOrderReturnScreen = React.lazy(
  () => import("screens/purchase-order/purchase-order-return.screen"),
);
const PurchaseOrderStampPrinting = React.lazy(() => import("screens/purchase-order/StampPrinting"));

//PR
const ProcurementListScreen = React.lazy(() => import("screens/procurement/ProcurementListScreen"));
const ProcurementDetailScreen = React.lazy(
  () => import("screens/procurement/ProcurementDetailScreen"),
);
const ProcurementCreateScreen = React.lazy(
  () => import("screens/procurement/ProcurementAutoCreateScreen"),
);
const ProcurementCreateManualScreen = React.lazy(
  () => import("screens/procurement/ProcurementCreateManualScreen"),
);

//SUPPLIER
const ListSupplier = React.lazy(() => import("screens/supplier/supplier-list.screen"));
const ViewSupplier = React.lazy(() => import("screens/supplier/supplier-view.screen"));

const SupplierCreateScreen = React.lazy(() => import("screens/supplier/add"));
const SupplierUpdateScreen = React.lazy(() => import("screens/supplier/supplier-update.screen"));
const supplierRoutes: Array<RouteMenu> = [
  {
    path: UrlConfig.PURCHASE_ORDERS,
    exact: true,
    title: "Đặt hàng",
    icon: "icon-dot",
    component: PurchaseOrderScreen,
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

      {
        path: `${UrlConfig.PURCHASE_ORDERS}/:id/stamp-printing`,
        exact: true,
        title: "In barcode đơn đặt hàng",
        icon: "icon-dot",
        component: PurchaseOrderStampPrinting,
        key: "submenu224",
        isShow: true,
        header: null,
        permissions: [PurchaseOrderPermission.print],
        subMenu: [],
      },
      {
        path: `${PurchaseOrderTabUrl.RETURN}`,
        exact: true,
        title: "Quản lý đơn đặt hàng",
        icon: "icon-dot",
        component: PurchaseOrderScreen,
        key: "submenu225",
        isShow: true,
        header: null,
        permissions: [PurchaseOrderPermission.read],
        subMenu: [
          {
            path: `${PurchaseOrderTabUrl.RETURN}/:id`,
            exact: true,
            title: "Chi tiết phiếu trả hàng",
            icon: "icon-dot",
            component: PurchaseOrderDetail,
            // component: PurchaseOrderReturnScreen,
            key: "submenu223",
            isShow: true,
            header: null,
            permissions: [PurchaseOrderPermission.read],
            subMenu: [],
          },
        ],
      },
    ],
  },
  {
    path: `${UrlConfig.PROCUREMENT}`,
    exact: true,
    title: "Nhập kho",
    icon: "icon-dot",
    component: ProcurementListScreen,
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
        key: "submenu250",
        isShow: true,
        header: null,
        permissions: [PurchaseOrderPermission.procurements_create],
        subMenu: [],
      },
      {
        path: `${UrlConfig.PROCUREMENT}/create-manual`,
        exact: true,
        title: "Tạo phiếu nhập kho",
        icon: "icon-dot",
        component: ProcurementCreateManualScreen,
        key: "submenu251",
        isShow: true,
        header: null,
        permissions: [PurchaseOrderPermission.procurements_create],
        subMenu: [],
      },
      {
        path: `${UrlConfig.PURCHASE_ORDERS}/:id/procurements/:prID`,
        exact: true,
        title: "Chi tiết phiếu nhập kho",
        icon: "icon-dot",
        component: ProcurementDetailScreen,
        key: "submenu252",
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
        component: ProcurementListScreen,
        key: "submenu253",
        isShow: true,
        header: null,
        permissions: [PurchaseOrderPermission.procurements_read],
        subMenu: [],
      },
      {
        path: `${ProcurementTabUrl.PRODUCTS}`,
        exact: true,
        title: "Sản phẩm nhập kho",
        icon: "icon-dot",
        component: ProcurementListScreen,
        key: "submenu254",
        isShow: true,
        header: null,
        permissions: [PurchaseOrderPermission.procurements_read],
        subMenu: [],
      },
      {
        path: `${ProcurementTabUrl.TODAY}`,
        exact: true,
        title: "Nhập kho trong ngày",
        icon: "icon-dot",
        component: ProcurementListScreen,
        key: "submenu255",
        isShow: true,
        header: null,
        permissions: [PurchaseOrderPermission.procurements_read],
        subMenu: [],
      },
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
      // {
      //   path: `${ProcurementTabUrl.LOGS}`,
      //   exact: true,
      //   title: "Lịch sử phiếu nhập kho",
      //   icon: "icon-dot",
      //   component: ProcurementListScreen,
      //   key: "submenu256",
      //   isShow: true,
      //   header: null,
      //   permissions: [PurchaseOrderPermission.procurements_read],
      //   subMenu: [],
      // },
    ],
  },
  {
    path: UrlConfig.SUPPLIERS,
    exact: true,
    title: "Quản lý NCC",
    icon: "icon-dot",
    component: ListSupplier,
    key: "submenu236",
    isShow: true,
    header: null,
    permissions: [SuppliersPermissions.READ],
    subMenu: [
      {
        path: `${UrlConfig.SUPPLIERS}/create`,
        exact: true,
        title: "Thêm mới nhà cung cấp",
        icon: "icon-dot",
        component: SupplierCreateScreen,
        key: "submenu2361",
        isShow: true,
        header: null,
        subMenu: [],
        permissions: [SuppliersPermissions.CREATE],
      },
      {
        path: `${UrlConfig.SUPPLIERS}/:id/update`,
        exact: true,
        title: "Sửa nhà cung cấp",
        icon: "icon-dot",
        component: SupplierUpdateScreen,
        key: "submenu2362",
        isShow: true,
        header: null,
        subMenu: [],
        pathIgnore: ["create"],
        permissions: [SuppliersPermissions.UPDATE, SuppliersPermissions.READ],
      },
      {
        path: `${UrlConfig.SUPPLIERS}/:id`,
        exact: false,
        title: "Chi tiết nhà cung cấp",
        icon: "icon-dot",
        component: ViewSupplier,
        key: "submenu2351",
        isShow: true,
        header: null,
        subMenu: [],
        permissions: [SuppliersPermissions.READ],
      },
    ],
  },
];
export default supplierRoutes;
