import BaseAxios from "base/BaseAxios";
import BaseResponse from "base/BaseResponse";
import { ApiConfig } from "config/ApiConfig";
import { BaseQuery } from "model/base/base.query";
import {
  OrderRequest,
  ShippingGHTKRequest,
  UpdateFulFillmentStatusRequest,
  UpdateLineFulFillment,
  UpdatePaymentRequest,
} from "model/request/order.request";
import {
  OrderSourceCompanyModel,
  OrderSourceModel,
  OrderSourceResponseModel,
} from "model/response/order/order-source.response";
import {
  DeliveryServiceResponse,
  OrderResponse,
  ShippingGHTKResponse,
} from "model/response/order/order.response";
import { PaymentMethodResponse } from "model/response/order/paymentmethod.response";
import { SourceResponse } from "model/response/order/source.response";
import { generateQuery } from "utils/AppUtils";

export const getSources = (): Promise<BaseResponse<SourceResponse>> => {
  return BaseAxios.get(`${ApiConfig.ORDER}/sources/listing`);
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

export const getInfoDeliveryGHTK = (
  request: ShippingGHTKRequest
): Promise<BaseResponse<ShippingGHTKResponse>> => {
  return BaseAxios.post(`${ApiConfig.ORDER}/shipping/ghtk/fees`, request);
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

export const getDeliverieServices = (): Promise<
  BaseResponse<Array<DeliveryServiceResponse>>
> => {
  return BaseAxios.get(`${ApiConfig.ORDER}/shipping/delivery-services`);
};

/**
 * list Order Source: quản lý nguồn đơn hàng
 */

export const getSourcesWithParamsService = (
  query: BaseQuery
): Promise<BaseResponse<SourceResponse>> => {
  const queryString = generateQuery(query);
  return BaseAxios.get(`${ApiConfig.ORDER}/sources?${queryString}`);
};

export const getListSourcesCompaniesService = (): Promise<
  BaseResponse<SourceResponse>
> => {
  return BaseAxios.get(`${ApiConfig.CONTENT}/companies`);
};

export const createOrderSourceService = (
  newOrderSource: OrderSourceModel
): Promise<BaseResponse<OrderSourceCompanyModel>> => {
  return BaseAxios.post(`${ApiConfig.ORDER}/sources`, newOrderSource);
};

export const editOrderSourceService = (
  id: number,
  orderSource: OrderSourceModel
): Promise<BaseResponse<OrderSourceResponseModel>> => {
  return BaseAxios.put(`${ApiConfig.ORDER}/sources/${id}`, orderSource);
};

export const deleteOrderSourceService = (
  id: number
): Promise<BaseResponse<OrderSourceResponseModel>> => {
  return BaseAxios.delete(`${ApiConfig.ORDER}/sources/${id}`);
};

/**
 * sub status: sidebar phần xử lý đơn hàng
 */
export const getOrderSubStatusService = (
  status: string
): Promise<BaseResponse<SourceResponse>> => {
  return BaseAxios.get(`${ApiConfig.ORDER}/status/${status}/subStatus`);
};

export const setSubStatusService = (
  order_id : number,
  statusId: number
): Promise<BaseResponse<SourceResponse>> => {
  return BaseAxios.put(`${ApiConfig.ORDER}/${order_id}/subStatus/${statusId}`);
};