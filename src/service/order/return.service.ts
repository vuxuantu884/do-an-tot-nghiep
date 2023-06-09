import BaseAxios from "base/base.axios";
import BaseResponse from "base/base.response";
import { ApiConfig } from "config/api.config";
import {
  CalculateMoneyRefundRequestModel,
  CalculateMoneyRefundResponseModel,
  ReturnCalculateRefundModel,
} from "model/order/return.model";
import {
  ExchangeRequest,
  OrderRequest,
  OrderReturnCalculateRefundRequestModel,
} from "model/request/order.request";
import { OrderActionLogResponse } from "model/response/order/action-log.response";
import { OrderPaymentResponse, OrderReasonModel } from "model/response/order/order.response";
import { generateQuery } from "utils/AppUtils";

export const getOrderReturnService = (id: number): Promise<BaseResponse<any>> => {
  return BaseAxios.get(`${ApiConfig.ORDER}/orders/returns/${id}`);
};

export const createOrderReturnService = (params: OrderRequest): Promise<BaseResponse<any>> => {
  return BaseAxios.post(`${ApiConfig.ORDER}/orders/returns`, params);
};

export const setIsReceivedProductOrderReturnService = (
  orderId: number,
  returned_store_id: number,
): Promise<BaseResponse<any>> => {
  const params = {
    returned_store_id,
  };
  return BaseAxios.put(`${ApiConfig.ORDER}/orders/returns/${orderId}/received`, params);
};

export const getOrderReasonService = (
  orderCodes: string[],
): Promise<BaseResponse<OrderReasonModel[]>> => {
  const query = {
    order_codes: orderCodes,
  };
  const order_codes = generateQuery(query);
  return BaseAxios.get(`${ApiConfig.ORDER}/reasons?${order_codes}`);
};

export const orderRefundService = (
  id: number,
  params: {
    payments: OrderPaymentResponse[] | any[];
  },
): Promise<BaseResponse<any>> => {
  return BaseAxios.put(`${ApiConfig.ORDER}/orders/returns/${id}/refund`, params);
};

export const createOrderExchangeService = (params: ExchangeRequest): Promise<BaseResponse<any>> => {
  return BaseAxios.post(`${ApiConfig.ORDER}/orders/create-order-exchange`, params);
};

export const getOrderReturnLog = (id: number): Promise<BaseResponse<OrderActionLogResponse[]>> => {
  return BaseAxios.get(`${ApiConfig.ORDER}/order-return/${id}/log`);
};

export const getOrderReturnCalculateRefundService = (
  query: OrderReturnCalculateRefundRequestModel,
): Promise<BaseResponse<ReturnCalculateRefundModel>> => {
  const { customerId, orderId, ...restQuery } = query;
  return BaseAxios.post(
    `${ApiConfig.LOYALTY}/loyalty-points/customer/${customerId}/order/${orderId}/calculate-refund`,
    restQuery,
  );
};

export const deleteOrderReturnService = (ids: number[]): Promise<BaseResponse<any>> => {
  let link = `${ApiConfig.ORDER}/orders/returns?ids=${ids}`;
  return BaseAxios.delete(link);
};

export const updateNoteOrderReturnService = (
  id: number | string,
  note: string | null,
  customerNote: string | null,
): Promise<BaseResponse<any>> => {
  let params = {
    note: note,
    customer_note: customerNote,
  };
  let link = `${ApiConfig.ORDER}/orders/returns/partial/${id}`;
  return BaseAxios.put(link, params);
};

export const calculateMoneyRefundService = (
  orderId: number,
  params: CalculateMoneyRefundRequestModel,
): Promise<BaseResponse<CalculateMoneyRefundResponseModel>> => {
  const link = `${ApiConfig.ORDER}/orders/${orderId}/calculate-money-refund`;
  return BaseAxios.post(link, params);
};
