import {PromoPermistion} from "config/permissions/promotion.permisssion";
import UrlConfig from "config/url.config";
import {RouteMenu} from "model/other";
import React from "react";

const accumulate = React.lazy(() => import("screens/promotion/loyalty/accumulate/index"));
const loyaltyPage = React.lazy(() => import("screens/promotion/loyalty/index"));
const loyaltyAccumulateDetail = React.lazy(
  () => import("screens/promotion/loyalty/accumulate/detail")
);
const discountPage = React.lazy(() => import("screens/promotion/discount/discount-list"));
const priceRulesPage = React.lazy(() => import("screens/promotion/promo-code"));
const createDiscountPage = React.lazy(
  () => import("screens/promotion/discount/create-v2/discount-create-v2")
);
const detailDiscountPage = React.lazy(
  () => import("screens/promotion/discount/detail/discount.detail")
);
const DiscountUpdate = React.lazy(
  () => import("screens/promotion/discount/update/discount.update")
);

const promoCodeDetail = React.lazy(
  () => import("screens/promotion/promo-code/promo-code.detail")
);
const promoCodeList = React.lazy(
  () => import("screens/promotion/promo-code/promo-code.list")
);

const PromoCodeUpdate = React.lazy( 
  () => import("screens/promotion/issue/update/issue-update")
);

const CreatePromoCodePage = React.lazy(
  () => import("screens/promotion/issue/create/issue-create")
);
// const GiftCreate = React.lazy(() => import("screens/promotion/gift/gift.create"));
// const GiftList = React.lazy(() => import("screens/promotion/gift/gift.list"));

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
    permissions: [PromoPermistion.READ],
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
        permissions: [PromoPermistion.CREATE],
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
        permissions: [PromoPermistion.READ],
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
        permissions: [PromoPermistion.UPDATE],
      },
    ],
  },
  // {
  //   path: `${UrlConfig.PROMOTION}${UrlConfig.GIFT}`,
  //   exact: true,
  //   title: "Quà tặng",
  //   icon: "icon-dot",
  //   component: GiftList,
  //   key: "submenu110",
  //   isShow: true,
  //   header: null,
  //   permissions: [PromoPermistion.READ],
  //   subMenu: [
  //     {
  //       path: `${UrlConfig.PROMOTION}${UrlConfig.GIFT}/create`,
  //       exact: true,
  //       title: "Tạo quà tặng",
  //       icon: "icon-dot",
  //       component: GiftCreate,
  //       key: "submenu110",
  //       isShow: true,
  //       header: null,
  //       permissions: [PromoPermistion.READ],
  //       subMenu: [],
  //     },
  //   ],
  // },
  {
    path: `${UrlConfig.PROMOTION}${UrlConfig.PROMO_CODE}`,
    exact: true,
    title: "Mã khuyến mãi",
    icon: "icon-dot",
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
        component: CreatePromoCodePage,
        key: "submenu1071",
        isShow: true,
        header: null,
        subMenu: [],
        permissions: [PromoPermistion.CREATE],
      },
      {
        path: `${UrlConfig.PROMOTION}${UrlConfig.PROMO_CODE}/:id/update`,
        exact: true,
        title: "Sửa khuyến mãi",
        icon: "icon-dot",
        component: PromoCodeUpdate,
        key: "submenu1074",
        isShow: true,
        header: null,
        subMenu: [],
        permissions: [PromoPermistion.UPDATE],
      },
      {
        path: `${UrlConfig.PROMOTION}${UrlConfig.PROMO_CODE}/:id`,
        exact: true,
        title: "Chi tiết khuyến mãi",
        icon: "icon-dot",
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
        icon: "icon-dot",
        component: promoCodeList,
        key: "submenu1073",
        isShow: true,
        header: null,
        subMenu: [],
        permissions: [PromoPermistion.READ],
      },
    ],
  },
];

export default promotion;
