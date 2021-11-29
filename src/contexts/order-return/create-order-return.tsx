import {
  OrderLineItemResponse,
  OrderResponse,
  ReturnProductModel,
} from "model/response/order/order.response";
import { createContext } from "react";

type CreateOrderReturnContextType = {
  orderDetail: OrderResponse | null;
  return: {
    listItemCanBeReturn:  OrderLineItemResponse[];
    listReturnProducts: ReturnProductModel[];
    setListReturnProducts: (listReturnProducts: ReturnProductModel[]) => void;
    setTotalAmountReturnProducts: (value: number) => void;
    moneyRefund: number;
    setMoneyRefund: (value: number) => void;
    totalAmountReturnProducts: number;
    totalAmountExchange: number;
    totalAmountCustomerNeedToPay: number;
  };
  isExchange: boolean;
  isStepExchange: boolean;
};
// tạo context
export const CreateOrderReturnContext =
  createContext<CreateOrderReturnContextType | null>(null);
