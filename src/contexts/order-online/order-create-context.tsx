import { FormInstance } from "antd";
import { OrderPaymentRequest } from "model/request/order.request";
import { ShippingAddress } from "model/response/order/order.response";
import {
  OrderConfigResponseModel,
  ShippingServiceConfigDetailResponseModel,
} from "model/response/settings/order-settings.response";
import { createContext } from "react";

type OrderCreateContextType = {
  store: {
    storeId: number | null;
    setStoreId: (value: number) => void | null;
  };
  form: FormInstance<any>;
  shipping: {
    shippingServiceConfig: ShippingServiceConfigDetailResponseModel[];
    shippingAddress: ShippingAddress | null;
    shippingFeeInformedToCustomer: number | null;
    setShippingFeeInformedToCustomer: (value: number) => void | null;
  };
  order: {
    orderAmount: number;
  };
  price: {
    orderAmount: number;
    payments: OrderPaymentRequest[];
    totalAmountPayment: number;
    fee: number | null;
    shippingFeeInformedToCustomer: number | null;
    totalAmountCustomerNeedToPay: number;
  };
  orderConfig: OrderConfigResponseModel | null;
};
// tạo context
export const OrderCreateContext = createContext<OrderCreateContextType | null>(null);
