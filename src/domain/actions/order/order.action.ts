import { OrderRequest } from 'model/request/order.request';
import { OrderType } from '../../types/order.type';
import BaseAction from 'base/BaseAction';

export const orderCreateAction = (request: OrderRequest, setData: () => void) => {
  return BaseAction(OrderType.CREATE_ORDER_REQUEST, {request, setData});
}