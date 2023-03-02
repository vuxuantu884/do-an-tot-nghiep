import {
  PriceRulesPermission,
  PromotionReleasePermission,
  PROMOTION_GIFT_PERMISSIONS, PROMOTION_CAMPAIGN_PERMISSIONS,
} from "config/permissions/promotion.permisssion";
import UrlConfig from "config/url.config";
import { RouteMenu } from "model/other";
import React from "react";

const accumulate = React.lazy(() => import("screens/promotion/loyalty/accumulate/index"));
const loyaltyPage = React.lazy(() => import("screens/promotion/loyalty/index"));
const loyaltyAccumulateDetail = React.lazy(
  () => import("screens/promotion/loyalty/accumulate/detail"),
);
const discountPage = React.lazy(() => import("screens/promotion/discount/discount-list"));
const priceRulesPage = React.lazy(() => import("screens/promotion/promo-code"));
const createDiscountPage = React.lazy(
  () => import("screens/promotion/discount/create-v2/discount-create-v2"),
);
const detailDiscountPage = React.lazy(
  () => import("screens/promotion/discount/detail/discount.detail"),
);
const DiscountUpdate = React.lazy(
  () => import("screens/promotion/discount/update/discount.update"),
);
const DiscountReplicate = React.lazy(
  () => import("screens/promotion/discount/replicate/discount.replicate"),
);

const promoCodeDetail = React.lazy(() => import("screens/promotion/promo-code/promo-code.detail"));
const promoCodeList = React.lazy(() => import("screens/promotion/promo-code/promo-code.list"));

const PromoCodeUpdate = React.lazy(() => import("screens/promotion/issue/update/issue-update"));

const CreatePromoCodePage = React.lazy(() => import("screens/promotion/issue/create/issue-create"));

const GiftList = React.lazy(() => import("screens/promotion/gift/GiftList"));
const GiftCreate = React.lazy(() => import("screens/promotion/gift/create/GiftCreate"));
const GiftDetail = React.lazy(() => import("screens/promotion/gift/detail/GiftDetail"));
const GiftUpdate = React.lazy(() => import("screens/promotion/gift/update/GiftUpdate"));

const PromotionCampaignList = React.lazy(() => import("screens/promotion/campaign/PromotionCampaignList"));
const PromotionCampaignCreate = React.lazy(() => import("screens/promotion/campaign/create/PromotionCampaignCreate"));
const PromotionCampaignDetail = React.lazy(() => import("screens/promotion/campaign/detail/PromotionCampaignDetail"));
const PromotionCampaignUpdate = React.lazy(() => import("screens/promotion/campaign/update/PromotionCampaignUpdate"));

const promotion: Array<RouteMenu> = [
  {
    path: `${UrlConfig.LOYALTY}`,
    exact: true,
    title: "Tích điểm",
    icon: "icon-dot",
    component: loyaltyPage,
    key: "submenu105",
    isShow: true,
    header: null,
    subMenu: [
      {
        path: `${UrlConfig.LOYALTY}`,
        exact: true,
        title: "Cấu hình tích điểm",
        icon: "icon-dot",
        component: loyaltyPage,
        key: "submenu103",
        isShow: true,
        header: null,
        subMenu: [
          {
            path: `${UrlConfig.LOYALTY}/accumulation`,
            exact: true,
            title: "Tạo cấu hình tích điểm",
            icon: "icon-dot",
            component: accumulate,
            key: "submenu1032",
            isShow: true,
            header: null,
            subMenu: [],
          },
          {
            path: `${UrlConfig.LOYALTY}/accumulation/:id`,
            exact: true,
            title: "Chi tiết cấu hình tích điểm",
            icon: "icon-dot",
            component: loyaltyAccumulateDetail,
            key: "submenu1031",
            isShow: true,
            header: null,
            subMenu: [],
          },
          {
            path: `${UrlConfig.LOYALTY}/accumulation/:id/update`,
            exact: true,
            title: "Cập nhật cấu hình tích điểm",
            icon: "icon-dot",
            component: accumulate,
            key: "submenu1033",
            isShow: true,
            header: null,
            subMenu: [],
          },
        ],
      },
    ],
  },
  {
    path: `${UrlConfig.PROMOTION}${UrlConfig.DISCOUNT}`,
    exact: true,
    title: "Chiết khấu",
    icon: "icon-dot",
    component: discountPage,
    key: "submenu106",
    isShow: true,
    header: null,
    permissions: [PriceRulesPermission.READ],
    subMenu: [
      {
        path: `${UrlConfig.PROMOTION}${UrlConfig.DISCOUNT}/create`,
        exact: true,
        title: "Tạo chiết khấu",
        icon: "icon-dot",
        component: createDiscountPage,
        key: "submenu1061",
        isShow: true,
        header: null,
        subMenu: [],
        permissions: [PriceRulesPermission.CREATE],
      },
      {
        path: `${UrlConfig.PROMOTION}${UrlConfig.DISCOUNT}/:id`,
        exact: true,
        title: "Chi tiết chương trình",
        icon: "icon-dot",
        component: detailDiscountPage,
        key: "submenu106",
        isShow: true,
        header: null,
        subMenu: [],
        permissions: [PriceRulesPermission.READ],
      },
      {
        path: `${UrlConfig.PROMOTION}${UrlConfig.DISCOUNT}/:id/update`,
        exact: true,
        title: "Sửa chương trình",
        icon: "icon-dot",
        component: DiscountUpdate,
        key: "submenu107",
        isShow: true,
        header: null,
        subMenu: [],
        permissions: [PriceRulesPermission.UPDATE],
      },
      {
        path: `${UrlConfig.PROMOTION}${UrlConfig.DISCOUNT}/:id/replicate`,
        exact: true,
        title: "Nhân bản chương trình",
        icon: "icon-dot",
        component: DiscountReplicate,
        key: "discount-replicate",
        isShow: true,
        header: null,
        subMenu: [],
        permissions: [PriceRulesPermission.CREATE],
      },
    ],
  },
  {
    path: `${UrlConfig.PROMOTION}${UrlConfig.PROMO_CODE}`,
    exact: true,
    title: "Mã khuyến mại",
    icon: "icon-dot",
    component: priceRulesPage,
    key: "submenu108",
    isShow: true,
    header: null,
    permissions: [PromotionReleasePermission.READ],
    subMenu: [
      {
        path: `${UrlConfig.PROMOTION}${UrlConfig.PROMO_CODE}/create`,
        exact: true,
        title: "Tạo đợt phát hành khuyến mại",
        icon: "icon-dot",
        component: CreatePromoCodePage,
        key: "submenu1071",
        isShow: true,
        header: null,
        subMenu: [],
        permissions: [PromotionReleasePermission.CREATE],
      },
      {
        path: `${UrlConfig.PROMOTION}${UrlConfig.PROMO_CODE}/:id/update`,
        exact: true,
        title: "Sửa đợt phát hành khuyến mại",
        icon: "icon-dot",
        component: PromoCodeUpdate,
        key: "submenu1074",
        isShow: true,
        header: null,
        subMenu: [],
        permissions: [PromotionReleasePermission.UPDATE],
      },
      {
        path: `${UrlConfig.PROMOTION}${UrlConfig.PROMO_CODE}/:id`,
        exact: true,
        title: "Chi tiết đợt phát hành khuyến mại",
        icon: "icon-dot",
        component: promoCodeDetail,
        key: "submenu1072",
        isShow: true,
        header: null,
        subMenu: [],
        permissions: [PromotionReleasePermission.READ],
      },
      {
        path: `${UrlConfig.PROMOTION}${UrlConfig.PROMO_CODE}/codes/:id`,
        exact: true,
        title: "Mã chiết khấu đợt phát hành",
        icon: "icon-dot",
        component: promoCodeList,
        key: "submenu1073",
        isShow: true,
        header: null,
        subMenu: [],
        permissions: [PromotionReleasePermission.READ],
      },
    ],
  },
  {
    path: `${UrlConfig.PROMOTION}${UrlConfig.GIFT}`,
    exact: true,
    title: "Quà tặng",
    icon: "icon-dot",
    component: GiftList,
    key: "gift-list",
    isShow: true,
    header: null,
    permissions: [PROMOTION_GIFT_PERMISSIONS.READ],
    subMenu: [
      {
        path: `${UrlConfig.PROMOTION}${UrlConfig.GIFT}/create`,
        exact: true,
        title: "Tạo quà tặng",
        icon: "icon-dot",
        component: GiftCreate,
        key: "gift-create",
        isShow: true,
        header: null,
        subMenu: [],
        permissions: [PROMOTION_GIFT_PERMISSIONS.CREATE],
      },
      {
        path: `${UrlConfig.PROMOTION}${UrlConfig.GIFT}/:id`,
        exact: true,
        title: "Chi tiết quà tặng",
        icon: "icon-dot",
        component: GiftDetail,
        key: "gift-detail",
        isShow: true,
        header: null,
        subMenu: [],
        permissions: [PROMOTION_GIFT_PERMISSIONS.READ],
      },
      {
        path: `${UrlConfig.PROMOTION}${UrlConfig.GIFT}/:id/update`,
        exact: true,
        title: "Cập nhật quà tặng",
        icon: "icon-dot",
        component: GiftUpdate,
        key: "gift-update",
        isShow: true,
        header: null,
        subMenu: [],
        permissions: [PROMOTION_GIFT_PERMISSIONS.UPDATE],
      },
    ],
  },
  {
    path: `${UrlConfig.PROMOTION}${UrlConfig.CAMPAIGN}`,
    exact: true,
    title: "Quản lý chương trình KM",
    icon: "icon-dot",
    component: PromotionCampaignList,
    key: "promotion-campaigns",
    isShow: true,
    header: null,
    permissions: [PROMOTION_CAMPAIGN_PERMISSIONS.READ],
    subMenu: [
      {
        path: `${UrlConfig.PROMOTION}${UrlConfig.CAMPAIGN}/create`,
        exact: true,
        title: "Tạo chương trình KM",
        icon: "icon-dot",
        component: PromotionCampaignCreate,
        key: "promotion-campaign-create",
        isShow: true,
        header: null,
        subMenu: [],
        permissions: [PROMOTION_CAMPAIGN_PERMISSIONS.CREATE],
      },
      {
        path: `${UrlConfig.PROMOTION}${UrlConfig.CAMPAIGN}/:id`,
        exact: true,
        title: "Chi tiết chương trình KM",
        icon: "icon-dot",
        component: PromotionCampaignDetail,
        key: "promotion-campaigns-detail",
        isShow: true,
        header: null,
        subMenu: [],
        permissions: [PROMOTION_CAMPAIGN_PERMISSIONS.READ],
      },
      {
        path: `${UrlConfig.PROMOTION}${UrlConfig.CAMPAIGN}/:id/update`,
        exact: true,
        title: "Sửa chương trình KM",
        icon: "icon-dot",
        component: PromotionCampaignUpdate,
        key: "promotion-campaigns-update",
        isShow: true,
        header: null,
        subMenu: [],
        permissions: [PROMOTION_CAMPAIGN_PERMISSIONS.UPDATE],
      },
    ],
  },
];

export default promotion;
