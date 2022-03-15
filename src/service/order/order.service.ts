import BaseAxios from "base/base.axios";
import BaseResponse from "base/base.response";
import {ApiConfig} from "config/api.config";
import {PageResponse} from "model/base/base-metadata.response";
import {OrderModel, OrderSearchQuery, StoreBankAccountNumberModel, StoreBankAccountNumbersQueryModel} from "model/order/order.model";
import {ReturnModel, ReturnSearchQuery} from "model/order/return.model";
import {ShipmentModel, ShipmentSearchQuery} from "model/order/shipment.model";
import {
  ConfirmDraftOrderRequest,
  CreateShippingOrderRequest,
  GetFeesRequest,
  GHNFeeRequest,
  OrderRequest,
  ShippingGHTKRequest,
  SplitOrderRequest,
  UpdateFulFillmentStatusRequest,
  UpdateLineFulFillment,
  UpdatePaymentRequest,
  VTPFeeRequest,
} from "model/request/order.request";
import {
  createDeliveryMappedStoreReQuestModel,
  deleteDeliveryMappedStoreReQuestModel,
  updateConfigReQuestModel,
} from "model/request/settings/third-party-logistics-settings.resquest";
import {SourceSearchQuery} from "model/request/source.request";
import {
  ChannelModel,
  ChannelTypeModel,
  OrderSourceCompanyModel,
  OrderSourceModel,
  OrderSourceResponseModel,
} from "model/response/order/order-source.response";
import {
  DeliveryMappedStoreType,
  DeliveryServiceResponse,
  DeliveryTransportTypesResponse,
  ErrorLogResponse,
  GHNFeeResponse,
  OrderResponse,
  ShippingGHTKResponse,
  TrackingLogFulfillmentResponse,
  VTPFeeResponse,
} from "model/response/order/order.response";
import {PaymentMethodResponse} from "model/response/order/paymentmethod.response";
import {
  SourceEcommerceResponse,
  SourceResponse,
} from "model/response/order/source.response";
import {ChannelResponse} from "model/response/product/channel.response";
import {generateQuery} from "utils/AppUtils";

export const getDetailOrderApi = (orderId: any): Promise<BaseResponse<OrderResponse>> => {
  return BaseAxios.get(`${ApiConfig.ORDER}/orders/${orderId}`);
};

export const getListOrderApi = (
  query: OrderSearchQuery
): Promise<BaseResponse<PageResponse<OrderModel>>> => {
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

export const getReturnApi = (
  query: ReturnSearchQuery
): Promise<BaseResponse<ReturnModel>> => {
  const queryString = generateQuery(query);
  return BaseAxios.get(`${ApiConfig.ORDER}/orders/returns?${queryString}`);
};

export const getSources = (): Promise<BaseResponse<SourceResponse[]>> => {
  return BaseAxios.get(`${ApiConfig.CORE}/sources?limit=50`);
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

export const orderPutApi = (
  id: number,
  request: OrderRequest
): Promise<BaseResponse<OrderResponse>> => {
  return BaseAxios.put(`${ApiConfig.ORDER}/orders/${id}`, request);
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

export const getInfoDeliveryFees = (
  request: GetFeesRequest
): Promise<BaseResponse<VTPFeeResponse>> => {
  return BaseAxios.post(`${ApiConfig.LOGISTIC_GATEWAY}/shipping-orders/fees`, request);
};

export const getOrderDetail = (id: string): Promise<BaseResponse<OrderResponse>> => {
  let link = `${ApiConfig.ORDER}/orders/${id}`;
  return BaseAxios.get(link);
};

export const updateFulFillmentStatus = (
  request: UpdateFulFillmentStatusRequest
): Promise<BaseResponse<OrderResponse>> => {
  let link = `${ApiConfig.ORDER}/orders/${request.order_id}/fulfillment/${request.fulfillment_id}/status/${request.status}`;
  let params = {
    ...request,
  };
  return BaseAxios.put(link, params);
};

export const rePushFulFillmentService = (
  fulfillment_id: number
): Promise<BaseResponse<OrderResponse>> => {
  let link = `${ApiConfig.ORDER}/fulfillments/shipping-order?fulfillmentId=${fulfillment_id}`;
  return BaseAxios.post(link);
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
  return BaseAxios.get(`${ApiConfig.LOGISTIC_GATEWAY}/delivery-services/services`);
};

export const getDeliveryTransportTypesService = (
  providerCode: string
): Promise<BaseResponse<Array<DeliveryTransportTypesResponse>>> => {
  return BaseAxios.get(
    `${ApiConfig.LOGISTIC_GATEWAY}/delivery-services/${providerCode}/transport-types`
  );
};

export const getDeliveryMappedStoresService = (
  providerCode: string
): Promise<BaseResponse<Array<DeliveryMappedStoreType>>> => {
  return BaseAxios.get(
    `${ApiConfig.LOGISTIC_GATEWAY}/delivery-services/${providerCode}/mapped-stores`
  );
};

export const deleteDeliveryMappedStoreService = (
  providerCode: string,
  params: deleteDeliveryMappedStoreReQuestModel
): Promise<BaseResponse<any>> => {
  return BaseAxios.delete(
    `${ApiConfig.LOGISTIC_GATEWAY}/delivery-services/${providerCode}/mapped-stores/delete`,
    {
      data: params,
    }
  );
};

export const createDeliveryMappedStoreService = (
  providerCode: string,
  params: createDeliveryMappedStoreReQuestModel
): Promise<BaseResponse<any>> => {
  return BaseAxios.post(
    `${ApiConfig.LOGISTIC_GATEWAY}/delivery-services/${providerCode}/mapped-stores`,
    params
  );
};

export const updateDeliveryConnectService = (
  params: updateConfigReQuestModel
): Promise<BaseResponse<any>> => {
  return BaseAxios.post(
    `${ApiConfig.LOGISTIC_GATEWAY}/delivery-services/update-config`,
    params
  );
};

/**
 * list Order Source: quản lý nguồn đơn hàng
 */

export const getSourcesWithParamsService = (
  query: SourceSearchQuery
): Promise<BaseResponse<PageResponse<SourceResponse>>> => {
  const queryString = generateQuery(query);
  return BaseAxios.get(`${ApiConfig.CORE}/sources?${queryString}`);
};

export const getListSourcesCompaniesService = (): Promise<
  BaseResponse<SourceResponse>
> => {
  return BaseAxios.get(`${ApiConfig.CONTENT}/companies`);
};

export const createOrderSourceService = (
  newOrderSource: OrderSourceModel
): Promise<BaseResponse<OrderSourceCompanyModel>> => {
  return BaseAxios.post(`${ApiConfig.CORE}/sources`, newOrderSource);
};

export const editOrderSourceService = (
  id: number,
  orderSource: OrderSourceModel
): Promise<BaseResponse<OrderSourceResponseModel>> => {
  return BaseAxios.put(`${ApiConfig.CORE}/sources/${id}`, orderSource);
};

export const deleteOrderSourceService = (
  id: number
): Promise<BaseResponse<OrderSourceResponseModel>> => {
  return BaseAxios.delete(`${ApiConfig.CORE}/sources/${id}`);
};

export const deleteMultiOrderSourceService = (
  sourceIds: number[],
  channelIds: number[]
): Promise<BaseResponse<OrderSourceResponseModel>> => {
  const source_ids = sourceIds;
  const channel_ids = channelIds;
  return BaseAxios.delete(`${ApiConfig.CORE}/sources`, {
    data: {source_ids, channel_ids},
  });
};

export const getFulFillmentDetailAction = (
  fulfillment_code: string
): Promise<BaseResponse<any>> => {
  return BaseAxios.get(`${ApiConfig.ORDER}/fulfillments/${fulfillment_code}`);
};

// tracking_log: Lấy ra tracking_log của fulfillment
export const getTrackingLogFulFillment = (
  fulfillment_code: string
): Promise<BaseResponse<Array<TrackingLogFulfillmentResponse>>> => {
  return BaseAxios.get(`${ApiConfig.ORDER}/shipping/${fulfillment_code}/tracking-log`);
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
  statusCode: string,
  action: string
): Promise<BaseResponse<SourceResponse>> => {
  const params = {
    action,
  };
  return BaseAxios.put(
    `${ApiConfig.ORDER}/orders/${order_id}/subStatus/${statusCode}`,
    params
  );
};

export const getChannelApi = (): Promise<BaseResponse<Array<ChannelResponse>>> => {
  return BaseAxios.get(`${ApiConfig.CORE}/channels`);
};

export const getSourceApi = (): Promise<BaseResponse<Array<ChannelResponse>>> => {
  return BaseAxios.get(`${ApiConfig.CORE}/sources`);
};

export const getChannelTypeApi = (): Promise<BaseResponse<Array<ChannelTypeModel>>> => {
  return BaseAxios.get(`${ApiConfig.CORE}/channels/types`);
};

export const createChannelService = (
  params: ChannelModel
): Promise<BaseResponse<any>> => {
  return BaseAxios.post(`${ApiConfig.CORE}/channels`, params);
};

export const editChannelService = (
  channelId: number,
  params: ChannelModel
): Promise<BaseResponse<any>> => {
  return BaseAxios.put(`${ApiConfig.CORE}/channels/${channelId}`, params);
};

export const deleteChannelService = (channelId: number): Promise<BaseResponse<any>> => {
  return BaseAxios.delete(`${ApiConfig.CORE}/channels/${channelId}`);
};

export const getReasonsApi = (): Promise<BaseResponse<Array<any>>> => {
  return BaseAxios.get(`${ApiConfig.ORDER}/reasons`);
};

export const cancelOrderApi = (
  order_id: number,
  reason_id: number,
  sub_reason_id: number,
  reason?: string
): Promise<BaseResponse<any>> => {
  return BaseAxios.put(`${ApiConfig.ORDER}/orders/${order_id}/cancel`, {
    reason_id,
    sub_reason_id,
    reason,
  });
};

export const getOrderConfig = (): Promise<any> => {
  return BaseAxios.get(`${ApiConfig.ORDER}/orders-config`);
};

export const getFulfillmentsApi = (code: string, store_id:number, delivery_service_provider_id:number): Promise<BaseResponse<any>> => {
  const queryString = generateQuery({
    code:code,
    store_id,
    delivery_service_provider_id:delivery_service_provider_id
  });
  let link = `${ApiConfig.ORDER}/fulfillments/packing?${queryString}`;
  return BaseAxios.get(link);
};

export const getFulfillmentsPackedApi = (query: any): Promise<BaseResponse<any>> => {
  const queryString = generateQuery(query);
  const link = `${ApiConfig.ORDER}/fulfillments/packed?${queryString}`;
  return BaseAxios.get(link);
};

export const putFulfillmentsPackApi = (request: any): Promise<BaseResponse<any>> => {
  let url = `${ApiConfig.ORDER}/fulfillments/pack`;
  return BaseAxios.put(url, request);
};

/**
 * xác nhận đơn nháp
 */
export const confirmDraftOrderService = (
  orderId: number,
  params: ConfirmDraftOrderRequest
): Promise<BaseResponse<any>> => {
  return BaseAxios.post(`${ApiConfig.ORDER}/orders/${orderId}/finalized`, params);
};

/**
 * tạo shipping order
 */
export const createShippingOrderService = (
  params: CreateShippingOrderRequest
): Promise<BaseResponse<any>> => {
  return BaseAxios.post(`${ApiConfig.LOGISTIC_GATEWAY}/shipping-orders/create`, params);
};

/**
 * tách đơn
 */
export const splitOrderService = (
  params: SplitOrderRequest
): Promise<BaseResponse<any>> => {
  return BaseAxios.post(`${ApiConfig.ORDER}/orders/split`, params);
};
/**
 * biên bản sàn
 */
export const getSourcesEcommerceService = (): Promise<
  BaseResponse<Array<SourceEcommerceResponse>>
> => {
  return BaseAxios.get(`${ApiConfig.ORDER}/sources/ecommerce`);
};

export const getChannelsService = (
  typeId: number
): Promise<BaseResponse<ChannelResponse[]>> => {
  let link = `${ApiConfig.ORDER}/channels/types`;
  if (typeId !== null) link = `${ApiConfig.CORE}/channels/types?type_id=${typeId}`;
  return BaseAxios.get(link);
};
/**
 * chuyển trạng thái pick: (khi in nhiều phiếu bàn giao)
 */
export const changeOrderStatusToPickedService = (
  orderFulfillmentIds: number[]
): Promise<BaseResponse<any>> => {
  const orderFulfillmentIdsTexts = orderFulfillmentIds.map((id) => `ids=${id}`);
  const params = orderFulfillmentIdsTexts.join("&");
  return BaseAxios.put(`${ApiConfig.ORDER}/fulfillments/status/picked?${params}`);
};

/**
 * chuyển trạng thái đơn hàng
 */
 export const changeMultiOrderStatus = (
  orderIds: number[], type: string,
): Promise<BaseResponse<any>> => {
  const orderIdTexts = orderIds.map((id) => `ids=${id}`);
  const params = orderIdTexts.join("&");
  return BaseAxios.put(`${ApiConfig.ORDER}/fulfillments/status/${type}?${params}`);
};

export const updateOrderPartialService = (
  params: any,
  orderID: number
): Promise<BaseResponse<ChannelResponse[]>> => {
  return BaseAxios.put(`${ApiConfig.ORDER}/orders/partial/${orderID}`, params);
};

export const getStoreBankAccountNumbersService = (query: StoreBankAccountNumbersQueryModel): Promise<
 BaseResponse<PageResponse<StoreBankAccountNumberModel>>
> => {
  const queryString = generateQuery(query);
  return BaseAxios.get(`${ApiConfig.ORDER}/bank-accounts?${queryString}`);
};