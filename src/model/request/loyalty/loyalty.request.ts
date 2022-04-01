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
  point_change: number
  type: string
}
