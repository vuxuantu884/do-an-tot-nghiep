import { StoreResponse } from "model/core/store.model";
import { OrderLineItemRequest } from "model/request/order.request";
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
    listOrderProductsResult:  OrderLineItemResponse[];
    listReturnProducts: ReturnProductModel[];
    setListReturnProducts: (listReturnProducts: ReturnProductModel[]) => void;
    setTotalAmountReturnProducts: (value: number) => void;
    moneyRefund: number;
    setMoneyRefund: (value: number) => void;
    totalAmountReturnProducts: number;
    totalAmountExchange: number;
    totalAmountCustomerNeedToPay: number;
    setStoreReturn:(item:StoreResponse|null)=>void;
    storeReturn:StoreResponse|null;
		listExchangeProducts: OrderLineItemRequest[];
  };
  isExchange: boolean;
  isStepExchange: boolean;
  listStoreReturn:StoreResponse[];
};
// tạo context
export const CreateOrderReturnContext =
  createContext<CreateOrderReturnContextType | null>(null);
