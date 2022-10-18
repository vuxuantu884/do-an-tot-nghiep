import { BaseQuery } from "model/base/base.query";
import BaseResponse from "base/base.response";
import { PageResponse } from "model/base/base-metadata.response";
import { generateQuery } from "utils/AppUtils";
import BaseAxios from "base/base.axios";
import { ApiConfig } from "config/api.config";
import { PromotionGift, GiftVariant } from "model/promotion/gift.model";

const PRICE_RULES = "/price-rules";
const PRICE_RULE_GIFTS = "/price-rule-gifts";


/** Promotion Gift List */
export const getPromotionGiftListService = (
  query: BaseQuery,
): Promise<BaseResponse<PageResponse<PromotionGift>>> => {
  let params = generateQuery(query);
  return BaseAxios.get(`${ApiConfig.PROMOTION}${PRICE_RULE_GIFTS}?${params}`);
};

export const getPromotionGiftDetailService = (id: number): Promise<PromotionGift> => {
  return BaseAxios.get(`${ApiConfig.PROMOTION}${PRICE_RULE_GIFTS}/${id}`);
};

export const getPromotionGiftProductApplyService = (
  id: number,
  params?: BaseQuery,
): Promise<BaseResponse<PageResponse<GiftVariant>>> => {
  return BaseAxios.get(`${ApiConfig.PROMOTION}${PRICE_RULES}/${id}/variant-items`, { params });
};

export const getPromotionGiftVariantService = (
  id: number,
  params?: BaseQuery,
): Promise<BaseResponse<PageResponse<PromotionGift>>> => {
  return BaseAxios.get(`${ApiConfig.PROMOTION}${PRICE_RULES}/${id}/gifts`, { params });
};

export const createPromotionGiftService = (discountForm: Partial<PromotionGift>): Promise<any> => {
  return BaseAxios.post(`${ApiConfig.PROMOTION}${PRICE_RULE_GIFTS}`, discountForm);
};

export const enablePromotionGiftService = (id: number): Promise<any> => {
  return BaseAxios.put(`${ApiConfig.PROMOTION}${PRICE_RULE_GIFTS}/${id}/active`);
};

export const disablePromotionGiftService = (id: number): Promise<any> => {
  return BaseAxios.put(`${ApiConfig.PROMOTION}${PRICE_RULE_GIFTS}/${id}/disable`);
};

export const updatePromotionGiftService = (body: any): Promise<PromotionGift> => {
  return BaseAxios.put(`${ApiConfig.PROMOTION}${PRICE_RULE_GIFTS}/${body.id}`, body);
};
