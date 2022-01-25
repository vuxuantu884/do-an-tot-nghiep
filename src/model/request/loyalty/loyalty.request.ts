import { BaseQuery } from "model/base/base.query";

export interface PointAdjustmentListRequest extends BaseQuery {
  id: string | null;
  reasons: Array<string> | [];
}

export interface CreateCustomerPointAdjustmentRequest {
  customer_ids: Array<any> | []
  note?: string
  reason: string
  point_change: number
  type: string
}
