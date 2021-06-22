import { PaymentMethodResponse } from 'model/response/order/paymentmethod.response';
import { OrderRequest } from 'model/request/order.request';
import BaseAxios from "base/BaseAxios"
import BaseResponse from "base/BaseResponse";
import { ApiConfig } from "config/ApiConfig"
import { SourceResponse } from "model/response/order/source.response";
import { OrderResponse } from 'model/response/order/order-online.response';

export const getSources = (): Promise<BaseResponse<SourceResponse>> => {
  return BaseAxios.get(`${ApiConfig.ORDER}/sources`);
}

export const getPaymentMethod = (): Promise<BaseResponse<PaymentMethodResponse>> => {
  return BaseAxios.get(`${ApiConfig.ORDER}/paymentMethods`);
}

export const orderPostApi = (request: OrderRequest): Promise<BaseResponse<OrderResponse>> => {
  return BaseAxios.post(`${ApiConfig.ORDER}/orders`, request)
}