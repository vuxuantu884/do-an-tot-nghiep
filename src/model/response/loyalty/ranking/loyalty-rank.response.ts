import { BaseObject } from "model/base/base.response";

export interface LoyaltyRankResponse extends BaseObject {
  name: string;
  status: string;
  method: string;
  accumulated_from: number;
  money_maintain_in_year: number;
  note: string;
}

export interface GetCodeUpdateRankingCustomerDataResponse {
  id: number;
  code: string;
  version: number;
  created_by: string;
  created_name: string;
  updated_by: string;
  updated_name: string;
  created_date: string;
  updated_date: string;
  url: string | null;
  file_name: string | null;
  status: string | null;
  total: number;
  processed: number;
  message: string | null;
  error: number | null;
  success: number | null;
  conditions: any;
  hidden_fields: any;
  deleted: boolean;
}

export interface ProgressRankingCustomerRunning {
  code: number;
  message: string;
  data: GetCodeUpdateRankingCustomerDataResponse;
}

export interface GetCodeUpdateRankingCustomerResponse {
  code: number;
  message: string;
  data: ProgressRankingCustomerRunning;
  response_time: Date;
  errors: string;
  request_id: number;
}
