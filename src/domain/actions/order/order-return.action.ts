import { ORDER_RETURN_TYPES } from "domain/types/order-return";
import { OrderType } from "domain/types/order.type";
import { OrderRequest } from "model/request/order.request";
import { OrderReturnReasonModel } from "model/response/order/order.response";

export const actionGetOrderReturnDetails = (
  id: number,
  handleData: (data: any) => void
) => {
  return {
    type: OrderType.return.GET_RETURN_DETAIL,
    payload: {
      id,
      handleData,
    },
  };
};

export const actionCreateOrderReturn = (
  params: OrderRequest,
  handleData: (data: any) => void
) => {
  return {
    type: OrderType.CREATE_RETURN,
    payload: {
      params,
      handleData,
    },
  };
};

export const actionSetIsReceivedOrderReturn = (
  id: number,
  handleData: (data: any) => void
) => {
  return {
    type: ORDER_RETURN_TYPES.SET_IS_RECEIVED_PRODUCT,
    payload: {
      id,
      handleData,
    },
  };
};

export const actionGetOrderReturnReasons = (
  handleData: (data: OrderReturnReasonModel[]) => void
) => {
  return {
    type: ORDER_RETURN_TYPES.GET_LIST_RETURN_REASON,
    payload: {
      handleData,
    },
  };
};
