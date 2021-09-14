import { OrderType } from "domain/types/order.type";
import { OrderRequest } from "model/request/order.request";

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
