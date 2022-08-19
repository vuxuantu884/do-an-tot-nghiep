import BaseAction from "base/base.action";
import {
  CampaignContactSearchQuery,
  CampaignSearchQuery,
} from "model/marketing/marketing.model";
import { MarketingType } from "domain/types/marketing.type";

export const getCampaignListAction = (query: CampaignSearchQuery, setData: (data: any) => void) => {
  return BaseAction(MarketingType.CAMPAIGN_LIST, { query, setData });
};

export const getCampaignDetailAction = (campaignId: number, setData: (data: any) => void) => {
  return BaseAction(MarketingType.CAMPAIGN_DETAIL, { campaignId, setData });
};

export const getCampaignRefIdAction = (campaignId: number, setData: (data: any) => void) => {
  return BaseAction(MarketingType.GET_CAMPAIGN_REF_ID, { campaignId, setData });
};

export const getCampaignContactListAction = (campaignId: number, query: CampaignContactSearchQuery, setData: (data: any) => void) => {
  return BaseAction(MarketingType.CAMPAIGN_CONTACT_LIST, { campaignId, query, setData });
};

export const getBrandNameAction = (setData: (data: any) => void) => {
  return BaseAction(MarketingType.GET_BRAND_NAME, { setData });
};

export const getMessageTemplateAction = (query: any, setData: (data: any) => void) => {
  return BaseAction(MarketingType.GET_MESSAGE_TEMPLATE, { query, setData });
};

export const getImportFileTemplateAction = (conditions: Array<string>, setData: (data: any) => void) => {
  return BaseAction(MarketingType.GET_IMPORT_FILE_TEMPLATE, { conditions, setData });
};

export const importFileAction = (queryParams: any, setData: (data: any) => void) => {
  return BaseAction(MarketingType.CAMPAIGN_IMPORT_FILE, { queryParams, setData });
};

export const getCampaignContactAction = (campaignId: number, queryParams: any, setData: (data: any) => void) => {
  return BaseAction(MarketingType.CAMPAIGN_CONTACT, { campaignId, queryParams, setData });
};

export const createCampaignAction = (params: any, setData: (data: any) => void) => {
  return BaseAction(MarketingType.CREATE_CAMPAIGN, { params, setData });
};

export const updateCampaignAction = (campaignId: number, params: any, setData: (data: any) => void) => {
  return BaseAction(MarketingType.UPDATE_CAMPAIGN, { campaignId, params, setData });
};
