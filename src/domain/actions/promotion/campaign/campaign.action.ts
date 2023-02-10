import BaseAction from "base/base.action";
import { PageResponse } from "model/base/base-metadata.response";
import { PromotionCampaignType } from "domain/types/promotion.type";
import { PromotionCampaignQuery, PromotionCampaignResponse } from "model/promotion/campaign.model";

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

export const getPromotionCampaignDetailAction = (id: number, onResult: (result: PromotionCampaignResponse) => void) => {
  return BaseAction(PromotionCampaignType.GET_PROMOTION_CAMPAIGN_DETAIL, { id, onResult });
};

export const updatePromotionCampaignAction = (
  id: number,
  body: Partial<PromotionCampaignResponse>,
  onResult: (result: PromotionCampaignResponse) => void,
) => {
  return BaseAction(PromotionCampaignType.UPDATE_PROMOTION_CAMPAIGN, { id, body, onResult });
};
