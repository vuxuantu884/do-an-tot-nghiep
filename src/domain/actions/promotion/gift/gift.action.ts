import BaseAction from "base/base.action";
import { BaseQuery } from "model/base/base.query";
import { PageResponse } from "model/base/base-metadata.response";
import { DiscountType, PromotionGiftType } from "domain/types/promotion.type";
import { PromotionGift, GiftProductEntitlements, GiftVariant } from "model/promotion/gift.model";
import { searchProductDiscountVariantQuery } from "model/discount/discount.model";


/** Promotion Gift */
export const getPromotionGiftListAction = (
  query: BaseQuery,
  setData: (data: PageResponse<PromotionGift>) => void,
) => {
  return BaseAction(PromotionGiftType.GET_PROMOTION_GIFT_LIST, { query, setData });
};

export const getPromotionGiftProductApplyAction = (
  id: number,
  params: BaseQuery,
  onResult: (result: PageResponse<GiftVariant>) => void,
) => {
  return BaseAction(PromotionGiftType.GET_PROMOTION_GIFT_PRODUCT_APPLY, {
    id,
    params,
    onResult,
  });
};

export const getPromotionGiftVariantAction = (
  id: number,
  params: BaseQuery,
  onResult: (result: PageResponse<GiftVariant>) => void,
) => {
  return BaseAction(PromotionGiftType.GET_PROMOTION_GIFT_VARIANT, {
    id,
    params,
    onResult,
  });
};

export const enablePromotionGiftAction = (
  id: number,
  enableCallback: (response: any) => void,
) => {
  return BaseAction(PromotionGiftType.ENABLE_PROMOTION_GIFT, { id, enableCallback });
};

export const disablePromotionGiftAction = (
  id: number,
  disableCallback: (response: any) => void,
) => {
  return BaseAction(PromotionGiftType.DISABLE_PROMOTION_GIFT, { id, disableCallback });
};
export const updatePromotionGiftAction = (
  body: Partial<PromotionGift>,
  onResult: (result: PromotionGift) => void,
) => {
  return BaseAction(PromotionGiftType.UPDATE_PROMOTION_GIFT, { body, onResult });
};

export const createPromotionGiftAction = (
  body: Partial<PromotionGift>,
  onResult: (result: PromotionGift) => void,
) => {
  return BaseAction(PromotionGiftType.CREATE_PROMOTION_GIFT, { body, onResult });
};

export const getPromotionGiftDetailAction = (id: number, onResult: (result: PromotionGift) => void) => {
  return BaseAction(PromotionGiftType.GET_PROMOTION_GIFT_DETAIL, { id, onResult });
};

export const searchProductDiscountVariantAction = (
  id: number,
  query: searchProductDiscountVariantQuery,
  setData: (data: GiftProductEntitlements) => void,
) => {
  return BaseAction(DiscountType.SEARCH_PRODUCT_DISCOUNT_VARIANT, { id, query, setData });
};
