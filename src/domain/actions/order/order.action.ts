import BaseAction from "base/base.action";
import { PageResponse } from "model/base/base-metadata.response";
import { OrderModel, OrderSearchQuery } from "model/order/order.model";
import { ShipmentModel, ShipmentSearchQuery } from "model/order/shipment.model";
import { ReturnModel, ReturnSearchQuery } from "model/order/return.model";
import {
  GHNFeeRequest,
  OrderRequest,
  ShippingGHTKRequest,
  UpdateFulFillmentStatusRequest,
  UpdateLineFulFillment,
  // UpdatePaymentRequest,
  VTPFeeRequest,
  GetFeesRequest,
  ConfirmDraftOrderRequest,
  CreateShippingOrderRequest,
} from "model/request/order.request";
import {
  ActionLogDetailResponse,
  OrderActionLogResponse,
} from "model/response/order/action-log.response";
import {
  DeliveryMappedStoreType,
  DeliveryServiceResponse,
  DeliveryTransportTypesResponse,
  ErrorLogResponse,
  GHNFeeResponse,
  OrderConfig,
  OrderResponse,
  OrderSubStatusResponse,
  ShippingGHTKResponse,
  TrackingLogFulfillmentResponse,
  VTPFeeResponse,
} from "model/response/order/order.response";
import { PaymentMethodResponse } from "model/response/order/paymentmethod.response";
import { ChannelResponse } from "model/response/product/channel.response";
import { OrderType } from "../../types/order.type";

export const orderCreateAction = (
  request: OrderRequest,
  setData: (data: OrderResponse) => void
) => {
  return BaseAction(OrderType.CREATE_ORDER_REQUEST, { request, setData });
};

export const orderUpdateAction = (
  id: string,
  request: OrderRequest,
  setData: (data: OrderResponse) => void,
  onError: () => void
) => {
  return BaseAction(OrderType.UPDATE_ORDER_REQUEST, { id, request, setData, onError });
};

export const orderFpageCreateAction = (
  request: OrderRequest,
  setData: (data: OrderResponse) => void,
  setDisable: (data: any) => void
) => {
  return BaseAction(OrderType.CREATE_FPAGE_ORDER_REQUEST, {
    request,
    setData,
    setDisable,
  });
};

export const InfoGHTKAction = (
  request: ShippingGHTKRequest,
  setData: (data: Array<ShippingGHTKResponse>) => void
) => {
  return BaseAction(OrderType.GET_INFO_DELIVERY_GHTK, { request, setData });
};

export const InfoGHNAction = (
  request: GHNFeeRequest,
  setData: (data: GHNFeeResponse) => void
) => {
  return BaseAction(OrderType.GET_INFO_GHN_FEE, { request, setData });
};

export const InfoVTPAction = (
  request: VTPFeeRequest,
  setData: (data: Array<VTPFeeResponse>) => void
) => {
  return BaseAction(OrderType.GET_INFO_VTP_FEE, { request, setData });
};

export const getFeesAction = (
  request: GetFeesRequest,
  setData: (data: Array<any>) => void
) => {
  return BaseAction(OrderType.GET_INFO_FEES, { request, setData });
};

export const PaymentMethodGetList = (
  setData: (data: Array<PaymentMethodResponse>) => void
) => {
  return BaseAction(OrderType.GET_LIST_PAYMENT_METHOD, { setData });
};

export const OrderDetailAction = (id: number, setData: (data: OrderResponse) => void) => {
  return BaseAction(OrderType.GET_ORDER_DETAIL_REQUEST, { id, setData });
};

export const getTrackingLogFulfillmentAction = (
  fulfillment_code: string,
  setData: (data: Array<TrackingLogFulfillmentResponse> | null) => void
) => {
  return BaseAction(OrderType.GET_TRACKING_LOG_FULFILLMENT, {
    fulfillment_code,
    setData,
  });
};

export const getTrackingLogError = (
  fulfillment_code: string,
  setData: (data: Array<ErrorLogResponse> | null) => void
) => {
  return BaseAction(OrderType.GET_TRACKING_LOG_ERROR, {
    fulfillment_code,
    setData,
  });
};

export const UpdateFulFillmentStatusAction = (
  request: UpdateFulFillmentStatusRequest,
  setData: (data: OrderResponse) => void,
  setError?: (error: boolean) => void
) => {
  return BaseAction(OrderType.UPDATE_FULFILLMENT_METHOD, {
    request,
    setData,
    setError,
  });
};

export const UpdatePaymentAction = (
  // request: UpdatePaymentRequest,
  request: any,
  order_id: number | null,
  setData: (data: OrderResponse) => void,
  setError?: (error: boolean) => void
) => {
  return BaseAction(OrderType.UPDATE_PAYMENT_METHOD, {
    request,
    order_id,
    setData,
    setError,
  });
};

export const UpdateShipmentAction = (
  request: UpdateLineFulFillment,
  setData: (data: OrderResponse) => void,
  setError?: (error: boolean) => void
) => {
  return BaseAction(OrderType.UPDATE_SHIPPING_METHOD, {
    request,
    setData,
    setError,
  });
};

export const DeliveryServicesGetList = (
  setData: (data: Array<DeliveryServiceResponse>) => void
) => {
  return BaseAction(OrderType.GET_LIST_DELIVERY_SERVICE, { setData });
};

export const getDeliveryMappedStoresAction = (
  id: number,
  handleData: (data: Array<DeliveryMappedStoreType>) => void
) => {
  return {
    type: OrderType.GET_MAPPED_STORES,
    payload: {
      id,
      handleData,
    },
  };
};

export const createDeliveryMappedStoreAction = (
  idDelivery: number,
  shop_id: number,
  store_id: number,
  token: string,
  handleData: (data: any) => void
) => {
  return {
    type: OrderType.CREATE_MAPPED_STORE,
    payload: {
      idDelivery,
      shop_id,
      store_id,
      token,
      handleData,
    },
  };
};

export const deleteDeliveryMappedStoreAction = (
  idDelivery: number,
  shop_id: number,
  store_id: number,
  handleData: (data: any) => void
) => {
  return {
    type: OrderType.DELETE_MAPPED_STORE,
    payload: {
      idDelivery,
      shop_id,
      store_id,
      handleData,
    },
  };
};

export const getDeliveryTransportTypesAction = (
  id: number,
  handleData: (data: Array<DeliveryTransportTypesResponse>) => void
) => {
  return {
    type: OrderType.GET_TRANSPORT_TYPES,
    payload: {
      id,
      handleData,
    },
  };
};

export const updateDeliveryConfigurationAction = (
  params: any,
  handleData: (data: any) => void
) => {
  return {
    type: OrderType.UPDATE_3RD_PL_CONNECT,
    payload: {
      params,
      handleData,
    },
  };
};

export const getListSubStatusAction = (
  status: string,
  handleData: (data: Array<OrderSubStatusResponse>) => void
) => {
  return BaseAction(OrderType.GET_LIST_SUB_STATUS, { status, handleData });
};

export const setSubStatusAction = (
  order_id: number,
  statusId: number,
  handleData: () => void,
  action: string = "Chuyển trạng thái phụ"
) => {
  return {
    type: OrderType.SET_SUB_STATUS,
    payload: {
      order_id,
      statusId,
      action,
      handleData,
    },
  };
};

export const getListOrderAction = (
  query: OrderSearchQuery,
  setData: (data: PageResponse<OrderModel> | false) => void
) => {
  return BaseAction(OrderType.GET_LIST_ORDER_REQUEST, {
    query,
    setData,
  });
};

export const getListOrderActionFpage = (
  query: any,
  setData: (data: PageResponse<OrderModel> | false) => void
) => {
  return BaseAction(OrderType.GET_LIST_ORDER_FPAGE_REQUEST, {
    query,
    setData,
  });
};

export const GetListOrderCustomerAction = (
  query: any,
  setData: (data: PageResponse<OrderModel> | false) => void
) => {
  return BaseAction(OrderType.GET_LIST_ORDER_CUSTOMER_REQUEST, {
    query,
    setData,
  });
};

export const getShipmentsAction = (
  query: ShipmentSearchQuery,
  setData: (data: PageResponse<ShipmentModel> | false) => void
) => {
  return BaseAction(OrderType.GET_SHIPMENTS_REQUEST, {
    query,
    setData,
  });
};

export const getReturnsAction = (
  query: ReturnSearchQuery,
  setData: (data: PageResponse<ReturnModel> | false) => void
) => {
  return BaseAction(OrderType.GET_RETURNS_REQUEST, {
    query,
    setData,
  });
};

export const actionGetOrderActionLogs = (
  id: number,
  handleData: (data: OrderActionLogResponse[]) => void
) => {
  return {
    type: OrderType.GET_ORDER_ACTION_LOGS,
    payload: {
      id,
      handleData,
    },
  };
};

export const actionGetActionLogDetail = (
  id: number,
  handleData: (data: ActionLogDetailResponse) => void
) => {
  return {
    type: OrderType.GET_ACTION_LOG_DETAILS,
    payload: {
      id,
      handleData,
    },
  };
};
export const getListChannelRequest = (
  setData: (data: Array<ChannelResponse>) => void
) => {
  return BaseAction(OrderType.GET_LIST_CHANNEL_REQUEST, { setData });
};

export const getListReasonRequest = (
  setData: (data: Array<{ id: number; name: string }>) => void
) => {
  return BaseAction(OrderType.GET_LIST_REASON_REQUEST, { setData });
};

export const cancelOrderRequest = (
  id: number | undefined,
  onSuccess: (success: any) => void,
  onError: (error: any) => void
) => {
  return BaseAction(OrderType.CANCEL_ORDER_REQUEST, { id, onSuccess, onError });
};

export const configOrderSaga = (setData: (data: OrderConfig) => void) => {
  return BaseAction(OrderType.GET_ORDER_CONFIG, { setData });
};

export const getFulfillments = (code: string, setData: (data: Array<any>) => void) => {
  return BaseAction(OrderType.GET_FULFILLMENTS, { code, setData });
};

export const getFulfillmentsPack = (request: any, setData: (data: any) => void) => {
  return BaseAction(OrderType.GET_FULFILLMENTS_PACK, { request, setData });
};

export const getFulfillmentsPackedSaga = (
  query: any,
  setData: (data: PageResponse<any>) => void
) => {
  return BaseAction(OrderType.GET_FULFILLMENTS_PACKED, {
    query,
    setData,
  });
};

export const confirmDraftOrderAction = (
  orderId: number,
  params: ConfirmDraftOrderRequest,
  handleData: (data: PageResponse<any>) => void
) => {
  return {
    type: OrderType.CONFIRM_DRAFT_ORDER,
    payload: {
      orderId,
      params,
      handleData,
    },
  };
};

export const createShippingOrderAction = (
  params: CreateShippingOrderRequest,
  handleData: (data: PageResponse<any>) => void
) => {
  return {
    type: OrderType.CREATE_SHIPPING_ORDER,
    payload: {
      params,
      handleData,
    },
  };
};
