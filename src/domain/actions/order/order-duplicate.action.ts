import { OrderModel } from 'model/order/order.model';
import { OrderSearchQuery } from 'model/order/order.model';
import {CustomerDuplicateModel} from "./../../../model/order/duplicate.model";

import BaseAction from "base/base.action";
import {PageResponse} from "./../../../model/base/base-metadata.response";
import {DuplicateOrderSearchQuery} from "./../../../model/order/order.model";
import {OrderType} from "domain/types/order.type";

export const getOrderDuplicateAction = (
  param: DuplicateOrderSearchQuery,
  setData: (data: PageResponse<CustomerDuplicateModel>) => void
) => {
  return BaseAction(OrderType.GET_ORDER_DUPLICATE_LIST, {param, setData});
};

export const putOrderDuplicateMerge = (
  origin_id: number,
  ids: number[],
  setData: (data: any) => void
) => {
  return BaseAction(OrderType.PUT_ORDER_DUPLICATE_MERGE, {origin_id, ids, setData});
};

export const putOrderDuplicateCancel = (ids: number[], setData: (data: any) => void) => {
  return BaseAction(OrderType.PUT_ORDER_DUPLICATE_CANCEL, {ids, setData});
};

export const getDetailOrderDuplicateAction = (
  query: OrderSearchQuery,
  setData: (data: PageResponse<OrderModel> | false) => void
) => {
  return BaseAction(OrderType.GET_DETAIL_ORDER_DUPLICATE, {
    query,
    setData,
  });
};