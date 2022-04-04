import { SourceResponse } from 'model/response/order/source.response';
import { OrderType } from '../../types/order.type';
import BaseAction from 'base/base.action';

const getListSourceRequest = (setData: (data: Array<SourceResponse>) => void) => {
  return BaseAction(OrderType.GET_LIST_SOURCE_REQUEST, {setData});
}

const getListAllSourceRequest = (setData: (data: Array<SourceResponse>) => void) => {
  return BaseAction(OrderType.GET_LIST_ALL_SOURCE_REQUEST, {setData});
}

const getListSourceSuccess = (data: Array<SourceResponse>) => {
  return BaseAction(OrderType.GET_LIST_SOURCE_RESPONSE, { data });
}

const getListSourceError = () => {
  return BaseAction(OrderType.GET_LIST_SOURCE_ERROR, null);
}

export { getListSourceRequest, getListSourceSuccess, getListSourceError, getListAllSourceRequest};
