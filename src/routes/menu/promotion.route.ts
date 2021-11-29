import { PromoPermistion } from "config/permissions/promotion.permisssion";
import UrlConfig from "config/url.config";
import { RouteMenu } from "model/other";
import React from "react";

const accumulate = React.lazy(() => import ("screens/promotion/loyalty/accumulate/index"))
const loyaltyPage = React.lazy(() => import ("screens/promotion/loyalty/index"))
const loyaltyAccumulateDetail = React.lazy(() => import ("screens/promotion/loyalty/accumulate/detail"))
const discountPage = React.lazy(() => import("screens/promotion/discount"))
const priceRulesPage = React.lazy(() => import("screens/promotion/promo-code"))
const createDiscountPage = React.lazy(() => import("screens/promotion/discount/discount.create"))
const detailDiscountPage = React.lazy(() => import("screens/promotion/discount/discount.detail"))
const createPromoCodePage = React.lazy(() => import("screens/promotion/promo-code/promo-code.create"))
const promoCodeDetail = React.lazy(() => import("screens/promotion/promo-code/promo-code.detail"))
const promoCodeList = React.lazy(() => import("screens/promotion/promo-code/promo-code.list"))

const promotion: Array<RouteMenu> = [
  {
    path: `${UrlConfig.PROMOTION}${UrlConfig.LOYALTY}`,
    exact: true,
    title: "Tích điểm",
    icon: 'icon-dot',
    component: loyaltyPage,
    key: "submenu105",
    isShow: true,
    header: null,
    subMenu: [
      {
        path: `${UrlConfig.PROMOTION}${UrlConfig.LOYALTY}`,
        exact: true,
        title: "Cấu hình tích điểm",
        icon: 'icon-dot',
        component: loyaltyPage,
        key: "submenu103",
        isShow: true,
        header: null,
        subMenu: [
          {
            path: `${UrlConfig.PROMOTION}${UrlConfig.LOYALTY}/accumulation`,
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
            path: `${UrlConfig.PROMOTION}${UrlConfig.LOYALTY}/accumulation/:id`,
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
            path: `${UrlConfig.PROMOTION}${UrlConfig.LOYALTY}/accumulation/:id/update`,
            exact: true,
            title: "Cập nhật cấu hình tích điểm",
            icon: "icon-dot",
            component: accumulate,
            key: "submenu1033",
            isShow: true,
            header: null,
            subMenu: [],
          }
        ],
      },
    ],
  },
  {
    path: `${UrlConfig.PROMOTION}${UrlConfig.DISCOUNT}`,
    exact: true,
    title: "Chiết khấu",
    icon: 'icon-dot',
    component: discountPage,
    key: "submenu106",
    isShow: true,
    header: null,
    permissions:[PromoPermistion.READ],
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
        permissions:[PromoPermistion.CREATE],
      },
      {
        path: `${UrlConfig.PROMOTION}${UrlConfig.DISCOUNT}/:id`,
        exact: true,
        title: "Chi tiết chương trình",
        icon: 'icon-dot',
        component: detailDiscountPage,
        key: "submenu106",
        isShow: true,
        header: null,
        subMenu: [],
        permissions:[PromoPermistion.READ],
      },
    ],
  },
  {
    path: `${UrlConfig.PROMOTION}${UrlConfig.PROMO_CODE}`,
    exact: true,
    title: "Mã khuyến mãi",
    icon: 'icon-dot',
    component: priceRulesPage,
    key: "submenu107",
    isShow: true,
    header: null,
    permissions: [PromoPermistion.READ],
    subMenu: [
      {
        path: `${UrlConfig.PROMOTION}${UrlConfig.PROMO_CODE}/create`,
        exact: true,
        title: "Tạo khuyến mãi",
        icon: "icon-dot",
        component: createPromoCodePage,
        key: "submenu1071",
        isShow: true,
        header: null,
        subMenu: [],
        permissions: [PromoPermistion.CREATE],
      },
      {
        path: `${UrlConfig.PROMOTION}${UrlConfig.PROMO_CODE}/:id`,
        exact: true,
        title: "Chi tiết khuyến mãi",
        icon: 'icon-dot',
        component: promoCodeDetail,
        key: "submenu1072",
        isShow: true,
        header: null,
        subMenu: [],
        permissions: [PromoPermistion.READ],
      },
      {
        path: `${UrlConfig.PROMOTION}${UrlConfig.PROMO_CODE}/codes/:id`,
        exact: true,
        title: "Mã chiết khấu đợt phát hành",
        icon: 'icon-dot',
        component: promoCodeList,
        key: "submenu1073",
        isShow: true,
        header: null,
        subMenu: [],
        permissions: [PromoPermistion.READ],
      }
    ],
  },
]

export default promotion;