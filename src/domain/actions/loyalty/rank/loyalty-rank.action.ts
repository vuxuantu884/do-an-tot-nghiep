import BaseAction from "base/base.action";
import { LoyaltyRankType } from "domain/types/loyalty.type";
import { PageResponse } from "model/base/base-metadata.response";
import { LoyaltyRankSearchRequest } from "model/request/loyalty/loyalty-rank-search.request";
import { CreateLoyaltyRequest } from "model/request/loyalty/ranking/create-loyalty.request";
import { LoyaltyRankResponse } from "model/response/loyalty/ranking/loyalty-rank.response";

export const LoyaltyRankSearch = (
  query: LoyaltyRankSearchRequest,
  setData: (data: PageResponse<LoyaltyRankResponse>) => void,
) => {
  return BaseAction(LoyaltyRankType.SEARCH_LOYALTY_RANK_REQUEST, {
    query,
    setData,
  });
};

export const CreateLoyaltyRank = (
  body: CreateLoyaltyRequest,
  callback: (data: LoyaltyRankResponse) => void,
) => {
  return BaseAction(LoyaltyRankType.CREATE_LOYALTY_RANK_REQUEST, {
    body,
    callback,
  });
};

export const GetLoyaltyRankDetail = (id: number, callback: (data: LoyaltyRankResponse) => void) => {
  return BaseAction(LoyaltyRankType.GET_LOYALTY_RANK_DETAIL_REQUEST, {
    id,
    callback,
  });
};

export const UpdateLoyaltyRank = (
  id: number,
  body: CreateLoyaltyRequest,
  callback: (data: LoyaltyRankResponse) => void,
) => {
  return BaseAction(LoyaltyRankType.UPDATE_LOYALTY_RANK_REQUEST, {
    id,
    body,
    callback,
  });
};

export const DeleteLoyaltyRank = (id: number, callback: () => void) => {
  return BaseAction(LoyaltyRankType.DELELTE_LOYALTY_RANK_REQUEST, {
    id,
    callback,
  });
};
