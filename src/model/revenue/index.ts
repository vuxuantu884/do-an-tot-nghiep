import { BaseObject } from "model/base/base.response";
import { Moment } from "moment";

export interface RevenueSearchQuery {
  page: number | null;
  limit: number | null;
  ids?: number[] | null;
  store_ids?: number[] | null;
  states?: string[] | null;
  date?: string | Moment | null;
  created_at_min?: string | Moment | null;
  created_at_max?: string | Moment | null;
  opened_at_min?: string | Moment | null;
  opened_at_max?: string | Moment | null;
  closed_at_min?: string | Moment | null;
  closed_at_max?: string | Moment | null;
  opened_bys?: string[] | null;
  closed_bys?: string[] | null;
  remaining_amount_min?: number | null;
  remaining_amount_max?: number | null;
  format?: string | "xls";
  other_cost_min?: number | null;
  other_cost_max?: number | null;
  other_payment_min?: number | null;
  other_payment_max?: number | null;
  total_payment_min?: number | null;
  total_payment_max?: number | null;
}

export interface DailyRevenueTableModel extends BaseObject {
  account_code?: string | null;
  account_name?: string | null;
  card_payment?: number | null;
  cash_payment?: number | null;
  closed_at?: string | null;
  closed_by?: string | null;
  created_at?: string | null;
  date?: string | null;
  deleted?: false | null;
  deleted_at?: string | null;
  momo_payment?: number | null;
  mpos_payment?: number | null;
  net_payment?: number | null;
  note_id2?: string | null;
  opened_at?: string | null;
  opened_by?: string | null;
  other_cost?: number | null;
  other_payment?: number | null;
  qrpay_payment?: number | null;
  revision?: number | null;
  spos_payment?: number | null;
  state?: string | null;
  store_id?: number | null;
  total_cost?: number | null;
  total_payment?: number | null;
  transfer_payment?: number | null;
  updated_at?: string | null;
  vnpay_payment?: number | null;
  store_note?: string | null;
  accountant_note?: string | null;
}

export interface ImportFileModel {
  file_name?: string;
  file_size?: number;
  store_id?: number;
  store_name?: string;
  reported_by?: string;
  reported_name?: string;
  base64: string;
}
