import { StoreResponse } from "model/core/store.model";
import { RefundModel } from "model/order/return.model";
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
    listItemCanBeReturn: OrderLineItemResponse[];
    listOrderProductsResult: OrderLineItemResponse[];
    listReturnProducts: ReturnProductModel[];
    setListReturnProducts: (listReturnProducts: ReturnProductModel[]) => void;
    setTotalAmountReturnProducts: (value: number) => void;
    refund: RefundModel;
    setRefund: (value: RefundModel) => void;
    totalAmountReturnProducts: number;
    totalAmountExchange: number;
    totalAmountCustomerNeedToPay: number;
    setReturnStore: (item: StoreResponse | null) => void;
    returnStore: StoreResponse | null;
    listExchangeProducts: OrderLineItemRequest[];
  };
  isExchange: boolean;
  returnStores: StoreResponse[];
};
// tạo context
export const CreateOrderReturnContext = createContext<CreateOrderReturnContextType | null>(null);
