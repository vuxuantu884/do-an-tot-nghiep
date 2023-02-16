import BaseResponse from "base/base.response";
import { PageResponse } from "model/base/base-metadata.response";
import { generateQuery } from "utils/AppUtils";
import BaseAxios from "base/base.axios";
import { ApiConfig } from "config/api.config";
import { PromotionCampaignQuery, PromotionCampaignResponse } from "model/promotion/campaign.model";

const CAMPAIGNS = "/campaigns";

/** Create Promotion Campaign */
export const createPromotionCampaignService = (
  body: Partial<PromotionCampaignResponse>
): Promise<PromotionCampaignResponse> => {
  return BaseAxios.post(`${ApiConfig.PROMOTION}${CAMPAIGNS}`, body);
};

/** Get Promotion Campaign List */
export const getPromotionCampaignListService = (
  query: PromotionCampaignQuery,
): Promise<BaseResponse<PageResponse<PromotionCampaignResponse>>> => {
  const params = generateQuery(query);
  return BaseAxios.get(`${ApiConfig.PROMOTION}${CAMPAIGNS}?${params}`);
};

/** Get Promotion Campaign Detail */
export const getPromotionCampaignDetailService = (
  id: number
): Promise<PromotionCampaignResponse> => {
  return BaseAxios.get(`${ApiConfig.PROMOTION}${CAMPAIGNS}/${id}`);
};

/** Update Promotion Campaign */
export const updatePromotionCampaignService = (
  id: number,
  body: Partial<PromotionCampaignResponse>
): Promise<PromotionCampaignResponse> => {
  return BaseAxios.put(`${ApiConfig.PROMOTION}${CAMPAIGNS}/${id}`, body);
};
