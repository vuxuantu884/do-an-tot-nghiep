import { ORDER_RETURN_TYPES } from "domain/types/order-return";
import { OrderType } from "domain/types/order.type";
import { ExchangeRequest, OrderRequest, OrderReturnCalculateRefundRequestModel } from "model/request/order.request";
import { LoyalTyCalCulateRefund } from "model/response/loyalty/loyalty-points.response";
import { OrderActionLogResponse } from "model/response/order/action-log.response";
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

export const actionOrderRefund = (
  id: number,
  params: {
    payments: any;
  },
  handleData: (data: any) => void
) => {
  return {
    type: ORDER_RETURN_TYPES.REFUND,
    payload: {
      id,
      params,
      handleData,
    },
  };
};

export const actionCreateOrderExchange = (
  params: ExchangeRequest,
  handleData: (data: any) => void,
  handleError: (error: any) => void
) => {
  return {
    type: ORDER_RETURN_TYPES.CREATE_ORDER_EXCHANGE,
    payload: {
      params,
      handleData,
      handleError,
    },
  };
};

export const actionGetOrderReturnLog = (
  id: number,
  handleData: (data: OrderActionLogResponse[]) => void
) => {
  return {
    type: ORDER_RETURN_TYPES.GET_ORDER_RETURN_LOGS,
    payload: {
      id,
      handleData,
    },
  };
};

export const actionGetOrderReturnCalculateRefund = (
  params: OrderReturnCalculateRefundRequestModel,
  handleData: (data: LoyalTyCalCulateRefund) => void
) => {
  return {
    type: ORDER_RETURN_TYPES.GET_ORDER_RETURN_CALCULATE_REFUND,
    payload: {
      params,
      handleData,
    },
  };
};
