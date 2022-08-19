import BaseAxios from "base/base.axios";
import BaseResponse from "base/base.response";
import { ApiConfig } from "config/api.config";
import { generateQuery } from "utils/AppUtils";
import { CampaignContactSearchQuery, CampaignSearchQuery } from "model/marketing/marketing.model";
import { PageResponse } from "model/base/base-metadata.response";

export const getCampaignListService = (
  query: CampaignSearchQuery,
): Promise<BaseResponse<PageResponse<any>>> => {
  const params = generateQuery(query);
  const link = `${ApiConfig.MARKETING}/campaigns?${params}`;
  return BaseAxios.get(link);
};

export const getCampaignDetailService = (campaignId: number): Promise<BaseResponse<PageResponse<any>>> => {
  const link = `${ApiConfig.MARKETING}/campaigns/${campaignId}`;
  return BaseAxios.get(link);
};

export const getCampaignRefIdService = (campaignId: number): Promise<BaseResponse<PageResponse<any>>> => {
  return BaseAxios.get(`${ApiConfig.LOYALTY}/sms-config/logs/campaigns/${campaignId}`);
};

export const getCampaignContactListService = (
  campaignId: number,
  query: CampaignContactSearchQuery,
): Promise<BaseResponse<PageResponse<any>>> => {
  const params = generateQuery(query);
  const link = `${ApiConfig.MARKETING}/campaigns/${campaignId}/contacts?${params}`;
  return BaseAxios.get(link);
};

export const getBrandNameService = (): Promise<BaseResponse<PageResponse<any>>> => {
  const link = `${ApiConfig.MARKETING}/campaigns/brand-names`;
  return BaseAxios.get(link);
};

export const getMessageTemplateService = (query: any): Promise<BaseResponse<PageResponse<any>>> => {
  const params = generateQuery(query);
  const link = `${ApiConfig.MARKETING}/campaigns/sms-templates?${params}`;
  return BaseAxios.get(link);
};

export const getImportFileTemplateService = (conditions: Array<string>): Promise<BaseResponse<PageResponse<any>>> => {
  const url = `${ApiConfig.MARKETING}/import-export/templates`;
  return BaseAxios.post(url, {conditions});
};

export const importFileService = (queryParams: any) => {
  let formData = new FormData();
  formData.append("file_upload", queryParams.file);
  formData.append("type", "import");
  formData.append("campaign_id", queryParams.campaignId);    //fake params
  return BaseAxios.post(`${ApiConfig.MARKETING}/import-export/upload-contact`, formData, {
    headers: { "content-type": "multipart/form-data" },
  });
};

export const getImportFileProgressService = (process_code: any): Promise<BaseResponse<any>> => {
  const requestUrl = `${ApiConfig.MARKETING}/jobs/${process_code}`;
  return BaseAxios.get(requestUrl);
};

export const getCampaignContactService = (campaignId: number, query: any): Promise<BaseResponse<PageResponse<any>>> => {
  const params = generateQuery(query);
  const url = `${ApiConfig.MARKETING}/campaigns/${campaignId}/contacts?${params}`;
  return BaseAxios.get(url);
};

export const createCampaignService = (params: any): Promise<BaseResponse<any>> => {
  let url = `${ApiConfig.MARKETING}/campaigns`;
  return BaseAxios.post(url, params);
};

export const updateCampaignService = (campaignId: number, params: any): Promise<BaseResponse<any>> => {
  let url = `${ApiConfig.MARKETING}/campaigns/${campaignId}`;
  return BaseAxios.put(url, params);
};
