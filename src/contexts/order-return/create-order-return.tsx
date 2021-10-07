import {
  OrderResponse,
  ReturnProductModel,
} from "model/response/order/order.response";
import { createContext } from "react";

type CreateOrderReturnContextType = {
  orderDetail: OrderResponse | null;
  listReturnProducts: ReturnProductModel[];
};
// tạo context
export const CreateOrderReturnContext =
  createContext<CreateOrderReturnContextType | null>(null);
