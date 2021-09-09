import BaseAction from "base/base.action";
import { PageResponse } from "model/base/base-metadata.response";
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
  ActionLogDetailResponse,
  OrderActionLogResponse,
} from "model/response/order/action-log.response";
import {
  DeliveryServiceResponse,
  ErrorLogResponse,
  GHNFeeResponse,
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

export const PaymentMethodGetList = (
  setData: (data: Array<PaymentMethodResponse>) => void
) => {
  return BaseAction(OrderType.GET_LIST_PAYMENT_METHOD, { setData });
};

export const OrderDetailAction = (
  id: number,
  setData: (data: OrderResponse) => void
) => {
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
  setData: (data: OrderResponse) => void
) => {
  return BaseAction(OrderType.UPDATE_FULFILLMENT_METHOD, { request, setData });
};

export const UpdatePaymentAction = (
  request: UpdatePaymentRequest,
  order_id: number | null,
  setData: (data: OrderResponse) => void
) => {
  return BaseAction(OrderType.UPDATE_PAYMENT_METHOD, {
    request,
    order_id,
    setData,
  });
};

export const UpdateShipmentAction = (
  request: UpdateLineFulFillment,
  setData: (data: OrderResponse) => void
) => {
  return BaseAction(OrderType.UPDATE_SHIPPING_METHOD, { request, setData });
};

export const DeliveryServicesGetList = (
  setData: (data: Array<DeliveryServiceResponse>) => void
) => {
  return BaseAction(OrderType.GET_LIST_DELIVERY_SERVICE, { setData });
};

export const getListSubStatusAction = (
  status: string,
  handleData: (data: Array<OrderSubStatusResponse>) => void
) => {
  return BaseAction(OrderType.GET_LIST_SUB_STATUS, { status, handleData });
};

export const setSubStatusAction = (order_id: number, statusId: number) => {
  return BaseAction(OrderType.SET_SUB_STATUS, { order_id, statusId });
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
  setData: (data: PageResponse<OrderModel>|false) => void
) => {
  return BaseAction(OrderType.GET_LIST_ORDER_REQUEST, {
    query,
    setData,
  });
};

export const GetListOrderCustomerAction = (
  query: any,
  setData: (data: PageResponse<OrderModel>|false) => void
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
export const getListChannelRequest = (setData: (data: Array<ChannelResponse>) => void) => {
  return BaseAction(OrderType.GET_LIST_CHANNEL_REQUEST, {setData});
}
