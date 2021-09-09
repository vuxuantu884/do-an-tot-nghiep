import BaseAxios from "base/base.axios";
import BaseResponse from "base/base.response";
import { ApiConfig } from "config/api.config";
import { BaseQuery } from "model/base/base.query";
import { LoyaltyCardResponse } from "model/response/loyalty/card/loyalty-card.response";
import { generateQuery } from "utils/AppUtils";

export const searchLoyaltyCardList = (query: BaseQuery): Promise<BaseResponse<LoyaltyCardResponse>> => {
  let params = generateQuery(query);
  return BaseAxios.get(`${ApiConfig.LOYALTY}/loyalty-cards?${params}`);
};