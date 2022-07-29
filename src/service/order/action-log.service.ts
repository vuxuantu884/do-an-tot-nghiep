import BaseAxios from "base/base.axios";
import BaseResponse from "base/base.response";
import { ApiConfig } from "config/api.config";
import {
  ActionLogDetailResponse,
  OrderActionLogResponse,
} from "model/response/order/action-log.response";

export const getOrderActionLogsService = (
  id: number,
): Promise<BaseResponse<OrderActionLogResponse[]>> => {
  return BaseAxios.get(`${ApiConfig.ORDER}/orders/${id}/log`);
};

export const getActionLogDetailService = (
  id: number,
): Promise<BaseResponse<ActionLogDetailResponse>> => {
  return BaseAxios.get(`${ApiConfig.ORDER}/orders/log/${id}`);
};
