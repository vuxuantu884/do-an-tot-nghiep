import { ORDER_PERMISSIONS } from "config/permissions/order.permission";
import UrlConfig from "config/url.config";
import { RouteMenu } from "model/other";
import React from "react";

const ShipmentsScreen = React.lazy(() => import("screens/order-online/list-shipments"));

const ShipmentsFailedScreen = React.lazy(
  () => import("screens/order-online/list-shipments-failed.screen"),
);

const ShipmentDetailScreen = React.lazy(() => import("screens/order-online/shipment-detail"));

// ThirdPartyLogisticsIntegration: Kết nối hãng vận chuyển
const ThirdPartyLogisticsIntegrationScreen = React.lazy(
  () => import("screens/settings/third-party-logistics-integration"),
);
const SingleThirdPartyLogisticsIntegrationScreen_GiaoHangNhanh = React.lazy(
  () => import("screens/settings/third-party-logistics-integration/giao-hang-nhanh"),
);
const SingleThirdPartyLogisticsIntegrationScreen_ViettelPost = React.lazy(
  () => import("screens/settings/third-party-logistics-integration/viettel-post"),
);
const SingleThirdPartyLogisticsIntegrationScreen_DHL = React.lazy(
  () => import("screens/settings/third-party-logistics-integration/dhl"),
);
const SingleThirdPartyLogisticsIntegrationScreen_GiaoHangTietKiem = React.lazy(
  () => import("screens/settings/third-party-logistics-integration/giao-hang-tiet-kiem"),
);

const SingleThirdPartyLogisticsIntegrationScreen_UnicornBestExpress = React.lazy(
  () => import("screens/settings/third-party-logistics-integration/best-express"),
);

const SingleThirdPartyLogisticsIntegrationScreen_VNPost = React.lazy(
  () => import("screens/settings/third-party-logistics-integration/vn-post"),
);

const SingleThirdPartyLogisticsIntegrationScreen_Snappy = React.lazy(
  () => import("screens/settings/third-party-logistics-integration/snappy"),
);

const SingleThirdPartyLogisticsIntegrationScreen_NhatTin = React.lazy(
  () => import("screens/settings/third-party-logistics-integration/nhat-tin"),
);

const shipments: Array<RouteMenu> = [
  {
    path: `${UrlConfig.SHIPMENTS}`,
    exact: true,
    title: "Danh sách đơn giao",
    icon: "icon-dot",
    component: ShipmentsScreen,
    key: "submenu66",
    isShow: true,
    header: null,
    permissions: [ORDER_PERMISSIONS.READ_SHIPMENTS],
    subMenu: [
      {
        path: `${UrlConfig.SHIPMENTS}/:code`,
        exact: true,
        title: "Chi tiết đơn giao hàng",
        icon: "icon-dot",
        component: ShipmentDetailScreen,
        key: "submenu-shipment-1",
        isShow: true,
        header: null,
        permissions: [ORDER_PERMISSIONS.READ_SHIPMENTS],
        subMenu: [],
      },
    ],
  },
  {
    path: `${UrlConfig.SHIPMENTS_FAILED}`,
    exact: true,
    title: "Danh sách đơn hủy",
    icon: "icon-dot",
    component: ShipmentsFailedScreen,
    key: "submenu67",
    isShow: true,
    header: null,
    permissions: [ORDER_PERMISSIONS.READ_SHIPMENTS],
    subMenu: [
      {
        path: `${UrlConfig.SHIPMENTS}/:code`,
        exact: true,
        title: "Chi tiết đơn giao hàng",
        icon: "icon-dot",
        component: ShipmentDetailScreen,
        key: "submenu-shipment-1",
        isShow: true,
        header: null,
        permissions: [ORDER_PERMISSIONS.READ_SHIPMENTS],
        subMenu: [],
      },
    ],
  },
  {
    path: UrlConfig.THIRD_PARTY_LOGISTICS_INTEGRATION,
    exact: true,
    title: "Kết nối hãng vận chuyển",
    subTitle: "Kết nối hãng vận chuyển",
    icon: "icon-dot",
    component: ThirdPartyLogisticsIntegrationScreen,
    key: "subMenu97",
    isShow: true,
    header: null,
    permissions: [ORDER_PERMISSIONS.CONNECT_DELIVERY_SERVICE],
    subMenu: [
      {
        path: `${UrlConfig.THIRD_PARTY_LOGISTICS_INTEGRATION}/ghn`,
        exact: true,
        title: "Giao hàng nhanh",
        icon: "icon-dot",
        component: SingleThirdPartyLogisticsIntegrationScreen_GiaoHangNhanh,
        key: "giao-hang-nhanh",
        isShow: true,
        header: null,
        subMenu: [],
        pathIgnore: ["create"],
      },
      {
        path: `${UrlConfig.THIRD_PARTY_LOGISTICS_INTEGRATION}/vtp`,
        exact: true,
        title: "Viettel Post",
        icon: "icon-dot",
        component: SingleThirdPartyLogisticsIntegrationScreen_ViettelPost,
        key: "viettel-post",
        isShow: true,
        header: null,
        subMenu: [],
        pathIgnore: ["create"],
      },
      {
        path: `${UrlConfig.THIRD_PARTY_LOGISTICS_INTEGRATION}/dhl`,
        exact: true,
        title: "DHL",
        icon: "icon-dot",
        component: SingleThirdPartyLogisticsIntegrationScreen_DHL,
        key: "dhl",
        isShow: true,
        header: null,
        subMenu: [],
        pathIgnore: ["create"],
      },
      {
        path: `${UrlConfig.THIRD_PARTY_LOGISTICS_INTEGRATION}/ghtk`,
        exact: true,
        title: "Giao hàng tiết kiệm",
        icon: "icon-dot",
        component: SingleThirdPartyLogisticsIntegrationScreen_GiaoHangTietKiem,
        key: "giao-hang-tiet-kiem",
        isShow: true,
        header: null,
        subMenu: [],
        pathIgnore: ["create"],
      },
      {
        path: `${UrlConfig.THIRD_PARTY_LOGISTICS_INTEGRATION}/snappy`,
        exact: true,
        title: "Snappy",
        icon: "icon-dot",
        component: SingleThirdPartyLogisticsIntegrationScreen_Snappy,
        key: "snappy",
        isShow: true,
        header: null,
        subMenu: [],
        pathIgnore: ["create"],
      },
      {
        path: `${UrlConfig.THIRD_PARTY_LOGISTICS_INTEGRATION}/ube`,
        exact: true,
        title: "Unicorn BEST Express",
        icon: "icon-dot",
        component: SingleThirdPartyLogisticsIntegrationScreen_UnicornBestExpress,
        key: "unicorn-best-express",
        isShow: true,
        header: null,
        subMenu: [],
        pathIgnore: ["create"],
      },
      {
        path: `${UrlConfig.THIRD_PARTY_LOGISTICS_INTEGRATION}/nt`,
        exact: true,
        title: "Nhất Tín",
        icon: "icon-dot",
        component: SingleThirdPartyLogisticsIntegrationScreen_NhatTin,
        key: "nhat-tin",
        isShow: true,
        header: null,
        subMenu: [],
        pathIgnore: ["create"],
      },
      {
        path: `${UrlConfig.THIRD_PARTY_LOGISTICS_INTEGRATION}/vnpost`,
        exact: true,
        title: "VN Post",
        icon: "icon-dot",
        component: SingleThirdPartyLogisticsIntegrationScreen_VNPost,
        key: "vnpost",
        isShow: true,
        header: null,
        subMenu: [],
        pathIgnore: ["create"],
      },
    ],
  },
];

export default shipments;
