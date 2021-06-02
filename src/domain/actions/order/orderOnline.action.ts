import { OrderType } from '../../types/order.type';
import BaseAction from 'base/BaseAction';
import { SourceModel } from 'model/other/SourceModel';

const getListSourceRequest = (setData: (data: Array<SourceModel>) => void) => {
  return BaseAction(OrderType.GET_LIST_SOURCE_REQUEST, {setData});
}

const getListSourceSuccess = (data: Array<SourceModel>) => {
  return BaseAction(OrderType.GET_LIST_SOURCE_RESPONSE, { data });
}

const getListSourceError = () => {
  return BaseAction(OrderType.GET_LIST_SOURCE_ERROR, null);
}

export { getListSourceRequest, getListSourceSuccess, getListSourceError};