import BaseAction from "base/base.action";
import { PageResponse } from "model/base/base-metadata.response";
import { PromotionCampaignType } from "domain/types/promotion.type";
import {
  AccountantConfirmRegisterRequest,
  PromotionCampaignLogsResponse,
  PromotionCampaignQuery,
  PromotionCampaignResponse,
  RegisterPromotionCampaignRequest,
  UpdatePromotionCampaignStatusRequest,
} from "model/promotion/campaign.model";

export const createPromotionCampaignAction = (
  body: Partial<PromotionCampaignResponse>,
  onResult: (result: PromotionCampaignResponse) => void,
) => {
  return BaseAction(PromotionCampaignType.CREATE_PROMOTION_CAMPAIGN, { body, onResult });
};

export const getPromotionCampaignListAction = (
  query: PromotionCampaignQuery,
  setData: (data: PageResponse<PromotionCampaignResponse>) => void,
) => {
  return BaseAction(PromotionCampaignType.GET_PROMOTION_CAMPAIGN_LIST, { query, setData });
};

export const getPromotionCampaignDetailAction = (
  id: number,
  onResult: (result: PromotionCampaignResponse) => void,
) => {
  return BaseAction(PromotionCampaignType.GET_PROMOTION_CAMPAIGN_DETAIL, { id, onResult });
};

export const updatePromotionCampaignAction = (
  id: number,
  body: Partial<PromotionCampaignResponse>,
  onResult: (result: PromotionCampaignResponse) => void,
) => {
  return BaseAction(PromotionCampaignType.UPDATE_PROMOTION_CAMPAIGN, { id, body, onResult });
};

export const updatePromotionCampaignItemAction = (
  id: number,
  body: Partial<PromotionCampaignResponse>,
  onResult: (result: PromotionCampaignResponse) => void,
) => {
  return BaseAction(PromotionCampaignType.UPDATE_PROMOTION_CAMPAIGN_ITEM, { id, body, onResult });
};

export const approvePromotionCampaignAction = (
  id: number,
  params: UpdatePromotionCampaignStatusRequest,
  onResult: (result: PromotionCampaignResponse) => void,
) => {
  return BaseAction(PromotionCampaignType.APPROVE_PROMOTION_CAMPAIGN, { id, params, onResult });
};

export const registerPromotionCampaignAction = (
  id: number,
  params: RegisterPromotionCampaignRequest,
  onResult: (result: PromotionCampaignResponse) => void,
) => {
  return BaseAction(PromotionCampaignType.REGISTER_PROMOTION_CAMPAIGN, { id, params, onResult });
};

export const accountantConfirmRegisterAction = (
  id: number,
  params: AccountantConfirmRegisterRequest,
  onResult: (result: PromotionCampaignResponse) => void,
) => {
  return BaseAction(PromotionCampaignType.ACCOUNTANT_CONFIRM_REGISTER, { id, params, onResult });
};

export const setupPromotionCampaignAction = (
  id: number,
  params: UpdatePromotionCampaignStatusRequest,
  onResult: (result: PromotionCampaignResponse) => void,
) => {
  return BaseAction(PromotionCampaignType.SETUP_PROMOTION_CAMPAIGN, { id, params, onResult });
};

export const activePromotionCampaignAction = (
  id: number,
  params: UpdatePromotionCampaignStatusRequest,
  onResult: (result: PromotionCampaignResponse) => void,
) => {
  return BaseAction(PromotionCampaignType.ACTIVE_PROMOTION_CAMPAIGN, { id, params, onResult });
};

export const getPromotionCampaignLogsDetailAction = (
  id: number,
  onResult: (result: Array<PromotionCampaignLogsResponse>) => void,
) => {
  return BaseAction(PromotionCampaignType.GET_PROMOTION_CAMPAIGN_LOG_DETAIL, { id, onResult });
};
