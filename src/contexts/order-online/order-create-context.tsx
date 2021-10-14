import { FormInstance } from "antd";
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
  orderConfig: OrderConfigResponseModel | null;
};
// tạo context
export const OrderCreateContext = createContext<OrderCreateContextType | null>(
  null
);
