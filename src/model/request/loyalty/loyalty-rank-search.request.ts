import { BaseQuery } from "model/base/base.query";

export interface LoyaltyRankSearchRequest extends BaseQuery {
  status?: string;
}
