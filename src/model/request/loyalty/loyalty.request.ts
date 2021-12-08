interface BaseRequest {
  page?: number,
  limit?: number,
}


export interface PointAdjustmentListRequest extends BaseRequest {
  id: string | null;
  reasons: Array<string> | [];
}