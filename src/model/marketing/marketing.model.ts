import { BaseQuery } from "model/base/base.query";

export interface CampaignSearchQuery extends BaseQuery {
  request: string | null;
  sender: string | null;
  channels: Array<string> | null;
  statuses: Array<string> | null;
  created_date_from: string | null;
  created_date_to: string | null;
  send_date_from: string | null;
  send_date_to: string | null;
}

export interface CampaignContactSearchQuery extends BaseQuery {
  phone: string | null;
  statuses: Array<string> | null;
}
