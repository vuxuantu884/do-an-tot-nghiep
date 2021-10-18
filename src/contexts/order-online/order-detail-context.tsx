import { OrderPaymentRequest } from "model/request/order.request";
import { OrderResponse } from "model/response/order/order.response";
import { createContext } from "react";

type OrderDetailContextType = {
  orderDetail: OrderResponse | null;
  price: {
    fee: number | null;
    totalOrderAmount: number;
    setFee: (value: number) => void;
    setTotalOrderAmount: (value: number) => void;
  };
  fulfillment: {
    hvc: number | null;
    fee: number | null;
    serviceType: string | undefined;
    shippingFeeInformedToCustomer: number | null;
    setHvc: (value: number) => void;
    setFee: (value: number) => void;
    setServiceType: (value: string | undefined) => void;
    setShippingFeeInformedToCustomer: (value: number | null) => void;
  };
  payment: {
    payments: OrderPaymentRequest[];
    setPayments: (payments: OrderPaymentRequest[]) => void;
  };
};
// tạo context
export const OrderDetailContext = createContext<OrderDetailContextType>({
  orderDetail: null,
  price: {
    fee: 0,
    totalOrderAmount: 0,
    setFee: (value: number) => {},
    setTotalOrderAmount: (value: number) => {},
  },
  fulfillment: {
    hvc: null,
    fee: 0,
    serviceType: undefined,
    shippingFeeInformedToCustomer: 0,
    setHvc: (value: number) => {},
    setFee: (value: number) => {},
    setServiceType: (value: string | undefined) => {},
    setShippingFeeInformedToCustomer: (value: number | null) => {},
  },
  payment: {
    payments: [],
    setPayments: (payments: OrderPaymentRequest[]) => {},
  },
});
