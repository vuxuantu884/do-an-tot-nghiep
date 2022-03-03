import BaseAxios from "base/base.axios";
import BaseResponse from "base/base.response";
import { ApiConfig } from "config/api.config";
import { ReturnCalculateRefundModel } from "model/order/return.model";
import { ExchangeRequest, OrderRequest, OrderReturnCalculateRefundRequestModel } from "model/request/order.request";
import { OrderActionLogResponse } from "model/response/order/action-log.response";
import {
  OrderPaymentResponse,
  OrderReturnReasonModel
} from "model/response/order/order.response";

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

export const orderRefundService = (
  id: number,
  params: {
    payments: OrderPaymentResponse[];
  }
): Promise<BaseResponse<any>> => {
  return BaseAxios.put(`${ApiConfig.ORDER}/orders/return/${id}/refund`, params);
};

export const createOrderExchangeService = (
  params: ExchangeRequest
): Promise<BaseResponse<any>> => {
  return BaseAxios.post(
    `${ApiConfig.ORDER}/orders/create-order-exchange`,
    params
  );
};

export const getOrderReturnLog = (
  id: number
): Promise<BaseResponse<OrderActionLogResponse[]>> => {
  return BaseAxios.get(`${ApiConfig.ORDER}/order-return/${id}/log`);
};

export const getOrderReturnCalculateRefundService = (
  query: OrderReturnCalculateRefundRequestModel
): Promise<BaseResponse<ReturnCalculateRefundModel>> => {
  const {customerId, orderId, ...restQuery} = query;
  return BaseAxios.post(
    `${ApiConfig.LOYALTY}/loyalty-points/customer/${customerId}/order/${orderId}/calculate-refund`, restQuery
  );
};
