import BaseAxios from "base/base.axios";
import BaseResponse from "base/base.response";
import { ApiConfig } from "config/api.config";
import { BaseQuery } from "model/base/base.query";
import { CreateLoyaltyRequest } from "model/request/loyalty/ranking/create-loyalty.request";
import { LoyaltyRankResponse } from "model/response/loyalty/ranking/loyalty-rank.response";
import { generateQuery } from "utils/AppUtils";

export const getLoyaltyRankList = (query: BaseQuery): Promise<BaseResponse<any>> => {
  let params = generateQuery(query);
  return BaseAxios.get(`${ApiConfig.LOYALTY}/loyalty-rankings?${params}`);
};

export const getLoyaltyRankDetail = (id: number): Promise<BaseResponse<LoyaltyRankResponse>> => {
  return BaseAxios.get(`${ApiConfig.LOYALTY}/loyalty-rankings/${id}`);
};

export const createLoyaltyRank = (body: CreateLoyaltyRequest): Promise<BaseResponse<LoyaltyRankResponse>> => {
  return BaseAxios.post(`${ApiConfig.LOYALTY}/loyalty-rankings`, body);
};

export const updateLoyaltyRank = (id: number, body: CreateLoyaltyRequest): Promise<BaseResponse<LoyaltyRankResponse>> => {
  return BaseAxios.put(`${ApiConfig.LOYALTY}/loyalty-rankings/${id}`, body);
};
