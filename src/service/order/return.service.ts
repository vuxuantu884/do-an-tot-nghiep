import BaseAxios from "base/base.axios";
import BaseResponse from "base/base.response";
import { ApiConfig } from "config/api.config";
import { OrderRequest } from "model/request/order.request";
import { OrderReturnReasonModel } from "model/response/order/order.response";

export const getOrderReturnService = (
  id: number
): Promise<BaseResponse<any>> => {
  return BaseAxios.get(`${ApiConfig.ORDER}/orders/return/${id}`);
};

export const createOrderReturnService = (
  params: OrderRequest
): Promise<BaseResponse<any>> => {
  return BaseAxios.post(`${ApiConfig.ORDER}/orders/return`, params);
};

export const setIsReceivedProductOrderReturnService = (
  id: number
): Promise<BaseResponse<any>> => {
  return BaseAxios.put(`${ApiConfig.ORDER}/orders/return/${id}/received`);
};

export const getOrderReturnReasonService = (): Promise<
  BaseResponse<OrderReturnReasonModel[]>
> => {
  return BaseAxios.get(`${ApiConfig.ORDER}/reasons`);
};
