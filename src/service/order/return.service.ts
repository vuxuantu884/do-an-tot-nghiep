import BaseAxios from "base/base.axios";
import BaseResponse from "base/base.response";
import { ApiConfig } from "config/api.config";
import { OrderRequest } from "model/request/order.request";

export const createOrderReturnService = (
  params: OrderRequest
): Promise<BaseResponse<any>> => {
  return BaseAxios.post(`${ApiConfig.ORDER}/orders/return`, params);
};
