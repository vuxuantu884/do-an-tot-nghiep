import { BaseObject } from "model/base/base.response";

export interface LoyaltyRankResponse extends BaseObject {
  name: string
  status: string
  method: string
  accumulated_from: number
  note: string
} 