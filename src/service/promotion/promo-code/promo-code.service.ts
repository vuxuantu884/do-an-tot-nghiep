import { generateQuery } from "utils/AppUtils";
import BaseAxios from "base/base.axios";
import BaseResponse from "base/base.response";
import { BaseQuery } from "model/base/base.query";
import { PageResponse } from "model/base/base-metadata.response";
import { ApiConfig } from "config/api.config";
import { DiscountCode, DiscountUsageDetailResponse, PriceRule } from "model/promotion/price-rules.model";

const END_POINT = "/price-rules/";
const PROMOTION_RELEASE_END_POINT = "/price-rule-discount-codes";

/** create Promotion Release */
export const createPromotionReleaseService = (body: Partial<PriceRule>): Promise<any> => {
  return BaseAxios.post(`${ApiConfig.PROMOTION}${PROMOTION_RELEASE_END_POINT}`, body);
};

/** update Promotion Release */
export const updatePromotionReleaseService = (body: any): Promise<any> => {
  return BaseAxios.put(`${ApiConfig.PROMOTION}${PROMOTION_RELEASE_END_POINT}/${body.id}`, body);
};

/** get Promotion Release list */
export const getPromotionReleaseListService = (
  query: BaseQuery,
): Promise<BaseResponse<PageResponse<PriceRule>>> => {
  let params = generateQuery(query);
  return BaseAxios.get(`${ApiConfig.PROMOTION}${PROMOTION_RELEASE_END_POINT}?${params}`);
};

/** get Promotion Release Detail */
export const getPromotionReleaseDetailService = (id: number): Promise<PriceRule> => {
  return BaseAxios.get(`${ApiConfig.PROMOTION}${PROMOTION_RELEASE_END_POINT}/${id}`);
};

/** enable Promotion Release */
export const enablePromotionReleaseService = (body: any): Promise<any> => {
  return BaseAxios.post(`${ApiConfig.PROMOTION}${PROMOTION_RELEASE_END_POINT}/bulk/active`, body);
};

/** disable Promotion Release */
export const disablePromotionReleaseService = (body: any): Promise<any> => {
  return BaseAxios.post(`${ApiConfig.PROMOTION}${PROMOTION_RELEASE_END_POINT}/bulk/disable`, body);
};

export const checkPromoCode = (code: string): Promise<any> => {
  return BaseAxios.get(`${ApiConfig.PROMOTION}/discount-codes/lookup?code=${code}`);
};

export const getAllPromoCodeList = (
  priceRuleId: number,
  query: BaseQuery,
): Promise<BaseResponse<PageResponse<DiscountCode>>> => {
  let params = generateQuery(query);
  return BaseAxios.get(`${ApiConfig.PROMOTION}${END_POINT}${priceRuleId}/discount-codes?${params}`);
};

export const getPromoCodeById = (priceRuleId: number, id: number): Promise<DiscountCode> => {
  return BaseAxios.get(`${ApiConfig.PROMOTION}${END_POINT}${priceRuleId}/discount-codes/${id}`);
};

export const getDiscountUsageDetailApi = (
  discountCode: string,
): Promise<DiscountUsageDetailResponse> => {
  return BaseAxios.get(
    `${ApiConfig.PROMOTION}/discount-usage/search?discount_code=${discountCode}`,
  );
};

export const createPromoCode = (priceRuleId: number, body: any): Promise<DiscountCode> => {
  return BaseAxios.post(`${ApiConfig.PROMOTION}${END_POINT}${priceRuleId}/discount-codes`, body);
};

export const deletePromoCodeById = (priceRuleId: number, id: number): Promise<DiscountCode> => {
  return BaseAxios.delete(`${ApiConfig.PROMOTION}${END_POINT}${priceRuleId}/discount-codes/${id}`);
};

export const deleteBulkPromoCode = (priceRuleId: number, body: any): Promise<any> => {
  return BaseAxios.post(
    `${ApiConfig.PROMOTION}${END_POINT}${priceRuleId}/batch/discount-codes/delete`,
    body,
  );
};

export const publishedBulkPromoCode = (priceRuleId: number, body: any): Promise<any> => {
  return BaseAxios.put(
    `${ApiConfig.PROMOTION}${END_POINT}${priceRuleId}/discount-codes/bulk/published`,
    body,
  );
};

export const enableBulkPromoCode = (priceRuleId: number, body: any): Promise<any> => {
  return BaseAxios.put(
    `${ApiConfig.PROMOTION}${END_POINT}${priceRuleId}/discount-codes/bulk/enable`,
    body,
  );
};

export const disableBulkPromoCode = (priceRuleId: number, body: any): Promise<any> => {
  return BaseAxios.put(
    `${ApiConfig.PROMOTION}${END_POINT}${priceRuleId}/discount-codes/bulk/disable`,
    body,
  );
};

export const updatePromoCodeById = (priceRuleId: number, body: any): Promise<DiscountCode> => {
  return BaseAxios.put(
    `${ApiConfig.PROMOTION}${END_POINT}${priceRuleId}/discount-codes/${body.id}`,
    body,
  );
};

export const addPromoCode = (priceRuleId: number, body: any): Promise<DiscountCode> => {
  return BaseAxios.post(`${ApiConfig.PROMOTION}${END_POINT}${priceRuleId}/batch`, body);
};

export const addPromotionCodeApi = (priceRuleId: number, body: any): Promise<DiscountCode> => {
  return BaseAxios.post(`${ApiConfig.PROMOTION}${END_POINT}${priceRuleId}/batch2`, body);
};

// get promotion jobs api
export const getPromotionJobsApi = (processId: string): Promise<BaseResponse<any>> => {
  return BaseAxios.get(`${ApiConfig.PROMOTION}/jobs/${processId}`);
};
