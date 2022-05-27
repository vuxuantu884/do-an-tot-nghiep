import { OrderPaymentRequest } from "model/request/order.request";
import { OrderPaymentResponse, OrderResponse } from "model/response/order/order.response";
import { PaymentMethodResponse } from "model/response/order/paymentmethod.response";
import { sortFulfillments } from "./AppUtils";
import { PaymentMethodCode } from "./Constants";
import { FulfillmentCancelStatus } from "./Order.constants";

export const isOrderDetailHasPointPayment = (
  OrderDetail: OrderResponse | null | undefined,
  paymentMethods: PaymentMethodResponse[],
) => {
  const pointPaymentMethodId = paymentMethods.find(
    (payment) => payment.code === PaymentMethodCode.POINT,
  )?.code;
  if (!pointPaymentMethodId) {
    return false;
  }
  if (!OrderDetail?.payments) {
    return false;
  }
  return OrderDetail?.payments?.some((single) => {
    return single.payment_method_code === pointPaymentMethodId;
  });
};

export const findPaymentMethodByCode = (
  paymentMethods: PaymentMethodResponse[],
  code: string,
) => {
  return paymentMethods.find((single) => single.code === code);
};

export const checkIfOrderHasNoPayment = (OrderDetail: OrderResponse | null) => {
  if (!OrderDetail?.payments || OrderDetail.payments.length === 0) {
    return true;
  }
  return false;
};

export const getOrderAmountPayment = (
  items: Array<OrderPaymentResponse | OrderPaymentRequest> | null | undefined,
) => {
  let value = 0;
  if (items) {
    if (items.length > 0) {
      items.forEach((a) => (value = value + a.amount));
    }
  }
  return value;
};

export const checkIfOrderHasPaidAllMoneyAmount = (
  OrderDetail: OrderResponse | null,
) => {
  const amountPayment = getOrderAmountPayment(OrderDetail?.payments);
  if (amountPayment >= (OrderDetail?.total || 0)) {
    return true;
  }
  return false;
};

export const checkIfOrderHasShipmentCod = (
  OrderDetail: OrderResponse | null,
) => {
  const sortedFulfillments = sortFulfillments(OrderDetail?.fulfillments);
  return sortedFulfillments[0].shipment?.cod;
};

export const checkIfOrderCancelled = (
  OrderDetail: OrderResponse | null,
) => {
  const sortedFulfillments = sortFulfillments(OrderDetail?.fulfillments);
  if(!sortedFulfillments[0].status) {
    return false
  }
  return FulfillmentCancelStatus.includes(sortedFulfillments[0].status);
};