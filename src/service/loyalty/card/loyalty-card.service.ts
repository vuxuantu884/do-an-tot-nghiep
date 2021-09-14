import BaseAxios from "base/base.axios";
import BaseResponse from "base/base.response";
import { ApiConfig } from "config/api.config";
import { BaseQuery } from "model/base/base.query";
import { LoyaltyCardAssignmentRequest } from "model/request/loyalty/card/CardAssignmentRequest";
import { LoyaltyCardResponse } from "model/response/loyalty/card/loyalty-card.response";
import { generateQuery } from "utils/AppUtils";

export const searchLoyaltyCardList = (query: BaseQuery): Promise<BaseResponse<LoyaltyCardResponse>> => {
  let params = generateQuery(query);
  return BaseAxios.get(`${ApiConfig.LOYALTY}/loyalty-cards?${params}`);
};

export const loyaltyCardAssignmentApi = (
  id: number,
  query: LoyaltyCardAssignmentRequest
): Promise<BaseResponse<LoyaltyCardResponse>> => {
  return BaseAxios.put(`${ApiConfig.LOYALTY}/loyalty-cards/${id}`, query);
};

export const loyaltyCardLockApi = (
  id: number
): Promise<BaseResponse<LoyaltyCardResponse>> => {
  return BaseAxios.put(`${ApiConfig.LOYALTY}/loyalty-cards/${id}`, {status: 'INACTIVE'});
};
