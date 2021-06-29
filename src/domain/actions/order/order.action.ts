import { OrderResponse } from 'model/response/order/order.response';
import { PaymentMethodResponse } from 'model/response/order/paymentmethod.response';
import { OrderRequest } from 'model/request/order.request';
import { OrderType } from '../../types/order.type';
import BaseAction from 'base/BaseAction';

export const orderCreateAction = (request: OrderRequest, setData: () => void) => {
  return BaseAction(OrderType.CREATE_ORDER_REQUEST, {request, setData});
}

export const PaymentMethodGetList = (setData: (data: Array<PaymentMethodResponse>) => void) => {
  return BaseAction(OrderType.GET_LIST_PAYMENT_METHOD, { setData });
}


export const OrderDetailAction = (id: number, setData: (data: OrderResponse) => void) => {
  return BaseAction(OrderType.GET_ORDER_DETAIL_REQUEST, {id, setData});
}