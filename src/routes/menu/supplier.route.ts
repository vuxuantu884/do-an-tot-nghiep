import { PurchaseOrderPermission } from "config/permissions/purchase-order.permission";
import { SuppliersPermissions } from "config/permissions/supplier.permisssion";
import UrlConfig, { ProcurementTabUrl } from "config/url.config";
import { RouteMenu } from "model/other";
import React from "react";

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
const PurchaseOrderStampPrinting = React.lazy(
    () => import("screens/purchase-order/StampPrinting")
);

//PR
const ProcurementScreen = React.lazy(() => import("screens/products/procurement"));
const ProcurementDetailScreen = React.lazy(() => import("screens/products/procurement/detail/ProcurementDetailScreen"));
const ProcurementCreateScreen = React.lazy(() => import("screens/products/procurement/create"));
const ProcurementCreateManualScreen = React.lazy(() => import("screens/products/procurement/create-manual"));

//SUPPLIER
const ListSupplier = React.lazy(
    () => import("screens/products/supplier/supplier-list.screen")
);
const ViewSupplier = React.lazy(
    () => import("screens/products/supplier/supplier-view.screen")
);

const SupplierCreateScreen = React.lazy(
    () => import("screens/products/supplier/add")
);
const SupplierUpdateScreen = React.lazy(
    () => import("screens/products/supplier/supplier-update.screen")
);
const supplierRoutes: Array<RouteMenu> = [
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
                path: `${UrlConfig.PROCUREMENT}/create-manual`,
                exact: true,
                title: "Tạo phiếu nhập kho",
                icon: "icon-dot",
                component: ProcurementCreateManualScreen,
                key: "submenu252",
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
            {
                path: `${ProcurementTabUrl.PRODUCTS}`,
                exact: true,
                title: "Nhập kho",
                icon: "icon-dot",
                component: ProcurementScreen,
                key: "submenu254",
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
]
export default supplierRoutes;