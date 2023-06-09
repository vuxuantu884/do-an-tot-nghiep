import BaseAction from "base/base.action";
import {
  DiscountCode,
  DiscountUsageDetailResponse,
  PriceRule,
} from "model/promotion/price-rules.model";
import { PageResponse } from "model/base/base-metadata.response";
import { PromoCodeType } from "domain/types/promotion.type";
import { BaseQuery } from "model/base/base.query";
import { VariantResponse } from "model/product/product.model";

export const createPromotionReleaseAction = (
  body: PriceRule,
  callback: (response: PriceRule) => void,
) => {
  return BaseAction(PromoCodeType.CREATE_PROMOTION_RELEASE, { body, callback });
};

export const updatePromotionReleaseAction = (body: any, callback: (response: any) => void) => {
  return BaseAction(PromoCodeType.UPDATE_PROMOTION_RELEASE, { body, callback });
};

export const getPromotionReleaseListAction = (
  query: any,
  setData: (data: PageResponse<PriceRule>) => void,
) => {
  return BaseAction(PromoCodeType.GET_PROMOTION_RELEASE_LIST, { query, setData });
};

export const getPromotionReleaseDetailAction = (
  id: number,
  callback: (response: PriceRule) => void,
) => {
  return BaseAction(PromoCodeType.GET_PROMOTION_RELEASE_DETAIL, { id, callback });
};

export const activatePromotionReleaseAction = (body: any, callback: (response: any) => void) => {
  return BaseAction(PromoCodeType.ENABLE_PROMOTION_RELEASE, { body, callback });
};

export const deactivatePromotionReleaseAction = (body: any, callback: (response: any) => void) => {
  return BaseAction(PromoCodeType.DISABLE_PROMOTION_RELEASE, { body, callback });
};

export const checkPromoCode = (
  code: string,
  handleResponse: (data: PageResponse<PriceRule>) => void,
) => {
  return BaseAction(PromoCodeType.CHECK_PROMO_CODE, { code, handleResponse });
};

export const getPromoCodeById = (
  priceRuleId: number,
  id: number,
  onResult: (result: PriceRule | false) => void,
) => {
  return BaseAction(PromoCodeType.GET_PROMO_CODE_BY_ID, {
    priceRuleId,
    id,
    onResult,
  });
};

export const getDiscountUsageDetailAction = (
  discountCode: string,
  onResult: (result: Array<DiscountUsageDetailResponse> | false) => void,
) => {
  return BaseAction(PromoCodeType.GET_DISCOUNT_USAGE_DETAIL, {
    discountCode,
    onResult,
  });
};

export const deletePromoCodeById = (
  priceRuleId: number,
  id: number,
  deleteCallBack: (result: PriceRule | false) => void,
) => {
  return BaseAction(PromoCodeType.DELETE_PROMO_CODE_BY_ID, {
    priceRuleId,
    id,
    deleteCallBack,
  });
};

export const updatePromoCodeById = (
  priceRuleId: number,
  body: any,
  updateCallBack: (result: PriceRule | false) => void,
) => {
  return BaseAction(PromoCodeType.UPDATE_PROMO_CODE_BY_ID, {
    priceRuleId,
    body,
    updateCallBack,
  });
};

export const addPromoCode = (
  priceRuleId: number,
  body: any,
  addCallBack: (result: PriceRule | false) => void,
) => {
  return BaseAction(PromoCodeType.ADD_PROMO_CODE, {
    priceRuleId,
    body,
    addCallBack,
  });
};

export const deleteBulkPromoCode = (
  priceRuleId: number,
  body: any,
  deleteCallBack: (result: PriceRule | false) => void,
) => {
  return BaseAction(PromoCodeType.DELETE_PROMO_CODE_BULK, {
    priceRuleId,
    body,
    deleteCallBack,
  });
};

export const publishedBulkPromoCode = (
  priceRuleId: number,
  body: any,
  publishedCallBack: (result: PriceRule | false) => void,
) => {
  return BaseAction(PromoCodeType.PUBLISHED_PROMO_CODE_BULK, {
    priceRuleId,
    body,
    publishedCallBack,
  });
};
export const enableBulkPromoCode = (
  priceRuleId: number,
  body: any,
  enableCallBack: (result: PriceRule | false) => void,
) => {
  return BaseAction(PromoCodeType.ENABLE_PROMO_CODE_BULK, {
    priceRuleId,
    body,
    enableCallBack,
  });
};
export const disableBulkPromoCode = (
  priceRuleId: number,
  body: any,
  disableCallBack: (result: PriceRule | false) => void,
) => {
  return BaseAction(PromoCodeType.DISABLE_PROMO_CODE_BULK, {
    priceRuleId,
    body,
    disableCallBack,
  });
};

export const getListPromoCode = (
  priceRuleId: number,
  query: BaseQuery,
  setData: (data: PageResponse<DiscountCode>) => void,
) => {
  return BaseAction(PromoCodeType.GET_LIST_PROMO_CODE, {
    priceRuleId,
    query,
    setData,
  });
};

export const getPriceRuleVariantExcludePaggingAction = (
  id: number,
  params: BaseQuery,
  onResult: (result: PageResponse<VariantResponse>) => void,
) => {
  return BaseAction(PromoCodeType.GET_PRODUCT_QUANTITY_EXCLUDE, {
    id,
    params,
    onResult,
  });
};
