import {
  OrderResponse,
  ReturnProductModel,
} from "model/response/order/order.response";
import { createContext } from "react";

type CreateOrderReturnContextType = {
  orderDetail: OrderResponse | null;
  return: {
    listReturnProducts: ReturnProductModel[];
    setListReturnProducts: (listReturnProducts: ReturnProductModel[]) => void;
    setTotalAmountReturnProducts: (value: number) => void;
  };
  isExchange: boolean;
  isStepExchange: boolean;
};
// tạo context
export const CreateOrderReturnContext =
  createContext<CreateOrderReturnContextType | null>(null);
