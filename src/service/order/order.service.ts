import { PaymentMethodResponse } from "model/response/order/paymentmethod.response";
import {
  OrderRequest,
  UpdateFulFillmentStatusRequest,
  UpdateLineFulFillment,
  UpdatePaymentRequest,
} from "model/request/order.request";
import BaseAxios from "base/BaseAxios";
import BaseResponse from "base/BaseResponse";
import { ApiConfig } from "config/ApiConfig";
import { SourceResponse } from "model/response/order/source.response";
import { OrderResponse } from "model/response/order/order.response";
import { generateQuery } from "utils/AppUtils";
import { OrderSourceCompanyModel, OrderSourceModel } from "model/response/order/order-source.response";
import { BaseQuery } from "model/base/base.query";
import { FulfillmentModel } from "model/response/fulfillment.response";

export const getSources = (): Promise<BaseResponse<SourceResponse>> => {
  return BaseAxios.get(`${ApiConfig.ORDER}/sources`);
};

export const getPaymentMethod = (): Promise<
  BaseResponse<Array<PaymentMethodResponse>>
> => {
  return BaseAxios.get(`${ApiConfig.ORDER}/paymentMethods`);
};

export const orderPostApi = (
  request: OrderRequest
): Promise<BaseResponse<OrderResponse>> => {
  return BaseAxios.post(`${ApiConfig.ORDER}/orders`, request);
};

export const getOrderDetail = (
  id: number
): Promise<BaseResponse<OrderResponse>> => {
  let link = `${ApiConfig.ORDER}/orders/${id}`;
  return BaseAxios.get(link);
};

export const updateFulFillmentStatus = (
  request: UpdateFulFillmentStatusRequest
): Promise<BaseResponse<OrderResponse>> => {
  let link = `${ApiConfig.ORDER}/orders/${request.order_id}/fulfillment/${request.fulfillment_id}/status/${request.status}`;
  return BaseAxios.put(link);
};

export const updateShipment = (
  request: UpdateLineFulFillment
): Promise<BaseResponse<OrderResponse>> => {
  let link = `${ApiConfig.ORDER}/orders/${request.order_id}/shipment`;
  return BaseAxios.put(link, request);
};

export const updatePayment = (
  request: UpdatePaymentRequest,
  order_id: number
): Promise<BaseResponse<OrderResponse>> => {
  let link = `${ApiConfig.ORDER}/orders/${order_id}/payments`;
  return BaseAxios.put(link, request);
};

export const getSourcesWithParams = (query: BaseQuery): Promise<BaseResponse<SourceResponse>> => {
  const queryString = generateQuery(query);
  return BaseAxios.get(`${ApiConfig.ORDER}/sources?${queryString}`);
};

export const getListSourcesCompanies = (): Promise<BaseResponse<SourceResponse>> => {
  return BaseAxios.get(`${ApiConfig.ORDER}/sources/listing`);
};

export const createOrderSourceService = (
  newOrderSource: OrderSourceModel
): Promise<BaseResponse<OrderSourceCompanyModel>> => {
  return BaseAxios.post(`${ApiConfig.ORDER}/sources`, newOrderSource);
};

export const getOrderServiceSubStatus = (query: BaseQuery): Promise<BaseResponse<SourceResponse>> => {
  const queryString = generateQuery(query);
  return BaseAxios.get(`${ApiConfig.ORDER}/subStatus?${queryString}`);
};

export const createOrderServiceSubStatus = (
  newOrderServiceSubStatus: FulfillmentModel
): Promise<BaseResponse<OrderSourceCompanyModel>> => {
  return BaseAxios.post(`${ApiConfig.ORDER}/subStatus`, newOrderServiceSubStatus);
};