import { ODERS_PERMISSIONS } from "config/permissions/order.permission";
import UrlConfig from "config/url.config";
import { RouteMenu } from "model/other";
import React from "react";

const ListFulfillmentScreen = React.lazy(
  () => import("screens/order-online/list-shipments")
);

// ThirdPartyLogisticsIntegration: Kết nối hãng vận chuyển
const ThirdPartyLogisticsIntegrationScreen = React.lazy(
  () => import("screens/settings/third-party-logistics-integration")
);
const SingleThirdPartyLogisticsIntegrationScreen_GiaoHangNhanh = React.lazy(
  () => import("screens/settings/third-party-logistics-integration/giao-hang-nhanh")
);
const SingleThirdPartyLogisticsIntegrationScreen_ViettelPost = React.lazy(
  () => import("screens/settings/third-party-logistics-integration/viettel-post")
);
const SingleThirdPartyLogisticsIntegrationScreen_DHL = React.lazy(
  () => import("screens/settings/third-party-logistics-integration/dhl")
);
const SingleThirdPartyLogisticsIntegrationScreen_GiaoHangTietKiem = React.lazy(
  () => import("screens/settings/third-party-logistics-integration/giao-hang-tiet-kiem")
);

const shipments: Array<RouteMenu> = [
  {
    path: `${UrlConfig.SHIPMENTS}`,
    exact: true,
    title: "Danh sách đơn giao",
    icon: "icon-dot",
    component: ListFulfillmentScreen,
    key: "submenu66",
    isShow: true,
    header: null,
    permissions: [ODERS_PERMISSIONS.VIEW],
    subMenu: [],
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
    permissions: [ODERS_PERMISSIONS.CONNECT_DELIVERY_SERVICE],
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
    ],
  },
];

export default shipments;