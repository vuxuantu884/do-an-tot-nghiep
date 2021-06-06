import { OrderRequest } from 'model/request/order.request';
import { addOrderRequest } from 'domain/actions/order/order.action';
import BaseAxios from "base/BaseAxios"
import BaseResponse from "base/BaseResponse";
import { ApiConfig } from "config/ApiConfig"
import { SourceResponse } from "model/response/order/source.response";
import { OrderRespose } from 'model/response/order/order-online.response';

export const getSources = (): Promise<BaseResponse<SourceResponse>> => {
  return BaseAxios.get(`${ApiConfig.ORDER}/sources`);
}

export const orderPostApi = (request: OrderRequest): Promise<BaseResponse<OrderRespose>> => {
  return BaseAxios.post(`${ApiConfig.ORDER}/orders`, request)
}