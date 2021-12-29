interface BaseRequest {
  page?: number,
  limit?: number,
}

export interface PointAdjustmentListRequest extends BaseRequest {
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
