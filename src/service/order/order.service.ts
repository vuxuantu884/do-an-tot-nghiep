import { PaymentMethodResponse } from "model/response/order/paymentmethod.response";
import {
  OrderRequest,
  ShippingGHTKRequest,
  UpdateFulFillmentStatusRequest,
  UpdateLineFulFillment,
  UpdatePaymentRequest,
} from "model/request/order.request";
import BaseAxios from "base/BaseAxios";
import BaseResponse from "base/BaseResponse";
import { ApiConfig } from "config/ApiConfig";
import { SourceResponse } from "model/response/order/source.response";
import {
  DeliveryServiceResponse,
  OrderResponse,
  ShippingGHTKResponse,
} from "model/response/order/order.response";
import { generateQuery } from "utils/AppUtils";
import {
  OrderSourceCompanyModel,
  OrderSourceModel,
} from "model/response/order/order-source.response";
import { BaseQuery } from "model/base/base.query";
import {
  OrderProcessingStatusModel,
  OrderProcessingStatusResponseModel,
} from "model/response/order-processing-status.response";

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

export const getSourcesWithParams = (
  query: BaseQuery
): Promise<BaseResponse<SourceResponse>> => {
  const queryString = generateQuery(query);
  return BaseAxios.get(`${ApiConfig.ORDER}/sources?${queryString}`);
};

export const getListSourcesCompanies = (): Promise<
  BaseResponse<SourceResponse>
> => {
  return BaseAxios.get(`${ApiConfig.CONTENT}/companies`);
};

export const createOrderSourceService = (
  newOrderSource: OrderSourceModel
): Promise<BaseResponse<OrderSourceCompanyModel>> => {
  return BaseAxios.post(`${ApiConfig.ORDER}/sources`, newOrderSource);
};

/**
 * list Order SubStatus: Xử lý đơn hàng
 */

export const getOrderServiceSubStatus = (
  query: BaseQuery
): Promise<BaseResponse<SourceResponse>> => {
  const queryString = generateQuery(query);
  return BaseAxios.get(`${ApiConfig.ORDER}/subStatus?${queryString}`);
};

export const createOrderServiceSubStatus = (
  newOrderServiceSubStatus: OrderProcessingStatusModel
): Promise<BaseResponse<OrderProcessingStatusResponseModel>> => {
  return BaseAxios.post(
    `${ApiConfig.ORDER}/subStatus`,
    newOrderServiceSubStatus
  );
};

export const editOrderServiceSubStatus = (
  id: number,
  orderServiceSubStatus: OrderProcessingStatusModel
): Promise<BaseResponse<OrderProcessingStatusResponseModel>> => {
  return BaseAxios.put(
    `${ApiConfig.ORDER}/subStatus/${id}`,
    orderServiceSubStatus
  );
};
