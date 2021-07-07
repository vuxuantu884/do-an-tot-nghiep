import { OrderResponse } from 'model/response/order/order.response';
import { PaymentMethodResponse } from 'model/response/order/paymentmethod.response';
import { OrderRequest, UpdateFulFillmentStatusRequest, UpdateOrderPaymentRequest, UpdatePaymentRequest, UpdateShipmentRequest } from 'model/request/order.request';
import { OrderType } from '../../types/order.type';
import BaseAction from 'base/BaseAction';

export const orderCreateAction = (request: OrderRequest, setData: (data: OrderResponse) => void) => {
  return BaseAction(OrderType.CREATE_ORDER_REQUEST, {request, setData});
}

export const PaymentMethodGetList = (setData: (data: Array<PaymentMethodResponse>) => void) => {
  return BaseAction(OrderType.GET_LIST_PAYMENT_METHOD, { setData });
}

export const OrderDetailAction = (id: string, setData: (data: OrderResponse) => void) => {
  return BaseAction(OrderType.GET_ORDER_DETAIL_REQUEST, {id, setData});
}

export const UpdateFulFillmentStatusAction = (request : UpdateFulFillmentStatusRequest, setData: (data: OrderResponse) => void) => {
  return BaseAction(OrderType.UPDATE_FULFILLMENT_METHOD, {request, setData});
}

export const UpdatePaymentAction = (request : UpdatePaymentRequest, order_id: string | null, setData: (data: OrderResponse) => void) => {
  return BaseAction(OrderType.UPDATE_PAYMENT_METHOD, {request, order_id, setData});
}

export const UpdateShipmentAction = (request : UpdateShipmentRequest, setData: (data: OrderResponse) => void) => {
  return BaseAction(OrderType.UPDATE_SHIPPING_METHOD, {request, setData});
}