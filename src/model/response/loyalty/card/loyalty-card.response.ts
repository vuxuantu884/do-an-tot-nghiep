import { BaseObject } from "model/base/base.response";

export interface LoyaltyCardResponse extends BaseObject {
  assigned_date: Date;
  card_number: string;
  card_release_id: number;
  customer_id: number;
  status: string;
  user_assigned_id: number;
}
