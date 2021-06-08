import { OrderRequest } from 'model/request/order.request';
import { OrderType } from '../../types/order.type';
import BaseAction from 'base/BaseAction';

export const orderDiscountTextChange = (indexItem: number, value: number, type: string) => {
  return BaseAction(OrderType.ORDER_DISCOUNT_TEXT_CHANGE, { indexItem: indexItem, value: value, type: type })
}

export const orderCreateAction = (request: OrderRequest, setData: () => void) => {
  return BaseAction(OrderType.CREATE_ORDER_REQUEST, {request, setData});
}