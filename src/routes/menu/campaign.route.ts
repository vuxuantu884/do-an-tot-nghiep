import UrlConfig from "config/url.config";
import { RouteMenu } from "model/other";
import React from "react";

const Campaign = React.lazy(() => import("screens/marketing/campaign/Campaign"));
const CampaignDetail = React.lazy(() => import("screens/marketing/campaign/campaign-detail/CampaignDetail"));
const CampaignCreateUpdate = React.lazy(() => import("screens/marketing/campaign/campaign-create/CampaignCreate"));


const campaign: Array<RouteMenu> = [
  {
    path: `${UrlConfig.MARKETING}/campaigns`,
    exact: true,
    title: "Danh sách chiến dịch",
    icon: "icon-dot",
    component: Campaign,
    key: "campaigns_list",
    isShow: true,
    header: null,
    subMenu: [
      {
        path: `${UrlConfig.MARKETING}/campaigns/create`,
        exact: true,
        title: "Thêm chiến dịch gửi tin",
        icon: "icon-dot",
        component: CampaignCreateUpdate,
        key: "campaigns_create",
        isShow: true,
        header: null,
        // permissions: [],
        subMenu: [],
      },
      {
        path: `${UrlConfig.MARKETING}/campaigns/:id`,
        exact: true,
        title: "Chi tiết chiến dịch gửi tin",
        icon: "icon-dot",
        component: CampaignDetail,
        key: "campaigns_detail",
        isShow: true,
        header: null,
        // permissions: [],
        subMenu: [],
      },
      {
        path: `${UrlConfig.MARKETING}/campaigns/:id/update`,
        exact: true,
        title: "Cập nhật chiến dịch gửi tin",
        icon: "icon-dot",
        component: CampaignCreateUpdate,
        key: "campaigns_update",
        isShow: true,
        header: null,
        // permissions: [],
        subMenu: [],
      },
    ],
  },
  // {
  //   path: `${UrlConfig.MARKETING}/config`,
  //   exact: true,
  //   title: `Cấu hình`,
  //   icon: "icon-dot",
  //   component: PointAdjustmentDetail,
  //   key: "campaigns_config",
  //   isShow: true,
  //   header: null,
  //   subMenu: [],
  // },
];

export default campaign;
