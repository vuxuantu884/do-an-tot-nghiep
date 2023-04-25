import BaseResponse from "base/base.response";
import { PageResponse } from "model/base/base-metadata.response";
import { generateQuery } from "utils/AppUtils";
import BaseAxios from "base/base.axios";
import { ApiConfig } from "config/api.config";
import {
  AccountantConfirmRegisterRequest,
  PromotionCampaignLogsResponse,
  PromotionCampaignQuery,
  PromotionCampaignResponse,
  RegisterPromotionCampaignRequest,
  UpdatePromotionCampaignStatusRequest,
} from "model/promotion/campaign.model";

const CAMPAIGNS = "/campaigns";

/** Create Promotion Campaign */
export const createPromotionCampaignService = (
  body: Partial<PromotionCampaignResponse>,
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
  id: number,
): Promise<PromotionCampaignResponse> => {
  return BaseAxios.get(`${ApiConfig.PROMOTION}${CAMPAIGNS}/${id}`);
};

/** Update Promotion Campaign */
export const updatePromotionCampaignService = (
  id: number,
  body: Partial<PromotionCampaignResponse>,
): Promise<PromotionCampaignResponse> => {
  return BaseAxios.put(`${ApiConfig.PROMOTION}${CAMPAIGNS}/${id}`, body);
};

/** Update Promotion Campaign Item */
export const updatePromotionCampaignItemService = (
  id: number,
  body: Partial<PromotionCampaignResponse>,
): Promise<PromotionCampaignResponse> => {
  return BaseAxios.put(`${ApiConfig.PROMOTION}${CAMPAIGNS}/${id}/setup-price-rules`, body);
};

/** Approve Promotion Campaign */
export const approvePromotionCampaignService = (
  id: number,
  params: UpdatePromotionCampaignStatusRequest,
): Promise<PromotionCampaignResponse> => {
  return BaseAxios.put(`${ApiConfig.PROMOTION}${CAMPAIGNS}/${id}/approve`, params);
};

/** Register Promotion Campaign */
export const registerPromotionCampaignService = (
  id: number,
  params: RegisterPromotionCampaignRequest,
): Promise<PromotionCampaignResponse> => {
  return BaseAxios.put(`${ApiConfig.PROMOTION}${CAMPAIGNS}/${id}/register`, params);
};

/** Accountant Confirm Register Promotion Campaign */
export const accountantConfirmRegisterService = (
  id: number,
  params: AccountantConfirmRegisterRequest,
): Promise<PromotionCampaignResponse> => {
  return BaseAxios.put(`${ApiConfig.PROMOTION}${CAMPAIGNS}/${id}/accountant-confirmed`, params);
};

/** Setup Promotion Campaign */
export const setupPromotionCampaignService = (
  id: number,
  params: UpdatePromotionCampaignStatusRequest,
): Promise<PromotionCampaignResponse> => {
  return BaseAxios.put(`${ApiConfig.PROMOTION}${CAMPAIGNS}/${id}/setup`, params);
};

/** Active Promotion Campaign */
export const activePromotionCampaignService = (
  id: number,
  params: UpdatePromotionCampaignStatusRequest,
): Promise<PromotionCampaignResponse> => {
  return BaseAxios.put(`${ApiConfig.PROMOTION}${CAMPAIGNS}/${id}/active`, params);
};

/** Get Promotion Campaign Logs Detail */
export const getPromotionCampaignLogsDetailService = (
  id: number,
): Promise<Array<PromotionCampaignLogsResponse>> => {
  return BaseAxios.get(`${ApiConfig.PROMOTION}${CAMPAIGNS}/${id}/logs`, { params: { id } });
};
