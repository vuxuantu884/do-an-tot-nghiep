import { ShippingAddress } from "model/response/order/order.response";
import { ShippingServiceConfigDetailResponseModel } from "model/response/settings/order-settings.response";
import { createContext } from "react";

type OrderCreateContextType = {
  store: {
    storeId: number | null;
    setStoreId: (value: number) => void | null;
  };
  shipping: {
    shippingServiceConfig: ShippingServiceConfigDetailResponseModel[];
    shippingAddress: ShippingAddress | null;
    shippingFeeInformedToCustomer: number | null;
    setShippingFeeInformedToCustomer: (value: number) => void | null;
  };
};
// tạo context
export const OrderCreateContext = createContext<OrderCreateContextType | null>(
  null
);
