import UrlConfig, { WARRANTY_URL } from "config/url.config";
import { RouteMenu } from "model/other";
import React from "react";

const WarrantyHistoryList = React.lazy(
  () => import("screens/warranty/history-list/WarrantyList"),
);
const CreateWarranty = React.lazy(() => import("screens/warranty/create"));
const ReadWarranty = React.lazy(
  () => import("screens/warranty/WarrantyDetail"),
);

const WarrantyStatuses = React.lazy(
  () =>
    import("screens/warranty/WarrantyProductStatus/WarrantyProductStatuses"),
);
const WarrantyStatusCreate = React.lazy(
  () =>
    import(
      "screens/warranty/WarrantyProductStatus/WarrantyProductStatusCreate"
    ),
);
const WarrantyStatusDetail = React.lazy(
  () =>
    import(
      "screens/warranty/WarrantyProductStatus/WarrantyProductStatusDetail"
    ),
);

const WarrantyReasons = React.lazy(
  () => import("screens/warranty/WarrantyReason/WarrantyReasons"),
);
const WarrantyReasonCreate = React.lazy(
  () => import("screens/warranty/WarrantyReason/WarrantyProductStatusCreate"),
);
const WarrantyReasonDetail = React.lazy(
  () => import("screens/warranty/WarrantyReason/WarrantyReasonDetail"),
);

const WarrantyCenters = React.lazy(
  () => import("screens/warranty/WarrantyCenter/WarrantyCenters"),
);
const WarrantyCenterCreate = React.lazy(
  () => import("screens/warranty/WarrantyCenter/WarrantyCenterCreate"),
);
const WarrantyCenterDetail = React.lazy(
  () => import("screens/warranty/WarrantyCenter/WarrantyCenterDetail"),
);

const warrantyRoute: Array<RouteMenu> = [
  {
    path: `${UrlConfig.WARRANTY}`,
    exact: true,
    title: "Lịch sử bảo hành",
    icon: "icon-dot",
    component: WarrantyHistoryList,
    key: "warranty-history-list",
    isShow: true,
    header: null,
    permissions: [],
    subMenu: [
      {
        path: `${UrlConfig.WARRANTY}/create`,
        exact: true,
        title: "Tạo phiếu bảo hành",
        icon: "icon-dot",
        component: CreateWarranty,
        key: "warranty-histoty-create",
        isShow: true,
        header: null,
        subMenu: [],
        permissions: [],
      },
      {
        path: `${UrlConfig.WARRANTY}/:id`,
        exact: true,
        title: "Xem phiếu bảo hành",
        icon: "icon-dot",
        component: ReadWarranty,
        key: "warranty-histoty-details",
        isShow: true,
        header: null,
        subMenu: [],
        permissions: [],
      },
    ],
  },
  {
    path: `${UrlConfig.WARRANTY}/${WARRANTY_URL.productStatus}`,
    exact: true,
    title: "Trạng thái",
    icon: "icon-dot",
    component: WarrantyStatuses,
    key: "warranty-product-status",
    isShow: false,
    header: null,
    permissions: [],
    subMenu: [
      {
        path: `${UrlConfig.WARRANTY}/${WARRANTY_URL.productStatus}/create`,
        exact: true,
        title: "Thêm mới trạng thái",
        icon: "icon-dot",
        component: WarrantyStatusCreate,
        key: "warranty-product-status-create",
        isShow: true,
        header: null,
        subMenu: [],
        permissions: [],
      },
      {
        path: `${UrlConfig.WARRANTY}/${WARRANTY_URL.productStatus}/:id`,
        exact: true,
        title: "Xem phiếu bảo hành",
        icon: "icon-dot",
        component: WarrantyStatusDetail,
        key: "warranty-status-details",
        isShow: true,
        header: null,
        subMenu: [],
        permissions: [],
      },
    ],
  },
  {
    path: `${UrlConfig.WARRANTY}/${WARRANTY_URL.reason}`,
    exact: true,
    title: "Lý do bảo hành",
    icon: "icon-dot",
    component: WarrantyReasons,
    key: "warranty-reason",
    isShow: true,
    header: null,
    permissions: [],
    subMenu: [
      {
        path: `${UrlConfig.WARRANTY}/${WARRANTY_URL.reason}/create`,
        exact: true,
        title: "Thêm mới lý do bảo hành",
        icon: "icon-dot",
        component: WarrantyReasonCreate,
        key: "warranty-status-create",
        isShow: true,
        header: null,
        subMenu: [],
        permissions: [],
      },
      {
        path: `${UrlConfig.WARRANTY}/${WARRANTY_URL.reason}/:id`,
        exact: true,
        title: "Chi tiết lý do bảo hành",
        icon: "icon-dot",
        component: WarrantyReasonDetail,
        key: "warranty-status-details",
        isShow: true,
        header: null,
        subMenu: [],
        permissions: [],
      },
    ],
  },
  {
    path: `${UrlConfig.WARRANTY}/${WARRANTY_URL.center}`,
    exact: true,
    title: "Trung tâm bảo hành",
    icon: "icon-dot",
    component: WarrantyCenters,
    key: "warranty-center",
    isShow: true,
    header: null,
    permissions: [],
    subMenu: [
      {
        path: `${UrlConfig.WARRANTY}/${WARRANTY_URL.center}/create`,
        exact: true,
        title: "Thêm mới trung tâm bảo hành",
        icon: "icon-dot",
        component: WarrantyCenterCreate,
        key: "warranty-center-create",
        isShow: true,
        header: null,
        subMenu: [],
        permissions: [],
      },
      {
        path: `${UrlConfig.WARRANTY}/${WARRANTY_URL.center}/:id`,
        exact: true,
        title: "Chi tiết trung tâm bảo hành",
        icon: "icon-dot",
        component: WarrantyCenterDetail,
        key: "warranty-center-details",
        isShow: true,
        header: null,
        subMenu: [],
        permissions: [],
      },
    ],
  },
];
export default warrantyRoute;
