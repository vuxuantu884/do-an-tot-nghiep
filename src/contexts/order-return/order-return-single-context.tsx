import { OrderResponse } from "model/response/order/order.response";
import { createContext } from "react";

type OrderReturnSingleContextType = {
  orderDetail: OrderResponse | null;
};
// tạo context
export const OrderReturnSingleContext = createContext<OrderReturnSingleContextType | null>(null);
