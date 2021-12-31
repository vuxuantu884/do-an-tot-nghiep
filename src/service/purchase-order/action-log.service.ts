import BaseAxios from "base/base.axios";
import BaseResponse from "base/base.response";
import { ApiConfig } from "config/api.config";
import {
  ActionLogDetailResponse,
  PurchaseOrderActionLogResponse,
} from "model/response/po/action-log.response";

export const getPOActionLogService = (
  id: number
): Promise<BaseResponse<PurchaseOrderActionLogResponse[]>> => {
  return BaseAxios.get(`${ApiConfig.PURCHASE_ORDER}/purchase-orders/${id}/log`);
};

export const getPOActionLogDetailService = (
  id: number
): Promise<BaseResponse<ActionLogDetailResponse>> => {
  return BaseAxios.get(`${ApiConfig.PURCHASE_ORDER}/purchase-orders/log/${id}`);
};
