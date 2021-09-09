import BaseAxios from "base/base.axios";
import BaseResponse from "base/base.response";
import { ApiConfig } from "config/api.config";
import { BaseQuery } from "model/base/base.query";
import { OrderModel, OrderSearchQuery } from "model/order/order.model";
import { ShipmentModel, ShipmentSearchQuery } from "model/order/shipment.model";
import {
  GHNFeeRequest,
  OrderRequest,
  ShippingGHTKRequest,
  UpdateFulFillmentStatusRequest,
  UpdateLineFulFillment,
  UpdatePaymentRequest,
  VTPFeeRequest,
} from "model/request/order.request";
import {
  OrderSourceCompanyModel,
  OrderSourceModel,
  OrderSourceResponseModel,
} from "model/response/order/order-source.response";
import {
  DeliveryServiceResponse,
  ErrorLogResponse,
  GHNFeeResponse,
  OrderResponse,
  ShippingGHTKResponse,
  TrackingLogFulfillmentResponse,
  VTPFeeResponse,
} from "model/response/order/order.response";
import { PaymentMethodResponse } from "model/response/order/paymentmethod.response";
import { SourceResponse } from "model/response/order/source.response";
import { ChannelResponse } from "model/response/product/channel.response";
import { generateQuery } from "utils/AppUtils";

export const getListOrderApi = (
  query: OrderSearchQuery
): Promise<BaseResponse<OrderModel>> => {
  const queryString = generateQuery(query);
  return BaseAxios.get(`${ApiConfig.ORDER}/orders?${queryString}`);
};

export const getListOrderCustomerApi = (
  query: OrderSearchQuery
): Promise<BaseResponse<OrderModel>> => {
  const queryString = generateQuery(query);
  return BaseAxios.get(`${ApiConfig.ORDER}/orders?${queryString}`);
};

export const getShipmentApi = (
  query: ShipmentSearchQuery
): Promise<BaseResponse<ShipmentModel>> => {
  const queryString = generateQuery(query);
  return BaseAxios.get(`${ApiConfig.ORDER}/shipments?${queryString}`);
};

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

export const getInfoDeliveryGHN = (
  request: GHNFeeRequest
): Promise<BaseResponse<GHNFeeResponse>> => {
  return BaseAxios.post(`${ApiConfig.ORDER}/shipping/ghn/fees`, request);
};

export const getInfoDeliveryVTP = (
  request: VTPFeeRequest
): Promise<BaseResponse<VTPFeeResponse>> => {
  return BaseAxios.post(`${ApiConfig.ORDER}/shipping/vtp/fees`, request);
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
  let params = {
    action: request.action,
  };
  return BaseAxios.put(link, params);
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

// tracking_log: Lấy ra tracking_log của fulfillment
export const getTrackingLogFulFillment = (
  fulfillment_code: string
): Promise<BaseResponse<Array<TrackingLogFulfillmentResponse>>> => {
  return BaseAxios.get(
    `${ApiConfig.ORDER}/shipping/tracking-log?fulfillment_code=${fulfillment_code}`
  );
};

// tracking_log: Lấy ra tracking_log_error của fulfillment
export const getTrackingLogFulFillmentError = (
  fulfillment_code: string
): Promise<BaseResponse<Array<ErrorLogResponse>>> => {
  return BaseAxios.get(
    `${ApiConfig.ORDER}/shipping/error-log?fulfillment_code=${fulfillment_code}`
  );
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
  order_id: number,
  statusId: number
): Promise<BaseResponse<SourceResponse>> => {
  return BaseAxios.put(
    `${ApiConfig.ORDER}/orders/${order_id}/subStatus/${statusId}`
  );
};

export const getChannelApi = (): Promise<BaseResponse<Array<ChannelResponse>>> => {
  return BaseAxios.get(`${ApiConfig.ORDER}/channels`)
}
