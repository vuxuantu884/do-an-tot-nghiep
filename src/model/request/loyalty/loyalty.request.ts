import { BaseQuery } from "model/base/base.query";

export interface PointAdjustmentListRequest extends BaseQuery {
  id: string | null;
  term: string | null;
  reasons: Array<string> | null;
  emps: Array<string> | null;
  from: any | null;
  to: any | null;
}

export interface CreateCustomerPointAdjustmentRequest {
  customer_ids: Array<any> | []
  note?: string
  reason: string
  value_change: number
  type: string
}

export interface getImportCodeCustomerAdjustmentRequest {
  file: any;
  name: string;
  value_change: string;
  type: string;
  note: string;
  reason: string;
  created_by: string;
  created_name: string;
}

export interface getInfoAdjustmentByJobRequest {
  id: number;
  code: string;
  version: number;
  created_by: string | null;
  created_name: string | null;
  updated_by: string | null;
  updated_name: string | null;
  created_date: Date | null;
  updated_date: Date | null;
  url: string | null;
  file_name: string;
  status: string;
  total: number;
  processed: number;
  message: any;
  error: number;
  success: number;
  conditions: string | null;
  hidden_fields: string | null;
  data_response: any;
  deleted: boolean;
}


