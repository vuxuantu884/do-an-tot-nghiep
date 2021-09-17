import { OrderType } from "domain/types/order.type";
import { OrderRequest } from "model/request/order.request";

export const actionGetOrderReturn = (
  id: number,
  handleData: (data: any) => void
) => {
  return {
    type: OrderType.GET_RETURN,
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
