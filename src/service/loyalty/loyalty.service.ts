import BaseAxios from "base/base.axios";
import BaseResponse from "base/base.response";
import { ApiConfig } from "config/api.config";
import { PageResponse } from "model/base/base-metadata.response";
import { BaseQuery } from "model/base/base.query";
import { CreateLoyaltyAccumulationRequest } from "model/request/loyalty/create-loyalty-accumulation.request";
import { LoyaltyAccumulationProgramResponse } from "model/response/loyalty/loyalty-accumulation.response";
import { LoyaltyRateResponse } from "model/response/loyalty/loyalty-rate.response";
import { LoyaltyUsageResponse } from "model/response/loyalty/loyalty-usage.response";
import { generateQuery } from "utils/AppUtils";

export const createLoyaltyProgram = (
  query: CreateLoyaltyAccumulationRequest
): Promise<BaseResponse<LoyaltyAccumulationProgramResponse>> => {
  return BaseAxios.post(`${ApiConfig.LOYALTY}/loyalty-programs`, query);
};

export const updateLoyaltyProgram = (
  id: number,
  query: CreateLoyaltyAccumulationRequest
): Promise<BaseResponse<LoyaltyAccumulationProgramResponse>> => {
  return BaseAxios.put(`${ApiConfig.LOYALTY}/loyalty-programs/${id}`, query);
};


export const getLoyaltyProgramDetail = (
  id: number
): Promise<BaseResponse<LoyaltyAccumulationProgramResponse>> => {
  return BaseAxios.get(`${ApiConfig.LOYALTY}/loyalty-programs/${id}`);
};

export const getLoyaltyRate = (): Promise<BaseResponse<LoyaltyRateResponse>> => {
  return BaseAxios.get(`${ApiConfig.LOYALTY}/loyalty-rates`);
};

export const createLoyaltyRate = (addingRate: number, usageRate: number): Promise<BaseResponse<LoyaltyRateResponse>> => {
  return BaseAxios.post(`${ApiConfig.LOYALTY}/loyalty-rates`, {adding_rate: addingRate, usage_rate: usageRate});
};

export const getLoyaltyUsage = (): Promise<BaseResponse<LoyaltyUsageResponse>> => {
  return BaseAxios.get(`${ApiConfig.LOYALTY}/loyalty-usage-rules`);
};

export const createLoyaltyUsage = (query: Array<LoyaltyUsageResponse>): Promise<BaseResponse<LoyaltyUsageResponse>> => {
  return BaseAxios.post(`${ApiConfig.LOYALTY}/loyalty-usage-rules`, {rules: query});
};

export const searchLoyaltyProgramList = (query: BaseQuery): Promise<BaseResponse<PageResponse<LoyaltyUsageResponse>>> => {
  let params = generateQuery(query);
  return BaseAxios.get(`${ApiConfig.LOYALTY}/loyalty-programs?${params}`);
};
